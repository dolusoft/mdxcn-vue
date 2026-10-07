<script setup lang="ts">
// Derived from mdxcn `components/site/accent-picker.tsx`, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE.
import { cn } from '@/lib/utils'

const model = defineModel<string>({ required: true })

// Ids match the `[data-accent]` blocks in `mdxcn-vue/theme.css`.
const solids = ['theme', 'mint', 'orange', 'green', 'cyan', 'blue', 'purple', 'pink']
const gradients = ['sunset', 'ocean', 'neon', 'aurora', 'fire', 'prism']
</script>

<template>
  <div class="flex flex-col gap-2">
    <p class="font-mono tracking-wide text-graph-accent">accent</p>
    <div aria-label="accent color" class="flex flex-wrap items-center gap-1" role="radiogroup">
      <template v-for="(group, index) in [solids, gradients]" :key="index">
        <span v-if="index > 0" aria-hidden="true" class="mx-1 h-4 w-px bg-graph-frame" />
        <button
          v-for="id in group"
          :key="id"
          :aria-checked="model === id"
          :aria-label="id"
          :class="
            cn(
              'relative flex size-7 items-center justify-center rounded-md',
              model === id && 'bg-muted',
            )
          "
          role="radio"
          type="button"
          @click="model = id"
        >
          <span
            aria-hidden="true"
            :class="
              cn(
                'size-5 overflow-hidden rounded-full',
                index === 0 ? 'bg-graph-accent' : 'accent-gradient',
                id === 'theme' && 'border border-border',
              )
            "
            :data-accent="id"
          />
          <span
            aria-hidden="true"
            class="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden"
          />
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.accent-gradient {
  background: linear-gradient(
    135deg,
    var(--graph-accent) 0%,
    var(--graph-accent-2) 50%,
    var(--graph-accent-3) 100%
  );
}
</style>
