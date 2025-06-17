import globals from "globals";
import ftFlow from "eslint-plugin-ft-flow";
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
            ftFlow,
        },
    },
];
