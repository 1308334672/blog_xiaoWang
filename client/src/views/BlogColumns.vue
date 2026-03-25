<template>
  <div class="columns-page container">
    <!-- 页头 -->
    <div class="page-header">
      <h1 class="page-title">&gt; BLOG_COLUMNS</h1>
      <p class="page-desc">// 选择专栏，开始探索</p>
    </div>

    <!-- 全局搜索入口 -->
    <div class="global-search glass-card">
      <input
        v-model="searchQuery"
        class="input-field"
        placeholder="> SEARCH ALL POSTS..."
        @keyup.enter="goSearch"
      />
      <button class="btn btn-primary search-btn" @click="goSearch">SEARCH</button>
    </div>

    <!-- 加载 -->
    <div v-if="loading" class="loading">&gt; SCANNING COLUMNS...</div>

    <!-- 专栏网格 -->
    <div v-else-if="columns.length" class="columns-grid">
      <div
        v-for="col in columns"
        :key="col.name"
        class="column-card glass-card"
        @click="router.push(`/blog/column/${encodeURIComponent(col.name)}`)"
      >
        <div class="col-icon">{{ getIcon(col.name) }}</div>
        <div class="col-body">
          <h2 class="col-name">{{ col.name }}</h2>
          <p class="col-latest" v-if="col.latestTitle">
            <span class="col-latest-label">&gt; LATEST:</span>
            {{ col.latestTitle }}
          </p>
        </div>
        <div class="col-stats">
          <div class="stat-num">{{ col.count }}</div>
          <div class="stat-label">{{ col.count ? 'POSTS' : 'EMPTY' }}</div>
        </div>
        <div class="col-arrow">&gt;&gt;</div>
      </div>
    </div>

    <!-- 所有文章入口 -->
    <div class="all-posts-btn-wrap">
      <button class="btn btn-outline all-posts-btn" @click="router.push('/blog/column/ALL')">
        📜 ALL ARCHIVES （{{ totalPosts }} POSTS）
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { postsApi } from '../api/posts.js'

const router = useRouter()
const columns = ref([])
const loading = ref(true)
const searchQuery = ref('')

const totalPosts = computed(() => columns.value.reduce((s, c) => s + c.count, 0))

const iconMap = {
  '前端开发': '🖥️', '后端开发': '⚙️', 'CSS技巧': '🎨',
  '学习笔记': '📖', '生活随记': '✍️', '未分类': '📂',
  'JavaScript': '⚡', 'Vue': '💚', 'React': '⚛️',
  'Python': '🐍', 'Java': '☕', 'Linux': '🐧',
  '日记': '📔', '工具': '🔧', '算法': '🧮',
}

function getIcon(name) {
  return iconMap[name] || '📂'
}

function goSearch() {
  if (!searchQuery.value.trim()) return
  router.push(`/blog/column/ALL?search=${encodeURIComponent(searchQuery.value)}`)
}

onMounted(async () => {
  try {
    columns.value = await postsApi.getCategories()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.columns-page {
  padding: 40px 24px 80px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 1.4rem;
  color: var(--color-green);
  text-shadow: 0 0 10px rgba(0,255,65,0.3);
  margin-bottom: 10px;
}

.page-desc {
  color: var(--color-text-muted);
  font-size: 0.6rem;
}

/* 搜索 */
.global-search {
  display: flex;
  gap: 12px;
  margin-bottom: 36px;
  padding: 16px 20px;
}

.global-search .input-field {
  flex: 1;
}

.search-btn {
  white-space: nowrap;
}

/* 专栏网格 */
.columns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.column-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 18px;
  cursor: none;
  transition: all 0.1s steps(2);
  position: relative;
  overflow: hidden;
}

.column-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0,255,65,0.04) 0%, transparent 60%);
  pointer-events: none;
}

.column-card:hover {
  border-color: var(--color-cyan);
  transform: translate(-3px, -3px);
  box-shadow: 3px 3px 0 var(--color-cyan),
              0 0 20px rgba(0,212,255,0.1);
}

.col-icon {
  font-size: 2rem;
  flex-shrink: 0;
  filter: drop-shadow(0 0 6px rgba(0,255,65,0.4));
}

.col-body {
  flex: 1;
  min-width: 0;
}

.col-name {
  font-size: 0.8rem;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.col-latest {
  font-size: 0.45rem;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.6;
}

.col-latest-label {
  color: var(--color-cyan);
  margin-right: 4px;
}

.col-stats {
  text-align: center;
  flex-shrink: 0;
  min-width: 72px;
  border: 2px solid var(--pixel-border);
  padding: 6px 10px;
}

.stat-num {
  font-size: 1.2rem;
  color: var(--color-green);
  text-shadow: 0 0 8px rgba(0,255,65,0.5);
}

.stat-label {
  font-size: 0.4rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.col-arrow {
  font-size: 0.65rem;
  color: var(--color-cyan);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.1s steps(2);
}

.column-card:hover .col-arrow {
  opacity: 1;
}

/* 全部文章 */
.all-posts-btn-wrap {
  display: flex;
  justify-content: center;
}

.all-posts-btn {
  font-size: 0.7rem;
  padding: 14px 32px;
  border-color: var(--color-cyan);
  color: var(--color-cyan);
}

.all-posts-btn:hover {
  background: rgba(0,212,255,0.08);
  box-shadow: 4px 4px 0 var(--color-cyan);
}

@media (max-width: 640px) {
  .columns-grid {
    grid-template-columns: 1fr;
  }
  .global-search {
    flex-direction: column;
  }
}
</style>
