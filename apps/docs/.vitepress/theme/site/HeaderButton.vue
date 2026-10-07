<script setup lang="ts">
// Derived from mdxcn `components/site/header-button.tsx`, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE.
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{ label: string; class?: string }>(), { class: '' })
</script>

<template>
  <button
    :aria-label="props.label"
    :class="
      cn(
        'relative flex size-8 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground',
        props.class,
      )
    "
    type="button"
  >
    <span
      aria-hidden="true"
      class="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden"
    />
    <slot />
  </button>
</template>
