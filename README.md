# Vue Resume Studio

基于 `Vite + Vue 3` 的简历编辑器，支持实时预览、样式配置、PDF 导出（浏览器打印为主，后端导出为可选高级功能）。

## 功能概览

- 模块化编辑（文本 / 列表 / 经历 / 标签 / 图片）
- 模块拖拽排序、收起展开
- 主题与样式配置（颜色、图标、边距、排版、标签样式等）
- PDF 导出：
  - 默认：浏览器打印（纯前端）
  - 可选：本地 `server.js` 后端导出

## 项目结构

```text
.
├─ index.html
├─ src/
│  ├─ main.js
│  ├─ App.vue
│  └─ styles.css
├─ assets/
├─ vendor/
├─ scripts/
├─ server.js
├─ vite.config.js
└─ package.json
```

## 本地开发

```bash
npm install
npm run dev
```

## 构建与预览

```bash
npm run build
npm run preview
```

可选检查：

```bash
npm run check:smoke
```

## 部署到 GitHub Pages / Gitee Pages

本项目可直接构建为纯静态文件：

```bash
npm run build
```

产物位于 `dist/`。

### `base` 路径配置

`vite.config.js` 已支持通过环境变量配置子路径部署：

- 默认：`base: "./"`（相对路径，适合大多数静态托管）
- 如需固定仓库子路径，新建 `.env.production`：

```bash
VITE_BASE_PATH=/你的仓库名/
```

## 后端导出说明（可选）

- `server.js` 仅用于本地后端导出 PDF（调用本机浏览器无头打印）
- GitHub Pages / Gitee Pages 为静态托管，**不会运行 `server.js`**
- 静态部署时请使用浏览器打印导出

## 安全说明

纯前端项目不要在代码中硬编码敏感密钥（如 API Key）。  
前端代码会暴露给所有访问者。
