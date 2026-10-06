<script setup lang="ts">
import { Annotate, Env } from '../../src'
</script>

<template>
  <Annotate code="run // (1)" :notes="['One']" />
  <Annotate :code="null" :notes="null" />
  <Env :vars="[{ name: 'A', required: true }]" />
  <Env :vars="null" />
  <!-- @vue-expect-error Annotate code must be a string. -->
  <Annotate :code="42" />
  <!-- @vue-expect-error Annotate notes must be an array. -->
  <Annotate notes="wrong" />
  <!-- @vue-expect-error Env name must be a string. -->
  <Env :vars="[{ name: 42 }]" />
  <!-- @vue-expect-error Env required must be a boolean. -->
  <Env :vars="[{ name: 'A', required: 'yes' }]" />
</template>
