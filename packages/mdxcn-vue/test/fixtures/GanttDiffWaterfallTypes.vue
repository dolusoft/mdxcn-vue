<script setup lang="ts">
import { GraphGantt, GraphDiff, GraphWaterfall, Span, Line, Delta } from '../../src'
import type { GanttItem, DiffRow, WaterfallItem } from '../../src'
const gantt: GanttItem[] = [{ start: '0.2', end: 0.8, complete: 0.5 }]
const diff: DiffRow[] = [{ value: '31 kb', sign: 'add' }]
const waterfall: WaterfallItem[] = [{ value: '-1,234.5', kind: 'out' }]
</script>
<template>
  <GraphGantt title="Gantt" :items="gantt" columns="20" :ticks="['mon', 'fri']" :progress="0.5">
    <Span start="0" end="1" complete="0.5" accent>build</Span>
  </GraphGantt>
  <GraphDiff title="Diff" :rows="diff" :footer="{ value: '0' }">
    <Line value="12" sign="keep" total>total</Line>
  </GraphDiff>
  <GraphWaterfall title="Waterfall" :items="waterfall" ticks="10">
    <Delta value="-2" kind="out">cost</Delta>
  </GraphWaterfall>
</template>
