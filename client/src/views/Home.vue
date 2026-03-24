<template>
  <div class="home">
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-badge">🌟 欢迎来到</div>
        <h1 class="hero-title">
          <span class="gradient-text">小王の博客</span>
        </h1>
        <p class="hero-subtitle">记录学习与成长的点滴 · 技术 · 生活 · 思考</p>
        <div class="hero-actions">
          <router-link to="/blog" class="btn btn-primary">✨ 阅读博客</router-link>
          <router-link to="/about" class="btn btn-outline">关于我</router-link>
        </div>
        <!-- 滚动提示 -->
        <div class="scroll-hint">
          <span>向下探索</span>
          <div class="scroll-arrow"></div>
        </div>
      </div>
    </section>

    <!-- 最新文章区域 -->
    <section class="latest-posts container">
      <div class="section-header">
        <h2 class="section-title">最新文章</h2>
        <p class="section-desc">记录每一次思考与探索</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading">正在加载文章...</div>

      <!-- 文章卡片网格 -->
      <div v-else-if="posts.length" class="posts-grid">
        <article
          v-for="post in posts"
          :key="post.id"
          class="post-card glass-card"
          @click="goToPost(post.id)"
        >
          <div class="post-card-header">
            <span v-if="post.moduleId" class="post-module">{{ getModuleLabel(post.moduleId) }}</span>
            <span class="post-category">{{ post.category }}</span>
            <span class="post-date">{{ formatDate(post.createdAt) }}</span>
          </div>
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-summary">{{ post.summary }}</p>
          <div class="post-footer">
            <div class="post-tags">
              <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <span class="read-more">阅读全文 →</span>
          </div>
        </article>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="emoji">🌙</div>
        <p>暂无文章，快去写第一篇吧！</p>
        <router-link to="/admin" class="btn btn-primary" style="margin-top: 16px">去写文章</router-link>
      </div>

      <!-- 查看更多 -->
      <div v-if="posts.length" class="view-more">
        <router-link to="/blog" class="btn btn-outline">查看全部文章</router-link>
      </div>
    </section>

    <!-- 底部波浪装饰 -->
    <div class="wave-decoration">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z"
              fill="rgba(255,255,255,0.03)"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '../store/posts.js'
import { useModulesStore } from '../store/modules.js'
import { storeToRefs } from 'pinia'
import { formatDate } from '../utils/date.js'

const router = useRouter()
const postsStore = usePostsStore()
const modulesStore = useModulesStore()
const { posts, loading } = storeToRefs(postsStore)
const { modules } = storeToRefs(modulesStore)

// 加载最新的 6 篇文章
onMounted(() => {
  postsStore.fetchPosts({ limit: 6 })
  modulesStore.fetchModules()
})

// 跳转到文章详情
function goToPost(id) {
  router.push(`/blog/${id}`)
}

function getModuleLabel(moduleId) {
  const m = modules.value.find(m => m.id === moduleId)
  return m ? `${m.icon} ${m.name}` : ''
}
</script>

<style scoped>
/* Hero 区域 */
.hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}

/* Hero 渐变背景 */
.hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 40%,
    rgba(15, 52, 96, 0.6) 0%,
    rgba(26, 26, 46, 0.4) 50%,
    transparent 80%
  );
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 0 24px;
  animation: fadeInUp 1s ease both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-badge {
  display: inline-block;
  padding: 6px 20px;
  background: rgba(241, 196, 15, 0.15);
  border: 1px solid rgba(241, 196, 15, 0.3);
  border-radius: 9999px;
  color: var(--color-gold);
  font-size: 0.9rem;
  margin-bottom: 20px;
  animation: fadeInUp 1s 0.1s ease both;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 20px;
  animation: fadeInUp 1s 0.2s ease both;
}

.hero-subtitle {
  font-size: clamp(1rem, 2.5vw, 1.3rem);
  color: var(--color-text-secondary);
  margin-bottom: 40px;
  animation: fadeInUp 1s 0.3s ease both;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 1s 0.4s ease both;
}

/* 滚动提示 */
.scroll-hint {
  position: absolute;
  bottom: -120px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  animation: fadeInUp 1s 0.8s ease both;
}

.scroll-arrow {
  width: 20px;
  height: 20px;
  border-right: 2px solid var(--color-text-muted);
  border-bottom: 2px solid var(--color-text-muted);
  transform: rotate(45deg);
  animation: bounce 1.5s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: rotate(45deg) translateY(0); }
  50% { transform: rotate(45deg) translateY(5px); }
}

/* 最新文章区域 */
.latest-posts {
  padding: 100px 24px 80px;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(135deg, var(--color-text-primary), var(--color-gold));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-desc {
  color: var(--color-text-secondary);
  font-size: 1rem;
}

/* 文章卡片网格 */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.post-card {
  padding: 28px;
  cursor: pointer;
  transition: all 0.35s ease;
}

.post-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5),
              0 0 30px rgba(241, 196, 15, 0.08);
  border-color: rgba(241, 196, 15, 0.3);
}

.post-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 6px;
}

.post-module {
  font-size: 0.75rem;
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
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.post-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-summary {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16px;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.post-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.read-more {
  font-size: 0.85rem;
  color: var(--color-gold);
  white-space: nowrap;
  transition: all 0.3s;
}

.post-card:hover .read-more {
  letter-spacing: 1px;
}

/* 查看更多 */
.view-more {
  text-align: center;
  margin-top: 48px;
}

/* 波浪装饰 */
.wave-decoration {
  width: 100%;
  overflow: hidden;
  line-height: 0;
}

.wave-decoration svg {
  display: block;
  width: 100%;
  height: 80px;
}

@media (max-width: 640px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
