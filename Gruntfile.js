module.exports = function(grunt) {

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

    jshint: {
      files: {
        src: [
          'Gruntfile.js',
          'src/js/script.js'
        ]
      },
      options: {
        eqeqeq:  true,
        forin:   true,
        latedef: true,
        undef:   true,
        unused:  true,
        eqnull:  true,
        node:    true,
        browser: true,
        jquery:  true,
        globals: {
          console:   true,
          moment:    true,
          URI:       true,
          Clipboard: true
        }
      }
    },

    jscs: {
      files: {
        src: [
          'Gruntfile.js',
          'src/js/script.js'
        ]
      },
      options: {
        requireCapitalizedConstructors: true,
        requireCurlyBraces:             true,
        requireDotNotation:             true,
        requireParenthesesAroundIIFE:   true,
        disallowEmptyBlocks:            true,
        disallowMixedSpacesAndTabs:     true,
        validateIndentation:            2,
        validateQuoteMarks:             '\''
      }
    },

    uglify: {
      build: {
        options: {
          sourceMap: true,
          mangle: false
        },
        files: {
          'build/js/lib+script.js': [
            'node_modules/jquery/dist/jquery.js',
            'node_modules/clipboard/dist/clipboard.js',
            'node_modules/moment/moment.js',
            'node_modules/throttle-debounce/dist/throttle-debounce.js',
            'node_modules/urijs/src/URI.js',
            'src/js/script.js'
          ]
        }
      }
    },

    sass: {
      options: {
        style: 'compressed'
      },
      build: {
        files: {
          '.tmp/css/style.css': 'src/css/style.scss'
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
      javascript: {
        files: ['src/js/*.js'],
        tasks: ['jshint', 'jscs', 'uglify']
      },
      sass: {
        files: ['src/css/*.scss'],
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

  // Plugins.
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-svgmin');

  // Tasks.
  grunt.registerTask('setup', [
    'clean',
    'copy',
    'sass',
    'autoprefixer',
    'imagemin',
    'jshint',
    'jscs',
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
