import { vi } from "vitest";

/**
 * Test utility functions
 */

/**
 * Wait for a specified amount of time (for async tests)
 */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Flush all pending promises
 */
export async function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Create a spy that can track calls but doesn't mock implementation
 */
export function createSpy(fn) {
  return vi.fn(fn);
}

/**
 * Assert that a function throws a specific error
 */
export function expectToThrow(fn, errorMessage) {
  let thrown = false;
  let caughtError = null;

  try {
    fn();
  } catch (error) {
    thrown = true;
    caughtError = error;
  }

  if (!thrown) {
    throw new Error("Expected function to throw an error, but it did not");
  }

  if (errorMessage && !caughtError.message.includes(errorMessage)) {
    throw new Error(
      `Expected error message to include "${errorMessage}", but got "${caughtError.message}"`
    );
  }

  return caughtError;
}

/**
 * Deep clone an object (useful for fixtures)
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if two objects are deeply equal
 */
export function deepEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}
