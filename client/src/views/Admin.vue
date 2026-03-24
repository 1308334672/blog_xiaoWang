<template>
  <div class="admin-page container">
    <!-- 登录面板 -->
    <div v-if="!isLoggedIn" class="login-panel">
      <div class="login-card glass-card">
        <div class="login-icon">🔐</div>
        <h2 class="login-title">管理员登录</h2>
        <p class="login-desc">请输入管理密码以访问后台</p>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <input
              v-model="loginPassword"
              type="password"
              class="input-field"
              placeholder="输入密码（默认: admin123）"
              autofocus
            />
          </div>
          <div v-if="loginError" class="error-msg">{{ loginError }}</div>
          <button type="submit" class="btn btn-primary full-width" :disabled="loginLoading">
            {{ loginLoading ? '登录中...' : '✨ 登录' }}
          </button>
        </form>
      </div>
    </div>

    <!-- 管理后台 -->
    <div v-else class="admin-content">
      <!-- 顶部栏 -->
      <div class="admin-header">
        <h1 class="admin-title gradient-text">✨ 博客管理后台</h1>
        <button class="btn btn-outline" @click="handleLogout">退出登录</button>
      </div>

      <!-- 操作按钮 -->
      <div class="admin-actions">
        <button class="btn btn-primary" @click="openCreate">+ 新建文章</button>
      </div>

      <!-- 提示消息 -->
      <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>

      <!-- 文章列表 -->
      <div v-if="loading" class="loading">正在加载...</div>
      <div v-else-if="posts.length" class="posts-table glass-card">
        <div class="table-header">
          <span class="col-title">标题</span>
          <span class="col-category">分类</span>
          <span class="col-date">日期</span>
          <span class="col-actions">操作</span>
        </div>
        <div v-for="post in posts" :key="post.id" class="table-row">
          <span class="col-title post-title-cell">{{ post.title }}</span>
          <span class="col-category">
            <span class="post-category">{{ post.category }}</span>
          </span>
          <span class="col-date">{{ formatDate(post.createdAt) }}</span>
          <span class="col-actions">
            <button class="btn btn-outline btn-sm" @click="openEdit(post.id)">编辑</button>
            <button class="btn btn-danger btn-sm" @click="confirmDelete(post)">删除</button>
          </span>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="emoji">📝</div>
        <p>还没有文章，点击「新建文章」开始写作吧！</p>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="btn btn-outline" :disabled="currentPage <= 1" @click="loadPage(currentPage - 1)">← 上一页</button>
        <span style="color: var(--color-text-secondary); font-size: 0.9rem">第 {{ currentPage }} / {{ totalPages }} 页</span>
        <button class="btn btn-outline" :disabled="currentPage >= totalPages" @click="loadPage(currentPage + 1)">下一页 →</button>
      </div>
    </div>

    <!-- 文章编辑弹窗 -->
    <div v-if="showEditor" class="modal-overlay" @click.self="closeEditor">
      <div class="modal glass-card">
        <div class="modal-header">
          <h3>{{ editingId ? '编辑文章' : '新建文章' }}</h3>
          <button class="close-btn" @click="closeEditor">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>标题 *</label>
            <input v-model="form.title" class="input-field" placeholder="文章标题" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>分类</label>
              <input v-model="form.category" class="input-field" placeholder="如: 前端开发" list="category-list" />
              <datalist id="category-list">
                <option v-for="c in categoryOptions" :key="c" :value="c" />
              </datalist>
            </div>
            <div class="form-group">
              <label>标签（逗号分隔）</label>
              <input v-model="form.tags" class="input-field" placeholder="Vue3, JavaScript" />
            </div>
          </div>
          <div class="form-group">
            <label>摘要</label>
            <input v-model="form.summary" class="input-field" placeholder="文章摘要（选填，自动从内容截取）" />
          </div>
          <div class="form-group">
            <label>内容（Markdown）*</label>
            <textarea v-model="form.content" class="input-field content-editor" placeholder="支持 Markdown 格式..."></textarea>
          </div>
          <div v-if="formError" class="error-msg">{{ formError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeEditor">取消</button>
          <button class="btn btn-primary" :disabled="submitting" @click="handleSubmit">
            {{ submitting ? '保存中...' : (editingId ? '保存修改' : '发布文章') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal modal-sm glass-card">
        <div class="modal-header">
          <h3>确认删除</h3>
          <button class="close-btn" @click="deleteTarget = null">✕</button>
        </div>
        <div class="modal-body">
          <p style="color: var(--color-text-secondary)">
            确定要删除「<strong style="color: var(--color-text-primary)">{{ deleteTarget.title }}</strong>」吗？此操作无法撤销。
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="deleteTarget = null">取消</button>
          <button class="btn btn-danger" :disabled="submitting" @click="handleDelete">
            {{ submitting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/auth.js'
import { usePostsStore } from '../store/posts.js'
import { storeToRefs } from 'pinia'
import { postsApi } from '../api/posts.js'
import { formatDate } from '../utils/date.js'

const authStore = useAuthStore()
const postsStore = usePostsStore()
const { isLoggedIn } = storeToRefs(authStore)
const { posts, loading, totalPages, currentPage } = storeToRefs(postsStore)

// 登录
const loginPassword = ref('')
const loginError = ref('')
const loginLoading = ref(false)

// 编辑器
const showEditor = ref(false)
const editingId = ref(null)
const form = ref({ title: '', content: '', summary: '', category: '未分类', tags: '' })
const formError = ref('')
const submitting = ref(false)

// 删除
const deleteTarget = ref(null)

// Toast 提示
const toast = ref({ show: false, message: '', type: 'success' })

// 分类选项
const categoryOptions = ['前端开发', '后端开发', 'CSS技巧', '学习笔记', '生活随记', '未分类']

// 加载文章列表
function loadPosts() {
  postsStore.fetchPosts({ page: 1, limit: 20 })
}

onMounted(() => {
  if (isLoggedIn.value) loadPosts()
})

// 登录
async function handleLogin() {
  if (!loginPassword.value) {
    loginError.value = '请输入密码'
    return
  }
  loginLoading.value = true
  loginError.value = ''
  const result = await authStore.login(loginPassword.value)
  loginLoading.value = false
  if (result.success) {
    loginPassword.value = ''
    loadPosts()
  } else {
    loginError.value = result.error
  }
}

// 退出
function handleLogout() {
  authStore.logout()
}

// 打开新建
function openCreate() {
  editingId.value = null
  form.value = { title: '', content: '', summary: '', category: '未分类', tags: '' }
  formError.value = ''
  showEditor.value = true
}

// 打开编辑
async function openEdit(id) {
  try {
    const post = await postsApi.getById(id)
    editingId.value = id
    form.value = {
      title: post.title,
      content: post.content,
      summary: post.summary || '',
      category: post.category,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags
    }
    formError.value = ''
    showEditor.value = true
  } catch {
    showToast('获取文章失败', 'error')
  }
}

// 关闭编辑器
function closeEditor() {
  showEditor.value = false
}

// 提交表单
async function handleSubmit() {
  if (!form.value.title.trim()) {
    formError.value = '请输入文章标题'
    return
  }
  if (!form.value.content.trim()) {
    formError.value = '请输入文章内容'
    return
  }
  submitting.value = true
  formError.value = ''
  try {
    if (editingId.value) {
      await postsStore.updatePost(editingId.value, form.value)
      showToast('文章更新成功 ✨')
    } else {
      await postsStore.createPost(form.value)
      showToast('文章发布成功 🎉')
    }
    closeEditor()
    loadPosts()
  } catch (err) {
    formError.value = err.message || '操作失败，请重试'
  } finally {
    submitting.value = false
  }
}

// 确认删除
function confirmDelete(post) {
  deleteTarget.value = post
}

// 执行删除
async function handleDelete() {
  submitting.value = true
  try {
    await postsStore.deletePost(deleteTarget.value.id)
    showToast('文章已删除')
    deleteTarget.value = null
  } catch (err) {
    showToast(err.message || '删除失败', 'error')
  } finally {
    submitting.value = false
  }
}

// 翻页
function loadPage(page) {
  postsStore.fetchPosts({ page, limit: 20 })
}

// 显示 Toast
function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// 格式化日期
// formatDate imported from utils
</script>

<style scoped>
.admin-page {
  padding: 40px 24px 80px;
  min-height: 80vh;
}

/* 登录面板 */
.login-panel {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 48px 40px;
  text-align: center;
}

.login-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.login-desc {
  color: var(--color-text-secondary);
  margin-bottom: 28px;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 16px;
}

.full-width {
  width: 100%;
  justify-content: center;
  margin-top: 8px;
}

.error-msg {
  color: var(--color-accent);
  font-size: 0.85rem;
  margin: 8px 0;
  padding: 8px 12px;
  background: rgba(233, 69, 96, 0.1);
  border-radius: var(--radius-sm);
}

/* 管理后台 */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.admin-title {
  font-size: 1.8rem;
  font-weight: 700;
}

.admin-actions {
  margin-bottom: 20px;
}

/* Toast */
.toast {
  padding: 12px 20px;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.toast.success {
  background: rgba(46, 204, 113, 0.15);
  border: 1px solid rgba(46, 204, 113, 0.3);
  color: #2ecc71;
}

.toast.error {
  background: rgba(233, 69, 96, 0.15);
  border: 1px solid rgba(233, 69, 96, 0.3);
  color: var(--color-accent);
}

/* 文章表格 */
.posts-table {
  overflow: hidden;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 1fr 120px 100px 160px;
  gap: 12px;
  padding: 14px 20px;
  align-items: center;
}

.table-header {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--glass-border);
  font-weight: 600;
}

.table-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.2s;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.post-title-cell {
  font-size: 0.93rem;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-category {
  font-size: 0.78rem;
  color: var(--color-accent);
  background: rgba(233, 69, 96, 0.12);
  padding: 2px 8px;
  border-radius: 9999px;
  border: 1px solid rgba(233, 69, 96, 0.25);
}

.col-date {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.col-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 5px 12px;
  font-size: 0.8rem;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 28px;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal {
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-sm {
  max-width: 420px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--glass-border);
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--color-text-primary);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}

.content-editor {
  min-height: 280px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.88rem;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--glass-border);
}

@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr 100px;
  }

  .col-category,
  .col-date {
    display: none;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
