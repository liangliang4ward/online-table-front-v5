import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import createVitePlugins from './vite/plugins'

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const isDev = mode === 'development'

  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: createVitePlugins(),
    server: {
      port: 5173,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      proxy: {
        '/api/onlineTable': {
          target: 'http://localhost:8683',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/api': {
          target: 'http://10.10.10.128:9000',
          changeOrigin: true
        }
      }
    },
    worker: {
      format: 'es'
    },
    build: {
      minify: isDev ? false : 'esbuild',
      sourcemap: isDev ? 'inline' : false,
      outDir: 'dist',
      assetsDir: 'assets',
      // 打包前清空输出目录
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('element-plus')) {
                return 'element-plus'
              }
              if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
                return 'vue-vendor'
              }
              if (id.includes('axios')) {
                return 'axios'
              }
            }
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
})
