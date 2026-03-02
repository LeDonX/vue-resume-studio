<template>
<div class="layout">
    <aside class="panel controls" ref="controlsEl" @scroll="onControlsScroll">
      <header class="header">
        <h1>简历生成工具</h1>
        <p>快速编辑 · 实时预览 · PDF 导出</p>
      </header>

      <section class="block block-profile">
        <h2>基础信息</h2>
        <label>姓名<input v-model.trim="profile.name" type="text" /></label>
        <label>求职方向<input v-model.trim="profile.title" type="text" /></label>
        <div class="grid2">
          <label>手机<input v-model.trim="profile.phone" type="text" /></label>
          <label>邮箱<input v-model.trim="profile.email" type="text" /></label>
        </div>
        <div class="grid2">
          <label>城市<input v-model.trim="profile.location" type="text" /></label>
          <label>学历<input v-model.trim="profile.education" type="text" /></label>
        </div>
        <div class="grid2">
          <label>出生年月<input v-model.trim="profile.birthDate" type="text" placeholder="如 1996.08" /></label>
          <label>网站<input v-model.trim="profile.website" type="text" /></label>
        </div>
        <label>头像上传<input type="file" accept="image/*" @change="onAvatarUpload" /></label>

        <div class="block-toggle-head profile-advanced-head">
          <span class="profile-advanced-title">头像高级设置</span>
          <button type="button" class="btn btn-xs" @click="avatarAdvancedCollapsed = !avatarAdvancedCollapsed">
            {{ avatarAdvancedCollapsed ? '展开' : '收起' }}
          </button>
        </div>

        <div v-show="!avatarAdvancedCollapsed" class="block-body-lite">
          <div class="avatar-controls">
            <p>头像显示区域</p>
            <label>头像宽度（{{ avatarBoxWidth }}px）<input v-model.number="avatarBoxWidth" type="range" min="72" max="220" step="1" /></label>
            <label>头像高度（{{ avatarBoxHeight }}px）<input v-model.number="avatarBoxHeight" type="range" min="90" max="260" step="1" /></label>
            <label>缩放（{{ profile.avatarScale }}%）<input v-model.number="profile.avatarScale" type="range" min="80" max="180" step="1" /></label>
            <label>水平位置（{{ profile.avatarX }}%）<input v-model.number="profile.avatarX" type="range" min="0" max="100" step="1" /></label>
            <label>垂直位置（{{ profile.avatarY }}%）<input v-model.number="profile.avatarY" type="range" min="0" max="100" step="1" /></label>
            <button type="button" class="btn btn-xs" @click="resetAvatarView">重置头像区域</button>
          </div>
        </div>

        <div class="block-toggle-head profile-advanced-head">
          <span class="profile-advanced-title">通用显示选项</span>
          <button type="button" class="btn btn-xs" @click="commonProfileOptionsCollapsed = !commonProfileOptionsCollapsed">
            {{ commonProfileOptionsCollapsed ? '展开' : '收起' }}
          </button>
        </div>

        <div v-show="!commonProfileOptionsCollapsed" class="block-body-lite">
          <div class="profile-order-controls">
            <p>个人信息排序（拖拽）</p>
            <div
              class="profile-order-item"
              v-for="(fieldKey, orderIndex) in normalizedProfileItemOrder"
              :key="`profile-order-${fieldKey}`"
              draggable="true"
              :class="{
                'is-dragging': profileDragIndex === orderIndex,
                'is-drag-over': profileDragOverIndex === orderIndex && profileDragIndex !== orderIndex
              }"
              @dragstart="onProfileDragStart(orderIndex)"
              @dragover.prevent="onProfileDragOver(orderIndex)"
              @drop.prevent="onProfileDrop(orderIndex)"
              @dragend="onProfileDragEnd"
            >
              <span class="drag-handle">☰</span>
              <span>{{ profileFieldLabel(fieldKey) }}</span>
            </div>
          </div>

          <div class="visibility-controls">
            <p>显示控制（勾选即显示）</p>
            <div class="visibility-checks">
              <label><input v-model="profileVisible.name" type="checkbox" />姓名</label>
              <label><input v-model="profileVisible.title" type="checkbox" />求职方向</label>
              <label><input v-model="profileVisible.phone" type="checkbox" />手机</label>
              <label><input v-model="profileVisible.email" type="checkbox" />邮箱</label>
              <label><input v-model="profileVisible.location" type="checkbox" />城市</label>
              <label><input v-model="profileVisible.education" type="checkbox" />学历</label>
              <label><input v-model="profileVisible.birthDate" type="checkbox" />出生年月</label>
              <label><input v-model="profileVisible.website" type="checkbox" />网站</label>
              <label><input v-model="profileVisible.avatar" type="checkbox" />头像</label>
            </div>
          </div>
        </div>
      </section>

      <section class="block block-theme">
        <h2>模板与样式</h2>
        <label>
          模板风格
          <select v-model="template">
            <option value="minimal">极简白</option>
            <option value="sidebar">侧栏型</option>
            <option value="card">卡片型</option>
            <option value="timeline">时间轴</option>
            <option value="contrast">对比黑白</option>
            <option value="classic">经典商务</option>
            <option value="neon">霓虹科技</option>
            <option value="editorial">杂志排版</option>
            <option value="luxury">奢华金</option>
            <option value="glass">玻璃拟态</option>
            <option value="ocean">海洋蓝调</option>
            <option value="sunset">日落暖橙</option>
            <option value="nordic">北欧留白</option>
            <option value="retro">复古纸张</option>
            <option value="mono">极黑极简</option>
            <option value="aurora">极光渐变</option>
            <option value="poster">品牌海报</option>
            <option value="cyberpunk">赛博朋克</option>
            <option value="split">分栏拼接</option>
            <option value="magazine">杂志双列</option>
            <option value="slate">深色留白</option>
            <option value="architect">建筑网格</option>
          </select>
        </label>

        <label>
          字体指定
          <select v-model="fontKey">
            <option v-for="font in filteredFontOptions" :key="font.key" :value="font.key">{{ font.label }}</option>
          </select>
        </label>

        <label>字体搜索<input v-model.trim="fontSearchKeyword" type="text" placeholder="输入字体名/拼音关键词" /></label>

        <div class="font-access-actions">
          <button type="button" class="btn btn-xs" @click="loadLocalFonts" :disabled="!fontAccessSupported || loadingLocalFonts">
            {{ loadingLocalFonts ? '读取中...' : '读取本机字体' }}
          </button>
          <p class="font-access-hint">{{ fontAccessHint }}</p>
        </div>

        <div class="control-group">
          <label><input v-model="showModuleIcons" type="checkbox" />显示模块图标</label>
          <label>模块图标大小（{{ moduleIconSize }}px）<input v-model.number="moduleIconSize" type="range" min="12" max="24" step="1" /></label>
          <label>个人图标大小（{{ profileIconSize }}px）<input v-model.number="profileIconSize" type="range" min="10" max="20" step="1" /></label>
          <label><input v-model="moduleIconBorder" type="checkbox" />模块图标显示边框</label>
          <label><input v-model="profileIconBorder" type="checkbox" />个人图标显示边框</label>
        </div>

        <div class="control-group control-group-color">
          <div class="color-field"><span>主题色</span><input v-model="themeColor" type="color" @dblclick.stop="resetThemeColor" @contextmenu.prevent="resetThemeColor" title="双击或右键重置默认色" /></div>
          <div class="color-field"><span>个人信息背景色</span><input v-model="profileHeaderBgColor" type="color" @dblclick.stop="resetProfileHeaderBgColor" @contextmenu.prevent="resetProfileHeaderBgColor" title="双击或右键重置默认色" /></div>
          <div class="color-field"><span>页面背景色</span><input v-model="pageBackgroundColor" type="color" @dblclick.stop="resetPageBackgroundColor" @contextmenu.prevent="resetPageBackgroundColor" title="双击或右键重置默认色" /></div>
          <label>个人信息背景透明度（{{ profileHeaderBgOpacity }}%）<input v-model.number="profileHeaderBgOpacity" type="range" min="0" max="100" step="1" /></label>
          <div class="color-field"><span>图案色（图标/边框/时间轴）</span><input v-model="ornamentColor" type="color" @dblclick.stop="resetOrnamentColor" @contextmenu.prevent="resetOrnamentColor" title="双击或右键重置默认色" /></div>
          <div class="color-field"><span>全局图标色</span><input v-model="iconGlobalColor" type="color" @dblclick.stop="resetIconGlobalColor" @contextmenu.prevent="resetIconGlobalColor" title="双击或右键重置默认色" /></div>
        </div>

        <div class="control-group">
          <label>
            全局编号样式
            <select v-model="listStyle">
              <option value="decimal">数字（1.2.3）</option>
              <option value="disc">圆点（•）</option>
            </select>
          </label>
          <label>字号（{{ fontSize }}px）<input v-model.number="fontSize" type="range" min="11" max="18" step="1" /></label>
          <label>行距（{{ lineHeight.toFixed(2) }}）<input v-model.number="lineHeight" type="range" min="1.2" max="2" step="0.05" /></label>
        </div>
      </section>

      <section class="block block-a4">
        <h2>A4 预览与分页</h2>
        <label><input v-model="showPageGuide" type="checkbox" />显示分页预览线</label>
        <label><input v-model="smartPageBreak" type="checkbox" />导出时避免模块断页</label>
        <label>预计页数：<strong>{{ estimatedPages }}</strong> 页</label>
      </section>

      <section class="block block-print">
        <h2>打印缩放</h2>
        <label>打印缩放（{{ printScale }}%）<input v-model.number="printScale" type="range" min="70" max="100" step="1" /></label>
        <button type="button" class="btn" @click="fitToSinglePage">自动压缩到一页</button>
      </section>

      <section class="block block-module-manage">
        <h2>模块管理</h2>
        <div class="module-create">
          <select v-model="newModuleType">
            <option value="text">文本模块</option>
            <option value="list">列表模块</option>
            <option value="timeline">经历模块</option>
            <option value="tags">标签模块</option>
            <option value="gallery">图片模块</option>
          </select>
          <button type="button" class="btn" @click="addModule">+ 添加</button>
        </div>
        <p class="drag-tip">模块支持拖拽排序，也可用上下移动按钮。</p>
      </section>

      <section
        class="block module-editor block-module-editor"
        v-for="(module, moduleIndex) in modules"
        :key="module.id"
        draggable="true"
        :class="{
          'is-dragging': dragIndex === moduleIndex,
          'is-drag-over': dragOverIndex === moduleIndex && dragIndex !== moduleIndex
        }"
        @dragstart="onDragStart(moduleIndex)"
        @dragover.prevent="onDragOver(moduleIndex)"
        @drop.prevent="onDrop(moduleIndex)"
        @dragend="onDragEnd"
      >
        <div class="module-head">
          <h3>{{ moduleIndex + 1 }}. {{ module.title }}</h3>
          <div class="module-actions">
            <button type="button" class="btn btn-xs" :disabled="moduleIndex === 0" @click="moveModule(moduleIndex, -1)">上移</button>
            <button type="button" class="btn btn-xs" :disabled="moduleIndex === modules.length - 1" @click="moveModule(moduleIndex, 1)">下移</button>
            <button type="button" class="btn btn-xs btn-danger" @click="removeModule(module.id)">删除</button>
          </div>
        </div>

        <label>模块标题<input v-model.trim="module.title" type="text" /></label>
        <label>
          模块图标
          <select v-model="module.iconKey">
            <option v-for="icon in iconOptions" :key="icon.key" :value="icon.key">{{ icon.label }}</option>
          </select>
          <span class="module-icon-preview" :class="{ 'no-border': !moduleIconBorder }" v-if="module.iconKey !== 'none'" v-html="getIconSvg(module.iconKey, moduleIconSizeValue)"></span>
        </label>
        <label><input v-model="module.useCustomColors" type="checkbox" />模块独立配色</label>
        <div v-if="module.useCustomColors" class="module-color-grid">
          <div class="color-field"><span>模块主色</span><input v-model="module.accentColor" type="color" @dblclick.stop="resetModuleAccentColor(module)" @contextmenu.prevent="resetModuleAccentColor(module)" title="双击或右键重置默认色" /></div>
          <div class="color-field"><span>图标色</span><input v-model="module.iconColor" type="color" @dblclick.stop="resetModuleIconColor(module)" @contextmenu.prevent="resetModuleIconColor(module)" title="双击或右键重置默认色" /></div>
          <div class="color-field"><span>模块背景色</span><input v-model="module.surfaceColor" type="color" @dblclick.stop="resetModuleSurfaceColor(module)" @contextmenu.prevent="resetModuleSurfaceColor(module)" title="双击或右键重置默认色" /></div>
        </div>

        <template v-if="module.type === 'text'">
          <label>内容<textarea v-model="module.content" rows="4"></textarea></label>
          <label><input v-model="module.useNumberedList" type="checkbox" />启用编号段落</label>
          <div v-if="module.useNumberedList" class="numbered-editor">
            <textarea v-model="module.numberedItemsText" rows="5" placeholder="每行一项"></textarea>
          </div>
        </template>

        <template v-else-if="module.type === 'list'">
          <div class="row" v-for="(item, itemIndex) in module.items" :key="`${module.id}-list-${itemIndex}`">
            <input v-model.trim="module.items[itemIndex]" type="text" />
            <button type="button" class="btn btn-xs btn-danger" @click="removeListItem(module, itemIndex)">删</button>
          </div>
          <button type="button" class="btn btn-xs" @click="addListItem(module)">+ 增加列表项</button>
        </template>

        <template v-else-if="module.type === 'timeline'">
          <label>
            经历类型
            <select v-model="module.timelineMode" @change="onTimelineModeChange(module)">
              <option value="work">工作经历</option>
              <option value="project">项目经历</option>
              <option value="education">教育经历</option>
            </select>
          </label>
          <label><input v-model="module.showTimelineAxis" type="checkbox" />显示时间轴</label>

          <div class="timeline-editor" v-for="(entry, entryIndex) in module.entries" :key="`${module.id}-time-${entryIndex}`">
            <div class="timeline-head-editor" v-if="module.timelineMode === 'work'">
              <input v-model.trim="entry.company" type="text" placeholder="单位名称" />
              <input v-model.trim="entry.role" type="text" placeholder="岗位" />
              <input v-model.trim="entry.period" type="text" placeholder="任职时间" />
            </div>
            <div class="timeline-head-editor" v-else-if="module.timelineMode === 'education'">
              <input v-model.trim="entry.school" type="text" placeholder="院校名称" />
              <input v-model.trim="entry.degree" type="text" placeholder="学历层次" />
              <input v-model.trim="entry.period" type="text" placeholder="就读时间" />
            </div>
            <div class="timeline-project-editor" v-else>
              <input v-model.trim="entry.projectName" type="text" placeholder="项目名称" />
              <input v-model.trim="entry.overview" type="text" placeholder="项目概述" />
            </div>
            <input v-if="module.timelineMode === 'education'" v-model.trim="entry.majorDegree" type="text" placeholder="专业 / 学历" />
            <textarea v-model="entry.body" rows="4" placeholder="正文（换行分条）"></textarea>
            <label v-if="module.timelineMode === 'work'">技能标签（逗号分隔）<input v-model="entry.skillTags" type="text" /></label>
            <button type="button" class="btn btn-xs btn-danger" @click="removeTimelineEntry(module, entryIndex)">删除条目</button>
          </div>
          <button type="button" class="btn btn-xs" @click="addTimelineEntry(module)">+ 增加条目</button>
        </template>

        <template v-else-if="module.type === 'tags'">
          <label>标签（逗号分隔）<input v-model="module.content" type="text" /></label>
        </template>

        <template v-else-if="module.type === 'gallery'">
          <div class="row" v-for="(image, imageIndex) in module.images" :key="`${module.id}-img-${imageIndex}`">
            <input v-model.trim="module.images[imageIndex]" type="text" placeholder="图片 URL" />
            <input type="file" accept="image/*" @change="onGalleryUpload(module, imageIndex, $event)" />
            <button type="button" class="btn btn-xs btn-danger" @click="removeGalleryImage(module, imageIndex)">删</button>
          </div>
          <button type="button" class="btn btn-xs" @click="addGalleryImage(module)">+ 增加图片</button>
        </template>
      </section>

      <div class="bottom-actions">
        <button type="button" class="btn" @click="resetAll">重置</button>
        <button type="button" class="btn btn-primary" :disabled="downloading" @click="downloadPdf">
          {{ downloading ? '导出中...' : '导出 PDF' }}
        </button>
      </div>
    </aside>

    <main class="panel preview" ref="previewEl" @scroll="onPreviewScroll">
      <div class="preview-topbar">
        <div class="history-actions history-actions-preview" :style="previewHistoryStyle">
          <button type="button" class="btn btn-xs" :disabled="!canUndo" @click="undo">撤销</button>
          <button type="button" class="btn btn-xs" :disabled="!canRedo" @click="redo">恢复</button>
        </div>
        <div class="preview-page-controls-inline">
          <label>上边距（{{ pagePaddingTop }}mm）<input v-model.number="pagePaddingTop" type="range" min="4" max="24" step="1" /></label>
          <label>下边距（{{ pagePaddingBottom }}mm）<input v-model.number="pagePaddingBottom" type="range" min="4" max="24" step="1" /></label>
        </div>
      </div>

      <div class="preview-side-control preview-side-left">
        <label>
          <span class="side-caption">
            <span class="side-caption-title">左边距</span>
            <span class="side-caption-value">{{ pagePaddingLeft }}mm</span>
          </span>
          <input v-model.number="pagePaddingLeft" type="range" min="4" max="24" step="1" orient="vertical" />
        </label>
      </div>
      <div class="preview-side-control preview-side-right">
        <label>
          <span class="side-caption">
            <span class="side-caption-title">右边距</span>
            <span class="side-caption-value">{{ pagePaddingRight }}mm</span>
          </span>
          <input v-model.number="pagePaddingRight" type="range" min="4" max="24" step="1" orient="vertical" />
        </label>
      </div>

      <div class="page-viewport" ref="pageViewport">
        <section
          id="resume"
          class="resume"
          :class="[`theme-${template}`, { 'show-page-guide': showPageGuide, 'custom-page-bg': isPageBackgroundCustom }]"
          :style="resumeStyle"
          ref="resumeEl"
        >
          <header class="resume-header">
            <div>
              <h1 v-if="profileVisible.name">{{ profile.name }}</h1>
              <h2 v-if="profileVisible.title">{{ profile.title }}</h2>
              <div class="contact" v-if="profileContactItems.length">
                <div class="contact-item" v-for="(item, idx) in profileContactItems" :key="`profile-item-${idx}`">
                  <span class="contact-icon" :class="{ 'no-border': !profileIconBorder }" v-html="getIconSvg(item.iconKey, profileIconSizeValue)"></span>
                  <span class="contact-text">{{ item.text }}</span>
                </div>
              </div>
            </div>
            <div class="avatar" :style="avatarBoxStyle" v-if="profileVisible.avatar"><img :src="profile.avatar" :style="avatarImageStyle" alt="头像" /></div>
          </header>

          <section class="resume-section" :class="`module-${module.type}`" :style="moduleStyle(module)" v-for="module in modules" :key="`preview-${module.id}`">
            <h3 class="section-title">
              <span v-if="moduleIconSvg(module)" class="section-icon" :class="{ 'no-border': !moduleIconBorder }" v-html="moduleIconSvg(module)"></span>
              <span>{{ module.title }}</span>
            </h3>

            <p v-if="module.type === 'text'">{{ module.content }}</p>

            <ol v-if="module.type === 'text' && module.useNumberedList && listStyle === 'decimal'" class="numbered-list">
              <li v-for="(line, lineIndex) in splitLines(module.numberedItemsText)" :key="`${module.id}-pv-numbered-${lineIndex}`">{{ line }}</li>
            </ol>
            <ul v-if="module.type === 'text' && module.useNumberedList && listStyle === 'disc'" class="bullet-list">
              <li v-for="(line, lineIndex) in splitLines(module.numberedItemsText)" :key="`${module.id}-pv-bullet-${lineIndex}`">{{ line }}</li>
            </ul>

            <ul v-else-if="module.type === 'list' && listStyle === 'disc'" class="bullet-list">
              <li v-for="(item, itemIndex) in module.items" :key="`${module.id}-pv-list-${itemIndex}`">{{ item }}</li>
            </ul>
            <ol v-else-if="module.type === 'list' && listStyle === 'decimal'" class="numbered-list">
              <li v-for="(item, itemIndex) in module.items" :key="`${module.id}-pv-list-${itemIndex}`">{{ item }}</li>
            </ol>

            <div v-else-if="module.type === 'timeline'" class="timeline" :class="{ 'timeline-no-axis': !module.showTimelineAxis }">
              <article class="timeline-item" v-for="(entry, entryIndex) in module.entries" :key="`${module.id}-pv-time-${entryIndex}`">
                <div class="timeline-head" v-if="module.timelineMode === 'work'">
                  <strong>{{ entry.company }}</strong>
                  <em>{{ entry.role }}</em>
                  <span>{{ entry.period }}</span>
                </div>
                <div class="timeline-head" v-else-if="module.timelineMode === 'education'">
                  <strong>{{ entry.school }}</strong>
                  <em>{{ entry.degree }}</em>
                  <span>{{ entry.period }}</span>
                </div>
                <div class="timeline-project-head" v-else>
                  <strong>{{ entry.projectName }}</strong>
                  <p v-if="entry.overview" class="timeline-overview">{{ entry.overview }}</p>
                </div>
                <p v-if="module.timelineMode === 'education' && entry.majorDegree" class="timeline-overview">{{ entry.majorDegree }}</p>
                <ol class="timeline-body-list" v-if="splitLines(entry.body).length && listStyle === 'decimal'">
                  <li v-for="(line, lineIndex) in splitLines(entry.body)" :key="`${module.id}-pv-time-${entryIndex}-line-${lineIndex}`">{{ line }}</li>
                </ol>
                <ul class="timeline-bullet-list" v-if="splitLines(entry.body).length && listStyle === 'disc'">
                  <li v-for="(line, lineIndex) in splitLines(entry.body)" :key="`${module.id}-pv-time-${entryIndex}-bullet-${lineIndex}`">{{ line }}</li>
                </ul>
                <div v-if="module.timelineMode === 'work' && splitTags(entry.skillTags || '').length" class="tags timeline-tags">
                  <span class="tag" v-for="(tag, tagIndex) in splitTags(entry.skillTags || '')" :key="`${module.id}-pv-time-${entryIndex}-tag-${tagIndex}`">{{ tag }}</span>
                </div>
              </article>
            </div>

            <div v-else-if="module.type === 'tags'" class="tags">
              <span class="tag" v-for="(tag, tagIndex) in splitTags(module.content)" :key="`${module.id}-pv-tag-${tagIndex}`">{{ tag }}</span>
            </div>

            <div v-else-if="module.type === 'gallery'" class="gallery">
              <img v-for="(image, imageIndex) in module.images" :key="`${module.id}-pv-img-${imageIndex}`" :src="image || placeholderImage" alt="作品图" />
            </div>
          </section>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import { nextTick } from "vue";
