const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index.coffee',
    output: {
        path: __dirname,
        filename: 'vast-client.js'
    },
    node: {
        fs: 'empty'
    },
    module: require(path.resolve(__dirname, 'webpack.module.js'))()
};
