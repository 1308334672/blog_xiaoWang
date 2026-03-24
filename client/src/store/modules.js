import { defineStore } from 'pinia'
import { ref } from 'vue'
import { modulesApi } from '../api/modules.js'

export const useModulesStore = defineStore('modules', () => {
  const modules = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchModules() {
    loading.value = true
    error.value = null
    try {
      modules.value = await modulesApi.getAll()
    } catch (err) {
      error.value = err.message || '获取模块失败'
    } finally {
      loading.value = false
    }
  }

  async function createModule(data) {
    const result = await modulesApi.create(data)
    await fetchModules()
    return result
  }

  async function updateModule(id, data) {
    const result = await modulesApi.update(id, data)
    await fetchModules()
    return result
  }

  async function deleteModule(id) {
    await modulesApi.remove(id)
    modules.value = modules.value.filter(m => m.id !== id)
  }

  return { modules, loading, error, fetchModules, createModule, updateModule, deleteModule }
})
