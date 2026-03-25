import express from 'express'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const router = express.Router()
const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(__dirname, '../data/categories.json')
const DEFAULT = ['前端开发', '后端开发', 'CSS技巧', '学习笔记', '生活随记', '未分类']

function readCategories() {
  try {
    if (!existsSync(DATA_FILE)) return [...DEFAULT]
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return [...DEFAULT]
  }
}

function writeCategories(cats) {
  writeFileSync(DATA_FILE, JSON.stringify(cats, null, 2), 'utf-8')
}

/** GET /api/categories — 获取所有专栏 */
router.get('/', (req, res) => {
  res.json(readCategories())
})

/** POST /api/categories — 新建专栏 */
router.post('/', (req, res) => {
  const name = (req.body.name || '').trim()
  if (!name) return res.status(400).json({ error: '专栏名称不能为空' })
  const cats = readCategories()
  if (cats.includes(name)) return res.status(409).json({ error: '专栏已存在' })
  cats.push(name)
  writeCategories(cats)
  res.json({ name, categories: cats })
})

/** DELETE /api/categories/:name — 删除专栏 */
router.delete('/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name)
  const cats = readCategories()
  const idx = cats.indexOf(name)
  if (idx === -1) return res.status(404).json({ error: '专栏不存在' })
  cats.splice(idx, 1)
  writeCategories(cats)
  res.json({ deleted: name, categories: cats })
})

export default router
