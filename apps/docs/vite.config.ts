import { defineConfig } from 'vite'

/**
 * VitePress passes `config.vite?.configFile` to Vite. With no explicit path,
 * Vite auto-loads this file from `srcDir` as the user config.
 *
 * `devtools` must live here. VitePress forwards `.vitepress/config.ts` `vite`
 * options through a plugin `config` hook, and Vite rejects `devtools` from a
 * plugin hook ("cannot be changed from a plugin's `config` hook").
 */
export default defineConfig({
  // Vite DevTools (`@vitejs/devtools`): dev server only, panels under `/__devtools/`.
  // `clientAuth: false` skips the one-time code prompt; the dev server only runs
  // on developer machines.
  devtools: { apply: 'serve', clientAuth: false },
})
