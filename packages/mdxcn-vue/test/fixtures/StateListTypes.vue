<script setup lang="ts">
import { Steps, Step, Changelog, Change, Decision } from '../../src'
</script>

<template>
  <Steps><Step title="Install" state="now">Run the CLI.</Step></Steps>
  <Changelog version="1"><Change type="add">New.</Change></Changelog>
  <Decision :options="[{ label: 'A', state: 'chosen' }]" />
  <Decision :options="null" />
  <!-- @vue-expect-error Step states must be a closed union. -->
  <Step state="unknown" />
  <!-- @vue-expect-error Change types must be a closed union. -->
  <Change type="unknown" />
  <!-- @vue-expect-error Changelog requires its version. -->
  <Changelog />
  <!-- @vue-expect-error Version must be a string. -->
  <Changelog :version="42" />
  <!-- @vue-expect-error Option states must be a closed union. -->
  <Decision :options="[{ label: 'A', state: 'done' }]" />
  <!-- @vue-expect-error Data options require a label. -->
  <Decision :options="[{ reason: 'Missing' }]" />
  <!-- @vue-expect-error Compiler list descriptions must remain typed. -->
  <Steps :list="['wrong']" />
</template>
