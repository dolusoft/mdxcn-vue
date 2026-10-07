<script setup lang="ts">
// Derived from mdxcn `components/site/header.tsx`, `theme-toggle.tsx`, `github-star.tsx`
// and `labs.tsx`, Copyright (c) 2026 Keshav Bagaade. MIT; see LICENSE.
import {
  Cancel01Icon,
  MenuIcon,
  Moon02Icon,
  Search01Icon,
  Sun03Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { Button } from '@/components/ui/button'
import { data as github } from '../../github.data'
import GithubIcon from './GithubIcon.vue'
import HeaderButton from './HeaderButton.vue'
import SiteCorners from './SiteCorners.vue'
import SiteLogo from './SiteLogo.vue'
import SiteRule from './SiteRule.vue'

const { isDark, theme } = useData()

const nav = computed(() =>
  (theme.value.nav ?? []).flatMap((item: { text?: string; link?: string }) =>
    item.text && item.link ? [{ text: item.text, link: withBase(item.link) }] : [],
  ),
)

const stars = computed(() =>
  !github.stars ? null : new Intl.NumberFormat('en-US').format(github.stars),
)

// The default theme's local search listens for Ctrl/Cmd+K on window.
function openSearch() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true }))
}

// Fixed parts of the default theme (sidebar, outline) start below this height.
const header = ref<HTMLElement>()
let observer: ResizeObserver | undefined
onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    const height = Math.round(entry?.borderBoxSize[0]?.blockSize ?? 0)
    document.documentElement.style.setProperty('--vp-layout-top-height', `${height}px`)
  })
  if (header.value) observer.observe(header.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <header ref="header" class="site-header fixed inset-x-0 top-0 z-40 font-sans text-base">
    <div aria-label="Announcement" class="relative bg-background" role="region">
      <div class="px-4 py-2 text-center sm:px-6">
        <div class="mx-auto max-w-6xl text-sm text-muted-foreground">
          <SiteLogo class="mr-2 inline size-3.5 align-text-bottom" :size="14" />
          <span class="text-foreground">mdxcn-vue is a Vue 3 port of mdxcn.</span>
          {{ ' ' }}
          <Button as-child class="ml-1 align-middle" size="xs" variant="outline">
            <a href="https://www.mdxcn.dev/" rel="noreferrer">upstream</a>
          </Button>
        </div>
      </div>
      <SiteRule class="bottom-0 z-10" />
    </div>
    <div class="relative bg-background/40 backdrop-blur-sm">
      <SiteRule class="bottom-0 z-20" />
      <div class="relative isolate mx-auto w-full max-w-6xl min-w-0 px-4 sm:px-6 lg:px-8">
        <SiteRule class="left-0 z-20" orientation="y" />
        <SiteRule class="right-0 z-20" orientation="y" />
        <SiteCorners />
        <div class="flex items-center justify-between gap-4 py-4">
          <div class="flex items-center gap-4">
            <a
              aria-label="Homepage"
              class="flex shrink-0 items-center gap-2.5 text-foreground"
              :href="withBase('/')"
            >
              <SiteLogo class="size-4" />
              mdxcn-vue
            </a>
            <nav aria-label="Primary" class="max-lg:hidden">
              <ul class="flex items-center gap-4" role="list">
                <li v-for="item in nav" :key="item.link">
                  <a class="text-muted-foreground hover:text-foreground" :href="item.link">
                    {{ item.text }}
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <div class="flex items-center gap-2">
            <HeaderButton
              :label="isDark ? 'Switch to light' : 'Switch to dark'"
              @click="isDark = !isDark"
            >
              <HugeiconsIcon
                class="size-5 shrink-0 sm:size-4"
                :icon="isDark ? Sun03Icon : Moon02Icon"
                :size="20"
                :stroke-width="1.5"
              />
            </HeaderButton>
            <HeaderButton label="Search" @click="openSearch">
              <HugeiconsIcon
                class="size-5 shrink-0 sm:size-4"
                :icon="Search01Icon"
                :size="20"
                :stroke-width="1.5"
              />
            </HeaderButton>
            <a
              :aria-label="stars ? `Star on GitHub, ${stars} stars` : 'Star on GitHub'"
              class="flex items-center gap-2 max-lg:hidden"
              href="https://github.com/dolusoft/mdxcn-vue"
              rel="noreferrer"
            >
              <Button
                as="span"
                class="group flex shrink-0 items-center gap-2 text-muted-foreground transition-all duration-300 hover:text-foreground"
                variant="ghost"
              >
                <GithubIcon class="size-4 shrink-0 group-hover:text-yellow-500" />
                <span
                  v-if="stars"
                  class="flex items-center gap-1 tabular-nums group-hover:text-yellow-500"
                >
                  [{{ stars }}]
                </span>
              </Button>
            </a>
            <DialogRoot>
              <DialogTrigger as-child>
                <HeaderButton class="lg:hidden" label="Open menu">
                  <HugeiconsIcon
                    class="size-5 shrink-0"
                    :icon="MenuIcon"
                    :size="20"
                    :stroke-width="1.5"
                  />
                </HeaderButton>
              </DialogTrigger>
              <DialogPortal>
                <DialogContent
                  class="fixed inset-0 z-50 flex flex-col gap-10 bg-background p-4 font-sans data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
                >
                  <div class="flex items-center justify-between">
                    <DialogTitle class="text-foreground">menu</DialogTitle>
                    <DialogClose as-child>
                      <HeaderButton label="Close menu">
                        <HugeiconsIcon
                          class="size-5 shrink-0"
                          :icon="Cancel01Icon"
                          :size="20"
                          :stroke-width="1.5"
                        />
                      </HeaderButton>
                    </DialogClose>
                  </div>
                  <ul class="flex flex-col gap-6" role="list">
                    <li v-for="item in nav" :key="item.link">
                      <DialogClose as-child>
                        <a class="text-2xl text-foreground" :href="item.link">{{ item.text }}</a>
                      </DialogClose>
                    </li>
                    <li>
                      <a
                        class="text-2xl text-foreground"
                        href="https://github.com/dolusoft/mdxcn-vue"
                        rel="noreferrer"
                      >
                        github
                      </a>
                    </li>
                  </ul>
                </DialogContent>
              </DialogPortal>
            </DialogRoot>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
