import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration for React client on port 3000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },
  build: {
    target: "esnext",
    rollupOptions: {
      external: ["firebase/app", "firebase/database"],
    },
  },
  optimizeDeps: {
    exclude: ["firebase/app", "firebase/database"],
  },
});
