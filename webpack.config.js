const path = require('path');

module.exports = env => {
  const config = {
    mode: 'production',
    entry: './src/index.js',
    output: {
      path: path.join(__dirname, 'dist')
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: ['webpack-conditional-loader']
        },
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['babel-preset-env'],
              plugins: ['transform-object-assign']
            }
          }
        }
      ]
    },
    resolve: {
      alias: {}
    }
  };

  if (env === 'dev' || env === 'node-dev') {
    config.mode = 'development';
  }

  if (env === 'node' || env === 'node-dev') {
    config.target = 'node';
    config.output.filename =
      env === 'node-dev' ? 'vast-client-node.js' : 'vast-client-node.min.js';
    config.output.libraryTarget = 'umd';
  } else {
    config.resolve.alias['./urlhandlers/node_url_handler'] =
      './urlhandlers/mock_node_url_handler';
    config.output.filename =
      env === 'dev' ? 'vast-client.js' : 'vast-client.min.js';
    config.output.library = 'VAST';
    config.node = {
      fs: 'empty'
    };
  }

  return config;
};