import defaultAvatarUrl from "../assets/default-avatar.jpg";
import placeholderImageUrl from "../assets/placeholder-image.jpg";
import appCssUrl from "./styles.css?url";
import fontCssUrl from "../vendor/fonts.css?url";

  const DEFAULT_AVATAR = defaultAvatarUrl;
  const PLACEHOLDER_IMAGE = placeholderImageUrl;
    const A4_HEIGHT_MM = 297;
  const HISTORY_LIMIT = 120;
  const DEFAULT_THEME_COLOR = "#2457f5";
  const DEFAULT_PROFILE_BG_COLOR = "#f7faff";
  const DEFAULT_PAGE_BG_COLOR = "#ffffff";
  const DEFAULT_MODULE_SURFACE_COLOR = "#ffffff";
  const DEFAULT_SKILL_TAG_STYLE = "outline";
  const DEFAULT_SKILL_TAG_SHAPE = "pill";
  const DEFAULT_SKILL_TAG_FONT_SIZE = 12;
  const DEFAULT_SKILL_TAG_GAP = 10;
  const DEFAULT_SKILL_TAG_THEME_PALETTE = buildSkillTagThemePalette(DEFAULT_THEME_COLOR);
  const DEFAULT_SKILL_TAG_TEXT_COLOR = DEFAULT_SKILL_TAG_THEME_PALETTE.textColor;
  const DEFAULT_SKILL_TAG_BG_COLOR = DEFAULT_SKILL_TAG_THEME_PALETTE.bgColor;
  const DEFAULT_SKILL_TAG_BORDER_COLOR = DEFAULT_SKILL_TAG_THEME_PALETTE.borderColor;
  const DEFAULT_SKILL_TAG_GRADIENT_FROM_COLOR = DEFAULT_SKILL_TAG_THEME_PALETTE.gradientFromColor;
  const DEFAULT_SKILL_TAG_GRADIENT_TO_COLOR = DEFAULT_SKILL_TAG_THEME_PALETTE.gradientToColor;
  const DEFAULT_SKILL_TAG_GRADIENT_DIRECTION = "vertical";
  const DEFAULT_SKILL_TAG_OUTLINE_BG_COLOR = DEFAULT_SKILL_TAG_THEME_PALETTE.outlineBgColor;
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

  function normalizeHexColor(value, fallback = DEFAULT_THEME_COLOR) {
    const source = String(value || "").trim();
    const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(source);
    if (!match) {
      if (String(fallback || "").toLowerCase() === source.toLowerCase()) {
        return "#2457f5";
      }
      return normalizeHexColor(fallback, "#2457f5");
    }
    const body = match[1].length === 3
      ? match[1].split("").map((item) => `${item}${item}`).join("")
      : match[1];
    return `#${body.toLowerCase()}`;
  }

  function mixHexColors(fromColor, toColor, ratio = 0.5) {
    const left = normalizeHexColor(fromColor, "#2457f5");
    const right = normalizeHexColor(toColor, "#ffffff");
    const weight = Math.min(1, Math.max(0, Number(ratio) || 0));
    const leftRgb = [
      Number.parseInt(left.slice(1, 3), 16),
      Number.parseInt(left.slice(3, 5), 16),
      Number.parseInt(left.slice(5, 7), 16)
    ];
    const rightRgb = [
      Number.parseInt(right.slice(1, 3), 16),
      Number.parseInt(right.slice(3, 5), 16),
      Number.parseInt(right.slice(5, 7), 16)
    ];
    const result = leftRgb.map((channel, index) => {
      const mixed = Math.round(channel + (rightRgb[index] - channel) * weight);
      return mixed.toString(16).padStart(2, "0");
    }).join("");
    return `#${result}`;
  }

  function buildSkillTagThemePalette(themeColor) {
    const base = normalizeHexColor(themeColor, DEFAULT_THEME_COLOR);
    return {
      textColor: mixHexColors(base, "#102347", 0.42),
      bgColor: mixHexColors(base, "#ffffff", 0.58),
      borderColor: mixHexColors(base, "#ffffff", 0.34),
      gradientFromColor: mixHexColors(base, "#ffffff", 0.82),
      gradientToColor: mixHexColors(base, "#ffffff", 0.66),
      outlineBgColor: mixHexColors(base, "#ffffff", 0.92)
    };
  }

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
        showModuleRail: true,
        showTitleDivider: true,
        accentColor: DEFAULT_THEME_COLOR,
        moduleBorderColor: DEFAULT_THEME_COLOR,
        moduleTimelineColor: DEFAULT_THEME_COLOR,
        moduleRailColor: DEFAULT_THEME_COLOR,
        moduleTitleColor: DEFAULT_THEME_COLOR,
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
        showModuleRail: true,
        showTitleDivider: true,
        accentColor: DEFAULT_THEME_COLOR,
        moduleBorderColor: DEFAULT_THEME_COLOR,
        moduleTimelineColor: DEFAULT_THEME_COLOR,
        moduleRailColor: DEFAULT_THEME_COLOR,
        moduleTitleColor: DEFAULT_THEME_COLOR,
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
        showModuleRail: true,
        showTitleDivider: true,
        accentColor: DEFAULT_THEME_COLOR,
        moduleBorderColor: DEFAULT_THEME_COLOR,
        moduleTimelineColor: DEFAULT_THEME_COLOR,
        moduleRailColor: DEFAULT_THEME_COLOR,
        moduleTitleColor: DEFAULT_THEME_COLOR,
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
        showModuleRail: true,
        showTitleDivider: true,
        accentColor: DEFAULT_THEME_COLOR,
        moduleBorderColor: DEFAULT_THEME_COLOR,
        moduleTimelineColor: DEFAULT_THEME_COLOR,
        moduleRailColor: DEFAULT_THEME_COLOR,
        moduleTitleColor: DEFAULT_THEME_COLOR,
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

  export default {
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
        borderAccentColor: DEFAULT_THEME_COLOR,
        timelineAccentColor: DEFAULT_THEME_COLOR,
        moduleRailColor: DEFAULT_THEME_COLOR,
        moduleTitleColor: DEFAULT_THEME_COLOR,
        profileHeaderBgColor: DEFAULT_PROFILE_BG_COLOR,
        pageBackgroundColor: DEFAULT_PAGE_BG_COLOR,
        profileHeaderBgOpacity: 100,
        listStyle: "decimal",
        skillTagStyle: DEFAULT_SKILL_TAG_STYLE,
        skillTagShape: DEFAULT_SKILL_TAG_SHAPE,
        skillTagFontSize: DEFAULT_SKILL_TAG_FONT_SIZE,
        skillTagGap: DEFAULT_SKILL_TAG_GAP,
        skillTagTextColor: DEFAULT_SKILL_TAG_TEXT_COLOR,
        skillTagBgColor: DEFAULT_SKILL_TAG_BG_COLOR,
        skillTagBorderColor: DEFAULT_SKILL_TAG_BORDER_COLOR,
        skillTagGradientFromColor: DEFAULT_SKILL_TAG_GRADIENT_FROM_COLOR,
        skillTagGradientToColor: DEFAULT_SKILL_TAG_GRADIENT_TO_COLOR,
        skillTagGradientDirection: DEFAULT_SKILL_TAG_GRADIENT_DIRECTION,
        skillTagOutlineBgColor: DEFAULT_SKILL_TAG_OUTLINE_BG_COLOR,
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
        avatarAdvancedCollapsed: true,
        commonProfileOptionsCollapsed: true,
        themeFontAdvancedCollapsed: true,
        themeStyleAdvancedCollapsed: true,
        themeIconSettingsCollapsed: true,
        themeColorSettingsCollapsed: true,
        themeModuleVisualSettingsCollapsed: true,
        themeModuleColorSettingsCollapsed: true,
        themeTypographySettingsCollapsed: true,
        themeSkillTagSettingsCollapsed: true,
        moduleManageEditorsCollapsed: true,
        recalcTimerId: null,
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
        modules: defaultModules(),
        moduleCollapsedState: {}
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
          transformOrigin: `${x}% ${y}%`,
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
        const tagStyleConfig = this.getSkillTagStyleConfig();
        const tagRadius = this.getSkillTagRadius();
        return {
          "--primary": this.themeColor,
          "--ornament": this.moduleTitleColor,
          "--icon-global": this.iconGlobalColor,
          "--accent-border": this.borderAccentColor,
          "--accent-timeline": this.timelineAccentColor,
          "--accent-rail": this.moduleRailColor,
          "--accent-title": this.moduleTitleColor,
          "--profile-bg": this.toRgbaColor(this.profileHeaderBgColor, headerOpacity),
          "--page-bg": this.pageBackgroundColor,
          "--module-icon-size": `${this.moduleIconSizeValue}px`,
          "--profile-icon-size": `${this.profileIconSizeValue}px`,
          "--line-height": `${this.lineHeightValue}`,
          "--page-pad-top": `${this.pagePaddingTopValue}mm`,
          "--page-pad-right": `${this.pagePaddingRightValue}mm`,
          "--page-pad-bottom": `${this.pagePaddingBottomValue}mm`,
          "--page-pad-left": `${this.pagePaddingLeftValue}mm`,
          "--tag-gap": `${this.clampNumber(this.skillTagGap, 6, 16, DEFAULT_SKILL_TAG_GAP)}px`,
          "--tag-font-size": `${this.clampNumber(this.skillTagFontSize, 11, 15, DEFAULT_SKILL_TAG_FONT_SIZE)}px`,
          "--tag-radius": tagRadius,
          "--tag-border": tagStyleConfig.border,
          "--tag-border-width": tagStyleConfig.borderWidth,
          "--tag-border-style": tagStyleConfig.borderStyle,
          "--tag-bg": tagStyleConfig.background,
          "--tag-color": tagStyleConfig.color,
          "--tag-shadow": tagStyleConfig.shadow,
          "--tag-font-weight": `${tagStyleConfig.weight}`,
          "--tag-letter-spacing": tagStyleConfig.letterSpacing,
          "--tag-pad-y": tagStyleConfig.paddingY,
          "--tag-pad-x": tagStyleConfig.paddingX,
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
      moduleTypeStatsText() {
        if (!Array.isArray(this.modules) || !this.modules.length) {
          return "";
        }
        const typeOrder = ["text", "list", "timeline", "tags", "gallery"];
        return typeOrder
          .map((type) => {
            const count = this.modules.filter((module) => module.type === type).length;
            if (!count) {
              return "";
            }
            return `${this.moduleTypeLabel(type)} ${count}`;
          })
          .filter(Boolean)
          .join(" · ");
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
          ornamentColor: this.moduleTitleColor,
          iconGlobalColor: this.iconGlobalColor,
          borderAccentColor: this.borderAccentColor,
          timelineAccentColor: this.timelineAccentColor,
          moduleRailColor: this.moduleRailColor,
          moduleTitleColor: this.moduleTitleColor,
          profileHeaderBgColor: this.profileHeaderBgColor,
          pageBackgroundColor: this.pageBackgroundColor,
          profileHeaderBgOpacity: this.profileHeaderBgOpacity,
          listStyle: this.listStyle,
          skillTagStyle: this.skillTagStyle,
          skillTagShape: this.skillTagShape,
          skillTagFontSize: this.skillTagFontSize,
          skillTagGap: this.skillTagGap,
          skillTagTextColor: this.skillTagTextColor,
          skillTagBgColor: this.skillTagBgColor,
          skillTagBorderColor: this.skillTagBorderColor,
          skillTagGradientFromColor: this.skillTagGradientFromColor,
          skillTagGradientToColor: this.skillTagGradientToColor,
          skillTagGradientDirection: this.skillTagGradientDirection,
          skillTagOutlineBgColor: this.skillTagOutlineBgColor,
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
        this.ornamentColor = snapshot.ornamentColor ?? snapshot.moduleTitleColor ?? DEFAULT_THEME_COLOR;
        this.iconGlobalColor = snapshot.iconGlobalColor;
        this.borderAccentColor = snapshot.borderAccentColor ?? snapshot.ornamentColor ?? DEFAULT_THEME_COLOR;
        this.timelineAccentColor = snapshot.timelineAccentColor ?? snapshot.ornamentColor ?? DEFAULT_THEME_COLOR;
        this.moduleRailColor = snapshot.moduleRailColor ?? snapshot.ornamentColor ?? DEFAULT_THEME_COLOR;
        this.moduleTitleColor = snapshot.moduleTitleColor ?? snapshot.ornamentColor ?? DEFAULT_THEME_COLOR;
        const snapshotTagPalette = buildSkillTagThemePalette(this.themeColor);
        this.profileHeaderBgColor = snapshot.profileHeaderBgColor;
        this.pageBackgroundColor = snapshot.pageBackgroundColor ?? DEFAULT_PAGE_BG_COLOR;
        this.profileHeaderBgOpacity = snapshot.profileHeaderBgOpacity;
        this.listStyle = snapshot.listStyle;
        this.skillTagStyle = snapshot.skillTagStyle ?? DEFAULT_SKILL_TAG_STYLE;
        this.skillTagShape = snapshot.skillTagShape ?? DEFAULT_SKILL_TAG_SHAPE;
        this.skillTagFontSize = snapshot.skillTagFontSize ?? DEFAULT_SKILL_TAG_FONT_SIZE;
        this.skillTagGap = snapshot.skillTagGap ?? DEFAULT_SKILL_TAG_GAP;
        this.skillTagTextColor = snapshot.skillTagTextColor ?? snapshotTagPalette.textColor;
        this.skillTagBgColor = snapshot.skillTagBgColor ?? snapshotTagPalette.bgColor;
        this.skillTagBorderColor = snapshot.skillTagBorderColor ?? snapshotTagPalette.borderColor;
        this.skillTagGradientFromColor = snapshot.skillTagGradientFromColor ?? snapshot.skillTagBgColor ?? snapshotTagPalette.gradientFromColor;
        this.skillTagGradientToColor = snapshot.skillTagGradientToColor ?? snapshot.skillTagBgColor ?? snapshotTagPalette.gradientToColor;
        this.skillTagGradientDirection = snapshot.skillTagGradientDirection ?? DEFAULT_SKILL_TAG_GRADIENT_DIRECTION;
        this.skillTagOutlineBgColor = snapshot.skillTagOutlineBgColor ?? snapshot.skillTagBgColor ?? snapshotTagPalette.outlineBgColor;
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
      getSkillTagRadius() {
        const shape = String(this.skillTagShape || DEFAULT_SKILL_TAG_SHAPE).trim().toLowerCase();
        if (shape === "rounded") {
          return "10px";
        }
        if (shape === "square") {
          return "4px";
        }
        return "999px";
      },
      getSkillTagGradientAngle() {
        const direction = String(this.skillTagGradientDirection || DEFAULT_SKILL_TAG_GRADIENT_DIRECTION).trim().toLowerCase();
        if (direction === "horizontal") {
          return "90deg";
        }
        if (direction === "diagonal") {
          return "135deg";
        }
        return "180deg";
      },
      getSkillTagStyleConfig() {
        const style = String(this.skillTagStyle || DEFAULT_SKILL_TAG_STYLE).trim().toLowerCase();
        const textColor = this.skillTagTextColor || DEFAULT_SKILL_TAG_TEXT_COLOR;
        const borderColor = this.skillTagBorderColor || DEFAULT_SKILL_TAG_BORDER_COLOR;
        const solidBgColor = this.skillTagBgColor || DEFAULT_SKILL_TAG_BG_COLOR;
        const gradientFrom = this.skillTagGradientFromColor || DEFAULT_SKILL_TAG_GRADIENT_FROM_COLOR;
        const gradientTo = this.skillTagGradientToColor || DEFAULT_SKILL_TAG_GRADIENT_TO_COLOR;
        const gradientAngle = this.getSkillTagGradientAngle();
        const outlineBgColor = this.skillTagOutlineBgColor || DEFAULT_SKILL_TAG_OUTLINE_BG_COLOR;
        if (style === "outline") {
          return {
            border: `color-mix(in srgb, ${borderColor} 92%, #ffffff)`,
            background: `color-mix(in srgb, ${outlineBgColor} 10%, #ffffff)`,
            color: textColor,
            borderWidth: "2px",
            borderStyle: "double",
            shadow: "none",
            weight: 700,
            letterSpacing: "0.2px",
            paddingY: "3px",
            paddingX: "10px"
          };
        }
        if (style === "solid") {
          return {
            border: `color-mix(in srgb, ${borderColor} 72%, #ffffff)`,
            background: `color-mix(in srgb, ${solidBgColor} 66%, #ffffff)`,
            color: `color-mix(in srgb, ${textColor} 90%, #102142)`,
            borderWidth: "1px",
            borderStyle: "solid",
            shadow: "none",
            weight: 700,
            letterSpacing: "0.2px",
            paddingY: "5px",
            paddingX: "13px"
          };
        }
        if (style === "plain") {
          return {
            border: "transparent",
            background: "transparent",
            color: textColor,
            borderWidth: "0",
            borderStyle: "none",
            shadow: "none",
            weight: 400,
            letterSpacing: "0.45px",
            paddingY: "0",
            paddingX: "1px"
          };
        }
        return {
          border: `color-mix(in srgb, ${borderColor} 46%, #ffffff)`,
          background: `linear-gradient(${gradientAngle}, color-mix(in srgb, ${gradientFrom} 72%, #ffffff) 0%, color-mix(in srgb, ${gradientTo} 54%, #ffffff) 100%)`,
          color: textColor,
          borderWidth: "1px",
          borderStyle: "solid",
          shadow: "0 1px 0 rgba(255,255,255,0.8) inset, 0 1px 2px rgba(24, 44, 90, 0.06)",
          weight: 600,
          letterSpacing: "0.14px",
          paddingY: "5px",
          paddingX: "12px"
        };
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
        if (typeof module.showModuleRail !== "boolean") {
          module.showModuleRail = true;
        }
        if (typeof module.showTitleDivider !== "boolean") {
          module.showTitleDivider = true;
        }
        const legacyAccent = typeof module.accentColor === "string" ? module.accentColor : "";
        if (typeof module.moduleBorderColor !== "string") {
          module.moduleBorderColor = legacyAccent || this.borderAccentColor || DEFAULT_THEME_COLOR;
        }
        if (typeof module.moduleTimelineColor !== "string") {
          module.moduleTimelineColor = legacyAccent || this.timelineAccentColor || DEFAULT_THEME_COLOR;
        }
        if (typeof module.moduleRailColor !== "string") {
          module.moduleRailColor = legacyAccent || this.moduleRailColor || DEFAULT_THEME_COLOR;
        }
        if (typeof module.moduleTitleColor !== "string") {
          module.moduleTitleColor = legacyAccent || this.moduleTitleColor || DEFAULT_THEME_COLOR;
        }
        module.accentColor = module.moduleTitleColor;
        if (typeof module.iconColor !== "string") {
          module.iconColor = this.iconGlobalColor;
        }
        if (typeof module.surfaceColor !== "string") {
          module.surfaceColor = "#ffffff";
        }
      },
      syncThemeDependentColors(nextThemeColor, previousThemeColor) {
        const next = String(nextThemeColor || "").trim();
        if (!next) {
          return;
        }

        const previous = String(previousThemeColor || DEFAULT_THEME_COLOR).trim().toLowerCase();
        const currentTheme = String(this.themeColor || "").trim().toLowerCase();
        if (!previous || previous === next.toLowerCase() || currentTheme === previous) {
          return;
        }

        const syncGlobalField = (key) => {
          const current = String(this[key] || "").trim().toLowerCase();
          if (current === previous) {
            this[key] = next;
          }
        };

        syncGlobalField("ornamentColor");
        syncGlobalField("iconGlobalColor");
        syncGlobalField("borderAccentColor");
        syncGlobalField("timelineAccentColor");
        syncGlobalField("moduleRailColor");
        syncGlobalField("moduleTitleColor");

        const previousTagPalette = buildSkillTagThemePalette(previous);
        const nextTagPalette = buildSkillTagThemePalette(next);
        const syncTagField = (key, oldValue, newValue) => {
          const current = String(this[key] || "").trim().toLowerCase();
          if (current === String(oldValue || "").trim().toLowerCase()) {
            this[key] = newValue;
          }
        };

        syncTagField("skillTagTextColor", previousTagPalette.textColor, nextTagPalette.textColor);
        syncTagField("skillTagBgColor", previousTagPalette.bgColor, nextTagPalette.bgColor);
        syncTagField("skillTagBorderColor", previousTagPalette.borderColor, nextTagPalette.borderColor);
        syncTagField("skillTagGradientFromColor", previousTagPalette.gradientFromColor, nextTagPalette.gradientFromColor);
        syncTagField("skillTagGradientToColor", previousTagPalette.gradientToColor, nextTagPalette.gradientToColor);
        syncTagField("skillTagOutlineBgColor", previousTagPalette.outlineBgColor, nextTagPalette.outlineBgColor);

        if (!Array.isArray(this.modules)) {
          return;
        }

        this.modules.forEach((module) => {
          if (!module || typeof module !== "object" || module.useCustomColors) {
            return;
          }

          const syncModuleField = (key) => {
            const current = String(module[key] || "").trim().toLowerCase();
            if (current === previous) {
              module[key] = next;
            }
          };

          syncModuleField("accentColor");
          syncModuleField("moduleBorderColor");
          syncModuleField("moduleTimelineColor");
          syncModuleField("moduleRailColor");
          syncModuleField("moduleTitleColor");
          syncModuleField("iconColor");
        });
      },
      moduleStyle(module) {
        const style = {
          "--module-rail-display": module.showModuleRail === false ? "none" : "block",
          "--module-title-line-display": module.showTitleDivider === false ? "none" : "block"
        };

        if (!module.useCustomColors) {
          return style;
        }

        return {
          ...style,
          "--module-accent": module.moduleTitleColor,
          "--module-border": module.moduleBorderColor,
          "--module-timeline": module.moduleTimelineColor,
          "--module-rail": module.moduleRailColor,
          "--module-title": module.moduleTitleColor,
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
      resetBorderAccentColor() {
        this.borderAccentColor = DEFAULT_THEME_COLOR;
      },
      resetTimelineAccentColor() {
        this.timelineAccentColor = DEFAULT_THEME_COLOR;
      },
      resetModuleRailColor() {
        this.moduleRailColor = DEFAULT_THEME_COLOR;
      },
      resetModuleTitleColor() {
        this.moduleTitleColor = DEFAULT_THEME_COLOR;
        this.ornamentColor = DEFAULT_THEME_COLOR;
      },
      resetIconGlobalColor() {
        this.iconGlobalColor = DEFAULT_THEME_COLOR;
      },
      resetSkillTagTextColor() {
        this.skillTagTextColor = buildSkillTagThemePalette(this.themeColor).textColor;
      },
      resetSkillTagBgColor() {
        this.skillTagBgColor = buildSkillTagThemePalette(this.themeColor).bgColor;
      },
      resetSkillTagBorderColor() {
        this.skillTagBorderColor = buildSkillTagThemePalette(this.themeColor).borderColor;
      },
      resetSkillTagGradientFromColor() {
        this.skillTagGradientFromColor = buildSkillTagThemePalette(this.themeColor).gradientFromColor;
      },
      resetSkillTagGradientToColor() {
        this.skillTagGradientToColor = buildSkillTagThemePalette(this.themeColor).gradientToColor;
      },
      resetSkillTagOutlineBgColor() {
        this.skillTagOutlineBgColor = buildSkillTagThemePalette(this.themeColor).outlineBgColor;
      },
      resetModuleAccentColor(module) {
        this.resetModuleCustomTitleColor(module);
      },
      resetModuleCustomBorderColor(module) {
        module.moduleBorderColor = this.borderAccentColor || DEFAULT_THEME_COLOR;
      },
      resetModuleCustomTimelineColor(module) {
        module.moduleTimelineColor = this.timelineAccentColor || DEFAULT_THEME_COLOR;
      },
      resetModuleCustomRailColor(module) {
        module.moduleRailColor = this.moduleRailColor || DEFAULT_THEME_COLOR;
      },
      resetModuleCustomTitleColor(module) {
        module.moduleTitleColor = this.moduleTitleColor || DEFAULT_THEME_COLOR;
        module.accentColor = module.moduleTitleColor;
      },
      resetModuleIconColor(module) {
        module.iconColor = this.iconGlobalColor || DEFAULT_THEME_COLOR;
      },
      resetModuleSurfaceColor(module) {
        module.surfaceColor = DEFAULT_MODULE_SURFACE_COLOR;
      },
      setAllModuleVisualToggle(key, enabled) {
        const flag = Boolean(enabled);
        if (!Array.isArray(this.modules) || !this.modules.length) {
          return;
        }
        this.modules.forEach((module) => {
          if (key === "showTimelineAxis" && module.type !== "timeline") {
            return;
          }
          module[key] = flag;
        });
        this.recalcPageEstimate();
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
        this.syncModuleCollapsedState();
      },
      syncModuleCollapsedState(preferredExpandedId = null) {
        if (!Array.isArray(this.modules)) {
          this.moduleCollapsedState = {};
          return;
        }
        const nextState = {};
        this.modules.forEach((module) => {
          const cached = this.moduleCollapsedState?.[module.id];
          nextState[module.id] = typeof cached === "boolean" ? cached : true;
        });
        if (preferredExpandedId && Object.prototype.hasOwnProperty.call(nextState, preferredExpandedId)) {
          nextState[preferredExpandedId] = false;
        }
        this.moduleCollapsedState = nextState;
      },
      isModuleCollapsed(moduleId) {
        return Boolean(this.moduleCollapsedState?.[moduleId]);
      },
      toggleModuleCollapse(moduleId) {
        if (!moduleId) {
          return;
        }
        this.moduleCollapsedState = {
          ...this.moduleCollapsedState,
          [moduleId]: !this.isModuleCollapsed(moduleId)
        };
      },
      expandAllModules() {
        if (!Array.isArray(this.modules) || !this.modules.length) {
          return;
        }
        const nextState = {};
        this.modules.forEach((module) => {
          nextState[module.id] = false;
        });
        this.moduleCollapsedState = nextState;
      },
      collapseAllModules() {
        if (!Array.isArray(this.modules) || !this.modules.length) {
          return;
        }
        const nextState = {};
        this.modules.forEach((module) => {
          nextState[module.id] = true;
        });
        this.moduleCollapsedState = nextState;
      },
      createModule(type) {
        if (type === "text") return { id: uuid(), type, title: "文本模块", content: "请输入文本内容", useNumberedList: false, numberedItemsText: "", useCustomColors: false, showModuleRail: true, showTitleDivider: true, accentColor: this.moduleTitleColor, moduleBorderColor: this.borderAccentColor, moduleTimelineColor: this.timelineAccentColor, moduleRailColor: this.moduleRailColor, moduleTitleColor: this.moduleTitleColor, iconColor: this.iconGlobalColor, surfaceColor: "#ffffff", iconKey: this.defaultIconByType(type) };
        if (type === "list") return { id: uuid(), type, title: "列表模块", items: ["列表项 1", "列表项 2"], useCustomColors: false, showModuleRail: true, showTitleDivider: true, accentColor: this.moduleTitleColor, moduleBorderColor: this.borderAccentColor, moduleTimelineColor: this.timelineAccentColor, moduleRailColor: this.moduleRailColor, moduleTitleColor: this.moduleTitleColor, iconColor: this.iconGlobalColor, surfaceColor: "#ffffff", iconKey: this.defaultIconByType(type) };
        if (type === "timeline") return {
          id: uuid(),
          type,
          title: "经历模块",
          timelineMode: "work",
          showTimelineAxis: true,
          useCustomColors: false,
          showModuleRail: true,
          showTitleDivider: true,
          accentColor: this.moduleTitleColor,
          moduleBorderColor: this.borderAccentColor,
          moduleTimelineColor: this.timelineAccentColor,
          moduleRailColor: this.moduleRailColor,
          moduleTitleColor: this.moduleTitleColor,
          iconColor: this.iconGlobalColor,
          surfaceColor: "#ffffff",
          entries: [{ company: "单位名称", role: "岗位", period: "任职时间", body: "请输入正文", skillTags: "" }],
          iconKey: this.defaultIconByType(type)
        };
        if (type === "tags") return { id: uuid(), type, title: "标签模块", content: "标签一,标签二,标签三", useCustomColors: false, showModuleRail: true, showTitleDivider: true, accentColor: this.moduleTitleColor, moduleBorderColor: this.borderAccentColor, moduleTimelineColor: this.timelineAccentColor, moduleRailColor: this.moduleRailColor, moduleTitleColor: this.moduleTitleColor, iconColor: this.iconGlobalColor, surfaceColor: "#ffffff", iconKey: this.defaultIconByType(type) };
        return { id: uuid(), type: "gallery", title: "图片模块", images: [PLACEHOLDER_IMAGE], useCustomColors: false, showModuleRail: true, showTitleDivider: true, accentColor: this.moduleTitleColor, moduleBorderColor: this.borderAccentColor, moduleTimelineColor: this.timelineAccentColor, moduleRailColor: this.moduleRailColor, moduleTitleColor: this.moduleTitleColor, iconColor: this.iconGlobalColor, surfaceColor: "#ffffff", iconKey: this.defaultIconByType("gallery") };
      },
      addModule() {
        const newModule = this.createModule(this.newModuleType);
        this.modules.push(newModule);
        this.syncModuleCollapsedState();
        this.moduleManageEditorsCollapsed = false;
        this.recalcPageEstimate();
      },
      duplicateModule(moduleIndex) {
        const source = this.modules[moduleIndex];
        if (!source) {
          return;
        }
        const copiedModule = JSON.parse(JSON.stringify(source));
        copiedModule.id = uuid();
        const sourceTitle = String(copiedModule.title || "").trim();
        copiedModule.title = sourceTitle
          ? `${sourceTitle}（副本）`
          : `${this.moduleTypeLabel(copiedModule.type)}（副本）`;
        this.modules.splice(moduleIndex + 1, 0, copiedModule);
        this.ensureModuleIcons();
        this.syncModuleCollapsedState();
        this.moduleManageEditorsCollapsed = false;
        this.recalcPageEstimate();
      },
      removeModule(moduleId) {
        this.modules = this.modules.filter((item) => item.id !== moduleId);
        this.syncModuleCollapsedState();
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
        if (this.recalcTimerId) {
          clearTimeout(this.recalcTimerId);
        }

        this.recalcTimerId = setTimeout(() => {
          this.recalcTimerId = null;
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
        }, 60);
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
        this.borderAccentColor = DEFAULT_THEME_COLOR;
        this.timelineAccentColor = DEFAULT_THEME_COLOR;
        this.moduleRailColor = DEFAULT_THEME_COLOR;
        this.moduleTitleColor = DEFAULT_THEME_COLOR;
        this.profileHeaderBgColor = DEFAULT_PROFILE_BG_COLOR;
        this.pageBackgroundColor = DEFAULT_PAGE_BG_COLOR;
        this.profileHeaderBgOpacity = 100;
        this.listStyle = "decimal";
        this.skillTagStyle = DEFAULT_SKILL_TAG_STYLE;
        this.skillTagShape = DEFAULT_SKILL_TAG_SHAPE;
        this.skillTagFontSize = DEFAULT_SKILL_TAG_FONT_SIZE;
        this.skillTagGap = DEFAULT_SKILL_TAG_GAP;
        this.skillTagTextColor = DEFAULT_SKILL_TAG_TEXT_COLOR;
        this.skillTagBgColor = DEFAULT_SKILL_TAG_BG_COLOR;
        this.skillTagBorderColor = DEFAULT_SKILL_TAG_BORDER_COLOR;
        this.skillTagGradientFromColor = DEFAULT_SKILL_TAG_GRADIENT_FROM_COLOR;
        this.skillTagGradientToColor = DEFAULT_SKILL_TAG_GRADIENT_TO_COLOR;
        this.skillTagGradientDirection = DEFAULT_SKILL_TAG_GRADIENT_DIRECTION;
        this.skillTagOutlineBgColor = DEFAULT_SKILL_TAG_OUTLINE_BG_COLOR;
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
        this.themeFontAdvancedCollapsed = true;
        this.themeStyleAdvancedCollapsed = true;
        this.themeIconSettingsCollapsed = true;
        this.themeColorSettingsCollapsed = true;
        this.themeModuleVisualSettingsCollapsed = true;
        this.themeModuleColorSettingsCollapsed = true;
        this.themeTypographySettingsCollapsed = true;
        this.themeSkillTagSettingsCollapsed = true;
        this.moduleManageEditorsCollapsed = true;
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

        const baseHref = window.location.href;
        const cssHref = new URL(appCssUrl, baseHref).href;
        const fontHref = new URL(fontCssUrl, baseHref).href;

        return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <base href="${baseHref}" />
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
      async waitForPrintAssets(printWindow) {
        const doc = printWindow?.document;
        if (!doc) return;

        const waitImageReady = Array.from(doc.images || []).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          });
        });

        const waitStylesheetReady = Array.from(doc.querySelectorAll("link[rel='stylesheet']")).map((linkEl) => {
          const link = linkEl;
          if (link.sheet) return Promise.resolve();
          return new Promise((resolve) => {
            const done = () => resolve();
            link.addEventListener("load", done, { once: true });
            link.addEventListener("error", done, { once: true });
            setTimeout(done, 3500);
          });
        });

        const waitFontsReady = doc.fonts && typeof doc.fonts.ready?.then === "function"
          ? doc.fonts.ready.catch(() => {})
          : Promise.resolve();

        await Promise.race([
          Promise.all([
            Promise.all(waitImageReady),
            Promise.all(waitStylesheetReady),
            waitFontsReady
          ]),
          new Promise((resolve) => setTimeout(resolve, 3800))
        ]);
      },
      async openPrintWindow() {
        const html = this.buildExportHtml();
        if (!html) {
          alert("Print preview generation failed. Please refresh and try again.");
          return;
        }

        const printWindow = window.open("", "_blank", "width=1200,height=900");
        if (!printWindow) {
          alert("Popup was blocked. Please allow popups and try printing again.");
          return;
        }

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        await this.waitForPrintAssets(printWindow);
        printWindow.focus();
        printWindow.print();
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
      async downloadPdf() {
        this.downloading = true;
        try {
          await this.openPrintWindow();
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
      if (this.recalcTimerId) {
        clearTimeout(this.recalcTimerId);
        this.recalcTimerId = null;
      }
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
      themeColor(newValue, oldValue) {
        if (!this.isApplyingHistory) {
          this.syncThemeDependentColors(newValue, oldValue);
        }
        this.recalcPageEstimate();
      },
      fontSize() {
        this.recalcPageEstimate();
      },
      lineHeight() {
        this.recalcPageEstimate();
      },
      skillTagStyle() {
        this.recalcPageEstimate();
      },
      skillTagShape() {
        this.recalcPageEstimate();
      },
      skillTagFontSize() {
        this.recalcPageEstimate();
      },
      skillTagGap() {
        this.recalcPageEstimate();
      },
      skillTagTextColor() {
        this.recalcPageEstimate();
      },
      skillTagBgColor() {
        this.recalcPageEstimate();
      },
      skillTagBorderColor() {
        this.recalcPageEstimate();
      },
      skillTagGradientFromColor() {
        this.recalcPageEstimate();
      },
      skillTagGradientToColor() {
        this.recalcPageEstimate();
      },
      skillTagGradientDirection() {
        this.recalcPageEstimate();
      },
      skillTagOutlineBgColor() {
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
  };
</script>
