module.exports = function() {
    return {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: [
                        'babel-preset-env'
                    ],
                    plugins: [
                        "transform-object-assign"
                    ]
                  }
                }
            }
        ]
    }
}
