export const PinDefaults = {
    BOOL: false,
    INT: 0,
    INT64: 0,
    BYTE: 0,
    FLOAT: 0.0,
    VECTOR: '(0,0,0)',
    ROTATOR: '(0,0,0)',
    TRANSFORM: '(0,0,0|0,0,0|1,1,1)',
    STRING: '',
    TEXT: '',
    NAME: '',
    OBJECT: null,
    CLASS: null,
    DEFAULT: ''
};

export const StructComponents = {
    VECTOR: [
        { name: 'X', type: 'float', default: 0.0 },
        { name: 'Y', type: 'float', default: 0.0 },
        { name: 'Z', type: 'float', default: 0.0 }
    ],
    ROTATOR: [
        { name: 'Roll', type: 'float', default: 0.0 },
        { name: 'Pitch', type: 'float', default: 0.0 },
        { name: 'Yaw', type: 'float', default: 0.0 }
    ],
    TRANSFORM: [
        { name: 'Location', type: 'vector', default: '(0,0,0)' },
        { name: 'Rotation', type: 'rotator', default: '(0,0,0)' },
        { name: 'Scale', type: 'vector', default: '(1,1,1)' }
    ]
};
