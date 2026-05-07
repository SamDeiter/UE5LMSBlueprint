import { BaseExecutor } from "./BaseExecutor.js";
import { interfaceRegistry } from "../../interfaces/InterfaceRegistry.js";
import { isInterfaceCompatible } from "../../core/TypeSystem.js";
import { getInterfaceImplGraphName } from "../../core/BlueprintAssetManager.js";

/**
 * InterfaceExecutor — runtime dispatch for Blueprint Interface nodes.
 *
 * Handles four node patterns:
 *   • Message_<Iface>_<Func>     → dispatch to target's implementation graph
 *   • Event_<Iface>_<Func>       → entry node inside an implementation graph
 *   • InterfaceFunctionEntry     → entry node inside an implementation graph
 *   • InterfaceFunctionResult    → captures return values
 *
 * Mirrors FunctionExecutor's call-stack pattern: push frame, switch graph,
 * inject inputs into entry node's tempValues, run flow, capture outputs from
 * the result node, pop frame, store outputs on the caller's tempValues.
 *
 * UE5 semantics: calling a Message on a target that doesn't implement the
 * interface is a silent no-op (warned in the log). The executor returns
 * type-default outputs and continues the caller's flow normally.
 */
export class InterfaceExecutor extends BaseExecutor {
  async execute(node) {
    if (node.nodeKey.startsWith("Message_")) {
      return await this.executeMessage(node);
    }
    if (node.nodeKey === "InterfaceFunctionResult") {
      return this.executeResult(node);
    }
    // Pass-through for entry nodes (Event_* and InterfaceFunctionEntry).
    // The flow engine starts execution AT them; their job is just to expose
    // input tempValues to downstream pins via evaluateValue.
    return null;
  }

  /**
   * Dispatch a Message node to the target's implementation graph.
   */
  async executeMessage(node) {
    const meta =
      node.customData ||
      this._parseInterfaceFromKey(node.nodeKey, "Message_");
    if (!meta) {
      this.log(
        `Error: Interface message node '${node.nodeKey}' is missing metadata.`,
        "error"
      );
      return "exec_out";
    }

    const { interfaceName, functionName } = meta;
    const iface = interfaceRegistry.get(interfaceName);
    const fn = iface ? iface.getFunction(functionName) : null;

    if (!iface || !fn) {
      this.log(
        `Error: Interface '${interfaceName}.${functionName}' not found.`,
        "error"
      );
      return "exec_out";
    }

    // 1. Evaluate target + inputs upfront.
    const target = this.evaluateInput(node, "target_in");
    const inputValues = {};
    for (const input of fn.inputs || []) {
      inputValues[input.name] = this.evaluateInput(node, `in_${input.name}`);
    }

    // 2. Resolve target's implementing Blueprint asset.
    const resolved = this._resolveImplementation(
      target,
      interfaceName,
      functionName
    );

    if (!resolved) {
      // Silent no-op — matches UE5. Log a warning so students can see why.
      this.log(
        `Interface message '${interfaceName}.${functionName}' had no effect: ` +
          `target does not implement ${interfaceName}.`,
        "warning"
      );
      this._writeDefaultOutputs(node, fn);
      return "exec_out";
    }

    // 3. Push call-stack frame and switch to implementation graph.
    const callerGraph = this.app.activeGraph;
    this.engine.callStack.push({
      callerGraph,
      callerNodeId: node.id,
      localVariables: {},
    });

    this.app.switchGraph(resolved.implGraphName);

    // 4. Find entry node (either InterfaceFunctionEntry or Event_<Iface>_<Func>)
    //    and inject input values.
    const entryNode = [...this.app.graph.nodes.values()].find((n) => {
      if (n.nodeKey === "InterfaceFunctionEntry") return true;
      if (n.nodeKey === `Event_${interfaceName}_${functionName}`) return true;
      return false;
    });

    if (!entryNode) {
      this.log(
        `Error: No entry node found in '${resolved.implGraphName}'. ` +
          `Expected an InterfaceFunctionEntry or Event_${interfaceName}_${functionName}.`,
        "error"
      );
      this.app.switchGraph(callerGraph);
      this.engine.callStack.pop();
      this._writeDefaultOutputs(node, fn);
      return "exec_out";
    }

    entryNode.tempValues = {};
    for (const input of fn.inputs || []) {
      entryNode.tempValues[input.name] = inputValues[input.name];
    }

    // 5. Run the implementation flow.
    await this.engine.executeFlow(entryNode);

    // 6. Pull captured return values (set by InterfaceFunctionResult).
    const returnValues = this.engine.functionReturnValues || {};
    this.engine.functionReturnValues = null;

    // 7. Restore caller context.
    this.app.switchGraph(callerGraph);
    this.engine.callStack.pop();

    // 8. Surface outputs on the call node so downstream nodes can read them.
    node.tempValues = {};
    for (const output of fn.outputs || []) {
      node.tempValues[`out_${output.name}`] =
        returnValues[output.name] !== undefined
          ? returnValues[output.name]
          : this._typeDefault(output.type);
    }

    return "exec_out";
  }

  /**
   * Capture return values from an InterfaceFunctionResult node.
   * Same shape as FunctionExecutor.executeFunctionResult — reads input pins
   * by name, stores them on engine.functionReturnValues for the Message
   * dispatcher to pick up after the flow completes.
   */
  executeResult(node) {
    const ifaceName = this._currentImplInterface();
    const fnName = this._currentImplFunction();
    if (!ifaceName || !fnName) return null;

    const iface = interfaceRegistry.get(ifaceName);
    const fn = iface ? iface.getFunction(fnName) : null;
    if (!fn) return null;

    this.engine.functionReturnValues = {};
    for (const output of fn.outputs || []) {
      const pin = node.pins.find(
        (p) => p.name === output.name && p.dir === "in"
      );
      if (pin) {
        this.engine.functionReturnValues[output.name] = this.engine.evaluatePin(
          pin
        );
      }
    }
    return null; // end of flow
  }

