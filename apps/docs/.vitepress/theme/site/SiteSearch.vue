<script setup lang="ts">
// Replaces the default theme's `VPLocalSearchBox.vue` (aliased in `config.ts`).
// VitePress still builds the index and opens this box on Ctrl/Cmd+K; the box
// itself is shadcn `Dialog` + `Command`, drawn like a graph frame.
import localSearchIndex from '@localSearchIndex'
import { computedAsync, watchDebounced } from '@vueuse/core'
import MiniSearch, { type SearchResult } from 'minisearch'
import { ListboxFilter } from 'reka-ui'
import { useData, useRouter, withBase } from 'vitepress'
import { computed, markRaw, ref, shallowRef } from 'vue'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import SiteCorners from './SiteCorners.vue'

const emit = defineEmits<{ close: [] }>()

const { localeIndex, theme } = useData()
const router = useRouter()

type Hit = { id: string; title: string; titles: string[] }
type Row = { id: string; title: string; trail: string }
type Group = { heading: string; rows: Row[] }

const index = computedAsync(async () => {
  const load = localSearchIndex[localeIndex.value] ?? localSearchIndex.root
  const json = (await load?.())?.default
  if (!json) return null
  return markRaw(
    MiniSearch.loadJSON<Hit>(json, {
      fields: ['title', 'titles', 'text'],
      storeFields: ['title', 'titles'],
      searchOptions: { fuzzy: 0.2, prefix: true, boost: { title: 4, text: 2, titles: 1 } },
    }),
  )
}, null)

const query = ref('')
const hits = shallowRef<(SearchResult & Hit)[]>([])
watchDebounced(
  [query, index],
  ([value, mini]) => {
    hits.value = value.trim() && mini ? (mini.search(value.trim()).slice(0, 24) as never) : []
  },
  { debounce: 80, immediate: true },
)

// Results are grouped by page: the first heading of a hit's path names the page.
const results = computed<Group[]>(() => {
  const groups = new Map<string, Row[]>()
  for (const hit of hits.value) {
    const [page = hit.title, ...rest] = hit.titles
    const heading = hit.titles.length ? page : hit.title
    const trail = (hit.titles.length ? rest : []).join(' / ')
    groups.set(heading, [...(groups.get(heading) ?? []), { id: hit.id, title: hit.title, trail }])
  }
  return [...groups].map(([heading, rows]) => ({ heading, rows }))
})

// With no query the box doubles as a jump list: top navigation, then the sidebar.
const shortcuts = computed<Group[]>(() => {
  const nav = (theme.value.nav ?? []).flatMap((item: { text?: string; link?: string }) =>
    item.text && item.link ? [{ id: item.link, title: item.text, trail: '' }] : [],
  )
  const sidebar = (
    Array.isArray(theme.value.sidebar) ? theme.value.sidebar : []
  ).flatMap((group: { text?: string; items?: { text?: string; link?: string }[] }) => ({
    heading: (group.text ?? 'pages').toLowerCase(),
    rows: (group.items ?? []).flatMap((item) =>
      item.text && item.link ? [{ id: item.link, title: item.text, trail: '' }] : [],
    ),
  }))
  return [{ heading: 'jump to', rows: nav }, ...sidebar]
})

const groups = computed(() => (query.value.trim() ? results.value : shortcuts.value))
const count = computed(() => groups.value.reduce((sum, group) => sum + group.rows.length, 0))

const terms = computed(() =>
  query.value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
)
function marks(text: string) {
  if (!terms.value.length) return [{ text, hit: false }]
  const source = terms.value.join('|')
  const whole = new RegExp(`^(?:${source})$`, 'i')
  return text
    .split(new RegExp(`(${source})`, 'gi'))
    .filter(Boolean)
    .map((part) => ({ text: part, hit: whole.test(part) }))
}

// Enter with no highlighted row opens the best match.
function openFirst(event: KeyboardEvent) {
  const target = event.currentTarget as HTMLElement
  const list = target.closest('[data-slot=dialog-content]')
  const first = groups.value[0]?.rows[0]
  if (first && !list?.querySelector('[data-highlighted]')) go(first.id)
}

