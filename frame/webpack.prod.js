 const merge = require('webpack-merge');
 const webpack = require('webpack');
 const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
 const common = require('./webpack.common.js');
 const CleanWebpackPlugin = require('clean-webpack-plugin');
 const path = require('path');

 module.exports = merge(common, {
    mode: 'production',
    output: { path: path.resolve("./output/webpack/production"),filename: "bundle-web-prod.js"},
    plugins: [
    new UglifyJSPlugin({ sourceMap: true }),
    new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('production')}),
    new CleanWebpackPlugin(['./output/webpack/production']),
    ],
 });