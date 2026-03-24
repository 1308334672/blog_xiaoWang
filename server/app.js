import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import postsRouter from './routes/posts.js'
import authRouter from './routes/auth.js'
import modulesRouter from './routes/modules.js'
import categoriesRouter from './routes/categories.js'

const app = express()
const PORT = process.env.PORT || 3001

// CORS origins: 从环境变量读取（逗号分隔），默认支持本地开发端口
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:4173']

// 中间件配置
app.use(cors({
  origin: corsOrigins,
  credentials: true
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// API 路由
app.use('/api/posts', postsRouter)
app.use('/api/auth', authRouter)
app.use('/api/modules', modulesRouter)
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
})

export default app
