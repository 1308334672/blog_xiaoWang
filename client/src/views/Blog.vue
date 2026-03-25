<template>
  <div class="blog-page container">
    <!-- 页面标题 -->
    <div class="page-header">
      <button v-if="columnMode" class="back-btn" @click="router.push('/blog')">&lt;&lt; BACK TO COLUMNS</button>
      <h1 class="page-title">&gt; {{ columnMode ? columnName : 'BLOG_ARCHIVE' }}</h1>
      <p class="page-desc">// 探索技术与思考的边界</p>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar glass-card">
      <input
        v-model="searchQuery"
        class="input-field search-input"
        type="text"
        placeholder="> SEARCH..."
        @input="handleSearch"
      />
      <select v-if="!columnMode" v-model="selectedCategory" class="input-field category-select" @change="handleSearch">
        <option value="">ALL</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">&gt; LOADING DATA...</div>

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
            <span class="post-category">{{ post.category }}</span>
            <span class="post-date">{{ formatDate(post.createdAt) }}</span>
          </div>
          <h2 class="post-title">{{ post.title }}</h2>
          <p class="post-summary">{{ post.summary }}</p>
          <div class="post-footer">
            <div class="post-tags">
              <span v-for="tag in post.tags.slice(0, 4)" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <span class="read-link">&gt;&gt; ENTER</span>
          </div>
        </article>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="btn btn-outline page-btn"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >&lt;&lt; PREV</button>

        <span class="page-info">PAGE {{ currentPage }}/{{ totalPages }} | TOTAL: {{ total }}</span>

        <button
          class="btn btn-outline page-btn"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >NEXT &gt;&gt;</button>
      </div>

      <p v-else class="total-count">TOTAL: {{ total }} POSTS</p>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="emoji">�</div>
      <p>NO RESULTS FOUND</p>
      <button v-if="searchQuery || selectedCategory" class="btn btn-outline" style="margin-top:16px" @click="clearSearch">CLEAR FILTER</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePostsStore } from '../store/posts.js'
import { storeToRefs } from 'pinia'
import { formatDate } from '../utils/date.js'

const router = useRouter()
const route = useRoute()
const postsStore = usePostsStore()
const { posts, loading, total, totalPages, currentPage } = storeToRefs(postsStore)

const searchQuery = ref('')
const selectedCategory = ref('')
const categories = ref(['前端开发', '后端开发', 'CSS技巧', '学习笔记', '生活随记'])

// 专栏模式：从路由读取 category 参数
const columnMode = computed(() => {
  const cat = route.params.category
  return cat && cat !== 'ALL'
})
const columnName = computed(() => route.params.category || '')

let searchTimer = null

// 初始化加载
onMounted(() => {
  const cat = route.params.category
  const initCategory = cat && cat !== 'ALL' ? cat : ''
  const initSearch = route.query.search || ''
  selectedCategory.value = initCategory
  searchQuery.value = initSearch
  postsStore.fetchPosts({ page: 1, limit: 8, category: initCategory, search: initSearch })
})

// 防抖搜索
function handleSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    postsStore.fetchPosts({
      page: 1,
      limit: 8,
      search: searchQuery.value,
      category: selectedCategory.value
    })
  }, 400)
}

// 清除搜索
function clearSearch() {
  searchQuery.value = ''
  selectedCategory.value = ''
  postsStore.fetchPosts({ page: 1, limit: 8 })
}

// 翻页
function goToPage(page) {
  postsStore.fetchPosts({
    page,
    limit: 8,
    search: searchQuery.value,
    category: selectedCategory.value
  })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 格式化日期
// formatDate imported from utils
</script>

<style scoped>
.blog-page {
  padding: 40px 24px 80px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.back-btn {
  background: transparent;
  border: 2px solid var(--color-cyan);
  color: var(--color-cyan);
  font-family: 'Press Start 2P', monospace;
  font-size: 0.55rem;
  padding: 8px 14px;
  cursor: none;
  margin-bottom: 14px;
  transition: all 0.1s steps(2);
}
.back-btn:hover {
  background: rgba(0,212,255,0.1);
  box-shadow: 3px 3px 0 var(--color-cyan);
}

.page-title {
  font-size: 1.4rem;
  color: var(--color-green);
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
  margin-bottom: 10px;
}

.page-desc {
  color: var(--color-text-muted);
  font-size: 0.6rem;
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
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M0 2h8L4 7z' fill='%2300ff41'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

/* 文章列表 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item {
  padding: 24px 28px;
  cursor: pointer;
  transition: all 0.1s steps(2);
}

.post-item:hover {
  transform: translate(-2px, -2px);
  border-color: var(--color-green);
  box-shadow: 6px 6px 0px rgba(0, 255, 65, 0.15);
}

.post-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.post-category {
  font-size: 0.55rem;
  color: var(--color-accent);
  background: rgba(255, 107, 157, 0.12);
  padding: 2px 8px;
  border: 2px solid rgba(255, 107, 157, 0.3);
}

.post-date {
  font-size: 0.55rem;
  color: var(--color-text-muted);
}

.post-title {
  font-size: 0.85rem;
  margin-bottom: 10px;
  color: var(--color-text-primary);
  transition: all 0.1s steps(2);
}

.post-item:hover .post-title {
  color: var(--color-green);
  text-shadow: 0 0 6px rgba(0, 255, 65, 0.3);
}

.post-summary {
  font-size: 0.65rem;
  color: var(--color-text-secondary);
  line-height: 2;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: 'Courier New', monospace;
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
  font-size: 0.6rem;
  color: var(--color-green);
}

.post-item:hover .read-link {
  animation: blink-cursor 0.8s steps(2) infinite;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 48px;
  flex-wrap: wrap;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none !important;
}

.page-info {
  color: var(--color-text-secondary);
  font-size: 0.6rem;
}

.total-count {
  text-align: center;
  margin-top: 32px;
  color: var(--color-text-muted);
  font-size: 0.6rem;
}

@media (max-width: 640px) {
  .search-bar {
    flex-direction: column;
  }

  .category-select {
    width: 100%;
  }

  .post-item {
    padding: 16px;
  }
}
</style>
