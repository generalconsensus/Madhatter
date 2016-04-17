var gulp = require('gulp'),
    usemin = require('gulp-usemin'),
    wrap = require('gulp-wrap'),
    connect = require('gulp-connect'),
    watch = require('gulp-watch'),
    minifyCss = require('gulp-cssnano'),
    minifyJs = require('gulp-uglify'),
    concat = require('gulp-concat'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    minifyHTML = require('gulp-htmlmin');

var paths = {
    scripts: 'src/js/**/*.*',
    styles: 'src/less/**/*.*',
    images: 'src/img/**/*.*',
    templates: 'src/templates/**/*.html',
    index: 'src/index.html',
    bower_fonts: 'src/components/**/*.{ttf,woff,eof,svg}',
    component_images: 'src/components/**/*.png'
};

/**
 * Handle bower components from index
 */
gulp.task('usemin', function() {
    return gulp.src(paths.index)
        .pipe(usemin())
        .pipe(gulp.dest('dist/'));
});

/**
 * Copy assets
 */
gulp.task('build-assets', ['copy-bower_fonts']);

gulp.task('copy-bower_fonts', function() {
    return gulp.src(paths.bower_fonts)
        .pipe(rename({
            dirname: '/fonts'
        }))
        .pipe(gulp.dest('dist/lib'));
});

/**
 * Handle custom files
 */
gulp.task('build-custom', ['custom-images', 'custom-js', 'custom-less', 'custom-templates', 'component-images']);

gulp.task('custom-images', function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest('dist/img'));
});

gulp.task('custom-js', function() {
    return gulp.src(paths.scripts)
        //.pipe(minifyJs())
        .pipe(concat('dashboard.js'))
        .pipe(gulp.dest('dist/js'));
});



gulp.task('custom-less', function() {
    return gulp.src(paths.styles)
        .pipe(less())
        .pipe(gulp.dest('dist/css'));
});

gulp.task('custom-templates', function() {
    return gulp.src(paths.templates)
        .pipe(minifyHTML())
        .pipe(gulp.dest('dist/templates'));
});

gulp.task('component-images', function() {
    return gulp.src(paths.component_images)
        .pipe(rename({
            dirname: '/images'
        }))
        .pipe(gulp.dest('dist/lib'));
});

/**
 * Watch custom files
 */
gulp.task('watch', function() {
    gulp.watch([paths.images], ['custom-images']);
    gulp.watch([paths.styles], ['custom-less']);
    gulp.watch([paths.scripts], ['custom-js']);
    gulp.watch([paths.templates], ['custom-templates']);
    gulp.watch([paths.component_images], ['component-images']);
    gulp.watch([paths.index], ['usemin']);
});

gulp.task('ace', function() {
  return gulp.src([
    'src/components/angular-ui-ace/ui-ace.js',
    'src/components/ace-builds/src-noconflict/ace.js',
    'src/components/ace-builds/src-noconflict/ext-language_tools.js',
    'src/components/ace-builds/src-noconflict/mode-javascript.js',
    'src/components/ace-builds/src-noconflict/mode-scheme.js',
    'src/components/ace-builds/src-noconflict/mode-markdown.js',
    'src/components/ace-builds/src-noconflict/theme-chrome.js',
    'src/components/ace-builds/src-noconflict/snippets/text.js',
    'src/components/ace-builds/src-noconflict/snippets/javascript.js',
    'src/components/ace-builds/src-noconflict/mode-gherkin.js',
    'src/components/ace-builds/src-noconflict/snippets/gherkin.js',
    'src/components/ace-builds/src-noconflict/mode-php.js',
    'src/components/ace-builds/src-noconflict/snippets/php.js',
    'src/components/ace-builds/src-noconflict/mode-yaml.js',
    'src/components/ace-builds/src-noconflict/snippets/yaml.js',
    'src/components/ace-builds/src-noconflict/ext-language_tools.js'
    ])
    .pipe(concat('ace.js'))
    .pipe(gulp.dest('dist/js'));
});

//gulp.task('livereload', function() {
//    gulp.src(['dist/**/*.*'])
//        .pipe(watch(['dist/**/*.*']))
//        .pipe(connect.reload());
//});

/**
 * Gulp tasks
 */
gulp.task('build', ['usemin', 'build-assets', 'build-custom', 'ace']);
gulp.task('default', ['build', 'watch']);