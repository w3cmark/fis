/*
 * fis
 * http://fis.baidu.com/
 */
'use strict';

module.exports = function(ret, conf, settings, opt){
    var cssfileReg = /<link\s(type=\"text\/css\"|rel=\"stylesheet\").+>/gim,//css外链匹配

        trueLoadJsfileReg = /<script.+(src=.+\/trueLoad.+\.js).+><\/script>/gim,//trueLoad组件js匹配

        jsfileReg = /<script.+(src=.+\.js).+><\/script>/gim,//普通js匹配

        remarkjsfileReg = /<!--.*<script.+(src=.+\.js).+><\/script>.*-->/gim,//注释js匹配

        bodyfileReg = /<body>[\s\S]+<\/body>/gim;//body内容匹配

    var arrMactches_css,
        requreHtml_css = '',
        requreFun_css = 'function createLink(href){'
                            +'var newlink = document.createElement("link");'
                            +'newlink.type = "text/css";'
                            +'newlink.rel = "stylesheet";'
                            +'newlink.media = "all";'
                            +'newlink.href = href;'
                            +'document.body.appendChild(newlink);'
                        +'};',
        
        arrMactches_js,
        requreHtml_js = '',
        requreFun_js = 'function createScript(url,charset){'
                            +'var newscript = document.createElement("script");'
                            +'newscript.charset = charset;'
                            +'newscript.src = url;'
                            +'newscript.async = false;'
                            +'document.body.appendChild(newscript);'
                        +'};',
        
        arrMactches_body,

        loadOverFun = 'function loadOverFun() {'
                            +'var bodyHml = $("#Jbodyhtml").val();'
                            +'bodyHml = bodyHml.replace(/&lt;/gim,"<");'
                            +'bodyHml = bodyHml.replace(/&gt;/gim,">");'
                            +'$("body").append(bodyHml);'
                            // +'console.log("loadOverFun...");'
                        +'};',

        SVGPATH = 'M3.81,59.362c4.914-10.654,13.879-18.791,25.923-23.527l8.315-3.272l-5.484,7.053 c-8.277,10.642-11.22,23.372-7.874,34.06c2.41,7.7,7.817,13.377,14.834,15.567c0.897,0.28,1.824,0.532,2.751,0.743 c1.317,0.302,2.141,1.612,1.842,2.933c-0.26,1.135-1.269,1.902-2.386,1.902c-0.181,0-0.363-0.018-0.548-0.063 c-1.05-0.238-2.101-0.522-3.12-0.843c-8.572-2.678-15.15-9.521-18.048-18.778c-3.035-9.697-1.617-20.771,3.728-30.879 C16.791,48.535,11.51,54.364,8.258,61.412c-0.565,1.229-2.017,1.765-3.25,1.199C3.782,62.042,3.245,60.587,3.81,59.362 M60.953,114.029c-0.218-1.338-1.476-2.251-2.81-2.025c-11.115,1.81-21.698,0.634-31.456-3.496 C11.055,101.887,2.534,86.483,5.481,70.172c0.241-1.326-0.642-2.604-1.973-2.841c-1.326-0.239-2.604,0.642-2.847,1.973 c-3.365,18.616,6.325,36.184,24.117,43.713c7.406,3.139,15.235,4.714,23.378,4.714c3.534-0.002,7.13-0.297,10.775-0.894 C60.266,116.621,61.171,115.362,60.953,114.029 M37.06,100.959c-1.314-0.33-2.638,0.477-2.962,1.789 c-0.324,1.312,0.476,2.636,1.789,2.964c3.217,0.796,6.63,1.194,10.219,1.194c3.455,0,7.07-0.369,10.822-1.107 c22.023-4.318,34.219-17.328,40.078-23.575c0.926-0.985,0.876-2.537-0.112-3.462c-0.986-0.924-2.533-0.874-3.458,0.112 c-5.512,5.875-16.976,18.106-37.449,22.12C49.041,102.354,42.673,102.348,37.06,100.959 M67.451,109.804 c-1.291,0.399-2.011,1.772-1.61,3.066c0.326,1.051,1.296,1.721,2.339,1.721c0.24,0,0.486-0.038,0.728-0.111 c20.514-6.384,38.353-21.873,39.774-34.529c0.543-4.853-1.483-8.868-5.708-11.312c-8.188-4.739-15.886,1.483-24.033,8.076 c-7.666,6.201-16.353,13.226-27.498,13.987c-1.351,0.093-2.368,1.258-2.278,2.609c0.095,1.35,1.257,2.389,2.609,2.275 c12.691-0.868,22.423-8.736,30.244-15.064c8.45-6.833,13.47-10.563,18.504-7.648c2.543,1.472,3.62,3.612,3.292,6.534 C102.768,88.756,87.577,103.541,67.451,109.804 M118.184,73.116c-1.349,0.102-2.356,1.278-2.256,2.626 c0.532,7.034-2.956,15.151-9.821,22.854c-12.703,14.25-33.172,23.596-53.417,24.391c-1.352,0.049-2.403,1.189-2.352,2.538 c0.053,1.317,1.139,2.354,2.447,2.354c0.032,0,0.063,0,0.096-0.003c21.53-0.842,43.323-10.814,56.878-26.021 c7.762-8.705,11.688-18.112,11.053-26.481C120.706,74.024,119.561,73.02,118.184,73.116 M155.635,6.069 c-11.11,9.629-24.017,10.082-36.277,9.72c-1.313-0.066-2.479,1.022-2.522,2.375c-0.038,1.351,1.025,2.478,2.38,2.519 c10.571,0.317,21.608,0.04,31.96-5.578c-8.125,13.001-21.137,12.316-38.178,11.42c-14.067-0.745-30.015-1.586-45.781,6.124 c-18.351,8.974-26.21,22.177-25.748,30.646c0.247,4.474,2.728,7.881,6.816,9.355c1.234,0.441,2.421,0.645,3.574,0.645 c5.025,0,9.412-3.838,14.346-8.153c5.466-4.783,12.273-10.735,22.523-14.532c4.912-1.821,6.572-5.978,5.675-9.148 c-0.818-2.886-3.996-5.532-9.046-4.524c-3.737,0.748-7.559,2.103-11.405,4.043c-0.769,0.389-4.662,2.568-7.881,4.747 c-2.915,1.971-8.311,6.978-9.086,7.756c-1.109,1.113-2.173,2.256-3.19,3.424c-0.884,1.02-0.777,2.567,0.243,3.451 c0.463,0.406,1.036,0.604,1.605,0.604c0.684,0,1.362-0.283,1.849-0.841c1.554-1.788,3.235-3.516,5.017-5.163 c0.653-0.602,4.036-3.667,9.602-7.339c4.742-3.128,9.613-4.963,14.206-5.882c1.766-0.348,3.094,0.062,3.374,1.058 c0.286,1.006-0.538,2.434-2.663,3.221C75.929,50.13,68.748,56.41,62.98,61.455c-6.002,5.255-9.306,7.934-13.037,6.588 c-2.242-0.804-3.449-2.494-3.586-5.014c-0.387-7.126,7.389-18.344,23.008-25.979c14.627-7.152,29.897-6.343,43.374-5.635 c19.575,1.034,38.063,2.006,46.805-22.678L162.642,0L155.635,6.069z M104.831,52.178c-9.535,1.983-18.539,3.857-29.992,13.876 C58.57,80.297,49.55,82.932,40.37,76.132c-4.084-3.023-6.122-9.104-5.316-15.859c0.774-6.53,5.545-22.981,32.969-34.595 c14.141-5.99,27.637-5.971,41.37-5.388c1.388,0.083,2.492-0.995,2.549-2.345c0.058-1.351-0.993-2.492-2.344-2.549 c-14.312-0.603-28.407-0.612-43.484,5.775C36.328,33.786,31.069,52.314,30.189,59.695C29.18,68.192,31.963,76,37.455,80.067 c4.213,3.116,8.393,4.505,12.633,4.505c8.794,0,17.85-5.968,27.975-14.83c10.485-9.174,18.493-10.84,27.765-12.769 c8.287-1.728,17.481-3.641,29.356-11.432c-6.409,10.7-14.584,15.898-20.879,18.414c-1.257,0.503-1.867,1.928-1.364,3.186 c0.504,1.255,1.928,1.864,3.18,1.363c8.711-3.482,20.615-11.5,27.89-29.901l3.419-8.652l-7.234,5.851 C125.167,47.947,114.829,50.097,104.831,52.178 M15.224,77.763c-0.185-1.336-1.421-2.264-2.759-2.089 c-1.34,0.187-2.276,1.422-2.091,2.763c1.001,7.259,5.666,17.186,15.758,23.278c0.396,0.24,0.831,0.352,1.264,0.352 c0.829,0,1.638-0.418,2.098-1.182c0.699-1.158,0.327-2.661-0.83-3.361C20.037,92.316,16.034,83.626,15.224,77.763',
        
        load_html = '<div id="Nie_load_id" style="position:absolute;z-index:9999;left:0;top:0;width:100%;height:100%;background:#000;overflow:hidden;margin:0;padding:0;">'+
            '<svg xmlns="http://www.w3.org/2000/svg" id="Nie_loadBg_id" style="position:absolute;width:165px;height:130px;left:50%;top:50%;margin-left:-82px;margin-top:-75px;">' +
                 '<g>' +
                  '<path fill="#aaaaaa" d="'+ SVGPATH +'" />' +
                 '</g>' +
                '</svg>'+
                '<svg xmlns="http://www.w3.org/2000/svg" id="Nie_loadTop_id" style="position:absolute;width:165px;height:130px;left:50%;top:50%;margin-left:-82px;margin-top:-75px;clip: rect(130px 165px 130px 0px);">' +
                 '<g>' +
                  '<path fill="#D82627" d="'+ SVGPATH +'" />' +
                 '</g>' +
                '</svg></div>';

                
    //concat
    fis.util.map(ret.src, function(subpath, file) {

        //html类文件，才需要做替换
        if (file.isHtmlLike) {
            var content = file.getContent();

            //过滤注释的外链js
            content = content.replace(remarkjsfileReg,'');

            //不存在trueLoad组件的直接返回
            if(!trueLoadJsfileReg.test(content)){
                return;
            }

            //抽取外链css
            arrMactches_css = content.match(cssfileReg);
            
            if(arrMactches_css){

                content = content.replace(cssfileReg,'');
            }
            
            //抽取外链js
            arrMactches_js = content.match(jsfileReg);
            
            if(arrMactches_js){

                content = content.replace(jsfileReg,'');
            }

            //创建外链css和js请求
            var csshrefReg = /href=\"(.+ss)\"/gim,
                jshrefReg = /src=\"(.+js)\"/gim,
                jscharsetReg = /charset\s?=\s?\"(\S+)\"\s/gim;//匹配js的编码类型
            if(arrMactches_css){
                
                for (var i=0;i < arrMactches_css.length ; i++){
                    var href = arrMactches_css[i].match(csshrefReg),
                        href = href[0];
                    requreHtml_css += 'createLink("'+ RegExp.$1 +'");';
                }
            }

            if(arrMactches_js){
                var html = '';
                for (var i=0;i < arrMactches_js.length ; i++)
                {
                    var href = arrMactches_js[i].match(jshrefReg),
                        href = RegExp.$1,
                        jscharset = arrMactches_js[i].match(jscharsetReg),
                        jscharset = jscharset ? RegExp.$1 : '';
                    // console.log(href+ '||'+ jscharset);
                    requreHtml_js += 'createScript("'+ href +'","'+ jscharset +'");';
                }
            }
            //textarea标签转义
            // content = content.replace(/</gim,'&lt;');
            // content = content.replace(/>/gim,'&gt;');

            //抽取body内容
            arrMactches_body = content.match(bodyfileReg);
            arrMactches_body = arrMactches_body[0].replace(/</gim,'&lt;');
            arrMactches_body = arrMactches_body.replace(/>/gim,'&gt;');

            //替换body内容
            content = content.replace(bodyfileReg,function(){
                var body = "<body>"+ 
                            load_html +
                           "<textarea id='Jbodyhtml' style='display:none'>" +
                            arrMactches_body +
                           "</textarea>" +
                           "<script type='text/javascript'>" +
                            requreFun_css +
                            requreFun_js +
                            loadOverFun +
                            requreHtml_css +
                            requreHtml_js +
                           "</script>" +
                           "</body>";
                return body;
            });

            file.setContent(content);
        }
    });

};