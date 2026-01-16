/**
 * AppInitializer.js
 *
 * Orchestrates the initialization of the BlueprintApp.
 * - Validates DOM existence
 * - Registers Node Definitions
 * - Instantiates all Controllers (Dependency Injection)
 * - Sets up global state
 */

// Import all controllers
import { WiringController, GraphController } from "../graph/index.js";
import { GraphSwitcher } from "../graph/GraphSwitcher.js";
import {
  VariableController,
  PaletteController,
  ActionMenu,
  ContextMenu,
  DetailsController,
  LayoutController,
  TaskController,
  ComponentsController,
  NeedNodeModal,
  ParentClassModal,
  FunctionsController,
  MacrosController,
  LocalVariablesController,
  DebuggerController,
  GraphsController,
  EventDispatcherController,
  SearchController,
  ContentBrowserPanel,
} from "../ui.js";
import {
  Compiler,
  Persistence,
  GridController,
  HistoryManager,
  StateManager,
  SimulationEngine,
} from "../services.js";
import { TestRunner, registerTests } from "../tests.js?v=4";
import { BlueprintValidator, SAMPLE_TASK } from "../utils/validator.js";
import { TaskManager } from "../services/TaskManager.js";
import { nodeRegistry } from "../registries/NodeRegistry.js";
import { functionRegistry } from "../functions/FunctionRegistry.js";
import { MacroRegistry } from "../macros/MacroRegistry.js";
import { NodeDefinitions } from "../data/nodes/index.js";
import { DOMElements } from "../config/DOMElements.js";
import { APP_VERSION } from "../config/Constants.js";
import { DirtyStateTracker } from "../services/DirtyStateTracker.js";
import { NodeDefinitionValidator } from "../utils/NodeDefinitionValidator.js";
import { BreakpointManager } from "../services/BreakpointManager.js";
import { AssetInterfacingService } from "../services/AssetInterfacingService.js";
import { BlueprintAssetManager, ContentBrowser } from "../core/index.js";

import { DOMEventHandler } from "./DOMEventHandler.js";
import { createAssessmentController } from "../ui/assessment/AssessmentController.js";
import { panelManager } from "../ui/panels/PanelManager.js";
import { WindowMenuController } from "../ui/menu/WindowMenuController.js";

export class AppInitializer {
  /**
   * Run the full initialization sequence
   * @param {Class} App - The static BlueprintApp class
   */
  static run(App) {
    this.initializeGlobals(App);

    if (!this.validateEnvironment()) return;
    if (!this.registerNodeDefinitions()) return;

    this.initializeControllers(App);
    this.initializeServices(App);
    this.initializeUI(App);
    this.initializeTools(App);

    // DOM Event Binding
    const domHandler = new DOMEventHandler(App);
    domHandler.bindAll();

    this.postInitialization(App);
  }

  static initializeGlobals(App) {
    // Expose for inline events
    window.app = App;
    App.nodeRegistry = nodeRegistry;
    App.functionRegistry = functionRegistry;
    App.macroRegistry = new MacroRegistry();

    const versionEl = document.getElementById("app-version");
    if (versionEl) {
      versionEl.textContent = `v${APP_VERSION}`;
      console.log(
        `BlueprintApp v${APP_VERSION} initialized at ${new Date().toISOString()}`
      );
    }
  }

  static validateEnvironment() {
    // DOM Elements - Fail early
    const required = [
      DOMElements.GRAPH_EDITOR,
      DOMElements.NODES_CONTAINER,
      DOMElements.GRAPH_SVG,
      DOMElements.GRAPH_CANVAS,
    ];

    const missing = required.filter((id) => !document.getElementById(id));
    if (missing.length > 0) {
      console.error("Critical DOM elements missing:", missing);
      return false;
    }
    return true;
  }

  static registerNodeDefinitions() {
    try {
      NodeDefinitionValidator.validateAll(NodeDefinitions);
      nodeRegistry.registerBatch(NodeDefinitions);
      return true;
    } catch (err) {
      console.error("Node definition validation/registration failed:", err);
      window.alert(`Node Definition Errors: ${err.message}`);
      return false;
    }
  }

