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

const createNodeConfig = (filePath, minifiedOutput, notMinifiedOutput) => {
  let config = {
    input: filePath,
    output: [
      {
        format: 'cjs',
        file: `dist/${notMinifiedOutput}`,
      },
      {
        format: 'cjs',
        file: `dist/${minifiedOutput}`,
        plugins: [terser()],
      },
    ],
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

  return config;
};

const createBrowserConfig = (filePath, minifiedOutput, notMinifiedOutput) => {
  let config = {
    input: filePath,
    output: [
      {
        format: 'es',
        file: `dist/${notMinifiedOutput}`,
      },
      {
        format: 'es',
        file: `dist/${minifiedOutput}`,
        plugins: [terser()],
      },
    ],
    plugins: [babelPlugin],
  };

  return config;
};

export default [
  // Browser-friendly build [package.json "browser"]
  createBrowserConfig('src/index.js', 'vast-client.min.js', 'vast-client.js'),
  // CommonJS build for Node usage [package.json "main"]
  createNodeConfig(
    'src/index.js',
    'vast-client-node.min.js',
    'vast-client-node.js'
  ),
];
