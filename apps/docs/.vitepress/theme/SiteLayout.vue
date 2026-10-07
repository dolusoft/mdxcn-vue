<script setup lang="ts">
import DefaultTheme from 'vitepress/theme-without-fonts'
import SiteHeader from './site/SiteHeader.vue'
import SiteRails from './site/SiteRails.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #layout-top>
      <SiteHeader />
      <SiteRails />
    </template>
  </DefaultTheme.Layout>
</template>
