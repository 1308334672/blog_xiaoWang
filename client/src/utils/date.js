/**
 * 共享工具函数
 */

/**
 * 格式化日期为 YYYY.MM.DD 格式
 * @param {string} dateStr ISO 日期字符串
 * @returns {string}
 */
export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

/**
 * 格式化日期为中文完整格式（YYYY 年 M 月 D 日）
 * @param {string} dateStr ISO 日期字符串
 * @returns {string}
 */
export function formatDateLong(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}
