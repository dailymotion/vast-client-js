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
  plugins: ['import'],
  rules: {
    camelcase: ['warn'],
    eqeqeq: ['error'],
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'import/named': ['error'],
    'import/no-unresolved': ['error'],
    'import/newline-after-import': ['warn'],
    'linebreak-style': ['warn', 'unix'],
    'no-console': ['error'],
    'no-debugger': ['error'],
    'no-else-return': ['error'],
    'no-multi-spaces': [
      'warn',
      { exceptions: { VariableDeclarator: true, ImportDeclaration: true } }
    ],
    'no-trailing-spaces': ['warn'],
    'no-restricted-globals': ['error', 'fdescribe', 'fit'],
    'no-undef': ['error'],
    'no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', ignoreRestSiblings: true, args: 'after-used' }
    ],
    'no-shadow': ['error'],
    'no-unreachable': ['error'],
    'no-alert': ['error'],
    'no-const-assign': ['error'],
    'no-duplicate-imports': ['error'],
    'no-multiple-empty-lines': ['warn'],
    'no-var': ['error'],
    'object-shorthand': ['warn'],
    'prefer-const': ['error'],
    'prefer-rest-params': ['error'],
    'prefer-spread': ['warn'],
    'prefer-template': ['warn']
  }
};
