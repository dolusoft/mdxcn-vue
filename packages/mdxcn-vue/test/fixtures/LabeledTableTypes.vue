<script setup lang="ts">
import { GraphCompare, GraphMatrix, GraphHeatmap, Col, Row } from '../../src'
</script>
<template>
  <GraphCompare
    title="Plans"
    :columns="['Solo', 'Studio']"
    :rows="[{ label: 'Source', values: [true, false] }]"
  />
  <GraphCompare title="Items"><Col>Solo</Col><Row label="Source">yes</Row></GraphCompare>
  <GraphMatrix title="Matrix" columns="a b" :rows="[{ label: 'read', values: [12, 'n/a'] }]" />
  <GraphHeatmap
    title="Heat"
    columns="a b"
    :rows="[{ label: 'Mon', values: [0, 4] }]"
    :max="10"
    :legend="false"
    :glyphs="['.', '#']"
  />
</template>
