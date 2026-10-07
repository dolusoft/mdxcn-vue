<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{ text: string; label: string }>()
const message = ref('')
async function copy() {
  try {
    await navigator.clipboard.writeText(props.text)
    message.value = 'Copied'
  } catch {
    message.value = 'Select the text to copy manually'
  }
}
</script>

<template>
  <div class="home-copy">
    <button type="button" :aria-label="label" @click="copy">copy</button>
    <span role="status">{{ message }}</span>
  </div>
</template>
