<script setup lang="ts">
import { Terminal } from '../../src'
</script>

<template>
  <Terminal text="$ run" />
  <Terminal :text="null" />
  <!-- @vue-expect-error Terminal text cannot accept numbers. -->
  <Terminal :text="42" />
  <!-- @vue-expect-error Terminal text cannot accept arrays. -->
  <Terminal :text="[]" />
</template>
