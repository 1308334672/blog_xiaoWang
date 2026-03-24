<template>
  <div class="home">
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">&gt; WELCOME_TO</div>
        <h1 class="hero-title">
          <span class="pixel-title">小王の博客</span>
        </h1>
        <p class="hero-subtitle">
          <span class="typing-line">&gt; LOADING... 技术 · 生活 · 思考</span>
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-label">HP</span>
            <div class="stat-bar"><div class="stat-fill hp"></div></div>
          </div>
          <div class="stat-item">
            <span class="stat-label">MP</span>
            <div class="stat-bar"><div class="stat-fill mp"></div></div>
          </div>
          <div class="stat-item">
            <span class="stat-label">EXP</span>
            <div class="stat-bar"><div class="stat-fill exp"></div></div>
          </div>
        </div>
        <div class="hero-actions">
          <router-link to="/blog" class="btn btn-primary">🎮 START GAME</router-link>
          <router-link to="/about" class="btn btn-outline">📋 STATUS</router-link>
        </div>
        <!-- 滚动提示 -->
        <div class="scroll-hint">
          <span>▼ SCROLL DOWN ▼</span>
        </div>
      </div>
    </section>

    <!-- 最新文章区域 -->
    <section class="latest-posts container">
      <div class="section-header">
        <h2 class="section-title">== LATEST POSTS ==</h2>
        <p class="section-desc">&gt; 记录每一次思考与探索_</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading">&gt; LOADING DATA...</div>

      <!-- 文章卡片网格 -->
      <div v-else-if="posts.length" class="posts-grid">
        <article
          v-for="(post, idx) in posts"
          :key="post.id"
          class="post-card glass-card"
          @click="goToPost(post.id)"
        >
          <div class="post-card-index">#{{ String(idx + 1).padStart(2, '0') }}</div>
          <div class="post-card-header">
            <span class="post-category">{{ post.category }}</span>
            <span class="post-date">{{ formatDate(post.createdAt) }}</span>
          </div>
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-summary">{{ post.summary }}</p>
          <div class="post-footer">
            <div class="post-tags">
              <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <span class="read-more">&gt;&gt; ENTER</span>
          </div>
        </article>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="emoji">💀</div>
        <p>NO DATA FOUND</p>
        <router-link to="/admin" class="btn btn-primary" style="margin-top: 16px">NEW QUEST</router-link>
      </div>

      <!-- 查看更多 -->
      <div v-if="posts.length" class="view-more">
        <router-link to="/blog" class="btn btn-outline">&gt; VIEW ALL POSTS</router-link>
      </div>
    </section>

    <!-- 底部像素装饰 -->
    <div class="pixel-decoration">
      <div class="pixel-line"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '../store/posts.js'
import { storeToRefs } from 'pinia'
import { formatDate } from '../utils/date.js'

const router = useRouter()
const postsStore = usePostsStore()
const { posts, loading } = storeToRefs(postsStore)

onMounted(() => {
  postsStore.fetchPosts({ limit: 6 })
})

function goToPost(id) {
  router.push(`/blog/${id}`)
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

.hero-content {
  position: relative;
  z-index: 2;
  padding: 0 24px;
}

.hero-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(0, 255, 65, 0.1);
  border: 2px solid var(--color-green);
  color: var(--color-green);
  font-size: 0.65rem;
  margin-bottom: 20px;
  animation: blink-cursor 1.5s steps(2) infinite;
}

.hero-title {
  margin-bottom: 20px;
}

.pixel-title {
  font-size: clamp(1.8rem, 6vw, 3.5rem);
  color: var(--color-green);
  text-shadow:
    0 0 20px rgba(0, 255, 65, 0.5),
    0 0 40px rgba(0, 255, 65, 0.2),
    4px 4px 0px #006600;
  letter-spacing: 4px;
}

.hero-subtitle {
  margin-bottom: 32px;
}

.typing-line {
  font-size: clamp(0.6rem, 1.5vw, 0.8rem);
  color: var(--color-cyan);
}

/* HP/MP/EXP 状态条 */
.hero-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 300px;
  margin: 0 auto 36px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 0.6rem;
  color: var(--color-text-secondary);
  width: 32px;
  text-align: right;
}

.stat-bar {
  flex: 1;
  height: 12px;
  background: var(--color-bg-dark);
  border: 2px solid var(--pixel-border);
}

.stat-fill {
  height: 100%;
  transition: width 1.5s steps(20);
}

.stat-fill.hp {
  width: 85%;
  background: #ff4444;
  box-shadow: inset 0 -2px 0 #cc0000;
}

.stat-fill.mp {
  width: 60%;
  background: #4488ff;
  box-shadow: inset 0 -2px 0 #2266cc;
}

.stat-fill.exp {
  width: 40%;
  background: var(--color-green);
  box-shadow: inset 0 -2px 0 #006600;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 滚动提示 */
.scroll-hint {
  margin-top: 60px;
  color: var(--color-text-muted);
  font-size: 0.55rem;
  animation: float 1.5s steps(4) infinite;
}

/* 最新文章区域 */
.latest-posts {
  padding: 80px 24px 80px;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-title {
  font-size: 1.2rem;
  color: var(--color-green);
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
  margin-bottom: 10px;
}

.section-desc {
  color: var(--color-text-secondary);
  font-size: 0.65rem;
}

/* 文章卡片网格 */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.post-card {
  padding: 24px;
  cursor: pointer;
  transition: all 0.1s steps(2);
  position: relative;
}

.post-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px rgba(0, 255, 65, 0.2);
  border-color: var(--color-green);
}

.post-card-index {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 0.55rem;
  color: var(--color-text-muted);
}

.post-card-header {
  display: flex;
  justify-content: space-between;
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
  font-size: 0.8rem;
  color: var(--color-text-primary);
  margin-bottom: 10px;
  line-height: 1.8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card:hover .post-title {
  color: var(--color-green);
  text-shadow: 0 0 6px rgba(0, 255, 65, 0.3);
}

.post-summary {
  font-size: 0.65rem;
  color: var(--color-text-secondary);
  line-height: 2;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 14px;
  font-family: 'Courier New', monospace;
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
  font-size: 0.6rem;
  color: var(--color-green);
  white-space: nowrap;
}

.post-card:hover .read-more {
  animation: blink-cursor 0.8s steps(2) infinite;
}

/* 查看更多 */
.view-more {
  text-align: center;
  margin-top: 48px;
}

/* 像素装饰 */
.pixel-decoration {
  padding: 40px 0;
}

.pixel-line {
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    var(--color-green) 0px,
    var(--color-green) 8px,
    transparent 8px,
    transparent 16px,
    var(--color-cyan) 16px,
    var(--color-cyan) 24px,
    transparent 24px,
    transparent 32px
  );
  opacity: 0.3;
}

@media (max-width: 640px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .hero-stats {
    max-width: 250px;
  }
}
</style>
