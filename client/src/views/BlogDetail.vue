<template>
  <div class="blog-detail">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">&gt; LOADING QUEST DATA...</div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state container">
      <div class="emoji">💀</div>
      <p>{{ error }}</p>
      <button class="btn btn-outline" style="margin-top:20px" @click="router.back()">&lt;&lt; BACK</button>
    </div>

    <!-- 文章内容 -->
    <div v-else-if="currentPost" class="article-wrapper">
      <!-- 文章头部 -->
      <div class="article-hero">
        <div class="article-header container">
          <button class="back-btn" @click="router.back()">&lt;&lt; BACK TO LIST</button>
          <div class="article-meta">
            <span class="article-category">{{ currentPost.category }}</span>
            <span class="article-date">{{ formatDate(currentPost.createdAt) }}</span>
            <span v-if="currentPost.updatedAt !== currentPost.createdAt" class="article-updated">
              UPDATED: {{ formatDate(currentPost.updatedAt) }}
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
          <div class="markdown-body" ref="markdownBodyRef" v-html="renderedContent"></div>
        </div>

        <!-- 文章底部导航 -->
        <div class="article-nav">
          <button class="btn btn-outline" @click="router.push('/blog')">&lt;&lt; BLOG LIST</button>
          <router-link to="/admin" class="btn btn-outline">EDIT POST</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref, nextTick } from 'vue'
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
const markdownBodyRef = ref(null)

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
  const apiBase = import.meta.env.VITE_API_BASE?.replace('/api', '') || ''
  let html = marked(currentPost.value.content)
  // 将相对路径 /uploads/ 替换为后端完整地址
  html = html.replace(/src="\/uploads\//g, `src="${apiBase}/uploads/`)
  // 只清除原始 width/height 属性，不强制设置宽度（由 JS 按实际尺寸处理）
  html = html.replace(/<img\s[^>]*>/g, (match) => {
    let tag = match.replace(/\s(width|height)\s*=\s*["'][^"']*["']/gi, '')
    tag = tag.replace(/style\s*=\s*["'][^"']*["']/gi, '')
    return tag
  })
  return html
})

// 图片加载后按真实宽高决定是否缩放
function constrainImages() {
  nextTick(() => {
    if (!markdownBodyRef.value) return
    const container = markdownBodyRef.value
    const imgs = container.querySelectorAll('img')
    imgs.forEach((img) => {
      const applyConstraint = () => {
        const maxW = container.clientWidth
        if (img.naturalWidth > maxW) {
          const ratio = maxW / img.naturalWidth
          img.style.width = maxW + 'px'
          img.style.height = Math.round(img.naturalHeight * ratio) + 'px'
        } else {
          img.style.width = img.naturalWidth + 'px'
          img.style.height = img.naturalHeight + 'px'
        }
        img.style.display = 'block'
        img.style.margin = '1em auto'
      }
      if (img.complete && img.naturalWidth) {
        applyConstraint()
      } else {
        img.addEventListener('load', applyConstraint)
      }
    })
  })
}

// 加载文章
function loadPost() {
  postsStore.fetchPost(route.params.id)
}

onMounted(loadPost)

// 路由参数变化时重新加载
watch(() => route.params.id, loadPost)

// 文章内容渲染后约束图片尺寸
watch(renderedContent, constrainImages)

// 格式化日期（使用共享工具函数）
function formatDate(dateStr) {
  return formatDateLong(dateStr)
}
</script>

<style scoped>
.blog-detail {
  min-height: 80vh;
}

/* 文章头部 */
.article-hero {
  position: relative;
  padding: 50px 0 40px;
  margin-bottom: 32px;
  border-bottom: 3px dashed var(--pixel-border);
}

.article-header {
  position: relative;
  z-index: 1;
  padding: 0 24px;
}

.back-btn {
  background: none;
  border: 2px solid var(--pixel-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.6rem;
  padding: 6px 12px;
  margin-bottom: 24px;
  transition: all 0.1s steps(2);
  font-family: 'Press Start 2P', monospace;
}

.back-btn:hover {
  color: var(--color-green);
  border-color: var(--color-green);
  text-shadow: 0 0 6px rgba(0, 255, 65, 0.3);
}

.article-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.article-category {
  font-size: 0.55rem;
  color: var(--color-accent);
  background: rgba(255, 107, 157, 0.12);
  padding: 3px 10px;
  border: 2px solid rgba(255, 107, 157, 0.3);
}

.article-date,
.article-updated {
  font-size: 0.55rem;
  color: var(--color-text-muted);
}

.article-title {
  font-size: clamp(1rem, 3vw, 1.6rem);
  line-height: 1.8;
  margin-bottom: 20px;
  color: var(--color-green);
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
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
  padding: 32px 40px;
  max-width: 1100px;
  margin: 0 auto;
  overflow: hidden;
  word-break: break-word;
}

.article-content :deep(.markdown-body) {
  max-width: 100%;
  overflow: hidden;
  word-break: break-word;
}

.article-content :deep(img) {
  border: 2px solid var(--pixel-border);
  box-sizing: border-box;
  cursor: zoom-in;
  object-fit: contain;
}

.article-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1100px;
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
  .article-body {
    padding: 0 12px 60px;
  }

  .article-content {
    padding: 16px 12px;
  }

  .article-nav {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
