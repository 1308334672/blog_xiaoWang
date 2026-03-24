import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// JSON 文件路径
const DATA_FILE = join(__dirname, '../data/posts.json')

/**
 * 读取所有文章
 */
export function readPosts() {
  try {
    const data = readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    console.error('读取文章数据失败:', err.message)
    return []
  }
}

/**
 * 写入所有文章
 */
export function writePosts(posts) {
  writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8')
}
