import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.config.js",
        "src/data/**", // Node definitions - mostly config
      ],
      // Target 60% coverage
      statements: 60,
      branches: 60,
      functions: 60,
      lines: 60,
    },
  },
});
