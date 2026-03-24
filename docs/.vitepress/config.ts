import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '小王の学习记录',
  description: '记录每一天的成长 · 二次元风格博客',
  lang: 'zh-CN',

  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=ZCOOL+XiaoWei&display=swap'
    }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#ff85a2' }],
  ],

  themeConfig: {
    siteTitle: '🌸 小王の记录',
    logo: '/images/logo.svg',

    nav: [
      { text: '🏠 首页', link: '/' },
      { text: '✏️ 前端', link: '/posts/frontend/', activeMatch: '/posts/frontend/' },
      { text: '⚙️ 后端', link: '/posts/backend/', activeMatch: '/posts/backend/' },
      { text: '📖 日记', link: '/posts/diary/', activeMatch: '/posts/diary/' },
      { text: '📦 资源', link: '/posts/resources/', activeMatch: '/posts/resources/' },
      { text: '💡 关于', link: '/about' },
    ],

    sidebar: {
      '/posts/frontend/': [
        {
          text: '✏️ 前端笔记',
          items: [
            { text: '目录', link: '/posts/frontend/' },
            { text: 'HTML & CSS 基础', link: '/posts/frontend/html-css' },
            { text: 'JavaScript 进阶', link: '/posts/frontend/javascript' },
            { text: 'Vue3 学习笔记', link: '/posts/frontend/vue3' },
          ]
        }
      ],
      '/posts/backend/': [
        {
          text: '⚙️ 后端笔记',
          items: [
            { text: '目录', link: '/posts/backend/' },
            { text: 'Java 基础', link: '/posts/backend/java' },
            { text: 'Spring Boot', link: '/posts/backend/springboot' },
          ]
        }
      ],
      '/posts/diary/': [
        {
          text: '📖 日记本',
          items: [
            { text: '目录', link: '/posts/diary/' },
            { text: '2026年03月', link: '/posts/diary/2026-03' },
          ]
        }
      ],
      '/posts/resources/': [
        {
          text: '📦 资源收藏',
          items: [
            { text: '目录', link: '/posts/resources/' },
            { text: '常用工具', link: '/posts/resources/tools' },
            { text: '学习网站', link: '/posts/resources/learning' },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/1308334672' },
    ],

    footer: {
      message: '用热爱构建每一行代码 🌸',
      copyright: 'Copyright © 2026 小王 | Powered by VitePress'
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文章',
                buttonAriaLabel: '搜索文章'
              },
              modal: {
                noResultsText: '没有找到相关文章',
                resetButtonTitle: '清除搜索',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },

    lastUpdated: {
      text: '最后更新于',
    },

    editLink: {
      pattern: 'https://github.com/1308334672/blog_xiaoWang/edit/main/docs/:path',
      text: '✏️ 在 GitHub 上编辑此页'
    },

    docFooter: {
      prev: '⬅️ 上一篇',
      next: '下一篇 ➡️'
    },

    outline: {
      label: '目录',
      level: [2, 3]
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },

  markdown: {
    lineNumbers: true,
    image: {
      lazyLoading: true
    }
  }
})
