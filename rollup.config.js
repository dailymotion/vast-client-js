import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';

const babelPlugin = babel({
  babelrc: false,
  presets: [['@babel/preset-env', { modules: false }]],
  exclude: ['node_modules/**'],
});

function onwarn(warning) {
  if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    console.error(`(!) ${warning.message}`);
  }
}

function minify(config) {
  const minifiedConfig = Object.assign({}, config);
  minifiedConfig.output = Object.assign({}, config.output);
  minifiedConfig.plugins = Object.assign([], config.plugins);

  const outputFile = minifiedConfig.output.file;
  const extensionIndex = outputFile.lastIndexOf('.js');
  minifiedConfig.output.file =
    outputFile.substr(0, extensionIndex) +
    '.min' +
    outputFile.substr(extensionIndex);

  minifiedConfig.plugins.push(terser());

  return minifiedConfig;
}

const browserConfig = {
  input: 'src/index.js',
  output: {
    name: 'VAST',
    format: 'umd',
    file: 'dist/vast-client.js',
  },
  plugins: [babelPlugin],
};

const browserScriptConfig = {
  input: 'src/index.js',
  output: {
    name: 'VAST',
    format: 'iife',
    file: 'dist/vast-client-browser.js',
  },
  plugins: [babelPlugin],
};

const nodeConfig = {
  input: 'src/index.js',
  output: {
    format: 'cjs',
    file: 'dist/vast-client-node.js',
  },
  plugins: [
    alias({
      entries: [
        {
          find: './urlhandlers/mock_node_url_handler',
          replacement: './urlhandlers/node_url_handler',
        },
      ],
    }),
    resolve({
      preferBuiltins: true,
    }),
    babelPlugin,
  ],
  onwarn,
};

export default [
  // Browser-friendly UMD build [package.json "browser"]
  browserConfig,
  minify(browserConfig),

  // CommonJS build for Node usage [package.json "main"]
  nodeConfig,
  minify(nodeConfig),

  minify(browserScriptConfig),
];
