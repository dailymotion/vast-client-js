import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
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
  const baseConfig = {
    input: filePath,
    output: {
      format: 'cjs',
      dir: 'dist',
      manualChunks: {
        xmldom: ['@xmldom/xmldom'],
      },
    },
    plugins: [
      resolve({
        preferBuiltins: true,
      }),
      babelPlugin,
    ],
    onwarn,
  };

  const nonMinifiedConfig = {
    ...baseConfig,
    output: {
      ...baseConfig.output,
      entryFileNames: notMinifiedOutput,
      chunkFileNames: 'chunks/[name]-[hash].js',
    },
  };

  const minifiedConfig = {
    ...baseConfig,
    output: {
      ...baseConfig.output,
      entryFileNames: minifiedOutput,
      chunkFileNames: 'chunks/[name]-[hash].min.js',
    },
    plugins: [...baseConfig.plugins, terser()],
  };

  return [nonMinifiedConfig, minifiedConfig];
};

const createBrowserConfig = (filePath, minifiedOutput, notMinifiedOutput) => {
  let config = {
    input: filePath,
    output: [
      {
        format: 'es',
        dir: 'dist',
        entryFileNames: notMinifiedOutput,
      },
      {
        format: 'es',
        dir: 'dist',
        entryFileNames: minifiedOutput,
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
  ...createNodeConfig(
    'src/index.js',
    'vast-client-node.min.js',
    'vast-client-node.js'
  ),
];
