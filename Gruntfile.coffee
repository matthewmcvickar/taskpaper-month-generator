module.exports = (grunt) ->

  # Load all Grunt tasks.
  require('jit-grunt')(grunt);

  grunt.initConfig {

    clean:
      files: [
        'build'
        '.tmp'
      ]

    copy:
      build:
        expand: true
        cwd: 'src'
        src: '**/*.html'
        dest: 'build'
      zeroClipboardSWF:
        expand: true
        cwd: 'bower_components/zeroclipboard/dist'
        src: 'ZeroClipboard.swf'
        dest: 'build/js/'


    coffee:
      build:
        files:
          '.tmp/js/script.js' : 'src/js/script.coffee'

    uglify:
      build:
        files:
          'build/js/lib+script.js' : [
            'bower_components/jquery/dist/jquery.js'
            'bower_components/jquery-throttle-debounce/jquery.ba-throttle-debounce.js'
            'bower_components/purl/purl.js'
            'bower_components/zeroclipboard/dist/ZeroClipboard.js'
            'bower_components/moment/moment.js'
            '.tmp/js/script.js'
          ]

    sass:
      build:
        files:
          '.tmp/css/style.css' : 'src/css/style.sass'

    autoprefixer:
      build:
        src: '.tmp/css/style.css'
        dest: 'build/css/style.css'

    svgmin:
      build:
        files: [
          expand: true,
          cwd: 'src/svg',
          src: ['**/*.svg'],
          dest: 'build/svg'
        ]

    browserSync:
      files:
        src: ['build/**/*']
      options:
        watchTask: true
        server:
          baseDir: 'build'

    watch:
      copy:
        files: ['src/**/*.html']
        tasks: ['copy:build']
      coffee:
        files: ['src/js/script.coffee']
        tasks: ['coffee']
      uglify:
        files: ['.tmp/js/**/*.js']
        tasks: ['uglify']
      sass:
        files: ['src/css/*.sass']
        tasks: ['sass']
      autoprefixer:
        files: ['.tmp/css/style.css']
        tasks: ['autoprefixer']
      reload:
        files: ['build/**/*.{html,js,svg}']
        options: {livereload: true}
      livereload:
        files: ['build/css/style.css']
        options: {livereload: true}

    'gh-pages':
      options:
        base: 'build'
      src: ['**']
  }

  grunt.registerTask 'setup', [
    'clean'
    'copy'
    'sass'
    'autoprefixer'
    'coffee'
    'uglify'
    'svgmin'
  ]

  grunt.registerTask 'default', [
    'setup'
    'browserSync'
    'watch'
  ]

  grunt.registerTask 'deploy', [
    'gh-pages'
  ]
