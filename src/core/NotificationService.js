/**
 * NotificationService.js - Toast notifications and user feedback
 * Provides UE5-style notifications for the editor
 */

/**
 * Notification types
 */
export const NotificationType = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
};

/**
 * Notification configuration
 */
const CONFIG = {
  defaultDuration: 3000,
  maxNotifications: 5,
  animationDuration: 300,
};

/**
 * Notification item
 */
class Notification {
  constructor(message, type = NotificationType.INFO, options = {}) {
    this.id = Date.now() + Math.random();
    this.message = message;
    this.type = type;
    this.duration = options.duration ?? CONFIG.defaultDuration;
    this.dismissible = options.dismissible ?? true;
    this.action = options.action || null;
    this.createdAt = Date.now();
    this.element = null;
  }
}

/**
 * NotificationService - Manages toast notifications
 */
class NotificationServiceClass {
  constructor() {
    this.notifications = [];
    this.container = null;
    this.initialized = false;
  }

  /**
   * Initialize notification container
   */
  initialize() {
    if (this.initialized) return;

    this.container = document.createElement("div");
    this.container.className = "notification-container";
    this.container.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-width: 400px;
            pointer-events: none;
        `;
    document.body.appendChild(this.container);
    this.initialized = true;
  }

  /**
   * Show an info notification
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   */
  info(message, options = {}) {
    return this.show(message, NotificationType.INFO, options);
  }

  /**
   * Show a success notification
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   */
  success(message, options = {}) {
    return this.show(message, NotificationType.SUCCESS, options);
  }

  /**
   * Show a warning notification
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   */
  warning(message, options = {}) {
    return this.show(message, NotificationType.WARNING, options);
  }

  /**
   * Show an error notification
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   */
  error(message, options = {}) {
    return this.show(message, NotificationType.ERROR, {
      duration: 5000,
      ...options,
    });
  }

  /**
   * Show a notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   * @param {Object} options - Additional options
   */
  show(message, type = NotificationType.INFO, options = {}) {
    if (!this.initialized) this.initialize();

    const notification = new Notification(message, type, options);

    // Limit max notifications
    while (this.notifications.length >= CONFIG.maxNotifications) {
      this.dismiss(this.notifications[0].id);
    }

    this.notifications.push(notification);
    this._render(notification);

    // Auto-dismiss if duration > 0
    if (notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }

  /**
   * Dismiss a notification
   * @param {number} id - Notification ID
   */
  dismiss(id) {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index === -1) return;

    const notification = this.notifications[index];
    if (notification.element) {
      notification.element.style.opacity = "0";
      notification.element.style.transform = "translateX(100%)";

      setTimeout(() => {
        notification.element?.remove();
      }, CONFIG.animationDuration);
    }

    this.notifications.splice(index, 1);
  }

  /**
   * Dismiss all notifications
   */
  dismissAll() {
    [...this.notifications].forEach((n) => this.dismiss(n.id));
  }

  /**
   * Render a notification element
   */
  _render(notification) {
    const el = document.createElement("div");
    el.className = `notification notification-${notification.type}`;
    el.style.cssText = `
            padding: 12px 16px;
            background: ${this._getBackgroundColor(notification.type)};
            border-left: 4px solid ${this._getBorderColor(notification.type)};
            border-radius: 4px;
            color: #fff;
            font-size: 13px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            pointer-events: auto;
            cursor: ${notification.dismissible ? "pointer" : "default"};
            opacity: 0;
            transform: translateX(50px);
            transition: opacity ${CONFIG.animationDuration}ms, transform ${
      CONFIG.animationDuration
    }ms;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

    // Icon
    const icon = document.createElement("i");
    icon.className = `fas ${this._getIcon(notification.type)}`;
    el.appendChild(icon);

    // Message
    const msg = document.createElement("span");
    msg.textContent = notification.message;
    msg.style.flex = "1";
    el.appendChild(msg);

    // Action button if provided
    if (notification.action) {
      const btn = document.createElement("button");
      btn.textContent = notification.action.label;
      btn.style.cssText = `
                background: rgba(255,255,255,0.2);
                border: none;
                padding: 4px 8px;
                border-radius: 3px;
                color: #fff;
                cursor: pointer;
            `;
      btn.onclick = (e) => {
        e.stopPropagation();
        notification.action.callback();
        this.dismiss(notification.id);
      };
      el.appendChild(btn);
    }

    // Click to dismiss
    if (notification.dismissible) {
      el.onclick = () => this.dismiss(notification.id);
    }

    notification.element = el;
    this.container.appendChild(el);

    // Trigger animation
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateX(0)";
    });
  }

  _getBackgroundColor(type) {
    const colors = {
      [NotificationType.INFO]: "#2a3f5f",
      [NotificationType.SUCCESS]: "#1e4620",
      [NotificationType.WARNING]: "#5c4813",
      [NotificationType.ERROR]: "#5c1313",
    };
    return colors[type] || colors[NotificationType.INFO];
  }

  _getBorderColor(type) {
    const colors = {
      [NotificationType.INFO]: "#4a9eff",
      [NotificationType.SUCCESS]: "#4ade80",
      [NotificationType.WARNING]: "#fbbf24",
      [NotificationType.ERROR]: "#ef4444",
    };
    return colors[type] || colors[NotificationType.INFO];
  }

  _getIcon(type) {
    const icons = {
      [NotificationType.INFO]: "fa-info-circle",
      [NotificationType.SUCCESS]: "fa-check-circle",
      [NotificationType.WARNING]: "fa-exclamation-triangle",
      [NotificationType.ERROR]: "fa-times-circle",
    };
    return icons[type] || icons[NotificationType.INFO];
  }
}

// Singleton instance
export const NotificationService = new NotificationServiceClass();
