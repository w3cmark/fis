'use strict';

module.exports = function(ret, settings, conf, opt) { //打包后处理
    var execFile = require('child_process').execFile;
    var binPath = require('webp-bin').path;
    var quality = conf.quality || 80;
    var pth = require('path'),
        imgfileReg = /\.(jpg|jpeg)/,
        cssfileReg = /<link\s(type=\"text\/css\"|rel=\"stylesheet\").+>/gim,//css外链匹配
        a_jpghtmlReg = /<a\s(href=\"(.+jpg|jpeg)\")>/gim,
        jpgsrcReg = /<img\s+src=\"(.+jpg|jpeg)\"/gim,
        webpLoadFun = '<script type="text/javascript">var webpSupport=function(e){var c=document.createElement("img");c.onload=function(){e.call(this,!0)};c.onerror=function(){e.call(this,!1)};c.src="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAgAmJaQAA3AA/vz0AAA="},webpSource=function(e){for(var c=document.getElementsByTagName("link"),d=0,f=c.length;d<f;d++){var a=c[d];if("stylesheet"===a.rel&&a.getAttribute("data-webp-href")){var b=a.getAttribute("data-webp-href");e&&(b=b.replace(".css","_webp.css"));a.href=b}}c=document.getElementsByTagName("img");d=0;for(f=c.length;d<f;d++)a=c[d],a.getAttribute("data-src")&&(0<a.getAttribute("data-src").indexOf("jpg")||0<a.getAttribute("data-src").indexOf("jpeg"))?(b=a.getAttribute("data-src"),e&&(b=b.replace(/jpg|jpeg/,"webp")),a.setAttribute("data-src",b)):a.getAttribute("data-webp-src")&&(0<a.getAttribute("data-webp-src").indexOf("jpg")||0<a.getAttribute("data-webp-src").indexOf("jpeg"))&&(b=a.getAttribute("data-webp-src"),e&&(b=b.replace(/jpg|jpeg/,"webp")),a.src=b);c=document.getElementsByTagName("a");d=0;for(f=c.length;d<f;d++)a=c[d],a.getAttribute("data-webp-href")&&(b=a.getAttribute("data-webp-href"),e&&(b=b.replace(/jpg|jpeg/,"webp")),a.href=b)};document.addEventListener?document.addEventListener("DOMContentLoaded",function(){webpSupport(function(e){webpSource(e)})},!1):window.onload=function(){webpSource(!1)};</script>';

    function process(id, res) {
        if (imgfileReg.test(res.ext)) {
            // console.log(res.deploy[1].to)
            imagesHandler(id, res);
        }else if(res.isHtmlLike){//html
            htmlHandler(id, res);
        }else if(res.isCssLike){//css/less/sass
            cssCopyHandler(id, res)
        }
    }

    function imagesHandler (id, res) {
        
        var path = pth.join(fis.project.getProjectPath(), res.deploy[1].to),
            path = pth.join(path, res.getHashRelease()),
            image_file_path = path.replace(imgfileReg, '.webp');
        // console.log(res.realpath)
        
        //res.realpathNoExt:文件路径加文件名（不包括文件格式后缀）
        var source_file = fis.file.wrap(path),
            image_file = fis.file.wrap(image_file_path);//实例化一个file对象
        var _tmpFile = fis.file(image_file.realpath);
        // console.log(res.realpath+'||'+res.getHashRelease())
        if(!_tmpFile.exists()){//是否存在
            fis.util.write(image_file.realpath, image_file._content);//写文件，若路径不存在则创建
        }
        // console.log(image_file.realpath + '||'+ res.realpath)
        // return;
        execFile(binPath, (res.realpath + ' -q '+ quality +' -o ' + image_file.realpath).split(/\s+/), function(err, stdout, stderr) {
        });
    }

    function htmlHandler(id, res){
        var content = res.getContent();

        //jpg外链
        var arrMactches_jpg = content.match(jpgsrcReg);
        
        if(arrMactches_jpg){

            for (var i = 0;i < arrMactches_jpg.length ; i++){
                var webp_html = arrMactches_jpg[i].replace('src=', 'data-webp-src=');
                content = content.replace(arrMactches_jpg[i], webp_html);
            }
        }

        // css外链
        var arrMactches_css = content.match(cssfileReg);
        
        if(arrMactches_css){

            for (var i = 0;i < arrMactches_css.length ; i++){
                var webp_html = arrMactches_css[i].replace('href=', 'data-webp-href=');
                content = content.replace(arrMactches_css[i], webp_html);
            }
        }
        //a标签上的图片
        var arrMactches_a = content.match(a_jpghtmlReg);
        
        if(arrMactches_a){

            for (var i = 0;i < arrMactches_a.length ; i++){
                var webp_html = arrMactches_a[i].replace('href=', 'data-webp-href=');
                content = content.replace(arrMactches_a[i], webp_html);
            }
        }

        // console.log(content);
        //插入webp检测js
        content = content.replace('<head>','<head>'+webpLoadFun);
        res.setContent(content);
    }

    function pkgprocess(id, res) {
        if(res.isCssLike){//css/less/sass
            cssCopyHandler(id, res)
        }
    }

    function cssCopyHandler(id, res){//复制css文件
        var exclude_arr = res.deploy[1].exclude,
            not_exclude = false;
        for (var i = 0, len = exclude_arr.length; i < len; i++) {
            if(res.getHashRelease().indexOf(exclude_arr[i]) < 0){
                not_exclude = true;
            }else{
                not_exclude = false;
            }
        };
        if(not_exclude){
            var path = pth.join(fis.project.getProjectPath(), res.deploy[1].to),
                path = pth.join(path, res.getHashRelease()),
                path = path.replace('.css', '_webp.css');
            var css_file = fis.file.wrap(path);
            fis.util.write(path, cssHandler(id, res));
        }
    }

    function cssHandler(id, res){//处理css文件的图片路径
        var content = res.getContent(),
            bgimgfileReg = /url\(.+\.(jpg|jpeg)\)/gim,
            arrMactches_bgimg = content.match(bgimgfileReg);
            
        if(arrMactches_bgimg){
            
            for (var i = 0;i < arrMactches_bgimg.length ; i++){
                var webp_css = arrMactches_bgimg[i].replace(RegExp.$1, 'webp');
                
                content = content.replace(arrMactches_bgimg[i], webp_css);
            }
        }
        // console.log(content)
        return content;
    }

    //map：对象枚举元素遍历
    fis.util.map(ret.src, process);
    fis.util.map(ret.pkg, pkgprocess);
};