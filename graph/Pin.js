/**
 * Pin class - Represents a single data pin on a node.
 */


class Pin {
    constructor(node, pinData) {
        this.id = pinData.id.includes(node.id) ? pinData.id : `${node.id}-${pinData.id}`;
        this.node = node;
        this.name = pinData.name;
        this.type = (pinData.type || '').toLowerCase(); // Safe lowercasing
        this.dir = pinData.dir;
        this.element = null;
        this.links = [];
        this.containerType = pinData.containerType || 'single';
        this.defaultValue = pinData.defaultValue !== undefined ? pinData.defaultValue : this.getDefaultValue();
        this.isCustom = pinData.isCustom || false;
    }

    getDefaultValue() {
        switch (this.type) {
            case 'bool': return false;
            case 'int':
            case 'int64':
            case 'byte': return 0;
            case 'float': return 0.0;
            default: return '';
        }
    }

    isConnected() { return this.links.length > 0; }

    getMaxLinks() {
        if (this.dir === 'in' && this.type !== 'exec') {
            return 1;
        }
        return Infinity;
    }
}

export { Pin };
