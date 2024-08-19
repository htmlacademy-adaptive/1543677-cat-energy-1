import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import imagemin from 'gulp-imagemin';
import webp from 'imagemin-webp';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import {
  deleteAsync
} from 'del';
import browser from 'browser-sync';



// Styles
export const styles = () => {
  return gulp.src('source/less/style.less', {
      sourcemaps: true
    })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ])).pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', {
      sourcemaps: '.'
    }))
    .pipe(browser.stream());
}

// HTML
const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('build'));
}

// Scripts
const scripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'))
}

// Images
const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(imagemin())
    .pipe(gulp.dest("build/img"))
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(gulp.dest("build/img"))
}

//webP
const createWebp = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(imagemin([
      webp({
        quality: 85
      })
    ]))
    .pipe(rename({
      extname: '.webp'
    }))
    .pipe(gulp.dest('build/img'));
}

//SVG

const svg = () => gulp.src(['source/img/*.svg', '!source/img/sprite-icons/*.svg'])
  .pipe(svgo())
  .pipe(gulp.dest('build/img'));

const sprite = () => {
  return gulp.src('source/img/sprite-icons/*.svg')
    .pipe(svgo())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img/sprite-icons'))
}

// Copy
const copy = (done) => {
  gulp.src(['source/fonts/**/*.{woff2,woff}', 'source/*.ico'], {
      base: 'source'
    })
    .pipe(gulp.dest('build'))
  done();
}

// Clean
const clean = () => {
  return deleteAsync('build');
}

// Server
const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload
const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.les', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
}

// Copy Manifest
const copyManifest = () => {
  return gulp.src('source/manifest.webmanifest')
    .pipe(gulp.dest('build'));
}

// Build
export const build = gulp.series(
  clean,
  copy,
  copyManifest,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ),
);

export default gulp.series(
  clean,
  copy,
  copyManifest,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  ));
