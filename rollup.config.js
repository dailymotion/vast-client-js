import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import externalHelpers from 'babel-plugin-external-helpers';
import builtins from 'rollup-plugin-node-builtins';
import alias from 'rollup-plugin-alias';
import resolve from 'rollup-plugin-node-resolve';

const babelPlugin = babel({
  babelrc: false,
  presets: [
    [
      'es2015',
      {
        modules: false
      }
    ]
  ],
  plugins: [externalHelpers],
  exclude: ['node_modules/**']
});

function onwarn(warning) {
  if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    console.error(`(!) ${warning.message}`);
  }
}

export default [
  // Browser-friendly UMD build [package.json "browser"]
  {
    input: 'src/index.js',
    output: {
      name: 'VAST',
      format: 'iife',
      file: 'dist/vast-client.min.js'
    },
    plugins: [
      builtins(), // Needed for node EventEmitter class
      babelPlugin,
      uglify()
    ]
  },
  {
    input: 'src/index.js',
    output: {
      name: 'VAST',
      format: 'iife',
      file: 'dist/vast-client.js'
    },
    plugins: [
      builtins(), // Needed for node EventEmitter class
      babelPlugin
    ]
  },

  // CommonJS build for Node usage [package.json "main"]
  {
    input: 'src/index.js',
    output: {
      format: 'cjs',
      file: 'dist/vast-client-node.min.js'
    },
    plugins: [
      resolve(),
      alias({
        './urlhandlers/mock_node_url_handler': './urlhandlers/node_url_handler'
      }),
      builtins(),
      babelPlugin,
      uglify()
    ],
    onwarn
  },

  {
    input: 'src/index.js',
    output: {
      format: 'cjs',
      file: 'dist/vast-client-node.js'
    },
    plugins: [
      resolve(),
      alias({
        './urlhandlers/mock_node_url_handler': './urlhandlers/node_url_handler'
      }),
      builtins(),
      babelPlugin
    ],
    onwarn
  },

  // Minified version with es6 module exports [package.json "module"]
  {
    input: 'src/index.js',
    output: {
      format: 'es',
      file: 'dist/vast-client-module.min.js'
    },
    plugins: [builtins(), uglify()]
  }
];
