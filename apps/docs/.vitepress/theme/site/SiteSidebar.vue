<script setup lang="ts">
// Replaces the default theme's `VPSidebar.vue` (aliased in `config.ts`) so the
// sidebar scrolls inside the shadcn `ScrollArea` instead of a native scrollbar.
import { useScrollLock } from '@vueuse/core'
import { inBrowser } from 'vitepress'
import { useLayout } from 'vitepress/theme'
import VPSidebarGroup from 'vitepress/dist/client/theme-default/components/VPSidebarGroup.vue'
import { ref, useTemplateRef, watch } from 'vue'
import { ScrollArea } from '@/components/ui/scroll-area'

const props = defineProps<{ open: boolean }>()
const { sidebarGroups, hasSidebar } = useLayout()

const navEl = useTemplateRef<HTMLElement>('navEl')
const isLocked = useScrollLock(inBrowser ? document.body : null)
watch(
  [() => props.open, navEl],
  () => {
    isLocked.value = props.open
    if (props.open) navEl.value?.focus()
  },
  { immediate: true, flush: 'post' },
)

const key = ref(0)
watch(sidebarGroups, () => (key.value += 1), { deep: true })
</script>

<template>
  <aside v-if="hasSidebar" class="VPSidebar" :class="{ open }" @click.stop>
    <ScrollArea class="size-full" type="hover">
      <nav
        id="VPSidebarNav"
        ref="navEl"
        aria-labelledby="sidebar-aria-label"
        class="nav"
        tabindex="-1"
      >
        <span id="sidebar-aria-label" class="visually-hidden">Sidebar Navigation</span>
        <slot name="sidebar-nav-before" />
        <VPSidebarGroup :key="key" :items="sidebarGroups" />
        <slot name="sidebar-nav-after" />
      </nav>
    </ScrollArea>
  </aside>
</template>

<style scoped>
.VPSidebar {
  position: fixed;
  top: var(--vp-layout-top-height, 0px);
  bottom: 0;
  left: 0;
  z-index: var(--vp-z-index-sidebar);
  width: calc(100vw - 4rem);
  max-width: 20rem;
  background-color: var(--vp-sidebar-bg-color);
  opacity: 0;
  box-shadow: var(--vp-c-shadow-3);
  overflow: hidden;
  transform: translateX(-100%);
  transition:
    opacity 0.5s,
    transform 0.25s ease;
}

.VPSidebar.open {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
  transition:
    opacity 0.25s,
    transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
}

.dark .VPSidebar {
  box-shadow: var(--vp-shadow-1);
}

.nav {
  padding: 2rem 2rem 6rem;
  outline: 0;
}

@media (min-width: 60rem) {
  .VPSidebar {
    width: var(--vp-sidebar-width);
    max-width: 100%;
    opacity: 1;
    visibility: visible;
    box-shadow: none;
    transform: translateX(0);
  }
}

@media (min-width: 90rem) {
  .VPSidebar {
    width: calc((100% - (var(--vp-layout-max-width) - 4rem)) / 2 + var(--vp-sidebar-width) - 2rem);
  }

  .nav {
    padding-left: max(2rem, calc((100vw - (var(--vp-layout-max-width) - 4rem)) / 2));
  }
}
</style>
