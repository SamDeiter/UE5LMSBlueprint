/**
 * AssessmentController.js - Quiz/Assessment Mode for Blueprint Education
 * Manages loading scenarios, tracking student answers, and scoring
 */
import {
  TEST_SCENARIOS,
  getScenario,
  getScenariosByDifficulty,
} from "../data/assessment/TestScenarios.js";
import { graphAnalyzer, IssueSeverity } from "../core/GraphAnalyzer.js";
import { EventBus } from "../core/EventBus.js";

/**
 * Assessment modes
 */
export const AssessmentMode = {
  PRACTICE: "practice", // Hints enabled, unlimited attempts
  QUIZ: "quiz", // Limited attempts, timed
  EXAM: "exam", // No hints, single attempt, timed
};

/**
 * Assessment state
 */
class AssessmentState {
  constructor() {
    this.currentScenario = null;
    this.mode = AssessmentMode.PRACTICE;
    this.startTime = null;
    this.attempts = 0;
    this.maxAttempts = 3;
    this.timeLimit = null; // null = unlimited
    this.studentAnswers = [];
    this.isComplete = false;
    this.score = 0;
    this.feedback = null;
  }

  reset() {
    this.currentScenario = null;
    this.startTime = null;
    this.attempts = 0;
    this.studentAnswers = [];
    this.isComplete = false;
    this.score = 0;
    this.feedback = null;
  }
}

/**
 * AssessmentController - Main controller for quiz/assessment mode
 */
export class AssessmentController {
  constructor(app) {
    this.app = app;
    this.state = new AssessmentState();
    this.ui = null;
    this._initialize();
  }

  _initialize() {
    this._createUI();
    this._bindEvents();
  }

  /**
   * Create the Assessment UI panel
   */
  _createUI() {
    // Create assessment panel container
    this.ui = {
      panel: document.createElement("div"),
      header: document.createElement("div"),
      content: document.createElement("div"),
      controls: document.createElement("div"),
      scenarioList: document.createElement("div"),
      feedback: document.createElement("div"),
    };

    this.ui.panel.id = "assessment-panel";
    this.ui.panel.className = "assessment-panel hidden";

    this.ui.header.className = "assessment-header";
    this.ui.header.innerHTML = `
            <span class="assessment-title">📝 Assessment Mode</span>
            <button class="btn-close-assessment" title="Exit Assessment">×</button>
        `;

    this.ui.content.className = "assessment-content";
    this.ui.controls.className = "assessment-controls";
    this.ui.scenarioList.className = "scenario-list";
    this.ui.feedback.className = "assessment-feedback hidden";

    this.ui.content.appendChild(this.ui.scenarioList);
    this.ui.content.appendChild(this.ui.feedback);

    this.ui.panel.appendChild(this.ui.header);
    this.ui.panel.appendChild(this.ui.content);
    this.ui.panel.appendChild(this.ui.controls);

    document.body.appendChild(this.ui.panel);

    // Add styles
    this._injectStyles();
  }

  _bindEvents() {
    // Close button
    this.ui.header
      .querySelector(".btn-close-assessment")
      .addEventListener("click", () => {
        this.close();
      });

    // Listen for graph analysis events
    EventBus.on("graph:analyzed", (data) => {
      if (this.state.currentScenario && !this.state.isComplete) {
        this._onGraphAnalyzed(data.result);
      }
    });
  }

  /**
   * Open the assessment panel
   */
  open() {
    this.ui.panel.classList.remove("hidden");
    this._renderScenarioList();
    EventBus.emit("assessment:opened");
  }

  /**
   * Close the assessment panel
   */
  close() {
    this.ui.panel.classList.add("hidden");
    this.state.reset();
    EventBus.emit("assessment:closed");
  }

  /**
   * Render the list of available scenarios
   */
  _renderScenarioList() {
    const difficulties = ["Beginner", "Intermediate", "Advanced"];

    let html = "<h3>Select a Challenge</h3>";

    difficulties.forEach((diff) => {
      const scenarios = getScenariosByDifficulty(diff);
      if (scenarios.length === 0) return;

      html += `<div class="difficulty-section">
                <h4>${diff}</h4>
                <div class="scenario-cards">`;

      scenarios.forEach((scenario) => {
        html += `
                    <div class="scenario-card" data-scenario="${scenario.name}">
                        <div class="scenario-name">${scenario.name}</div>
                        <div class="scenario-desc">${scenario.description}</div>
                        <div class="scenario-issues">
                            Issues to find: ${scenario.expectedIssues.length}
                        </div>
                    </div>
                `;
      });

      html += "</div></div>";
    });

    this.ui.scenarioList.innerHTML = html;
    this.ui.scenarioList.classList.remove("hidden");
    this.ui.feedback.classList.add("hidden");

    // Bind click events
    this.ui.scenarioList.querySelectorAll(".scenario-card").forEach((card) => {
      card.addEventListener("click", () => {
        const name = card.dataset.scenario;
        this.loadScenario(name);
      });
    });
  }

