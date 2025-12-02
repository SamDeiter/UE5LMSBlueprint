export const PIN_TYPES = {
    EXEC: 'exec',
    BOOL: 'bool',
    BYTE: 'byte',
    INT: 'int',
    INT64: 'int64',
    FLOAT: 'float',
    DOUBLE: 'double',
    NAME: 'name',
    STRING: 'string',
    TEXT: 'text',
    VECTOR: 'vector',
    ROTATOR: 'rotator',
    TRANSFORM: 'transform',
    OBJECT: 'object',
    ENUM: 'enum',
    WILDCARD: 'wildcard'
};

export const PIN_COLORS = {
    [PIN_TYPES.EXEC]: 'var(--color-exec)',
    [PIN_TYPES.BOOL]: 'var(--color-bool)',
    [PIN_TYPES.BYTE]: 'var(--color-byte)',
    [PIN_TYPES.INT]: 'var(--color-int)',
    [PIN_TYPES.INT64]: 'var(--color-int64)',
    [PIN_TYPES.FLOAT]: 'var(--color-float)',
    [PIN_TYPES.DOUBLE]: 'var(--color-double)',
    [PIN_TYPES.NAME]: 'var(--color-name)',
    [PIN_TYPES.STRING]: 'var(--color-string)',
    [PIN_TYPES.TEXT]: 'var(--color-text)',
    [PIN_TYPES.VECTOR]: 'var(--color-vector)',
    [PIN_TYPES.ROTATOR]: 'var(--color-rotator)',
    [PIN_TYPES.TRANSFORM]: 'var(--color-transform)',
    [PIN_TYPES.OBJECT]: 'var(--color-object)',
    [PIN_TYPES.ENUM]: 'var(--color-enum)',
    DEFAULT: '#888888'
};

export const VARIABLE_HEADER_COLORS = {
    [PIN_TYPES.BOOL]: { start: '#8F0000', end: '#450000' },
    [PIN_TYPES.BYTE]: { start: '#00525E', end: '#002B30' },
    [PIN_TYPES.INT]: { start: '#1E855E', end: '#0F422F' },
    [PIN_TYPES.INT64]: { start: '#668044', end: '#334022' },
    [PIN_TYPES.FLOAT]: { start: '#6AA826', end: '#355413' },
    [PIN_TYPES.DOUBLE]: { start: '#5FA826', end: '#2F5413' },
    [PIN_TYPES.NAME]: { start: '#8F5E99', end: '#472F4C' },
    [PIN_TYPES.STRING]: { start: '#BF00BF', end: '#600060' },
    [PIN_TYPES.TEXT]: { start: '#BF7885', end: '#603C42' },
    [PIN_TYPES.VECTOR]: { start: '#BF9800', end: '#604C00' },
    [PIN_TYPES.ROTATOR]: { start: '#5E7AA8', end: '#2F3D54' },
    [PIN_TYPES.TRANSFORM]: { start: '#BF6600', end: '#603300' },
    [PIN_TYPES.OBJECT]: { start: '#005580', end: '#002A40' },
    [PIN_TYPES.ENUM]: { start: '#006633', end: '#003319' },
    DEFAULT: { start: '#303030', end: '#151515' }
};

export const NODE_HEADER_COLORS = {
    CONSTRUCTION_SCRIPT: { start: '#B54E05', end: '#8A3B04' },
    EVENT: { start: '#8B0000', end: '#400000' },
    FUNCTION: { start: '#005580', end: '#002a40' },
    ASSESSMENT: { start: '#6030a0', end: '#301560' },
    PURE: { start: '#66aa66', end: '#335533' },
    DEFAULT: { start: '#333', end: '#111' }
};

export const NODE_TYPES = {
    PURE: 'pure-node',
    EVENT: 'event-node',
    FUNCTION: 'function-node',
    ASSESSMENT: 'assessment-node',
    COMMENT: 'comment-node'
};

export const PIN_TYPE_CLASSES = {
    [PIN_TYPES.EXEC]: 'exec-pin',
    [PIN_TYPES.BOOL]: 'bool-pin',
    [PIN_TYPES.BYTE]: 'byte-pin',
    [PIN_TYPES.INT]: 'int-pin',
    [PIN_TYPES.INT64]: 'int64-pin',
    [PIN_TYPES.FLOAT]: 'float-pin',
    [PIN_TYPES.DOUBLE]: 'double-pin',
    [PIN_TYPES.NAME]: 'name-pin',
    [PIN_TYPES.STRING]: 'string-pin',
    [PIN_TYPES.TEXT]: 'text-pin',
    [PIN_TYPES.VECTOR]: 'vector-pin',
    [PIN_TYPES.ROTATOR]: 'rotator-pin',
    [PIN_TYPES.TRANSFORM]: 'transform-pin',
    [PIN_TYPES.OBJECT]: 'object-pin',
    [PIN_TYPES.ENUM]: 'enum-pin',
    DEFAULT: 'default-pin'
};
