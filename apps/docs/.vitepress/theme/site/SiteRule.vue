<script setup lang="ts">
// Derived from mdxcn `components/site/corners.tsx`, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE.
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{ orientation?: 'x' | 'y'; class?: string }>(), {
  orientation: 'x',
  class: '',
})
</script>

<template>
  <span
    aria-hidden="true"
    :class="
      cn(
        'pointer-events-none absolute z-10',
        props.orientation === 'x' ? 'inset-x-0 site-rule h-px' : 'inset-y-0 site-rule-y w-px',
        props.class,
      )
    "
  />
</template>
