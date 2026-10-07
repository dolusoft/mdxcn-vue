<script setup lang="ts">
// Derived from mdxcn `components/site/corners.tsx`, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE.
import { PlusIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { cn } from '@/lib/utils'

export type Corner = 'tl' | 'tr' | 'bl' | 'br'

const props = withDefaults(
  defineProps<{ corners?: readonly Corner[]; tone?: 'rail' | 'frame'; class?: string }>(),
  { corners: () => ['tl', 'tr', 'bl', 'br'], tone: 'rail', class: '' },
)

const cornerClass: Record<Corner, string> = {
  tl: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
  tr: 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
  bl: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
  br: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2',
}
</script>

<template>
  <span
    v-for="corner in props.corners"
    :key="corner"
    aria-hidden="true"
    :class="
      cn(
        'pointer-events-none absolute z-20 flex size-4 items-center justify-center select-none',
        // Rail marks sit on the translucent header and the sidebar edge, where an
        // opaque `bg-background` box shows as a dark square; the plus alone covers
        // the dotted rail. Frame marks keep the cut-out over figure borders.
        props.tone === 'frame' ? 'bg-background text-graph-frame' : 'text-site-rail',
        cornerClass[corner],
        props.class,
      )
    "
  >
    <HugeiconsIcon class="size-4" :icon="PlusIcon" :size="16" :stroke-width="2" />
  </span>
</template>
