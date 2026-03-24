<template>
  <div class="game-page">
    <!-- 模式选择 / 主菜单 -->
    <div v-if="phase === 'menu'" class="menu-screen">
      <div class="menu-box glass-card">
        <div class="menu-title-wrap">
          <div class="title-prefix blink-cursor">&gt;_</div>
          <h1 class="menu-title">AIM TRAINER</h1>
        </div>
        <p class="menu-sub">PIXEL SHOOTING RANGE v1.0</p>

        <div class="mode-grid">
          <button
            v-for="m in modes"
            :key="m.id"
            class="mode-card"
            :class="{ selected: selectedMode === m.id }"
            @click="selectedMode = m.id"
          >
            <div class="mode-icon">{{ m.icon }}</div>
            <div class="mode-name">{{ m.name }}</div>
            <div class="mode-desc">{{ m.desc }}</div>
          </button>
        </div>

        <div class="diff-row">
          <span class="diff-label">DIFFICULTY:</span>
          <button
            v-for="d in difficulties"
            :key="d.id"
            class="diff-btn"
            :class="{ active: selectedDiff === d.id }"
            @click="selectedDiff = d.id"
          >{{ d.label }}</button>
        </div>

        <button class="btn btn-primary start-btn" @click="startGame">
          ▶ START GAME
        </button>

        <!-- 最佳成绩 -->
        <div v-if="bestScores[selectedMode]" class="best-score">
          <span class="best-label">BEST:</span>
          <span class="best-val">{{ bestScores[selectedMode].score }} PTS</span>
          <span class="best-acc">/ ACC {{ bestScores[selectedMode].acc }}%</span>
        </div>
      </div>
    </div>

    <!-- 游戏进行中 -->
    <div v-else-if="phase === 'playing'" class="playing-screen" @mousemove="onMouseMove" @click.prevent="onShoot">
      <!-- 顶部 HUD -->
      <div class="hud">
        <div class="hud-item">
          <span class="hud-label">SCORE</span>
          <span class="hud-val score-val">{{ score }}</span>
        </div>
        <div class="hud-item hud-timer" :class="{ danger: timeLeft <= 5 }">
          <span class="hud-label">TIME</span>
          <span class="hud-val">{{ timeLeft }}s</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">HITS</span>
          <span class="hud-val">{{ hits }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">MISS</span>
          <span class="hud-val miss-val">{{ misses }}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">COMBO</span>
          <span class="hud-val combo-val" :class="{ mega: combo >= 5 }">x{{ combo }}</span>
        </div>
        <button class="hud-quit" @click.stop="endGame(true)">[ ESC ]</button>
      </div>

      <!-- 游戏区域 -->
      <div class="arena" ref="arenaEl">
        <!-- 准星 -->
        <div class="crosshair" :style="crosshairStyle"></div>

        <!-- 目标 -->
        <div
          v-for="t in targets"
          :key="t.id"
          class="target"
          :class="[`target-${t.type}`, { moving: t.vx !== 0 || t.vy !== 0 }]"
          :style="targetStyle(t)"
          @click.stop="hitTarget(t, $event)"
        >
          <div class="target-inner"></div>
          <div class="target-hp" :style="{ width: (t.hp / t.maxHp * 100) + '%' }"></div>
        </div>

        <!-- 浮动伤害 -->
        <div
          v-for="dmg in floatDmgs"
          :key="dmg.id"
          class="float-dmg"
          :class="{ crit: dmg.crit }"
          :style="{ left: dmg.x + 'px', top: dmg.y + 'px' }"
        >{{ dmg.text }}</div>

        <!-- 节拍器提示 -->
        <div v-if="comboAlert" class="combo-alert">{{ comboAlert }}</div>
      </div>
    </div>

    <!-- 结算画面 -->
    <div v-else-if="phase === 'result'" class="result-screen">
      <div class="result-box glass-card">
        <div class="result-title">
          <span v-if="score >= 3000" class="rank s">S RANK</span>
          <span v-else-if="score >= 1800" class="rank a">A RANK</span>
          <span v-else-if="score >= 900" class="rank b">B RANK</span>
          <span v-else class="rank c">C RANK</span>
        </div>
        <div class="result-score">{{ score }}</div>
        <div class="result-score-label">POINTS</div>

        <div class="result-stats">
          <div class="stat-row">
            <span class="stat-k">HITS</span>
            <span class="stat-v green">{{ hits }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-k">MISSES</span>
            <span class="stat-v red">{{ misses }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-k">ACCURACY</span>
            <span class="stat-v cyan">{{ accuracy }}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-k">MAX COMBO</span>
            <span class="stat-v yellow">x{{ maxCombo }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-k">MODE</span>
            <span class="stat-v">{{ currentModeName }}</span>
          </div>
        </div>

        <div class="result-btns">
          <button class="btn btn-primary" @click="startGame">▶ RETRY</button>
          <button class="btn btn-outline" @click="phase = 'menu'">MENU</button>
        </div>

        <div v-if="isNewBest" class="new-best blink-cursor">!! NEW BEST SCORE !!</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

// ——— 模式 & 难度配置 ———
const modes = [
  { id: 'classic', icon: '🎯', name: 'CLASSIC', desc: 'Static targets. Aim & click.' },
  { id: 'flick',   icon: '⚡', name: 'FLICK',   desc: 'Targets vanish fast. Reflex!' },
  { id: 'track',   icon: '🔄', name: 'TRACKING', desc: 'Moving targets. Track them.' },
  { id: 'micro',   icon: '🔬', name: 'MICRO',   desc: 'Tiny targets. Precision mode.' }
]
const difficulties = [
  { id: 'easy',   label: 'EASY',   time: 45, count: 3, spawnMs: 1400, size: 56 },
  { id: 'normal', label: 'NORMAL', time: 30, count: 4, spawnMs: 900,  size: 44 },
  { id: 'hard',   label: 'HARD',   time: 30, count: 5, spawnMs: 600,  size: 32 },
  { id: 'insane', label: 'INSANE', time: 25, count: 6, spawnMs: 380,  size: 22 }
]

const selectedMode = ref('classic')
const selectedDiff = ref('normal')
const phase = ref('menu') // 'menu' | 'playing' | 'result'

// ——— 游戏状态 ———
const score     = ref(0)
const hits      = ref(0)
const misses    = ref(0)
const combo     = ref(0)
const maxCombo  = ref(0)
const timeLeft  = ref(30)
const targets   = ref([])
const floatDmgs = ref([])
const comboAlert = ref('')
const isNewBest  = ref(false)

const accuracy = computed(() => {
  const total = hits.value + misses.value
  return total === 0 ? 100 : Math.round(hits.value / total * 100)
})
const currentModeName = computed(() => modes.find(m => m.id === selectedMode.value)?.name || '')

// ——— 鼠标 & 准星 ———
const arenaEl = ref(null)
const mousePos = ref({ x: 0, y: 0 })
const crosshairStyle = computed(() => ({
  left: mousePos.value.x + 'px',
  top: mousePos.value.y + 'px',
  transform: 'translate(-50%, -50%)'
}))
function onMouseMove(e) {
  const rect = arenaEl.value?.getBoundingClientRect()
  if (!rect) return
  mousePos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

// ——— 最佳成绩 ———
const bestScores = ref(JSON.parse(localStorage.getItem('aimtrainer_best') || '{}'))

function saveBest() {
  const key = selectedMode.value
  const prev = bestScores.value[key]
  if (!prev || score.value > prev.score) {
    bestScores.value[key] = { score: score.value, acc: accuracy.value }
    localStorage.setItem('aimtrainer_best', JSON.stringify(bestScores.value))
    isNewBest.value = true
  }
}

// ——— 定时器 ———
let countdownTimer = null
let spawnTimer = null
let moveTimer = null
let _targetId = 0

function startGame() {
  // 重置
  score.value = 0
  hits.value = 0
  misses.value = 0
  combo.value = 0
  maxCombo.value = 0
  targets.value = []
  floatDmgs.value = []
  comboAlert.value = ''
  isNewBest.value = false

  const diff = difficulties.find(d => d.id === selectedDiff.value) || difficulties[1]
  timeLeft.value = diff.time

  phase.value = 'playing'

  // 倒计时
  countdownTimer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) endGame(false)
  }, 1000)

  // 批量刷新目标
  spawnTargets(diff)
  spawnTimer = setInterval(() => spawnTargets(diff), diff.spawnMs)

  // 移动目标帧循环
  moveTimer = setInterval(moveTargets, 16)
}

function spawnTargets(diff) {
  const mode = selectedMode.value
  const arena = arenaEl.value
  if (!arena) return
  const { width, height } = arena.getBoundingClientRect()

  // 移除到期目标
  const lifeMs = mode === 'flick' ? 800 : mode === 'micro' ? 1800 : 3500
  const now = Date.now()
  targets.value = targets.value.filter(t => now - t.born < lifeMs)

  // 补充
  const want = diff.count
  while (targets.value.length < want) {
    const size = mode === 'micro'
      ? diff.size * 0.55
      : mode === 'flick'
      ? diff.size * 0.8
      : diff.size

    const x = size + Math.random() * (width - size * 2)
    const y = size + Math.random() * (height - size * 2)

    // tracking 模式给速度
    const speed = mode === 'track' ? (1.5 + Math.random() * 2) : 0
    const angle = Math.random() * Math.PI * 2

    // target 类型影响颜色
    const types = ['green', 'cyan', 'pink', 'gold']
    const type = mode === 'flick' ? 'pink'
               : mode === 'micro' ? 'gold'
               : types[Math.floor(Math.random() * 2)]

    targets.value.push({
      id: ++_targetId,
      x, y, size,
      type,
      hp: 1, maxHp: 1,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      born: now
    })
  }
}

function moveTargets() {
  const arena = arenaEl.value
  if (!arena) return
  const { width, height } = arena.getBoundingClientRect()
  targets.value.forEach(t => {
    if (t.vx === 0 && t.vy === 0) return
    t.x += t.vx
    t.y += t.vy
    if (t.x - t.size / 2 < 0 || t.x + t.size / 2 > width)  t.vx *= -1
    if (t.y - t.size / 2 < 0 || t.y + t.size / 2 > height) t.vy *= -1
    t.x = Math.max(t.size / 2, Math.min(width  - t.size / 2, t.x))
    t.y = Math.max(t.size / 2, Math.min(height - t.size / 2, t.y))
  })
}

function targetStyle(t) {
  return {
    left: t.x - t.size / 2 + 'px',
    top:  t.y - t.size / 2 + 'px',
    width:  t.size + 'px',
    height: t.size + 'px'
  }
}

function hitTarget(t, e) {
  e.stopPropagation()
  // 计分
  combo.value++
  if (combo.value > maxCombo.value) maxCombo.value = combo.value
  const comboBonus = Math.min(combo.value, 10)
  const pts = Math.round(100 * comboBonus)
  score.value += pts
  hits.value++

  // 浮动数字
  spawnFloat(e.offsetX ?? t.x, e.offsetY ?? t.y, pts, combo.value >= 5)

  // Combo 提示
  if (combo.value === 5)  showAlert('NICE!')
  if (combo.value === 10) showAlert('GREAT!!')
  if (combo.value === 20) showAlert('UNSTOPPABLE!!!')

  // 移除目标
  targets.value = targets.value.filter(i => i.id !== t.id)
}

function onShoot(e) {
  // 点在空白区域 → 计 miss
  misses.value++
  combo.value = 0
}

function spawnFloat(x, y, pts, crit) {
  const id = ++_targetId
  floatDmgs.value.push({ id, x, y, text: crit ? `CRIT +${pts}` : `+${pts}`, crit })
  setTimeout(() => { floatDmgs.value = floatDmgs.value.filter(d => d.id !== id) }, 700)
}

let alertTimer = null
function showAlert(msg) {
  comboAlert.value = msg
  clearTimeout(alertTimer)
  alertTimer = setTimeout(() => { comboAlert.value = '' }, 900)
}

function endGame(manual) {
  clearInterval(countdownTimer)
  clearInterval(spawnTimer)
  clearInterval(moveTimer)
  clearTimeout(alertTimer)
  targets.value = []
  saveBest()
  phase.value = 'result'
}

onUnmounted(() => {
  clearInterval(countdownTimer)
  clearInterval(spawnTimer)
  clearInterval(moveTimer)
  clearTimeout(alertTimer)
})
</script>

<style scoped>
/* ============================
   AIM TRAINER — 像素游戏风格
   ============================ */
.game-page {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
}

/* ——— 主菜单 ——— */
.menu-screen {
  width: 100%;
  display: flex;
  justify-content: center;
}

.menu-box {
  width: 100%;
  max-width: 680px;
  padding: 40px 36px;
  text-align: center;
}

.menu-title-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.title-prefix {
  font-size: 1.4rem;
  color: var(--color-green);
}

.menu-title {
  font-size: 1.8rem;
  color: var(--color-green);
  text-shadow: 0 0 16px rgba(0,255,65,0.6), 3px 3px 0 #004400;
}

.menu-sub {
  color: var(--color-text-muted);
  font-size: 0.55rem;
  margin-bottom: 32px;
  letter-spacing: 2px;
}

/* 模式卡片 */
.mode-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.mode-card {
  background: rgba(0,0,0,0.4);
  border: 3px solid var(--pixel-border);
  padding: 16px 12px;
  cursor: none;
  transition: all 0.1s steps(2);
  font-family: 'Press Start 2P', monospace;
  text-align: center;
}

.mode-card:hover {
  border-color: var(--color-cyan);
  background: rgba(0, 212, 255, 0.08);
  transform: translate(-2px, -2px);
  box-shadow: 2px 2px 0 var(--color-cyan);
}

.mode-card.selected {
  border-color: var(--color-green);
  background: rgba(0, 255, 65, 0.1);
  box-shadow: 4px 4px 0 #004400, 0 0 16px rgba(0,255,65,0.2);
}

.mode-icon { font-size: 1.6rem; margin-bottom: 8px; }
.mode-name { font-size: 0.7rem; color: var(--color-text-primary); margin-bottom: 6px; }
.mode-desc { font-size: 0.45rem; color: var(--color-text-muted); line-height: 1.8; }

/* 难度选择 */
.diff-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
  flex-wrap: wrap;
  justify-content: center;
}

.diff-label {
  font-size: 0.55rem;
  color: var(--color-text-secondary);
  margin-right: 4px;
}

.diff-btn {
  background: none;
  border: 2px solid var(--pixel-border);
  color: var(--color-text-muted);
  font-family: 'Press Start 2P', monospace;
  font-size: 0.5rem;
  padding: 6px 12px;
  cursor: none;
  transition: all 0.1s steps(2);
}

.diff-btn:hover {
  border-color: var(--color-yellow);
  color: var(--color-yellow);
}

.diff-btn.active {
  border-color: var(--color-yellow);
  color: var(--color-yellow);
  background: rgba(255, 217, 61, 0.12);
  box-shadow: 2px 2px 0 #665500;
}

.start-btn {
  width: 100%;
  justify-content: center;
  font-size: 0.85rem;
  padding: 14px;
  margin-bottom: 16px;
}

.best-score {
  font-size: 0.5rem;
  color: var(--color-text-muted);
}
.best-val { color: var(--color-green); margin: 0 4px; }
.best-acc { color: var(--color-cyan); }

/* ——— 游戏进行中 ——— */
.playing-screen {
  position: fixed;
  inset: 0;
  top: 70px;
  display: flex;
  flex-direction: column;
  z-index: 50;
  cursor: none;
}

/* HUD */
.hud {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(0, 0, 0, 0.85);
  border-bottom: 3px solid var(--color-green);
  padding: 8px 24px;
  flex-shrink: 0;
  box-shadow: 0 4px 0 rgba(0,255,65,0.1);
}

.hud-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  border-right: 1px dashed var(--pixel-border);
  padding: 0 16px;
}

