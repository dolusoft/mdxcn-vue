<script setup lang="ts">
// Smoke component: proves the build, type and test pipeline end to end.
// It is not part of the mdxcn component set and will be removed later.
withDefaults(defineProps<{ label?: string }>(), { label: 'mdxcn-vue' })
</script>

<template>
  <span data-mdxcn-smoke>{{ label }}</span>
</template>
