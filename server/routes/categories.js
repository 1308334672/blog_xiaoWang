import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { readCategories, writeCategories } from '../models/categoryModel.js'

const router = express.Router()

/**
 * GET /api/categories
 * 获取所有分类，支持按 moduleId 筛选
 */
router.get('/', (req, res) => {
  try {
    let categories = readCategories()
    const { moduleId } = req.query
    if (moduleId) {
      categories = categories.filter(c => c.moduleId === moduleId)
    }
    res.json(categories)
  } catch (err) {
    res.status(500).json({ error: '获取分类列表失败', message: err.message })
  }
})

/**
 * POST /api/categories
 * 创建分类
 */
router.post('/', (req, res) => {
  try {
    const { name, slug, moduleId = '' } = req.body
    if (!name || !slug) {
      return res.status(400).json({ error: '分类名称和标识符不能为空' })
    }
    const categories = readCategories()
    if (categories.find(c => c.slug === slug)) {
      return res.status(400).json({ error: '标识符已存在' })
    }
    const newCategory = {
      id: uuidv4(),
      name,
      slug,
      moduleId,
      createdAt: new Date().toISOString()
    }
    categories.push(newCategory)
    writeCategories(categories)
    res.status(201).json({ message: '分类创建成功', category: newCategory })
  } catch (err) {
    res.status(500).json({ error: '创建分类失败', message: err.message })
  }
})

/**
 * PUT /api/categories/:id
 * 更新分类
 */
router.put('/:id', (req, res) => {
  try {
    const categories = readCategories()
    const index = categories.findIndex(c => c.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ error: '分类不存在' })
    }
    const { name, slug, moduleId } = req.body
    if (slug && categories.find(c => c.slug === slug && c.id !== req.params.id)) {
      return res.status(400).json({ error: '标识符已存在' })
    }
    const updated = {
      ...categories[index],
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(moduleId !== undefined && { moduleId })
    }
    categories[index] = updated
    writeCategories(categories)
    res.json({ message: '分类更新成功', category: updated })
  } catch (err) {
    res.status(500).json({ error: '更新分类失败', message: err.message })
  }
})

/**
 * DELETE /api/categories/:id
 * 删除分类
 */
router.delete('/:id', (req, res) => {
  try {
    const categories = readCategories()
    const index = categories.findIndex(c => c.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ error: '分类不存在' })
    }
    categories.splice(index, 1)
    writeCategories(categories)
    res.json({ message: '分类删除成功' })
  } catch (err) {
    res.status(500).json({ error: '删除分类失败', message: err.message })
  }
})

export default router
