import { defineConfig } from "vite";

export default defineConfig({
  root: "public",
  server: {
    port: 8080, 
    strictPort: true,
    host: "0.0.0.0",
    hmr: {
      protocol: 'wss',
      clientPort: 8443,
      path: '/'
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});