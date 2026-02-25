# Vue Resume Studio（免费 PDF 导出）

## 方案说明

现在使用**本机 Edge/Chrome 无头打印**导出 PDF：

- 免费，无需任何付费 API key
- 不依赖 DocRaptor
- 后端调用本机浏览器生成 A4 PDF
- 前端第三方资源已本地化（Vue、Lucide、字体、默认图片）

## 本地资源目录

- `vendor/vue.global.prod.js`：Vue 运行时
- `vendor/lucide.js`：Lucide 图标库
- `vendor/fonts.css` + `vendor/fonts/*`：本地字体文件
- `assets/default-avatar.jpg`、`assets/placeholder-image.jpg`：默认图片

## 启动方式

### 一键启动（推荐）

双击：`start-resume.bat`

### 手动启动

```powershell
cd C:\Users\10217\vue-resume-studio
node server.js
```

浏览器打开：

```text
http://127.0.0.1:8787/
```

## 健康检查

打开：

```text
http://127.0.0.1:8787/api/health
```

返回里看：

- `has_browser: true` 才能导出
- `browser_path` 为当前检测到的浏览器路径

## 常见问题

- `has_browser: false`
  - 请安装 Edge 或 Chrome
  - 或设置环境变量 `BROWSER_BIN` 指向浏览器 exe 路径

- 导出失败后走打印
  - 在打印设置里关闭“页眉和页脚”，避免显示标题和文件路径
