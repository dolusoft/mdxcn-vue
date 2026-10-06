/* Derived from mdxcn, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE. */
import { onMounted, onUnmounted, readonly, ref } from 'vue'

/** A deterministic first render; like upstream, the interval continues in hidden tabs. */
export function useGraphNow(interval = 1000) {
  const now = ref<number | null>(null)
  let id: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    now.value = Date.now()
    id = setInterval(() => {
      now.value = Date.now()
    }, interval)
  })
  onUnmounted(() => {
    if (id !== undefined) clearInterval(id)
  })
  return readonly(now)
}
