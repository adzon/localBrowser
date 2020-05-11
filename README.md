# localBrowser
自动化系统本地浏览器

要求本地安装 Node.js 环境

进入程序目录，执行命令，安装依赖包

```
npm install
```

然后执行命令

```
npm install -g bytenode
```

最后执行命令启动服务即可

Windows 系统

```
bytenode app-win.jsc -s "你的自动化域名"
```

Mac 系统

```
bytenode app-mac.jsc -s "你的自动化域名"
```

保持窗口开启，即可在后台打开本地浏览器了。

注意：使用 Luminati 的用户，需要为你本地 IP 添加白名单，尽可能使用 VPS/服务器来操作，速度快，管理也方便。