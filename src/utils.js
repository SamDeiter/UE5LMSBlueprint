/**
 * Utility class for helper functions and constants.
 * Contains the NodeLibrary definition and styling helpers.
 */
import { PIN_TYPES, PIN_COLORS, VARIABLE_HEADER_COLORS, PIN_TYPE_CLASSES } from './config/Constants.js';

class Utils {
    /**
     * Generates a unique ID string.
     * @param {string} [prefix='id'] - A prefix for the ID.
     * @returns {string} A unique ID.
     */
    static uniqueId(prefix = 'id') {
        return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Maps a logical type (e.g., 'float') to its CSS class name (e.g., 'float-pin').
     * @param {string} type - The logical pin type.
     * @returns {string} The corresponding CSS class.
     */
    static getPinTypeClass(type) {
        return PIN_TYPE_CLASSES[type.toLowerCase()] || PIN_TYPE_CLASSES.DEFAULT;
    }

    /**
     * Gets the CSS variable color for a given pin type.
     * @param {string} type - The logical pin type.
     * @returns {string} The CSS color variable string.
     */
    static getPinColor(type) {
        return PIN_COLORS[type.toLowerCase()] || PIN_COLORS.DEFAULT;
    }

    /**
     * Gets the UE5 style header gradient for a specific variable type.
     * @param {string} type - The variable type (e.g., 'bool', 'int').
     * @returns {{start: string, end: string}} The gradient start and end colors.
     */
    static getVariableHeaderColor(type) {
        return VARIABLE_HEADER_COLORS[type.toLowerCase()] || VARIABLE_HEADER_COLORS.DEFAULT;
    }

    /**
     * Calculates the SVG 'd' attribute for a Bézier curve wire.
     * @param {number} x1 - Start X coordinate.
     * @param {number} y1 - Start Y coordinate.
     * @param {number} x2 - End X coordinate.
     * @param {number} y2 - End Y coordinate.
     * @returns {string} The SVG path data string.
     */
    static getWirePath(x1, y1, x2, y2) {
        const distanceX = x2 - x1;
        const absDx = Math.abs(distanceX);
        const dx = Math.max(absDx * 0.5, 50);

        const cp1x = x1 + dx;
        const cp1y = y1;
        const cp2x = x2 - dx;
        const cp2y = y2;

        return `M ${x1},${y1} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
    }

    /**
     * Gets the center position of a pin element in unscaled "world" coordinates.
     * @param {HTMLElement} pinElement - The .pin-dot DOM element.
     * @param {object} app - The main BlueprintApp object.
     * @returns {{x: number, y: number}} The world-space coordinates.
     */
    static getPinPosition(pinElement, app) {
        if (!pinElement) return { x: 0, y: 0 };

        const pinRect = pinElement.getBoundingClientRect();
        const graphRect = app.graph.editor.getBoundingClientRect();
        const zoom = app.graph.zoom;

        const cx = pinRect.left + pinRect.width / 2;
        const cy = pinRect.top + pinRect.height / 2;

        const worldX = (cx - graphRect.left - app.graph.pan.x) / zoom;
        const worldY = (cy - graphRect.top - app.graph.pan.y) / zoom;

        return { x: worldX, y: worldY };
    }

    /**
     * Returns the node key for an automatic conversion node between two types, if one exists.
     */
    static getConversionNodeKey(sourceType, targetType) {
        const key = `${sourceType}->${targetType}`;
        const conversions = {
            'float->string': 'Conv_FloatToString',
            'int->string': 'Conv_IntToString',
            'bool->string': 'Conv_BoolToString',
            'byte->string': 'Conv_ByteToString',
            'name->string': 'Conv_NameToString',
            'text->string': 'Conv_TextToString',
            'int->float': 'Conv_IntToFloat',
            'byte->int': 'Conv_ByteToInt',
            'vector->string': 'Conv_VectorToString',
            'rotator->string': 'Conv_RotatorToString',
            'transform->string': 'Conv_TransformToString',
        };
        return conversions[key] || null;
    }
    /**
     * Checks if a pin type supports an inline input widget (literal value).
     * @param {string} type - The logical pin type.
     * @returns {boolean} True if the pin type supports an input widget.
     */
    static canHaveInputWidget(type) {
        const supportedTypes = ['bool', 'byte', 'int', 'int64', 'float', 'name', 'string', 'text', 'vector', 'rotator', 'transform'];
        return supportedTypes.includes(type.toLowerCase());
    }
    /**
     * Checks if two pin types are compatible for connection.
     * Handles inheritance-like logic for components and objects.
     * @param {string} sourceType - The type of the output pin.
     * @param {string} targetType - The type of the input pin.
     * @returns {boolean} True if compatible.
     */
    static isTypeCompatible(sourceType, targetType) {
        if (!sourceType || !targetType) return false;
        const s = sourceType.toLowerCase();
        const t = targetType.toLowerCase();

        // Exact match
        if (s === t) return true;

        // Exec to Exec
        if (s === 'exec' && t === 'exec') return true;

        // Wildcard support
        if (s === 'wildcard' || t === 'wildcard') return true;

        // Object Inheritance Logic
        // All components are Objects
        if (t === 'object' && s.includes('component')) return true;

        // Component Hierarchy Definition
        // Child -> Parent
        const hierarchy = {
            // Lights
            'pointlightcomponent': 'lightcomponent',
            'spotlightcomponent': 'pointlightcomponent',
            'directionallightcomponent': 'lightcomponent',
            'lightcomponent': 'scenecomponent',

            // Meshes
            'staticmeshcomponent': 'meshcomponent',
            'skeletalmeshcomponent': 'meshcomponent',
            'meshcomponent': 'primitivecomponent',

            // Shapes / Collision
            'boxcomponent': 'shapecomponent',
            'spherecomponent': 'shapecomponent',
            'capsulecomponent': 'shapecomponent',
            'shapecomponent': 'primitivecomponent',
            'primitivecomponent': 'scenecomponent',

            // Camera
            'cameracomponent': 'scenecomponent',
            'springarmcomponent': 'scenecomponent',

            // Audio
            'audiocomponent': 'scenecomponent',

            // General
            'scenecomponent': 'actorcomponent',
            'actorcomponent': 'object'
        };

        // Traverse up the hierarchy from source to see if we hit target
        let current = s;
        while (hierarchy[current]) {
            current = hierarchy[current];
            if (current === t) return true;
        }

        return false;
    }

    /**
     * Parses a Vector string "(x,y,z)" into an object {x,y,z}.
     */
    static parseVector(value) {
        const str = String(value).replace(/[()]/g, '').trim();
        const parts = str.split(',').map(p => parseFloat(p.trim()) || 0);
        return {
            x: parts[0] || 0,
            y: parts[1] || 0,
            z: parts[2] || 0
        };
    }

    /**
     * Parses a Rotator string "(R=...,P=...,Y=...)" or "(x,y,z)" into {roll, pitch, yaw}.
     */
    static parseRotator(value) {
        let str = String(value).trim();
        // Handle (R=0,P=0,Y=0) format
        if (str.includes('R=') || str.includes('P=') || str.includes('Y=')) {
            str = str.replace(/[()]/g, '');
            const parts = str.split(',');
            let r = 0, p = 0, y = 0;
            parts.forEach(part => {
                const [k, v] = part.split('=').map(s => s.trim());
                const val = parseFloat(v) || 0;
                if (k === 'R') r = val;
                if (k === 'P') p = val;
                if (k === 'Y') y = val;
            });
            return { roll: r, pitch: p, yaw: y };
        }
        // Handle simple csv (x,y,z) mapping to (roll, pitch, yaw)
        const v = this.parseVector(value);
        return { roll: v.x, pitch: v.y, yaw: v.z };
    }

    /**
     * Parses a Transform string.
     * Simplified format: "T(Loc(x,y,z)|Rot(r,p,y)|Scale(x,y,z))" or just returns defaults if parsing fails.
     * For this MVP, we might just store it as a JSON object or a specific string format.
     * Let's use a JSON-like structure or a custom string format.
     * Format: "Loc(0,0,0) Rot(0,0,0) Scale(1,1,1)"
     */
    static parseTransform(value) {
        // If it's already an object, return it
        if (typeof value === 'object' && value !== null) return value;

        const str = String(value).trim();

        // Expected format: (0,0,0|0,0,0|1,1,1) or similar
        // Split by pipe |
        // Remove outer parens if present
        const cleanStr = str.replace(/^[()]+|[()]+$/g, '');
        const parts = cleanStr.split('|');

        if (parts.length === 3) {
            return {
                location: this.parseVector(parts[0]),
                rotation: this.parseRotator(parts[1]),
                scale: this.parseVector(parts[2])
            };
        }

        // Default fallback
        return {
            location: { x: 0, y: 0, z: 0 },
            rotation: { roll: 0, pitch: 0, yaw: 0 },
            scale: { x: 1, y: 1, z: 1 }
        };
    }
}

export { Utils };
