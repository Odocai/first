### 前海信息官方网站

### 安装、打包

``` bash
# 安装fis3
npm install -g fis3

# 安装依赖
npm install

# 使用FIS编译代码 参数 -w 文件监听 -wL文件监听自动刷新
fis3 release

# 预览效果,fis3 server start 启动服务器
fis3 server  start

# 关闭服务器
fis3 server stop

# 清除服务器缓存
fis3 server clean

# 生产环境打包压缩MD5戳等 打包打对应目录
fis3 release -d ./app/

```
