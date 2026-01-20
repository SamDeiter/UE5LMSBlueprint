/**
 * Main Application Logic for the UE5-style Blueprint Editor.
 * This is the main entry point that orchestrates the application.
 */

import { AppInitializer } from "./init/AppInitializer.js";

class BlueprintApp {
  /**
   * Initializes the application.
   */
  static init() {
    try {
      AppInitializer.run(BlueprintApp);
    } catch (e) {
      console.error("CRITICAL INITIALIZATION FAILURE:", e);
      window.alert("Application failed to initialize. Check console.");
    }
  }
}

// Start the application once the DOM is fully loaded
window.addEventListener("load", () => {
  BlueprintApp.init.bind(BlueprintApp)();
});
