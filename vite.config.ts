import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  base: "/querybox/",
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "QueryBox",
      formats: ["es", "umd"],
      fileName: (format) => `querybox.${format}.js`,
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: [],
      output: {
        // Global variables for UMD build
        globals: {},
        // Preserve CSS
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "style.css";
          return assetInfo.name || "asset";
        },
      },
    },
    sourcemap: true,
    // Minify for production
    minify: "esbuild",
  },
  server: {
    open: "/",
  },
  publicDir: "public",
  root: ".",
});
