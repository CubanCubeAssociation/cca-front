import adapter from "@sveltejs/adapter-netlify";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess({
    postcss: true,
  }),

  compilerOptions: {
    css: "external",
  },

  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter(),

    alias: {
      "@icons": "./node_modules/svelte-material-icons",
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
