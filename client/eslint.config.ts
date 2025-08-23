// @ts-expect-error js импортируется
import js from '@eslint/js';
// @ts-expect-error tsParser импортируется
import tsParser from '@typescript-eslint/parser';
// @ts-expect-error tsPlugin импортируется
import tsPlugin from '@typescript-eslint/eslint-plugin';
// @ts-expect-error globals импортируется
import globals from 'globals';

export default [
    js.configs.recommended,

    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },

    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
    },
];