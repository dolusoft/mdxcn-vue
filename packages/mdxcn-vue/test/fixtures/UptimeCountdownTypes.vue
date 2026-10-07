<script setup lang="ts">
import { GraphUptime, GraphCountdown } from '../../src'
import type { UptimeStatus, CountdownWritten } from '../../src'
const days: readonly UptimeStatus[] = ['ok', 'degraded', 'down', 'empty']
const written: CountdownWritten = { label: '2027-01-01', rest: 'until launch' }
</script>
<template>
  <GraphUptime title="U" :days="days" columns="2" :glyphs="['.', '#']" />
  <GraphCountdown title="C" :to="new Date(0)" :written="written" done="closed" />
</template>
