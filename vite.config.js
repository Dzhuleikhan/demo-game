// vite.config.js
import { defineConfig } from "vite";

const DEV_PROXY_TARGET = "https://goldbet.fun";

export default defineConfig({
  base: "https://landing-res.b-cdn.net/goldbet/ndb2/5dollars/",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  // DEV-ONLY: проксируем сниппет email-guard и Zeruh-эндпоинт на боевой nginx,
  // чтобы проверка email работала на localhost. В сборку не попадает.
  // Запуск: npm run dev -- --base=/
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
      "/phone-guard.js": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: false,
      },
      "/api/phone/verify": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: false,
      },
      "/api/phone/check-available": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: false,
      },
      "/api/email/check-available": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: false,
      },
      "/api/domain/available": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
