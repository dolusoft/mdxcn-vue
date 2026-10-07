<script setup lang="ts">
// Replaces the default theme's `VPSidebar.vue` (aliased in `config.ts`) with the
// mdxcn docs menu (`components/docs/nav.tsx`, Copyright (c) 2026 Keshav Bagaade.
// MIT; see LICENSE), scrolled by the shadcn `ScrollArea`.
import { useScrollLock } from '@vueuse/core'
import { inBrowser, useRoute, withBase } from 'vitepress'
import { useLayout } from 'vitepress/theme-without-fonts'
import { useTemplateRef, watch } from 'vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAccent } from '../accent'
import AccentPicker from './AccentPicker.vue'
import SiteRule from './SiteRule.vue'

const props = defineProps<{ open: boolean }>()
const { sidebarGroups, hasSidebar } = useLayout()
const route = useRoute()
const accent = useAccent()

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

const normalize = (path: string) => path.replace(/(?:\.html|\/index)?(?:[?#].*)?$/, '') || '/'
const isActive = (link?: string) => !!link && normalize(withBase(link)) === normalize(route.path)
</script>

<template>
  <aside v-if="hasSidebar" class="VPSidebar isolate font-sans" :class="{ open }" @click.stop>
    <SiteRule class="right-0 max-lg:hidden" orientation="y" />
    <ScrollArea class="size-full" type="hover">
      <div class="flex flex-col gap-8 py-10">
        <nav
          id="VPSidebarNav"
          ref="navEl"
          aria-label="Docs"
          class="flex flex-col gap-8 text-base outline-none sm:text-sm"
          tabindex="-1"
        >
          <slot name="sidebar-nav-before" />
          <div v-for="group in sidebarGroups" :key="group.text" class="flex flex-col">
            <p class="px-4 py-3 font-mono tracking-wide text-graph-accent lowercase">
              {{ group.text }}
            </p>
            <ul class="flex flex-col" role="list">
              <li v-for="item in group.items" :key="item.link">
                <a
                  :aria-current="isActive(item.link) ? 'page' : undefined"
                  :class="
                    cn(
                      'flex items-center justify-between gap-2 px-4 py-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                      isActive(item.link) && 'bg-muted text-foreground hover:bg-muted',
                    )
                  "
                  :href="withBase(item.link ?? '/')"
                >
                  <span class="min-w-0 truncate">{{ item.text }}</span>
                </a>
              </li>
            </ul>
          </div>
          <slot name="sidebar-nav-after" />
        </nav>
        <AccentPicker v-model="accent" class="px-4" />
      </div>
    </ScrollArea>
    <div aria-hidden="true" class="scroll-fade scroll-fade-top" />
    <div aria-hidden="true" class="scroll-fade scroll-fade-bottom" />
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
  background-color: var(--background);
  opacity: 0;
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

/* Fades the list under its top and bottom edges, as mdxcn's `ScrollFade`. */
.scroll-fade {
  position: absolute;
  inset-inline: 0;
  z-index: 10;
  height: 2.5rem;
  pointer-events: none;
  backdrop-filter: blur(8px);
}
.scroll-fade-top {
  top: 0;
  background: linear-gradient(to bottom, var(--background) 20%, transparent);
  mask-image: linear-gradient(to bottom, black, transparent);
}
.scroll-fade-bottom {
  bottom: 0;
  background: linear-gradient(to top, var(--background) 20%, transparent);
  mask-image: linear-gradient(to top, black, transparent);
}

@media (min-width: 60rem) {
  /* Inside the centred `max-w-6xl` column, like the header. */
  .VPSidebar {
    left: max(0px, calc((100% - 72rem) / 2));
    width: 16rem;
    opacity: 1;
    visibility: visible;
    transform: translateX(0);
  }
}
</style>
