import { BaseExecutor } from './BaseExecutor.js';
import { Utils } from '../../utils.js';

/**
 * Handles Vector, Rotator, and Transform operations.
 */
export class VectorExecutor extends BaseExecutor {
    /**
     * Pure nodes, so execute() is not used.
     */
    async execute(node) {
        return null;
    }

    /**
     * Evaluate vector/rotator/transform operations
     */
    evaluateValue(node, pin) {
        switch (node.nodeKey) {
            // --- VECTOR MATH ---
            case 'MakeVector': {
                const x = parseFloat(this.evaluateInput(node, 'x_in')) || 0;
                const y = parseFloat(this.evaluateInput(node, 'y_in')) || 0;
                const z = parseFloat(this.evaluateInput(node, 'z_in')) || 0;
                return { x, y, z };
            }
            case 'BreakVector': {
                const vec = Utils.parseVector(this.evaluateInput(node, 'vec_in'));
                if (pin.id === 'x_out') return vec.x;
                if (pin.id === 'y_out') return vec.y;
                if (pin.id === 'z_out') return vec.z;
                return null;
            }
            case 'AddVector': {
                const a = Utils.parseVector(this.evaluateInput(node, 'a_in'));
                const b = Utils.parseVector(this.evaluateInput(node, 'b_in'));
                return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
            }
            case 'SubtractVector': {
                const a = Utils.parseVector(this.evaluateInput(node, 'a_in'));
                const b = Utils.parseVector(this.evaluateInput(node, 'b_in'));
                return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
            }
            case 'MultiplyVectorFloat': {
                const a = Utils.parseVector(this.evaluateInput(node, 'a_in'));
                const b = parseFloat(this.evaluateInput(node, 'b_in'));
                return { x: a.x * b, y: a.y * b, z: a.z * b };
            }
            case 'DivideVectorFloat': {
                const a = Utils.parseVector(this.evaluateInput(node, 'a_in'));
                const b = parseFloat(this.evaluateInput(node, 'b_in'));
                const div = b !== 0 ? b : 1; // Prevent divide by zero
                return { x: a.x / div, y: a.y / div, z: a.z / div };
            }
            case 'DotProduct': {
                const a = Utils.parseVector(this.evaluateInput(node, 'a_in'));
                const b = Utils.parseVector(this.evaluateInput(node, 'b_in'));
                return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
            }
            case 'CrossProduct': {
                const a = Utils.parseVector(this.evaluateInput(node, 'a_in'));
                const b = Utils.parseVector(this.evaluateInput(node, 'b_in'));
                return {
                    x: a.y * b.z - a.z * b.y,
                    y: a.z * b.x - a.x * b.z,
                    z: a.x * b.y - a.y * b.x
                };
            }
            case 'VectorLength': {
                const a = Utils.parseVector(this.evaluateInput(node, 'a_in'));
                return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
            }
            case 'VectorDistance': {
                const a = Utils.parseVector(this.evaluateInput(node, 'a_in'));
                const b = Utils.parseVector(this.evaluateInput(node, 'b_in'));
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dz = a.z - b.z;
                return Math.sqrt(dx * dx + dy * dy + dz * dz);
            }
            case 'NormalizeVector': {
                const a = Utils.parseVector(this.evaluateInput(node, 'a_in'));
                const len = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
                const div = len !== 0 ? len : 1;
                return { x: a.x / div, y: a.y / div, z: a.z / div };
            }

            // --- ROTATOR MATH ---
            case 'MakeRotator': {
                const roll = parseFloat(this.evaluateInput(node, 'roll_in')) || 0;
                const pitch = parseFloat(this.evaluateInput(node, 'pitch_in')) || 0;
                const yaw = parseFloat(this.evaluateInput(node, 'yaw_in')) || 0;
                return { roll, pitch, yaw };
            }
            case 'BreakRotator': {
                const rot = Utils.parseRotator(this.evaluateInput(node, 'rot_in'));
                if (pin.id === 'roll_out') return rot.roll;
                if (pin.id === 'pitch_out') return rot.pitch;
                if (pin.id === 'yaw_out') return rot.yaw;
                return null;
            }

            // --- TRANSFORM MATH ---
            case 'MakeTransform': {
                const loc = Utils.parseVector(this.evaluateInput(node, 'loc_in'));
                const rot = Utils.parseRotator(this.evaluateInput(node, 'rot_in'));
                const scale = Utils.parseVector(this.evaluateInput(node, 'scale_in')) || { x: 1, y: 1, z: 1 };
                return { location: loc, rotation: rot, scale: scale };
            }
            case 'BreakTransform': {
                const trans = Utils.parseTransform(this.evaluateInput(node, 'trans_in'));
                if (pin.id === 'loc_out') return trans.location;
                if (pin.id === 'rot_out') return trans.rotation;
                if (pin.id === 'scale_out') return trans.scale;
                return null;
            }

            default:
                return null;
        }
    }
}
