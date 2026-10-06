<script setup lang="ts">
import { GraphScore, GraphRank, GraphFunnel, Rank, Stage } from '../../src'
import type { ScoreRow, RankItem, FunnelStep } from '../../src'
const scores: ScoreRow[] = [{ label: 'Docs', value: 2.5, max: 5, accent: true }]
const ranks: RankItem[] = [{ label: 'Docs', value: '12,400', display: '12,400' }]
const steps: FunnelStep[] = [{ label: 'Ship', value: 860 }]
</script>
<template>
  <GraphScore title="Score" :items="scores" />
  <GraphRank title="Rank" :items="ranks" ticks="10"><Rank value="1,200">Docs</Rank></GraphRank>
  <GraphFunnel title="Funnel" :steps="steps"><Stage :value="12">Ship</Stage></GraphFunnel>
</template>
