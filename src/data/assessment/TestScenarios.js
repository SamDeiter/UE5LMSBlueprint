/**
 * TestScenarios.js - Sample broken graphs for educational testing
 * Each scenario has intentional errors that students must identify
 */

/**
 * Scenario 1: Null Reference Trap
 * Issue: GetPlayerCharacter without Is Valid check
 */
export const SCENARIO_NULL_REFERENCE = {
  name: "The Null Reference Trap",
  description:
    "Find the potential crash point in this player health display logic.",
  difficulty: "Beginner",
  expectedIssues: ["Potential Null Reference"],
  nodes: [
    {
      id: "node-1",
      nodeKey: "EventBeginPlay",
      title: "Event BeginPlay",
      type: "event",
      x: 100,
      y: 100,
      pins: [{ id: "node-1-exec", localId: "exec", type: "exec", dir: "out" }],
    },
    {
      id: "node-2",
      nodeKey: "GetPlayerCharacter",
      title: "Get Player Character",
      type: "pure-node",
      x: 300,
      y: 100,
      pins: [
        { id: "node-2-return", localId: "return", type: "object", dir: "out" },
      ],
    },
    {
      id: "node-3",
      nodeKey: "GetHealth",
      title: "Get Health",
      type: "pure-node",
      x: 500,
      y: 100,
      pins: [
        { id: "node-3-target", localId: "target", type: "object", dir: "in" },
        { id: "node-3-return", localId: "return", type: "float", dir: "out" },
      ],
    },
    {
      id: "node-4",
      nodeKey: "PrintString",
      title: "Print String",
      type: "flow-node",
      x: 700,
      y: 100,
      pins: [
        { id: "node-4-exec", localId: "exec", type: "exec", dir: "in" },
        { id: "node-4-then", localId: "then", type: "exec", dir: "out" },
        { id: "node-4-string", localId: "string", type: "string", dir: "in" },
      ],
    },
    {
      id: "node-5",
      nodeKey: "IsValid",
      title: "Is Valid",
      type: "flow-node",
      x: 300,
      y: 250,
      pins: [
        { id: "node-5-exec", localId: "exec", type: "exec", dir: "in" },
        { id: "node-5-valid", localId: "is_valid", type: "exec", dir: "out" },
        {
          id: "node-5-invalid",
          localId: "not_valid",
          type: "exec",
          dir: "out",
        },
        { id: "node-5-input", localId: "input", type: "object", dir: "in" },
      ],
    },
  ],
  links: [
    { id: "link-1", startPinId: "node-1-exec", endPinId: "node-4-exec" },
    { id: "link-2", startPinId: "node-2-return", endPinId: "node-3-target" },
    // Manual check node added for verification
    { id: "link-3", startPinId: "node-2-return", endPinId: "node-5-input" },
  ],
};

/**
 * Scenario 2: Cast Failed Silence
 * Issue: Cast without handling Cast Failed
 */
export const SCENARIO_CAST_FAILED = {
  name: "The Silent Cast Failure",
  description:
    "This damage system works in testing but fails in production. Why?",
  difficulty: "Beginner",
  expectedIssues: ["Unhandled Cast Failure"],
  nodes: [
    {
      id: "node-1",
      nodeKey: "EventAnyDamage",
      title: "Event Any Damage",
      type: "event",
      x: 100,
      y: 100,
      pins: [
        { id: "node-1-exec", localId: "exec", type: "exec", dir: "out" },
        {
          id: "node-1-instigator",
          localId: "instigator",
          type: "object",
          dir: "out",
        },
      ],
    },
    {
      id: "node-2",
      nodeKey: "Cast_BP_Enemy",
      title: "Cast to BP_Enemy",
      type: "flow-node",
      x: 300,
      y: 100,
      pins: [
        { id: "node-2-exec", localId: "exec", type: "exec", dir: "in" },
        { id: "node-2-success", localId: "then", type: "exec", dir: "out" },
        {
          id: "node-2-failed",
          localId: "cast_failed",
          type: "exec",
          dir: "out",
          name: "Cast Failed",
        },
        { id: "node-2-object", localId: "object", type: "object", dir: "in" },
        {
          id: "node-2-result",
          localId: "as_enemy",
          type: "object",
          dir: "out",
        },
      ],
    },
    {
      id: "node-3",
      nodeKey: "ApplyDamage",
      title: "Apply Damage",
      type: "flow-node",
      x: 500,
      y: 100,
      pins: [
        { id: "node-3-exec", localId: "exec", type: "exec", dir: "in" },
        { id: "node-3-then", localId: "then", type: "exec", dir: "out" },
      ],
    },
  ],
  links: [
    { id: "link-1", startPinId: "node-1-exec", endPinId: "node-2-exec" },
    { id: "link-2", startPinId: "node-2-success", endPinId: "node-3-exec" },
    {
      id: "link-3",
      startPinId: "node-1-instigator",
      endPinId: "node-2-object",
    },
    // Note: Cast Failed pin is NOT connected - this is the bug!
  ],
};

/**
 * Scenario 3: Tick Abuse
 * Issue: Expensive operations in Event Tick
 */
