fis.match('**.{jpg,png,js,css,less,eot,svg,ttf,woff,ico,tpl}', {
    release: 'static/protal/$0', // 部署目录
});

fis.match('*.{js,css}', {
    useHash: false // 开启 md5 戳
});

fis.match('*.js', {
    optimizer: fis.plugin('uglify-js', {
    })
});

fis.match('**/*.less', {
    rExt: '.css', // from .less to .css
    parser: fis.plugin('less', {
        // fis-parser-less option
    })
});

fis.match('::packager', {
  spriter: fis.plugin('csssprites')
});

// fis.match('**.js', {
//   optimizer: fis.plugin('uglify-js')
// });

fis.match('**.{css,less}', {
  useSprite: true,
  optimizer: fis.plugin('clean-css')
});

fis.match('**.png', {
  optimizer: fis.plugin('png-compressor')
});