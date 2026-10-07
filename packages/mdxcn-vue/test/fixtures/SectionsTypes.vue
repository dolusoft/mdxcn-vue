<script setup lang="ts">
import { Faq, GraphBoard } from '../../src'
</script>

<template>
  <Faq :entries="[{ question: 'Q', answer: 'A', accent: true }]" />
  <GraphBoard title="T" :columns="[{ title: 'Now', items: [{ label: 'Ship', state: 'now' }] }]" />
</template>
