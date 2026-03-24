import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { readPosts, writePosts } from '../models/postModel.js'

const router = express.Router()

/**
 * GET /api/posts
 * 获取文章列表，支持分页和搜索
 */
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '' } = req.query
    let posts = readPosts()

    // 按搜索关键词过滤
    if (search) {
      const keyword = search.toLowerCase()
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(keyword) ||
        p.summary?.toLowerCase().includes(keyword) ||
        p.content.toLowerCase().includes(keyword)
      )
    }

    // 按分类过滤
    if (category) {
      posts = posts.filter(p => p.category === category)
    }

    // 按创建时间倒序排列
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // 分页
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const total = posts.length
    const start = (pageNum - 1) * limitNum
    const paginatedPosts = posts.slice(start, start + limitNum)

    // 列表页不返回完整 content，节省流量
    const list = paginatedPosts.map(({ content, ...rest }) => rest)

    res.json({
      posts: list,
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
 * GET /api/posts/:id
 * 获取单篇文章详情
 */
router.get('/:id', (req, res) => {
  try {
    const posts = readPosts()
    const post = posts.find(p => p.id === req.params.id)
    if (!post) {
      return res.status(404).json({ error: '文章不存在' })
    }
    res.json(post)
  } catch (err) {
    res.status(500).json({ error: '获取文章失败', message: err.message })
  }
})

/**
 * POST /api/posts
 * 创建新文章
 */
router.post('/', (req, res) => {
  try {
    const { title, content, summary = '', category = '未分类', tags = [] } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' })
    }

    const posts = readPosts()
    const now = new Date().toISOString()

    const newPost = {
      id: uuidv4(),
      title,
      summary: summary || content.substring(0, 100) + '...',
      content,
      category,
      tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()),
      createdAt: now,
      updatedAt: now
    }

    posts.unshift(newPost)
    writePosts(posts)

    res.status(201).json({ message: '文章创建成功', post: newPost })
  } catch (err) {
    res.status(500).json({ error: '创建文章失败', message: err.message })
  }
})

/**
 * PUT /api/posts/:id
 * 更新文章
 */
router.put('/:id', (req, res) => {
  try {
    const posts = readPosts()
    const index = posts.findIndex(p => p.id === req.params.id)

    if (index === -1) {
      return res.status(404).json({ error: '文章不存在' })
    }

    const { title, content, summary, category, tags } = req.body
    const updated = {
      ...posts[index],
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(summary !== undefined && { summary }),
      ...(category !== undefined && { category }),
      ...(tags !== undefined && {
        tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())
      }),
      updatedAt: new Date().toISOString()
    }

    posts[index] = updated
    writePosts(posts)

    res.json({ message: '文章更新成功', post: updated })
  } catch (err) {
    res.status(500).json({ error: '更新文章失败', message: err.message })
  }
})

/**
 * DELETE /api/posts/:id
 * 删除文章
 */
router.delete('/:id', (req, res) => {
  try {
    const posts = readPosts()
    const index = posts.findIndex(p => p.id === req.params.id)

    if (index === -1) {
      return res.status(404).json({ error: '文章不存在' })
    }

    posts.splice(index, 1)
    writePosts(posts)

    res.json({ message: '文章删除成功' })
  } catch (err) {
    res.status(500).json({ error: '删除文章失败', message: err.message })
  }
})

export default router
