import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        ignores: [
            'node_modules/**',
            '*.min.js',
            'scripts/**/*.py'
        ]
    },
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
                requestAnimationFrame: 'readonly',
                Event: 'readonly',
                MouseEvent: 'readonly',
                KeyboardEvent: 'readonly',
                DragEvent: 'readonly',
                CustomEvent: 'readonly',
                SVGElement: 'readonly',
                HTMLElement: 'readonly',
                Element: 'readonly',
                Node: 'readonly',
                NodeList: 'readonly',
                Map: 'readonly',
                Set: 'readonly',
                Promise: 'readonly',
                Array: 'readonly',
                Object: 'readonly',
                String: 'readonly',
                Number: 'readonly',
                Boolean: 'readonly',
                Math: 'readonly',
                JSON: 'readonly',
                Blob: 'readonly',
                URL: 'readonly',
                FileReader: 'readonly',
                localStorage: 'readonly',
                ResizeObserver: 'readonly',
                getComputedStyle: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-undef': 'error',
            'no-console': 'off',
            'no-debugger': 'warn'
        }
    }
];