  static initializeControllers(App) {
    // Core Data
    App.components = new Map();
    App.classDefaults = {
      parentClass: "Actor",
      tickInterval: 0.0,
      replicates: false,
      autoReceiveInput: "Disabled",
    };

    // DOM Refs
    const graphEditorEl = document.getElementById(DOMElements.GRAPH_EDITOR);
    const nodesContainerEl = document.getElementById(
      DOMElements.NODES_CONTAINER
    );
    const graphSvgEl = document.getElementById(DOMElements.GRAPH_SVG);
    const graphCanvasEl = document.getElementById(DOMElements.GRAPH_CANVAS);

    // Low-Level
    App.layout = new LayoutController(App);
    App.wiring = new WiringController(graphSvgEl, App);
    App.grid = new GridController(graphCanvasEl, App);

    // Data
    App.variables = new VariableController(App);
    App.eventDispatchers = new EventDispatcherController(App);
    App.history = new HistoryManager(App);
    App.stateManager = new StateManager(App);

    // Main Graph
    App.graph = new GraphController(
      graphEditorEl,
      graphSvgEl,
      nodesContainerEl,
      App
    );
  }

  static initializeServices(App) {
    App.persistence = new Persistence(App);
    App.compiler = new Compiler(App);
    App.sim = new SimulationEngine(App);
    App.breakpointManager = new BreakpointManager();
    App.assetInterfacingService = new AssetInterfacingService(App);
    App.dirtyState = new DirtyStateTracker(App);

    // Task System
    App.taskManager = new TaskManager(App);

    // Content Browser
    App.assetManager = new BlueprintAssetManager();
    App.contentBrowser = new ContentBrowser(App.assetManager);
    App.contentBrowser.initialize();

    // Expose global task helpers
    window.setTask = (taskId) => App.taskManager.setCurrentTask(taskId);
    window.validateTask = () => App.taskManager.validateCurrentTask();
    window.clearTask = () => App.taskManager.clearTask();
  }

  static initializeUI(App) {
    // Initialize panel management system
    panelManager.init();
    App.panelManager = panelManager;

    App.componentsController = new ComponentsController(App);
    App.functionsController = new FunctionsController(App);
    App.macrosController = new MacrosController(App);
    App.graphsController = new GraphsController(App);
    App.layoutController = new LayoutController(App);
    App.searchController = new SearchController(App);
    App.contentBrowserPanel = new ContentBrowserPanel(App);
    App.localVariablesController = new LocalVariablesController(App);

    App.palette = new PaletteController(App);
    App.details = new DetailsController(App);
    App.actionMenu = new ActionMenu(App);
    App.contextMenu = new ContextMenu(App);

    App.needNodeModal = new NeedNodeModal(App);
    App.parentClassModal = new ParentClassModal(App);
    App.debugger = new DebuggerController(App);

    App.taskUI = new TaskController(App);
    App.search = new SearchController(App);

    // Graph Switcher
    App.graphSwitcher = new GraphSwitcher(App);
    App.switchGraph = (n) => App.graphSwitcher.switchGraph(n);
    App.graphSwitcher.ensureDefaultTabs();

    // Window Menu Controller
    App.windowMenu = new WindowMenuController();
  }

  static initializeTools(App) {
    // Validators & Runners
    App.testRunner = new TestRunner(App);
    registerTests(App.testRunner);
    window.runTests = () => App.testRunner.run();

    App.validator = new BlueprintValidator(App);
    window.validateSampleTask = () => App.validator.validateTask(SAMPLE_TASK);

    // Assessment Mode (Educational Quiz System)
    App.assessment = createAssessmentController(App);
    window.openAssessment = () => App.assessment.open();
  }

  static postInitialization(App) {
    // Load State
    try {
      if (App.persistence) App.persistence.load();
    } catch (err) {
      console.error("Failed to load persistence state:", err);
    }

    if (App.history) App.history.saveState("initial load");

    // Initial Render
    if (App.graph) {
      App.graph.renderAllNodes();
      requestAnimationFrame(() => App.graph.drawAllWires());
    }

    // Populate Panels
    App.palette.populateList();
    App.variables.renderPanel();
    App.componentsController.render();
    App.compiler.validate();
    App.grid.draw();
  }
}
