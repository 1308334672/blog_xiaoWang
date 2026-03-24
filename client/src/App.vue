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

    <!-- 自定义像素光标 -->
    <div class="pixel-cursor" ref="cursorEl"></div>
    <div class="pixel-cursor-dot"></div>
    <!-- 点击粒子层 -->
    <div class="particles-layer" ref="particlesEl"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const menuOpen = ref(false)
const pixelCanvas = ref(null)
const cursorEl = ref(null)
const particlesEl = ref(null)

// 画布鼠标坐标（每帧直接读取，无需响应式）
let mouseCanvasX = -9999
let mouseCanvasY = -9999
const clickRipples = []

function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

// 像素光标跟踪 + 更新画布鼠标坐标
function handleMouseMove(e) {
  if (!cursorEl.value) return
  cursorEl.value.style.transform = `translate(${e.clientX - 12}px, ${e.clientY - 12}px)`
  mouseCanvasX = e.clientX
  mouseCanvasY = e.clientY
}

// 点击粒子爆炸 + 伤害数字 + canvas波纹
function handleClick(e) {
  createParticles(e.clientX, e.clientY)
  createDamageNumber(e.clientX, e.clientY)
  clickRipples.push({ x: e.clientX, y: e.clientY, r: 0, maxR: 260, alpha: 0.9 })
}

function createParticles(x, y) {
  const container = particlesEl.value
  if (!container) return
  const colors = ['#00ff41', '#00d4ff', '#ff6b9d', '#ffd93d']
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div')
    p.className = 'click-particle'
    const angle = (i / 12) * Math.PI * 2
    const distance = 28 + Math.random() * 32
    const dx = Math.cos(angle) * distance
    const dy = Math.sin(angle) * distance
    const color = colors[i % colors.length]
    p.style.cssText = `left:${x - 4}px;top:${y - 4}px;background:${color};box-shadow:0 0 6px ${color};--dx:${dx}px;--dy:${dy}px`
    container.appendChild(p)
    setTimeout(() => p.remove(), 550)
  }
}

function createDamageNumber(x, y) {
  const container = particlesEl.value
  if (!container) return
  const dmg = Math.floor(Math.random() * 999) + 1
  const isCrit = dmg > 900
  const el = document.createElement('div')
  el.className = isCrit ? 'damage-number crit' : 'damage-number'
  el.textContent = isCrit ? 'CRITICAL!!' : dmg
  el.style.cssText = `left:${x}px;top:${y - 10}px`
  container.appendChild(el)
  setTimeout(() => el.remove(), 900)
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

      // 鼠标近距离影响：越近越亮越快
      const dist = Math.hypot(mouseCanvasX - x, mouseCanvasY - y)
      const influence = Math.max(0, 1 - dist / 200)
      let speed = 0.4

      if (influence > 0.6) {
        ctx.fillStyle = '#ffffff'
        speed = 2.0
      } else if (influence > 0.3) {
        ctx.fillStyle = `rgba(0, 212, 255, ${0.65 + influence * 0.35})`
        speed = 1.1
      } else if (influence > 0) {
        ctx.fillStyle = `rgba(0, 255, 65, ${0.4 + influence * 2})`
        speed = 0.7
      } else {
        // 正常随机颜色
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
      }

      ctx.fillText(char, x, y)

      if (y > canvas.height && Math.random() > 0.98) {
        drops[i] = 0
      }

      drops[i] += speed
    }

    // 绘制点击冲击波
    for (let j = clickRipples.length - 1; j >= 0; j--) {
      const rp = clickRipples[j]
      rp.r += 5
      rp.alpha = (1 - rp.r / rp.maxR) * 0.85
      if (rp.r >= rp.maxR) { clickRipples.splice(j, 1); continue }

      // 外圈 — 青色
      ctx.lineWidth = 2
      ctx.strokeStyle = `rgba(0, 212, 255, ${rp.alpha})`
      ctx.beginPath()
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
      ctx.stroke()

      // 内圈 — 粉色
      if (rp.r > 30) {
        ctx.lineWidth = 1
        ctx.strokeStyle = `rgba(255, 107, 157, ${rp.alpha * 0.55})`
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, rp.r * 0.55, 0, Math.PI * 2)
        ctx.stroke()
      }
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
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('click', handleClick)
  cleanupPixelRain = initPixelRain()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('click', handleClick)
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
  font-size: 1.05rem;
  color: var(--color-green);
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.5),
               2px 2px 0px #006600;
}

.nav-links {
  display: flex;
  gap: 4px;
}

.nav-link {
  padding: 8px 14px;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
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
  padding: 12px 16px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.85rem;
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

/* ===== 像素光标 ===== */
.pixel-cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-green);
  pointer-events: none;
  z-index: 99999;
  box-shadow: 0 0 8px var(--color-green), inset 0 0 4px rgba(0,255,65,0.2);
  transition: border-color 0.1s steps(2);
}

.pixel-cursor-dot {
  position: fixed;
  top: 0;
  left: 0;
  width: 4px;
  height: 4px;
  background: var(--color-green);
  pointer-events: none;
  z-index: 99999;
  box-shadow: 0 0 6px var(--color-green);
  /* dot follows via JS on cursor position + offset */
}

/* ===== 粒子层 ===== */
.particles-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 99998;
  overflow: hidden;
}

.click-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  pointer-events: none;
  animation: particle-burst 0.55s steps(6) forwards;
}

@keyframes particle-burst {
  0%   { transform: translate(0, 0) scale(1.5); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
}

.damage-number {
  position: absolute;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.65rem;
  color: var(--color-accent);
  pointer-events: none;
  text-shadow: 1px 1px 0 #000, 0 0 8px var(--color-accent);
  animation: damage-float 0.9s steps(9) forwards;
  white-space: nowrap;
  transform: translateX(-50%);
}

.damage-number.crit {
  color: var(--color-gold);
  font-size: 0.85rem;
  text-shadow: 2px 2px 0 #000, 0 0 12px var(--color-gold);
}

@keyframes damage-float {
  0%   { transform: translateX(-50%) translateY(0) scale(1.2); opacity: 1; }
  60%  { transform: translateX(-50%) translateY(-40px) scale(1); opacity: 1; }
  100% { transform: translateX(-50%) translateY(-70px) scale(0.8); opacity: 0; }
}
</style>
