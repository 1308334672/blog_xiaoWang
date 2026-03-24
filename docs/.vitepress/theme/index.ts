// 小王の二次元主题
import DefaultTheme from 'vitepress/theme'
import { h, onMounted } from 'vue'
import './custom.css'

/** 樱花飘落特效 */
function initSakura() {
  if (typeof window === 'undefined') return

  const container = document.createElement('div')
  container.id = 'sakura-container'
  document.body.appendChild(container)

  const petals = ['🌸', '🌺', '✿', '❀', '🌷']
  const maxPetals = 12

  function createPetal() {
    if (container.children.length >= maxPetals) return

    const petal = document.createElement('span')
    petal.className = 'sakura-petal'
    petal.textContent = petals[Math.floor(Math.random() * petals.length)]
    petal.style.left = Math.random() * 100 + 'vw'
    petal.style.fontSize = (Math.random() * 10 + 10) + 'px'
    petal.style.opacity = (Math.random() * 0.5 + 0.4).toString()

    const duration = Math.random() * 8 + 6
    petal.style.animationDuration = duration + 's'
    petal.style.animationDelay = Math.random() * 3 + 's'

    container.appendChild(petal)

    // Remove petal after animation ends
    setTimeout(() => {
      if (petal.parentNode === container) {
        container.removeChild(petal)
      }
    }, (duration + 3) * 1000)
  }

  // Spawn petals periodically
  const intervalId = setInterval(createPetal, 2000)
  // Initial batch
  for (let i = 0; i < 5; i++) {
    setTimeout(createPetal, i * 800)
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId)
  })
}

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // Slots for layout customization can be added here
    })
  },
  enhanceApp({ app, router }) {
    // Add router hook for page transitions
    if (typeof window !== 'undefined') {
      router.onAfterRouteChange = () => {
        // Scroll to top on route change
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  },
  setup() {
    onMounted(() => {
      initSakura()
    })
  }
}
