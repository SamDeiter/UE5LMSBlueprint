/**
 * BaseController - Base class for all UI controllers
 *
 * Provides automatic cleanup of event listeners and timers to prevent memory leaks.
 * All controllers should extend this class and use the provided helper methods.
 *
 * Features:
 * - Automatic event listener tracking and cleanup
 * - Automatic timer/interval tracking and cleanup
 * - Lifecycle hooks (init, cleanup)
 * - Prevents memory leaks from forgotten removeEventListener calls
 *
 * Usage:
 *   class MyController extends BaseController {
 *     constructor(app) {
 *       super(app);
 *       this.init();
 *     }
 *
 *     init() {
 *       // Use addListener instead of addEventListener
 *       this.addListener(button, 'click', this.handleClick.bind(this));
 *
 *       // Use addInterval/addTimeout instead of setInterval/setTimeout
 *       this.addInterval(() => this.update(), 1000);
 *     }
 *
 *     cleanup() {
 *       super.cleanup(); // Automatically removes all listeners and timers
 *     }
 *   }
 */

export class BaseController {
  constructor(app) {
    this.app = app;

    // Track all event listeners for automatic cleanup
    this.listeners = [];

    // Track all timers for automatic cleanup
    this.timers = [];
    this.intervals = [];
  }

  /**
   * Add an event listener with automatic cleanup tracking
   * @param {Element} element - DOM element to attach listener to
   * @param {string} event - Event name (e.g., 'click', 'keydown')
   * @param {Function} handler - Event handler function
   * @param {Object} options - Optional event listener options
   */
  addListener(element, event, handler, options = {}) {
    if (!element) {
      console.warn("BaseController.addListener: element is null/undefined");
      return;
    }

    element.addEventListener(event, handler, options);

    // Track for cleanup
    this.listeners.push({ element, event, handler, options });
  }

  /**
   * Add multiple event listeners to the same element
   * @param {Element} element - DOM element
   * @param {Object} events - Object mapping event names to handlers
   * @example
   *   this.addListeners(button, {
   *     'click': this.handleClick.bind(this),
   *     'mouseenter': this.handleHover.bind(this)
   *   });
   */
  addListeners(element, events) {
    Object.entries(events).forEach(([event, handler]) => {
      this.addListener(element, event, handler);
    });
  }

  /**
   * Add a setTimeout with automatic cleanup tracking
   * @param {Function} callback - Function to execute
   * @param {number} delay - Delay in milliseconds
   * @returns {number} Timer ID
   */
  addTimeout(callback, delay) {
    const timerId = setTimeout(() => {
      callback();
      // Remove from tracking after execution
      this.timers = this.timers.filter((id) => id !== timerId);
    }, delay);

    this.timers.push(timerId);
    return timerId;
  }

  /**
   * Add a setInterval with automatic cleanup tracking
   * @param {Function} callback - Function to execute repeatedly
   * @param {number} interval - Interval in milliseconds
   * @returns {number} Interval ID
   */
  addInterval(callback, interval) {
    const intervalId = setInterval(callback, interval);
    this.intervals.push(intervalId);
    return intervalId;
  }

  /**
   * Manually remove a specific event listener
   * @param {Element} element - DOM element
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   */
  removeListener(element, event, handler) {
    element.removeEventListener(event, handler);

    // Remove from tracking
    this.listeners = this.listeners.filter(
      (listener) =>
        !(
          listener.element === element &&
          listener.event === event &&
          listener.handler === handler
        )
    );
  }

  /**
   * Clear a specific timeout
   * @param {number} timerId - Timer ID returned from addTimeout
   */
  clearTimeout(timerId) {
    clearTimeout(timerId);
    this.timers = this.timers.filter((id) => id !== timerId);
  }

  /**
   * Clear a specific interval
   * @param {number} intervalId - Interval ID returned from addInterval
   */
  clearInterval(intervalId) {
    clearInterval(intervalId);
    this.intervals = this.intervals.filter((id) => id !== intervalId);
  }

  /**
   * Cleanup all event listeners and timers
   * Call this when the controller is being destroyed
   * Subclasses should call super.cleanup() if they override this
   */
  cleanup() {
    // Remove all event listeners
    this.listeners.forEach(({ element, event, handler, options }) => {
      if (element && element.removeEventListener) {
        element.removeEventListener(event, handler, options);
      }
    });
    this.listeners = [];

    // Clear all timeouts
    this.timers.forEach((timerId) => clearTimeout(timerId));
    this.timers = [];

    // Clear all intervals
    this.intervals.forEach((intervalId) => clearInterval(intervalId));
    this.intervals = [];

    console.log(
      `${this.constructor.name}: Cleaned up ${this.listeners.length} listeners, ${this.timers.length} timers, ${this.intervals.length} intervals`
    );
  }

  /**
   * Get statistics about tracked resources (for debugging)
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      listeners: this.listeners.length,
      timers: this.timers.length,
      intervals: this.intervals.length,
      listenerDetails: this.listeners.map((l) => ({
        element: l.element.tagName || l.element.constructor.name,
        event: l.event,
      })),
    };
  }
}
