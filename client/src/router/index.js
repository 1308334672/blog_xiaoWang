import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Blog from '../views/Blog.vue'
import BlogDetail from '../views/BlogDetail.vue'
import About from '../views/About.vue'
import Admin from '../views/Admin.vue'
import AdminEditor from '../views/AdminEditor.vue'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/blog',
    name: 'Blog',
    component: Blog,
    meta: { title: '博客' }
  },
  {
    path: '/blog/module/:slug',
    name: 'BlogModule',
    component: Blog,
    meta: { title: '模块文章' }
  },
  {
    path: '/blog/:id',
    name: 'BlogDetail',
    component: BlogDetail,
    meta: { title: '文章详情' }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { title: '关于' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { title: '管理后台' }
  },
  {
    path: '/admin/editor',
    name: 'AdminEditorCreate',
    component: AdminEditor,
    meta: { title: '新建文章' }
  },
  {
    path: '/admin/editor/:id',
    name: 'AdminEditorEdit',
    component: AdminEditor,
    meta: { title: '编辑文章' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 页面切换后滚动到顶部
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  }
})

// 更新页面标题
router.afterEach((to) => {
  document.title = `${to.meta.title || '页面'} - 小王の博客 ✨`
})

export default router
