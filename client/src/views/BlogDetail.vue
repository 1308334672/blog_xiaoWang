<template>
  <div class="blog-detail">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">正在加载文章...</div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state container">
      <div class="emoji">😔</div>
      <p>{{ error }}</p>
      <button class="btn btn-outline" style="margin-top:20px" @click="router.back()">← 返回</button>
    </div>

    <!-- 文章内容 -->
    <div v-else-if="currentPost" class="article-wrapper">
      <!-- 文章头部 -->
      <div class="article-hero">
        <div class="article-hero-bg"></div>
        <div class="article-header container">
          <button class="back-btn" @click="router.back()">← 返回列表</button>
          <div class="article-meta">
            <span class="article-category">{{ currentPost.category }}</span>
            <span class="article-date">{{ formatDate(currentPost.createdAt) }}</span>
            <span v-if="currentPost.updatedAt !== currentPost.createdAt" class="article-updated">
              更新于 {{ formatDate(currentPost.updatedAt) }}
            </span>
          </div>
          <h1 class="article-title">{{ currentPost.title }}</h1>
          <div class="article-tags">
            <span v-for="tag in currentPost.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>

      <!-- 文章正文 -->
      <div class="article-body container">
        <div class="article-content glass-card">
          <div class="markdown-body" v-html="renderedContent"></div>
        </div>

        <!-- 文章底部导航 -->
        <div class="article-nav">
          <button class="btn btn-outline" @click="router.push('/blog')">← 博客列表</button>
          <router-link to="/admin" class="btn btn-outline">✏️ 编辑文章</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '../store/posts.js'
import { storeToRefs } from 'pinia'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { formatDateLong } from '../utils/date.js'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()
const { currentPost, loading, error } = storeToRefs(postsStore)

// 配置 marked 代码高亮
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

// 渲染后的 HTML 内容
const renderedContent = computed(() => {
  if (!currentPost.value?.content) return ''
  return marked(currentPost.value.content)
})

// 加载文章
function loadPost() {
  postsStore.fetchPost(route.params.id)
}

onMounted(loadPost)

// 路由参数变化时重新加载
watch(() => route.params.id, loadPost)

// 格式化日期（使用共享工具函数）
function formatDate(dateStr) {
  return formatDateLong(dateStr)
}
</script>

<style scoped>
.blog-detail {
  min-height: 80vh;
}

/* 文章头部 Hero */
.article-hero {
  position: relative;
  padding: 60px 0 50px;
  margin-bottom: 40px;
  overflow: hidden;
}

.article-hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 50%,
    rgba(15, 52, 96, 0.5) 0%,
    transparent 70%
  );
}

.article-header {
  position: relative;
  z-index: 1;
  padding: 0 24px;
}

.back-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 6px 0;
  margin-bottom: 24px;
  transition: all 0.3s;
  font-family: inherit;
}

.back-btn:hover {
  color: var(--color-gold);
}

.article-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.article-category {
  font-size: 0.85rem;
  color: var(--color-accent);
  background: rgba(233, 69, 96, 0.12);
  padding: 3px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(233, 69, 96, 0.3);
}

.article-date,
.article-updated {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.article-title {
  font-size: clamp(1.6rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 20px;
  background: linear-gradient(135deg, var(--color-text-primary) 60%, var(--color-gold));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.article-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 文章正文 */
.article-body {
  padding: 0 24px 80px;
}

.article-content {
  padding: 40px 48px;
  max-width: 860px;
  margin: 0 auto;
}

.article-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 860px;
  margin: 32px auto 0;
  padding: 0 4px;
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 80px 24px;
}

.error-state .emoji {
  font-size: 3rem;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .article-content {
    padding: 24px 20px;
  }

  .article-nav {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
