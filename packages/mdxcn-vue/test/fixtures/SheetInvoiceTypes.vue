<script setup lang="ts">
import { GraphSheet, GraphInvoice, Section, Row, From, To, Meta, Item, Total } from '../../src'
</script>

<template>
  <GraphSheet
    title="S"
    :headers="['A']"
    :sections="[{ title: 'B', rows: [['C']] }]"
    :align="['left']"
  />
  <GraphSheet title="S"
    ><Section title="B"><Row :cells="['C']" /></Section
  ></GraphSheet>
  <GraphInvoice
    title="I"
    :items="[{ description: 'D', qty: '0', amount: '1,200.50' }]"
    :totals="[{ label: 'Due', value: '1,200.50', accent: true }]"
  />
  <GraphInvoice title="I"
    ><From name="F" :lines="['L']" /><To name="T" /><Meta label="M" value="V" /><Item amount="0"
      >Free</Item
    ><Total label="Due" value="0" accent
  /></GraphInvoice>
</template>
