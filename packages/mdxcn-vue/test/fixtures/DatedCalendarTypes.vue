<script setup lang="ts">
import { GraphActivity, GraphCalendar } from '../../src'
import type { ActivityDay, CalendarWrittenMark } from '../../src'
const days: readonly ActivityDay[] = [{ date: '2024-02-29', count: 2 }]
const written: readonly CalendarWrittenMark[] = [{ day: 29, today: true, label: 'Leap' }]
</script>
<template>
  <GraphActivity title="T" :days="days" :week-starts-on="1" max="8" :caption="false" />
  <GraphCalendar year="2024" month="2" :written="written" :marks="[{ day: 29 }]" today="29" />
</template>
