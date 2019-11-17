module.exports = {
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true,
        "mocha": true
    },
    "extends": "airbnb-base",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "it": false,
        "describe": false
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "arrow-body-style": [0],
        "indent": [ 1, 4, { "SwitchCase": 1 } ],
        "no-multiple-empty-lines": [ 1, { "max": 1, "maxEOF": 1, "maxBOF": 0 } ],
        "quotes": [ 1, "single", { "avoidEscape": true } ],
        "no-use-before-define": [ 0 ],
        "one-var": [ 1 ],
        "vars-on-top": [ 1 ],
        "prefer-const": [ 1 ],
        "arrow-parens": [ 1, "always"],
        "space-before-function-paren": [ 1 , "never" ],
        "complexity": [ 0 ],
        "prefer-destructuring": [ 1, { "array": true, "object": true } ],
        "comma-dangle": [ 0 ],
        "object-curly-spacing": [ 1, "always"],
        "object-shorthand": [ 1 ],
        "object-curly-newline": [ 2, { "consistent": true } ],
        "no-multi-assign": [ 1 ],
        "max-len": [ 0 ],
        "func-names": [ 1, "never" ],
        "no-underscore-dangle": [ 0 ],
        "curly": [ 2, "all" ],
        "no-plusplus": [ 2, { "allowForLoopAfterthoughts": true } ],
        "strict":[ 0 ],
        "no-multi-spaces":[2, { "ignoreEOLComments": true } ],
        "no-useless-constructor" : "off",
        "linebreak-style": [0],
        "no-restricted-syntax": [0]
    }
};