  /**
   * Load a scenario into the graph editor
   */
  loadScenario(name) {
    const scenario = getScenario(name);
    if (!scenario) {
      console.error("Scenario not found:", name);
      return;
    }

    this.state.reset();
    this.state.currentScenario = scenario;
    this.state.startTime = Date.now();

    // Clear current graph
    this.app.graph.clear();

    // Load scenario nodes
    scenario.nodes.forEach((nodeData) => {
      const node = this.app.graph.createNodeFromData(nodeData);
      if (node && node.element) {
        node.element.style.left = `${nodeData.x}px`;
        node.element.style.top = `${nodeData.y}px`;
      }
    });

    // Load scenario links
    scenario.links.forEach((linkData) => {
      const startPin = this._findPin(linkData.startPinId);
      const endPin = this._findPin(linkData.endPinId);
      if (startPin && endPin) {
        this.app.wiring.createLink(startPin, endPin);
      }
    });

    // Update UI
    this._renderActiveChallenge();

    EventBus.emit("assessment:scenarioLoaded", { scenario });
  }

  _findPin(pinId) {
    // Search through all nodes for the pin
    for (const node of this.app.graph.nodes.values()) {
      if (node.pins) {
        const pin = node.pins.find((p) => p.id === pinId);
        if (pin) return pin;
      }
    }
    return null;
  }

  /**
   * Render the active challenge UI
   */
  _renderActiveChallenge() {
    const scenario = this.state.currentScenario;
    if (!scenario) return;

    this.ui.scenarioList.classList.add("hidden");
    this.ui.feedback.classList.remove("hidden");

    this.ui.feedback.innerHTML = `
            <div class="challenge-header">
                <h3>🎯 ${scenario.name}</h3>
                <span class="difficulty-badge ${scenario.difficulty.toLowerCase()}">${
      scenario.difficulty
    }</span>
            </div>
            <p class="challenge-desc">${scenario.description}</p>
            <div class="challenge-stats">
                <span>🔍 Find ${scenario.expectedIssues.length} issue(s)</span>
                <span>⏱️ Time: <span id="timer">0:00</span></span>
                <span>🎯 Attempts: ${this.state.attempts}/${
      this.state.maxAttempts
    }</span>
            </div>
            <div class="challenge-hint hidden" id="hint-box">
                <strong>💡 Hint:</strong> <span id="hint-text"></span>
            </div>
            <div class="challenge-actions">
                <button class="btn-submit-answer" id="btn-submit">Submit Answer</button>
                <button class="btn-show-hint" id="btn-hint">Show Hint</button>
                <button class="btn-back" id="btn-back">Back to List</button>
            </div>
            <div class="result-area hidden" id="result-area"></div>
        `;

    // Bind buttons
    this.ui.feedback
      .querySelector("#btn-submit")
      .addEventListener("click", () => {
        this.submitAnswer();
      });

    this.ui.feedback
      .querySelector("#btn-hint")
      .addEventListener("click", () => {
        this._showHint();
      });

    this.ui.feedback
      .querySelector("#btn-back")
      .addEventListener("click", () => {
        this._renderScenarioList();
      });

    // Start timer
    this._startTimer();

    // Update controls
    this.ui.controls.innerHTML = `
            <div class="assessment-instructions">
                <strong>Instructions:</strong> Examine the Blueprint graph.
                Click <strong>Compile</strong> (or press F7) to analyze it for issues.
                Then click <strong>Submit Answer</strong> to see if you found all the problems!
            </div>
        `;
  }

  _startTimer() {
    if (this._timerInterval) clearInterval(this._timerInterval);

    this._timerInterval = setInterval(() => {
      if (this.state.startTime && !this.state.isComplete) {
        const elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const timerEl = document.getElementById("timer");
        if (timerEl) {
          timerEl.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
        }
      }
    }, 1000);
  }

