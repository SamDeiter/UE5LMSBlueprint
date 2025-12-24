// assessment/ScormClient.js
// Minimal wrapper for SCORM 1.3 (2004 3rd edition) API used by Totara.

class ScormClient {
  static version = null; // '1.2' or '2004'

  static findAPI() {
    let win = window;
    let attempts = 0;

    while (win.parent !== null && win.parent !== win) {
      attempts++;
      if (attempts > 50) break; // Prevent deep recursion

      // Checks for SCORM 2004
      if (win.API_1484_11) {
        this.version = "2004";
        return win.API_1484_11;
      }

      // Checks for SCORM 1.2
      if (win.API) {
        this.version = "1.2";
        return win.API;
      }

      win = win.parent;
    }

    // Check the top window as well
    if (win.API_1484_11) {
      this.version = "2004";
      return win.API_1484_11;
    }
    if (win.API) {
      this.version = "1.2";
      return win.API;
    }

    return null;
  }

  static async init() {
    this.api = this.findAPI();
    if (!this.api) {
      console.warn("SCORM API not found. Running in standalone/debug mode.");
      return;
    }

    if (this.version === "2004") {
      const result = this.api.Initialize("");
      console.log("SCORM 2004 Initialized:", result);
    } else {
      const result = this.api.LMSInitialize("");
      console.log("SCORM 1.2 Initialized:", result);
    }
  }

  static setScore(score) {
    if (!this.api) return;

    if (this.version === "2004") {
      this.api.SetValue("cmi.score.raw", String(score));
    } else {
      this.api.LMSSetValue("cmi.core.score.raw", String(score));
    }
  }

  static setPassStatus(passed) {
    if (!this.api) return;

    if (this.version === "2004") {
      this.api.SetValue("cmi.success_status", passed ? "passed" : "failed");
    } else {
      this.api.LMSSetValue(
        "cmi.core.lesson_status",
        passed ? "passed" : "failed"
      );
    }
  }

  static commit() {
    if (!this.api) return;

    if (this.version === "2004") {
      this.api.Commit("");
    } else {
      this.api.LMSCommit("");
    }
  }

  static terminate() {
    if (!this.api) return;

    if (this.version === "2004") {
      this.api.Terminate("");
    } else {
      this.api.LMSFinish("");
    }
  }
}

export default ScormClient;
