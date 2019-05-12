module.exports = {
  entry: './index.ts',
  output: {
    filename: 'index.js',
    path: __dirname
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader?configFile=tsconfig.json',
        exclude: /node_modules/,
      },
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
};