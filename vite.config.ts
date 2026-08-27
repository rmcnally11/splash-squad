import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  publicDir: "public",
  server: {
    host: "127.0.0.1",
    port: 43173,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 43173,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
