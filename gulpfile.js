var gulp       	= require('gulp'), // Подключаем Gulp
	sass         = require('gulp-sass'), //Подключаем Sass пакет,
	browserSync  = require('browser-sync'), // Подключаем Browser Sync
	concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
	uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
	cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
	rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
	del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
	imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
	pngquant     = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
	cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
	autoprefixer = require('gulp-autoprefixer'),
	buffer 		 = require('vinyl-buffer'),
	ghPages = require('gulp-gh-pages'), //заливка на ГХ
	merge 		 = require('merge-stream'),
	spritesmith  = require('gulp.spritesmith'),
	sourcemaps = require('gulp-sourcemaps'),
	svgSprite 	 = require('gulp-svg-sprite'), //для свг спарйтов
 	svgmin 		 = require('gulp-svgmin'), //для свг спарйтов
 	cheerio 	 = require('gulp-cheerio'), //для свг спарйтов
	replace 	 = require('gulp-replace'), //для свг спарйтов
	sftp 		= require('gulp-sftp'),
	iconfont = require('gulp-iconfont'),
	iconfontCss = require('gulp-iconfont-css'),
	mode = require('gulp-mode')({
		modes: ["prod", "dev"],
		default: "dev",
		verbose: false
	}),
	runTimestamp = Math.round(Date.now()/1000);
 	var fontName = 'Icons'; 


var assetsDir = 'app/';
var buildDir = 'markup/';

//font
// gulp.task('iconfont', function(){
//   return gulp.src(['app/images/svg/*.svg'])
//     .pipe(iconfont({
//       fontName: 'myfont', // required
//       prependUnicode: false, // recommended option
//       formats: ['ttf', 'eot', 'woff', 'svg'], // default, 'woff2' and 'svg' are available
//       // timestamp: runTimestamp, // recommended to get consistent builds when watching files
//     }))
//       .on('glyphs', function(glyphs, options) {
//         // CSS templating, e.g.
//         console.log(glyphs, options);
//       })
//     .pipe(gulp.dest('www/fonts/'));
// });


gulp.task('iconfont', function(){
  return gulp.src(['app/images/svg/*.svg']) // Source folder containing the SVG images
    .pipe(iconfontCss({
      fontName: fontName, // The name that the generated font will have
      cssClass: 'icn',
      path: 'app/sass/templates/_icons.scss', // The path to the template that will be used to create the SASS/LESS/CSS file
      targetPath: '../../sass/icons_custom_font.scss', // The path where the file will be generated
      fontPath: '../fonts/icons_custom/' // The path to the icon font file
    }))
    .pipe(iconfont({
      prependUnicode: false, // Recommended option 
      fontName: fontName, // Name of the font
      formats: ['ttf', 'eot', 'woff','svg' , 'woff2'], // The font file formats that will be created
      normalize: true,
      timestamp: runTimestamp // Recommended to get consistent builds when watching files
    }))
    .pipe(gulp.dest('app/fonts/icons_custom/'));
});


//библиотеки js
gulp.task('scripts', function() {
	return gulp.src([ // Берем все необходимые библиотеки
		'bower_components/jquery/dist/jquery.min.js', 
		// 'bower_components/bootstrap/dist/js/bootstrap.bundle.min.js',
		// 'bower_components/jcf/dist/js/jcf.js',
		// 'bower_components/jcf/dist/js/jcf.select.js',
		// 'bower_components/owl.carousel/dist/owl.carousel.min.js',
		])
		// .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
		// .pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});


//библиотеки css
gulp.task('css-libs', function() {
	return gulp.src([ // Берем все необходимые библиотеки
		// 'bower_components/animate.css/animate.css',
		// 'bower_components/jcf/dist/css/theme-minimal/jcf.css',
		// 'bower_components/owl.carousel/dist/assets/owl.carousel.min.css',
		// 'bower_components/owl.carousel/dist/assets/owl.theme.default.min.css',
		
		])
		.pipe(mode.dev(sourcemaps.init()))
		.pipe(cssnano())
		.pipe(concat('libs.min.css')) // Собираем их в кучу в новом файле libs.min.css
		.pipe(mode.dev(sourcemaps.write('')))
		.pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

gulp.task('sass', function(){ // Создаем таск Sass
	return gulp.src('app/sass/**/*.scss') // Берем источник
		.pipe(mode.dev(sourcemaps.init()))
		.pipe(sass({outputStyle: 'compact'}).on('error', sass.logError)) // Преобразуем Sass в CSS посредством gulp-sass
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
		.pipe(mode.dev(sourcemaps.write('')))
		.pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
		.pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
	browserSync({ // Выполняем browserSync
		server: { // Определяем параметры сервера
			baseDir: 'app' // Директория для сервера - app
		},
		notify: false // Отключаем уведомления
	});
});

gulp.task('watch', ['browser-sync', 'css-libs', 'sass', 'scripts'], function() {
	// gulp.watch('app/sass/**/*.scss', ['sass']); // Наблюдение за sass файлами в папке sass
	gulp.watch('app/sass/**/*.scss', function(event, cb) {
        setTimeout(function(){gulp.start('sass');},500) // задача выполниться через 500 миллисекунд и файл успеет сохраниться на диске
    });
	gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
	gulp.watch('app/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function() {
	return del.sync('app/css/*'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
	return gulp.src('app/images/**/*') // Берем все изображения из app
		.pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('markup/images')); // Выгружаем на продакшен
});

gulp.task('build', ['clean', 'scripts', 'css-libs', 'sass'], function() { // Prod task without .map

});

gulp.task('clear', function (callback) {
	return cache.clearAll();
})

gulp.task('default', ['watch']);
