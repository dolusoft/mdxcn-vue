import { useStorage } from '@vueuse/core'
import { inBrowser } from 'vitepress'
import { watchEffect } from 'vue'

// Site-wide graph accent, as in mdxcn: stored per browser and set on <html>
// so every figure on every page follows it.
const accent = useStorage('graph-accent', 'ocean')

if (inBrowser) {
  watchEffect(() => {
    document.documentElement.dataset.accent = accent.value
  })
}

export function useAccent() {
  return accent
}
