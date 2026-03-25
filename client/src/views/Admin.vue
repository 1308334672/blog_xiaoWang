<template>
  <div class="admin-page">
    <!-- ══════════ 登录面板 ══════════ -->
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

    <!-- ══════════ 管理后台 ══════════ -->
    <div v-else>

      <!-- ─── 写作室（全屏覆盖）─── -->
      <div v-if="mode === 'writing'" class="writing-room">
        <!-- 顶部工具栏 -->
        <div class="wr-topbar">
          <button class="wr-back-btn" @click="exitWriting">&lt; BACK</button>
          <input
            v-model="form.title"
            class="wr-title-input"
            placeholder="文章标题..."
          />
          <select v-model="form.category" class="wr-select">
            <option v-for="c in allCategories" :key="c" :value="c">{{ c }}</option>
          </select>
          <button
            class="btn btn-primary wr-save-btn"
            :disabled="submitting"
            @click="handleSubmit"
          >
            {{ submitting ? 'SAVING...' : (editingId ? 'SAVE' : 'PUBLISH') }}
          </button>
        </div>
        <!-- 副信息栏 -->
        <div class="wr-meta">
          <input v-model="form.tags" class="wr-meta-input" placeholder="TAGS: Vue3, JavaScript, ..." />
          <input v-model="form.summary" class="wr-meta-input" placeholder="SUMMARY (可选简介)..." />
        </div>
        <div v-if="formError" class="wr-error">⚠ {{ formError }}</div>
        <!-- 编辑器主体 -->
        <div class="wr-editor">
          <MarkdownEditor v-model="form.content" />
        </div>
      </div>

      <!-- ─── 正常后台视图 ─── -->
      <div v-else class="admin-content">
        <!-- 标题栏 -->
        <div class="admin-header">
          <h1 class="admin-title">&gt; ADMIN PANEL</h1>
          <div class="tab-group">
            <button class="tab-btn" :class="{ active: tab === 'posts' }" @click="tab = 'posts'">
              📝 POSTS
            </button>
            <button class="tab-btn" :class="{ active: tab === 'columns' }" @click="switchToColumns">
              📂 COLUMNS
            </button>
          </div>
          <button class="btn btn-outline" @click="handleLogout">LOGOUT</button>
        </div>

        <!-- Toast -->
        <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>

        <!-- ══ POSTS Tab ══ -->
        <div v-if="tab === 'posts'">
          <div class="admin-actions">
            <button class="btn btn-primary" @click="openCreate">+ NEW POST</button>
          </div>

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

          <div v-if="totalPages > 1" class="pagination">
            <button class="btn btn-outline" :disabled="currentPage <= 1" @click="loadPage(currentPage - 1)">&lt;&lt; PREV</button>
            <span style="color: var(--color-text-secondary); font-size: 0.6rem">PAGE {{ currentPage }}/{{ totalPages }}</span>
            <button class="btn btn-outline" :disabled="currentPage >= totalPages" @click="loadPage(currentPage + 1)">NEXT &gt;&gt;</button>
          </div>
        </div>

        <!-- ══ COLUMNS Tab ══ -->
        <div v-if="tab === 'columns'">
          <!-- 新增专栏 -->
          <div class="admin-actions add-column-bar">
            <input
              v-model="newColumnName"
              class="input-field col-input"
              placeholder="> 输入新专栏名称..."
              @keyup.enter="addColumn"
            />
            <button class="btn btn-primary" @click="addColumn" :disabled="!newColumnName.trim()">
              + ADD COLUMN
            </button>
          </div>

          <div v-if="columnsLoading" class="loading">&gt; LOADING COLUMNS...</div>
          <div v-else-if="columnStats.length" class="columns-manage glass-card">
            <div class="col-manage-header">
              <span>专栏名称</span>
              <span>文章数</span>
              <span>操作</span>
            </div>
            <div v-for="col in columnStats" :key="col.name" class="col-manage-row">
              <span class="col-manage-name">{{ col.name }}</span>
              <span class="col-manage-count">{{ col.postCount }}</span>
              <span class="col-manage-actions">
                <button
                  class="btn btn-outline btn-sm"
                  @click="router.push(`/blog/column/${encodeURIComponent(col.name)}`)"
                  title="预览专栏"
                >VIEW</button>
                <button
                  class="btn btn-danger btn-sm"
                  :disabled="col.postCount > 0"
                  :title="col.postCount > 0 ? '请先删除该专栏下的所有文章' : '删除专栏'"
                  @click="deleteColumn(col.name)"
                >DEL</button>
              </span>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="emoji">📂</div>
            <p>NO COLUMNS. ADD ONE!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════ 删除确认弹窗 ══════════ -->
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth.js'
import { usePostsStore } from '../store/posts.js'
import { storeToRefs } from 'pinia'
import { postsApi, categoriesApi } from '../api/posts.js'
import { formatDate } from '../utils/date.js'
import MarkdownEditor from '../components/MarkdownEditor.vue'

