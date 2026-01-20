/**
 * UE5Renderer - Handles pixel-perfect SVG generation for pins, icons, and special node elements.
 * Based on the Technical Analysis of UE5 Blueprint Editor Architecture.
 */
import { Utils } from "../utils.js";

class UE5Renderer {
  /**
   * Renders a high-fidelity pin icon using SVG.
   * @param {object} pin - The pin data object.
   * @param {boolean} isConnected - Connection state.
   * @returns {string} SVG HTML string.
   */
  static renderPinIcon(pin, isConnected) {
    const color = Utils.getPinColor(pin.type);
    const fillColor = isConnected ? color : "#000";
    const strokeColor = color;
    const strokeWidth = 1.5;

    // Container types (Array, Set, Map) use specific icons inside the pin area
    if (pin.containerType && pin.containerType !== "single") {
      return this.renderContainerPin(pin, isConnected, color);
    }

    // Exec pins use the Elongated Pentagon shape
    if (pin.type === "exec") {
      // Exec pins: transparent fill when disconnected, white when connected
      const execFill = isConnected ? "#fff" : "transparent";
      return `
                <svg width="15" height="18" viewBox="0 0 15 18" class="ue5-pin-svg">
                    <path 
                        d="M2 3 L8 3 L13 9 L8 15 L2 15 Z" 
                        fill="${execFill}" 
                        stroke="white" 
                        stroke-width="${strokeWidth}"
                    />
                </svg>
            `;
    }

    // Delegate/Event pins use a Diamond shape (hollow when connected, filled when not)
    if (pin.type === "delegate") {
      const delegateFill = isConnected ? strokeColor : "transparent";
      return `
                <svg width="15" height="15" viewBox="0 0 15 15" class="ue5-pin-svg">
                    <path 
                        d="M7.5 1 L14 7.5 L7.5 14 L1 7.5 Z" 
                        fill="${delegateFill}" 
                        stroke="${strokeColor}" 
                        stroke-width="${strokeWidth}"
                    />
                </svg>
            `;
    }

    // Reference pins use a Diamond shape
    if (pin.isReference) {
      return `
                <svg width="15" height="15" viewBox="0 0 15 15" class="ue5-pin-svg">
                    <path 
                        d="M7.5 1 L14 7.5 L7.5 14 L1 7.5 Z" 
                        fill="${fillColor}" 
                        stroke="${strokeColor}" 
                        stroke-width="${strokeWidth}"
                    />
                </svg>
            `;
    }

    // Standard Data Pins (Circle w/ Beak)
    return `
            <svg width="18" height="15" viewBox="0 0 18 15" class="ue5-pin-svg">
                <circle 
                    cx="6.5" cy="7.5" r="4.5" 
                    fill="${fillColor}" 
                    stroke="${strokeColor}" 
                    stroke-width="${strokeWidth}"
                />
                <path 
                    d="M11.5 3.5 L16.5 7.5 L11.5 11.5 Z" 
                    fill="${strokeColor}"
                />
            </svg>
        `;
  }

  /**
   * Renders the specific icons for container types (Array, Set, Map).
   */
  static renderContainerPin(pin, isConnected, color) {
    let path = "";
    let viewBox = "0 0 12 12";

    if (pin.containerType === "array") {
      // 3x3 Grid
      path = `M1 1h2v2H1V1zm4 0h2v2H5V1zm4 0h2v2H9V1zM1 5h2v2H1V5zm4 0h2v2H5V5zm4 0h2v2H9V5zM1 9h2v2H1V9zm4 0h2v2H5V9zm4 0h2v2H9V9z`;
    } else if (pin.containerType === "set") {
      // "Brackets" / Cluster
      path = `M2 1v10h1V1H2zm7 0v10h1V1H9zM3 3h1v1H3V3zm5 0h1v1H8V3zm-5 5h1v1H3V8zm5 0h1v1H8V8z`;
    } else if (pin.containerType === "map") {
      // Key-Value arrow
      path = `M1 3h3v1H1V3zm7 0h3v1H8V3zm-2-1l2 2-2 2V2zM1 8h3v1H1V8zm7 0h3v1H8V8zm-2-1l2 2-2 2V7z`;
    }

    return `
            <svg width="12" height="12" viewBox="${viewBox}" class="ue5-container-svg">
                <path d="${path}" fill="${color}" />
            </svg>
        `;
  }

