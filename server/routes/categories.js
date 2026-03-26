import express from 'express'
import pool from '../db/index.js'

const router = express.Router()

/** GET /api/categories — 获取所有专栏名称列表 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT name FROM categories ORDER BY id ASC')
    res.json(rows.map(r => r.name))
  } catch (err) {
    res.status(500).json({ error: '获取分类失败', message: err.message })
  }
})

/** POST /api/categories — 新建专栏 */
router.post('/', async (req, res) => {
  const name = (req.body.name || '').trim()
  if (!name) return res.status(400).json({ error: '专栏名称不能为空' })
  try {
    await pool.query('INSERT IGNORE INTO categories (name) VALUES (?)', [name])
    const [rows] = await pool.query('SELECT name FROM categories ORDER BY id ASC')
    res.json({ name, categories: rows.map(r => r.name) })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: '专栏已存在' })
    }
    res.status(500).json({ error: '创建专栏失败', message: err.message })
  }
})

/** DELETE /api/categories/:name — 删除专栏 */
router.delete('/:name', async (req, res) => {
  const name = req.params.name
  try {
    const [result] = await pool.query('DELETE FROM categories WHERE name = ?', [name])
    if (result.affectedRows === 0) return res.status(404).json({ error: '专栏不存在' })
    const [rows] = await pool.query('SELECT name FROM categories ORDER BY id ASC')
    res.json({ deleted: name, categories: rows.map(r => r.name) })
  } catch (err) {
    res.status(500).json({ error: '删除专栏失败', message: err.message })
  }
})

export default router
