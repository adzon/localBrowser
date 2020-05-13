# localBrowser
自动化系统本地浏览器

要求本地安装 Node.js 环境

进入程序目录，执行命令，安装依赖包

```
npm install
```

最后执行命令启动服务即可

```
node app.js "你的镜像域名"
```

举例，你的自动化系统地址为 http://demo.fbclient.xyz/

那么你就需要执行命令

```
node app.js demo.fbclient.xyz
```

保持窗口开启，即可在后台打开本地浏览器了。

注意：使用 Luminati 的用户，需要为你本地 IP 添加白名单，尽可能使用 VPS/服务器来操作，速度快，管理也方便。