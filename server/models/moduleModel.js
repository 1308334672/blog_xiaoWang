import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DATA_FILE = join(__dirname, '../data/modules.json')

export function readModules() {
  try {
    const data = readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    console.error('读取模块数据失败:', err.message)
    return []
  }
}

export function writeModules(modules) {
  writeFileSync(DATA_FILE, JSON.stringify(modules, null, 2), 'utf-8')
}
