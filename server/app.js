import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import postsRouter from './routes/posts.js'
import authRouter from './routes/auth.js'
import categoriesRouter from './routes/categories.js'

const app = express()
const PORT = process.env.PORT || 3001
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
]
// 开发服务器 IP：允许该 IP 下的所有端口（Vite 自动漂移端口时同样生效）
const TRUSTED_HOSTS = (process.env.TRUSTED_HOSTS || 'http://47.103.138.24')
  .split(',')
  .map(h => h.trim())
  .filter(Boolean)
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)
const allowAllOrigins = allowedOrigins.includes('*')
const corsOrigins = allowAllOrigins
  ? '*'
  : [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...allowedOrigins])]

// 中间件配置
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowAllOrigins) {
      callback(null, true)
      return
    }
    if (corsOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    // 允许受信任 IP（含标准端口80/443直接访问，及任意非标准端口）
    if (TRUSTED_HOSTS.some(host => origin === host || origin.startsWith(host + ':'))) {
      callback(null, true)
      return
    }
    callback(new Error(`CORS 不允许的来源: ${origin}`))
  },
  credentials: true
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// API 路由
app.use('/api/posts', postsRouter)
app.use('/api/auth', authRouter)
app.use('/api/categories', categoriesRouter)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '博客服务器运行正常 ✨' })
})

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack)
  res.status(500).json({ error: '服务器内部错误', message: err.message })
})

app.listen(PORT, () => {
  console.log(`✨ 博客服务器已启动: http://localhost:${PORT}`)
  console.log(`🌍 已允许的前端来源: ${allowAllOrigins ? '全部' : corsOrigins.join(', ')}`)
})

export default app
