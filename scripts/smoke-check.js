const fs = require("fs");
const path = require("path");

const root = process.cwd();
const files = {
  indexHtml: path.join(root, "index.html"),
  mainJs: path.join(root, "src", "main.js"),
  appVue: path.join(root, "src", "App.vue"),
  stylesCss: path.join(root, "src", "styles.css")
};

function fail(message) {
  console.error(`[smoke] FAIL: ${message}`);
  process.exit(1);
}

function assertFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`missing file: ${filePath}`);
  }
}

function assertContains(source, pattern, label) {
  if (!pattern.test(source)) {
    fail(`missing ${label}`);
  }
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

Object.values(files).forEach(assertFile);

const indexHtml = fs.readFileSync(files.indexHtml, "utf8");
const mainJs = fs.readFileSync(files.mainJs, "utf8");
const appVue = fs.readFileSync(files.appVue, "utf8");
const stylesCss = fs.readFileSync(files.stylesCss, "utf8");

assertContains(indexHtml, /<div id="app"><\/div>/, "Vite app root");
assertContains(indexHtml, /<script type="module" src="\/src\/main\.js"><\/script>/, "Vite main entry");
assertContains(mainJs, /import\s+App\s+from\s+"\.\/App\.vue"/, "App.vue import");
assertContains(mainJs, /import\s+"\.\/styles\.css"/, "styles.css import");

const keyGlobalModels = [
  "themeColor",
  "pageBackgroundColor",
  "profileHeaderBgColor",
  "profileHeaderBgOpacity",
  "borderAccentColor",
  "timelineAccentColor",
  "timelineCompanyColor",
  "timelineRoleColor",
  "moduleRailColor",
  "moduleTitleColor",
  "iconGlobalColor",
  "printScale",
  "printTitleLineFadeStart"
];

keyGlobalModels.forEach((key) => {
  assertContains(appVue, new RegExp(`v-model(?:\\.[a-z]+)?="${escapeRegExp(key)}"`), `v-model for ${key}`);
});

const keyModuleModels = [
  "module.moduleBorderColor",
  "module.moduleTimelineColor",
  "module.moduleCompanyColor",
  "module.moduleRoleColor",
  "module.moduleRailColor",
  "module.moduleTitleColor",
  "module.iconColor",
  "module.surfaceColor"
];

keyModuleModels.forEach((key) => {
  assertContains(appVue, new RegExp(`v-model="${escapeRegExp(key)}"`), `module v-model for ${key}`);
});

const keyResumeVars = [
  "--accent-border",
  "--accent-timeline",
  "--accent-company",
  "--accent-role",
  "--accent-rail",
  "--accent-title",
  "--profile-bg",
  "--page-bg",
  "--print-scale",
  "--title-line-fade-start"
];

keyResumeVars.forEach((cssVar) => {
  assertContains(appVue, new RegExp(`"${cssVar}"\\s*:`), `resumeStyle output ${cssVar}`);
});

const keyModuleVars = [
  "--module-border",
  "--module-timeline",
  "--module-company",
  "--module-role",
  "--module-rail",
  "--module-title",
  "--module-icon",
  "--module-surface"
];

keyModuleVars.forEach((cssVar) => {
  assertContains(appVue, new RegExp(`"${cssVar}"\\s*:`), `moduleStyle output ${cssVar}`);
});

assertContains(stylesCss, /timeline-head strong[\s\S]*var\(--module-company,\s*var\(--accent-company/, "company color CSS variable chain");
assertContains(stylesCss, /timeline-head em[\s\S]*var\(--module-role,\s*var\(--accent-role/, "role color CSS variable chain");
assertContains(stylesCss, /resume-section::after[\s\S]*var\(--module-rail/, "module rail CSS variable chain");
assertContains(stylesCss, /module-timeline \.timeline-item::before[\s\S]*var\(--module-timeline/, "timeline dot CSS variable chain");
assertContains(stylesCss, /resume\.theme-glass-aurora[\s\S]*resume\.theme-soft-nordic/, "theme override block");

const templateMatches = appVue.match(/value:\s*"(glass-aurora|soft-nordic)"/g) || [];
if (templateMatches.length !== 2) {
  fail(`unexpected template options count: expected 2, got ${templateMatches.length}`);
}

console.log("[smoke] PASS");
