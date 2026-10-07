<script setup lang="ts">
import { ref } from 'vue'
import { withBase } from 'vitepress'
import {
  Faq,
  GraphActivity,
  GraphBars,
  GraphCalendar,
  GraphHeatmap,
  GraphKpi,
  GraphMeter,
  GraphTable,
  GraphUptime,
} from 'mdxcn-vue'
import { data } from '../home.data'
import { bars, meter, table } from '../home-examples'
import HomeCopy from './HomeCopy.vue'
import HomeFigure from './HomeFigure.vue'

const install = 'npm install mdxcn-vue@^0.1.1 mdxcn-markdown@^0.1.1 vue@^3.5.0 markdown-it@^14'
const accent = ref('mint')
const accents = ['theme', 'mint', 'orange', 'green', 'cyan', 'blue', 'violet', 'pink', 'sunset']
// Fixed example data keeps SSR and hydration identical.
const activity = Array.from({ length: 91 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 6, 1 + index)).toISOString().slice(0, 10),
  count: [0, 1, 3, 7, 12, 0, 2][index % 7]!,
}))
const uptime = Array.from({ length: 60 }, (_, index) =>
  index === 22 ? ('down' as const) : index === 23 ? ('degraded' as const) : ('ok' as const),
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
  <main class="mdxcn-home" :data-accent="accent">
    <section class="home-hero" aria-labelledby="home-title">
      <p class="home-eyebrow">mdxcn / vue 3</p>
      <h1 id="home-title">markdown-friendly<br />components for vue</h1>
      <p class="home-lead">
        Callouts, timelines, tables and charts drawn with text. Bring them to Vue and VitePress,
        then carry the same data into a README or a pull request.
      </p>
      <div class="home-install">
        <pre><code>{{ install }}</code></pre>
        <HomeCopy :text="install" label="Copy npm install command" />
      </div>
      <div class="home-links">
        <a :href="withBase('/components/graph-stack')">browse components ↗</a
        ><a href="https://github.com/dolusoft/mdxcn-vue#shadcn-vue-registry"
          >copy sources with shadcn-vue ↗</a
        >
      </div>
    </section>

    <section class="home-section" aria-labelledby="palette-title">
      <h2 id="palette-title">pick a palette, copy the component</h2>
      <p>
        Text glyphs, your theme tokens, one shared frame. Try an accent, then explore a component.
        All figures below use populated example datasets.
      </p>
      <div class="home-palettes" role="group" aria-label="Graph accent">
        <button
          v-for="color in accents"
          :key="color"
          type="button"
          :data-accent="color"
          :aria-pressed="accent === color"
          @click="accent = color"
        >
          <span class="home-swatch" aria-hidden="true"></span>{{ color }}
        </button>
      </div>
      <GraphActivity
        title="COMMITS"
        :days="activity"
        palette="multi"
        caption="Example activity · Jul–Sep 2026"
      />
      <div class="home-grid">
        <GraphMeter v-bind="meter" palette="duo" />
        <GraphBars v-bind="bars" palette="duo" />
        <GraphCalendar
          title="OCT 2026 · EXAMPLE"
          :year="2026"
          :month="10"
          :today="7"
          :marks="[
            { day: 12, label: 'Documentation' },
            { day: 18, label: 'Release review' },
          ]"
          palette="duo"
        />
        <GraphUptime title="API" :days="uptime" from="sample 1" to="sample 60" palette="duo" />
        <GraphHeatmap
          title="DEPLOYS"
          :columns="['0', '4', '8', '12', '16', '20']"
          :rows="[
            { label: 'Mon', values: [0, 1, 4, 8, 6, 1] },
            { label: 'Tue', values: [0, 0, 5, 9, 4, 2] },
            { label: 'Wed', values: [1, 0, 6, 12, 5, 1] },
          ]"
          palette="multi"
        />
        <GraphKpi
          title="READS"
          value="12,400"
          hint="+18%"
          label="example week"
          :data="[4, 5, 5, 6, 8, 7, 9, 8, 11, 10, 12, 14]"
          palette="duo"
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
.mdxcn-home h1 {
  font-size: clamp(2rem, 5.5vw, 4.5rem);
  font-weight: 500;
  line-height: 1.12;
  letter-spacing: -0.055em;
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
.home-tabs button,
.home-palettes button {
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
.home-palettes,
.home-links,
.home-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.home-palettes {
  margin-bottom: 32px;
}
.home-palettes button {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.home-swatch {
  width: 10px;
  height: 10px;
  background: var(--graph-accent);
  border-radius: 50%;
}
.home-palettes [aria-pressed='true'],
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
