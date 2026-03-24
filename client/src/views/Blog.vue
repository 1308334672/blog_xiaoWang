<template>
  <div class="blog-page container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title gradient-text">博客文章</h1>
      <p class="page-desc">探索技术与思考的边界</p>
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
      <select v-model="selectedCategory" class="input-field category-select" @change="handleSearch">
        <option value="">全部分类</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
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
            <span class="post-category">{{ post.category }}</span>
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
      <button v-if="searchQuery || selectedCategory" class="btn btn-outline" style="margin-top:16px" @click="clearSearch">清除筛选</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '../store/posts.js'
import { storeToRefs } from 'pinia'
import { formatDate } from '../utils/date.js'

const router = useRouter()
const postsStore = usePostsStore()
const { posts, loading, total, totalPages, currentPage } = storeToRefs(postsStore)

const searchQuery = ref('')
const selectedCategory = ref('')
const categories = ref(['前端开发', '后端开发', 'CSS技巧', '学习笔记', '生活随记'])

let searchTimer = null

// 初始化加载
onMounted(() => {
  postsStore.fetchPosts({ page: 1, limit: 8 })
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

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.page-desc {
  color: var(--color-text-secondary);
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
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
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

.post-item:hover .post-title {
  color: var(--color-gold);
}

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

.post-item:hover .read-link {
  letter-spacing: 1px;
}

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
  .search-bar {
    flex-direction: column;
  }

  .category-select {
    width: 100%;
  }

  .post-item {
    padding: 20px;
  }
}
</style>
