import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

export const modulesApi = {
  getAll() {
    return http.get('/modules').then(r => r.data)
  },
  create(data) {
    return http.post('/modules', data).then(r => r.data)
  },
  update(id, data) {
    return http.put(`/modules/${id}`, data).then(r => r.data)
  },
  remove(id) {
    return http.delete(`/modules/${id}`).then(r => r.data)
  }
}
