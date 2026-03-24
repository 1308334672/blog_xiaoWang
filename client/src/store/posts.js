import { defineStore } from 'pinia'
import { ref } from 'vue'
import { postsApi } from '../api/posts.js'

// 博客文章状态管理
export const usePostsStore = defineStore('posts', () => {
  // 状态
  const posts = ref([])
  const currentPost = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const total = ref(0)
  const totalPages = ref(1)
  const currentPage = ref(1)

  // 获取文章列表
  async function fetchPosts(params = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await postsApi.getAll(params)
      posts.value = data.posts
      total.value = data.total
      totalPages.value = data.totalPages
      currentPage.value = data.page
    } catch (err) {
      error.value = err.message || '获取文章失败'
    } finally {
      loading.value = false
    }
  }

  // 获取单篇文章
  async function fetchPost(id) {
    loading.value = true
    error.value = null
    try {
      const data = await postsApi.getById(id)
      currentPost.value = data
    } catch (err) {
      error.value = err.message || '获取文章失败'
    } finally {
      loading.value = false
    }
  }

  // 创建文章
  async function createPost(postData) {
    try {
      const data = await postsApi.create(postData)
      return data
    } catch (err) {
      throw new Error(err.message || '创建文章失败')
    }
  }

  // 更新文章
  async function updatePost(id, postData) {
    try {
      const data = await postsApi.update(id, postData)
      return data
    } catch (err) {
      throw new Error(err.message || '更新文章失败')
    }
  }

  // 删除文章
  async function deletePost(id) {
    try {
      await postsApi.remove(id)
      posts.value = posts.value.filter(p => p.id !== id)
    } catch (err) {
      throw new Error(err.message || '删除文章失败')
    }
  }

  return {
    posts,
    currentPost,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost
  }
})
