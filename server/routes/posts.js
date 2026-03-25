import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import pool from '../db/index.js'
import {
  readPostsPaged,
  countPosts,
  findPostById,
  createPost,
  updatePost,
  deletePost
} from '../models/postModel.js'

const router = express.Router()

/**
 * GET /api/posts
 * 获取文章列表，支持分页和搜索
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '' } = req.query

    const [posts, total] = await Promise.all([
      readPostsPaged({ search, category, page, limit }),
      countPosts({ search, category })
    ])

    const pageNum  = parseInt(page)
    const limitNum = parseInt(limit)

    res.json({
      posts,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    })
  } catch (err) {
    res.status(500).json({ error: '获取文章列表失败', message: err.message })
  }
})

/**
 * GET /api/posts/categories
 * 获取所有分类及文章数量（必须在 /:id 之前注册）
 */
router.get('/categories', async (req, res) => {
  try {
    const [[catRows], [postRows]] = await Promise.all([
      pool.query('SELECT name FROM categories ORDER BY id ASC'),
      pool.query('SELECT category, title, created_at FROM posts ORDER BY created_at DESC')
    ])

    const catMap = {}
    catRows.forEach(r => {
      catMap[r.name] = { name: r.name, count: 0, latestAt: null, latestTitle: '' }
    })

    postRows.forEach(post => {
      const cat = post.category || '未分类'
      if (!catMap[cat]) catMap[cat] = { name: cat, count: 0, latestAt: null, latestTitle: '' }
      catMap[cat].count++
      if (!catMap[cat].latestAt) {
        catMap[cat].latestAt    = post.created_at instanceof Date ? post.created_at.toISOString() : post.created_at
        catMap[cat].latestTitle = post.title
      }
    })

    const result = Object.values(catMap).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.name.localeCompare(b.name, 'zh-CN')
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: '获取分类失败', message: err.message })
  }
})

/**
 * GET /api/posts/:id
 * 获取单篇文章详情
 */
router.get('/:id', async (req, res) => {
  try {
    const post = await findPostById(req.params.id)
    if (!post) return res.status(404).json({ error: '文章不存在' })
    res.json(post)
  } catch (err) {
    res.status(500).json({ error: '获取文章失败', message: err.message })
  }
})

/**
 * POST /api/posts
 * 创建新文章
 */
router.post('/', async (req, res) => {
  try {
    const { title, content, summary = '', category = '未分类', tags = [] } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' })
    }

    const now     = new Date().toISOString()
    const newPost = {
      id:        uuidv4(),
      title,
      summary:   summary || content.substring(0, 100) + '...',
      content,
      category,
      tags:      Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()),
      createdAt: now,
      updatedAt: now
    }

    await createPost(newPost)
    res.status(201).json({ message: '文章创建成功', post: newPost })
  } catch (err) {
    res.status(500).json({ error: '创建文章失败', message: err.message })
  }
})

/**
 * PUT /api/posts/:id
 * 更新文章
 */
router.put('/:id', async (req, res) => {
  try {
    const existing = await findPostById(req.params.id)
    if (!existing) return res.status(404).json({ error: '文章不存在' })

    const { title, content, summary, category, tags } = req.body
    const fields = {}
    if (title    !== undefined) fields.title    = title
    if (content  !== undefined) fields.content  = content
    if (summary  !== undefined) fields.summary  = summary
    if (category !== undefined) fields.category = category
    if (tags     !== undefined) fields.tags     = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())

    const updated = await updatePost(req.params.id, fields)
    res.json({ message: '文章更新成功', post: updated })
  } catch (err) {
    res.status(500).json({ error: '更新文章失败', message: err.message })
  }
})

/**
 * DELETE /api/posts/:id
 * 删除文章
 */
router.delete('/:id', async (req, res) => {
  try {
    const post = await findPostById(req.params.id)
    if (!post) return res.status(404).json({ error: '文章不存在' })

    await deletePost(req.params.id)
    res.json({ message: '文章删除成功' })
  } catch (err) {
    res.status(500).json({ error: '删除文章失败', message: err.message })
  }
})

export default router



