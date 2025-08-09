import adapter from "@sveltejs/adapter-netlify";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess({
    script: true,
  }),

  compilerOptions: {
    css: "external",
  },

  kit: {
    adapter: adapter(),

    alias: {
      "@components": "./src/lib/components",
      "@classes": "./src/lib/classes",
      "@helpers": "./src/lib/helpers",
      "@material": "./src/lib/components/material",
      "@constants": "./src/lib/constants/index.ts",
      "@interfaces": "./src/lib/interfaces/index.ts",
      "@stores": "./src/lib/stores",
    },
  },
};

export default config;
