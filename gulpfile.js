const { src, dest, watch, parallel, series } = require('gulp')
const sass = require('gulp-dart-sass')
const cssMin = require('gulp-csso')
const rename = require('gulp-rename')
const autoprefixer = require('gulp-autoprefixer')
const babel = require('gulp-babel')
const terser = require('gulp-terser')
const sourcemap = require('gulp-sourcemaps')
const mode = require('gulp-mode')()
const webpack = require('webpack-stream')
const del = require('del')
const debug = require('gulp-debug')
const browserSync = require('browser-sync').create()

const clean = () => {
  return del(['dist']);
}

const cleanImages = () => {
  return del(['dist/assets/images']);
}

const cleanFonts = () => {
  return del(['dist/assets/fonts']);
}

const css = () => {
  return src('src/css/index.scss')
    .pipe(mode.development(sourcemap.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(rename('app.css'))
    .pipe(mode.production(cssMin()))
    .pipe(mode.development(sourcemap.write()))
    .pipe(dest('dist'))
    .pipe(mode.development(browserSync.stream()));
}

const js = () => {
  return src('src/js/script.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(webpack({
      mode: 'development',
      devtool: 'inline-source-map'
    }))
    .pipe(mode.development(sourcemap.init({ loadMaps: true })))
    .pipe(rename('app.js'))
    .pipe(mode.production(terser({ output: {comments: false} })))
    .pipe(mode.development(sourcemap.write()))
    .pipe(dest('dist'))
    .pipe(mode.development(browserSync.stream()));
}

const repeatImg = () => {
  return src('src/assets/img/**/**/*')
    .pipe(dest('dist/assets/images'));
}

const watchForChanges = () => {
  browserSync.init({
    server: {
      baseDir: './'
    },
    online: true, 
    loglevel: 'debug'
  });
  watch('./src/css/**/*.scss', css);
  watch('.src/**/*.js', js);
  watch('./**/*.html').on('change', browserSync.reload);
  watch('src/assets/img/**/**/*',
  series(cleanImages, repeatImg));
}

exports.default = series(clean, parallel(css, js, repeatImg), watchForChanges);
exports.build = series(clean, parallel(css, js, repeatImg))
exports.debug = () => {
  return src('src/assets/img/**/**/*')
    .pipe(mode.development(debug({title: 'test_name'})))
    .pipe(dest('dist/bugs-2'))
};

