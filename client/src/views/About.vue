<template>
  <div class="about-page">
    <!-- 角色头像区域 -->
    <div class="about-hero">
      <div class="about-avatar-wrapper">
        <div class="about-avatar">
          <span class="avatar-emoji">👨‍💻</span>
        </div>
        <div class="avatar-frame"></div>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="about-content container">
      <!-- 角色信息 -->
      <section class="about-section glass-card">
        <h1 class="about-name">&gt; PLAYER: 小王</h1>
        <p class="about-tagline">CLASS: 全栈开发者 | LV.99</p>
        <div class="divider"></div>
        <p class="about-bio">
          &gt; 你好！我是小王，一名正在成长中的全栈开发者。喜欢探索新技术，享受用代码解决问题的过程。
        </p>
        <p class="about-bio">
          &gt; 这个博客是我的冒险日志，记录学习笔记、技术分享和生活感悟。像素风设计致敬那些经典的游戏记忆。
        </p>
      </section>

      <!-- 技能栈 -->
      <section class="about-section glass-card">
        <h2 class="section-h2">== SKILL TREE ==</h2>
        <div class="skills-grid">
          <div v-for="skill in skills" :key="skill.name" class="skill-item">
            <span class="skill-icon">{{ skill.icon }}</span>
            <span class="skill-name">{{ skill.name }}</span>
            <div class="skill-bar">
              <div class="skill-fill" :style="{ width: skill.level + '%' }"></div>
            </div>
            <span class="skill-level">{{ skill.level }}</span>
          </div>
        </div>
      </section>

      <!-- 兴趣爱好 -->
      <section class="about-section glass-card">
        <h2 class="section-h2">== INVENTORY ==</h2>
        <div class="hobbies">
          <div v-for="h in hobbies" :key="h.name" class="hobby-card">
            <span class="hobby-icon">{{ h.icon }}</span>
            <span class="hobby-name">{{ h.name }}</span>
          </div>
        </div>
      </section>

      <!-- 联系方式 -->
      <section class="about-section glass-card contact-section">
        <h2 class="section-h2">== CONTACT ==</h2>
        <p class="contact-desc">&gt; 有任何问题或合作想法，欢迎联系！</p>
        <div class="contact-links">
          <a href="https://github.com/1308334672" target="_blank" class="contact-link">
            <span>🐙</span> GitHub
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const skills = [
  { icon: '⚔️', name: 'Vue 3', level: 80 },
  { icon: '🛡️', name: 'JavaScript', level: 75 },
  { icon: '🔮', name: 'Node.js', level: 65 },
  { icon: '🏹', name: 'CSS', level: 70 },
  { icon: '🗡️', name: 'Python', level: 55 },
  { icon: '📜', name: 'Git', level: 72 }
]

const hobbies = [
  { icon: '🎬', name: '动漫' },
  { icon: '🎵', name: '音乐' },
  { icon: '📚', name: '阅读' },
  { icon: '💻', name: '编程' },
  { icon: '🎮', name: '游戏' },
  { icon: '☕', name: '咖啡' }
]
</script>

<style scoped>
.about-page {
  min-height: 80vh;
  padding-bottom: 80px;
}

/* Hero 区域 */
.about-hero {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 50px 0 30px;
}

.about-avatar-wrapper {
  position: relative;
}

.about-avatar {
  width: 100px;
  height: 100px;
  background: var(--color-bg-dark);
  border: 4px solid var(--color-green);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.2), 6px 6px 0px #006600;
}

.avatar-frame {
  position: absolute;
  inset: -10px;
  border: 3px dashed var(--color-cyan);
  opacity: 0.5;
  animation: blink-cursor 2s steps(2) infinite;
}

/* 主内容 */
.about-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 24px;
  max-width: 700px;
  margin: 0 auto;
}

.about-section {
  padding: 28px 32px;
}

.about-name {
  font-size: 1.3rem;
  text-align: center;
  margin-bottom: 8px;
  color: var(--color-green);
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.about-tagline {
  text-align: center;
  color: var(--color-cyan);
  font-size: 0.6rem;
  margin-bottom: 20px;
}

.about-bio {
  color: var(--color-text-secondary);
  line-height: 2.4;
  margin-bottom: 10px;
  font-size: 0.65rem;
  font-family: 'Courier New', monospace;
}

.section-h2 {
  font-size: 0.85rem;
  margin-bottom: 20px;
  color: var(--color-green);
  text-shadow: 0 0 6px rgba(0, 255, 65, 0.3);
}

/* 技能栈 */
.skills-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-item {
  display: grid;
  grid-template-columns: 28px 100px 1fr 30px;
  align-items: center;
  gap: 10px;
}

.skill-icon {
  font-size: 1rem;
}

.skill-name {
  font-size: 0.6rem;
  color: var(--color-text-secondary);
}

.skill-bar {
  height: 10px;
  background: var(--color-bg-deep);
  border: 2px solid var(--pixel-border);
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  background: var(--color-green);
  box-shadow: inset 0 -2px 0 #006600;
  transition: width 1s steps(20);
}

.skill-level {
  font-size: 0.55rem;
  color: var(--color-yellow);
  text-align: right;
}

/* 兴趣爱好 - 物品栏风格 */
.hobbies {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.hobby-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--color-bg-deep);
  border: 2px solid var(--pixel-border);
  font-size: 0.6rem;
  color: var(--color-text-secondary);
  transition: all 0.1s steps(2);
}

.hobby-card:hover {
  border-color: var(--color-cyan);
  color: var(--color-cyan);
  box-shadow: 4px 4px 0px rgba(0, 212, 255, 0.2);
  transform: translate(-2px, -2px);
}

.hobby-icon {
  font-size: 1.1rem;
}

/* 联系方式 */
.contact-desc {
  color: var(--color-text-secondary);
  margin-bottom: 16px;
  font-size: 0.6rem;
  font-family: 'Courier New', monospace;
}

.contact-links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--color-bg-deep);
  border: 2px solid var(--pixel-border);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.1s steps(2);
  font-size: 0.6rem;
}

.contact-link:hover {
  border-color: var(--color-cyan);
  color: var(--color-cyan);
  box-shadow: 4px 4px 0px rgba(0, 212, 255, 0.2);
  transform: translate(-2px, -2px);
}

@media (max-width: 640px) {
  .about-section {
    padding: 20px 16px;
  }

  .skill-item {
    grid-template-columns: 28px 80px 1fr 28px;
  }

  .hobbies {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
