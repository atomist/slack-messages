module.exports = {
    "env": {
        "es6": true,
        "node": true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 2018,
        "project": "tsconfig.json",
        "sourceType": "module",
    },
    "plugins": [
        "@typescript-eslint",
    ],
    "rules": {
        "comma-dangle": ["error", "always-multiline"],
        "comma-spacing": "off",
        "@typescript-eslint/comma-spacing": ["error"],
        "eqeqeq": ["error", "always"],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-floating-promises": ["error"],
        "semi": "off",
        "@typescript-eslint/semi": ["error"],
    },
};
