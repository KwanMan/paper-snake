const path = require('path')
module.exports = {
  mode: 'none',
  entry: './src/start.js',
  output: {
    filename: 'paper-snake.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: modulePath => {
          return (
            /node_modules/.test(modulePath) &&
            !/node_modules\/roughjs/.test(modulePath)
          )
        },
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                'babel-preset-env',
                {
                  modules: false
                }
              ]
            ],
            plugins: ['babel-plugin-transform-object-rest-spread'],
            babelrc: false
          }
        }
      }
    ]
  }
}
