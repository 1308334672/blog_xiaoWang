import { defineStore } from 'pinia'
import { ref } from 'vue'
import { categoriesApi } from '../api/categories.js'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchCategories(params = {}) {
    loading.value = true
    error.value = null
    try {
      categories.value = await categoriesApi.getAll(params)
    } catch (err) {
      error.value = err.message || '获取分类失败'
    } finally {
      loading.value = false
    }
  }

  async function createCategory(data) {
    const result = await categoriesApi.create(data)
    await fetchCategories()
    return result
  }

  async function updateCategory(id, data) {
    const result = await categoriesApi.update(id, data)
    await fetchCategories()
    return result
  }

  async function deleteCategory(id) {
    await categoriesApi.remove(id)
    categories.value = categories.value.filter(c => c.id !== id)
  }

  return { categories, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory }
})
