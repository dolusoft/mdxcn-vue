<script setup lang="ts">
import { ref } from 'vue'
import HomeCopy from './HomeCopy.vue'
defineProps<{ id: string; title: string; markdown: string }>()
const view = ref('vue')
const tabs = ['vue', 'markdown']
function move(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  view.value =
    event.key === 'Home'
      ? 'vue'
      : event.key === 'End'
        ? 'markdown'
        : view.value === 'vue'
          ? 'markdown'
          : 'vue'
  const container = event.currentTarget as HTMLElement
  container.querySelector<HTMLButtonElement>(`[data-view="${view.value}"]`)?.focus()
}
</script>

<template>
  <div class="home-figure">
    <div class="home-tabs" role="tablist" :aria-label="`${title} format`" @keydown="move">
      <button
        v-for="tab in tabs"
        :id="`${id}-${tab}-tab`"
        :key="tab"
        type="button"
        role="tab"
        :data-view="tab"
        :aria-selected="view === tab"
        :aria-controls="`${id}-${tab}-panel`"
        :tabindex="view === tab ? 0 : -1"
        @click="view = tab"
      >
        {{ tab }}
      </button>
    </div>
    <div
      :id="`${id}-vue-panel`"
      :hidden="view !== 'vue'"
      role="tabpanel"
      :aria-labelledby="`${id}-vue-tab`"
      tabindex="0"
    >
      <slot />
    </div>
    <div
      :id="`${id}-markdown-panel`"
      :hidden="view !== 'markdown'"
      role="tabpanel"
      :aria-labelledby="`${id}-markdown-tab`"
      tabindex="0"
    >
      <pre class="home-markdown"><code>{{ markdown }}</code></pre>
      <HomeCopy :text="markdown" :label="`Copy ${title} Markdown`" />
    </div>
  </div>
</template>
