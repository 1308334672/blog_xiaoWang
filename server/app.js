import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import postsRouter from './routes/posts.js'
import authRouter from './routes/auth.js'

const app = express()
const PORT = process.env.PORT || 3001

// 中间件配置
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// API 路由
app.use('/api/posts', postsRouter)
app.use('/api/auth', authRouter)

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
