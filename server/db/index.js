import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  port:             parseInt(process.env.DB_PORT || '3306'),
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'blog',
  waitForConnections: true,
  connectionLimit:  10,
  charset:          'utf8mb4',
  timezone:         'Z'        // 统一 UTC，避免时区问题
})

/**
 * 初始化数据库表，服务启动时调用一次
 */
export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id         VARCHAR(36)  NOT NULL PRIMARY KEY,
      title      VARCHAR(500) NOT NULL,
      summary    TEXT,
      content    LONGTEXT     NOT NULL,
      category   VARCHAR(100) DEFAULT '未分类',
      tags       JSON,
      created_at DATETIME     NOT NULL,
      updated_at DATETIME     NOT NULL
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id   INT          AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `)

  // 插入默认分类（已存在则跳过）
  const defaults = ['前端开发', '后端开发', 'CSS技巧', '学习笔记', '生活随记', '未分类']
  for (const name of defaults) {
    await pool.query('INSERT IGNORE INTO categories (name) VALUES (?)', [name])
  }

  console.log('✅ 数据库表初始化完成')
}

export default pool
