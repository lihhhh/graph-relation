const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode:'development',
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
                // {
                //     loader:"es3ify-loader"
                // }, 
                {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015'],
                        plugins: ['transform-runtime']
                    }
                }
            ]
        }]
    },
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        port: 8000
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './test.html',
            filename: 'index.html'
        })
    ]
};