  /**
   * Renders the complex Event Icon for node headers.
   */
  static renderEventHeaderIcon() {
    const maskId = `icon-mask-${Math.random().toString(36).substr(2, 9)}`;
    const diamondPath = "M12 2 L22 12 L12 22 L2 12 Z";
    const leftHalfPath = "M12 2 L12 22 L2 12 Z";
    const arrowPath = "M7 8 H12 V4 L22 12 L12 20 V16 H7 Z";
    const arrowTransform = "scale(0.75) translate(4, 4)";

    return `
            <svg width="24" height="24" viewBox="0 0 24 24" class="ue5-header-icon">
                <defs>
                    <mask id="${maskId}">
                        <rect x="0" y="0" width="24" height="24" fill="white" />
                        <path d="${arrowPath}" fill="black" transform="${arrowTransform}" />
                    </mask>
                </defs>
                
                <!-- Group components that need the cutout -->
                <g mask="url(#${maskId})">
                    <!-- Background Diamond Fill -->
                    <path d="${diamondPath}" fill="rgba(255,255,255,0.1)" />
                    <!-- Solid white left half -->
                    <path d="${leftHalfPath}" fill="white" />
                </g>

                <!-- Border stays OUTSIDE the mask for maximum sharpness -->
                <path 
                    d="${diamondPath}" 
                    fill="none" 
                    stroke="white" 
                    stroke-width="1.5" 
                />
            </svg>
        `;
  }

  /**
   * Renders a variable pill icon for the sidebar list.
   */
  static renderVariablePill(type, containerType = "single") {
    const color = Utils.getPinColor(type);
    if (containerType === "single" || !containerType) {
      return `<span class="ue5-pill" style="background-color: ${color}; width: 10px; height: 5px; border-radius: 3px; display: inline-block; vertical-align: middle;"></span>`;
    } else if (containerType === "array") {
      return `<svg width="10" height="10" viewBox="0 0 12 12" style="vertical-align: middle;"><path d="M1 1h2v2H1V1zm4 0h2v2H5V1zm4 0h2v2H9V1zM1 5h2v2H1V5zm4 0h2v2H5V5zm4 0h2v2H9V5zM1 9h2v2H1V9zm4 0h2v2H5V9zm4 0h2v2H9V9z" fill="${color}" /></svg>`;
    } else if (containerType === "set") {
      return `<span style="color: ${color}; font-size: 10px; font-weight: bold; font-family: monospace; vertical-align: middle;">{ }</span>`;
    } else if (containerType === "map") {
      return `<svg width="10" height="10" viewBox="0 0 12 12" style="vertical-align: middle;"><path d="M1 3h3v1H1V3zm7 0h3v1H8V3zm-2-1l2 2-2 2V2zM1 8h3v1H1V8zm7 0h3v1H8V8zm-2-1l2 2-2 2V7z" fill="${color}" /></svg>`;
    }
  }

  /**
   * Renders the italicized 'f' icon for the sidebar list.
   */
  static renderFunctionIcon(isPure = false) {
    const color = isPure ? "var(--color-float)" : "var(--color-object)";
    return `<span style="color: ${color}; font-weight: bold; font-style: italic; font-family: 'Times New Roman', serif; font-size: 14px; margin-right: 4px; vertical-align: middle;">f</span>`;
  }

  /**
   * Renders the high-fidelity Compile button icon with dynamic state badges.
   * @param {'dirty' | 'success' | 'error' | 'stable'} state
   */
  static renderCompileIcon(state) {
    let badge = "";
    if (state === "dirty") {
      badge = `<circle cx="18" cy="18" r="5" fill="#5a4a00" stroke="#ffaa00" stroke-width="1"/><text x="18" y="21" font-size="8" text-anchor="middle" fill="#ffaa00" font-weight="bold">?</text>`;
    } else if (state === "success") {
      badge = `<circle cx="18" cy="18" r="5" fill="#2e5a2e" stroke="#4CAF50" stroke-width="1"/><path d="M15.5 18 l2 2 l4 -4" fill="none" stroke="#4CAF50" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else if (state === "error") {
      badge = `<circle cx="18" cy="18" r="5" fill="#5a2e2e" stroke="#ff5555" stroke-width="1"/><path d="M16 16 l4 4 M20 16 l-4 4" fill="none" stroke="#ff5555" stroke-width="1.5" stroke-linecap="round"/>`;
    }

    return `
            <svg width="24" height="24" viewBox="0 0 24 24" class="ue5-compile-svg">
                <!-- Gear/Hammer Silhouette -->
                <path d="M12 2l1.2 3.8h4l-3.2 2.3 1.2 3.8-3.2-2.3-3.2 2.3 1.2-3.8-3.2-2.3h4z" fill="#ccc" transform="translate(0, 2)"/>
                <rect x="10" y="10" width="4" height="10" rx="1" fill="#888" transform="rotate(-45, 12, 12)"/>
                ${badge}
            </svg>
        `;
  }

  /**
   * Renders the Breakpoint Octagon.
   */
  static renderBreakpointIcon() {
    return `
            <svg width="16" height="16" viewBox="0 0 16 16" class="ue5-breakpoint-svg">
                <path 
                    d="M5 1 h6 l4 4 v6 l-4 4 h-6 l-4-4 v-6 Z" 
                    fill="#d32f2f" 
                    stroke="white" 
                    stroke-width="1.5"
                />
            </svg>
        `;
  }
}

export { UE5Renderer };
