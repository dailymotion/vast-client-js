module.exports = function() {
    return {
        rules: [
            {
                test: /\.coffee$/,
                exclude: /(node_modules|bower_components)/,
                use: [ 'coffee-loader' ]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['babel-preset-env']
                  }
                }
            }
        ]
    }
}
