<script setup lang="ts">
import { GraphPlot, GraphKpi } from '../../src'
import type { SeriesData, KpiData } from '../../src'
const plot: SeriesData = { data: [1, 2], labels: ['Mon', 'Tue'] }
const kpi: KpiData = { value: '12', label: 'reads', hint: '+2', data: [1, 2] }
</script>

<template>
  <GraphPlot title="P" :written="plot" variant="line" :height="5" :progress="0.7" />
  <GraphPlot title="P" :data="[1, 2]" :labels="['a', 'b']" glyphs="ascii" palette="duo" />
  <GraphKpi title="K" :written="kpi" />
  <GraphKpi title="K" value="12" label="reads" hint="+2" data="1 2" />
</template>
