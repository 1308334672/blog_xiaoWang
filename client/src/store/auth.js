import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

// 管理员认证状态管理
export const useAuthStore = defineStore('auth', () => {
  // 从本地存储恢复登录状态
  const isLoggedIn = ref(!!localStorage.getItem('admin_token'))
  const token = ref(localStorage.getItem('admin_token') || '')

  // 登录
  async function login(password) {
    try {
      const { data } = await axios.post('/api/auth/login', { password })
      token.value = data.token
      isLoggedIn.value = true
      localStorage.setItem('admin_token', data.token)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.error || '登录失败'
      return { success: false, error: msg }
    }
  }

  // 退出登录
  function logout() {
    token.value = ''
    isLoggedIn.value = false
    localStorage.removeItem('admin_token')
  }

  return { isLoggedIn, token, login, logout }
})