  /**
   * Pure-data evaluation: entry-node output pins read from tempValues
   * (injected by executeMessage), Message output pins read from tempValues
   * (set after dispatch returns).
   */
  evaluateValue(node, _pin) {
    // DoesImplementInterface is a pure runtime predicate.
    if (node.nodeKey === "DoesImplementInterface") {
      const obj = this.evaluateInput(node, "object_in");
      const ifaceName = this.evaluateInput(node, "interface_name_in");
      return isInterfaceCompatible(obj, ifaceName);
    }

    if (!node.tempValues) return null;

    if (
      node.nodeKey === "InterfaceFunctionEntry" ||
      node.nodeKey.startsWith("Event_")
    ) {
      // Entry pins: keyed by input name (matches what executeMessage injected).
      if (node.tempValues[_pin.name] !== undefined) {
        return node.tempValues[_pin.name];
      }
    }

    if (node.nodeKey.startsWith("Message_")) {
      // Output pins are stored under their pin id (out_<Name>).
      if (node.tempValues[_pin.id] !== undefined) {
        return node.tempValues[_pin.id];
      }
      if (node.tempValues[_pin.name] !== undefined) {
        return node.tempValues[_pin.name];
      }
    }

    return null;
  }

  // --- helpers ------------------------------------------------------------

  _parseInterfaceFromKey(nodeKey, prefix) {
    if (!nodeKey.startsWith(prefix)) return null;
    const rest = nodeKey.substring(prefix.length);
    // Find the interface name by trying every registered interface (handles
    // names that contain underscores). Falls back to first-underscore split.
    for (const iface of interfaceRegistry.getAll()) {
      const ifacePrefix = `${iface.name}_`;
      if (rest.startsWith(ifacePrefix)) {
        return {
          interfaceName: iface.name,
          functionName: rest.substring(ifacePrefix.length),
        };
      }
    }
    const idx = rest.indexOf("_");
    if (idx === -1) return null;
    return {
      interfaceName: rest.substring(0, idx),
      functionName: rest.substring(idx + 1),
    };
  }

  /**
   * Find the implementation graph for (target, interface, function).
   *
   * Strategy: the active app + the BlueprintAssetManager are the source of
   * truth. We support two target shapes:
   *   1. A runtime object whose `_implementingAssetId` points to an asset
   *      with a graph keyed `Interface_<Iface>_<Func>`.
   *   2. The "self" case: target is null/the active asset, and the active
   *      asset declares it implements the interface. Calling a message on
   *      `self` is a common student pattern.
   *
   * Returns { implGraphName, asset } or null if no implementation exists.
   */
  _resolveImplementation(target, ifaceName, fnName) {
    const graphName = getInterfaceImplGraphName(ifaceName, fnName);
    const assetManager = this.app.assetManager || this.app.blueprintAssetManager;

    // Case 1: runtime object carries _implementingAssetId.
    if (target && target._implementingAssetId && assetManager) {
      const asset = assetManager.getAsset(target._implementingAssetId);
      if (
        asset &&
        asset.implementsInterface &&
        asset.implementsInterface(ifaceName) &&
        asset.graphs.has(graphName)
      ) {
        return { implGraphName: graphName, asset };
      }
    }

    // Case 1b: runtime object with _interfaces tag but no asset link —
    // fall through to "active asset" if it's a self-call.
    if (target && isInterfaceCompatible(target, ifaceName) && assetManager) {
      const activeAsset = assetManager.getAsset(assetManager.activeAssetId);
      if (
        activeAsset &&
        activeAsset.implementsInterface &&
        activeAsset.implementsInterface(ifaceName) &&
        activeAsset.graphs.has(graphName)
      ) {
        return { implGraphName: graphName, asset: activeAsset };
      }
    }

    // Case 2: self-call fallback. If the target is null/undefined and the
    // active asset implements this interface, dispatch to its own impl graph.
    if (!target && assetManager) {
      const activeAsset = assetManager.getAsset(assetManager.activeAssetId);
      if (
        activeAsset &&
        activeAsset.implementsInterface &&
        activeAsset.implementsInterface(ifaceName) &&
        activeAsset.graphs.has(graphName)
      ) {
        return { implGraphName: graphName, asset: activeAsset };
      }
    }

    // Case 3: legacy single-graph mode (no asset manager). If the active
    // graph store has a key matching the impl graph name, use it.
    if (this.app.graphs && this.app.graphs[graphName]) {
      return { implGraphName: graphName, asset: null };
    }

    return null;
  }

  _writeDefaultOutputs(node, fn) {
    node.tempValues = {};
    for (const output of fn.outputs || []) {
      node.tempValues[`out_${output.name}`] = this._typeDefault(output.type);
    }
  }

  _typeDefault(type) {
    switch (type) {
      case "bool":
        return false;
      case "int":
      case "int64":
      case "byte":
      case "float":
        return 0;
      case "string":
      case "name":
      case "text":
        return "";
      default:
        return null;
    }
  }

  _currentImplInterface() {
    const g = this.app.activeGraph;
    if (!g || !g.startsWith("Interface_")) return null;
    const rest = g.substring("Interface_".length);
    for (const iface of interfaceRegistry.getAll()) {
      if (rest.startsWith(`${iface.name}_`)) return iface.name;
    }
    return null;
  }

  _currentImplFunction() {
    const g = this.app.activeGraph;
    const iface = this._currentImplInterface();
    if (!g || !iface) return null;
    return g.substring(`Interface_${iface}_`.length);
  }
}
