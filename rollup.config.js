import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/start.js',
  output: {
    file: 'dist/paper-snake.js',
    format: 'es'
  },
  plugins: [
    babel({
      babelrc: false,
      presets: [['babel-preset-env', { modules: false }]],
      plugins: [
        'babel-plugin-external-helpers',
        'babel-plugin-transform-object-rest-spread'
      ]
    }),
    resolve()
  ]
}
