<template>
  <div id="app-wrapper">
    <!-- 像素雨背景画布 -->
    <canvas ref="pixelCanvas" class="pixel-canvas"></canvas>

    <!-- 导航栏 -->
    <nav class="navbar" :class="{ scrolled: isScrolled }">
      <div class="nav-inner container">
        <router-link to="/" class="nav-logo">
          <span class="logo-icon">🎮</span>
          <span class="logo-text">小王の博客</span>
        </router-link>

        <div class="nav-links">
          <router-link to="/" class="nav-link" active-class="active" exact>[ 首页 ]</router-link>
          <router-link to="/blog" class="nav-link" active-class="active">[ 博客 ]</router-link>
          <router-link to="/about" class="nav-link" active-class="active">[ 关于 ]</router-link>
          <router-link to="/admin" class="nav-link nav-link-admin" active-class="active">[ 管理 ]</router-link>
        </div>

        <!-- 移动端菜单按钮 -->
        <button class="menu-toggle" @click="menuOpen = !menuOpen" aria-label="菜单">
          <span></span><span></span><span></span>
        </button>
      </div>

      <!-- 移动端下拉菜单 -->
      <div class="mobile-menu" :class="{ open: menuOpen }">
        <router-link to="/" @click="menuOpen = false">[ 首页 ]</router-link>
        <router-link to="/blog" @click="menuOpen = false">[ 博客 ]</router-link>
        <router-link to="/about" @click="menuOpen = false">[ 关于 ]</router-link>
        <router-link to="/admin" @click="menuOpen = false">[ 管理 ]</router-link>
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
          🎮 小王の博客 &nbsp;·&nbsp; LEVEL UP YOUR CODE
          <span class="footer-sep">|</span>
          POWERED BY <span class="heart">♥</span> &amp; VUE 3
        </p>
        <p class="footer-quote">PRESS START TO CONTINUE...</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const menuOpen = ref(false)
const pixelCanvas = ref(null)

function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

// 像素雨/矩阵雨背景
function initPixelRain() {
  const canvas = pixelCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let animId

  function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  resize()
  window.addEventListener('resize', resize)

  const fontSize = 14
  const columns = Math.floor(canvas.width / fontSize)
  const drops = Array.from({ length: columns }, () => Math.random() * -100)
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハ01ABC</>{}[];'.split('')

  function draw() {
    ctx.fillStyle = 'rgba(15, 15, 35, 0.06)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = `${fontSize}px monospace`

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)]
      const x = i * fontSize
      const y = drops[i] * fontSize

      // 随机绿色/青色/暗色
      const brightness = Math.random()
      if (brightness > 0.95) {
        ctx.fillStyle = '#ffffff'
      } else if (brightness > 0.8) {
        ctx.fillStyle = 'rgba(0, 255, 65, 0.9)'
      } else if (brightness > 0.6) {
        ctx.fillStyle = 'rgba(0, 212, 255, 0.4)'
      } else {
        ctx.fillStyle = 'rgba(0, 255, 65, 0.15)'
      }

      ctx.fillText(char, x, y)

      if (y > canvas.height && Math.random() > 0.98) {
        drops[i] = 0
      }

      drops[i] += 0.4
    }

    animId = requestAnimationFrame(draw)
  }

  draw()

  return () => {
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', resize)
  }
}

let cleanupPixelRain = null

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  cleanupPixelRain = initPixelRain()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (cleanupPixelRain) cleanupPixelRain()
})
</script>

<style scoped>
/* 像素雨画布 */
.pixel-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
}

/* 包装层 */
#app-wrapper {
  position: relative;
  min-height: 100vh;
  background: var(--color-bg-deep);
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: all 0.15s steps(3);
  padding: 12px 0;
  border-bottom: 3px solid transparent;
}

.navbar.scrolled {
  background: rgba(15, 15, 35, 0.95);
  border-bottom: 3px solid var(--color-green);
  padding: 8px 0;
  box-shadow: 0 4px 0px rgba(0, 255, 65, 0.15);
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

.logo-icon {
  font-size: 1.3rem;
  animation: float 2s steps(4) infinite;
}

.logo-text {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.85rem;
  color: var(--color-green);
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.5),
               2px 2px 0px #006600;
}

.nav-links {
  display: flex;
  gap: 4px;
}

.nav-link {
  padding: 6px 12px;
  color: var(--color-text-secondary);
  font-size: 0.65rem;
  transition: all 0.15s steps(3);
  text-decoration: none;
  font-family: 'Press Start 2P', monospace;
  border: 2px solid transparent;
}

.nav-link:hover,
.nav-link.active {
  color: var(--color-green);
  text-shadow: 0 0 8px rgba(0, 255, 65, 0.5);
  border-color: var(--color-green);
  background: rgba(0, 255, 65, 0.08);
}

.nav-link-admin {
  color: var(--color-accent);
}

.nav-link-admin:hover,
.nav-link-admin.active {
  color: var(--color-accent);
  text-shadow: 0 0 8px rgba(255, 107, 157, 0.5);
  border-color: var(--color-accent);
  background: rgba(255, 107, 157, 0.08);
}

/* 移动端菜单按钮 */
.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: 2px solid var(--color-green);
  cursor: pointer;
  padding: 6px;
}

.menu-toggle span {
  display: block;
  width: 18px;
  height: 3px;
  background: var(--color-green);
}

/* 移动端下拉菜单 */
.mobile-menu {
  display: none;
  flex-direction: column;
  padding: 8px 16px 16px;
  background: rgba(15, 15, 35, 0.98);
  border-top: 2px solid var(--pixel-border);
}

.mobile-menu.open {
  display: flex;
}

.mobile-menu a {
  padding: 10px 16px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.65rem;
  transition: all 0.15s steps(3);
  border-bottom: 1px dashed var(--pixel-border);
}

.mobile-menu a:hover {
  color: var(--color-green);
  text-shadow: 0 0 8px rgba(0, 255, 65, 0.5);
  background: rgba(0, 255, 65, 0.05);
}

/* 主内容 */
.main-content {
  position: relative;
  z-index: 1;
  padding-top: 70px;
  min-height: calc(100vh - 100px);
}

/* 页脚 */
.footer {
  position: relative;
  z-index: 1;
  padding: 24px 0;
  text-align: center;
  border-top: 3px solid var(--pixel-border);
  background: rgba(0, 0, 0, 0.5);
}

.footer-text {
  color: var(--color-text-secondary);
  font-size: 0.6rem;
}

.footer-sep {
  margin: 0 8px;
  color: var(--color-green);
}

.heart {
  color: var(--color-accent);
  animation: blink-heart 1s steps(2) infinite;
}

@keyframes blink-heart {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.footer-quote {
  margin-top: 8px;
  font-size: 0.55rem;
  color: var(--color-green);
  animation: blink-cursor 1.2s steps(2) infinite;
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
