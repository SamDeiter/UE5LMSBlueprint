import { describe, it, expect, vi } from "vitest";
import { UE5Renderer } from "../../../src/utils/UE5Renderer.js";

// Mock Utils.getPinColor
vi.mock("../../../src/utils.js", () => ({
  Utils: {
    getPinColor: vi.fn((type) => {
      const colors = {
        float: "#00ff00",
        exec: "#ffffff",
        delegate: "#ff0000",
        vector: "#ffff00",
      };
      return colors[type] || "#cccccc";
    }),
  },
}));

describe("UE5Renderer", () => {
  describe("renderPinIcon", () => {
    it("should render an exec pin with the elongated pentagon path", () => {
      const svg = UE5Renderer.renderPinIcon({ type: "exec" }, false);
      expect(svg).toContain("M2 3 H11 L17 9 L11 15 H2 Z");
      expect(svg).toContain('fill="transparent"');
    });

    it("should render a connected exec pin with white fill", () => {
      const svg = UE5Renderer.renderPinIcon({ type: "exec" }, true);
      expect(svg).toContain('fill="#fff"');
    });

    it("should render a delegate pin as a diamond", () => {
      const svg = UE5Renderer.renderPinIcon({ type: "delegate" }, false);
      expect(svg).toContain("M7.5 1 L14 7.5 L7.5 14 L1 7.5 Z");
      expect(svg).toContain('fill="transparent"');
      expect(svg).toContain('stroke="#ff0000"');
    });

    it("should render a standard data pin (circle + beak)", () => {
      const svg = UE5Renderer.renderPinIcon({ type: "float" }, false);
      expect(svg).toContain("<circle");
      expect(svg).toContain('cx="6.5"');
      expect(svg).toContain('fill="#000"'); // Disconnected data pin is black filled
      expect(svg).toContain('stroke="#00ff00"');
      expect(svg).toContain('d="M11.5 3.5 L16.5 7.5 L11.5 11.5 Z"');
    });

    it("should render a connected data pin with correct fill color", () => {
      const svg = UE5Renderer.renderPinIcon({ type: "float" }, true);
      expect(svg).toContain('fill="#00ff00"');
    });
  });

  describe("renderContainerPin", () => {
    it("should render array grid for array containerType", () => {
      const svg = UE5Renderer.renderContainerPin(
        { containerType: "array" },
        true,
        "#00ff00"
      );
      expect(svg).toContain("M1 1h2v2H1V1z"); // Part of the 3x3 grid
      expect(svg).toContain('fill="#00ff00"');
    });
  });

  describe("renderCompileIcon", () => {
    it("should include a question mark badge for dirty state", () => {
      const svg = UE5Renderer.renderCompileIcon("dirty");
      expect(svg).toContain("?");
      expect(svg).toContain('stroke="#ffaa00"');
    });

    it("should include a checkmark for success state", () => {
      const svg = UE5Renderer.renderCompileIcon("success");
      expect(svg).toContain("M15.5 18 l2 2 l4 -4");
      expect(svg).toContain('stroke="#4CAF50"');
    });

    it("should include an X for error state", () => {
      const svg = UE5Renderer.renderCompileIcon("error");
      expect(svg).toContain("M16 16 l4 4 M20 16 l-4 4");
    });
  });

  it("should render a function icon as an italic f", () => {
    const html = UE5Renderer.renderFunctionIcon(false);
    expect(html).toContain("font-style: italic");
    expect(html).toContain("f</span>");
  });

  it("should render a breakpoint icon as an octagon", () => {
    const svg = UE5Renderer.renderBreakpointIcon();
    expect(svg).toContain("M5 1 h6 l4 4 v6 l-4 4 h-6 l-4-4 v-6 Z");
    expect(svg).toContain('fill="#d32f2f"');
  });
});
