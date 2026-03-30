// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  base: "",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
});
