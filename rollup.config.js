import babel from 'rollup-plugin-babel'

export default {
  input: 'src/start.js',
  output: {
    file: 'dist/paper-snake.js',
    format: 'cjs'
  },
  plugins: [
    babel({
      babelrc: false,
      presets: [
        ['babel-preset-env', { modules: false, targets: { uglify: true } }]
      ],
      plugins: ['babel-plugin-transform-object-rest-spread']
    })
  ]
}
