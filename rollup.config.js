import babel from 'rollup-plugin-babel'

export default {
  input: 'src/start.js',
  output: {
    file: 'dist/paper-snake.js',
    format: 'es'
  },
  plugins: [
    babel({
      babelrc: false,
      presets: [
        [
          'babel-preset-env',
          {
            modules: false,
            targets: {
              uglify: true,
              browsers: ['last 2 versions', 'safari >= 7']
            }
          }
        ]
      ],
      plugins: ['babel-plugin-transform-object-rest-spread']
    })
  ]
}
