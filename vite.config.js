import { defineConfig } from "vite";

export default defineConfig({
  server: {
    open: true,
    port: 5173,
  },
  build: {
    outDir: "docs",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith(".css")) {
            return "assets/styles[extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  base: "./",
});
