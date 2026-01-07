import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskManager } from "../../../src/services/TaskManager.js";
import { createMockApp, createMockNode } from "../../helpers/mocks.js";

describe("TaskManager", () => {
  let taskManager;
  let mockApp;

  beforeEach(() => {
    mockApp = createMockApp();
    taskManager = new TaskManager(mockApp);
  });

  describe("constructor", () => {
    it("should initialize with app reference", () => {
      expect(taskManager.app).toBe(mockApp);
    });

    it("should initialize with no current task", () => {
      expect(taskManager.currentTask).toBeNull();
    });

    it("should initialize with null validation results", () => {
      expect(taskManager.validationResults).toBeNull();
    });

    it("should initialize with autoValidate disabled", () => {
      expect(taskManager.autoValidate).toBe(false);
    });

    it("should load available tasks list", () => {
      const tasks = taskManager.getAllTasks();
      expect(tasks).toBeDefined();
      expect(Array.isArray(tasks)).toBe(true);
    });
  });

  describe("getAllTasks", () => {
    it("should return an array of tasks", () => {
      const tasks = taskManager.getAllTasks();
      expect(Array.isArray(tasks)).toBe(true);
    });

    it("should return at least one task", () => {
      const tasks = taskManager.getAllTasks();
      expect(tasks.length).toBeGreaterThan(0);
    });

    it("should return tasks with required structure", () => {
      const tasks = taskManager.getAllTasks();
      const firstTask = tasks[0];
      expect(firstTask).toHaveProperty("taskId");
      expect(firstTask).toHaveProperty("title");
      expect(firstTask).toHaveProperty("requirements");
    });
  });

  describe("getTaskById", () => {
    it("should return undefined for non-existent task", () => {
      const task = taskManager.getTaskById("non-existent-id");
      expect(task).toBeUndefined();
    });

    it("should return task for valid task ID", () => {
      const tasks = taskManager.getAllTasks();
      if (tasks.length > 0) {
        const firstTaskId = tasks[0].taskId;
        const task = taskManager.getTaskById(firstTaskId);
        expect(task).toBeDefined();
        expect(task.taskId).toBe(firstTaskId);
      }
    });
  });

  describe("setCurrentTask", () => {
    it("should set current task by ID", () => {
      const tasks = taskManager.getAllTasks();
      if (tasks.length > 0) {
        const taskId = tasks[0].taskId;
        const result = taskManager.setCurrentTask(taskId);

        expect(result).toBe(true);
        expect(taskManager.currentTask).toBeDefined();
        expect(taskManager.currentTask.taskId).toBe(taskId);
      }
    });

    it("should return false for non-existent task ID", () => {
      const result = taskManager.setCurrentTask("non-existent-id");
      expect(result).toBe(false);
    });

    it("should trigger validation when task is set", () => {
      const tasks = taskManager.getAllTasks();
      if (tasks.length > 0) {
        const taskId = tasks[0].taskId;
        taskManager.setCurrentTask(taskId);

        // Validation should have run and created results
        expect(taskManager.validationResults).not.toBeNull();
      }
    });
  });

  describe("clearTask", () => {
    it("should clear current task", () => {
      const tasks = taskManager.getAllTasks();
      if (tasks.length > 0) {
        taskManager.setCurrentTask(tasks[0].taskId);
        taskManager.clearTask();

        expect(taskManager.currentTask).toBeNull();
        expect(taskManager.validationResults).toBeNull();
      }
    });
  });

  describe("validateCurrentTask", () => {
    it("should return failure when no task is selected", () => {
      const result = taskManager.validateCurrentTask();

      expect(result.success).toBe(false);
      expect(result.results).toEqual([]);
    });

    it("should validate task requirements", () => {
      const tasks = taskManager.getAllTasks();
      if (tasks.length > 0) {
        taskManager.setCurrentTask(tasks[0].taskId);
        const result = taskManager.validateCurrentTask();

        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("results");
        expect(Array.isArray(result.results)).toBe(true);
      }
    });

    it("should store validation results", () => {
      const tasks = taskManager.getAllTasks();
      if (tasks.length > 0) {
        taskManager.setCurrentTask(tasks[0].taskId);
        taskManager.validateCurrentTask();

        expect(taskManager.validationResults).not.toBeNull();
        expect(taskManager.validationResults).toHaveProperty("success");
      }
    });
  });

  describe("getCurrentTask", () => {
    it("should return null when no task is selected", () => {
      expect(taskManager.getCurrentTask()).toBeNull();
    });

    it("should return current task when one is selected", () => {
      const tasks = taskManager.getAllTasks();
      if (tasks.length > 0) {
        const taskId = tasks[0].taskId;
        taskManager.setCurrentTask(taskId);

        const currentTask = taskManager.getCurrentTask();
        expect(currentTask).not.toBeNull();
        expect(currentTask.taskId).toBe(taskId);
      }
    });
  });

  describe("getTaskProgress", () => {
    it("should return 0 when no validation has been run", () => {
      const progress = taskManager.getTaskProgress();
      expect(progress).toBe(0);
    });

    it("should calculate progress percentage", () => {
      const tasks = taskManager.getAllTasks();
      if (tasks.length > 0) {
        taskManager.setCurrentTask(tasks[0].taskId);
        const progress = taskManager.getTaskProgress();

        expect(typeof progress).toBe("number");
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(100);
      }
    });
  });

  describe("setAutoValidate", () => {
    it("should enable auto-validation", () => {
      taskManager.setAutoValidate(true);
      expect(taskManager.autoValidate).toBe(true);
    });

    it("should disable auto-validation", () => {
      taskManager.setAutoValidate(true);
      taskManager.setAutoValidate(false);
      expect(taskManager.autoValidate).toBe(false);
    });
  });

  describe("getValidationResults", () => {
    it("should return null when no validation has been run", () => {
      expect(taskManager.getValidationResults()).toBeNull();
    });

    it("should return validation results after validation", () => {
      const tasks = taskManager.getAllTasks();
      if (tasks.length > 0) {
        taskManager.setCurrentTask(tasks[0].taskId);

        const results = taskManager.getValidationResults();
        expect(results).not.toBeNull();
        expect(results).toHaveProperty("success");
        expect(results).toHaveProperty("results");
      }
    });
  });

  describe("getSummary", () => {
    it("should return summary with no task", () => {
      const summary = taskManager.getSummary();

      expect(summary).toHaveProperty("hasTask");
      expect(summary).toHaveProperty("progress");
      expect(summary).toHaveProperty("isComplete");
      expect(summary.hasTask).toBe(false);
    });

    it("should return summary with current task", () => {
      const tasks = taskManager.getAllTasks();
      if (tasks.length > 0) {
        taskManager.setCurrentTask(tasks[0].taskId);
        const summary = taskManager.getSummary();

        expect(summary.hasTask).toBe(true);
        expect(summary.progress).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("addTask", () => {
    it("should add a new task", () => {
      const newTask = {
        taskId: "test-new-task",
        title: "New Test Task",
        description: "A new test task",
        requirements: [],
      };

      const initialCount = taskManager.getAllTasks().length;
      taskManager.addTask(newTask);
      const newCount = taskManager.getAllTasks().length;

      expect(newCount).toBe(initialCount + 1);
    });

    it("should not add duplicate task IDs", () => {
      const tasks = taskManager.getAllTasks();
      if (tasks.length > 0) {
        const existingTask = tasks[0];
        const initialCount = tasks.length;

        taskManager.addTask(existingTask);
        const newCount = taskManager.getAllTasks().length;

        expect(newCount).toBe(initialCount);
      }
    });
  });
});
