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
        server.middlewares.use("/api/admin/members", (req, res) => {
          res.setHeader("Content-Type", "application/json");
          if (req.method === "POST") {
            let body = "";
            req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
            req.on("end", () => {
              const data = JSON.parse(body);
              res.statusCode = 201;
              res.end(JSON.stringify({
                id: Date.now(), name: data.name, role: data.role || "member",
                lineUserId: null, inviteToken: crypto.randomUUID(),
                inviteUsed: false, isActive: true,
                createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
              }));
            });
            return;
          }
          res.end(JSON.stringify([
            { id: 1, name: "Dev User", role: "admin", lineUserId: "U_dev", inviteToken: "tok1", inviteUsed: true, isActive: true, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
            { id: 2, name: "Test Member", role: "member", lineUserId: null, inviteToken: "tok2", inviteUsed: false, isActive: true, createdAt: "2025-01-02T00:00:00Z", updatedAt: "2025-01-02T00:00:00Z" },
            { id: 3, name: "Inactive User", role: "member", lineUserId: "U_old", inviteToken: "tok3", inviteUsed: true, isActive: false, createdAt: "2025-01-03T00:00:00Z", updatedAt: "2025-01-03T00:00:00Z" },
          ]));
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
