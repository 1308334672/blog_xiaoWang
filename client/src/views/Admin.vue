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

      <!-- Tab 切换 -->
      <div class="admin-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 提示消息 -->
      <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>

      <!-- ===== 文章管理 Tab ===== -->
      <div v-if="activeTab === 'posts'">
        <div class="admin-actions">
          <button class="btn btn-primary" @click="goCreate">+ 新建文章</button>
        </div>
        <div v-if="loading" class="loading">正在加载...</div>
        <div v-else-if="posts.length" class="posts-table glass-card">
          <div class="table-header">
            <span class="col-title">标题</span>
            <span class="col-module">模块</span>
            <span class="col-date">日期</span>
            <span class="col-actions">操作</span>
          </div>
          <div v-for="post in posts" :key="post.id" class="table-row">
            <span class="col-title post-title-cell">{{ post.title }}</span>
            <span class="col-module">
              <span class="post-module-badge">{{ getModuleName(post.moduleId) || post.category || '—' }}</span>
            </span>
            <span class="col-date">{{ formatDate(post.createdAt) }}</span>
            <span class="col-actions">
              <button class="btn btn-outline btn-sm" @click="goEdit(post.id)">编辑</button>
              <button class="btn btn-danger btn-sm" @click="confirmDelete(post)">删除</button>
            </span>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="emoji">📝</div>
          <p>还没有文章，点击「新建文章」开始写作吧！</p>
        </div>
        <div v-if="totalPages > 1" class="pagination">
          <button class="btn btn-outline" :disabled="currentPage <= 1" @click="loadPage(currentPage - 1)">← 上一页</button>
          <span style="color: var(--color-text-secondary); font-size: 0.9rem">第 {{ currentPage }} / {{ totalPages }} 页</span>
          <button class="btn btn-outline" :disabled="currentPage >= totalPages" @click="loadPage(currentPage + 1)">下一页 →</button>
        </div>
      </div>

      <!-- ===== 模块管理 Tab ===== -->
      <div v-if="activeTab === 'modules'">
        <div class="admin-actions">
          <button class="btn btn-primary" @click="openModuleForm()">+ 新建模块</button>
        </div>
        <div v-if="modulesLoading" class="loading">加载中...</div>
        <div v-else-if="modules.length" class="items-table glass-card">
          <div class="table-header module-cols">
            <span>图标</span>
            <span>名称</span>
            <span>标识符</span>
            <span>描述</span>
            <span>操作</span>
          </div>
          <div v-for="mod in modules" :key="mod.id" class="table-row module-cols">
            <span class="col-icon">{{ mod.icon }}</span>
            <span class="item-name">{{ mod.name }}</span>
            <span class="item-slug">{{ mod.slug }}</span>
            <span class="item-desc">{{ mod.description }}</span>
            <span class="col-actions">
              <button class="btn btn-outline btn-sm" @click="openModuleForm(mod)">编辑</button>
              <button class="btn btn-danger btn-sm" @click="confirmDeleteModule(mod)">删除</button>
            </span>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="emoji">📦</div>
          <p>还没有模块，点击「新建模块」创建第一个吧！</p>
        </div>
      </div>

      <!-- ===== 分类管理 Tab ===== -->
      <div v-if="activeTab === 'categories'">
        <div class="admin-actions">
          <button class="btn btn-primary" @click="openCategoryForm()">+ 新建分类</button>
        </div>
        <div v-if="categoriesLoading" class="loading">加载中...</div>
        <div v-else-if="categories.length" class="items-table glass-card">
          <div class="table-header cat-cols">
            <span>名称</span>
            <span>标识符</span>
            <span>所属模块</span>
            <span>操作</span>
          </div>
          <div v-for="cat in categories" :key="cat.id" class="table-row cat-cols">
            <span class="item-name">{{ cat.name }}</span>
            <span class="item-slug">{{ cat.slug }}</span>
            <span>
              <span class="post-module-badge">{{ getModuleName(cat.moduleId) || '—' }}</span>
            </span>
            <span class="col-actions">
              <button class="btn btn-outline btn-sm" @click="openCategoryForm(cat)">编辑</button>
              <button class="btn btn-danger btn-sm" @click="confirmDeleteCategory(cat)">删除</button>
            </span>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="emoji">🏷️</div>
          <p>还没有分类，点击「新建分类」创建吧！</p>
        </div>
      </div>
    </div>

    <!-- 删除文章确认弹窗 -->
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

    <!-- 模块编辑弹窗 -->
    <div v-if="moduleForm.show" class="modal-overlay" @click.self="closeModuleForm">
      <div class="modal glass-card">
        <div class="modal-header">
          <h3>{{ moduleForm.id ? '编辑模块' : '新建模块' }}</h3>
          <button class="close-btn" @click="closeModuleForm">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>名称 *</label>
              <input v-model="moduleForm.name" class="input-field" placeholder="如：前端开发" />
            </div>
            <div class="form-group">
              <label>图标（emoji）</label>
              <input v-model="moduleForm.icon" class="input-field" placeholder="💻" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>标识符 * (slug)</label>
              <input v-model="moduleForm.slug" class="input-field" placeholder="frontend" />
            </div>
            <div class="form-group">
              <label>排序</label>
              <input v-model.number="moduleForm.order" type="number" class="input-field" placeholder="1" />
            </div>
          </div>
          <div class="form-group">
            <label>描述</label>
            <input v-model="moduleForm.description" class="input-field" placeholder="模块描述..." />
          </div>
          <div v-if="moduleForm.error" class="error-msg">{{ moduleForm.error }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeModuleForm">取消</button>
          <button class="btn btn-primary" :disabled="moduleForm.submitting" @click="handleModuleSubmit">
            {{ moduleForm.submitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 分类编辑弹窗 -->
    <div v-if="categoryForm.show" class="modal-overlay" @click.self="closeCategoryForm">
      <div class="modal glass-card">
        <div class="modal-header">
          <h3>{{ categoryForm.id ? '编辑分类' : '新建分类' }}</h3>
          <button class="close-btn" @click="closeCategoryForm">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>名称 *</label>
              <input v-model="categoryForm.name" class="input-field" placeholder="如：Vue.js" />
            </div>
            <div class="form-group">
              <label>标识符 * (slug)</label>
              <input v-model="categoryForm.slug" class="input-field" placeholder="vuejs" />
            </div>
          </div>
          <div class="form-group">
            <label>所属模块</label>
            <select v-model="categoryForm.moduleId" class="input-field">
              <option value="">-- 不关联模块 --</option>
              <option v-for="m in modules" :key="m.id" :value="m.id">{{ m.icon }} {{ m.name }}</option>
            </select>
          </div>
          <div v-if="categoryForm.error" class="error-msg">{{ categoryForm.error }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeCategoryForm">取消</button>
          <button class="btn btn-primary" :disabled="categoryForm.submitting" @click="handleCategorySubmit">
            {{ categoryForm.submitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除模块确认 -->
    <div v-if="deleteModuleTarget" class="modal-overlay" @click.self="deleteModuleTarget = null">
      <div class="modal modal-sm glass-card">
        <div class="modal-header">
          <h3>确认删除模块</h3>
          <button class="close-btn" @click="deleteModuleTarget = null">✕</button>
        </div>
        <div class="modal-body">
          <p style="color: var(--color-text-secondary)">
            确定要删除模块「<strong style="color: var(--color-text-primary)">{{ deleteModuleTarget.name }}</strong>」吗？
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="deleteModuleTarget = null">取消</button>
          <button class="btn btn-danger" :disabled="submitting" @click="handleModuleDelete">
            {{ submitting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除分类确认 -->
    <div v-if="deleteCategoryTarget" class="modal-overlay" @click.self="deleteCategoryTarget = null">
      <div class="modal modal-sm glass-card">
        <div class="modal-header">
          <h3>确认删除分类</h3>
          <button class="close-btn" @click="deleteCategoryTarget = null">✕</button>
        </div>
        <div class="modal-body">
          <p style="color: var(--color-text-secondary)">
            确定要删除分类「<strong style="color: var(--color-text-primary)">{{ deleteCategoryTarget.name }}</strong>」吗？
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="deleteCategoryTarget = null">取消</button>
          <button class="btn btn-danger" :disabled="submitting" @click="handleCategoryDelete">
            {{ submitting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth.js'
import { usePostsStore } from '../store/posts.js'
import { useModulesStore } from '../store/modules.js'
import { useCategoriesStore } from '../store/categories.js'
import { storeToRefs } from 'pinia'
import { formatDate } from '../utils/date.js'

const router = useRouter()
const authStore = useAuthStore()
const postsStore = usePostsStore()
const modulesStore = useModulesStore()
const categoriesStore = useCategoriesStore()

const { isLoggedIn } = storeToRefs(authStore)
const { posts, loading, totalPages, currentPage } = storeToRefs(postsStore)
const { modules, loading: modulesLoading } = storeToRefs(modulesStore)
const { categories, loading: categoriesLoading } = storeToRefs(categoriesStore)

const loginPassword = ref('')
const loginError = ref('')
const loginLoading = ref(false)

const tabs = [
  { key: 'posts', label: '📄 文章管理' },
  { key: 'modules', label: '📦 模块管理' },
  { key: 'categories', label: '🏷️ 分类管理' }
]
const activeTab = ref('posts')

const deleteTarget = ref(null)
const deleteModuleTarget = ref(null)
const deleteCategoryTarget = ref(null)
const submitting = ref(false)

const toast = ref({ show: false, message: '', type: 'success' })

const moduleForm = ref({ show: false, id: null, name: '', slug: '', description: '', icon: '📁', order: 1, error: '', submitting: false })
const categoryForm = ref({ show: false, id: null, name: '', slug: '', moduleId: '', error: '', submitting: false })

function getModuleName(moduleId) {
  if (!moduleId) return ''
  const m = modules.value.find(m => m.id === moduleId)
  return m ? `${m.icon} ${m.name}` : ''
}

function loadPosts() {
  postsStore.fetchPosts({ page: 1, limit: 20 })
}

onMounted(() => {
  if (isLoggedIn.value) {
    loadPosts()
    modulesStore.fetchModules()
    categoriesStore.fetchCategories()
  }
})

async function handleLogin() {
  if (!loginPassword.value) { loginError.value = '请输入密码'; return }
  loginLoading.value = true
  loginError.value = ''
  const result = await authStore.login(loginPassword.value)
  loginLoading.value = false
  if (result.success) {
    loginPassword.value = ''
    loadPosts()
    modulesStore.fetchModules()
    categoriesStore.fetchCategories()
  } else {
    loginError.value = result.error
  }
}

function handleLogout() { authStore.logout() }

function goCreate() { router.push('/admin/editor') }
function goEdit(id) { router.push(`/admin/editor/${id}`) }

function confirmDelete(post) { deleteTarget.value = post }
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

function loadPage(page) { postsStore.fetchPosts({ page, limit: 20 }) }

function makeModuleForm(mod = null) {
  if (mod) {
    return { show: true, id: mod.id, name: mod.name, slug: mod.slug, description: mod.description || '', icon: mod.icon || '📁', order: mod.order || 1, error: '', submitting: false }
  }
  return { show: true, id: null, name: '', slug: '', description: '', icon: '📁', order: modules.value.length + 1, error: '', submitting: false }
}

function openModuleForm(mod = null) {
  moduleForm.value = makeModuleForm(mod)
}
function closeModuleForm() { moduleForm.value.show = false }
async function handleModuleSubmit() {
  if (!moduleForm.value.name || !moduleForm.value.slug) {
    moduleForm.value.error = '名称和标识符不能为空'; return
  }
  moduleForm.value.submitting = true
  moduleForm.value.error = ''
  try {
    const data = { name: moduleForm.value.name, slug: moduleForm.value.slug, description: moduleForm.value.description, icon: moduleForm.value.icon, order: moduleForm.value.order }
    if (moduleForm.value.id) {
      await modulesStore.updateModule(moduleForm.value.id, data)
      showToast('模块更新成功 ✨')
    } else {
      await modulesStore.createModule(data)
      showToast('模块创建成功 🎉')
    }
    closeModuleForm()
  } catch (err) {
    moduleForm.value.error = err.message || '操作失败'
  } finally {
    moduleForm.value.submitting = false
  }
}
function confirmDeleteModule(mod) { deleteModuleTarget.value = mod }
async function handleModuleDelete() {
  submitting.value = true
  try {
    await modulesStore.deleteModule(deleteModuleTarget.value.id)
    showToast('模块已删除')
    deleteModuleTarget.value = null
  } catch (err) {
    showToast(err.message || '删除失败', 'error')
  } finally {
    submitting.value = false
  }
}

function openCategoryForm(cat = null) {
  if (cat) {
    categoryForm.value = { show: true, id: cat.id, name: cat.name, slug: cat.slug, moduleId: cat.moduleId || '', error: '', submitting: false }
  } else {
    categoryForm.value = { show: true, id: null, name: '', slug: '', moduleId: '', error: '', submitting: false }
  }
}
function closeCategoryForm() { categoryForm.value.show = false }
async function handleCategorySubmit() {
  if (!categoryForm.value.name || !categoryForm.value.slug) {
    categoryForm.value.error = '名称和标识符不能为空'; return
  }
  categoryForm.value.submitting = true
  categoryForm.value.error = ''
  try {
    const data = { name: categoryForm.value.name, slug: categoryForm.value.slug, moduleId: categoryForm.value.moduleId }
    if (categoryForm.value.id) {
      await categoriesStore.updateCategory(categoryForm.value.id, data)
      showToast('分类更新成功 ✨')
    } else {
      await categoriesStore.createCategory(data)
      showToast('分类创建成功 🎉')
    }
    closeCategoryForm()
  } catch (err) {
    categoryForm.value.error = err.message || '操作失败'
  } finally {
    categoryForm.value.submitting = false
  }
}
function confirmDeleteCategory(cat) { deleteCategoryTarget.value = cat }
async function handleCategoryDelete() {
  submitting.value = true
  try {
    await categoriesStore.deleteCategory(deleteCategoryTarget.value.id)
    showToast('分类已删除')
    deleteCategoryTarget.value = null
  } catch (err) {
    showToast(err.message || '删除失败', 'error')
  } finally {
    submitting.value = false
  }
}

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}
</script>

<style scoped>
.admin-page {
  padding: 40px 24px 80px;
  min-height: 80vh;
}

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

.admin-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--glass-border);
}

.tab-btn {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 10px 18px;
  font-family: inherit;
  transition: all 0.2s;
  margin-bottom: -1px;
}

.tab-btn:hover { color: var(--color-text-primary); }

.tab-btn.active {
  color: var(--color-gold);
  border-bottom-color: var(--color-gold);
}

.admin-actions { margin-bottom: 20px; }

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

.posts-table,
.items-table {
  overflow: hidden;
}

.table-header,
.table-row {
  display: grid;
  gap: 12px;
  padding: 14px 20px;
  align-items: center;
}

.posts-table .table-header,
.posts-table .table-row {
  grid-template-columns: 1fr 130px 100px 160px;
}

.module-cols {
  grid-template-columns: 40px 1fr 120px 2fr 160px;
}

.cat-cols {
  grid-template-columns: 1fr 120px 130px 160px;
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

.table-row:last-child { border-bottom: none; }
.table-row:hover { background: rgba(255, 255, 255, 0.03); }

.post-title-cell,
.item-name {
  font-size: 0.93rem;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-icon { font-size: 1.3rem; text-align: center; }

.item-slug {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-family: monospace;
}

.item-desc {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-module-badge {
  font-size: 0.78rem;
  color: var(--color-gold);
  background: rgba(241, 196, 15, 0.1);
  padding: 2px 8px;
  border-radius: 9999px;
  border: 1px solid rgba(241, 196, 15, 0.2);
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

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 28px;
}

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
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-sm { max-width: 420px; }

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

.close-btn:hover { color: var(--color-text-primary); }

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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--glass-border);
}

@media (max-width: 768px) {
  .posts-table .table-header,
  .posts-table .table-row {
    grid-template-columns: 1fr 100px;
  }

  .col-module,
  .col-date {
    display: none;
  }

  .module-cols {
    grid-template-columns: 40px 1fr 120px;
  }

  .module-cols .item-desc { display: none; }

  .cat-cols {
    grid-template-columns: 1fr 120px;
  }

  .cat-cols .item-slug { display: none; }

  .form-row { grid-template-columns: 1fr; }
}
</style>
