import express from 'express'

const router = express.Router()

// 简单的密码认证（实际项目中应使用 JWT + 加密）
// 默认密码: admin123，可通过环境变量 ADMIN_PASSWORD 修改
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

/**
 * POST /api/auth/login
 * 管理员登录
 */
router.post('/login', (req, res) => {
  const { password } = req.body

  if (!password) {
    return res.status(400).json({ error: '请输入密码' })
  }

  if (password === ADMIN_PASSWORD) {
    // 返回一个简单的 token（实际项目建议使用 JWT）
    const token = Buffer.from(`admin:${Date.now()}`).toString('base64')
    res.json({
      message: '登录成功',
      token,
      admin: true
    })
  } else {
    res.status(401).json({ error: '密码错误' })
  }
})

/**
 * POST /api/auth/verify
 * 验证 token 是否有效（简单实现）
 */
router.post('/verify', (req, res) => {
  const { token } = req.body
  if (token) {
    res.json({ valid: true })
  } else {
    res.status(401).json({ valid: false, error: '未登录' })
  }
})

export default router
