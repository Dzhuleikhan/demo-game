// vite.config.js
import { defineConfig } from "vite";

const DEV_PROXY_TARGET = "https://goldbet.fun";

export default defineConfig({
  base: "https://landing-res.b-cdn.net/goldbet/ndb2/",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  // dev-only: проксируем Email-Guard (Zeruh) на боевой nginx, чтобы локально
  // работали и сниппет, и проверка. В сборку не попадает.
  // Запуск локально: npm run dev -- --base=/
  server: {
    proxy: {
      "/email-guard.js": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
      "/api/email/verify": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
      "/api/phone/check-available": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
      // Phone-Guard (IPQS): сниппет + прокси проверки на боевой nginx.
      "/phone-guard.js": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
      "/api/phone/verify": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
      "/api/email/check-available": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
      // Ротатор домена: стабильный алиас в nginx-include.
      "/api/domain/available": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
