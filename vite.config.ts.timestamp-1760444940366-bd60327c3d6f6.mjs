// vite.config.ts
import { defineConfig } from "file:///Users/jedr/querybox/node_modules/.pnpm/vite@5.4.20_@types+node@20.19.21/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
import dts from "file:///Users/jedr/querybox/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@20.19.21_typescript@5.9.3_vite@5.4.20/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/jedr/querybox";
var vite_config_default = defineConfig(({ command }) => ({
  base: command === "build" ? "/querybox/" : "/",
  plugins: [
    dts({
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "QueryBox",
      formats: ["es", "umd"],
      fileName: (format) => `querybox.${format}.js`
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
        }
      }
    },
    sourcemap: true,
    // Minify for production
    minify: "esbuild"
  },
  server: {
    open: "/"
  },
  publicDir: "public",
  root: "."
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamVkci9xdWVyeWJveFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2plZHIvcXVlcnlib3gvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2plZHIvcXVlcnlib3gvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgZHRzIGZyb20gXCJ2aXRlLXBsdWdpbi1kdHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQgfSkgPT4gKHtcbiAgYmFzZTogY29tbWFuZCA9PT0gXCJidWlsZFwiID8gXCIvcXVlcnlib3gvXCIgOiBcIi9cIixcbiAgcGx1Z2luczogW1xuICAgIGR0cyh7XG4gICAgICBpbnNlcnRUeXBlc0VudHJ5OiB0cnVlLFxuICAgIH0pLFxuICBdLFxuICBidWlsZDoge1xuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9pbmRleC50c1wiKSxcbiAgICAgIG5hbWU6IFwiUXVlcnlCb3hcIixcbiAgICAgIGZvcm1hdHM6IFtcImVzXCIsIFwidW1kXCJdLFxuICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IGBxdWVyeWJveC4ke2Zvcm1hdH0uanNgLFxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgLy8gRXh0ZXJuYWxpemUgZGVwcyB0aGF0IHNob3VsZG4ndCBiZSBidW5kbGVkXG4gICAgICBleHRlcm5hbDogW10sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgLy8gR2xvYmFsIHZhcmlhYmxlcyBmb3IgVU1EIGJ1aWxkXG4gICAgICAgIGdsb2JhbHM6IHt9LFxuICAgICAgICAvLyBQcmVzZXJ2ZSBDU1NcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICBpZiAoYXNzZXRJbmZvLm5hbWUgPT09IFwic3R5bGUuY3NzXCIpIHJldHVybiBcInN0eWxlLmNzc1wiO1xuICAgICAgICAgIHJldHVybiBhc3NldEluZm8ubmFtZSB8fCBcImFzc2V0XCI7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgc291cmNlbWFwOiB0cnVlLFxuICAgIC8vIE1pbmlmeSBmb3IgcHJvZHVjdGlvblxuICAgIG1pbmlmeTogXCJlc2J1aWxkXCIsXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIG9wZW46IFwiL1wiLFxuICB9LFxuICBwdWJsaWNEaXI6IFwicHVibGljXCIsXG4gIHJvb3Q6IFwiLlwiLFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4TyxTQUFTLG9CQUFvQjtBQUMzUSxTQUFTLGVBQWU7QUFDeEIsT0FBTyxTQUFTO0FBRmhCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsUUFBUSxPQUFPO0FBQUEsRUFDNUMsTUFBTSxZQUFZLFVBQVUsZUFBZTtBQUFBLEVBQzNDLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxNQUNGLGtCQUFrQjtBQUFBLElBQ3BCLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxLQUFLO0FBQUEsTUFDSCxPQUFPLFFBQVEsa0NBQVcsY0FBYztBQUFBLE1BQ3hDLE1BQU07QUFBQSxNQUNOLFNBQVMsQ0FBQyxNQUFNLEtBQUs7QUFBQSxNQUNyQixVQUFVLENBQUMsV0FBVyxZQUFZLE1BQU07QUFBQSxJQUMxQztBQUFBLElBQ0EsZUFBZTtBQUFBO0FBQUEsTUFFYixVQUFVLENBQUM7QUFBQSxNQUNYLFFBQVE7QUFBQTtBQUFBLFFBRU4sU0FBUyxDQUFDO0FBQUE7QUFBQSxRQUVWLGdCQUFnQixDQUFDLGNBQWM7QUFDN0IsY0FBSSxVQUFVLFNBQVMsWUFBYSxRQUFPO0FBQzNDLGlCQUFPLFVBQVUsUUFBUTtBQUFBLFFBQzNCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQTtBQUFBLElBRVgsUUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxXQUFXO0FBQUEsRUFDWCxNQUFNO0FBQ1IsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
