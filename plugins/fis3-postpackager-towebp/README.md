# fis3插件，用于把项目中jpg图片在打包时生成webp格式，并判断当前浏览器是否支持来决定加载哪种格式

+ 插件名 `fis-postpackager-towebp`

## 考虑的细节

+ src下的data和img文件夹下的jpg都转成webp

+ 所有的css文件都生成两份

+ 所有html都把jpg的src抽空

+ 嵌入js脚本，判断浏览器，加载相应的css文件和替换html的src和data-src

+ a标签的href属性图片情况考虑