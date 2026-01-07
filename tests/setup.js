/* global global */
// Global test setup
import { vi } from "vitest";

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock document.getElementById - common pattern in codebase
const createMockElement = () => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(() => false),
    toggle: vi.fn(),
  },
  style: {},
  appendChild: vi.fn(),
  removeChild: vi.fn(),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(() => []),
  innerHTML: "",
  textContent: "",
  value: "",
});

global.document.getElementById = vi.fn(() => createMockElement());
global.document.createElement = vi.fn((tag) => ({
  ...createMockElement(),
  tagName: tag.toUpperCase(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn(clearTimeout);
