import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: "electron/main.js",
        vite: {
          build: {
            outDir: "dist-electron",
            rollupOptions: {
              external: ["electron", "sqlite3", "sequelize", "pg", "pg-hstore"],
            },
          },
        },
      },
      {
        entry: "electron/preload.js",
        vite: {
          build: {
            outDir: "dist-electron",
            rollupOptions: {
              external: ["electron"],
            },
          },
        },
      },
    ]),
  ],
  optimizeDeps: {
    exclude: ["electron"],
  },
  build: {
    rollupOptions: {
      input: {
        index: "./index.html",
      },
    },
  },
});
