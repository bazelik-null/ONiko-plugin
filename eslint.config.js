import globals from "globals";
import hermesEslint from "hermes-eslint";

export default [
    {
        languageOptions: {
            parser: hermesEslint,
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
            },
        },
        plugins: {
            '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
        },
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: '@typescript-eslint/parser',
        },
    },
];
