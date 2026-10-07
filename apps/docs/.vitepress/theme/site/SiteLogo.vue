<script setup lang="ts">
// Derived from mdxcn `lib/og/mark.tsx`, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE.
// Site mark: a dashed frame with `+` corners and three glyph bars, drawn on a
// 32-unit grid so it stays crisp at 16px. Follows the live theme tokens.
withDefaults(defineProps<{ size?: number }>(), { size: 16 })
</script>

<template>
  <svg
    aria-hidden="true"
    :height="size"
    viewBox="0 0 32 32"
    :width="size"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect fill="var(--background)" height="32" width="32" />
    <rect
      fill="none"
      height="23"
      stroke="var(--foreground)"
      stroke-dasharray="2 2"
      stroke-width="1"
      width="23"
      x="4.5"
      y="4.5"
    />
    <g fill="var(--background)">
      <rect height="5" width="5" x="2" y="2" />
      <rect height="5" width="5" x="25" y="2" />
      <rect height="5" width="5" x="2" y="25" />
      <rect height="5" width="5" x="25" y="25" />
    </g>
    <path
      d="M4.5 2v5M2 4.5h5M27.5 2v5M25 4.5h5M4.5 25v5M2 27.5h5M27.5 25v5M25 27.5h5"
      fill="none"
      stroke="var(--foreground)"
      stroke-width="1"
    />
    <rect fill="var(--foreground)" height="6" width="4" x="8" y="18" />
    <rect fill="var(--foreground)" height="11" width="4" x="14" y="13" />
    <rect fill="var(--graph-accent)" height="16" width="4" x="20" y="8" />
  </svg>
</template>
