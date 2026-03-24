<template>
  <div class="about-page">
    <!-- 背景装饰 -->
    <div class="about-hero">
      <div class="hero-glow"></div>
      <div class="about-avatar-wrapper">
        <div class="about-avatar">
          <span class="avatar-emoji">👨‍💻</span>
        </div>
        <div class="avatar-ring"></div>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="about-content container">
      <!-- 个人简介 -->
      <section class="about-section glass-card">
        <h1 class="about-name gradient-text">小王</h1>
        <p class="about-tagline">✨ 一个热爱技术与生活的程序员</p>
        <div class="divider"></div>
        <p class="about-bio">
          你好！我是小王，一名正在成长中的全栈开发者。喜欢探索新技术，享受用代码解决问题的过程。
          这个博客是我记录学习笔记、技术分享和生活感悟的地方。
        </p>
        <p class="about-bio">
          新海诚的动漫让我感受到了美的极致，那种细腻的情感与唯美的画面一直是我的灵感来源，
          这也是为什么这个博客选择了新海诚风格的设计。
        </p>
      </section>

      <!-- 技能栈 -->
      <section class="about-section glass-card">
        <h2 class="section-h2">🛠 技能栈</h2>
        <div class="skills-grid">
          <div v-for="skill in skills" :key="skill.name" class="skill-item">
            <span class="skill-icon">{{ skill.icon }}</span>
            <span class="skill-name">{{ skill.name }}</span>
            <div class="skill-bar">
              <div class="skill-fill" :style="{ width: skill.level + '%' }"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 兴趣爱好 -->
      <section class="about-section glass-card">
        <h2 class="section-h2">💫 兴趣爱好</h2>
        <div class="hobbies">
          <div v-for="h in hobbies" :key="h.name" class="hobby-card">
            <span class="hobby-icon">{{ h.icon }}</span>
            <span class="hobby-name">{{ h.name }}</span>
          </div>
        </div>
      </section>

      <!-- 联系方式 -->
      <section class="about-section glass-card contact-section">
        <h2 class="section-h2">📮 联系方式</h2>
        <p class="contact-desc">如果你有任何问题或合作想法，欢迎联系我！</p>
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
// 技能数据
const skills = [
  { icon: '🟢', name: 'Vue 3', level: 80 },
  { icon: '🟡', name: 'JavaScript', level: 75 },
  { icon: '🔵', name: 'Node.js', level: 65 },
  { icon: '🟠', name: 'CSS / Tailwind', level: 70 },
  { icon: '🔴', name: 'Python', level: 55 },
  { icon: '⚫', name: 'Git', level: 72 }
]

// 兴趣爱好
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
  padding: 60px 0 40px;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%,
    rgba(241, 196, 15, 0.08) 0%,
    transparent 70%
  );
}

.about-avatar-wrapper {
  position: relative;
}

.about-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-bg-light), var(--color-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  position: relative;
  z-index: 1;
  animation: float 4s ease-in-out infinite;
}

.avatar-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid rgba(241, 196, 15, 0.3);
  animation: spin-slow 8s linear infinite;
}

@keyframes spin-slow {
  to { transform: rotate(360deg); }
}

/* 主内容 */
.about-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 0 24px;
  max-width: 700px;
  margin: 0 auto;
}

.about-section {
  padding: 36px 40px;
}

.about-name {
  font-size: 2.4rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 10px;
}

.about-tagline {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 1.05rem;
  margin-bottom: 24px;
}

.about-bio {
  color: var(--color-text-secondary);
  line-height: 1.9;
  margin-bottom: 12px;
}

.section-h2 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--color-text-primary);
}

/* 技能栈 */
.skills-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.skill-item {
  display: grid;
  grid-template-columns: 28px 120px 1fr;
  align-items: center;
  gap: 12px;
}

.skill-icon {
  font-size: 1.1rem;
}

.skill-name {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.skill-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-bg-light), var(--color-accent));
  border-radius: 9999px;
  transition: width 1s ease;
}

/* 兴趣爱好 */
.hobbies {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hobby-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  transition: all 0.3s;
}

.hobby-card:hover {
  background: rgba(241, 196, 15, 0.1);
  border-color: rgba(241, 196, 15, 0.3);
  color: var(--color-gold);
  transform: translateY(-2px);
}

/* 联系方式 */
.contact-desc {
  color: var(--color-text-secondary);
  margin-bottom: 20px;
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
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.contact-link:hover {
  background: rgba(241, 196, 15, 0.1);
  border-color: rgba(241, 196, 15, 0.3);
  color: var(--color-gold);
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .about-section {
    padding: 24px 20px;
  }

  .skill-item {
    grid-template-columns: 28px 90px 1fr;
  }
}
</style>
