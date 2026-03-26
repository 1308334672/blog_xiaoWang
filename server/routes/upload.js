import express from 'express'
import multer from 'multer'
import { mkdirSync } from 'fs'
import { extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = join(__dirname, '../public/uploads')

// 启动时确保上传目录存在
mkdirSync(UPLOAD_DIR, { recursive: true })

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
])

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR)
  },
  filename(req, file, cb) {
    // 用时间戳 + 随机数避免文件名冲突，防止路径穿越
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext    = extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '')
    cb(null, unique + (ext || '.bin'))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },   // 5 MB
  fileFilter(req, file, cb) {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('仅支持 JPG / PNG / GIF / WebP / SVG 图片'))
    }
  }
})

const router = express.Router()

/**
 * POST /api/upload
 * 上传单张图片，返回可访问的 URL
 */
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '未收到文件' })
  // 生产环境返回绝对 URL，开发环境返回相对路径（由 Vite 代理转发）
  const host = process.env.STATIC_HOST || ''
  res.json({ url: `${host}/uploads/${req.file.filename}` })
})

// multer 错误统一处理
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: '图片大小不能超过 5 MB' })
  }
  res.status(400).json({ error: err.message })
})

export default router
