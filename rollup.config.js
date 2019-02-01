import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import externalHelpers from 'babel-plugin-external-helpers';
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

  minifiedConfig.plugins.push(uglify());

  return minifiedConfig;
}

const browserConfig = {
  input: 'src/index.js',
  output: {
    name: 'VAST',
    format: 'iife',
    file: 'dist/vast-client.js'
  },
  plugins: [babelPlugin]
};

const nodeConfig = {
  input: 'src/index.js',
  output: {
    format: 'cjs',
    file: 'dist/vast-client-node.js'
  },
  plugins: [
    alias({
      './urlhandlers/mock_node_url_handler': './urlhandlers/node_url_handler'
    }),
    resolve({
      preferBuiltins: true
    }),
    babelPlugin
  ],
  onwarn
};

export default [
  // Browser-friendly UMD build [package.json "browser"]
  browserConfig,
  minify(browserConfig),

  // CommonJS build for Node usage [package.json "main"]
  nodeConfig,
  minify(nodeConfig)
];