export const SCENARIO_TICK_ABUSE = {
  name: "The Performance Killer",
  description: "This AI logic causes massive frame drops. Identify the issue.",
  difficulty: "Intermediate",
  expectedIssues: ["Expensive Operation in Tick", "Heavy Tick Usage"],
  nodes: [
    {
      id: "node-1",
      nodeKey: "EventTick",
      title: "Event Tick",
      type: "event",
      x: 100,
      y: 100,
      pins: [{ id: "node-1-exec", localId: "exec", type: "exec", dir: "out" }],
    },
    {
      id: "node-2",
      nodeKey: "GetAllActorsOfClass",
      title: "Get All Actors of Class",
      type: "flow-node",
      x: 300,
      y: 100,
      pins: [
        { id: "node-2-exec", localId: "exec", type: "exec", dir: "in" },
        { id: "node-2-then", localId: "then", type: "exec", dir: "out" },
      ],
    },
    {
      id: "node-3",
      nodeKey: "ForEachLoop",
      title: "For Each Loop",
      type: "flow-node",
      x: 500,
      y: 100,
      pins: [
        { id: "node-3-exec", localId: "exec", type: "exec", dir: "in" },
        { id: "node-3-body", localId: "body", type: "exec", dir: "out" },
      ],
    },
    {
      id: "node-4",
      nodeKey: "LineTraceByChannel",
      title: "Line Trace",
      type: "flow-node",
      x: 700,
      y: 200,
      pins: [
        { id: "node-4-exec", localId: "exec", type: "exec", dir: "in" },
        { id: "node-4-then", localId: "then", type: "exec", dir: "out" },
      ],
    },
  ],
  links: [
    { id: "link-1", startPinId: "node-1-exec", endPinId: "node-2-exec" },
    { id: "link-2", startPinId: "node-2-then", endPinId: "node-3-exec" },
    { id: "link-3", startPinId: "node-3-body", endPinId: "node-4-exec" },
  ],
};

/**
 * Scenario 4: Network Authority
 * Issue: Modifying state on client without server authority
 */
export const SCENARIO_NETWORK_AUTHORITY = {
  name: "The Multiplayer Desync",
  description: "Health pickups work for host but not clients. Find the bug.",
  difficulty: "Advanced",
  expectedIssues: ["Server Authority Required"],
  nodes: [
    {
      id: "node-1",
      nodeKey: "EventOnComponentBeginOverlap",
      title: "On Overlap",
      type: "event",
      x: 100,
      y: 100,
      pins: [
        { id: "node-1-exec", localId: "exec", type: "exec", dir: "out" },
        { id: "node-1-other", localId: "other", type: "object", dir: "out" },
      ],
    },
    {
      id: "node-2",
      nodeKey: "SetHealth",
      title: "Set Health",
      type: "flow-node",
      x: 300,
      y: 100,
      pins: [
        { id: "node-2-exec", localId: "exec", type: "exec", dir: "in" },
        { id: "node-2-then", localId: "then", type: "exec", dir: "out" },
      ],
    },
    {
      id: "node-3",
      nodeKey: "DestroyActor",
      title: "Destroy Actor",
      type: "flow-node",
      x: 500,
      y: 100,
      pins: [{ id: "node-3-exec", localId: "exec", type: "exec", dir: "in" }],
    },
  ],
  links: [
    { id: "link-1", startPinId: "node-1-exec", endPinId: "node-2-exec" },
    { id: "link-2", startPinId: "node-2-then", endPinId: "node-3-exec" },
    // Missing: Switch Has Authority check before SetHealth!
  ],
};

/**
 * Scenario 5: Orphaned Logic
 * Issue: Nodes not connected to execution flow
 */
export const SCENARIO_ORPHANED_NODES = {
  name: "The Dead Code Mystery",
  description:
    "Some of this score logic never executes. Find what's disconnected.",
  difficulty: "Beginner",
  expectedIssues: ["Orphaned Node"],
  nodes: [
    {
      id: "node-1",
      nodeKey: "EventBeginPlay",
      title: "Event BeginPlay",
      type: "event",
      x: 100,
      y: 100,
      pins: [{ id: "node-1-exec", localId: "exec", type: "exec", dir: "out" }],
    },
    {
      id: "node-2",
      nodeKey: "PrintString",
      title: "Print String",
      type: "flow-node",
      x: 300,
      y: 100,
      pins: [{ id: "node-2-exec", localId: "exec", type: "exec", dir: "in" }],
    },
    // This node is orphaned - not connected to any exec flow
    {
      id: "node-3",
      nodeKey: "SetScore",
      title: "Set Score",
      type: "flow-node",
      x: 300,
      y: 250,
      pins: [
        { id: "node-3-exec", localId: "exec", type: "exec", dir: "in" },
        { id: "node-3-then", localId: "then", type: "exec", dir: "out" },
      ],
    },
    {
      id: "node-4",
      nodeKey: "AddScore",
      title: "Add Score",
      type: "flow-node",
      x: 500,
      y: 250,
      pins: [{ id: "node-4-exec", localId: "exec", type: "exec", dir: "in" }],
    },
  ],
  links: [
    { id: "link-1", startPinId: "node-1-exec", endPinId: "node-2-exec" },
    { id: "link-2", startPinId: "node-3-then", endPinId: "node-4-exec" },
    // Note: node-3 has no input exec connection!
  ],
};

/**
 * All test scenarios
 */
export const TEST_SCENARIOS = [
  SCENARIO_NULL_REFERENCE,
  SCENARIO_CAST_FAILED,
  SCENARIO_TICK_ABUSE,
  SCENARIO_NETWORK_AUTHORITY,
  SCENARIO_ORPHANED_NODES,
];

/**
 * Get scenario by name
 */
export function getScenario(name) {
  return TEST_SCENARIOS.find((s) => s.name === name);
}

/**
 * Get scenarios by difficulty
 */
export function getScenariosByDifficulty(difficulty) {
  return TEST_SCENARIOS.filter((s) => s.difficulty === difficulty);
}
