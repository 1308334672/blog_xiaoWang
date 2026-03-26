<template>
  <div class="md-editor" :class="{ 'fullscreen': isFullscreen }">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-group">
        <button type="button" class="tb-btn" title="H1" @click="wrapLine('# ')">H1</button>
        <button type="button" class="tb-btn" title="H2" @click="wrapLine('## ')">H2</button>
        <button type="button" class="tb-btn" title="H3" @click="wrapLine('### ')">H3</button>
      </div>
      <div class="toolbar-sep"></div>
      <div class="toolbar-group">
        <button type="button" class="tb-btn" title="粗体 Ctrl+B" @click="wrap('**', '**')"><b>B</b></button>
        <button type="button" class="tb-btn" title="斜体 Ctrl+I" @click="wrap('*', '*')"><i>I</i></button>
        <button type="button" class="tb-btn" title="删除线" @click="wrap('~~', '~~')"><s>S</s></button>
      </div>
      <div class="toolbar-sep"></div>
      <div class="toolbar-group">
        <button type="button" class="tb-btn" title="引用" @click="wrapLine('> ')">❝</button>
        <button type="button" class="tb-btn mono" title="行内代码" @click="wrap('`', '`')">`c`</button>
        <button type="button" class="tb-btn mono" title="代码块" @click="insertCodeBlock">```</button>
      </div>
      <div class="toolbar-sep"></div>
      <div class="toolbar-group">
        <button type="button" class="tb-btn" title="链接 Ctrl+K" @click="insertLink">🔗</button>
        <button
          type="button"
          class="tb-btn"
          title="上传图片（JPG/PNG/GIF/WebP/SVG，≤5MB）"
          :disabled="uploadLoading"
          @click="triggerImageUpload"
        >{{ uploadLoading ? '…' : '🖼️' }}</button>
        <input
          ref="fileInputEl"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          style="display:none"
          @change="handleImageUpload"
        />
        <button type="button" class="tb-btn" title="表格" @click="insertTable">⊞</button>
      </div>
      <div class="toolbar-sep"></div>
      <div class="toolbar-group">
        <button type="button" class="tb-btn" title="无序列表" @click="wrapLine('- ')">• UL</button>
        <button type="button" class="tb-btn" title="有序列表" @click="wrapLine('1. ')">1. OL</button>
        <button type="button" class="tb-btn" title="分割线" @click="insertHRule">---</button>
      </div>
      <div class="toolbar-sep"></div>
      <div class="toolbar-group">
        <button
          type="button"
          class="tb-btn"
          :class="{ active: viewMode === 'split' }"
          title="分屏预览"
          @click="viewMode = 'split'"
        >SPLIT</button>
        <button
          type="button"
          class="tb-btn"
          :class="{ active: viewMode === 'preview' }"
          title="仅预览"
          @click="viewMode = 'preview'"
        >PREVIEW</button>
        <button
          type="button"
          class="tb-btn"
          :class="{ active: viewMode === 'edit' }"
          title="仅编辑"
          @click="viewMode = 'edit'"
        >EDIT</button>
        <button type="button" class="tb-btn full-btn" title="全屏" @click="isFullscreen = !isFullscreen">
          {{ isFullscreen ? '⊠' : '⊞' }}
        </button>
      </div>
    </div>

    <!-- 编辑/预览区域 -->
    <div class="editor-body" :class="viewMode">
      <!-- 编辑区 -->
      <div v-if="viewMode !== 'preview'" class="pane edit-pane">
        <div class="pane-label">&gt; MARKDOWN</div>
        <textarea
          ref="textareaEl"
          class="md-textarea"
          :value="modelValue"
          placeholder="# 开始编写你的文章...\n\n支持 Markdown 语法，左侧工具栏可快速插入格式。"
          @input="onInput"
          @keydown="onKeydown"
        ></textarea>
        <div class="pane-footer">chars: {{ modelValue?.length ?? 0 }}</div>
      </div>

      <!-- 预览区 -->
      <div v-if="viewMode !== 'edit'" class="pane preview-pane">
        <div class="pane-label">&gt; PREVIEW</div>
        <div class="md-preview markdown-body" v-html="renderedHtml"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { uploadApi } from '../api/posts.js'

const props = defineProps({
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const textareaEl   = ref(null)
const fileInputEl  = ref(null)
const viewMode     = ref('edit')   // 'edit' | 'split' | 'preview'
const isFullscreen = ref(false)
const uploadLoading = ref(false)

// marked 配置（与 BlogDetail 保持一致）
marked.setOptions({
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true,
})

const renderedHtml = computed(() => {
  try {
    return marked(props.modelValue || '')
  } catch {
    return '<p style="color:#ff6b9d">渲染出错</p>'
  }
})

// ─── 输入处理 ─────────────────────────────────────────────
function onInput(e) {
  emit('update:modelValue', e.target.value)
}

// ─── 键盘快捷键 ──────────────────────────────────────────
function onKeydown(e) {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'b') { e.preventDefault(); wrap('**', '**') }
    else if (e.key === 'i') { e.preventDefault(); wrap('*', '*') }
    else if (e.key === 'k') { e.preventDefault(); insertLink() }
  }
  // Tab 缩进
  if (e.key === 'Tab') {
    e.preventDefault()
    insertRaw('  ')
  }
}

// ─── 工具栏辅助函数 ───────────────────────────────────────

/** 在选区前后包裹标记 */
function wrap(before, after) {
  const el = textareaEl.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = el.value.substring(start, end) || 'text'
  const newVal = el.value.substring(0, start) + before + selected + after + el.value.substring(end)
  emit('update:modelValue', newVal)
  nextTick(() => {
    el.focus()
    el.setSelectionRange(start + before.length, start + before.length + selected.length)
  })
}

/** 在当前行首插入前缀（标题、列表等） */
function wrapLine(prefix) {
  const el = textareaEl.value
  if (!el) return
  const start = el.selectionStart
  // 找到行首
  const lineStart = el.value.lastIndexOf('\n', start - 1) + 1
  const newVal = el.value.substring(0, lineStart) + prefix + el.value.substring(lineStart)
  emit('update:modelValue', newVal)
  nextTick(() => {
    el.focus()
    const newPos = start + prefix.length
    el.setSelectionRange(newPos, newPos)
  })
}

/** 在光标处插入原始文本 */
function insertRaw(text) {
  const el = textareaEl.value
  if (!el) return
  const start = el.selectionStart
  const newVal = el.value.substring(0, start) + text + el.value.substring(el.selectionEnd)
  emit('update:modelValue', newVal)
  nextTick(() => {
    el.focus()
    el.setSelectionRange(start + text.length, start + text.length)
  })
}

function insertCodeBlock() {
  insertRaw('\n```js\n\n```\n')
}

function insertLink() {
  const el = textareaEl.value
  if (!el) return
  const selected = el.value.substring(el.selectionStart, el.selectionEnd)
  const label = selected || 'link text'
  const snippet = `[${label}](url)`
  const start = el.selectionStart
  const newVal = el.value.substring(0, start) + snippet + el.value.substring(el.selectionEnd)
  emit('update:modelValue', newVal)
  nextTick(() => {
    el.focus()
    // 选中 url 部分让用户快速替换
    const urlStart = start + label.length + 3
    el.setSelectionRange(urlStart, urlStart + 3)
  })
}

function triggerImageUpload() {
  fileInputEl.value?.click()
}

async function handleImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  // 重置 input，允许重复选同一文件
  fileInputEl.value.value = ''
  uploadLoading.value = true
  try {
    const data = await uploadApi.image(file)
    insertRaw(`\n![图片](${data.url})\n`)
  } catch (err) {
    alert('图片上传失败: ' + (err.response?.data?.error || err.message))
  } finally {
    uploadLoading.value = false
  }
}

function insertImage() {
  // 保留fallback：直接插入 Markdown 占位符（兼容旧调用）
  insertRaw('\n![alt text](image-url)\n')
}

function insertTable() {
  insertRaw('\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n')
}

function insertHRule() {
  insertRaw('\n---\n')
}
</script>

<style scoped>
.md-editor {
  display: flex;
  flex-direction: column;
  border: 2px solid var(--pixel-border);
  background: var(--color-bg-deep);
  font-family: 'Press Start 2P', monospace;
  min-height: 100%;
}

/* 全屏 */
.md-editor.fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9000;
  min-height: 100dvh;
  border: none;
}

/* ─── 工具栏 ─────────────────────────────── */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 10px;
  border-bottom: 2px solid var(--pixel-border);
  background: rgba(0, 20, 10, 0.8);
  align-items: center;
}

.toolbar-group {
  display: flex;
  gap: 3px;
}

.toolbar-sep {
  width: 1px;
  height: 20px;
  background: var(--pixel-border);
  margin: 0 4px;
}

.tb-btn {
  background: transparent;
  border: 1px solid var(--pixel-border);
  color: var(--color-text-secondary);
  font-family: inherit;
  font-size: 0.5rem;
  padding: 5px 7px;
  cursor: none;
  line-height: 1;
  white-space: nowrap;
  transition: all 0.05s steps(1);
}

.tb-btn:hover,
.tb-btn.active {
  border-color: var(--color-green);
  color: var(--color-green);
  background: rgba(0, 255, 65, 0.08);
}

.tb-btn.full-btn {
  margin-left: 4px;
  border-color: var(--color-cyan);
  color: var(--color-cyan);
}

.tb-btn.mono {
  font-family: monospace;
  font-size: 0.65rem;
}

/* ─── 编辑/预览区 ─────────────────────────── */
.editor-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.editor-body.edit .edit-pane   { flex: 1 }
.editor-body.split .edit-pane  { flex: 1 }
.editor-body.split .preview-pane { flex: 1 }
.editor-body.preview .preview-pane { flex: 1 }

.pane {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  border-right: 1px solid var(--pixel-border);
}

.pane:last-child {
  border-right: none;
}

.pane-label {
  font-size: 0.45rem;
  color: var(--color-green);
  padding: 5px 10px;
  background: rgba(0,255,65,0.04);
  border-bottom: 1px solid var(--pixel-border);
  flex-shrink: 0;
}

.pane-footer {
  font-size: 0.45rem;
  color: var(--color-text-muted);
  padding: 4px 10px;
  border-top: 1px solid var(--pixel-border);
  text-align: right;
  background: rgba(0, 20, 10, 0.5);
  flex-shrink: 0;
}

/* ─── 编辑区文本框 ───────────────────────── */
.md-textarea {
  flex: 1;
  resize: none;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-family: 'Courier New', Courier, monospace;
  font-size: 1rem;
  line-height: 1.9;
  padding: 24px 28px;
  overflow-y: auto;
  tab-size: 2;
}

.md-textarea::placeholder {
  color: var(--color-text-muted);
  font-family: inherit;
}

/* ─── 预览区 ─────────────────────────────── */
.md-preview {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-text-primary);
}

/* markdown-body 全局样式（只在预览区生效） */
.md-preview :deep(h1),
.md-preview :deep(h2),
.md-preview :deep(h3) {
  color: var(--color-green);
  margin: 1.2em 0 0.5em;
  font-family: 'Press Start 2P', monospace;
}
.md-preview :deep(h1) { font-size: 1.1rem; border-bottom: 2px solid var(--pixel-border); padding-bottom: 0.4em; }
.md-preview :deep(h2) { font-size: 0.9rem; }
.md-preview :deep(h3) { font-size: 0.75rem; color: var(--color-cyan); }

.md-preview :deep(p) { margin: 0.7em 0; }

.md-preview :deep(a) { color: var(--color-cyan); }
.md-preview :deep(a:hover) { text-decoration: underline; }

.md-preview :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em auto;
  border: 2px solid var(--pixel-border);
  border-radius: 4px;
}

.md-preview :deep(code) {
  background: rgba(0,255,65,0.08);
  border: 1px solid var(--pixel-border);
  padding: 1px 5px;
  font-family: 'Courier New', monospace;
  font-size: 0.85em;
  color: var(--color-green);
}

.md-preview :deep(pre) {
  background: #0a0a18;
  border: 2px solid var(--pixel-border);
  padding: 14px 16px;
  overflow-x: auto;
  margin: 1em 0;
}

.md-preview :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.78rem;
}

.md-preview :deep(blockquote) {
  border-left: 4px solid var(--color-cyan);
  background: rgba(0,212,255,0.05);
  padding: 8px 16px;
  margin: 0.8em 0;
  color: var(--color-text-muted);
}

.md-preview :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}
.md-preview :deep(th),
.md-preview :deep(td) {
  border: 1px solid var(--pixel-border);
  padding: 6px 12px;
  text-align: left;
  font-size: 0.75rem;
}
.md-preview :deep(th) { background: rgba(0,255,65,0.06); color: var(--color-green); }
.md-preview :deep(tr:nth-child(even) td) { background: rgba(255,255,255,0.02); }

.md-preview :deep(ul),
.md-preview :deep(ol) {
  padding-left: 1.6em;
  margin: 0.6em 0;
}
.md-preview :deep(li) { margin: 0.3em 0; }

.md-preview :deep(img) {
  max-width: 100%;
  border: 2px solid var(--pixel-border);
}

.md-preview :deep(hr) {
  border: none;
  border-top: 2px dashed var(--pixel-border);
  margin: 1.2em 0;
}

/* 移动端：强制单列 */
@media (max-width: 768px) {
  .editor-body.split .preview-pane { display: none; }
  .editor-body.split .edit-pane { flex: 1; }
}
</style>
