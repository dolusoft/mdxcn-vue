<script setup lang="ts">
// The dashed rails of mdxcn's centred column (`app/docs/layout.tsx`), drawn
// under the header for the whole page; on docs pages a mark joins the
// sidebar rule to the header.
import { useLayout } from 'vitepress/theme'
import SiteCorners from './SiteCorners.vue'
import SiteRule from './SiteRule.vue'

const { hasSidebar } = useLayout()
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none fixed inset-x-0 bottom-0 z-30 top-(--vp-layout-top-height)"
  >
    <div class="relative mx-auto h-full w-full max-w-6xl">
      <SiteRule class="left-0" orientation="y" />
      <SiteRule class="right-0" orientation="y" />
      <div v-if="hasSidebar" class="absolute top-0 left-0 w-64 max-[60rem]:hidden">
        <SiteCorners :corners="['tr']" />
      </div>
    </div>
  </div>
</template>
