import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import path from "path";
import { fileURLToPath } from "url";

// En ES modules, necesitamos definir __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
              external: ["electron"],
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
            minify: false,
            sourcemap: true,
            commonjsOptions: {
              transformMixedEsModules: true,
            },
            lib: {
              entry: "electron/preload.js",
              formats: ["cjs"],
              fileName: () => "preload.js",
            },
          },
        },
      },
    ]),
  ],
  base: "./",
  optimizeDeps: {
    exclude: ["electron"],
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "index.html"),
      },
    },
    emptyOutDir: true,
  },
});
