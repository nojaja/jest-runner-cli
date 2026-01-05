const path = require('path');

module.exports = {
  target: 'node',
  entry: path.resolve(__dirname, 'src', 'index.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: {
      type: 'commonjs2'
    }
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: { transpileOnly: true }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  externalsPresets: { node: true },
  externals: {
    'create-jest-runner': 'commonjs create-jest-runner',
    'jest-runner': 'commonjs jest-runner'
  }
};
