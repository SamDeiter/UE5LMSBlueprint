/**
 * SCORM Client - Wrapper for SCORM 1.3 (2004) API integration with Totara LMS.
 * Provides methods to initialize, report scores, and commit LMS data.
 * Gracefully handles environments where SCORM API is unavailable (e.g., local development).
 */
export class ScormClient {
    constructor() {
        this.api = null;
        this.initialized = false;
    }

    /**
     * Initialize the SCORM API connection.
     * @returns {boolean} true if SCORM API is available and initialized
     */
    initialize() {
        try {
            // SCORM 2004 API
            this.api = window.API_1484_11 || window.API || null;

            if (this.api) {
                const result = this.api.Initialize('');
                this.initialized = result === 'true';
                if (this.initialized) {
                    console.log('[SCORMClient] Successfully initialized');
                }
                return this.initialized;
            } else {
                console.warn('[SCORMClient] SCORM API not available (local development mode)');
                return false;
            }
        } catch (e) {
            console.error('[SCORMClient] Initialization error:', e);
            return false;
        }
    }

    /**
     * Set the raw score (0-100).
     * @param {number} score - Score between 0 and 100
     * @returns {boolean} true if successful
     */
    setScore(score) {
        if (!this.initialized || !this.api) {
            console.log(`[SCORMClient] Would set score: ${score} (API unavailable)`);
            return false;
        }

        try {
            const result = this.api.SetValue('cmi.score.raw', String(score));
            return result === 'true';
        } catch (e) {
            console.error('[SCORMClient] Error setting score:', e);
            return false;
        }
    }

    /**
     * Set the success status (passed/failed).
     * @param {boolean} passed - true for passed, false for failed
     * @returns {boolean} true if successful
     */
    setSuccess(passed) {
        if (!this.initialized || !this.api) {
            console.log(`[SCORMClient] Would set success: ${passed ? 'passed' : 'failed'} (API unavailable)`);
            return false;
        }

        try {
            const status = passed ? 'passed' : 'failed';
            const result = this.api.SetValue('cmi.success_status', status);
            return result === 'true';
        } catch (e) {
            console.error('[SCORMClient] Error setting success status:', e);
            return false;
        }
    }

    /**
     * Set the completion status.
     * @param {string} status - 'completed', 'incomplete', 'not attempted', or 'unknown'
     * @returns {boolean} true if successful
     */
    setCompletionStatus(status = 'completed') {
        if (!this.initialized || !this.api) {
            console.log(`[SCORMClient] Would set completion: ${status} (API unavailable)`);
            return false;
        }

        try {
            const result = this.api.SetValue('cmi.completion_status', status);
            return result === 'true';
        } catch (e) {
            console.error('[SCORMClient] Error setting completion status:', e);
            return false;
        }
    }

    /**
     * Commit/save the current state to the LMS.
     * @returns {boolean} true if successful
     */
    commit() {
        if (!this.initialized || !this.api) {
            console.log('[SCORMClient] Would commit data (API unavailable)');
            return false;
        }

        try {
            const result = this.api.Commit('');
            return result === 'true';
        } catch (e) {
            console.error('[SCORMClient] Error committing data:', e);
            return false;
        }
    }

    /**
     * Terminate the SCORM session.
     * @returns {boolean} true if successful
     */
    terminate() {
        if (!this.initialized || !this.api) {
            console.log('[SCORMClient] Would terminate session (API unavailable)');
            return false;
        }

        try {
            const result = this.api.Terminate('');
            this.initialized = false;
            return result === 'true';
        } catch (e) {
            console.error('[SCORMClient] Error terminating session:', e);
            return false;
        }
    }

    /**
     * Get the last error code from the SCORM API.
     * @returns {string|null} Error code or null
     */
    getLastError() {
        if (!this.api) return null;

        try {
            return this.api.GetLastError();
        } catch (e) {
            console.error('[SCORMClient] Error getting last error:', e);
            return null;
        }
    }

    /**
     * Get error string for a given error code.
     * @param {string} errorCode - SCORM error code
     * @returns {string|null} Error description or null
     */
    getErrorString(errorCode) {
        if (!this.api) return null;

        try {
            return this.api.GetErrorString(errorCode);
        } catch (e) {
            console.error('[SCORMClient] Error getting error string:', e);
            return null;
        }
    }
}

// Export a singleton instance
export const scormClient = new ScormClient();
