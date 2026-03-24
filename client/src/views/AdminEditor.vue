<template>
  <div class="editor-page">
    <!-- 顶部工具栏 -->
    <header class="editor-header">
      <div class="editor-header-left">
        <button class="back-btn" @click="handleCancel">← 返回管理</button>
        <span class="editor-mode-label">{{ route.params.id ? '编辑文章' : '新建文章' }}</span>
      </div>
      <div class="editor-header-right">
        <button class="btn btn-outline btn-sm" @click="handleSaveDraft" :disabled="submitting">
          {{ submitting === 'draft' ? '保存中...' : '💾 保存草稿' }}
        </button>
        <button class="btn btn-primary btn-sm" @click="handlePublish" :disabled="submitting">
          {{ submitting === 'publish' ? '发布中...' : '🚀 发布文章' }}
        </button>
      </div>
    </header>

    <!-- 文章信息栏 -->
    <div class="editor-meta glass-card">
      <div class="meta-row">
        <div class="meta-field meta-field-title">
          <label>文章标题 *</label>
          <input
            v-model="form.title"
            class="input-field"
            placeholder="输入文章标题..."
            @keydown.enter.prevent
          />
        </div>
      </div>
      <div class="meta-row">
        <div class="meta-field">
          <label>所属模块</label>
          <select v-model="form.moduleId" class="input-field" @change="onModuleChange">
            <option value="">-- 选择模块 --</option>
            <option v-for="m in modules" :key="m.id" :value="m.id">
              {{ m.icon }} {{ m.name }}
            </option>
          </select>
        </div>
        <div class="meta-field">
          <label>文章分类</label>
          <select v-model="form.categoryId" class="input-field">
            <option value="">-- 选择分类 --</option>
            <option v-for="c in filteredCategories" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>
        <div class="meta-field">
          <label>标签（逗号分隔）</label>
          <input v-model="form.tags" class="input-field" placeholder="Vue3, JavaScript, ..." />
        </div>
      </div>
      <div class="meta-row">
        <div class="meta-field meta-field-title">
          <label>摘要（选填）</label>
          <input v-model="form.summary" class="input-field" placeholder="文章摘要，留空则自动截取..." />
        </div>
      </div>
      <div v-if="formError" class="error-msg">{{ formError }}</div>
    </div>

    <!-- ByteMD 编辑器 -->
    <div class="editor-body">
      <Editor
        :value="form.content"
        :plugins="plugins"
        @change="val => form.content = val"
        class="bytemd-editor"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Editor } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/github-dark.css'
import { postsApi } from '../api/posts.js'
import { useModulesStore } from '../store/modules.js'
import { useCategoriesStore } from '../store/categories.js'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()

const modulesStore = useModulesStore()
const categoriesStore = useCategoriesStore()
const { modules } = storeToRefs(modulesStore)
const { categories } = storeToRefs(categoriesStore)

const plugins = [gfm(), highlight()]

const form = ref({
  title: '',
  content: '',
  summary: '',
  moduleId: '',
  categoryId: '',
  tags: ''
})

const formError = ref('')
const submitting = ref(false)

// 根据选中模块筛选分类
const filteredCategories = computed(() => {
  if (!form.value.moduleId) return categories.value
  return categories.value.filter(c => c.moduleId === form.value.moduleId)
})

function onModuleChange() {
  // 切换模块时清空分类选择（避免分类与模块不匹配）
  form.value.categoryId = ''
}

async function loadPost() {
  if (!route.params.id) return
  try {
    const post = await postsApi.getById(route.params.id)
    form.value = {
      title: post.title,
      content: post.content,
      summary: post.summary || '',
      moduleId: post.moduleId || '',
      categoryId: post.categoryId || '',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || '')
    }
  } catch {
    formError.value = '加载文章失败，请返回重试'
  }
}

onMounted(async () => {
  await Promise.all([
    modulesStore.fetchModules(),
    categoriesStore.fetchCategories()
  ])
  await loadPost()
})

function validate() {
  if (!form.value.title.trim()) {
    formError.value = '请输入文章标题'
    return false
  }
  if (!form.value.content.trim()) {
    formError.value = '请输入文章内容'
    return false
  }
  formError.value = ''
  return true
}