function go(id: string) {
  emit('close')
  void router.go(withBase(id))
}
</script>

<template>
  <Dialog default-open @update:open="(open) => !open && emit('close')">
    <DialogContent
      class="graph-frame top-[12vh] isolate flex max-h-[76vh] w-[calc(100%-2rem)] max-w-2xl! translate-y-0 flex-col gap-0 overflow-visible bg-background p-0 font-mono text-sm ring-0"
      :show-close-button="false"
    >
      <SiteCorners tone="frame" />
      <DialogTitle
        class="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 bg-background px-2.5 text-sm font-normal tracking-wide whitespace-nowrap uppercase"
      >
        <span class="text-graph-accent">[ search ]</span>
      </DialogTitle>
      <DialogDescription class="sr-only">
        Search the documentation. Use the arrow keys to move and Enter to open a result.
      </DialogDescription>

      <Command class="min-h-0 bg-transparent" :model-value="''">
        <label class="flex items-center gap-3 px-5 pt-6 pb-4">
          <span aria-hidden="true" class="text-graph-accent select-none">&gt;</span>
          <ListboxFilter
            v-model="query"
            aria-label="Search"
            auto-focus
            class="min-w-0 flex-1 bg-transparent text-foreground caret-graph-accent outline-none placeholder:text-muted-foreground"
            placeholder="graph, palette, comark…"
            @keydown.enter="openFirst"
          />
          <span class="text-xs text-muted-foreground tabular-nums">
            [ {{ String(count).padStart(2, '0') }} ]
          </span>
        </label>
        <span aria-hidden="true" class="mx-5 block h-px site-rule" />

        <CommandList class="max-h-none min-h-0 flex-1 overflow-y-auto px-3 py-3 [scrollbar-color:var(--graph-frame)_transparent] [scrollbar-width:thin]">
          <p
            v-if="query.trim() && !index"
            class="px-2 py-6 text-center text-muted-foreground"
          >
            loading index…
          </p>
          <p v-else-if="!count" class="px-2 py-6 text-center text-muted-foreground">
            [ no match for “<span class="text-foreground">{{ query.trim() }}</span>” ]
          </p>
          <CommandGroup
            v-for="group in groups"
            :key="group.heading"
            class="mb-2 last:mb-0 **:data-[slot=command-group-heading]:px-2 **:data-[slot=command-group-heading]:py-1.5 **:data-[slot=command-group-heading]:text-xs **:data-[slot=command-group-heading]:text-muted-foreground"
            :heading="group.heading"
          >
            <CommandItem
              v-for="(row, position) in group.rows"
              :key="row.id"
              class="group/row gap-3 px-2 py-1.5 text-sm data-highlighted:bg-muted"
              :value="row.id"
              @select="go(row.id)"
            >
              <span aria-hidden="true" class="text-graph-frame select-none">
                {{ position === group.rows.length - 1 ? '└─' : '├─' }}
              </span>
              <span class="min-w-0 truncate text-foreground">
                <template v-for="(part, key) in marks(row.title)" :key="key">
                  <mark v-if="part.hit" class="bg-transparent text-graph-accent">{{ part.text }}</mark>
                  <template v-else>{{ part.text }}</template>
                </template>
              </span>
              <span v-if="row.trail" class="min-w-0 truncate text-xs text-muted-foreground">
                {{ row.trail }}
              </span>
              <span
                aria-hidden="true"
                class="ml-auto text-graph-accent opacity-0 group-data-highlighted/row:opacity-100"
              >
                ↵
              </span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>

      <span aria-hidden="true" class="mx-5 block h-px site-rule" />
      <p class="flex items-center gap-4 px-5 py-3 text-xs text-muted-foreground select-none">
        <span><kbd class="text-foreground">↑↓</kbd> move</span>
        <span><kbd class="text-foreground">↵</kbd> open</span>
        <span><kbd class="text-foreground">esc</kbd> close</span>
        <span class="ml-auto max-sm:hidden">mdxcn-vue</span>
      </p>
    </DialogContent>
  </Dialog>
</template>
