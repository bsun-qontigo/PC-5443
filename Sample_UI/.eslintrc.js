// @ts-check

// This file is maintained in the Qontigo/core-coding-standards repo and that copy will overwrite any changes made in any repo using the file

const { readFileSync, writeFileSync } = require('fs');
const { resolve, dirname, relative } = require('path');
process.env.TSESTREE_NO_INVALIDATION = 'true';
const showError = Boolean(process.env.VSCODE_PID || process.env.VIMRUNTIME);
const options = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/no-explicit-any': showError ? 'error' : 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
        'semi': ['error'],
        'no-multiple-empty-lines': ["error", { "max": 2, "maxBOF": 1 }],
        'eqeqeq': ["error", "always"],
        'getter-return': 'error',
        'no-compare-neg-zero': 'error',
        'quotes': ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
        '@typescript-eslint/ban-types': ['error', {
            types: {
                Function: false,
                Object: false,
                object: false,
                '{}': false
            }
        }],
        '@typescript-eslint/member-ordering': 'error',
        '@typescript-eslint/explicit-member-accessibility': 'error',
        'comma-dangle': 'off',
        '@typescript-eslint/comma-dangle': ['error', 'only-multiline']
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parserOptions: {
        ecmaFeatures: {
            modules: true
        },
        sourceType: "module",
        ecmaVersion: 2019,
        tsconfigRootDir: __dirname,
        project: undefined
    }
};

module.exports = options;
