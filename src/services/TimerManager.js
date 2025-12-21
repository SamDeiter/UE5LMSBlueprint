/**
 * TimerManager - Central service for managing named timers
 * Phase 4: Behavioral Optimization
 */
export class TimerManager {
  constructor() {
    this.timers = new Map(); // Map<timerName, { intervalId, callback, interval, looping }>
  }

  /**
   * Set a timer that calls a callback after the specified interval
   * @param {string} name - Unique timer identifier
   * @param {Function} callback - Function to execute when timer fires
   * @param {number} interval - Time in seconds
   * @param {boolean} looping - If true, repeats; if false, one-shot
   * @returns {boolean} True if timer was set successfully
   */
  setTimer(name, callback, interval, looping = false) {
    // Clear existing timer with same name
    if (this.timers.has(name)) {
      this.clearTimer(name);
    }

    const intervalMs = interval * 1000;

    if (looping) {
      const intervalId = setInterval(() => {
        callback();
      }, intervalMs);
      this.timers.set(name, { intervalId, callback, interval, looping: true });
    } else {
      const timeoutId = setTimeout(() => {
        callback();
        this.timers.delete(name); // Auto-cleanup one-shot timers
      }, intervalMs);
      this.timers.set(name, {
        intervalId: timeoutId,
        callback,
        interval,
        looping: false,
      });
    }

    return true;
  }

  /**
   * Clear an active timer by name
   * @param {string} name - Timer identifier to clear
   * @returns {boolean} True if timer existed and was cleared
   */
  clearTimer(name) {
    const timer = this.timers.get(name);
    if (timer) {
      if (timer.looping) {
        clearInterval(timer.intervalId);
      } else {
        clearTimeout(timer.intervalId);
      }
      this.timers.delete(name);
      return true;
    }
    return false;
  }

  /**
   * Check if a timer is currently active
   * @param {string} name - Timer identifier
   * @returns {boolean} True if timer exists and is running
   */
  isActive(name) {
    return this.timers.has(name);
  }

  /**
   * Clear all active timers
   */
  clearAll() {
    for (const [name] of this.timers) {
      this.clearTimer(name);
    }
  }

  /**
   * Get count of active timers
   * @returns {number}
   */
  getActiveCount() {
    return this.timers.size;
  }
}

// Singleton instance
export const timerManager = new TimerManager();
