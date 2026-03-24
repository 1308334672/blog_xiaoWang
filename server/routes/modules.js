import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { readModules, writeModules } from '../models/moduleModel.js'

const router = express.Router()

/**
 * GET /api/modules
 * 获取所有模块，按 order 排序
 */
router.get('/', (req, res) => {
  try {
    const modules = readModules()
    modules.sort((a, b) => a.order - b.order)
    res.json(modules)
  } catch (err) {
    res.status(500).json({ error: '获取模块列表失败', message: err.message })
  }
})

/**
 * POST /api/modules
 * 创建模块
 */
router.post('/', (req, res) => {
  try {
    const { name, slug, description = '', icon = '📁', order } = req.body
    if (!name || !slug) {
      return res.status(400).json({ error: '模块名称和标识符不能为空' })
    }
    const modules = readModules()
    if (modules.find(m => m.slug === slug)) {
      return res.status(400).json({ error: '标识符已存在' })
    }
    const newModule = {
      id: uuidv4(),
      name,
      slug,
      description,
      icon,
      order: order !== undefined ? order : modules.length + 1,
      createdAt: new Date().toISOString()
    }
    modules.push(newModule)
    writeModules(modules)
    res.status(201).json({ message: '模块创建成功', module: newModule })
  } catch (err) {
    res.status(500).json({ error: '创建模块失败', message: err.message })
  }
})

/**
 * PUT /api/modules/:id
 * 更新模块
 */
router.put('/:id', (req, res) => {
  try {
    const modules = readModules()
    const index = modules.findIndex(m => m.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ error: '模块不存在' })
    }
    const { name, slug, description, icon, order } = req.body
    // 检查 slug 唯一性（排除自身）
    if (slug && modules.find(m => m.slug === slug && m.id !== req.params.id)) {
      return res.status(400).json({ error: '标识符已存在' })
    }
    const updated = {
      ...modules[index],
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(description !== undefined && { description }),
      ...(icon !== undefined && { icon }),
      ...(order !== undefined && { order })
    }
    modules[index] = updated
    writeModules(modules)
    res.json({ message: '模块更新成功', module: updated })
  } catch (err) {
    res.status(500).json({ error: '更新模块失败', message: err.message })
  }
})

/**
 * DELETE /api/modules/:id
 * 删除模块
 */
router.delete('/:id', (req, res) => {
  try {
    const modules = readModules()
    const index = modules.findIndex(m => m.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ error: '模块不存在' })
    }
    modules.splice(index, 1)
    writeModules(modules)
    res.json({ message: '模块删除成功' })
  } catch (err) {
    res.status(500).json({ error: '删除模块失败', message: err.message })
  }
})

export default router
