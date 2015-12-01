module.exports = function(grunt) {

  require('jit-grunt')(grunt);

  grunt.initConfig({
    clean: {
      files: [
        'build',
        '.tmp'
      ]
    },

    copy: {
      build: {
        expand: true,
        cwd: 'src',
        src: '**/*.html',
        dest: 'build'
      }
    },

    coffee: {
      build: {
        files: {
          '.tmp/js/script.js': 'src/js/script.coffee'
        }
      }
    },

    uglify: {
      build: {
        files: {
          'build/js/lib+script.js': [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/jquery-throttle-debounce/jquery.ba-throttle-debounce.js',
            'bower_components/purl/purl.js',
            'bower_components/clipboard/dist/clipboard.js',
            'bower_components/moment/moment.js',
            '.tmp/js/script.js'
          ]
        }
      }
    },

    sass: {
      build: {
        files: {
          '.tmp/css/style.css': 'src/css/style.sass'
        }
      }
    },

    autoprefixer: {
      build: {
        src: '.tmp/css/style.css',
        dest: 'build/css/style.css'
      }
    },

    imagemin: {
      options: {
        progressive: true
      },
      build: {
        files: [{
          expand: true,
          cwd: 'src/img',
          src: ['**/*.{png,jpg,gif,ico}'],
          dest: 'build/img'
        }]
      },
    },

    svgmin: {
      build: {
        files: [{
          expand: true,
          cwd: 'src/svg',
          src: ['**/*.svg'],
          dest: 'build/svg'
        }]
      }
    },

    browserSync: {
      files: {
        src: ['build/**/*']
      },
      options: {
        watchTask: true,
        server: {
          baseDir: 'build'
        }
      }
    },

    watch: {
      copy: {
        files: ['src/**/*.html'],
        tasks: ['copy:build']
      },
      coffee: {
        files: ['src/js/script.coffee'],
        tasks: ['coffee']
      },
      uglify: {
        files: ['.tmp/js/**/*.js'],
        tasks: ['uglify']
      },
      sass: {
        files: ['src/css/*.sass'],
        tasks: ['sass']
      },
      autoprefixer: {
        files: ['.tmp/css/style.css'],
        tasks: ['autoprefixer']
      },
      imagemin: {
        files: ['src/img/*.*'],
        tasks: ['imagemin']
      },
      reload: {
        files: ['build/**/*.{html,js,svg}'],
        options: {
          livereload: true
        }
      },
      livereload: {
        files: ['build/css/style.css'],
        options: {
          livereload: true
        }
      }
    },

    'gh-pages': {
      options: {
        base: 'build'
      },
      src: ['**']
    }
  });

  grunt.registerTask('setup', [
    'clean',
    'copy',
    'sass',
    'autoprefixer',
    'imagemin',
    'coffee',
    'uglify',
    'svgmin'
  ]);

  grunt.registerTask('default', [
    'setup',
    'browserSync',
    'watch'
  ]);

  grunt.registerTask('deploy', [
    'gh-pages'
  ]);

};
