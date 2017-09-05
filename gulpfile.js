const gulp = require('gulp');

// CSS.
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const postcssCalc = require('postcss-calc');
const postcssImport = require('postcss-import');
const postcssMixins = require('postcss-mixins');
const postcssNesting = require('postcss-nesting');
const postcssVariables = require('postcss-simple-vars');

// JS.
const browserify = require('browserify');
const uglify = require('gulp-uglify');

// Images.
const imagemin = require('gulp-imagemin');
const svgmin = require('gulp-svgmin');

// Utilities.
const browsersync = require('browser-sync').create();
const cache = require('gulp-cache');
const del = require('del');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

// Variables.
const pkg = require('./package.json');
const srcDir = '_src';
const buildDir = './';

// Build CSS.
const postcssPlugins = [
  postcssImport,
  postcssMixins,
  postcssNesting,
  postcssVariables,
  postcssCalc({
    mediaQueries: true
  }),
  cssnano({
    autoprefixer: { browsers: "last 1 version" }
  })
];

gulp.task('build-css', function() {
  return gulp.src(srcDir + '/css/style.css')
    .pipe(postcss(postcssPlugins).on('error', handleError))
    .pipe(gulp.dest(buildDir + '/.'))
    .pipe(browsersync.stream())
});

// JS.
gulp.task('build-js', function() {
  var b = browserify({
    entries: srcDir + '/js/script.js',
    debug: true
  });

  return b.bundle()
    .pipe(source('script.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(buildDir + '/js'))
});

// Images.
gulp.task('optimize-images', function() {
  return gulp.src(srcDir + '/img/**/*.{png,jpg,gif}')
    .pipe(cache(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(buildDir + '/img'))
});

// SVG.
gulp.task('optimize-svg', function() {
  return gulp.src(srcDir + '/img/**/*.svg')
    .pipe(cache(svgmin()))
    .pipe(gulp.dest(buildDir + '/img'))
});

// Browsersync.
gulp.task('browsersync', function() {
  browsersync.init({
    server: {
      baseDir: buildDir
    },
    open: false,
    notify: false
  })
});

// Clean up.
gulp.task('clean', function() {
  return del([
    'style.css',
    'img',
    'js',
    '.tmp'
  ])
});

// Define the asset-building tasks.
const build_tasks = [
  'build-css',
  'build-js',
  'optimize-images',
  'optimize-svg'
];

// Watch for changes.
// We make sure the `browsersync` task happens first.
gulp.task('watch', ['browsersync'].concat(build_tasks), function() {
  gulp.watch(srcDir + '/css/style.css', ['build-css']);
  gulp.watch(srcDir + '/js/script.js', ['build-js']);
  gulp.watch(srcDir + '/img/**/*.{png,jpg,gif}', ['optimize-images']);
  gulp.watch(srcDir + '/img/**/*.svg', ['optimize-svg']);

  // Reload browser if non-CSS files change.
  gulp.watch('index.html').on('change', browsersync.reload);
  gulp.watch('js/*.js').on('change', browsersync.reload);
  gulp.watch('img/**/*').on('change', browsersync.reload);
});

// Default.
gulp.task('default', ['clean'], function() {
  gulp.start(build_tasks, 'watch');
});

// Handle errors.
function handleError(error) {
  console.log(error.stack);
  this.emit('end');
}
