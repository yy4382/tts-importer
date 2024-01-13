# Azure TTS Importer

轻松将 Azure TTS 语音合成服务导入阅读软件。现支持阅读（legado）、爱阅记、源阅读。

[Site URL](https://tts-importer.yfi.moe)

## 隐私说明

本网站服务端不会储存你的 Key 等信息。

实际上，绝大多数的逻辑全部在客户端浏览器中实现，但是如果使用“一键导入”或者是“复制网络导入链接”，由于在阅读软件客户端中脱离了当前浏览器，只能将完整的配置编码在复制或打开的 URL 中，由阅读客户端向服务器发送这个请求，服务端返回配置。在此过程中，服务端只负责将请求的`config`参数以JSON形式返回，不会储存它。

具体实现查看 <https://github.com/yy4382/tts-importer/blob/main/server/api/legado.ts>，在服务器执行的代码一共就5行。

本站托管于 Vercel 直接由本仓库代码生成。

刷新时，会从客户端浏览器的本地储存中读取过去输入的信息；方便多次打开。

## 其他

感觉 nuxt 对于这样的应用太重了，但是因为这样的项目确实需要服务端（不然在阅读软件内往哪里请求？），选了集成了服务端的 nuxt。
