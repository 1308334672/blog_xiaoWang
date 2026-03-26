import express from 'express'
import multer from 'multer'
import sharp from 'sharp'
import { mkdirSync, unlinkSync } from 'fs'
import { extname, join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = join(__dirname, '../public/uploads')

// 启动时确保上传目录存在
mkdirSync(UPLOAD_DIR, { recursive: true })

const MAX_WIDTH = 1200  // 图片最大宽度（px）

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
])

// multer 先存到临时文件，后续用 sharp 处理
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR)
  },
  filename(req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext    = extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '')
    cb(null, `tmp_${unique}${ext || '.bin'}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },  // 允许上传最大 20MB 原图，压缩后再存
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
 * 上传单张图片，自动压缩到最大宽度 1200px 后保存，返回可访问的 URL
 */
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: '未收到文件' })

  const tmpPath  = req.file.path
  const unique   = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
  const outName  = `${unique}.webp`
  const outPath  = join(UPLOAD_DIR, outName)

  try {
    // SVG 不做压缩处理，直接重命名即可
    if (req.file.mimetype === 'image/svg+xml') {
      const { renameSync } = await import('fs')
      const svgName = `${unique}.svg`
      renameSync(tmpPath, join(UPLOAD_DIR, svgName))
      const host = process.env.STATIC_HOST || ''
      return res.json({ url: `${host}/uploads/${svgName}` })
    }

    // 获取原始尺寸，只有超过 MAX_WIDTH 才缩放
    const meta = await sharp(tmpPath).metadata()
    let pipeline = sharp(tmpPath)
    if (meta.width && meta.width > MAX_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true })
    }
    await pipeline.webp({ quality: 85 }).toFile(outPath)

    // 删除临时原图
    unlinkSync(tmpPath)

    const host = process.env.STATIC_HOST || ''
    res.json({ url: `${host}/uploads/${outName}` })
  } catch (err) {
    // 压缩失败时清理残留文件
    try { unlinkSync(tmpPath) } catch (_) {}
    try { unlinkSync(outPath) } catch (_) {}
    console.error('[upload] sharp 处理失败:', err)
    res.status(500).json({ error: '图片处理失败，请重试' })
  }
})

// multer 错误统一处理
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: '图片大小不能超过 5 MB' })
  }
  res.status(400).json({ error: err.message })
})

export default router
