module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: 'eslint:recommended',
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module'
  },
  plugins: ['import'],
  rules: {
    'array-callback-return': ['error'],
    camelcase: ['warn'],
    eqeqeq: ['error'],
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'import/named': ['error'],
    'import/newline-after-import': ['warn'],
    'import/no-unresolved': ['error'],
    'linebreak-style': ['warn', 'unix'],
    'max-classes-per-file': ['error', 1],
    'no-alert': ['error'],
    'no-console': ['error'],
    'no-const-assign': ['error'],
    'no-debugger': ['error'],
    'no-duplicate-imports': ['error'],
    'no-else-return': ['error'],
    'no-extra-bind': ['error'],
    'no-invalid-this': ['error'],
    'no-multiple-empty-lines': ['warn'],
    'no-multi-spaces': [
      'warn',
      { exceptions: { VariableDeclarator: true, ImportDeclaration: true } }
    ],
    'no-restricted-globals': ['error', 'fdescribe', 'fit'],
    'no-shadow': ['error'],
    'no-trailing-spaces': ['warn'],
    'no-undef': ['error'],
    'no-unreachable': ['error'],
    'no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', ignoreRestSiblings: true, args: 'after-used' }
    ],
    'no-prototype-builtins': ['off'],
    'no-var': ['error'],
    'object-shorthand': ['warn'],
    'prefer-const': ['error'],
    'prefer-rest-params': ['error'],
    'prefer-spread': ['warn'],
    'prefer-template': ['warn']
  }
};