  _showHint() {
    const scenario = this.state.currentScenario;
    if (!scenario) return;

    const hintBox = document.getElementById("hint-box");
    const hintText = document.getElementById("hint-text");

    if (hintBox && hintText) {
      // Generate hint based on expected issues
      const hints = {
        "Potential Null Reference":
          "Look for nodes that return object references. What happens if that object doesn't exist?",
        "Unhandled Cast Failure":
          "Check the Cast node. What happens if the cast fails?",
        "Expensive Operation in Tick":
          "Event Tick runs every frame. Some operations are too costly to run that often.",
        "Server Authority Required":
          "In multiplayer, who should be modifying game state - the client or the server?",
        "Orphaned Node":
          "Follow the execution flow from the Event. Is every node reachable?",
      };

      const expectedIssue = scenario.expectedIssues[0];
      hintText.textContent =
        hints[expectedIssue] ||
        "Look carefully at the execution flow and data connections.";
      hintBox.classList.remove("hidden");
    }
  }

  /**
   * Handle graph analysis results
   */
  _onGraphAnalyzed(result) {
    // Store the latest analysis
    this.state.lastAnalysis = result;
  }

  /**
   * Submit the student's answer for grading
   */
  submitAnswer() {
    const scenario = this.state.currentScenario;
    if (!scenario) return;

    this.state.attempts++;

    // Run analyzer on current graph
    const graphData = {
      nodes: [...this.app.graph.nodes.values()].map((n) => ({
        id: n.id,
        nodeKey: n.nodeKey,
        title: n.title,
        type: n.type,
        pins:
          n.pins?.map((p) => ({
            id: p.id,
            name: p.name,
            localId: p.localId,
            type: p.type,
            dir: p.dir,
          })) || [],
      })),
      links: [...this.app.wiring.links.values()].map((l) => ({
        id: l.id,
        startPinId: l.startPin?.id,
        endPinId: l.endPin?.id,
      })),
    };

    const result = graphAnalyzer.analyze(graphData);
    const detectedIssues = result.issues.map((i) => i.title);

    // Check if student found all expected issues
    const foundIssues = scenario.expectedIssues.filter((expected) =>
      detectedIssues.includes(expected)
    );

    const score = Math.round(
      (foundIssues.length / scenario.expectedIssues.length) * 100
    );
    this.state.score = score;

    this._showResult(score, foundIssues, scenario.expectedIssues, result);
  }

  /**
   * Display the grading result
   */
  _showResult(score, foundIssues, expectedIssues, analysis) {
    const resultArea = document.getElementById("result-area");
    if (!resultArea) return;

    resultArea.classList.remove("hidden");

    const isPassing = score >= 70;
    const elapsed = Math.floor((Date.now() - this.state.startTime) / 1000);

    let html = `
            <div class="result ${isPassing ? "pass" : "fail"}">
                <div class="result-score">
                    ${isPassing ? "✅" : "❌"} Score: ${score}%
                </div>
                <div class="result-time">Completed in ${Math.floor(
                  elapsed / 60
                )}:${(elapsed % 60).toString().padStart(2, "0")}</div>
            </div>
            <div class="result-breakdown">
                <h4>Issues Found:</h4>
                <ul>
        `;

    expectedIssues.forEach((issue) => {
      const found = foundIssues.includes(issue);
      html += `<li class="${found ? "found" : "missed"}">
                ${found ? "✅" : "❌"} ${issue}
            </li>`;
    });

    html += `</ul></div>`;

    if (!isPassing && this.state.attempts < this.state.maxAttempts) {
      html += `<p class="try-again">You have ${
        this.state.maxAttempts - this.state.attempts
      } attempt(s) remaining. Try again!</p>`;
    } else if (isPassing) {
      html += `<p class="congrats">🎉 Congratulations! You successfully identified the Blueprint pitfalls!</p>`;
      this.state.isComplete = true;
    } else {
      html += `<div class="solution">
                <h4>Solution:</h4>
                <p>The issues in this scenario were:</p>
                <ul>
                    ${expectedIssues.map((i) => `<li>${i}</li>`).join("")}
                </ul>
            </div>`;
      this.state.isComplete = true;
    }

    resultArea.innerHTML = html;
  }

