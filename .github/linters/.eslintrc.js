module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "es6": true,
        "jquery":true, 
        "jest": true
    },
    "extends": "eslint:recommended",
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "rules": {
        "indent": ["error", "tab", { "SwitchCase": 1 }],
        "no-console" : "error",
        "no-alert" : "error",
        "camelcase" : "error",
        "no-else-return" : "error",
        "no-empty-function" : "error",
        "no-unused-vars" :  "off",
        "no-undef" : "off",
        "eqeqeq" : "error",
        "no-shadow" : "error",
        "comma-spacing" : "error",
        "keyword-spacing" : "error",
        "no-empty" : "error"
    },
    "ignorePatterns": ["*.min.js*"]
}