/**
 * TraceExecutor - Handles Line Trace, Sphere Trace, Box Trace nodes
 * Simulates raycasting/collision detection for educational purposes
 */
import { BaseExecutor } from "./BaseExecutor.js";
import { Utils } from "../../utils.js";

export class TraceExecutor extends BaseExecutor {
  /**
   * Execute trace nodes (impure - have exec pins)
   */
  async execute(node) {
    switch (node.nodeKey) {
      case "LineTraceByChannel":
        return this.executeLineTrace(node);
      case "SphereTraceByChannel":
        return this.executeSphereTrace(node);
      case "BoxTraceByChannel":
        return this.executeBoxTrace(node);
      default:
        return null;
    }
  }

  /**
   * Evaluate pure trace nodes (BreakHitResult)
   */
  evaluateValue(node, pin) {
    if (node.nodeKey === "BreakHitResult") {
      return this.evaluateBreakHitResult(node, pin);
    }
    return null;
  }

  /**
   * Execute Line Trace By Channel
   * Simulates a raycast from start to end
   */
  executeLineTrace(node) {
    const start = Utils.parseVector(this.evaluateInput(node, "start_in"));
    const end = Utils.parseVector(this.evaluateInput(node, "end_in"));
    const channel = this.evaluateInput(node, "channel_in") || "Visibility";
    const traceComplex = this.evaluateInput(node, "trace_complex_in") || false;
    const ignoreSelf = this.evaluateInput(node, "ignore_self_in") !== false;

    // Simulate a trace hit (for educational demonstration)
    // In a real implementation, this would query a physics world
    const hit = this.simulateTrace("line", start, end, {
      channel,
      traceComplex,
      ignoreSelf,
    });

    // Store results on node for downstream evaluation
    node.tempValues = {
      hit_out: hit.didHit,
      hit_result_out: hit.result,
    };

    this.log(
      `LineTrace: ${hit.didHit ? "HIT" : "MISS"} from (${start.x}, ${
        start.y
      }, ${start.z}) to (${end.x}, ${end.y}, ${end.z})`,
      hit.didHit ? "info" : "warning"
    );

    return "exec_out";
  }

  /**
   * Execute Sphere Trace By Channel
   */
  executeSphereTrace(node) {
    const start = Utils.parseVector(this.evaluateInput(node, "start_in"));
    const end = Utils.parseVector(this.evaluateInput(node, "end_in"));
    const radius = parseFloat(this.evaluateInput(node, "radius_in")) || 32.0;
    const channel = this.evaluateInput(node, "channel_in") || "Visibility";
    const traceComplex = this.evaluateInput(node, "trace_complex_in") || false;
    const ignoreSelf = this.evaluateInput(node, "ignore_self_in") !== false;

    const hit = this.simulateTrace("sphere", start, end, {
      channel,
      traceComplex,
      ignoreSelf,
      radius,
    });

    node.tempValues = {
      hit_out: hit.didHit,
      hit_result_out: hit.result,
    };

    this.log(
      `SphereTrace (r=${radius}): ${hit.didHit ? "HIT" : "MISS"}`,
      hit.didHit ? "info" : "warning"
    );

    return "exec_out";
  }

  /**
   * Execute Box Trace By Channel
   */
  executeBoxTrace(node) {
    const start = Utils.parseVector(this.evaluateInput(node, "start_in"));
    const end = Utils.parseVector(this.evaluateInput(node, "end_in"));
    const halfSize = Utils.parseVector(
      this.evaluateInput(node, "half_size_in")
    );
    const orientation = Utils.parseRotator(
      this.evaluateInput(node, "orientation_in")
    );
    const channel = this.evaluateInput(node, "channel_in") || "Visibility";
    const traceComplex = this.evaluateInput(node, "trace_complex_in") || false;
    const ignoreSelf = this.evaluateInput(node, "ignore_self_in") !== false;

    const hit = this.simulateTrace("box", start, end, {
      channel,
      traceComplex,
      ignoreSelf,
      halfSize,
      orientation,
    });

    node.tempValues = {
      hit_out: hit.didHit,
      hit_result_out: hit.result,
    };

    this.log(
      `BoxTrace: ${hit.didHit ? "HIT" : "MISS"}`,
      hit.didHit ? "info" : "warning"
    );

    return "exec_out";
  }

  /**
   * Evaluate Break Hit Result - extracts components from hit struct
   */
  evaluateBreakHitResult(node, pin) {
    const hitResult = this.evaluateInput(node, "hit_in") || {};

    switch (pin.id) {
      case "blocking_hit_out":
        return hitResult.blockingHit || false;
      case "initial_overlap_out":
        return hitResult.initialOverlap || false;
      case "time_out":
        return hitResult.time || 0.0;
      case "distance_out":
        return hitResult.distance || 0.0;
      case "location_out":
        return hitResult.location || { x: 0, y: 0, z: 0 };
      case "impact_point_out":
        return hitResult.impactPoint || { x: 0, y: 0, z: 0 };
      case "normal_out":
        return hitResult.normal || { x: 0, y: 0, z: 1 };
      case "impact_normal_out":
        return hitResult.impactNormal || { x: 0, y: 0, z: 1 };
      case "hit_actor_out":
        return hitResult.hitActor || null;
      case "hit_component_out":
        return hitResult.hitComponent || null;
      case "hit_bone_name_out":
        return hitResult.hitBoneName || "None";
      default:
        return null;
    }
  }

  /**
   * Simulate a trace for educational purposes
   * In a real game engine, this would query the physics world
   */
  simulateTrace(type, start, end, _options) {
    // Calculate trace distance
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dz = end.z - start.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // For demonstration: simulate a hit at 50% of trace distance
    // with 30% probability (to show both hit and miss cases)
    const shouldHit = Math.random() < 0.3;

    if (!shouldHit) {
      return {
        didHit: false,
        result: {
          blockingHit: false,
          initialOverlap: false,
          time: 1.0,
          distance: distance,
          location: end,
          impactPoint: end,
          normal: { x: 0, y: 0, z: 1 },
          impactNormal: { x: 0, y: 0, z: 1 },
          hitActor: null,
          hitComponent: null,
          hitBoneName: "None",
        },
      };
    }

    // Simulate a hit at midpoint
    const hitTime = 0.5;
    const hitPoint = {
      x: start.x + dx * hitTime,
      y: start.y + dy * hitTime,
      z: start.z + dz * hitTime,
    };

    return {
      didHit: true,
      result: {
        blockingHit: true,
        initialOverlap: false,
        time: hitTime,
        distance: distance * hitTime,
        location: hitPoint,
        impactPoint: hitPoint,
        normal: { x: 0, y: 0, z: 1 },
        impactNormal: {
          x: -dx / distance,
          y: -dy / distance,
          z: -dz / distance,
        },
        hitActor: { name: "SimulatedActor", class: "Actor" },
        hitComponent: {
          name: "SimulatedComponent",
          class: "StaticMeshComponent",
        },
        hitBoneName: "None",
      },
    };
  }
}