  /**
   * Inject CSS styles for the assessment UI
   */
  _injectStyles() {
    if (document.getElementById("assessment-styles")) return;

    const style = document.createElement("style");
    style.id = "assessment-styles";
    style.textContent = `
            .assessment-panel {
                position: fixed;
                right: 0;
                top: 0;
                width: 380px;
                height: 100vh;
                background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
                border-left: 1px solid #333;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                box-shadow: -5px 0 20px rgba(0,0,0,0.5);
                font-family: 'Segoe UI', sans-serif;
            }

            .assessment-panel.hidden { display: none; }

            .assessment-header {
                padding: 12px 16px;
                background: linear-gradient(90deg, #0f3460 0%, #1a5276 100%);
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #444;
            }

            .assessment-title {
                font-size: 16px;
                font-weight: 600;
                color: #fff;
            }

            .btn-close-assessment {
                background: transparent;
                border: none;
                color: #aaa;
                font-size: 20px;
                cursor: pointer;
            }
            .btn-close-assessment:hover { color: #fff; }

            .assessment-content {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
            }

            .scenario-list h3 {
                color: #fff;
                margin: 0 0 16px 0;
                font-size: 14px;
            }

            .difficulty-section { margin-bottom: 20px; }
            .difficulty-section h4 {
                color: #88c8ff;
                font-size: 12px;
                text-transform: uppercase;
                margin: 0 0 8px 0;
            }

            .scenario-card {
                background: rgba(255,255,255,0.05);
                border: 1px solid #333;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .scenario-card:hover {
                background: rgba(255,255,255,0.1);
                border-color: #4a90d9;
                transform: translateX(-3px);
            }

            .scenario-name {
                font-weight: 600;
                color: #fff;
                margin-bottom: 6px;
            }

            .scenario-desc {
                font-size: 12px;
                color: #aaa;
                margin-bottom: 6px;
            }

            .scenario-issues {
                font-size: 11px;
                color: #ffaa00;
            }

            .challenge-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }

            .challenge-header h3 {
                color: #fff;
                margin: 0;
                font-size: 16px;
            }

            .difficulty-badge {
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 10px;
                text-transform: uppercase;
            }
            .difficulty-badge.beginner { background: #27ae60; color: #fff; }
            .difficulty-badge.intermediate { background: #f39c12; color: #000; }
            .difficulty-badge.advanced { background: #e74c3c; color: #fff; }

            .challenge-desc {
                color: #ccc;
                font-size: 13px;
                margin-bottom: 16px;
            }

            .challenge-stats {
                display: flex;
                gap: 16px;
                font-size: 12px;
                color: #888;
                margin-bottom: 16px;
            }

            .challenge-hint {
                background: rgba(241, 196, 15, 0.1);
                border: 1px solid #f1c40f;
                border-radius: 6px;
                padding: 10px;
                margin-bottom: 16px;
                font-size: 12px;
                color: #f1c40f;
            }
            .challenge-hint.hidden { display: none; }

            .challenge-actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .challenge-actions button {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
            }

            .btn-submit-answer {
                background: linear-gradient(180deg, #27ae60 0%, #1e8449 100%);
                color: #fff;
            }
            .btn-submit-answer:hover { background: #2ecc71; }

            .btn-show-hint {
                background: rgba(241, 196, 15, 0.2);
                color: #f1c40f;
                border: 1px solid #f1c40f !important;
            }

            .btn-back {
                background: rgba(255,255,255,0.1);
                color: #aaa;
            }

            .result-area { margin-top: 20px; }
            .result-area.hidden { display: none; }

            .result {
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 16px;
                text-align: center;
            }
            .result.pass { background: rgba(39, 174, 96, 0.2); border: 1px solid #27ae60; }
            .result.fail { background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; }

            .result-score {
                font-size: 24px;
                font-weight: bold;
                color: #fff;
            }

            .result-time {
                font-size: 12px;
                color: #888;
                margin-top: 4px;
            }

            .result-breakdown {
                background: rgba(0,0,0,0.2);
                border-radius: 6px;
                padding: 12px;
            }

            .result-breakdown h4 {
                color: #fff;
                margin: 0 0 10px 0;
                font-size: 13px;
            }

            .result-breakdown ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .result-breakdown li {
                padding: 6px 0;
                font-size: 12px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
            }
            .result-breakdown li.found { color: #27ae60; }
            .result-breakdown li.missed { color: #e74c3c; }

            .try-again, .congrats {
                text-align: center;
                padding: 16px;
                font-size: 13px;
            }
            .try-again { color: #f39c12; }
            .congrats { color: #27ae60; }

            .solution {
                background: rgba(52, 73, 94, 0.5);
                border-radius: 6px;
                padding: 12px;
                margin-top: 16px;
            }
            .solution h4 {
                color: #fff;
                margin: 0 0 8px 0;
                font-size: 13px;
            }
            .solution ul {
                margin: 8px 0 0 20px;
                color: #aaa;
                font-size: 12px;
            }

            .assessment-controls {
                padding: 12px 16px;
                background: rgba(0,0,0,0.3);
                border-top: 1px solid #333;
            }

            .assessment-instructions {
                font-size: 11px;
                color: #888;
                line-height: 1.5;
            }
        `;

    document.head.appendChild(style);
  }
}

// Export singleton factory
export function createAssessmentController(app) {
  return new AssessmentController(app);
}
