(() => {
  if (!window.Vue) {
    alert("Vue 加载失败，请检查网络后刷新页面。");
    return;
  }

  const { createApp, nextTick } = window.Vue;
  const DEFAULT_AVATAR = new URL("./assets/default-avatar.jpg", window.location.href).href;
  const PLACEHOLDER_IMAGE = new URL("./assets/placeholder-image.jpg", window.location.href).href;
  const SERVER_EXPORT_URL = "http://127.0.0.1:8787/api/export-pdf";
  const A4_HEIGHT_MM = 297;
  const HISTORY_LIMIT = 120;
  const DEFAULT_THEME_COLOR = "#2457f5";
  const DEFAULT_PROFILE_BG_COLOR = "#f7faff";
  const DEFAULT_PAGE_BG_COLOR = "#ffffff";
  const DEFAULT_MODULE_SURFACE_COLOR = "#ffffff";
  const DEFAULT_AVATAR_VIEW = {
    scale: 100,
    x: 50,
    y: 50
  };

  const FONT_OPTIONS = [
    { key: "noto-sans", label: "Noto Sans SC（现代）", stack: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif', aliases: "noto sans 思源黑体 sans-serif" },
    { key: "noto-serif", label: "Noto Serif SC（书面）", stack: '"Noto Serif SC", "Songti SC", "STSong", serif', aliases: "noto serif 思源宋体 宋体 serif" },
    { key: "zcool", label: "ZCOOL XiaoWei（个性）", stack: '"ZCOOL XiaoWei", "Noto Serif SC", serif', aliases: "zcool xiaowei 站酷小薇" },
    { key: "mashan", label: "Ma Shan Zheng（手写）", stack: '"Ma Shan Zheng", "KaiTi", cursive', aliases: "mashan ma shan zheng 马善政 楷体 手写" }
  ];

  const ICON_OPTIONS = [
    { key: "none", label: "无", lucide: "" },
    { key: "user", label: "人物", lucide: "User" },
    { key: "briefcase", label: "工作", lucide: "BriefcaseBusiness" },
    { key: "rocket", label: "项目", lucide: "Rocket" },
    { key: "code", label: "技术", lucide: "Code" },
    { key: "book", label: "教育", lucide: "GraduationCap" },
    { key: "award", label: "荣誉", lucide: "Award" },
    { key: "star", label: "亮点", lucide: "Star" },
    { key: "palette", label: "设计", lucide: "Palette" },
    { key: "chart", label: "数据", lucide: "ChartColumn" },
    { key: "tags", label: "标签", lucide: "Tags" },
    { key: "image", label: "图片", lucide: "Image" },
    { key: "phone", label: "联系", lucide: "Phone" },
    { key: "location", label: "地点", lucide: "MapPin" },
    { key: "email", label: "邮箱", lucide: "Mail" },
    { key: "website", label: "网站", lucide: "Globe" },
    { key: "calendar", label: "日期", lucide: "CalendarDays" }
  ];

  const MODULE_ICON_DEFAULTS = {
    text: "user",
    list: "star",
    timeline: "briefcase",
    tags: "tags",
    gallery: "image"
  };

  const PROFILE_ITEM_OPTIONS = [
    { key: "phone", label: "手机", iconKey: "phone" },
    { key: "email", label: "邮箱", iconKey: "email" },
    { key: "location", label: "城市", iconKey: "location" },
    { key: "education", label: "学历", iconKey: "book" },
    { key: "birthDate", label: "出生年月", iconKey: "calendar" },
    { key: "website", label: "网站", iconKey: "website" }
  ];

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function defaultModules() {
    return [
      {
        id: uuid(),
        type: "text",
        title: "个人简介",
        content: "5年前端开发经验，熟悉 Vue / React 技术栈，擅长工程化、性能优化和设计落地。",
        useNumberedList: true,
        numberedItemsText: "主导多个中后台项目架构升级与性能优化\n沉淀组件库与工程规范，提升研发效率",
        useCustomColors: false,
        accentColor: DEFAULT_THEME_COLOR,
        iconColor: DEFAULT_THEME_COLOR,
        surfaceColor: DEFAULT_MODULE_SURFACE_COLOR,
        iconKey: "user"
      },
      {
        id: uuid(),
        type: "timeline",
        title: "工作经历",
        timelineMode: "work",
        showTimelineAxis: true,
        useCustomColors: false,
        accentColor: DEFAULT_THEME_COLOR,
        iconColor: DEFAULT_THEME_COLOR,
        surfaceColor: DEFAULT_MODULE_SURFACE_COLOR,
        entries: [{
          company: "某科技公司",
          role: "高级前端工程师",
          period: "2022.03 - 至今",
          body: "负责核心业务重构，推动组件体系建设，页面性能提升 40%。\n主导中后台组件标准化，减少重复开发。\n建设性能看板并持续优化首屏指标。",
          skillTags: "Vue3,TypeScript,性能优化,工程化"
        }],
        iconKey: "briefcase"
      },
      {
        id: uuid(),
        type: "timeline",
        title: "项目经历",
        timelineMode: "project",
        showTimelineAxis: true,
        useCustomColors: false,
        accentColor: DEFAULT_THEME_COLOR,
        iconColor: DEFAULT_THEME_COLOR,
        surfaceColor: DEFAULT_MODULE_SURFACE_COLOR,
        entries: [{
          projectName: "企业数据驾驶舱",
          overview: "0-1 设计与开发",
          body: "构建可视化平台，支持多业务线指标管理、图表配置与权限控制。\n实现可配置图表体系，支持复用与扩展。\n沉淀低代码配置方案，降低交付成本。"
        }],
        iconKey: "rocket"
      },
      {
        id: uuid(),
        type: "timeline",
        title: "教育经历",
        timelineMode: "education",
        showTimelineAxis: false,
        useCustomColors: false,
        accentColor: DEFAULT_THEME_COLOR,
        iconColor: DEFAULT_THEME_COLOR,
        surfaceColor: DEFAULT_MODULE_SURFACE_COLOR,
        entries: [{
          school: "某某大学",
          degree: "本科",
          period: "2016.09 - 2020.06",
          majorDegree: "计算机科学与技术 · 工学学士",
          body: "GPA 3.8 / 4.0，专业前 10%。\n主修数据结构、操作系统、编译原理。"
        }],
        iconKey: "book"
      }
    ];
  }

  createApp({
    data() {
      return {
        downloading: false,
        template: "minimal",
        fontKey: "noto-sans",
        fontSearchKeyword: "",
        fontOptions: [...FONT_OPTIONS],
        fontAccessSupported: typeof window.queryLocalFonts === "function",
        loadingLocalFonts: false,
        localFontCount: 0,
        localFontStatus: "",
        showModuleIcons: true,
        moduleIconBorder: true,
        profileIconBorder: true,
        moduleIconSize: 14,
        profileIconSize: 12,
        avatarBoxWidth: 100,
        avatarBoxHeight: 120,
        iconOptions: ICON_OPTIONS,
        themeColor: DEFAULT_THEME_COLOR,
        ornamentColor: DEFAULT_THEME_COLOR,
        iconGlobalColor: DEFAULT_THEME_COLOR,
        profileHeaderBgColor: DEFAULT_PROFILE_BG_COLOR,
        pageBackgroundColor: DEFAULT_PAGE_BG_COLOR,
        profileHeaderBgOpacity: 100,
        listStyle: "decimal",
        fontSize: 13,
        lineHeight: 1.45,
        pagePaddingTop: 8,
        pagePaddingBottom: 8,
        pagePaddingLeft: 8,
        pagePaddingRight: 8,
        printScale: 100,
        showPageGuide: true,
        estimatedPages: 1,
        pageGuideLines: [],
        smartPageBreak: true,
        newModuleType: "text",
        placeholderImage: PLACEHOLDER_IMAGE,
        dragIndex: null,
        dragOverIndex: null,
        profileDragIndex: null,
        profileDragOverIndex: null,
        syncingFrom: null,
        previewHistoryLeft: 16,
        previewHistoryTop: 16,
        previewHistoryVisible: false,
        historyUndoStack: [],
        historyRedoStack: [],
        historyReady: false,
        isApplyingHistory: false,
        profile: {
          name: "张三",
          title: "前端开发工程师",
          phone: "138-0000-0000",
          email: "hello@example.com",
          location: "上海",
          education: "本科",
          birthDate: "1996.08",
          website: "portfolio.example.com",
          avatar: DEFAULT_AVATAR,
          avatarScale: DEFAULT_AVATAR_VIEW.scale,
          avatarX: DEFAULT_AVATAR_VIEW.x,
          avatarY: DEFAULT_AVATAR_VIEW.y
        },
        profileVisible: {
          name: true,
          title: true,
          phone: true,
          email: true,
          location: true,
          education: true,
          birthDate: true,
          website: true,
          avatar: true
        },
        profileItemOrder: PROFILE_ITEM_OPTIONS.map((item) => item.key),
        modules: defaultModules()
      };
    },
    computed: {
      selectedFont() {
        return this.fontOptions.find((item) => item.key === this.fontKey) || this.fontOptions[0] || FONT_OPTIONS[0];
      },
      filteredFontOptions() {
        const keyword = this.normalizeSearchText(this.fontSearchKeyword);
        if (!keyword) {
          return this.fontOptions;
        }

        const matched = this.fontOptions.filter((item) => this.isFontMatched(item, keyword));
        if (matched.length) {
          return matched;
        }

        const selected = this.fontOptions.find((item) => item.key === this.fontKey);
        return selected ? [selected] : this.fontOptions;
      },
      fontAccessHint() {
        if (!this.fontAccessSupported) {
          return "当前浏览器不支持本机字体读取（建议最新版 Edge / Chrome）。";
        }
        if (this.loadingLocalFonts) {
          return "正在读取已安装字体...";
        }
        if (this.localFontStatus) {
          return this.localFontStatus;
        }
        if (this.localFontCount > 0) {
          return `已加载 ${this.localFontCount} 个本机字体`;
        }
        return "点击“读取本机字体”后可在下拉框中选择。";
      },
      avatarImageStyle() {
        const scale = this.clampNumber(this.profile.avatarScale, 80, 180, DEFAULT_AVATAR_VIEW.scale);
        const x = this.clampNumber(this.profile.avatarX, 0, 100, DEFAULT_AVATAR_VIEW.x);
        const y = this.clampNumber(this.profile.avatarY, 0, 100, DEFAULT_AVATAR_VIEW.y);
        return {
          objectPosition: `${x}% ${y}%`,
          transform: `scale(${scale / 100})`
        };
      },
      avatarBoxStyle() {
        const width = this.clampNumber(this.avatarBoxWidth, 72, 220, 100);
        const height = this.clampNumber(this.avatarBoxHeight, 90, 260, 120);
        return {
          width: `${width}px`,
          height: `${height}px`
        };
      },
      moduleIconSizeValue() {
        return this.clampNumber(this.moduleIconSize, 12, 24, 14);
      },
      profileIconSizeValue() {
        return this.clampNumber(this.profileIconSize, 10, 20, 12);
      },
      lineHeightValue() {
        return this.clampNumber(this.lineHeight, 1.2, 2, 1.45);
      },
      isPageBackgroundCustom() {
        return String(this.pageBackgroundColor || "").trim().toLowerCase() !== DEFAULT_PAGE_BG_COLOR;
      },
      pagePaddingTopValue() {
        return this.clampNumber(this.pagePaddingTop, 4, 24, 8);
      },
      pagePaddingBottomValue() {
        return this.clampNumber(this.pagePaddingBottom, 4, 24, 8);
      },
      pagePaddingLeftValue() {
        return this.clampNumber(this.pagePaddingLeft, 4, 24, 8);
      },
      pagePaddingRightValue() {
        return this.clampNumber(this.pagePaddingRight, 4, 24, 8);
      },
      previewHistoryStyle() {
        return {
          left: `${this.previewHistoryLeft}px`,
          top: `${this.previewHistoryTop}px`,
          opacity: this.previewHistoryVisible ? 1 : 0,
          visibility: this.previewHistoryVisible ? "visible" : "hidden",
          pointerEvents: this.previewHistoryVisible ? "auto" : "none"
        };
      },
      resumeStyle() {
        const headerOpacity = this.clampNumber(this.profileHeaderBgOpacity, 0, 100, 100) / 100;
        return {
          "--primary": this.themeColor,
          "--ornament": this.ornamentColor,
          "--icon-global": this.iconGlobalColor,
          "--profile-bg": this.toRgbaColor(this.profileHeaderBgColor, headerOpacity),
          "--page-bg": this.pageBackgroundColor,
          "--module-icon-size": `${this.moduleIconSizeValue}px`,
          "--profile-icon-size": `${this.profileIconSizeValue}px`,
          "--line-height": `${this.lineHeightValue}`,
          "--page-pad-top": `${this.pagePaddingTopValue}mm`,
          "--page-pad-right": `${this.pagePaddingRightValue}mm`,
          "--page-pad-bottom": `${this.pagePaddingBottomValue}mm`,
          "--page-pad-left": `${this.pagePaddingLeftValue}mm`,
          "--font-size": `${this.fontSize}px`,
          "--resume-font": this.selectedFont.stack,
          "--print-scale": `${this.printScale / 100}`
        };
      },
      profileContactItems() {
        const optionMap = PROFILE_ITEM_OPTIONS.reduce((bucket, item) => {
          bucket[item.key] = item;
          return bucket;
        }, {});
        return this.normalizedProfileItemOrder
          .map((fieldKey) => {
            const option = optionMap[fieldKey];
            if (!option || !this.profileVisible[fieldKey]) {
              return null;
            }
            const text = String(this.profile?.[fieldKey] || "").trim();
            if (!text) {
              return null;
            }
            return {
              key: fieldKey,
              iconKey: option.iconKey,
              text
            };
          })
          .filter(Boolean);
      },
      normalizedProfileItemOrder() {
        const source = Array.isArray(this.profileItemOrder) ? this.profileItemOrder : [];
        const known = PROFILE_ITEM_OPTIONS.map((item) => item.key);
        const selected = source.filter((key) => known.includes(key));
        const missing = known.filter((key) => !selected.includes(key));
        return [...selected, ...missing];
      },
      canUndo() {
        return this.historyUndoStack.length > 1;
      },
      canRedo() {
        return this.historyRedoStack.length > 0;
      },
      historySnapshotSerialized() {
        return JSON.stringify(this.buildHistorySnapshot());
      }
    },
    methods: {
      buildHistorySnapshot() {
        return {
          template: this.template,
          fontKey: this.fontKey,
          fontSearchKeyword: this.fontSearchKeyword,
          showModuleIcons: this.showModuleIcons,
          moduleIconBorder: this.moduleIconBorder,
          profileIconBorder: this.profileIconBorder,
          moduleIconSize: this.moduleIconSize,
          profileIconSize: this.profileIconSize,
          themeColor: this.themeColor,
          ornamentColor: this.ornamentColor,
          iconGlobalColor: this.iconGlobalColor,
          profileHeaderBgColor: this.profileHeaderBgColor,
          pageBackgroundColor: this.pageBackgroundColor,
          profileHeaderBgOpacity: this.profileHeaderBgOpacity,
          listStyle: this.listStyle,
          fontSize: this.fontSize,
          lineHeight: this.lineHeight,
          pagePaddingTop: this.pagePaddingTop,
          pagePaddingBottom: this.pagePaddingBottom,
          pagePaddingLeft: this.pagePaddingLeft,
          pagePaddingRight: this.pagePaddingRight,
          printScale: this.printScale,
          showPageGuide: this.showPageGuide,
          smartPageBreak: this.smartPageBreak,
          newModuleType: this.newModuleType,
          avatarBoxWidth: this.avatarBoxWidth,
          avatarBoxHeight: this.avatarBoxHeight,
          profile: this.profile,
          profileVisible: this.profileVisible,
          profileItemOrder: this.profileItemOrder,
          modules: this.modules
        };
      },
      initializeHistory() {
        this.historyUndoStack = [this.historySnapshotSerialized];
        this.historyRedoStack = [];
        this.historyReady = true;
      },
      recordHistorySnapshot(serialized) {
        const last = this.historyUndoStack[this.historyUndoStack.length - 1];
        if (last === serialized) {
          return;
        }
        this.historyUndoStack.push(serialized);
        if (this.historyUndoStack.length > HISTORY_LIMIT) {
          this.historyUndoStack.shift();
        }
        this.historyRedoStack = [];
      },
      applyHistorySnapshot(serialized) {
        if (!serialized) {
          return;
        }
        const snapshot = JSON.parse(serialized);
        this.isApplyingHistory = true;

        this.template = snapshot.template;
        this.fontKey = snapshot.fontKey;
        this.fontSearchKeyword = snapshot.fontSearchKeyword;
        this.showModuleIcons = snapshot.showModuleIcons;
        this.moduleIconBorder = snapshot.moduleIconBorder;
        this.profileIconBorder = snapshot.profileIconBorder;
        this.moduleIconSize = snapshot.moduleIconSize;
        this.profileIconSize = snapshot.profileIconSize;
        this.themeColor = snapshot.themeColor;
        this.ornamentColor = snapshot.ornamentColor;
        this.iconGlobalColor = snapshot.iconGlobalColor;
        this.profileHeaderBgColor = snapshot.profileHeaderBgColor;
        this.pageBackgroundColor = snapshot.pageBackgroundColor ?? DEFAULT_PAGE_BG_COLOR;
        this.profileHeaderBgOpacity = snapshot.profileHeaderBgOpacity;
        this.listStyle = snapshot.listStyle;
        this.fontSize = snapshot.fontSize;
        this.lineHeight = snapshot.lineHeight;
        this.pagePaddingTop = snapshot.pagePaddingTop ?? snapshot.pagePaddingVertical ?? 8;
        this.pagePaddingBottom = snapshot.pagePaddingBottom ?? snapshot.pagePaddingVertical ?? 8;
        this.pagePaddingLeft = snapshot.pagePaddingLeft ?? snapshot.pagePaddingHorizontal ?? 8;
        this.pagePaddingRight = snapshot.pagePaddingRight ?? snapshot.pagePaddingHorizontal ?? 8;
        this.printScale = snapshot.printScale;
        this.showPageGuide = snapshot.showPageGuide;
        this.smartPageBreak = snapshot.smartPageBreak;
        this.newModuleType = snapshot.newModuleType;
        this.avatarBoxWidth = snapshot.avatarBoxWidth;
        this.avatarBoxHeight = snapshot.avatarBoxHeight;
        this.profile = snapshot.profile;
        this.profileVisible = snapshot.profileVisible;
        this.profileItemOrder = snapshot.profileItemOrder;
        this.modules = snapshot.modules;

        this.ensureModuleIcons();
        this.ensureProfileItemOrder();
        this.recalcPageEstimate();

        this.$nextTick(() => {
          this.isApplyingHistory = false;
        });
      },
      undo() {
        if (!this.canUndo) {
          return;
        }
        const current = this.historyUndoStack.pop();
        this.historyRedoStack.push(current);
        const previous = this.historyUndoStack[this.historyUndoStack.length - 1];
        this.applyHistorySnapshot(previous);
      },
      redo() {
        if (!this.canRedo) {
          return;
        }
        const next = this.historyRedoStack.pop();
        this.historyUndoStack.push(next);
        this.applyHistorySnapshot(next);
      },
      normalizeSearchText(text) {
        return String(text || "")
          .toLowerCase()
          .replace(/\s+/g, "")
          .replace(/[·・._-]/g, "");
      },
      inferFontAliasTokens(fontFamily) {
        const family = String(fontFamily || "");
        const low = family.toLowerCase();
        const alias = [];

        if (/微软雅黑|microsoft yahei|yahei/.test(low) || family.includes("微软雅黑")) alias.push("微软雅黑 weiruanyahei yahei");
        if (/苹方|pingfang/.test(low) || family.includes("苹方")) alias.push("苹方 pingfang");
        if (/黑体|heiti|hei/.test(low) || family.includes("黑体")) alias.push("黑体 heiti hei");
        if (/宋体|songti|song/.test(low) || family.includes("宋体")) alias.push("宋体 songti song");
        if (/楷体|kaiti|kai/.test(low) || family.includes("楷体")) alias.push("楷体 kaiti kai");
        if (/仿宋|fangsong/.test(low) || family.includes("仿宋")) alias.push("仿宋 fangsong");
        if (/圆体|yuanti|yuan/.test(low) || family.includes("圆")) alias.push("圆体 yuanti yuan");
        if (/隶书|lishu|li/.test(low) || family.includes("隶")) alias.push("隶书 lishu li");
        if (/思源|source han|sourcehan/.test(low) || family.includes("思源")) alias.push("思源 siyuan sourcehan");

        return alias.join(" ");
      },
      isFontMatched(option, normalizedKeyword) {
        const source = [
          option.label,
          option.stack,
          option.key,
          option.family,
          option.aliases
        ].join(" ");
        const normalizedSource = this.normalizeSearchText(source);
        return normalizedSource.includes(normalizedKeyword);
      },
      clampNumber(value, min, max, fallback) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
          return fallback;
        }
        return Math.min(max, Math.max(min, numeric));
      },
      toRgbaColor(color, alpha = 1) {
        const opacity = this.clampNumber(alpha, 0, 1, 1);
        const hex = String(color || "").trim();
        const hit = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
        if (!hit) {
          return hex || `rgba(247,250,255,${opacity})`;
        }
        const normalized = hit[1].length === 3
          ? hit[1].split("").map((item) => `${item}${item}`).join("")
          : hit[1];
        const red = Number.parseInt(normalized.slice(0, 2), 16);
        const green = Number.parseInt(normalized.slice(2, 4), 16);
        const blue = Number.parseInt(normalized.slice(4, 6), 16);
        return `rgba(${red},${green},${blue},${opacity})`;
      },
      escapeFontFamily(fontFamily) {
        return String(fontFamily || "")
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"');
      },
      buildLocalFontStack(fontFamily) {
        const escaped = this.escapeFontFamily(fontFamily);
        return `"${escaped}", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`;
      },
      async loadLocalFonts() {
        if (!this.fontAccessSupported || this.loadingLocalFonts) {
          return;
        }

        this.loadingLocalFonts = true;
        this.localFontStatus = "";
        try {
          const fontList = await window.queryLocalFonts();
          const familyList = Array.from(
            new Set(
              fontList
                .map((font) => (font?.family || "").trim())
                .filter(Boolean)
            )
          ).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));

          const localOptions = familyList.map((family) => ({
            key: `local:${encodeURIComponent(family)}`,
            label: `本机 · ${family}`,
            stack: this.buildLocalFontStack(family),
            family,
            aliases: this.inferFontAliasTokens(family),
            isLocal: true
          }));

          this.fontOptions = [...FONT_OPTIONS, ...localOptions];
          this.localFontCount = localOptions.length;
          this.localFontStatus = localOptions.length ? "" : "未读取到可用字体。";

          if (!this.fontOptions.some((item) => item.key === this.fontKey)) {
            this.fontKey = "noto-sans";
          }

          this.recalcPageEstimate();
        } catch (error) {
          if (error?.name === "NotAllowedError") {
            this.localFontStatus = "字体访问被拒绝，请允许权限后重试。";
          } else {
            this.localFontStatus = `读取失败：${error?.message || "未知错误"}`;
          }
        } finally {
          this.loadingLocalFonts = false;
        }
      },
      resetAvatarView() {
        this.profile.avatarScale = DEFAULT_AVATAR_VIEW.scale;
        this.profile.avatarX = DEFAULT_AVATAR_VIEW.x;
        this.profile.avatarY = DEFAULT_AVATAR_VIEW.y;
      },
      splitTags(text) {
        return text.split(",").map((item) => item.trim()).filter(Boolean);
      },
      splitLines(text) {
        return (text || "")
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean);
      },
      normalizeTimelineModule(module) {
        if (module.type !== "timeline") {
          return;
        }
        const allowedModes = ["work", "project", "education"];
        if (!allowedModes.includes(module.timelineMode)) {
          module.timelineMode = "work";
        }
        if (typeof module.showTimelineAxis !== "boolean") {
          module.showTimelineAxis = module.timelineMode !== "education";
        }
      },
      ensureModuleColorShape(module) {
        if (typeof module.useCustomColors !== "boolean") {
          module.useCustomColors = false;
        }
        if (typeof module.accentColor !== "string") {
          module.accentColor = this.ornamentColor;
        }
        if (typeof module.iconColor !== "string") {
          module.iconColor = this.iconGlobalColor;
        }
        if (typeof module.surfaceColor !== "string") {
          module.surfaceColor = "#ffffff";
        }
      },
      moduleStyle(module) {
        if (!module.useCustomColors) {
          return null;
        }
        return {
          "--module-accent": module.accentColor,
          "--module-icon": module.iconColor,
          "--module-surface": module.surfaceColor
        };
      },
      defaultIconByType(type) {
        return MODULE_ICON_DEFAULTS[type] || "star";
      },
      getIconSvg(iconKey, size = 14) {
        if (!iconKey || iconKey === "none") {
          return "";
        }
        const target = this.iconOptions.find((item) => item.key === iconKey);
        const iconName = target?.lucide;
        if (!iconName || !window.lucide || !window.lucide.icons || typeof window.lucide.createElement !== "function") {
          return "";
        }
        const iconNode = window.lucide.icons[iconName];
        if (!iconNode) {
          return "";
        }
        const svgEl = window.lucide.createElement(iconNode, {
          width: size,
          height: size,
          "stroke-width": 2,
          class: "module-lucide-icon"
        });
        return svgEl?.outerHTML || "";
      },
      moduleIconSvg(module) {
        if (!this.showModuleIcons) {
          return "";
        }
        const iconKey = module.iconKey || this.defaultIconByType(module.type);
        return this.getIconSvg(iconKey, this.moduleIconSizeValue);
      },
      profileFieldLabel(fieldKey) {
        return PROFILE_ITEM_OPTIONS.find((item) => item.key === fieldKey)?.label || fieldKey;
      },
      moduleTypeLabel(type) {
        const labels = {
          text: "文本",
          list: "列表",
          timeline: "经历",
          tags: "标签",
          gallery: "图片"
        };
        return labels[type] || type;
      },
      ensureProfileItemOrder() {
        this.profileItemOrder = this.normalizedProfileItemOrder;
      },
      resetThemeColor() {
        this.themeColor = DEFAULT_THEME_COLOR;
      },
      resetProfileHeaderBgColor() {
        this.profileHeaderBgColor = DEFAULT_PROFILE_BG_COLOR;
      },
      resetPageBackgroundColor() {
        this.pageBackgroundColor = DEFAULT_PAGE_BG_COLOR;
      },
      resetOrnamentColor() {
        this.ornamentColor = DEFAULT_THEME_COLOR;
      },
      resetIconGlobalColor() {
        this.iconGlobalColor = DEFAULT_THEME_COLOR;
      },
      resetModuleAccentColor(module) {
        module.accentColor = this.ornamentColor || DEFAULT_THEME_COLOR;
      },
      resetModuleIconColor(module) {
        module.iconColor = this.iconGlobalColor || DEFAULT_THEME_COLOR;
      },
      resetModuleSurfaceColor(module) {
        module.surfaceColor = DEFAULT_MODULE_SURFACE_COLOR;
      },
      onProfileDragStart(index) {
        this.profileDragIndex = index;
        this.profileDragOverIndex = index;
      },
      onProfileDragOver(index) {
        this.profileDragOverIndex = index;
      },
      onProfileDrop(index) {
        if (this.profileDragIndex === null || this.profileDragIndex === index) {
          this.onProfileDragEnd();
          return;
        }
        const copied = [...this.normalizedProfileItemOrder];
        const [picked] = copied.splice(this.profileDragIndex, 1);
        copied.splice(index, 0, picked);
        this.profileItemOrder = copied;
        this.onProfileDragEnd();
        this.recalcPageEstimate();
      },
      onProfileDragEnd() {
        this.profileDragIndex = null;
        this.profileDragOverIndex = null;
      },
      ensureModuleIcons() {
        this.modules = this.modules.map((module) => ({
          ...module,
          iconKey: module.iconKey || this.defaultIconByType(module.type)
        }));
        this.modules.forEach((module) => {
          this.ensureTextModuleShape(module);
          this.normalizeTimelineModule(module);
          this.ensureModuleColorShape(module);
          if (module.type === "timeline" && Array.isArray(module.entries)) {
            module.entries.forEach((entry) => this.normalizeTimelineEntry(entry, module.timelineMode));
          }
        });
      },
      createModule(type) {
        if (type === "text") return { id: uuid(), type, title: "文本模块", content: "请输入文本内容", useNumberedList: false, numberedItemsText: "", useCustomColors: false, accentColor: this.ornamentColor, iconColor: this.iconGlobalColor, surfaceColor: "#ffffff", iconKey: this.defaultIconByType(type) };
        if (type === "list") return { id: uuid(), type, title: "列表模块", items: ["列表项 1", "列表项 2"], useCustomColors: false, accentColor: this.ornamentColor, iconColor: this.iconGlobalColor, surfaceColor: "#ffffff", iconKey: this.defaultIconByType(type) };
        if (type === "timeline") return {
          id: uuid(),
          type,
          title: "经历模块",
          timelineMode: "work",
          showTimelineAxis: true,
          useCustomColors: false,
          accentColor: this.ornamentColor,
          iconColor: this.iconGlobalColor,
          surfaceColor: "#ffffff",
          entries: [{ company: "单位名称", role: "岗位", period: "任职时间", body: "请输入正文", skillTags: "" }],
          iconKey: this.defaultIconByType(type)
        };
        if (type === "tags") return { id: uuid(), type, title: "标签模块", content: "标签一,标签二,标签三", useCustomColors: false, accentColor: this.ornamentColor, iconColor: this.iconGlobalColor, surfaceColor: "#ffffff", iconKey: this.defaultIconByType(type) };
        return { id: uuid(), type: "gallery", title: "图片模块", images: [PLACEHOLDER_IMAGE], useCustomColors: false, accentColor: this.ornamentColor, iconColor: this.iconGlobalColor, surfaceColor: "#ffffff", iconKey: this.defaultIconByType("gallery") };
      },
      addModule() {
        this.modules.push(this.createModule(this.newModuleType));
        this.recalcPageEstimate();
      },
      removeModule(moduleId) {
        this.modules = this.modules.filter((item) => item.id !== moduleId);
        this.recalcPageEstimate();
      },
      moveModule(currentIndex, step) {
        const targetIndex = currentIndex + step;
        if (targetIndex < 0 || targetIndex >= this.modules.length) return;
        const copied = [...this.modules];
        const [row] = copied.splice(currentIndex, 1);
        copied.splice(targetIndex, 0, row);
        this.modules = copied;
        this.recalcPageEstimate();
      },
      onDragStart(index) {
        this.dragIndex = index;
        this.dragOverIndex = index;
      },
      onDragOver(index) {
        this.dragOverIndex = index;
      },
      onDrop(index) {
        if (this.dragIndex === null || this.dragIndex === index) return this.onDragEnd();
        const copied = [...this.modules];
        const [picked] = copied.splice(this.dragIndex, 1);
        copied.splice(index, 0, picked);
        this.modules = copied;
        this.onDragEnd();
        this.recalcPageEstimate();
      },
      onDragEnd() {
        this.dragIndex = null;
        this.dragOverIndex = null;
      },
      syncPanelScroll(from) {
        const controlsEl = this.$refs.controlsEl;
        const previewEl = this.$refs.previewEl;
        if (!controlsEl || !previewEl) {
          return;
        }

        if (from === "preview") {
          const maxFrom = Math.max(1, previewEl.scrollHeight - previewEl.clientHeight);
          const maxTo = Math.max(1, controlsEl.scrollHeight - controlsEl.clientHeight);
          const ratio = previewEl.scrollTop / maxFrom;

          this.syncingFrom = "preview";
          controlsEl.scrollTop = ratio * maxTo;
          requestAnimationFrame(() => {
            this.syncingFrom = null;
          });
          return;
        }

        const maxFrom = Math.max(1, controlsEl.scrollHeight - controlsEl.clientHeight);
        const maxTo = Math.max(1, previewEl.scrollHeight - previewEl.clientHeight);
        const ratio = controlsEl.scrollTop / maxFrom;

        this.syncingFrom = "controls";
        previewEl.scrollTop = ratio * maxTo;
        requestAnimationFrame(() => {
          this.syncingFrom = null;
        });
      },
      onPreviewScroll() {
        if (this.syncingFrom === "controls") {
          return;
        }
        this.updatePreviewHistoryPosition();
      },
      onControlsScroll() {
        if (this.syncingFrom === "preview") {
          return;
        }
      },
      updatePreviewHistoryPosition() {
        const previewEl = this.$refs.previewEl;
        if (!previewEl) {
          this.previewHistoryVisible = false;
          return;
        }

        const rect = previewEl.getBoundingClientRect();
        const inViewport = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
        this.previewHistoryVisible = inViewport;

        if (!inViewport) {
          return;
        }

        this.previewHistoryLeft = Math.max(12, rect.left + 12);
        this.previewHistoryTop = Math.max(12, rect.top + 12);
      },
      addListItem(module) {
        module.items.push(`列表项 ${module.items.length + 1}`);
        this.recalcPageEstimate();
      },
      removeListItem(module, itemIndex) {
        module.items.splice(itemIndex, 1);
        this.recalcPageEstimate();
      },
      addTimelineEntry(module) {
        if (module.timelineMode === "project") {
          module.entries.push({
            projectName: "项目名称",
            overview: "项目概述",
            body: "请输入正文"
          });
        } else if (module.timelineMode === "education") {
          module.entries.push({
            school: "院校名称",
            degree: "学历层次",
            period: "就读时间",
            majorDegree: "专业/学历",
            body: "请输入正文"
          });
        } else {
          module.entries.push({
            company: "单位名称",
            role: "岗位",
            period: "任职时间",
            body: "请输入正文",
            skillTags: ""
          });
        }
        this.recalcPageEstimate();
      },
      onTimelineModeChange(module) {
        this.normalizeTimelineModule(module);
        module.showTimelineAxis = module.timelineMode !== "education";
        if (Array.isArray(module.entries)) {
          module.entries.forEach((entry) => this.normalizeTimelineEntry(entry, module.timelineMode));
        }
        this.recalcPageEstimate();
      },
      normalizeTimelineEntry(entry, mode = "work") {
        const oldTitle = typeof entry.title === "string" ? entry.title.trim() : "";
        const oldMeta = typeof entry.meta === "string" ? entry.meta.trim() : "";
        const oldDesc = typeof entry.desc === "string" ? entry.desc.trim() : "";

        if (mode === "project") {
          if (typeof entry.projectName !== "string") {
            entry.projectName = oldTitle || entry.company || "";
          }
          if (typeof entry.overview !== "string") {
            entry.overview = oldMeta || [entry.role, entry.period].filter(Boolean).join(" · ");
          }
          if (typeof entry.body !== "string") {
            const oldSubLines = Array.isArray(entry.subItems)
              ? entry.subItems.map((item) => (item?.text || "").trim()).filter(Boolean)
              : [];
            entry.body = [oldDesc, ...oldSubLines].filter(Boolean).join("\n");
          }
          return;
        }

        if (mode === "education") {
          if (typeof entry.school !== "string") {
            if (oldMeta.includes("·")) {
              entry.school = oldMeta.split("·")[0].trim();
            } else if (oldMeta.includes("/")) {
              entry.school = oldMeta.split("/")[0].trim();
            } else if (typeof entry.company === "string" && entry.company.trim()) {
              entry.school = entry.company.trim();
            } else {
              entry.school = oldTitle || "";
            }
          }
          if (typeof entry.degree !== "string") {
            if (typeof entry.role === "string" && entry.role.trim()) {
              entry.degree = entry.role.trim();
            } else {
              entry.degree = "";
            }
          }
          if (typeof entry.period !== "string") {
            if (oldMeta.includes("·")) {
              entry.period = oldMeta.split("·").slice(1).join("·").trim();
            } else if (oldMeta.includes("/")) {
              entry.period = oldMeta.split("/").slice(1).join("/").trim();
            } else if (typeof entry.overview === "string") {
              entry.period = entry.overview.trim();
            } else {
              entry.period = "";
            }
          }
          if (typeof entry.majorDegree !== "string") {
            if (typeof entry.overview === "string" && entry.overview.trim()) {
              entry.majorDegree = entry.overview.trim();
            } else {
              entry.majorDegree = "";
            }
          }
          if (typeof entry.body !== "string") {
            const oldSubLines = Array.isArray(entry.subItems)
              ? entry.subItems.map((item) => (item?.text || "").trim()).filter(Boolean)
              : [];
            entry.body = [oldDesc, ...oldSubLines].filter(Boolean).join("\n");
          }
          return;
        }

        if (typeof entry.company !== "string") {
          if (oldMeta.includes("·")) {
            entry.company = oldMeta.split("·")[0].trim();
          } else if (oldMeta.includes("/")) {
            entry.company = oldMeta.split("/")[0].trim();
          } else if (typeof entry.projectName === "string" && entry.projectName.trim()) {
            entry.company = entry.projectName.trim();
          } else {
            entry.company = oldMeta;
          }
        }
        if (typeof entry.role !== "string") {
          if (oldTitle) {
            entry.role = oldTitle;
          } else if (typeof entry.overview === "string" && entry.overview.includes("·")) {
            entry.role = entry.overview.split("·")[0].trim();
          } else {
            entry.role = "";
          }
        }
        if (typeof entry.period !== "string") {
          if (oldMeta.includes("·")) {
            entry.period = oldMeta.split("·").slice(1).join("·").trim();
          } else if (oldMeta.includes("/")) {
            entry.period = oldMeta.split("/").slice(1).join("/").trim();
          } else if (typeof entry.overview === "string" && entry.overview.includes("·")) {
            entry.period = entry.overview.split("·").slice(1).join("·").trim();
          } else if (typeof entry.overview === "string") {
            entry.period = entry.overview.trim();
          } else {
            entry.period = "";
          }
        }
        if (typeof entry.body !== "string") {
          const oldSubLines = Array.isArray(entry.subItems)
            ? entry.subItems.map((item) => (item?.text || "").trim()).filter(Boolean)
            : [];
          entry.body = [oldDesc, ...oldSubLines].filter(Boolean).join("\n");
        }
        if (typeof entry.skillTags !== "string") {
          entry.skillTags = "";
        }
      },
      removeTimelineEntry(module, entryIndex) {
        module.entries.splice(entryIndex, 1);
        this.recalcPageEstimate();
      },
      ensureTextModuleShape(module) {
        if (module.type !== "text") {
          return;
        }
        if (typeof module.useNumberedList !== "boolean") {
          module.useNumberedList = false;
        }
        if (typeof module.numberedItemsText !== "string") {
          module.numberedItemsText = "";
        }
      },
      addGalleryImage(module) {
        module.images.push(PLACEHOLDER_IMAGE);
        this.recalcPageEstimate();
      },
      removeGalleryImage(module, imageIndex) {
        module.images.splice(imageIndex, 1);
        this.recalcPageEstimate();
      },
      onAvatarUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          this.profile.avatar = reader.result;
          this.resetAvatarView();
          this.recalcPageEstimate();
        };
        reader.readAsDataURL(file);
      },
      onGalleryUpload(module, imageIndex, event) {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          module.images[imageIndex] = reader.result;
          this.recalcPageEstimate();
        };
        reader.readAsDataURL(file);
      },
      fitToSinglePage() {
        this.$nextTick(() => {
          const resume = this.$refs.resumeEl;
          if (!resume) return;

          const pxPerMm = resume.offsetWidth / 210;
          const fullHeightPx = resume.scrollHeight;
          const onePagePx = A4_HEIGHT_MM * pxPerMm;

          if (fullHeightPx <= onePagePx) {
            this.printScale = 100;
          } else {
            const ratio = Math.floor((onePagePx / fullHeightPx) * 100);
            this.printScale = Math.max(70, Math.min(100, ratio));
          }

          this.recalcPageEstimate();
        });
      },
      recalcPageEstimate() {
        nextTick(() => {
          const resume = this.$refs.resumeEl;
          if (!resume) return;

          const pxPerMm = resume.offsetWidth / 210;
          const scaledHeightPx = resume.scrollHeight * (this.printScale / 100);
          const onePagePx = A4_HEIGHT_MM * pxPerMm;

          const pages = Math.max(1, Math.ceil(scaledHeightPx / onePagePx));
          this.estimatedPages = pages;

          const lines = [];
          for (let i = 1; i < pages; i += 1) {
            lines.push(i * onePagePx);
          }
          this.pageGuideLines = lines;

          resume.style.setProperty("--guide-lines", lines.length ? lines.map((v) => `${v}px`).join(",") : "none");
        });
      },
      resetAll() {
        this.template = "minimal";
        this.fontSearchKeyword = "";
        const localFontOptions = this.fontOptions.filter((item) => item.isLocal);
        this.fontOptions = [...FONT_OPTIONS, ...localFontOptions];
        this.localFontCount = localFontOptions.length;
        this.localFontStatus = "";
        this.loadingLocalFonts = false;
        this.fontKey = "noto-sans";
        this.showModuleIcons = true;
        this.moduleIconBorder = true;
        this.profileIconBorder = true;
        this.moduleIconSize = 14;
        this.profileIconSize = 12;
        this.avatarBoxWidth = 100;
        this.avatarBoxHeight = 120;
        this.themeColor = DEFAULT_THEME_COLOR;
        this.ornamentColor = DEFAULT_THEME_COLOR;
        this.iconGlobalColor = DEFAULT_THEME_COLOR;
        this.profileHeaderBgColor = DEFAULT_PROFILE_BG_COLOR;
        this.pageBackgroundColor = DEFAULT_PAGE_BG_COLOR;
        this.profileHeaderBgOpacity = 100;
        this.listStyle = "decimal";
        this.fontSize = 13;
        this.lineHeight = 1.45;
        this.pagePaddingTop = 8;
        this.pagePaddingBottom = 8;
        this.pagePaddingLeft = 8;
        this.pagePaddingRight = 8;
        this.printScale = 100;
        this.showPageGuide = true;
        this.estimatedPages = 1;
        this.pageGuideLines = [];
        this.smartPageBreak = true;
        this.newModuleType = "text";
        this.dragIndex = null;
        this.dragOverIndex = null;
        this.profileDragIndex = null;
        this.profileDragOverIndex = null;
        this.profile = {
          name: "张三",
          title: "前端开发工程师",
          phone: "138-0000-0000",
          email: "hello@example.com",
          location: "上海",
          education: "本科",
          birthDate: "1996.08",
          website: "portfolio.example.com",
          avatar: DEFAULT_AVATAR,
          avatarScale: DEFAULT_AVATAR_VIEW.scale,
          avatarX: DEFAULT_AVATAR_VIEW.x,
          avatarY: DEFAULT_AVATAR_VIEW.y
        };
        this.profileVisible = {
          name: true,
          title: true,
          phone: true,
          email: true,
          location: true,
          education: true,
          birthDate: true,
          website: true,
          avatar: true
        };
        this.profileItemOrder = PROFILE_ITEM_OPTIONS.map((item) => item.key);
        this.modules = defaultModules();
        this.ensureModuleIcons();
        this.ensureProfileItemOrder();
        this.recalcPageEstimate();
      },
      buildExportHtml() {
        const resume = document.getElementById("resume");
        if (!resume) return "";

        const cssHref = new URL("./styles.css", window.location.href).href;
        const fontHref = new URL("./vendor/fonts.css", window.location.href).href;

        return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="${fontHref}" />
  <link rel="stylesheet" href="${cssHref}" />
  <style>
    body { margin: 0; background: ${this.pageBackgroundColor}; }
    .resume { margin: 0; border: none; border-radius: 0; box-shadow: none; transform: scale(${this.printScale / 100}); transform-origin: top left; }
  </style>
</head>
<body>
${resume.outerHTML}
</body>
</html>`;
      },
      openPrintWindow() {
        const html = this.buildExportHtml();
        if (!html) {
          alert("打印预览生成失败。请刷新后重试。");
          return;
        }

        const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1200,height=900");
        if (!printWindow) {
          alert("浏览器拦截了弹窗。请允许弹窗后重试打印。\n并在打印设置中关闭“页眉和页脚”。");
          return;
        }

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
          printWindow.print();
        }, 350);
      },
      fallbackPrint(reason) {
        const extra = reason ? `\n\n失败原因：${reason}` : "";
        const needPrint = window.confirm(
          `PDF 导出失败。${extra}\n\n是否改用浏览器打印另存为 PDF？\n提示：打印设置里关闭“页眉和页脚”可去掉标题和文件路径。`
        );
        if (needPrint) {
          this.openPrintWindow();
        }
      },
      async getServerHealth() {
        try {
          const resp = await fetch("http://127.0.0.1:8787/api/health", { method: "GET" });
          if (!resp.ok) {
            return null;
          }
          return await resp.json();
        } catch {
          return null;
        }
      },
      async downloadPdfViaServer() {
        const html = this.buildExportHtml();
        if (!html) throw new Error("resume html not found");

        const response = await fetch(SERVER_EXPORT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html, filename: `${this.profile.name || "resume"}-cv.pdf` })
        });

        if (!response.ok) {
          const msg = await response.text();
          throw new Error(`server export failed: ${response.status} ${msg}`);
        }

        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${this.profile.name || "resume"}-cv.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(downloadUrl);
      },
      async downloadPdf() {
        this.downloading = true;
        try {
          const health = await this.getServerHealth();
          if (!health) {
            this.fallbackPrint("未检测到导出服务。请先运行：node server.js");
            return;
          }

          if (!health.has_browser) {
            this.fallbackPrint("导出服务未检测到本机 Edge/Chrome。请安装浏览器或配置 BROWSER_BIN。");
            return;
          }

          await this.downloadPdfViaServer();
        } catch (error) {
          console.error(error);
          this.fallbackPrint(error.message || "未知错误");
        } finally {
          this.downloading = false;
        }
      }
    },
    mounted() {
      this.ensureModuleIcons();
      this.ensureProfileItemOrder();
      this.recalcPageEstimate();
      this.initializeHistory();
      window.addEventListener("resize", this.recalcPageEstimate);
      window.addEventListener("resize", this.updatePreviewHistoryPosition);
      window.addEventListener("scroll", this.updatePreviewHistoryPosition, true);
      this.$nextTick(() => {
        this.updatePreviewHistoryPosition();
      });
    },
    beforeUnmount() {
      window.removeEventListener("resize", this.recalcPageEstimate);
      window.removeEventListener("resize", this.updatePreviewHistoryPosition);
      window.removeEventListener("scroll", this.updatePreviewHistoryPosition, true);
    },
    watch: {
      historySnapshotSerialized(newValue, oldValue) {
        if (!this.historyReady || this.isApplyingHistory) {
          return;
        }
        if (newValue === oldValue) {
          return;
        }
        this.recordHistorySnapshot(newValue);
      },
      template() {
        this.recalcPageEstimate();
      },
      profileHeaderBgColor() {
        this.recalcPageEstimate();
      },
      pageBackgroundColor() {
        this.recalcPageEstimate();
      },
      profileHeaderBgOpacity() {
        this.recalcPageEstimate();
      },
      fontKey() {
        this.recalcPageEstimate();
      },
      themeColor() {
        this.recalcPageEstimate();
      },
      fontSize() {
        this.recalcPageEstimate();
      },
      lineHeight() {
        this.recalcPageEstimate();
      },
      pagePaddingTop() {
        this.recalcPageEstimate();
      },
      pagePaddingBottom() {
        this.recalcPageEstimate();
      },
      pagePaddingLeft() {
        this.recalcPageEstimate();
      },
      pagePaddingRight() {
        this.recalcPageEstimate();
      },
      printScale() {
        this.recalcPageEstimate();
      },
      smartPageBreak() {
        this.recalcPageEstimate();
      },
      showModuleIcons() {
        this.recalcPageEstimate();
      },
      moduleIconBorder() {
        this.recalcPageEstimate();
      },
      profileIconBorder() {
        this.recalcPageEstimate();
      },
      moduleIconSize() {
        this.recalcPageEstimate();
      },
      profileIconSize() {
        this.recalcPageEstimate();
      },
      avatarBoxWidth() {
        this.recalcPageEstimate();
      },
      avatarBoxHeight() {
        this.recalcPageEstimate();
      },
      profileItemOrder: {
        deep: true,
        handler() {
          this.recalcPageEstimate();
        }
      },
      modules: {
        deep: true,
        handler() {
          this.recalcPageEstimate();
        }
      }
    }
  }).mount("#app");
})();
