import { fileURLToPath, URL } from "node:url";
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    solid(),
    {
      name: "mock-api",
      configureServer(server) {
        server.middlewares.use("/api/auth/me", (_req, res) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ id: 1, name: "Dev User", role: "admin", lineUserId: "U_dev" }));
        });
        server.middlewares.use("/api/auth/logout", (_req, res) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true }));
        });
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'nitonabbc-app',
        short_name: 'nitonabbc',
        display: 'standalone',
        start_url: '/',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  css: {
    transformer: 'lightningcss',
    lightningcss: {}
  },
  build: {
    cssMinify: 'lightningcss'
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
