// vite.config.ts
import { defineConfig } from "file:///D:/Work/CCA/cca-front/node_modules/.pnpm/vite@5.0.8/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///D:/Work/CCA/cca-front/node_modules/.pnpm/@sveltejs+vite-plugin-svelte@3.0.1_svelte@4.2.8_vite@5.0.8/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "D:\\Work\\CCA\\cca-front";
var vite_config_default = defineConfig((env) => ({
  plugins: [svelte()],
  publicDir: "public",
  base: env.mode === "production" ? "/" : "",
  server: {
    host: true,
    port: 5e3
  },
  build: {
    rollupOptions: { output: { dir: "./dist" } },
    minify: true
  },
  resolve: {
    alias: {
      "@icons": "svelte-material-icons",
      "@components": resolve(__vite_injected_original_dirname, "./src/components"),
      "@classes": resolve(__vite_injected_original_dirname, "./src/classes"),
      "@helpers": resolve(__vite_injected_original_dirname, "./src/helpers"),
      "@material": resolve(__vite_injected_original_dirname, "./src/components/material"),
      "@constants": resolve(__vite_injected_original_dirname, "./src/constants/index.ts"),
      "@cstimer": resolve(__vite_injected_original_dirname, "./src/cstimer"),
      "@interfaces": resolve(__vite_injected_original_dirname, "./src/interfaces/index.ts"),
      "@stores": resolve(__vite_injected_original_dirname, "./src/stores"),
      "@workers": resolve(__vite_injected_original_dirname, "./src/workers"),
      "@lang": resolve(__vite_injected_original_dirname, "./src/lang"),
      "@public": resolve(__vite_injected_original_dirname, "./public")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxXb3JrXFxcXENDQVxcXFxjY2EtZnJvbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFdvcmtcXFxcQ0NBXFxcXGNjYS1mcm9udFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovV29yay9DQ0EvY2NhLWZyb250L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gJ0BzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGUnO1xyXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKGVudikgPT4gKHtcclxuICBwbHVnaW5zOiBbc3ZlbHRlKCldLFxyXG4gIHB1YmxpY0RpcjogJ3B1YmxpYycsXHJcbiAgYmFzZTogZW52Lm1vZGUgPT09ICdwcm9kdWN0aW9uJyA/ICcvJyA6ICcnLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogdHJ1ZSxcclxuICAgIHBvcnQ6IDUwMDBcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICByb2xsdXBPcHRpb25zOiB7IG91dHB1dDogeyBkaXI6IFwiLi9kaXN0XCIgfSB9LFxyXG4gICAgbWluaWZ5OiB0cnVlXHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBpY29uc1wiOiBcInN2ZWx0ZS1tYXRlcmlhbC1pY29uc1wiLFxyXG4gICAgICBcIkBjb21wb25lbnRzXCI6IHJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjL2NvbXBvbmVudHNcIiksXHJcbiAgICAgIFwiQGNsYXNzZXNcIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvY2xhc3Nlc1wiKSxcclxuICAgICAgXCJAaGVscGVyc1wiOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2hlbHBlcnMnKSxcclxuICAgICAgXCJAbWF0ZXJpYWxcIjogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb21wb25lbnRzL21hdGVyaWFsJyksXHJcbiAgICAgIFwiQGNvbnN0YW50c1wiOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2NvbnN0YW50cy9pbmRleC50cycpLFxyXG4gICAgICBcIkBjc3RpbWVyXCI6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvY3N0aW1lcicpLFxyXG4gICAgICBcIkBpbnRlcmZhY2VzXCI6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvaW50ZXJmYWNlcy9pbmRleC50cycpLFxyXG4gICAgICBcIkBzdG9yZXNcIjogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9zdG9yZXMnKSxcclxuICAgICAgXCJAd29ya2Vyc1wiOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3dvcmtlcnMnKSxcclxuICAgICAgXCJAbGFuZ1wiOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2xhbmcnKSxcclxuICAgICAgXCJAcHVibGljXCI6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9wdWJsaWMnKSxcclxuICAgIH0sXHJcbiAgfVxyXG59KSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF5UCxTQUFTLG9CQUFvQjtBQUN0UixTQUFTLGNBQWM7QUFDdkIsU0FBUyxlQUFlO0FBRnhCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLFNBQVM7QUFBQSxFQUNwQyxTQUFTLENBQUMsT0FBTyxDQUFDO0FBQUEsRUFDbEIsV0FBVztBQUFBLEVBQ1gsTUFBTSxJQUFJLFNBQVMsZUFBZSxNQUFNO0FBQUEsRUFDeEMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWUsRUFBRSxRQUFRLEVBQUUsS0FBSyxTQUFTLEVBQUU7QUFBQSxJQUMzQyxRQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsVUFBVTtBQUFBLE1BQ1YsZUFBZSxRQUFRLGtDQUFXLGtCQUFrQjtBQUFBLE1BQ3BELFlBQVksUUFBUSxrQ0FBVyxlQUFlO0FBQUEsTUFDOUMsWUFBWSxRQUFRLGtDQUFXLGVBQWU7QUFBQSxNQUM5QyxhQUFhLFFBQVEsa0NBQVcsMkJBQTJCO0FBQUEsTUFDM0QsY0FBYyxRQUFRLGtDQUFXLDBCQUEwQjtBQUFBLE1BQzNELFlBQVksUUFBUSxrQ0FBVyxlQUFlO0FBQUEsTUFDOUMsZUFBZSxRQUFRLGtDQUFXLDJCQUEyQjtBQUFBLE1BQzdELFdBQVcsUUFBUSxrQ0FBVyxjQUFjO0FBQUEsTUFDNUMsWUFBWSxRQUFRLGtDQUFXLGVBQWU7QUFBQSxNQUM5QyxTQUFTLFFBQVEsa0NBQVcsWUFBWTtBQUFBLE1BQ3hDLFdBQVcsUUFBUSxrQ0FBVyxVQUFVO0FBQUEsSUFDMUM7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
