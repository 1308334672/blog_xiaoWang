---
title: Vue3 学习笔记
---

# Vue3 学习笔记 💚

> Vue3 带来了 Composition API，让逻辑复用更优雅。

## 创建项目

```bash
# 使用 Vite 创建 Vue3 项目
npm create vite@latest my-app -- --template vue-ts
cd my-app
npm install
npm run dev
```

## Composition API 基础

```vue
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// ref - 基础响应式数据
const count = ref(0)
const increment = () => count.value++

// reactive - 响应式对象
const user = reactive({
  name: '小王',
  age: 18
})

// computed - 计算属性
const doubleCount = computed(() => count.value * 2)

// 生命周期钩子
onMounted(() => {
  console.log('组件已挂载！')
})
</script>

<template>
  <div>
    <p>计数：{{ count }}</p>
    <p>两倍：{{ doubleCount }}</p>
    <button @click="increment">+1</button>
  </div>
</template>
```

## 组件通信

```vue
<!-- 父组件 -->
<script setup>
import ChildComponent from './ChildComponent.vue'
const message = ref('Hello from parent')
const handleUpdate = (val) => console.log('子组件传来：', val)
</script>

<template>
  <ChildComponent :msg="message" @update="handleUpdate" />
</template>

<!-- 子组件 ChildComponent.vue -->
<script setup>
const props = defineProps({
  msg: String
})
const emit = defineEmits(['update'])
const sendToParent = () => emit('update', 'Hello from child')
</script>
```

## 自定义 Hook

将逻辑抽离成可复用的 Hook：

```js
// useCounter.js
import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue
  return { count, increment, decrement, reset }
}

// 在组件中使用
import { useCounter } from './useCounter'
const { count, increment } = useCounter(10)
```

## Pinia 状态管理

```bash
npm install pinia
```

```js
// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '小王',
    token: null
  }),
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    async login(credentials) {
      const data = await loginApi(credentials)
      this.token = data.token
      this.name = data.name
    }
  }
})
```

::: tip 🎯 Vue3 vs Vue2 主要区别
- `setup()` / `<script setup>` 替代了 Options API
- `ref` / `reactive` 替代了 `data()`
- `defineProps` / `defineEmits` 替代了 `props` / `emits`
- 性能提升：更小的包体积，更快的渲染速度
:::
