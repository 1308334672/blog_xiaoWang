---
title: JavaScript 进阶
---

# JavaScript 进阶 🚀

> 掌握 ES6+ 特性，让代码更简洁优雅。

## 解构赋值

```js
// 数组解构
const [a, b, ...rest] = [1, 2, 3, 4, 5]
console.log(a, b, rest) // 1 2 [3, 4, 5]

// 对象解构 + 重命名
const { name: userName, age = 18 } = { name: '小王' }
console.log(userName, age) // 小王 18
```

## 箭头函数

```js
// 普通函数
function add(a, b) {
  return a + b
}

// 箭头函数（简洁写法）
const add = (a, b) => a + b

// 返回对象时需要括号
const getUser = (name) => ({ name, role: 'user' })
```

## Promise & async/await

```js
// Promise 链式调用
fetch('/api/user')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))

// async/await（推荐）
async function getUser() {
  try {
    const res = await fetch('/api/user')
    const data = await res.json()
    console.log(data)
  } catch (err) {
    console.error(err)
  }
}
```

## 模块化

```js
// 导出
export const PI = 3.14159
export function add(a, b) { return a + b }
export default class Calculator { /* ... */ }

// 导入
import Calculator, { PI, add } from './math.js'
import * as math from './math.js'
```

## 常用数组方法

```js
const arr = [1, 2, 3, 4, 5]

// map - 转换每个元素
arr.map(x => x * 2)        // [2, 4, 6, 8, 10]

// filter - 过滤元素
arr.filter(x => x > 2)     // [3, 4, 5]

// reduce - 归纳
arr.reduce((acc, x) => acc + x, 0)  // 15

// find - 查找第一个匹配
arr.find(x => x > 3)       // 4

// some / every
arr.some(x => x > 4)       // true
arr.every(x => x > 0)      // true
```

## 可选链与空值合并

```js
// 可选链 ?.
const city = user?.address?.city ?? '未知城市'

// 空值合并 ??（只对 null/undefined 生效，不影响 0 或 ''）
const count = data.count ?? 0
```

::: warning ⚠️ 注意
`||` 会把 `0`、`''`、`false` 都当作假值，
`??` 只把 `null` 和 `undefined` 当作空值，更安全！
:::
