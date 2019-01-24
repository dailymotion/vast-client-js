module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module'
  },
  rules: {
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'linebreak-style': ['warn', 'unix'],
    'no-console': ['error'],
    'no-debugger': ['error'],
    'no-else-return': ['error'],
    'no-restricted-globals': ['error', 'fdescribe', 'fit'],
    'no-undef': ['error'],
    'no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', ignoreRestSiblings: true, args: 'after-used' }
    ],
    'no-var': ['error'],
    'object-shorthand': ['warn'],
    'prefer-const': ['error'],
    'prefer-rest-params': ['error'],
    'prefer-spread': ['warn'],
    'prefer-template': ['warn']
  }
};