const router = useRouter()
const authStore = useAuthStore()
const postsStore = usePostsStore()
const { isLoggedIn } = storeToRefs(authStore)
const { posts, loading, totalPages, currentPage } = storeToRefs(postsStore)

// ─── 导航 ────────────────────────────────────────────────
const mode = ref('list')   // 'list' | 'writing'
const tab  = ref('posts')  // 'posts' | 'columns'

// ─── 登录 ────────────────────────────────────────────────
const loginPassword = ref('')
const loginError = ref('')
const loginLoading = ref(false)

// ─── 写作室 ──────────────────────────────────────────────
const editingId = ref(null)
const form = ref({ title: '', content: '', summary: '', category: '未分类', tags: '' })
const formError = ref('')
const submitting = ref(false)

// ─── 专栏管理 ─────────────────────────────────────────────
const allCategories = ref([])
const columnStats = ref([])
const columnsLoading = ref(false)
const newColumnName = ref('')

// ─── 删除 / Toast ─────────────────────────────────────────
const deleteTarget = ref(null)
const toast = ref({ show: false, message: '', type: 'success' })

// ═══════════════════════════════════════════════
//  初始化
// ═══════════════════════════════════════════════
onMounted(async () => {
  if (isLoggedIn.value) {
    loadPosts()
    await loadCategories()
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

// ─── 加载文章 ─────────────────────────────────────────────
function loadPosts() {
  postsStore.fetchPosts({ page: 1, limit: 20 })
}

function loadPage(page) {
  postsStore.fetchPosts({ page, limit: 20 })
}

// ─── 加载专栏 ─────────────────────────────────────────────
async function loadCategories() {
  allCategories.value = await categoriesApi.getAll().catch(() => [])
}

async function loadColumnStats() {
  columnsLoading.value = true
  try {
    const [cats, stats] = await Promise.all([
      categoriesApi.getAll(),
      postsApi.getCategories()
    ])
    allCategories.value = cats
    // 合并文章数量
    const countMap = Object.fromEntries(stats.map(s => [s.name, s.count]))
    columnStats.value = cats.map(name => ({ name, postCount: countMap[name] || 0 }))
  } finally {
    columnsLoading.value = false
  }
}

function switchToColumns() {
  tab.value = 'columns'
  loadColumnStats()
}

async function addColumn() {
  const name = newColumnName.value.trim()
  if (!name) return
  columnsLoading.value = true
  try {
    await categoriesApi.add(name)
    newColumnName.value = ''
    showToast(`专栏「${name}」已创建 ✨`)
    await loadColumnStats()
  } catch (err) {
    showToast(err.response?.data?.error || '创建失败', 'error')
  } finally {
    columnsLoading.value = false
  }
}

async function deleteColumn(name) {
  if (!confirm(`确定删除专栏「${name}」？`)) return
  columnsLoading.value = true
  try {
    await categoriesApi.remove(name)
    showToast(`专栏「${name}」已删除`)
    await loadColumnStats()
  } catch (err) {
    showToast(err.response?.data?.error || '删除失败', 'error')
  } finally {
    columnsLoading.value = false
  }
}

// ═══════════════════════════════════════════════
//  写作室
// ═══════════════════════════════════════════════
function openCreate() {
  editingId.value = null
  form.value = { title: '', content: '', summary: '', category: allCategories.value[0] || '未分类', tags: '' }
  formError.value = ''
  mode.value = 'writing'
  document.body.style.overflow = 'hidden'
}

async function openEdit(id) {
  try {
    const post = await postsApi.getById(id)
    editingId.value = id
    form.value = {
      title: post.title,
      content: post.content,
      summary: post.summary || '',
      category: post.category,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || '')
    }
    formError.value = ''
    mode.value = 'writing'
    document.body.style.overflow = 'hidden'
  } catch {
    showToast('获取文章失败', 'error')
  }
}

function exitWriting() {
  mode.value = 'list'
  document.body.style.overflow = ''
}

async function handleSubmit() {
  if (!form.value.title.trim()) { formError.value = '请输入文章标题'; return }
  if (!form.value.content.trim()) { formError.value = '请输入文章内容'; return }
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
    mode.value = 'list'
    document.body.style.overflow = ''
    loadPosts()
  } catch (err) {
    formError.value = err.message || '操作失败，请重试'
  } finally {
    submitting.value = false
  }
}

// ═══════════════════════════════════════════════
//  登录 / 登出
// ═══════════════════════════════════════════════
async function handleLogin() {
  if (!loginPassword.value) { loginError.value = '请输入密码'; return }
  loginLoading.value = true
  loginError.value = ''
  const result = await authStore.login(loginPassword.value)
  loginLoading.value = false
  if (result.success) {
    loginPassword.value = ''
    loadPosts()
    loadCategories()
  } else {
    loginError.value = result.error
  }
}

function handleLogout() {
  document.body.style.overflow = ''
  authStore.logout()
}

// ─── 删除文章 ─────────────────────────────────────────────
function confirmDelete(post) {
  deleteTarget.value = post
}

async function handleDelete() {
  submitting.value = true
  try {
    await postsStore.deletePost(deleteTarget.value.id)
    showToast('文章已删除')
    deleteTarget.value = null
    loadPosts()
  } catch (err) {
    showToast(err.message || '删除失败', 'error')
  } finally {
    submitting.value = false
  }
}

// ─── Toast ────────────────────────────────────────────────
function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}
</script>