function buildPayload() {
  return {
    title: form.value.title.trim(),
    content: form.value.content,
    summary: form.value.summary.trim(),
    moduleId: form.value.moduleId,
    categoryId: form.value.categoryId,
    tags: form.value.tags
  }
}

async function handleSaveDraft() {
  if (!validate()) return
  submitting.value = 'draft'
  try {
    if (route.params.id) {
      await postsApi.update(route.params.id, buildPayload())
    } else {
      const result = await postsApi.create(buildPayload())
      // 保存草稿后跳转到编辑页以支持继续编辑
      router.replace(`/admin/editor/${result.post.id}`)
    }
  } catch (err) {
    formError.value = err.message || '保存失败，请重试'
  } finally {
    submitting.value = false
  }
}

async function handlePublish() {
  if (!validate()) return
  submitting.value = 'publish'
  try {
    if (route.params.id) {
      await postsApi.update(route.params.id, buildPayload())
    } else {
      await postsApi.create(buildPayload())
    }
    router.push('/admin')
  } catch (err) {
    formError.value = err.message || '发布失败，请重试'
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  router.push('/admin')
}
</script>

<style scoped>
.editor-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-bg);
  overflow: hidden;
}

/* 顶部 header */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: rgba(15, 15, 30, 0.95);
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
  gap: 12px;
  flex-wrap: wrap;
}

.editor-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.editor-header-right {
  display: flex;
  gap: 10px;
}

.back-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  font-family: inherit;
  padding: 4px 0;
  transition: color 0.2s;
}

.back-btn:hover {
  color: var(--color-gold);
}

.editor-mode-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.btn-sm {
  padding: 6px 14px;
  font-size: 0.85rem;
}

/* 文章信息栏 */
.editor-meta {
  margin: 12px 16px;
  padding: 14px 20px;
  flex-shrink: 0;
}

.meta-row {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.meta-row:last-child {
  margin-bottom: 0;
}

.meta-field {
  flex: 1;
  min-width: 160px;
}

.meta-field-title {
  flex: 3;
  min-width: 280px;
}

.meta-field label {
  display: block;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.input-field {
  width: 100%;
  box-sizing: border-box;
}

.error-msg {
  color: var(--color-accent);
  font-size: 0.85rem;
  margin-top: 8px;
  padding: 6px 10px;
  background: rgba(233, 69, 96, 0.1);
  border-radius: var(--radius-sm);
}

/* ByteMD 编辑器区域 */
.editor-body {
  flex: 1;
  overflow: hidden;
  margin: 0 16px 16px;
}

.bytemd-editor {
  height: 100%;
}

/* 覆盖 ByteMD 默认样式以适配深色主题 */
:deep(.bytemd) {
  height: 100%;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.04);
  color: var(--color-text-primary);
}

:deep(.bytemd-toolbar) {
  background: rgba(15, 15, 30, 0.9);
  border-bottom: 1px solid var(--glass-border);
  color: var(--color-text-secondary);
}

:deep(.bytemd-toolbar-icon) {
  color: var(--color-text-secondary);
}

:deep(.bytemd-toolbar-icon:hover),
:deep(.bytemd-toolbar-icon.bytemd-tippy-right:hover) {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-primary);
}

:deep(.CodeMirror) {
  background: transparent;
  color: var(--color-text-primary);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.93rem;
  line-height: 1.7;
}

:deep(.CodeMirror-cursor) {
  border-left-color: var(--color-gold);
}

:deep(.bytemd-preview) {
  background: rgba(255, 255, 255, 0.02);
  color: var(--color-text-primary);
  padding: 20px 28px;
}

:deep(.bytemd-preview h1),
:deep(.bytemd-preview h2),
:deep(.bytemd-preview h3) {
  color: var(--color-text-primary);
  border-bottom-color: var(--glass-border);
}

:deep(.bytemd-preview code) {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-gold);
  border-radius: 4px;
  padding: 1px 5px;
}

:deep(.bytemd-preview pre) {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
}

:deep(.bytemd-preview blockquote) {
  border-left-color: var(--color-gold);
  color: var(--color-text-secondary);
}

:deep(.bytemd-status) {
  background: rgba(15, 15, 30, 0.9);
  border-top: 1px solid var(--glass-border);
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .editor-meta {
    margin: 8px;
    padding: 10px 14px;
  }

  .meta-field-title {
    min-width: 100%;
  }

  .editor-body {
    margin: 0 8px 8px;
  }
}
</style>
