import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DATA_FILE = join(__dirname, '../data/categories.json')

export function readCategories() {
  try {
    const data = readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    console.error('读取分类数据失败:', err.message)
    return []
  }
}

export function writeCategories(categories) {
  writeFileSync(DATA_FILE, JSON.stringify(categories, null, 2), 'utf-8')
}
