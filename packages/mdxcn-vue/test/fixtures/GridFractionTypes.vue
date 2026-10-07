<script setup lang="ts">
import { GraphCells, Grid, GraphMeter, GraphWaffle } from '../../src'
import type { CellGrid, FractionData } from '../../src'
const items: readonly CellGrid[] = [{ label: 'r', cells: [[1, 0]] }]
const written: FractionData = { token: '67%', caption: 'used' }
</script>

<template>
  <GraphCells title="C" :items="items" palette="multi" />
  <GraphCells title="C"><Grid label="r" :cells="[[1, 0]]" /></GraphCells>
  <GraphMeter title="M" :written="written" ticks="14" />
  <GraphMeter title="M" :value="0.5" :ticks="10" caption="used" />
  <GraphWaffle title="W" value="73%" cells="40" columns="8" />
  <GraphWaffle title="W" :written="written" :cells="40" :columns="8" />
</template>
