<script setup lang="ts">
import { Chat, Keys } from '../../src'
</script>

<template>
  <Chat :turns="[{ by: 'you', children: 'hello', aside: true }]" />
  <Chat :turns="null" :list="null" />
  <Keys :bindings="[{ keys: 'Ctrl+K', action: 'search', accent: true }]" />
  <Keys :bindings="null" />
  <!-- @vue-expect-error Speaker must be a string. -->
  <Chat :turns="[{ by: 42 }]" />
  <!-- @vue-expect-error Aside must be a boolean. -->
  <Chat :turns="[{ by: 'you', aside: 'yes' }]" />
  <!-- @vue-expect-error Action must be a string. -->
  <Keys :bindings="[{ keys: 'K', action: 42 }]" />
  <!-- @vue-expect-error Accent must be a boolean. -->
  <Keys :bindings="[{ keys: 'K', action: '', accent: 'yes' }]" />
</template>
