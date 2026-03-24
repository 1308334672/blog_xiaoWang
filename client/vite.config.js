import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: env.VITE_HOST || '0.0.0.0',
      port: Number(env.VITE_PORT || 5173),
      allowedHosts: true,
      // 将 /api 请求代理到后端服务器
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET || 'http://127.0.0.1:3001',
          changeOrigin: true,
          rewrite: (path) => path
        }
      }
    }
  }
})
