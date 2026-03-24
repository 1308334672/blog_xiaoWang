<template>
  <div class="blog-page container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title gradient-text">博客文章</h1>
      <p class="page-desc">探索技术与思考的边界</p>
    </div>

    <!-- 模块 Tab 栏 -->
    <div v-if="modules.length" class="module-tabs">
      <button
        class="module-tab"
        :class="{ active: !selectedModuleId }"
        @click="selectModule('')"
      >全部</button>
      <button
        v-for="mod in modules"
        :key="mod.id"
        class="module-tab"
        :class="{ active: selectedModuleId === mod.id }"
        @click="selectModule(mod.id)"
      >
        {{ mod.icon }} {{ mod.name }}
      </button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar glass-card">
      <input
        v-model="searchQuery"
        class="input-field search-input"
        type="text"
        placeholder="🔍 搜索文章标题或内容..."
        @input="handleSearch"
      />
      <select v-model="selectedCategoryId" class="input-field category-select" @change="handleSearch">
        <option value="">全部分类</option>
        <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">正在加载文章...</div>

    <!-- 文章列表 -->
    <div v-else-if="posts.length">
      <div class="posts-list">
        <article
          v-for="post in posts"
          :key="post.id"
          class="post-item glass-card"
          @click="router.push(`/blog/${post.id}`)"
        >
          <div class="post-meta">
            <span v-if="getModuleName(post.moduleId)" class="post-module">{{ getModuleName(post.moduleId) }}</span>
            <span class="post-category">{{ getCategoryName(post.categoryId) || post.category }}</span>
            <span class="post-date">{{ formatDate(post.createdAt) }}</span>
          </div>
          <h2 class="post-title">{{ post.title }}</h2>
          <p class="post-summary">{{ post.summary }}</p>
          <div class="post-footer">
            <div class="post-tags">
              <span v-for="tag in post.tags.slice(0, 4)" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <span class="read-link">阅读全文 →</span>
          </div>
        </article>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="btn btn-outline page-btn"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >← 上一页</button>
        <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页，共 {{ total }} 篇</span>
        <button
          class="btn btn-outline page-btn"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >下一页 →</button>
      </div>

      <p v-else class="total-count">共 {{ total }} 篇文章</p>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="emoji">🔭</div>
      <p>没有找到相关文章</p>
      <button v-if="searchQuery || selectedCategoryId || selectedModuleId" class="btn btn-outline" style="margin-top:16px" @click="clearSearch">清除筛选</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '../store/posts.js'
import { useModulesStore } from '../store/modules.js'
import { useCategoriesStore } from '../store/categories.js'
import { storeToRefs } from 'pinia'
import { formatDate } from '../utils/date.js'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()
const modulesStore = useModulesStore()
const categoriesStore = useCategoriesStore()
const { posts, loading, total, totalPages, currentPage } = storeToRefs(postsStore)
const { modules } = storeToRefs(modulesStore)
const { categories } = storeToRefs(categoriesStore)

const searchQuery = ref('')
const selectedCategoryId = ref('')
const selectedModuleId = ref('')

let searchTimer = null

// 根据当前选中模块筛选分类
const filteredCategories = computed(() => {
  if (!selectedModuleId.value) return categories.value
  return categories.value.filter(c => c.moduleId === selectedModuleId.value)
})

function getModuleName(moduleId) {
  if (!moduleId) return ''
  const m = modules.value.find(m => m.id === moduleId)
  return m ? `${m.icon} ${m.name}` : ''
}

function getCategoryName(categoryId) {
  if (!categoryId) return ''
  const c = categories.value.find(c => c.id === categoryId)
  return c ? c.name : ''
}

function buildParams(page = 1) {
  return {
    page,
    limit: 8,
    search: searchQuery.value,
    moduleId: selectedModuleId.value,
    categoryId: selectedCategoryId.value
  }
}

onMounted(async () => {
  await Promise.all([
    modulesStore.fetchModules(),
    categoriesStore.fetchCategories()
  ])
  // 处理 /blog/module/:slug 路由
  if (route.params.slug) {
    const mod = modules.value.find(m => m.slug === route.params.slug)
    if (mod) selectedModuleId.value = mod.id
  }
  postsStore.fetchPosts(buildParams())
})

// 监听路由 slug 变化（模块路由切换），仅在模块数据已加载时处理
watch(() => route.params.slug, (slug) => {
  if (!modules.value.length) return
  if (slug) {
    const mod = modules.value.find(m => m.slug === slug)
    selectedModuleId.value = mod ? mod.id : ''
  } else {
    selectedModuleId.value = ''
  }
  postsStore.fetchPosts(buildParams())
})

function selectModule(moduleId) {
  selectedModuleId.value = moduleId
  selectedCategoryId.value = ''
  postsStore.fetchPosts(buildParams())
}

function handleSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    postsStore.fetchPosts(buildParams())
  }, 400)
}

function clearSearch() {
  searchQuery.value = ''
  selectedCategoryId.value = ''
  selectedModuleId.value = ''
  postsStore.fetchPosts(buildParams())
}

function goToPage(page) {
  postsStore.fetchPosts(buildParams(page))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.blog-page {
  padding: 40px 24px 80px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.page-desc { color: var(--color-text-secondary); }

/* 模块 Tab 栏 */
.module-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.module-tab {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 9999px;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  font-family: inherit;
  padding: 6px 16px;
  transition: all 0.2s;
}

.module-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}

.module-tab.active {
  background: rgba(241, 196, 15, 0.15);
  border-color: rgba(241, 196, 15, 0.4);
  color: var(--color-gold);
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 12px;
  padding: 16px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.category-select {
  width: auto;
  min-width: 140px;
  cursor: pointer;
}

/* 文章列表 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-item {
  padding: 28px 32px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-item:hover {
  transform: translateX(4px);
  border-color: rgba(241, 196, 15, 0.3);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.post-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.post-module {
  font-size: 0.78rem;
  color: var(--color-gold);
  background: rgba(241, 196, 15, 0.1);
  padding: 2px 8px;
  border-radius: 9999px;
  border: 1px solid rgba(241, 196, 15, 0.2);
}

.post-category {
  font-size: 0.8rem;
  color: var(--color-accent);
  background: rgba(233, 69, 96, 0.12);
  padding: 2px 10px;
  border-radius: 9999px;
  border: 1px solid rgba(233, 69, 96, 0.25);
}

.post-date {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.post-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--color-text-primary);
  transition: color 0.3s;
}

.post-item:hover .post-title { color: var(--color-gold); }

.post-summary {
  font-size: 0.93rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.read-link {
  font-size: 0.85rem;
  color: var(--color-gold);
  transition: all 0.3s;
}

.post-item:hover .read-link { letter-spacing: 1px; }

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 48px;
  flex-wrap: wrap;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
}

.page-info {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.total-count {
  text-align: center;
  margin-top: 32px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .search-bar { flex-direction: column; }
  .category-select { width: 100%; }
  .post-item { padding: 20px; }
}
</style>
