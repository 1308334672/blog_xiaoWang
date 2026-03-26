import axios from 'axios'

// 创建 axios 实例
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 10000
})

// 博客文章 API
export const postsApi = {
  // 获取文章列表（支持分页和搜索）
  getAll(params = {}) {
    return http.get('/posts', { params }).then(r => r.data)
  },

  // 获取所有分类及文章数
  getCategories() {
    return http.get('/posts/categories').then(r => r.data)
  },

  // 获取单篇文章
  getById(id) {
    return http.get(`/posts/${id}`).then(r => r.data)
  },

  // 创建文章
  create(data) {
    return http.post('/posts', data).then(r => r.data)
  },

  // 更新文章
  update(id, data) {
    return http.put(`/posts/${id}`, data).then(r => r.data)
  },

  // 删除文章
  remove(id) {
    return http.delete(`/posts/${id}`).then(r => r.data)
  }
}

// 专栏 API
export const categoriesApi = {
  getAll() {
    return http.get('/categories').then(r => r.data)
  },
  add(name) {
    return http.post('/categories', { name }).then(r => r.data)
  },
  remove(name) {
    return http.delete(`/categories/${encodeURIComponent(name)}`).then(r => r.data)
  }
}

// 图片上传 API
export const uploadApi = {
  image(file) {
    const form = new FormData()
    form.append('image', file)
    return http.post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data)
  }
}
