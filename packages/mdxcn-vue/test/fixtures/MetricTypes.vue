<script setup lang="ts">
import { GraphStat, GraphSlope, GraphBullet, Stat, Slope, Target } from '../../src'
import type { StatItem, SlopeItem, BulletItem } from '../../src'
const stats: StatItem[] = [{ value: '142ms', label: 'read', hint: '−18ms', accent: true }]
const slopes: SlopeItem[] = [{ label: 'read', from: '1,200', to: 1400 }]
const bullets: BulletItem[] = [{ label: 'CPU', value: 72, target: '80', max: 100 }]
</script>
<template>
  <GraphStat title="Stat" :items="stats"><Stat value="12,400" accent>docs</Stat></GraphStat>
  <GraphSlope title="Slope" from-label="before" to-label="after" :items="slopes">
    <Slope from="1,200" :to="1400">read</Slope>
  </GraphSlope>
  <GraphBullet title="Bullet" :items="bullets" ticks="10">
    <Target value="72" target="80" max="100">CPU</Target>
  </GraphBullet>
</template>
