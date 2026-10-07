<script setup lang="ts">
import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ref } from 'vue'
import { withBase } from 'vitepress'
import {
  Faq,
  GraphActivity,
  GraphBullet,
  GraphBars,
  GraphCalendar,
  GraphHeatmap,
  GraphKpi,
  GraphMeter,
  GraphRank,
  GraphTable,
  GraphTimer,
  GraphUptime,
  GraphWaterfall,
} from 'mdxcn-vue'
import { data } from '../home.data'
import { bars, meter, table } from '../home-examples'
import HomeFigure from './HomeFigure.vue'
import { useAccent } from './accent'
import AccentPicker from './site/AccentPicker.vue'
import SiteCorners from './site/SiteCorners.vue'

const install = 'npm install mdxcn-vue mdxcn-markdown'
const copied = ref(false)
async function copyInstall() {
  await navigator.clipboard.writeText(install)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
const accent = useAccent()
// Same fixed datasets as mdxcn `components/site/home-graph-demos.tsx`, so SSR and hydration match.
function activityDays(start: string, length: number) {
  const [year, month, day] = start.split('-').map(Number) as [number, number, number]
  const origin = Date.UTC(year, month - 1, day)
  return Array.from({ length }, (_, index) => {
    const time = origin + index * 86_400_000
    const date = new Date(time).toISOString().slice(0, 10)
    const dow = new Date(time).getUTCDay()
    const week = Math.floor(index / 7)
    let count = 0
    if (dow > 0 && dow < 6) {
      const pulse = (week + dow) % 9
      count =
        pulse === 0 ? 12 : pulse === 4 ? 7 : pulse % 3 === 0 ? 3 : index % 5 === 0 ? 1 : 0
    } else if (index % 13 === 0) {
      count = 2
    }
    return { date, count }
  })
}
const commits = activityDays('2025-09-01', 371)
const uptime = Array.from({ length: 90 }, (_, index) =>
  index === 41 || index === 42
    ? ('down' as const)
    : index === 18 || index === 60 || index === 61
      ? ('degraded' as const)
      : ('ok' as const),
)
const questions = [
  {
    question: 'what is mdxcn-vue?',
    answer:
      'A Vue 3 port of mdxcn: 46 components for graphs, tables and prose, drawn with text glyphs. MIT licensed, with the upstream attribution preserved.',
    accent: true,
  },
  {
    question: 'where can i use it?',
    answer:
      'Use imported Vue components in a Vue app or VitePress. mdxcn-markdown compiles trusted repository Markdown into component props. Comark is an optional runtime host.',
  },
  {
    question: 'how do i install a component?',
    answer:
      'Install mdxcn-vue from npm. Use Tailwind v4 to process graph.css, host.css and the optional theme.css. Node 22.18 or newer and Vue 3.5 are required. For copied sources, use shadcn-vue add with the local public/r/mdxcn-*.json files and the CSS registry item; see the repository README.',
  },
  {
    question: 'can i paste the same figure into a README?',
    answer:
      'Yes. The mdxcn-vue/knap entry exports graph_* filters that generate fenced ASCII Markdown from data. 39 ASCII drawers are available; the remaining graphs emit Comark blocks. The examples above use the actual filters at build time.',
  },
  {
    question: 'does the port include the upstream API or agent skill?',
    answer:
      'The Vue port provides components, a Markdown compiler, Comark adapters and Knap filters. It does not provide the upstream developer API, agent skill or React/MDX runtime.',
  },
]
</script>

<template>
  <main class="mdxcn-home">
    <section class="home-hero" aria-labelledby="home-title">
      <p class="home-eyebrow">mdxcn / vue 3</p>
      <h1
        id="home-title"
        class="font-sans text-4xl font-medium tracking-tighter text-balance sm:text-5xl md:text-6xl lg:text-7xl"
      >
        markdown-friendly components for vue
      </h1>
      <p
        class="max-w-[56ch] font-sans text-base leading-relaxed text-pretty text-foreground/85 sm:text-[1.0625rem]"
      >
        callouts, timelines, tables and charts drawn with text. bring them to vue and vitepress,
        then carry the same data into a readme or a pull request.
      </p>
      <div class="mt-4 flex w-full max-w-xl sm:mt-6">
        <button
          :aria-label="copied ? 'copied' : 'copy install command'"
          class="graph-frame relative isolate flex min-w-0 flex-1 items-center gap-2 px-3 text-left font-mono text-sm text-muted-foreground hover:bg-muted/40"
          type="button"
          @click="copyInstall"
        >
          <SiteCorners tone="frame" />
          <pre class="min-w-0 flex-1 overflow-x-auto py-3"><code>{{ install }}</code></pre>
          <HugeiconsIcon
            class="pointer-events-none size-4 shrink-0"
            :icon="copied ? Tick02Icon : Copy01Icon"
            :size="16"
            :stroke-width="1.5"
          />
        </button>
      </div>
      <div class="home-links">
        <a :href="withBase('/docs/graph-stack')">browse components ↗</a
        ><a href="https://github.com/dolusoft/mdxcn-vue#shadcn-vue-registry"
          >copy sources with shadcn-vue ↗</a
        >
      </div>
    </section>

    <section class="home-section flex flex-col gap-8 font-sans" aria-labelledby="palette-title">
      <div class="flex flex-col gap-4">
        <h2
          id="palette-title"
          class="m-0! max-w-[35ch] font-sans text-2xl! font-semibold tracking-tight! text-balance"
        >
          pick a palette, copy the component
        </h2>
        <p class="max-w-[56ch] leading-relaxed text-pretty text-foreground/88">
          every graph uses text glyphs, your theme tokens, and one shared frame. try an accent
          below, then copy the component you need.
        </p>
      </div>
      <AccentPicker v-model="accent" />
      <GraphActivity :days="commits" palette="multi" title="COMMITS" />
      <div class="grid gap-8 lg:grid-cols-2">
        <GraphWaterfall
          :items="[
            { label: 'Revenue', value: 48 },
            { label: 'Refunds', value: -6 },
            { label: 'Hosting', value: -4 },
            { label: 'Profit', value: 38 },
          ]"
          palette="duo"
          :ticks="18"
          title="MARGIN"
        />
        <GraphBullet
          :items="[
            { label: 'CPU', value: 72, target: 80, max: 100 },
            { label: 'RAM', value: 34, target: 64, max: 100 },
            { label: 'SSD', value: 91, target: 90, max: 100 },
          ]"
          palette="duo"
          title="LOAD"
        />
      </div>
      <div class="grid gap-8 lg:grid-cols-2">
        <GraphCalendar :marks="[12, 18]" :month="8" palette="duo" :today="27" :year="2026" />
        <GraphUptime :days="uptime" from="Jun 1" palette="duo" title="API" to="Aug 29" />
      </div>
      <div class="grid gap-8 lg:grid-cols-2">
        <GraphHeatmap
          :columns="['0', '4', '8', '12', '16', '20']"
          palette="multi"
          :rows="[
            { label: 'Mon', values: [0, 1, 4, 8, 6, 1] },
            { label: 'Tue', values: [0, 0, 5, 9, 4, 2] },
            { label: 'Wed', values: [1, 0, 6, 12, 5, 1] },
            { label: 'Thu', values: [0, 2, 4, 7, 8, 3] },
            { label: 'Fri', values: [0, 1, 3, 5, 2, 0] },
          ]"
          title="DEPLOYS"
        />
        <GraphRank
          :items="[
            { label: '/docs', value: 12400 },
            { label: '/install', value: 4100 },
            { label: '/plot', value: 860 },
            { label: '/rank', value: 420 },
          ]"
          palette="duo"
          title="ROUTES"
        />
      </div>
      <div class="grid gap-8 lg:grid-cols-2">
        <GraphKpi
          :data="[4, 5, 5, 6, 8, 7, 9, 8, 11, 10, 12, 14]"
          hint="+18%"
          label="this week"
          palette="duo"
          title="READS"
          value="12,400"
        />
        <GraphTimer
          at="2026-08-01T00:00:00Z"
          caption="api"
          kind="elapsed"
          palette="duo"
          title="UPTIME"
        />
      </div>
    </section>
    <section class="home-section" aria-labelledby="formats-title">
      <h2 id="formats-title">one figure, two formats</h2>
      <p>
        A live Vue component beside portable ASCII Markdown, generated from the same props with
        <a :href="withBase('/docs/knap')">Knap filters</a>. Switch formats and copy the drawing into
        your prose.
      </p>
      <div class="home-grid">
        <HomeFigure id="shipped" title="SHIPPED" :markdown="data.meter"
          ><GraphMeter v-bind="meter" palette="duo"
        /></HomeFigure>
        <HomeFigure id="bundle" title="BUNDLE" :markdown="data.table"
          ><GraphTable v-bind="table" palette="duo"
        /></HomeFigure>
        <HomeFigure id="reads" title="READS" :markdown="data.bars"
          ><GraphBars v-bind="bars" palette="duo"
        /></HomeFigure>
      </div>
    </section>

    <section class="home-section home-questions" aria-labelledby="questions-title">
      <div>
        <h2 id="questions-title">questions</h2>
        <p>What you install, where it works, and how the Vue port fits your Markdown workflow.</p>
      </div>
      <Faq title="FAQ" :entries="questions" palette="duo" />
    </section>

    <footer class="home-footer">
      <a :href="withBase('/')">mdxcn-vue</a>
      <div class="home-links">
        <a href="https://github.com/dolusoft/mdxcn-vue">GitHub</a
        ><a href="https://www.npmjs.com/package/mdxcn-vue">npm / vue</a
        ><a href="https://www.npmjs.com/package/mdxcn-markdown">npm / markdown</a
        ><a href="https://www.mdxcn.dev/">upstream mdxcn</a
        ><a href="https://github.com/dolusoft/mdxcn-vue/blob/main/LICENSE">MIT</a>
      </div>
      <p>mdxcn by Keshav Bagaade. Vue port by Dolusoft.</p>
    </footer>
  </main>
