const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        libraryTarget: "umd",
        library: {
            root: 'GraphRelation',
            amd: 'GraphRelation',
            commonjs: 'GraphRelation'
        }
        // library: 'GraphRelation' 
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
        port: 9000
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './examples/test.html',
            filename: 'index.html'
        }), 
        // 代码压缩
        new MinifyPlugin()
    ]
};