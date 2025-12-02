import { BaseExecutor } from './BaseExecutor.js';

/**
 * Handles execution of Actor-related nodes.
 * Simulates actor lifecycle and transform operations.
 */
export class ActorExecutor extends BaseExecutor {
    constructor(engine) {
        super(engine);
        // Initialize actor storage in engine if not present
        if (!this.engine.actors) {
            this.engine.actors = new Map();
            this.engine.nextActorId = 1;
        }
    }

    async execute(node) {
        switch (node.nodeKey) {
            case 'SpawnActorFromClass':
                return this.executeSpawnActor(node);
            case 'DestroyActor':
                return this.executeDestroyActor(node);
            case 'SetActorLocation':
                return this.executeSetActorLocation(node);
            case 'SetActorRotation':
                return this.executeSetActorRotation(node);
            default:
                return 'exec_out';
        }
    }

    evaluateValue(node, pin) {
        switch (node.nodeKey) {
            case 'GetActorLocation':
                return this.evaluateGetActorLocation(node);
            case 'GetActorRotation':
                return this.evaluateGetActorRotation(node);
            default:
                return null;
        }
    }

    executeSpawnActor(node) {
        const actorClass = this.evaluateInput(node, 'class');
        const transform = this.evaluateInput(node, 'spawn_transform');
        // Handle collision handling override if needed

        const actorId = `Actor_${this.engine.nextActorId++}`;

        // Parse transform if it's a string representation
        let location = { x: 0, y: 0, z: 0 };
        let rotation = { roll: 0, pitch: 0, yaw: 0 };
        let scale = { x: 1, y: 1, z: 1 };

        if (typeof transform === 'string') {
            // Basic parsing logic for "(0,0,0) | (R=0,P=0,Y=0) | (1,1,1)"
            // For now, we'll just default if parsing fails or implement a proper parser util
            // This is a placeholder for robust transform parsing
        } else if (transform && typeof transform === 'object') {
            // If passed as object
            location = transform.location || location;
            rotation = transform.rotation || rotation;
            scale = transform.scale || scale;
        }

        const newActor = {
            id: actorId,
            class: actorClass || 'Actor',
            location: location,
            rotation: rotation,
            scale: scale,
            isDestroyed: false
        };

        this.engine.actors.set(actorId, newActor);
        this.log(`Spawned ${newActor.class} (${actorId}) at ${this.formatVector(location)}`, 'success');

        // Store the spawned actor in the node's temp values so the output pin can retrieve it
        // The output pin is 'return_value'
        node.tempValues = { return_value: newActor };

        return 'exec_out';
    }

    executeDestroyActor(node) {
        const target = this.evaluateInput(node, 'target');

        if (target && target.id && this.engine.actors.has(target.id)) {
            const actor = this.engine.actors.get(target.id);
            actor.isDestroyed = true;
            this.engine.actors.delete(target.id);
            this.log(`Destroyed Actor: ${target.id}`, 'warning');
        } else {
            this.log(`DestroyActor: Invalid target or actor already destroyed`, 'error');
        }

        return 'exec_out';
    }

    executeSetActorLocation(node) {
        const target = this.evaluateInput(node, 'target');
        const newLocation = this.evaluateInput(node, 'new_location');
        const sweep = this.evaluateInput(node, 'sweep');
        const teleport = this.evaluateInput(node, 'teleport');

        if (target && target.id && this.engine.actors.has(target.id)) {
            const actor = this.engine.actors.get(target.id);

            // Update location
            // Assuming newLocation is {x, y, z} or string
            // For simulation, we just update the state
            actor.location = newLocation; // simplified

            this.log(`${target.id} location set to ${this.formatVector(newLocation)}`);

            // Output 'return_value' (bool) - usually true if successful
            node.tempValues = { return_value: true };
        } else {
            this.log(`SetActorLocation: Invalid target`, 'error');
            node.tempValues = { return_value: false };
        }

        return 'exec_out';
    }

    executeSetActorRotation(node) {
        const target = this.evaluateInput(node, 'target');
        const newRotation = this.evaluateInput(node, 'new_rotation');
        const teleport = this.evaluateInput(node, 'teleport');

        if (target && target.id && this.engine.actors.has(target.id)) {
            const actor = this.engine.actors.get(target.id);
            actor.rotation = newRotation;
            this.log(`${target.id} rotation set to ${this.formatRotator(newRotation)}`);
            node.tempValues = { return_value: true };
        } else {
            this.log(`SetActorRotation: Invalid target`, 'error');
            node.tempValues = { return_value: false };
        }

        return 'exec_out';
    }

    evaluateGetActorLocation(node) {
        const target = this.evaluateInput(node, 'target');
        if (target && target.id && this.engine.actors.has(target.id)) {
            return this.engine.actors.get(target.id).location;
        }
        return { x: 0, y: 0, z: 0 }; // Default
    }

    evaluateGetActorRotation(node) {
        const target = this.evaluateInput(node, 'target');
        if (target && target.id && this.engine.actors.has(target.id)) {
            return this.engine.actors.get(target.id).rotation;
        }
        return { roll: 0, pitch: 0, yaw: 0 }; // Default
    }

    // Helpers
    formatVector(v) {
        if (!v) return '(0, 0, 0)';
        if (typeof v === 'string') return v;
        return `(${v.x?.toFixed(1) || 0}, ${v.y?.toFixed(1) || 0}, ${v.z?.toFixed(1) || 0})`;
    }

    formatRotator(r) {
        if (!r) return '(R=0, P=0, Y=0)';
        if (typeof r === 'string') return r;
        return `(R=${r.roll?.toFixed(1) || 0}, P=${r.pitch?.toFixed(1) || 0}, Y=${r.yaw?.toFixed(1) || 0})`;
    }
}
