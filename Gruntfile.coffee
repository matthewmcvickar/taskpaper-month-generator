module.exports = (grunt) ->

  require('load-grunt-tasks')(grunt)

  grunt.initConfig {
    pkg: grunt.file.readJSON('package.json')

    coffee:
      build:
        files:
          'build/js/script.js' : 'src/js/script.coffee'

    uglify:
      build:
        files:
          'build/js/lib.js' : [
            'bower_components/jquery/dist/jquery.js'
            'bower_components/jquery-throttle-debounce/jquery.ba-throttle-debounce.js'
            'bower_components/purl/purl.js'
            'bower_components/zeroclipboard/ZeroClipboard.js'
          ]

    sass:
      build:
        files:
          'tmp/css/style.css' : 'src/css/style.sass'

    autoprefixer:
      single_file:
        src: 'tmp/css/style.css'
        dest: 'build/css/style.css'

    connect:
      server:
        options:
          port: 8764 # phone keypad equivalent of TPMG
          hostname: '*'
          base: 'build'
          livereload: true

    watch:
      coffee:
        files: ['src/js/script.coffee']
        tasks: ['coffee:build']
      sass:
        files: ['src/css/*.sass']
        tasks: ['sass:build']
      autoprefixer:
        files: ['tmp/css/style.css']
        tasks: ['autoprefixer:single_file']
      reload:
        files: ['build/*.html','build/js/script.js']
        options: {livereload: true}
      livereload:
        files: ['build/css/style.css']
        options: {livereload: true}

    'gh-pages':
      options:
        base: 'build'
      src: ['**']
  }

  grunt.registerTask 'setup', ['uglify']
  grunt.registerTask 'default', ['connect', 'watch']
  grunt.registerTask 'deploy', ['gh-pages']
