<template>
  <div class="admin-page container">
    <!-- 登录面板 -->
    <div v-if="!isLoggedIn" class="login-panel">
      <div class="login-card glass-card">
        <div class="login-icon">🔐</div>
        <h2 class="login-title">&gt; ADMIN LOGIN</h2>
        <p class="login-desc">INPUT PASSWORD TO ACCESS</p>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <input
              v-model="loginPassword"
              type="password"
              class="input-field"
              placeholder="> PASSWORD..."
              autofocus
            />
          </div>
          <div v-if="loginError" class="error-msg">{{ loginError }}</div>
          <button type="submit" class="btn btn-primary full-width" :disabled="loginLoading">
            {{ loginLoading ? 'LOADING...' : 'LOGIN' }}
          </button>
        </form>
      </div>
    </div>

    <!-- 管理后台 -->
    <div v-else class="admin-content">
      <!-- 顶部栏 -->
      <div class="admin-header">
        <h1 class="admin-title">&gt; ADMIN PANEL</h1>
        <button class="btn btn-outline" @click="handleLogout">LOGOUT</button>
      </div>

      <!-- 操作按钮 -->
      <div class="admin-actions">
        <button class="btn btn-primary" @click="openCreate">+ NEW POST</button>
      </div>

      <!-- 提示消息 -->
      <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>

      <!-- 文章列表 -->
      <div v-if="loading" class="loading">&gt; LOADING...</div>
      <div v-else-if="posts.length" class="posts-table glass-card">
        <div class="table-header">
          <span class="col-title">TITLE</span>
          <span class="col-category">CATEGORY</span>
          <span class="col-date">DATE</span>
          <span class="col-actions">ACTIONS</span>
        </div>
        <div v-for="post in posts" :key="post.id" class="table-row">
          <span class="col-title post-title-cell">{{ post.title }}</span>
          <span class="col-category">
            <span class="post-category">{{ post.category }}</span>
          </span>
          <span class="col-date">{{ formatDate(post.createdAt) }}</span>
          <span class="col-actions">
            <button class="btn btn-outline btn-sm" @click="openEdit(post.id)">EDIT</button>
            <button class="btn btn-danger btn-sm" @click="confirmDelete(post)">DEL</button>
          </span>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="emoji">📝</div>
        <p>NO POSTS YET. CREATE ONE!</p>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="btn btn-outline" :disabled="currentPage <= 1" @click="loadPage(currentPage - 1)">&lt;&lt; PREV</button>
        <span style="color: var(--color-text-secondary); font-size: 0.6rem">PAGE {{ currentPage }}/{{ totalPages }}</span>
        <button class="btn btn-outline" :disabled="currentPage >= totalPages" @click="loadPage(currentPage + 1)">NEXT &gt;&gt;</button>
      </div>
    </div>

    <!-- 文章编辑弹窗 -->
    <div v-if="showEditor" class="modal-overlay" @click.self="closeEditor">
      <div class="modal glass-card">
        <div class="modal-header">
          <h3>{{ editingId ? 'EDIT POST' : 'NEW POST' }}</h3>
          <button class="close-btn" @click="closeEditor">X</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>TITLE *</label>
            <input v-model="form.title" class="input-field" placeholder="Post title" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>CATEGORY</label>
              <input v-model="form.category" class="input-field" placeholder="e.g. 前端开发" list="category-list" />
              <datalist id="category-list">
                <option v-for="c in categoryOptions" :key="c" :value="c" />
              </datalist>
            </div>
            <div class="form-group">
              <label>TAGS (comma sep)</label>
              <input v-model="form.tags" class="input-field" placeholder="Vue3, JavaScript" />
            </div>
          </div>
          <div class="form-group">
            <label>SUMMARY</label>
            <input v-model="form.summary" class="input-field" placeholder="Optional summary" />
          </div>
          <div class="form-group">
            <label>CONTENT (Markdown) *</label>
            <textarea v-model="form.content" class="input-field content-editor" placeholder="Write in Markdown..."></textarea>
          </div>
          <div v-if="formError" class="error-msg">{{ formError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeEditor">CANCEL</button>
          <button class="btn btn-primary" :disabled="submitting" @click="handleSubmit">
            {{ submitting ? 'SAVING...' : (editingId ? 'SAVE' : 'PUBLISH') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal modal-sm glass-card">
        <div class="modal-header">
          <h3>CONFIRM DELETE</h3>
          <button class="close-btn" @click="deleteTarget = null">X</button>
        </div>
        <div class="modal-body">
          <p style="color: var(--color-text-secondary)">
            DELETE「<strong style="color: var(--color-accent)">{{ deleteTarget.title }}</strong>」? THIS CANNOT BE UNDONE.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="deleteTarget = null">CANCEL</button>
          <button class="btn btn-danger" :disabled="submitting" @click="handleDelete">
            {{ submitting ? 'DELETING...' : 'DELETE' }}
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
  padding: 40px 32px;
  text-align: center;
}

.login-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.login-title {
  font-size: 1rem;
  margin-bottom: 8px;
  color: var(--color-green);
  text-shadow: 0 0 8px rgba(0, 255, 65, 0.3);
}

.login-desc {
  color: var(--color-text-muted);
  margin-bottom: 24px;
  font-size: 0.55rem;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-size: 0.6rem;
  color: var(--color-cyan);
  margin-bottom: 6px;
}

.full-width {
  width: 100%;
  justify-content: center;
  margin-top: 8px;
}

.error-msg {
  color: var(--color-accent);
  font-size: 0.6rem;
  margin: 8px 0;
  padding: 8px 12px;
  background: rgba(255, 107, 157, 0.1);
  border: 2px solid rgba(255, 107, 157, 0.3);
}

/* 管理后台 */
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.admin-title {
  font-size: 1.1rem;
  color: var(--color-green);
  text-shadow: 0 0 8px rgba(0, 255, 65, 0.3);
}

.admin-actions {
  margin-bottom: 20px;
}

/* Toast */
.toast {
  padding: 10px 16px;
  font-size: 0.6rem;
  margin-bottom: 16px;
  border: 2px solid;
}

.toast.success {
  background: rgba(0, 255, 65, 0.1);
  border-color: rgba(0, 255, 65, 0.3);
  color: var(--color-green);
}

.toast.error {
  background: rgba(255, 107, 157, 0.1);
  border-color: rgba(255, 107, 157, 0.3);
  color: var(--color-accent);
}

/* 文章表格 */
.posts-table {
  overflow: hidden;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 1fr 100px 90px 140px;
  gap: 10px;
  padding: 12px 16px;
  align-items: center;
}

.table-header {
  font-size: 0.6rem;
  color: var(--color-cyan);
  border-bottom: 3px solid var(--pixel-border);
}

.table-row {
  border-bottom: 1px dashed var(--pixel-border);
  transition: background 0.1s steps(2);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: rgba(0, 255, 65, 0.03);
}

.post-title-cell {
  font-size: 0.65rem;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-category {
  font-size: 0.5rem;
  color: var(--color-accent);
  background: rgba(255, 107, 157, 0.12);
  padding: 2px 6px;
  border: 1px solid rgba(255, 107, 157, 0.3);
}

.col-date {
  font-size: 0.55rem;
  color: var(--color-text-muted);
}

.col-actions {
  display: flex;
  gap: 6px;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 0.55rem;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
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
  padding: 16px 20px;
  border-bottom: 3px solid var(--pixel-border);
}

.modal-header h3 {
  font-size: 0.8rem;
  color: var(--color-green);
}

.close-btn {
  background: none;
  border: 2px solid var(--pixel-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  padding: 4px 8px;
  transition: all 0.1s steps(2);
}

.close-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 3px solid var(--pixel-border);
}

.form-row {
  display: flex;
  gap: 14px;
}

.form-row .form-group {
  flex: 1;
}

.content-editor {
  min-height: 240px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.8;
}

@media (max-width: 640px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr 80px 80px;
  }

  .col-date {
    display: none;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>

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
