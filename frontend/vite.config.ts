import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['brand/zalocrm-logo.png'],
      manifest: {
        name: 'ZaloCRM',
        short_name: 'ZaloCRM',
        description: 'Quản lý nhiều tài khoản Zalo cá nhân',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#070A12',
        theme_color: '#D6A84F',
        icons: [
          {
            src: '/brand/zalocrm-logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/brand/zalocrm-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Chat',
            short_name: 'Chat',
            description: 'Mở tin nhắn',
            url: '/chat',
            icons: [{ src: '/brand/zalocrm-logo.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'Khách hàng',
            short_name: 'Khách hàng',
            description: 'Mở danh sách khách hàng',
            url: '/contacts',
            icons: [{ src: '/brand/zalocrm-logo.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/socket\.io\//],
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) => request.mode === 'navigate' && !url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'zalocrm-pages',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: ({ request }) => ['style', 'script', 'worker', 'font', 'image'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'zalocrm-assets',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
});
