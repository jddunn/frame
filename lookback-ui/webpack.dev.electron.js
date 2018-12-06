const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { spawn } = require('child_process');

// Config directories
const SRC_DIR = path.resolve(__dirname, 'src');
const OUTPUT_DIR = path.resolve(__dirname, 'electron/dev/dist');

// Any directories you will be adding code/files into, need to be added to this array so webpack will pick them up
const defaultInclude = [SRC_DIR];
module.exports = {
  mode: 'development',
  entry: ['babel-polyfill', path.resolve(__dirname, 'src/index.js')],
  resolve: {extensions: [".js", ".jsx", ".tsx", ".ts"]},
  output: {
    path: OUTPUT_DIR,
    publicPath: '/',
    filename: 'bundle-electron-dev.js'
  },
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
  target: 'electron-renderer',
  plugins: [
    new HtmlWebpackPlugin(),
    new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('development')})
  ],
  devtool: 'cheap-source-map',
  devServer: {
    contentBase: OUTPUT_DIR,
    stats: {
      colors: true,
      chunks: false,
      children: false
    },
    setup() {
      spawn(
        'electron',
        ['.'],
        { shell: true, env: process.env, stdio: 'inherit' }
      )
      .on('close', code => process.exit(0))
      .on('error', spawnError => console.ernror(spawnError));
    }
  }
};
