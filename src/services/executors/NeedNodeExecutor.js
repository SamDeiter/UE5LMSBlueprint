/* eslint-disable no-undef */
import { BaseExecutor } from './BaseExecutor.js';
import { GraphValidator } from '../GraphValidator.js';
import { scormClient } from '../ScormClient.js';

/**
 * Handles NeedNode assessment nodes
 */
export class NeedNodeExecutor extends BaseExecutor {
    async execute(node) {
        if (node.nodeKey === 'NeedNode') {
            const needData = node.customData ? node.customData.needNodeData : null;
            if (!needData) {
                console.warn(`NeedNode ${node.id} has no configuration data.`);
                return 'exec_out';
            }

            // 1. Validate Criteria
            const validator = new GraphValidator(this.app);
            const results = validator.validate(needData.criteria);

            // 2. Calculate Score
            const total = results.length;
            const passedCount = results.filter(r => r.passed).length;
            const score = total > 0 ? Math.round((passedCount / total) * 100) : 0;
            const passed = score >= (needData.passThreshold || 80);

            console.log(`[NeedNode] Executed. Score: ${score}%, Passed: ${passed}`);

            // 3. Report to SCORM
            if (scormClient) {
                scormClient.setScore(score, 100, 0);
                if (passed) {
                    scormClient.setSuccess('passed');
                    scormClient.setCompletion('completed');
                } else {
                    scormClient.setSuccess('failed');
                    scormClient.setCompletion('incomplete');
                }
                scormClient.save();
            }

            // 4. Update Output Pins (Runtime Values)
            // We need a way to set output values for the next nodes to read.
            // In this simplified engine, we can store them on the node itself or a runtime state map.
            // For now, let's store them in pinLiterals which act as the "current value" for outputs in this engine.
            const scorePin = node.findPinById(`${node.id}-score_out`);
            const passedPin = node.findPinById(`${node.id}-passed_out`);

            if (scorePin) node.pinLiterals.set(scorePin.id, score);
            if (passedPin) node.pinLiterals.set(passedPin.id, passed);

            // 5. Visual Feedback (Optional but good)
            node.devWarning = passed ? "Assessment Passed!" : "Assessment Failed";
            this.app.wiring.updateVisuals(node);

            return 'exec_out';
        }

        return null;
    }
}
