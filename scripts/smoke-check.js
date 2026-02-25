const fs = require("fs");
const path = require("path");

const root = process.cwd();
const targets = {
  index: path.join(root, "index.html"),
  app: path.join(root, "app.js"),
  styles: path.join(root, "styles.css")
};

function fail(message) {
  console.error(`[smoke] FAIL: ${message}`);
  process.exit(1);
}

function countOf(source, regex) {
  const matches = source.match(regex);
  return matches ? matches.length : 0;
}

function assertContains(source, pattern, label) {
  if (!pattern.test(source)) {
    fail(`missing ${label}`);
  }
}

for (const [name, file] of Object.entries(targets)) {
  if (!fs.existsSync(file)) {
    fail(`missing file: ${name} -> ${file}`);
  }
}

const indexHtml = fs.readFileSync(targets.index, "utf8");
const appJs = fs.readFileSync(targets.app, "utf8");
const stylesCss = fs.readFileSync(targets.styles, "utf8");

assertContains(indexHtml, /<div id="app" class="layout">/, "app layout root");
assertContains(indexHtml, /<aside class="panel controls"/, "left controls panel");
assertContains(indexHtml, /<main class="panel preview"/, "preview panel");
assertContains(indexHtml, /id="resume"/, "resume root node");
assertContains(indexHtml, /v-for="\(module, moduleIndex\) in modules"/, "module editor loop");
assertContains(indexHtml, /@click="downloadPdf"/, "export action binding");
assertContains(appJs, /recalcPageEstimate\(\)/, "page estimate method");
assertContains(stylesCss, /\.layout\s*\{/, "layout style block");

const sectionOpen = countOf(indexHtml, /<section\b/g);
const sectionClose = countOf(indexHtml, /<\/section>/g);
if (sectionOpen !== sectionClose) {
  fail(`section tag mismatch: open=${sectionOpen}, close=${sectionClose}`);
}

const detailsOpen = countOf(indexHtml, /<details\b/g);
const detailsClose = countOf(indexHtml, /<\/details>/g);
if (detailsOpen !== detailsClose) {
  fail(`details tag mismatch: open=${detailsOpen}, close=${detailsClose}`);
}

if (/\? \/>/.test(indexHtml)) {
  fail("suspicious broken token '? />' found in index.html");
}

console.log("[smoke] PASS");
