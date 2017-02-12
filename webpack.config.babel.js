const webpack = require('webpack');
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = env => {
  const removeEmpty = array => array.filter(p => !!p);
  const ifProd = plugin => env.prod ? plugin : undefined;

  return {
    context: resolve('src'),
    entry: {
      app: './index.js',
      auth: ['auth0-lock', 'jwt-decode'],
      vendor: ['universal-router', 'query-string'],
      cycle: [
        '@cycle/dom',
        '@cycle/run',
        // '@cycle/xstream-run',
        'xstream',
        '@cycle/history',
        '@cycle/isolate',
        // 'cyclic-router',
        // 'history',
        // 'switch-path'
      ],
      immutable: [
        'immutable'
      ]
    },
    output: {
      filename: env.prod ? 'public/js/bundle.[name].[chunkhash].js' : 'public/js/bundle.[name].js',
      path: resolve('dist'),
      pathinfo: !env.prod,
      publicPath: '/'
    },
    devtool: env.prod ? 'source-map' : 'eval',
    resolve: {
      modules: [ "node_modules", resolve(__dirname, "src") ],
      extensions: [".js", ".json", ".jsx", ".css", "scss"]
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loaders: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: [
              ["es2015", { "modules": false }],
              "es2016",
              "stage-2"
            ]
          }
        },
        { test: /\.css$/, loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader!postcss-loader'
        })  },
        { test: /\.scss$/, loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader!postcss-loader!sass-loader'
        })  },
        {
          test: /\.(eot|svg|ttf|woff|woff2|png)$/,
          loader: 'file-loader?name=public/fonts/[name].[ext]'
        }
      ]
    },
    plugins: removeEmpty([
      new ProgressBarPlugin(),
      new ExtractTextPlugin({
        filename: env.prod ? 'public/css/styles.[name].[chunkhash].css': 'public/css/styles.[name].css',
        allChunks: true
      }),
      ifProd(new InlineManifestWebpackPlugin()),
      ifProd(new webpack.optimize.CommonsChunkPlugin({
        name: ['auth', 'cycle', 'immutable', 'vendor', 'manifest']
      })),
      new HtmlWebpackPlugin({
        template: './index.html'
      })
    ])
  };
};
