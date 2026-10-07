<script setup lang="ts">
import { GraphTree, GraphCheck, GraphFlow, Node, Task, Path } from '../../src'
import type { GraphTreeProps, GraphCheckProps, GraphFlowProps } from '../../src'
const tree: GraphTreeProps = {
  title: 'T',
  nodes: [{ label: 'root', children: [{ label: 'leaf', accent: true }] }],
}
const check: GraphCheckProps = {
  title: 'C',
  items: [{ label: 'root', items: [{ label: 'leaf', done: true }] }],
}
const flow: GraphFlowProps = {
  title: 'F',
  rows: [{ nodes: [{ label: 'write' }, { label: 'ship', tone: 'accent', stretch: true }] }],
}
</script>
<template>
  <GraphTree v-bind="tree"
    ><Node label="root"><Node meta="ui" accent>leaf</Node></Node></GraphTree
  >
  <GraphCheck v-bind="check"
    ><Task done :items="[{ label: 'sub', done: true }]">ship</Task></GraphCheck
  >
  <GraphFlow v-bind="flow"
    ><Path>write → <strong>ship</strong></Path></GraphFlow
  >
</template>
