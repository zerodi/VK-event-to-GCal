const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
    mode: 'production',
    entry: './src/js/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js/,
                exclude: /(node_modules|bower_components)/,
                use: [{
                    loader: 'babel-loader'
                }]
            },
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'src/img', to: 'img' },
            { from: 'src/manifest.json', to: '' },
        ]),
        new Dotenv(),
    ],
    stats: {
        colors: true
    },
    devtool: 'source-map',
};