</template>

<style>
.mdxcn-home {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
  color: var(--vp-c-text-1);
  font-family: var(--font-mono);
}
.mdxcn-home h2 {
  font-size: clamp(1.3rem, 3vw, 1.75rem);
  line-height: 1.3;
  letter-spacing: -0.04em;
  margin-bottom: 16px;
}
.mdxcn-home p {
  line-height: 1.8;
}
.mdxcn-home a {
  text-decoration: underline;
  text-underline-offset: 4px;
}
.home-hero {
  padding: 96px 0 80px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}
.home-eyebrow {
  color: var(--vp-c-text-2);
  font-size: 12px;
  letter-spacing: 0.15em;
}
.home-lead {
  max-width: 680px;
  color: var(--vp-c-text-2);
}
.home-install {
  width: 100%;
  max-width: 800px;
  border: 1px dashed var(--vp-c-divider);
  padding: 20px;
  text-align: left;
}
.home-install pre,
.home-markdown {
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.65;
}
.home-copy {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 12px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}
.home-copy button,
.home-tabs button {
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 8px 12px;
  min-height: 40px;
}
.mdxcn-home button {
  cursor: pointer;
}
.mdxcn-home button:focus-visible,
.mdxcn-home a:focus-visible,
.mdxcn-home [tabindex]:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}
.home-section {
  border-top: 1px dashed var(--vp-c-divider);
  padding: 56px 0;
}
.home-section > p {
  max-width: 760px;
  color: var(--vp-c-text-2);
  margin-bottom: 28px;
}
.home-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
  margin-top: 28px;
}
.home-grid > *,
.home-questions > *,
.home-figure > div {
  min-width: 0;
}
.home-links,
.home-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.home-tabs [aria-selected='true'] {
  border-color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}
.home-tabs {
  margin-bottom: 16px;
  font-size: 12px;
}
.home-markdown {
  padding: 20px;
  border: 1px dashed var(--vp-c-divider);
  min-height: 170px;
}
.home-questions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 40px;
}
.home-footer {
  border-top: 1px dashed var(--vp-c-divider);
  padding: 32px 0 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-size: 12px;
}
.home-footer p {
  color: var(--vp-c-text-2);
}
@media (max-width: 720px) {
  .home-grid,
  .home-questions {
    grid-template-columns: minmax(0, 1fr);
  }
  .mdxcn-home {
    padding: 0 16px;
  }
  .home-hero {
    padding: 56px 0;
  }
  .home-section {
    padding: 40px 0;
  }
}
@media (max-width: 380px) {
  .mdxcn-home .graph-frame {
    font-size: 12px;
  }
}
</style>
