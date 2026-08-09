// vite.config.js
import { defineConfig } from "vite";

const DEV_PROXY_TARGET = "https://goldbet.fun";

export default defineConfig({
  base: "https://landing-res.b-cdn.net/goldbet/",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  // Dev-only proxy so the email-guard snippet + Zeruh endpoint (served from the
  // landing domain root in prod) resolve while running `npm run dev`.
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
      // Phone-guard snippet (IPQS valid/active) + its verify endpoint. Served from
      // the landing domain root in prod; proxied here so blur/submit gating works in dev.
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
      // Phone/email availability checks (same-origin in prod, served from the
      // landing domain root). Proxy them in dev so blur/submit gating works.
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
