const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        path: __dirname,
        filename: 'vast-client.min.js'
    },
    node: {
        fs: 'empty'
    },
    module: require(path.resolve(__dirname, 'webpack.module.js'))()
};