.hud-item:first-child { padding-left: 0; }

.hud-label {
  font-size: 0.45rem;
  color: var(--color-text-muted);
  margin-bottom: 2px;
}

.hud-val {
  font-size: 0.85rem;
  color: var(--color-text-primary);
}

.score-val { color: var(--color-green); text-shadow: 0 0 8px rgba(0,255,65,0.5); }
.miss-val  { color: var(--color-accent); }

.combo-val { color: var(--color-cyan); }
.combo-val.mega {
  color: var(--color-gold);
  text-shadow: 0 0 10px rgba(255,217,61,0.7);
  animation: pulse-combo 0.4s steps(3) infinite;
}

@keyframes pulse-combo {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.hud-timer { }
.hud-timer.danger .hud-val {
  color: var(--color-accent);
  animation: blink-cursor 0.5s steps(2) infinite;
}

.hud-quit {
  margin-left: auto;
  background: none;
  border: 2px solid var(--pixel-border);
  color: var(--color-text-muted);
  font-family: 'Press Start 2P', monospace;
  font-size: 0.55rem;
  padding: 6px 10px;
  cursor: none;
  transition: all 0.1s steps(2);
}

.hud-quit:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* 游戏区域 */
.arena {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: rgba(0,0,0,0.55);
}

/* 准星 */
.crosshair {
  position: absolute;
  width: 28px;
  height: 28px;
  pointer-events: none;
  z-index: 20;
}

.crosshair::before,
.crosshair::after {
  content: '';
  position: absolute;
  background: var(--color-green);
  box-shadow: 0 0 6px var(--color-green);
}

/* 十字线横 */
.crosshair::before {
  width: 100%;
  height: 2px;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  /* 中间留空 */
  background: linear-gradient(to right,
    var(--color-green) 30%, transparent 30%,
    transparent 70%, var(--color-green) 70%);
}

/* 十字线竖 */
.crosshair::after {
  width: 2px;
  height: 100%;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  background: linear-gradient(to bottom,
    var(--color-green) 30%, transparent 30%,
    transparent 70%, var(--color-green) 70%);
}

/* ——— 目标 ——— */
.target {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: none;
  transition: box-shadow 0.05s;
}

.target-inner {
  width: 60%;
  height: 60%;
  border-radius: 0;
}

/* 目标颜色 */
.target-green {
  border: 3px solid var(--color-green);
  box-shadow: 0 0 10px rgba(0,255,65,0.4), inset 0 0 8px rgba(0,255,65,0.1);
  animation: target-pulse-g 1s steps(4) infinite;
}
.target-green .target-inner { background: rgba(0,255,65,0.25); }

.target-cyan {
  border: 3px solid var(--color-cyan);
  box-shadow: 0 0 10px rgba(0,212,255,0.4), inset 0 0 8px rgba(0,212,255,0.1);
  animation: target-pulse-c 1s steps(4) infinite;
}
.target-cyan .target-inner { background: rgba(0,212,255,0.25); }

.target-pink {
  border: 3px solid var(--color-accent);
  box-shadow: 0 0 12px rgba(255,107,157,0.5), inset 0 0 8px rgba(255,107,157,0.15);
  animation: target-pulse-p 0.6s steps(3) infinite;
}
.target-pink .target-inner { background: rgba(255,107,157,0.3); }

.target-gold {
  border: 3px solid var(--color-gold);
  box-shadow: 0 0 10px rgba(255,217,61,0.4), inset 0 0 8px rgba(255,217,61,0.1);
  animation: target-pulse-y 0.8s steps(3) infinite;
}
.target-gold .target-inner { background: rgba(255,217,61,0.25); }

/* 血量条 */
.target-hp {
  position: absolute;
  bottom: -6px;
  left: 0;
  height: 3px;
  background: var(--color-green);
  transition: width 0.1s;
}

@keyframes target-pulse-g {
  0%, 100% { box-shadow: 0 0 10px rgba(0,255,65,0.4); }
  50%       { box-shadow: 0 0 20px rgba(0,255,65,0.8), inset 0 0 12px rgba(0,255,65,0.3); }
}
@keyframes target-pulse-c {
  0%, 100% { box-shadow: 0 0 10px rgba(0,212,255,0.4); }
  50%       { box-shadow: 0 0 20px rgba(0,212,255,0.8); }
}
@keyframes target-pulse-p {
  0%, 100% { box-shadow: 0 0 12px rgba(255,107,157,0.5); }
  50%       { box-shadow: 0 0 24px rgba(255,107,157,0.9); }
}
@keyframes target-pulse-y {
  0%, 100% { box-shadow: 0 0 10px rgba(255,217,61,0.4); }
  50%       { box-shadow: 0 0 20px rgba(255,217,61,0.8); }
}

/* 浮动伤害 */
.float-dmg {
  position: absolute;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  color: var(--color-accent);
  pointer-events: none;
  z-index: 30;
  text-shadow: 1px 1px 0 #000;
  animation: dmg-rise 0.7s steps(7) forwards;
  transform: translateX(-50%);
}

.float-dmg.crit {
  color: var(--color-gold);
  font-size: 0.8rem;
  text-shadow: 2px 2px 0 #000, 0 0 10px var(--color-gold);
}

@keyframes dmg-rise {
  0%   { transform: translateX(-50%) translateY(0)   scale(1.3); opacity: 1; }
  100% { transform: translateX(-50%) translateY(-55px) scale(0.7); opacity: 0; }
}

/* Combo Alert */
.combo-alert {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.4rem;
  color: var(--color-gold);
  text-shadow: 3px 3px 0 #000, 0 0 20px var(--color-gold);
  pointer-events: none;
  z-index: 40;
  animation: alert-pop 0.9s steps(6) forwards;
  white-space: nowrap;
}

@keyframes alert-pop {
  0%   { transform: translateX(-50%) scale(1.6); opacity: 1; }
  70%  { transform: translateX(-50%) scale(1);   opacity: 1; }
  100% { transform: translateX(-50%) scale(0.8); opacity: 0; }
}

/* ——— 结算画面 ——— */
.result-screen {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.result-box {
  width: 100%;
  max-width: 480px;
  padding: 40px 36px;
  text-align: center;
}

.result-title { margin-bottom: 12px; }

.rank {
  font-size: 1.8rem;
  text-shadow: 4px 4px 0 #000;
  display: inline-block;
}
.rank.s { color: var(--color-gold);   text-shadow: 4px 4px 0 #000, 0 0 20px var(--color-gold);  }
.rank.a { color: var(--color-cyan);   text-shadow: 4px 4px 0 #000, 0 0 16px var(--color-cyan);  }
.rank.b { color: var(--color-green);  text-shadow: 4px 4px 0 #000, 0 0 12px var(--color-green); }
.rank.c { color: var(--color-text-muted); }

.result-score {
  font-size: 3rem;
  color: var(--color-green);
  text-shadow: 4px 4px 0 #004400, 0 0 24px rgba(0,255,65,0.5);
  margin-bottom: 4px;
}
.result-score-label {
  font-size: 0.55rem;
  color: var(--color-text-muted);
  margin-bottom: 28px;
}

.result-stats {
  border: 3px solid var(--pixel-border);
  margin-bottom: 28px;
  text-align: left;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px dashed var(--pixel-border);
  font-size: 0.6rem;
}
.stat-row:last-child { border-bottom: none; }

.stat-k { color: var(--color-text-secondary); }
.stat-v { font-size: 0.75rem; }
.stat-v.green  { color: var(--color-green); }
.stat-v.red    { color: var(--color-accent); }
.stat-v.cyan   { color: var(--color-cyan); }
.stat-v.yellow { color: var(--color-gold); }

.result-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 16px;
}

.new-best {
  font-size: 0.6rem;
  color: var(--color-gold);
  text-shadow: 0 0 8px var(--color-gold);
}

.blink-cursor {
  animation: blink-cursor 1s steps(2) infinite;
}

@media (max-width: 640px) {
  .mode-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .hud-item { min-width: 60px; padding: 0 10px; }
  .result-score { font-size: 2rem; }
}
</style>
