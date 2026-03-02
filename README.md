# Vue Resume Studio (Vite + Vue)

该项目已重构为标准 `Vite + Vue` 工程，可通过 `npm run build` 产出纯静态 `dist/`，用于部署到 Gitee Pages。

## 目录结构

```text
index.html
src/
  main.js
  App.vue
  styles.css
vite.config.js
assets/
vendor/
```

## 开发与打包

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Gitee Pages base 配置

`vite.config.js` 已支持通过环境变量配置子目录部署：

- 默认：`base: "./"`（子目录部署不易 404）
- 若你希望固定仓库名路径，新增 `.env.production`：

```bash
VITE_BASE_PATH=/你的仓库名/
```

## server.js / .env 说明

- `server.js` 旧逻辑包含两部分：
  - 本地静态文件服务
  - 本地 API：`/api/health`、`/api/export-pdf`（调用本机浏览器无头导出 PDF）
- 在纯静态托管（Gitee Pages）中无法运行 Node 服务，因此该后端链路不可用。
- 已在前端改为浏览器打印导出（`window.print`），可在新窗口“另存为 PDF”。
- `.env` 中的 `BROWSER_BIN` 仅给旧 `server.js` 使用，静态部署不需要。

## 安全提示

纯前端项目中不要硬编码私密 API Key。任何写在前端代码中的密钥都可被用户看到。
