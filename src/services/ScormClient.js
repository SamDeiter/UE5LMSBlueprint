/**
 * ScormClient.js
 * Handles communication with the LMS via SCORM 1.3 (2004) API.
 */
export class ScormClient {
    constructor() {
        this.API = null;
        this.isInitialized = false;
        this.debug = true;
    }

    /**
     * Initialize the SCORM connection
     * @returns {boolean} True if connection successful
     */
    initialize() {
        if (this.isInitialized) return true;

        this.API = this.findAPI();
        if (!this.API) {
            this.log("SCORM API not found.");
            return false;
        }

        const result = this.API.Initialize("");
        if (result === "true") {
            this.isInitialized = true;
            this.log("SCORM Initialized successfully.");
            this.setIncomplete(); // Mark as incomplete on start
            return true;
        } else {
            this.handleError("Initialize");
            return false;
        }
    }

    /**
     * Find the SCORM API in window hierarchy
     */
    findAPI(win = window) {
        let attempts = 0;
        while ((win.API_1484_11 == null) && (win.parent != null) && (win.parent != win)) {
            attempts++;
            if (attempts > 10) return null;
            win = win.parent;
        }
        return win.API_1484_11;
    }

    /**
     * Set the score (0-100)
     * @param {number} score 
     */
    setScore(score) {
        if (!this.isInitialized) return;

        // SCORM 2004 format: scaled (0..1), raw (0..100), min, max
        this.setValue("cmi.score.scaled", (score / 100).toFixed(2));
        this.setValue("cmi.score.raw", score);
        this.setValue("cmi.score.min", "0");
        this.setValue("cmi.score.max", "100");
        this.commit();
    }

    /**
     * Set completion status
     * @param {boolean} passed 
     */
    setPassed(passed) {
        if (!this.isInitialized) return;

        const status = passed ? "passed" : "failed";
        this.setValue("cmi.success_status", status);
        this.setValue("cmi.completion_status", "completed");
        this.commit();
    }

    setIncomplete() {
        if (!this.isInitialized) return;
        this.setValue("cmi.completion_status", "incomplete");
        this.commit();
    }

    /**
     * Helper to set value
     */
    setValue(parameter, value) {
        if (!this.isInitialized) return;
        const result = this.API.SetValue(parameter, value);
        if (result !== "true") {
            this.handleError(`SetValue(${parameter}, ${value})`);
        }
    }

    /**
     * Commit changes to LMS
     */
    commit() {
        if (!this.isInitialized) return;
        const result = this.API.Commit("");
        if (result !== "true") {
            this.handleError("Commit");
        }
    }

    /**
     * Terminate session
     */
    terminate() {
        if (!this.isInitialized) return;
        const result = this.API.Terminate("");
        if (result === "true") {
            this.isInitialized = false;
            this.log("SCORM Terminated.");
        } else {
            this.handleError("Terminate");
        }
    }

    handleError(action) {
        if (!this.API) return;
        const code = this.API.GetLastError();
        const message = this.API.GetErrorString(code);
        const diagnostic = this.API.GetDiagnostic(code);
        console.error(`SCORM Error [${action}]: ${code} - ${message} (${diagnostic})`);
    }

    log(msg) {
        if (this.debug) {
            console.log(`[ScormClient] ${msg}`);
        }
    }
}

// Export singleton
export const scormClient = new ScormClient();
