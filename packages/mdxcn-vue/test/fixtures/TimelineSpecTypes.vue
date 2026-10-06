<script setup lang="ts">
import { GraphTimeline, Event, GraphSpec, Field } from '../../src'
</script>

<template>
  <GraphTimeline title="T" :events="[{ date: '14:02', state: 'now', note: 'note' }]" />
  <GraphTimeline title="T" :events="null" :list="null">
    <Event date="14:02" state="next">Next</Event>
  </GraphTimeline>
  <GraphSpec title="S" :rows="[{ label: 'Size', value: '14', accent: true, note: 'note' }]" />
  <GraphSpec title="S" :rows="null"><Field label="Size" accent>14</Field></GraphSpec>
  <!-- @vue-expect-error Date must be a string. -->
  <GraphTimeline title="T" :events="[{ date: 42 }]" />
  <!-- @vue-expect-error State must belong to the union. -->
  <Event date="one" state="later" />
  <!-- @vue-expect-error Value must be a string. -->
  <GraphSpec title="S" :rows="[{ label: 'Size', value: 14 }]" />
  <!-- @vue-expect-error Accent must be a boolean. -->
  <Field label="Size" :accent="42" />
</template>
