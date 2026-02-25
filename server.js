const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

const HOST = "127.0.0.1";
const PORT = 8787;
const ROOT = __dirname;

const MIME_MAP = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf"
};

function buildContentDisposition(rawFilename) {
  const input = typeof rawFilename === "string" ? rawFilename : "resume-cv.pdf";
  const normalized = input.endsWith(".pdf") ? input : `${input}.pdf`;

  const asciiFallback = normalized
    .replace(/[\r\n]/g, "")
    .replace(/["\\;]+/g, "_")
    .replace(/[^\x20-\x7E]/g, "_")
    .trim() || "resume-cv.pdf";

  const utf8Name = encodeURIComponent(
    normalized
      .replace(/[\r\n]/g, "")
      .replace(/["\\]+/g, "_")
      .trim() || "resume-cv.pdf"
  );

  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${utf8Name}`;
}

const EDGE_CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
];

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
];

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(data));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 10 * 1024 * 1024) {
        reject(new Error("body too large"));
      }
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function safeResolve(urlPath) {
  const cleanPath = urlPath === "/" ? "/index.html" : decodeURIComponent(urlPath);
  const filePath = path.resolve(ROOT, `.${cleanPath}`);
  if (!filePath.startsWith(ROOT)) {
    return null;
  }
  return filePath;
}

function resolveBrowserPath() {
  const custom = process.env.BROWSER_BIN;
  if (custom && fs.existsSync(custom)) {
    return custom;
  }

  for (const p of EDGE_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }

  for (const p of CHROME_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }

  return null;
}

async function renderPdfViaLocalBrowser(html) {
  const browserPath = resolveBrowserPath();
  if (!browserPath) {
    throw new Error("未找到 Edge/Chrome，请安装浏览器或设置 BROWSER_BIN。");
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "resume-print-"));
  const htmlFile = path.join(tempDir, "resume.html");
  const pdfFile = path.join(tempDir, "resume.pdf");

  const printHtml = html.replace(
    "</head>",
    `<style>@page { size: A4 portrait; margin: 0; } html,body{margin:0;padding:0;} </style></head>`
  );
  fs.writeFileSync(htmlFile, printHtml, "utf8");

  await new Promise((resolve, reject) => {
    const args = [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--print-to-pdf=${pdfFile}`,
      `file:///${htmlFile.replace(/\\/g, "/")}`
    ];

    const child = spawn(browserPath, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`浏览器打印失败(code=${code}) ${stderr}`));
        return;
      }
      resolve();
    });
  });

  if (!fs.existsSync(pdfFile)) {
    throw new Error("浏览器未生成 PDF 文件");
  }

  const buffer = fs.readFileSync(pdfFile);

  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors
  }

  return { buffer, browserPath };
}

const server = http.createServer(async (req, res) => {
  try {
    const { method, url } = req;
    const requestUrl = new URL(url, `http://${HOST}:${PORT}`);

    if (method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      res.end();
      return;
    }

    if (method === "GET" && requestUrl.pathname === "/api/health") {
      const browserPath = resolveBrowserPath();
      sendJson(res, 200, {
        ok: true,
        provider: "Local Browser (Free)",
        has_browser: Boolean(browserPath),
        browser_path: browserPath || null
      });
      return;
    }

    if (method === "POST" && requestUrl.pathname === "/api/export-pdf") {
      const rawBody = await readRequestBody(req);
      const parsed = JSON.parse(rawBody || "{}");
      const html = parsed.html;
      const filename = parsed.filename || "resume-cv.pdf";

      if (!html || typeof html !== "string") {
        sendJson(res, 400, { error: "html is required" });
        return;
      }

      const { buffer } = await renderPdfViaLocalBrowser(html);
      const contentDisposition = buildContentDisposition(filename);

      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
        "Access-Control-Allow-Origin": "*"
      });
      res.end(buffer);
      return;
    }

    if (method === "GET") {
      const filePath = safeResolve(requestUrl.pathname);
      if (!filePath) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Forbidden");
        return;
      }

      fs.readFile(filePath, (err, fileBuffer) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Not Found");
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_MAP[ext] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": contentType });
        res.end(fileBuffer);
      });
      return;
    }

    sendJson(res, 405, { error: "Method Not Allowed" });
  } catch (error) {
    sendJson(res, 500, { error: "server_error", message: error.message });
  }
});

server.listen(PORT, HOST, () => {
  const browserPath = resolveBrowserPath();
  console.log(`[resume-server] http://${HOST}:${PORT}`);
  console.log(`[resume-server] provider=Local Browser (Free)`);
  console.log(`[resume-server] has_browser=${Boolean(browserPath)}`);
  if (browserPath) {
    console.log(`[resume-server] browser=${browserPath}`);
  }
});
