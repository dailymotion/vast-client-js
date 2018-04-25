import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import externalHelpers from 'babel-plugin-external-helpers';
import builtins from 'rollup-plugin-node-builtins';
import alias from 'rollup-plugin-alias';
import pkg from './package.json';

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      name: 'VAST',
      format: 'iife',
      file: pkg.browser
    },
    plugins: [
      builtins(),
      resolve(), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      babel({
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
      }),
      uglify()
    ]
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: 'src/index.js',
    output: {
      format: 'cjs',
      file: pkg.main
    },
    external: ['ms'],
    plugins: [
      builtins(),
      babel({
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
      }),
      uglify()
    ]
  },

  {
    input: 'src/index.js',
    output: {
      format: 'es',
      file: pkg.module
    },
    external: ['ms'],
    plugins: [builtins(), uglify()]
  }
];
