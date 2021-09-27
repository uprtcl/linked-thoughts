const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  output: {
    filename: 'main.[hash].bundle.js',
    path: path.resolve(__dirname, 'dist-pages'),
    publicPath: '/',
  },
  resolve: {
    alias: {
      'lit-element': path.resolve('./node_modules/lit-element'),
      'lit-html': path.resolve('./node_modules/lit-html'),
      'wicg-inert': path.resolve('./node_modules/wicg-inert/dist/inert'),
    },
    extensions: [
      '.mjs',
      '.ts',
      '.tsx',
      '.js',
      '.json',
      '.css',
      '.scss',
      '.html',
    ],
  },
  entry: ['babel-polyfill', './src/index.ts'],
  devServer: {
    historyApiFallback: true,
    port: 8002,
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: { ie: '11' } }]],
            plugins: ['@babel/plugin-syntax-dynamic-import'],
          },
        },
      },
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
        },
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
      {
        test: /\.svg$/i,
        loader: 'lit-svg-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      minify: true,
    }),
    new CopyWebpackPlugin([{ from: 'src/assets', to: 'src/assets' }]),
  ],
};
