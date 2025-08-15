// vite.config.ts (root of the Vue project)
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // load VITE_* from your .env files
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      host: '10.8.0.2', // was 'true'; listen on 0.0.0.0 (LAN/VPN access)
      port: 5173,
      strictPort: true,
      // If HMR doesn’t connect on mobile, uncomment:
      hmr: { host: '10.8.0.2', port: 5173 },
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'https://127.0.0.1:8000',
          changeOrigin: true,
          secure: false, // allow Symfony dev server's self-signed cert
        },
      },
    },
  }
})
