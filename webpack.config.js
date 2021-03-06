
const webpack = require('webpack')
const sysConfigDefault = require('./config.default')
const ExtraneousFileCleanupPlugin = require('webpack-extraneous-file-cleanup-plugin')
const path = require('path')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

const browser = process.env.BROWSER || 'chrome'

const stylusSettingPlugin =  new webpack.LoaderOptionsPlugin({
  test: /\.styl$/,
  stylus: {
    preferPathResolver: 'webpack'
  }
})

const opts = {
  extensions: ['.map', '.js'],
  minBytes: 3900
}

const pug = {
  loader: 'pug-html-loader',
  options: {
    data: {
      _global: {}
    }
  }
}

var config = {
  mode: 'production',
  entry: {
    content: './src/content.js',
    background: './src/background.js',
    manifest: `./src/manifest.${browser}.json`
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    publicPath: '/',
    chunkFilename: '[name].[hash].js',
    libraryTarget: 'var'
  },
  watch: true,
  resolve: {
    extensions: ['.js', '.json']
  },
  resolveLoader: {
    modules: [
      path.join(process.cwd(), 'loaders'),
      path.join(process.cwd(), 'node_modules')
    ]
  },
  optimization: {
    minimize: sysConfigDefault.minimize
  },
  module: {
    rules: [
      {
        test: /manifest\.\w+.json$/,
        use: [
          'manifest-loader'
        ]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules\/(?!(ringcentral-embeddable-extension-common)\/).*/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                '@babel/preset-env'
              ],
              plugins: [
                '@babel/plugin-proposal-class-properties',
                'babel-plugin-lodash',
                '@babel/plugin-syntax-dynamic-import',
                [
                  '@babel/plugin-proposal-decorators',
                  {
                    legacy: true
                  }
                ],
                [
                  '@babel/plugin-transform-runtime',
                  {
                    regenerator: true
                  }
                ]
              ]
            }
          }
        ]
      },
      {
        test: /\.styl$/,
        use: [
          'style-loader',
          'css-loader',
          'stylus-loader'
        ]
      },
      {
        test: /\.(png|jpg|svg)$/,
        use: ['url-loader?limit=10192&name=images/[hash].[ext]']
      },
      {
        test: /\.pug$/,
        use: [
          'file-loader?name=../app/app.html',
          'concat-loader',
          'extract-loader',
          'html-loader',
          pug
        ]
      }
    ]
  },
  devtool: 'source-map',
  plugins: [
    stylusSettingPlugin,
    new LodashModuleReplacementPlugin({
      collections: true,
      paths: true
    }),
    new ExtraneousFileCleanupPlugin(opts),
    new webpack.DefinePlugin({
      'process.env.ringCentralConfigs': JSON.stringify(sysConfigDefault.ringCentralConfigs),
      'process.env.thirdPartyConfigs': JSON.stringify(sysConfigDefault.thirdPartyConfigs)
    })
  ]
}

module.exports = config