<style scoped>
/* ─── 页面基础 ─────────────────────────────────── */
.admin-page {
  width: 100%;
  max-width: none;
  padding: 40px 24px 80px;
  min-height: 80vh;
}

/* ─── 登录面板 ─────────────────────────────────── */
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
.login-icon { font-size: 2.5rem; margin-bottom: 16px; }
.login-title {
  font-size: 1rem;
  margin-bottom: 8px;
  color: var(--color-green);
  text-shadow: 0 0 8px rgba(0,255,65,0.3);
}
.login-desc { color: var(--color-text-muted); margin-bottom: 24px; font-size: 0.55rem; }

.form-group { margin-bottom: 14px; }
.form-group label {
  display: block;
  font-size: 0.6rem;
  color: var(--color-cyan);
  margin-bottom: 6px;
}
.full-width { width: 100%; justify-content: center; margin-top: 8px; }

.error-msg {
  color: var(--color-accent);
  font-size: 0.6rem;
  margin: 8px 0;
  padding: 8px 12px;
  background: rgba(255,107,157,0.1);
  border: 2px solid rgba(255,107,157,0.3);
}

/* ─── 后台头部 ─────────────────────────────────── */
.admin-content { }
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}
.admin-title {
  font-size: 1.1rem;
  color: var(--color-green);
  text-shadow: 0 0 8px rgba(0,255,65,0.3);
}

/* Tab 切换 */
.tab-group { display: flex; gap: 6px; }
.tab-btn {
  background: transparent;
  border: 2px solid var(--pixel-border);
  color: var(--color-text-muted);
  font-family: 'Press Start 2P', monospace;
  font-size: 0.55rem;
  padding: 8px 14px;
  cursor: none;
  transition: all 0.1s steps(2);
}
.tab-btn:hover { border-color: var(--color-green); color: var(--color-green); }
.tab-btn.active {
  border-color: var(--color-green);
  color: var(--color-green);
  background: rgba(0,255,65,0.08);
}

.admin-actions { margin-bottom: 20px; }

/* Toast */
.toast {
  padding: 10px 16px;
  font-size: 0.6rem;
  margin-bottom: 16px;
  border: 2px solid;
}
.toast.success {
  background: rgba(0,255,65,0.1);
  border-color: rgba(0,255,65,0.3);
  color: var(--color-green);
}
.toast.error {
  background: rgba(255,107,157,0.1);
  border-color: rgba(255,107,157,0.3);
  color: var(--color-accent);
}

/* ─── 文章表格 ─────────────────────────────────── */
.posts-table { overflow: hidden; }
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
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: rgba(0,255,65,0.03); }

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
  background: rgba(255,107,157,0.12);
  padding: 2px 6px;
  border: 1px solid rgba(255,107,157,0.3);
}
.col-date { font-size: 0.55rem; color: var(--color-text-muted); }
.col-actions { display: flex; gap: 6px; }
.btn-sm { padding: 4px 10px; font-size: 0.55rem; }

/* ─── 分页 ─────────────────────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

/* ─── 专栏管理 ─────────────────────────────────── */
.add-column-bar { display: flex; gap: 12px; align-items: center; }
.col-input { flex: 1; }

