<script setup lang="ts">
import { GraphBars, GraphSpark, Series } from '../../src'
import type { BarSeries, SeriesData } from '../../src'
const series: BarSeries = { label: 'before', values: [1, 2], size: 'sm' }
const written: SeriesData = { data: [1, 2], labels: ['Mon', 'Tue'], caption: 'week' }
</script>

<template>
  <GraphBars title="B" :from="series" :to="{ label: 'after', values: [2], size: 'lg' }" />
  <GraphBars title="B" :series="[series]" glyphs="ascii" palette="duo">
    <Series label="before" values="2*3" size="lg" />
    <Series label="after" :values="[2, 3]">ignored</Series>
  </GraphBars>
  <GraphSpark title="S" :written="written" :data="[1, 2]" :glyphs="['.', '#']" />
  <GraphSpark title="S" data="2 3 4" caption="week" />
</template>
