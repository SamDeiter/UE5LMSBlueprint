/**
 * BlueprintValidator.js - Validates Blueprint integrity and consistency
 * Used for verifying graph state, detecting issues, and preparing for save
 */

/**
 * Validation result object
 */
export class ValidationResult {
  constructor() {
    this.isValid = true;
    this.errors = [];
    this.warnings = [];
  }

  addError(message, details = null) {
    this.isValid = false;
    this.errors.push({ message, details });
  }

  addWarning(message, details = null) {
    this.warnings.push({ message, details });
  }
}

/**
 * Validate a graph's nodes and links
 * @param {Object} graphData - Graph data with nodes and links
 * @returns {ValidationResult}
 */
export function validateGraph(graphData) {
  const result = new ValidationResult();
  const { nodes = [], links = [] } = graphData;

  // Create node ID set for quick lookup
  const nodeIds = new Set(nodes.map((n) => n.id));

  // Validate nodes
  nodes.forEach((node, index) => {
    if (!node.id) {
      result.addError(`Node at index ${index} has no ID`);
    }
    if (!node.nodeKey) {
      result.addError(`Node ${node.id} has no nodeKey`);
    }
    if (typeof node.x !== "number" || typeof node.y !== "number") {
      result.addWarning(`Node ${node.id} has invalid position`, {
        x: node.x,
        y: node.y,
      });
    }
  });

  // Validate links
  links.forEach((link, index) => {
    if (!link.id) {
      result.addError(`Link at index ${index} has no ID`);
    }
    if (!link.startPinId || !link.endPinId) {
      result.addError(`Link ${link.id} has missing pin references`);
    }

    // Check if pin references valid nodes
    const startNodeId = extractNodeIdFromPinId(link.startPinId);
    const endNodeId = extractNodeIdFromPinId(link.endPinId);

    if (!nodeIds.has(startNodeId)) {
      result.addError(
        `Link ${link.id} references non-existent node ${startNodeId}`
      );
    }
    if (!nodeIds.has(endNodeId)) {
      result.addError(
        `Link ${link.id} references non-existent node ${endNodeId}`
      );
    }
  });

  return result;
}

/**
 * Validate variables
 * @param {Array} variables - Variables array
 * @returns {ValidationResult}
 */
export function validateVariables(variables) {
  const result = new ValidationResult();
  const names = new Set();

  variables = Array.isArray(variables) ? variables : [];

  variables.forEach((variable, index) => {
    if (!variable.id) {
      result.addError(`Variable at index ${index} has no ID`);
    }
    if (!variable.name) {
      result.addError(`Variable ${variable.id} has no name`);
    }
    if (names.has(variable.name)) {
      result.addError(`Duplicate variable name: ${variable.name}`);
    }
    names.add(variable.name);

    if (!variable.type) {
      result.addWarning(`Variable ${variable.name} has no type`);
    }
  });

  return result;
}

/**
 * Validate entire Blueprint state
 * @param {Object} state - Full Blueprint state
 * @returns {ValidationResult}
 */
export function validateBlueprintState(state) {
  const result = new ValidationResult();

  if (!state) {
    result.addError("State is null or undefined");
    return result;
  }

  // Validate graphs
  if (state.graphs) {
    Object.entries(state.graphs).forEach(([name, graphData]) => {
      const graphResult = validateGraph(graphData);
      graphResult.errors.forEach((e) => {
        result.addError(`[${name}] ${e.message}`, e.details);
      });
      graphResult.warnings.forEach((w) => {
        result.addWarning(`[${name}] ${w.message}`, w.details);
      });
    });
  }

  // Validate variables
  if (state.variables) {
    const varsArray = Array.isArray(state.variables)
      ? state.variables
      : Object.values(state.variables);
    const varResult = validateVariables(varsArray);
    varResult.errors.forEach((e) => result.addError(e.message, e.details));
    varResult.warnings.forEach((w) => result.addWarning(w.message, w.details));
  }

  return result;
}

/**
 * Extract node ID from pin ID (format: "nodeId-pinLocalId")
 * @param {string} pinId - Full pin ID
 * @returns {string} Node ID
 */
function extractNodeIdFromPinId(pinId) {
  if (!pinId) return null;
  // GUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-pinName
  // We need to extract the GUID part
  const parts = pinId.split("-");
  if (parts.length >= 5) {
    // Reconstruct GUID from first 5 parts
    return parts.slice(0, 5).join("-");
  }
  return null;
}

/**
 * Find orphaned nodes (disconnected from any exec flow)
 * @param {Object} graphData - Graph data
 * @returns {string[]} Array of orphaned node IDs
 */
export function findOrphanedNodes(graphData) {
  const { nodes = [], links = [] } = graphData;
  const connectedNodeIds = new Set();

  // Mark all nodes that are connected via exec pins
  links.forEach((link) => {
    if (link.startPinId?.includes("exec") || link.endPinId?.includes("exec")) {
      connectedNodeIds.add(extractNodeIdFromPinId(link.startPinId));
      connectedNodeIds.add(extractNodeIdFromPinId(link.endPinId));
    }
  });

  // Find event nodes (always considered connected)
  nodes.forEach((node) => {
    if (
      node.nodeKey?.startsWith("Event") ||
      node.nodeKey === "ConstructionScript"
    ) {
      connectedNodeIds.add(node.id);
    }
  });

  // Return nodes not in connected set (excluding pure nodes which don't need exec)
  return nodes
    .filter(
      (node) => !connectedNodeIds.has(node.id) && node.type !== "pure-node"
    )
    .map((node) => node.id);
}
