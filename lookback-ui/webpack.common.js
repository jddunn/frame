const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require("webpack");

module.exports = {
    entry:["babel-polyfill","./src/index.js"],
    resolve: {extensions: ['.js', '.jsx', '.tsx', '.ts']},
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                        plugins: [
                          // Here, we include babel plugins that are only required for the
                          // renderer process. The 'transform-*' plugins must be included
                          // before react-hot-loader/babel
                          'transform-class-properties',
                          'transform-es2015-classes',
                          'react-hot-loader/babel'
                        ]
                      }
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },

            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: "url-loader",
                options: {
                    limit: 10000
                }
            },
            {
                test: /vendor\/.+\.(jsx|js)$/,
                loader: "imports?jQuery=jquery,$=jquery,this=>window"
            }
        ]
    },
    plugins: [ new HtmlWebpackPlugin() ]
};