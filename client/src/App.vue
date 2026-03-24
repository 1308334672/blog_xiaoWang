<template>
  <div id="app-wrapper">
    <!-- 星空背景画布 -->
    <canvas ref="starCanvas" class="star-canvas"></canvas>

    <!-- 导航栏 -->
    <nav class="navbar" :class="{ scrolled: isScrolled }">
      <div class="nav-inner container">
        <router-link to="/" class="nav-logo">
          <span class="logo-star">✨</span>
          <span class="logo-text">小王の博客</span>
        </router-link>

        <div class="nav-links">
          <router-link to="/" class="nav-link" active-class="active" exact>首页</router-link>
          <router-link to="/blog" class="nav-link" active-class="active">博客</router-link>
          <router-link to="/about" class="nav-link" active-class="active">关于</router-link>
          <router-link to="/admin" class="nav-link nav-link-admin" active-class="active">管理</router-link>
        </div>

        <!-- 移动端菜单按钮 -->
        <button class="menu-toggle" @click="menuOpen = !menuOpen" aria-label="菜单">
          <span></span><span></span><span></span>
        </button>
      </div>

      <!-- 移动端下拉菜单 -->
      <div class="mobile-menu" :class="{ open: menuOpen }">
        <router-link to="/" @click="menuOpen = false">首页</router-link>
        <router-link to="/blog" @click="menuOpen = false">博客</router-link>
        <router-link to="/about" @click="menuOpen = false">关于</router-link>
        <router-link to="/admin" @click="menuOpen = false">管理</router-link>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <p class="footer-text">
          ✨ 小王の博客 &nbsp;·&nbsp; 用代码记录成长
          <span class="footer-sep">|</span>
          Made with <span class="heart">♥</span> & Vue 3
        </p>
        <p class="footer-quote">「まだ、あの空の向こう側を、この目で見ていないから。」</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 导航栏滚动效果
const isScrolled = ref(false)
const menuOpen = ref(false)
const starCanvas = ref(null)

// 监听滚动
function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

// 星空背景动画
function initStars() {
  const canvas = starCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let animId

  function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  resize()
  window.addEventListener('resize', resize)

  // 生成星星数据
  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    opacity: Math.random(),
    speed: Math.random() * 0.005 + 0.002,
    phase: Math.random() * Math.PI * 2
  }))

  let t = 0

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    t += 0.016

    stars.forEach(star => {
      const op = 0.2 + 0.8 * Math.abs(Math.sin(t * star.speed * 60 + star.phase))
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 220, ${op})`
      ctx.fill()
    })

    animId = requestAnimationFrame(draw)
  }

  draw()

  // 返回清理函数
  return () => {
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', resize)
  }
}

let cleanupStars = null

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  cleanupStars = initStars()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (cleanupStars) cleanupStars()
})
</script>

<style scoped>
/* 星空画布 - 固定在背景 */
.star-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* 包装层 */
#app-wrapper {
  position: relative;
  min-height: 100vh;
  /* 新海诚天空渐变背景 */
  background: linear-gradient(
    160deg,
    #0a0a1a 0%,
    #1a1a2e 25%,
    #16213e 50%,
    #0f2460 75%,
    #1a1a2e 100%
  );
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: all 0.4s ease;
  padding: 16px 0;
}

.navbar.scrolled {
  background: rgba(10, 10, 26, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 10px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--color-text-primary);
}

.logo-star {
  font-size: 1.3rem;
  animation: float 3s ease-in-out infinite;
}

.logo-text {
  font-size: 1.1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #f1c40f, #e94560);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 6px 16px;
  border-radius: 9999px;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  transition: all 0.3s;
  text-decoration: none;
}

.nav-link:hover,
.nav-link.active {
  color: var(--color-gold);
  background: rgba(241, 196, 15, 0.1);
}

.nav-link-admin {
  color: var(--color-accent);
  border: 1px solid rgba(233, 69, 96, 0.3);
}

.nav-link-admin:hover,
.nav-link-admin.active {
  background: rgba(233, 69, 96, 0.15);
  color: var(--color-accent);
  border-color: var(--color-accent);
}

/* 移动端菜单按钮 */
.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.menu-toggle span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--color-text-primary);
  border-radius: 2px;
  transition: all 0.3s;
}

/* 移动端下拉菜单 */
.mobile-menu {
  display: none;
  flex-direction: column;
  padding: 8px 16px 16px;
  background: rgba(10, 10, 26, 0.95);
  border-top: 1px solid var(--glass-border);
}

.mobile-menu.open {
  display: flex;
}

.mobile-menu a {
  padding: 10px 16px;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all 0.3s;
}

.mobile-menu a:hover {
  color: var(--color-gold);
  background: rgba(241, 196, 15, 0.1);
}

/* 主内容 */
.main-content {
  position: relative;
  z-index: 1;
  padding-top: 80px;
  min-height: calc(100vh - 120px);
}

/* 页脚 */
.footer {
  position: relative;
  z-index: 1;
  padding: 32px 0;
  text-align: center;
  border-top: 1px solid var(--glass-border);
  background: rgba(0, 0, 0, 0.2);
}

.footer-text {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.footer-sep {
  margin: 0 8px;
  opacity: 0.4;
}

.heart {
  color: var(--color-accent);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.footer-quote {
  margin-top: 8px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-style: italic;
  opacity: 0.6;
}

/* 响应式 */
@media (max-width: 640px) {
  .nav-links {
    display: none;
  }

  .menu-toggle {
    display: flex;
  }
}
</style>
