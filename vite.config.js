// vite.config.js
import { defineConfig } from "vite";

const DEV_PROXY_TARGET = "https://goldbet.fun";

export default defineConfig({
  base: "https://landing-res.b-cdn.net/goldbet/ndb/10667/",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  server: {
    proxy: {
      "/api/domain/available": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
