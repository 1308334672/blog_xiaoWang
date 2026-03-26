import pool from '../db/index.js'

/** 将数据库行转换为接口统一的 camelCase 格式 */
function normalize(row) {
  if (!row) return null
  return {
    id:        row.id,
    title:     row.title,
    summary:   row.summary,
    content:   row.content,
    category:  row.category,
    tags:      typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at
  }
}

/**
 * 分页查询文章列表（不含 content，节省流量）
 */
export async function readPostsPaged({ search = '', category = '', page = 1, limit = 10 } = {}) {
  let sql = `SELECT id, title, summary, category, tags, created_at, updated_at
             FROM posts WHERE 1=1`
  const params = []

  if (search) {
    sql += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)'
    const kw = `%${search}%`
    params.push(kw, kw, kw)
  }
  if (category) {
    sql += ' AND category = ?'
    params.push(category)
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit))

  const [rows] = await pool.query(sql, params)
  return rows.map(normalize)
}

/**
 * 统计符合条件的文章总数
 */
export async function countPosts({ search = '', category = '' } = {}) {
  let sql = 'SELECT COUNT(*) AS total FROM posts WHERE 1=1'
  const params = []

  if (search) {
    sql += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)'
    const kw = `%${search}%`
    params.push(kw, kw, kw)
  }
  if (category) {
    sql += ' AND category = ?'
    params.push(category)
  }

  const [[{ total }]] = await pool.query(sql, params)
  return total
}

/**
 * 根据 ID 查询单篇文章（含完整 content）
 */
export async function findPostById(id) {
  const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id])
  return normalize(rows[0])
}

/**
 * 新增文章
 */
export async function createPost({ id, title, summary, content, category, tags, createdAt, updatedAt }) {
  await pool.query(
    `INSERT INTO posts (id, title, summary, content, category, tags, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, title, summary, content, category, JSON.stringify(tags), createdAt, updatedAt]
  )
}

/**
 * 更新文章字段（只更新传入的字段）
 */
export async function updatePost(id, fields) {
  const colMap = {
    title:    'title',
    content:  'content',
    summary:  'summary',
    category: 'category',
    tags:     'tags'
  }

  const sets   = []
  const values = []

  for (const [k, v] of Object.entries(fields)) {
    if (!colMap[k]) continue
    sets.push(`${colMap[k]} = ?`)
    values.push(k === 'tags' ? JSON.stringify(v) : v)
  }

  if (sets.length === 0) return findPostById(id)

  sets.push('updated_at = ?')
  values.push(new Date())
  values.push(id)

  await pool.query(`UPDATE posts SET ${sets.join(', ')} WHERE id = ?`, values)
  return findPostById(id)
}

/**
 * 删除文章
 */
export async function deletePost(id) {
  await pool.query('DELETE FROM posts WHERE id = ?', [id])
}
