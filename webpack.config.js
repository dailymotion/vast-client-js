module.exports = env => {
  const config = {
    mode: 'production',
    entry: './src/index.js',
    output: {
      path: __dirname
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

  if (env === 'node') {
    config.target = 'node';
    config.output.filename = 'vast-client-node.js';
    config.output.libraryTarget = 'umd';
  } else {
    config.resolve.alias['./urlhandlers/node_url_handler'] =
      './urlhandlers/mock_node_url_handler';
    config.output.filename = 'vast-client.js';
    config.output.library = 'VAST';
    config.node = {
      fs: 'empty'
    };
  }

  return config;
};
