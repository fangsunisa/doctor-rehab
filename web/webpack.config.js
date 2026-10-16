const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, '../index.web.js'),

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
    clean: true,
  },

  resolve: {
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.json',
    ],
    alias: {
      'react-native': 'react-native-web',
    },
    modules: ['node_modules'],
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        include: [
          path.resolve(__dirname, '../android/app/src'),
          path.resolve(
            __dirname,
            '../node_modules/react-native-vector-icons'
          ),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['module:@react-native/babel-preset'],
            plugins: ['react-native-web'],
          },
        },
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(mp4|webm|ogg|mov)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'videos/[name][ext]',
        },
      },
    ],
  },

  devServer: {
    static: {
      directory: __dirname,
      publicPath: '/',
    },
    devMiddleware: {
      publicPath: '/',
    },
    port: 8080,
    hot: true,
    historyApiFallback: {
      index: '/index.html',
    },
  },
};