.columns-manage { overflow: hidden; }
.col-manage-header,
.col-manage-row {
  display: grid;
  grid-template-columns: 1fr 90px 160px;
  gap: 10px;
  padding: 12px 16px;
  align-items: center;
}
.col-manage-header {
  font-size: 0.6rem;
  color: var(--color-cyan);
  border-bottom: 3px solid var(--pixel-border);
}
.col-manage-row {
  border-bottom: 1px dashed var(--pixel-border);
}
.col-manage-row:last-child { border-bottom: none; }
.col-manage-name { font-size: 0.7rem; color: var(--color-text-primary); }
.col-manage-count {
  font-size: 0.75rem;
  color: var(--color-green);
  text-shadow: 0 0 6px rgba(0,255,65,0.4);
}
.col-manage-actions { display: flex; gap: 6px; }

/* ─── 删除确认弹窗 ─────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 3px solid var(--pixel-border);
}
.modal-header h3 { font-size: 0.8rem; color: var(--color-green); }
.close-btn {
  background: none;
  border: 2px solid var(--pixel-border);
  color: var(--color-text-secondary);
  cursor: none;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.6rem;
  padding: 4px 8px;
  transition: all 0.1s steps(2);
}
.close-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
.modal-body { padding: 20px; }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 3px solid var(--pixel-border);
}

/* ═══════════════════════════════════════
   写作室（全屏叠层）
═══════════════════════════════════════ */
.writing-room {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: var(--color-bg-deep);
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100dvh;
}

/* 顶部工具栏 */
.wr-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 2px solid var(--pixel-border);
  background: rgba(0,10,5,0.9);
  flex-shrink: 0;
}

.wr-back-btn {
  background: transparent;
  border: 2px solid var(--pixel-border);
  color: var(--color-cyan);
  font-family: 'Press Start 2P', monospace;
  font-size: 0.55rem;
  padding: 8px 12px;
  cursor: none;
  white-space: nowrap;
  transition: all 0.1s steps(2);
  flex-shrink: 0;
}
.wr-back-btn:hover {
  border-color: var(--color-cyan);
  background: rgba(0,212,255,0.08);
}

.wr-title-input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--pixel-border);
  color: var(--color-text-primary);
  font-family: 'Press Start 2P', monospace;
  font-size: 0.9rem;
  padding: 6px 10px;
  outline: none;
  min-width: 0;
}
.wr-title-input::placeholder { color: var(--color-text-muted); }
.wr-title-input:focus { border-bottom-color: var(--color-green); }

.wr-select {
  background: rgba(0,20,10,0.8);
  border: 2px solid var(--pixel-border);
  color: var(--color-text-primary);
  font-family: 'Press Start 2P', monospace;
  font-size: 0.55rem;
  padding: 8px 10px;
  cursor: none;
  flex-shrink: 0;
  max-width: 160px;
}
.wr-select:focus { outline: none; border-color: var(--color-green); }

.wr-save-btn { flex-shrink: 0; }

/* 副信息栏（tags / summary） */
.wr-meta {
  display: flex;
  gap: 10px;
  padding: 6px 16px;
  border-bottom: 1px dashed var(--pixel-border);
  background: rgba(0,10,5,0.7);
  flex-shrink: 0;
}
.wr-meta-input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--pixel-border);
  color: var(--color-text-secondary);
  font-family: 'Press Start 2P', monospace;
  font-size: 0.5rem;
  padding: 5px 8px;
  outline: none;
}
.wr-meta-input::placeholder { color: var(--color-text-muted); }
.wr-meta-input:focus { border-bottom-color: var(--color-cyan); color: var(--color-text-primary); }

.wr-error {
  font-size: 0.55rem;
  color: var(--color-accent);
  padding: 6px 16px;
  background: rgba(255,107,157,0.1);
  flex-shrink: 0;
}

/* 编辑器主体 */
.wr-editor {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
}
.wr-editor :deep(.md-editor) {
  flex: 1;
  min-height: 0;
  height: 100%;
  border: none;
}

/* ─── 响应式 ─────────────────────────────────── */
@media (max-width: 640px) {
  .table-header,
  .table-row { grid-template-columns: 1fr 80px 80px; }
  .col-date { display: none; }
  .wr-meta { flex-direction: column; gap: 4px; }
  .wr-title-input { font-size: 0.65rem; }
}

@media (max-width: 768px) {
  .table-header,
  .table-row { grid-template-columns: 1fr 100px; }
  .col-category, .col-date { display: none; }
  .wr-topbar { flex-wrap: wrap; }
}
</style>
