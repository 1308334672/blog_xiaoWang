import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

export const categoriesApi = {
  getAll(params = {}) {
    return http.get('/categories', { params }).then(r => r.data)
  },
  create(data) {
    return http.post('/categories', data).then(r => r.data)
  },
  update(id, data) {
    return http.put(`/categories/${id}`, data).then(r => r.data)
  },
  remove(id) {
    return http.delete(`/categories/${id}`).then(r => r.data)
  }
}
