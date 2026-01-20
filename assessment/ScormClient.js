// assessment/ScormClient.js
// Minimal wrapper for SCORM 1.3 (2004 3rd edition) API used by Totara.

class ScormClient {
    static findAPI() {
        let win = window;
        while (win) {
            if (win.API_1484_11) return win.API_1484_11;
            win = win.parent;
        }
        return null;
    }

    static async init() {
        this.api = this.findAPI();
        if (!this.api) throw new Error('SCORM API not found');
        // Initialize returns a string, ignore it.
        await this.api.Initialize('');
    }

    static setScore(score) {
        if (!this.api) throw new Error('SCORM API not initialized');
        this.api.SetValue('cmi.score.raw', String(score));
    }

    static setPassStatus(passed) {
        if (!this.api) throw new Error('SCORM API not initialized');
        this.api.SetValue('cmi.success_status', passed ? 'passed' : 'failed');
    }

    static commit() {
        if (!this.api) throw new Error('SCORM API not initialized');
        this.api.Commit('');
    }

    static terminate() {
        if (!this.api) throw new Error('SCORM API not initialized');
        this.api.Terminate('');
    }
}

export default ScormClient;
