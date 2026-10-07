import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// Keep fixtures outside the repository, under the authorized scratch directory.
// Resolve relative overrides against the repo, independent of the caller's cwd.
const scratch = resolve(repo, process.env.MDXCN_CONSUMER_DIR ?? '../tmp/mdxcn-vue')
mkdirSync(scratch, { recursive: true })
const root = mkdtempSync(join(scratch, 'consumer-'))
const pnpmCli = process.env.npm_execpath
assert.ok(pnpmCli, 'Run this script with pnpm consumer:check')
function run(args, cwd, capture = false, allowedStatuses = [0]) {
  // pnpm 12 can expose a native executable (Windows .exe / Linux no suffix).
  const native = !/\.[cm]?js$/i.test(pnpmCli)
  const result = spawnSync(
    native ? pnpmCli : process.execPath,
    native ? args : [pnpmCli, ...args],
    {
      cwd,
      encoding: 'utf8',
      timeout: 180_000,
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 16 * 1024 * 1024,
      env: { ...process.env, CI: 'true' },
    },
  )
  if (!capture || result.status !== 0) process.stdout.write(result.stdout ?? '')
  if (result.stderr) process.stderr.write(result.stderr)
  assert.ok(
    allowedStatuses.includes(result.status),
    `pnpm ${args.join(' ')} failed in ${cwd}: ${result.error ?? ''}`,
  )
  return result.stdout
}
function write(dir, path, value) {
  mkdirSync(dirname(join(dir, path)), { recursive: true })
  writeFileSync(join(dir, path), typeof value === 'string' ? value : JSON.stringify(value, null, 2))
}
function writeInstallPolicy(dir) {
  // Match the repository's exact Vite release-age exception in isolated fixtures.
  write(dir, 'pnpm-workspace.yaml', 'minimumReleaseAgeExclude:\n  - vite@8.3.3\n')
}
function files(dir, extension) {
  return readdirSync(dir, { recursive: true })
    .filter((name) => name.endsWith(extension))
    .map((name) => join(dir, name))
}
// Never pack stale dist files, even when this command is invoked alone.
run(['--filter', 'mdxcn-vue', '--filter', 'mdxcn-markdown', 'build'], repo)
run(['exec', 'node', 'scripts/tree-shaking-check.mjs'], repo)
// Attribute final, tree-shaken output spans to library sources rather than
// counting pre-tree-shake module metadata. Unmapped glue is excluded.
function mappedLibraryBytes(dir) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let bytes = 0
  for (const path of files(dir, '.js.map')) {
    const map = JSON.parse(readFileSync(path, 'utf8'))
    const lines = readFileSync(path.slice(0, -4), 'utf8').split('\n')
    let source = 0
    for (const [lineIndex, line] of map.mappings.split(';').entries()) {
      let column = 0
      const spans = []
      for (const segment of line.split(',').filter(Boolean)) {
        const fields = []
        let value = 0,
          shift = 0
        for (const char of segment) {
          const digit = alphabet.indexOf(char)
          assert.ok(digit >= 0, 'Invalid source-map VLQ')
          value += (digit & 31) * 2 ** shift
          if (digit & 32) {
            shift += 5
            continue
          }
          fields.push(value & 1 ? -Math.floor(value / 2) : Math.floor(value / 2))
          value = 0
          shift = 0
        }
        column += fields[0]
        if (fields.length > 1) source += fields[1]
        spans.push({ column, source: fields.length > 1 ? source : undefined })
      }
      const code = lines[lineIndex] ?? ''
      for (const [index, span] of spans.entries()) {
        if (
          span.source != null &&
          map.sources[span.source].includes('/node_modules/mdxcn-vue/dist/')
        )
          bytes += Buffer.byteLength(
            code.slice(span.column, spans[index + 1]?.column ?? code.length),
          )
      }
    }
  }
  return bytes
}
const mapControl = join(root, 'map-control')
write(mapControl, 'control.js', 'ğAxy')
write(mapControl, 'control.js.map', {
  sources: ['/node_modules/mdxcn-vue/dist/index.js', '/node_modules/vue/index.js'],
  mappings: 'AAAA,ECAA',
})
assert.equal(
  mappedLibraryBytes(mapControl),
  3,
  'Source-map attribution must count UTF-8 and exclude Vue',
)
const artifacts = join(root, 'artifacts')
mkdirSync(artifacts)
for (const name of ['mdxcn-vue', 'mdxcn-markdown']) {
  const cwd = join(repo, 'packages', name)
  const packed = Object.values(
    JSON.parse(run(['exec', 'npm', 'pack', '--dry-run', '--json'], cwd, true)),
  )[0]
  const names = packed.files.map((file) => file.path)
  for (const required of [
    'LICENSE',
    'README.md',
    'package.json',
    'dist/index.d.ts',
    'dist/index.js',
  ])
    assert.ok(names.includes(required), `${name}: missing ${required}`)
  assert.ok(
    names.every(
      (path) =>
        ['LICENSE', 'README.md', 'package.json'].includes(path) ||
        /^dist\/.*\.(?:js|ts|css)$/.test(path),
    ),
    `${name}: unexpected packed files`,
  )
  if (name === 'mdxcn-vue')
    for (const required of [
      'dist/core.js',
      'dist/core/index.d.ts',
      'dist/graph.css',
      'dist/host.css',
      'dist/theme.css',
    ])
      assert.ok(names.includes(required))
  assert.match(readFileSync(join(cwd, 'LICENSE'), 'utf8'), /Keshav Bagaade/)
  assert.match(readFileSync(join(cwd, 'README.md'), 'utf8'), /Keshav Bagaade/)
  run(['pack', '--out', join(artifacts, `${name}.tgz`)], cwd)
  const archive = spawnSync('tar', ['-tzf', join(artifacts, `${name}.tgz`)], {
    encoding: 'utf8',
  })
  assert.equal(archive.status, 0, `Cannot inspect ${name} tarball: ${archive.stderr}`)
  assert.deepEqual(
    archive.stdout
      .trim()
      .split(/\r?\n/)
      .map((path) => path.replace(/^package\//, ''))
      .sort(),
    [...names].sort(),
    `${name}: actual tarball differs from dry-run inventory`,
  )
  write(scratch, `${name}-pack-files.json`, packed)
  console.log(`TARBALL CONTENTS ${name}:\n${archive.stdout}`)
  console.log(`PACK ${name}: ${names.length} files, ${packed.size} bytes`)
}
const vueDist = join(repo, 'packages/mdxcn-vue/dist')
const libraryCode = files(vueDist, '.js')
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n')
assert.match(libraryCode, /from ["']vue["']/)
assert.doesNotMatch(libraryCode, /function createApp|function createRenderer|@vue\/runtime-core/)

const common = {
  vue: '3.5.43',
  vite: '8.3.3',
  '@vitejs/plugin-vue': '6.0.9',
  tailwindcss: '4.3.3',
  '@tailwindcss/vite': '4.3.3',
  typescript: '6.0.3',
  '@types/markdown-it': '14.2.0',
  'vue-tsc': '3.3.12',
}
const vueTar = `file:${join(artifacts, 'mdxcn-vue.tgz').replaceAll('\\', '/')}`
const markdownTar = `file:${join(artifacts, 'mdxcn-markdown.tgz').replaceAll('\\', '/')}`
const tsconfig = {
  compilerOptions: {
    target: 'ES2022',
    module: 'ESNext',
    moduleResolution: 'Bundler',
    strict: true,
    skipLibCheck: false,
    lib: ['ES2022', 'DOM'],
    types: ['vite/client'],
  },
  include: ['src/**/*.ts', 'src/**/*.vue'],
}
const css =
  '@import "tailwindcss";\n@import "mdxcn-vue/graph.css";\n@import "mdxcn-vue/host.css";\n@import "mdxcn-vue/theme.css";\n'
const viteConfig = `import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwind from '@tailwindcss/vite';
import {writeFileSync} from 'node:fs';
export default defineConfig({plugins:[vue(),tailwind(),{
  name:'consumer-modules', generateBundle(_options,bundle) {
    writeFileSync('modules.json',JSON.stringify([...this.getModuleIds()]));
    const rendered=Object.values(bundle).filter(chunk=>chunk.type==='chunk').flatMap(chunk=>Object.entries(chunk.modules).filter(([,module])=>module.renderedLength>0).map(([id])=>id));
    writeFileSync('rendered-modules.json',JSON.stringify(rendered));
  }
}],build:{minify:false,sourcemap:true}});
`
const app = join(root, 'vite-app')
write(app, 'package.json', {
  name: 'consumer-app',
  private: true,
  type: 'module',
  dependencies: {
    ...common,
    'mdxcn-vue': vueTar,
    'mdxcn-markdown': markdownTar,
    'markdown-it': '14.1.0',
    comark: '0.7.0',
    '@comark/vue': '0.7.0',
  },
})
write(app, 'tsconfig.json', tsconfig)
write(app, 'vite.config.ts', viteConfig)
write(
  app,
  'index.html',
  '<html><head></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>',
)
write(app, 'src/style.css', css)
const readme = readFileSync(join(repo, 'packages/mdxcn-vue/README.md'), 'utf8')
const example = readme.match(
  /<!-- consumer-example -->\s*```vue\r?\n([\s\S]*?)```\s*<!-- \/consumer-example -->/,
)
assert.ok(example, 'Missing runnable README example')
write(app, 'src/ReadmeExample.vue', example[1])
write(
  app,
  'src/App.vue',
  `<script setup lang="ts">
import {GraphUptime,GraphCountdown,GraphActivity,GraphCalendar,GraphCells,GraphMeter,GraphWaffle,Grid,GraphBars,GraphSpark,GraphPlot,GraphKpi,Series,GraphTree,GraphCheck,GraphFlow,Node,Task,Path,GraphSheet,GraphInvoice,Section,From,To,Meta,Item,Total,Faq,GraphBoard,GraphCompare,GraphMatrix,GraphHeatmap,Col,Row,GraphStack,GraphTable,Endpoint,GraphTimer,Callout,Quote,Terminal,Annotate,Env,Steps,Step,Changelog,Change,Decision,Chat,Keys,GraphTimeline,Event,GraphSpec,Field,GraphScore,GraphRank,GraphFunnel,Rank,Stage,GraphStat,GraphSlope,GraphBullet,Stat,Slope,Target,GraphGantt,GraphDiff,GraphWaterfall,Span,Line,Delta} from 'mdxcn-vue';
import {splitLabel} from 'mdxcn-vue/core';
import type {StackRow,TableModel} from 'mdxcn-vue/core';
const rows: StackRow[]=[{label:splitLabel('Web: 1 js').label,segments:[{label:'js',value:1}]}];
const table:TableModel={headers:['A'],rows:[['B']]};
</script><template><GraphUptime title="UPTIME" days="ok*2 down"/><GraphCountdown title="COUNTDOWN" to="2026-12-01"/><GraphActivity title="ACTIVITY" :days="[{date:'2026-03-01',count:2}]"/><GraphCalendar year="2024" month="2" marks="29"/><GraphCells title="CELLS"><Grid label="r" :cells="[[1,0]]"/></GraphCells><GraphMeter title="METER" value="67%"/><GraphWaffle title="WAFFLE" :value="0.5" cells="40" columns="8"/><GraphStack title="STACK" :rows="rows"/><GraphTable title="TABLE" v-bind="table"/><Endpoint/><GraphTimer title="TIMER" kind="clock"/><Callout type="warning"><p>Registry source</p></Callout><Quote by="Paul Graham" source="Taste for Makers"><p>Voices in tune.</p></Quote><Terminal :text="'$ run'"/><Annotate code="run // (1)" :notes="['One']"/><Env :vars="[{name:'A',value:'one',required:true}]"/><Steps><Step title="Install" state="now">Run.</Step></Steps><Changelog version="1"><Change type="add">New.</Change></Changelog><Decision :options="[{label:'Vue',state:'chosen'}]"/><Chat :turns="[{by:'you',children:'hello'}]"/><Keys :bindings="[{keys:'Ctrl+K',action:'search'}]"/><GraphTimeline title="T"><Event date="one">Event</Event></GraphTimeline><GraphSpec title="S"><Field label="One" accent>Value</Field></GraphSpec><GraphScore title="SCORE" :items="[{label:'Docs',value:2.5,max:5}]"/><GraphRank title="RANK"><Rank value="1,200">Docs</Rank></GraphRank><GraphFunnel title="FUNNEL"><Stage :value="860">Ship</Stage></GraphFunnel><GraphStat title="STAT"><Stat value="142ms" hint="−18ms" accent>read</Stat></GraphStat><GraphSlope title="SLOPE" from-label="before" to-label="after"><Slope from="1,200" to="1,400">read</Slope></GraphSlope><GraphBullet title="BULLET"><Target value="72" target="80" max="100">CPU</Target></GraphBullet><GraphGantt title="GANTT"><Span start="0.2" end="0.8" complete="0.5" accent>build</Span></GraphGantt><GraphDiff title="DIFF"><Line value="31 kb" sign="add">app</Line><Line value="103 kb" total>shipped</Line></GraphDiff><GraphWaterfall title="WATERFALL"><Delta value="48">Revenue</Delta><Delta value="-6" kind="out">Refunds</Delta><Delta value="42">Profit</Delta></GraphWaterfall><Faq :entries="[{question: 'consumer question', answer: 'consumer answer'}]"/><GraphBoard title="BOARD" :columns="[{title: 'Now', items: ['consumer task']}]"/><GraphCompare title="COMPARE"><Col>A</Col><Row label="r">yes</Row></GraphCompare><GraphMatrix title="MATRIX" columns="a" :rows="[{label: 'r', values: [1]}]"/><GraphHeatmap title="HEAT" columns="a" :rows="[{label: 'r', values: [1]}]"/><GraphSheet title="S"><Section title="C"><Row :cells="['A']"/></Section></GraphSheet><GraphInvoice title="I"><From name="F"/><To name="T"/><Meta label="No" value="1"/><Item amount="0">Free</Item><Total label="Due" value="0" accent/></GraphInvoice><GraphTree title="TREE"><Node label="root"><Node accent>leaf</Node></Node></GraphTree><GraphCheck title="CHECK"><Task done :items="[{label: 'sub', done: false}]">root</Task></GraphCheck><GraphFlow title="FLOW"><Path>write → <strong>ship</strong></Path></GraphFlow><GraphBars title="BARS"><Series label="before" values="1 2"/><Series label="after" :values="[2,3]" size="lg"/></GraphBars><GraphSpark title="SPARK" data="1 2" caption="consumer spark"/><GraphPlot title="PLOT" data="1 2"/><GraphKpi title="KPI" value="12" label="reads" data="1 2"/></template>`,
)
write(
  app,
  'src/main.ts',
  "import {createApp} from 'vue';import App from './App.vue';import ReadmeExample from './ReadmeExample.vue';import './style.css';createApp(App).mount('#app');createApp(ReadmeExample).mount(document.body.appendChild(document.createElement('div')));",
)
write(
  app,
  'src/type-contract.ts',
  `import {splitLabel} from 'mdxcn-vue/core';
import {createGraphComponents,graphComponents,coerceProps,GraphRow,PendingGraph,GRAPH_ADAPTERS,GraphStack} from 'mdxcn-vue';
import type {GraphComponentMap,GraphTag,GraphAdapter,NumericProps,FootnotesProps} from 'mdxcn-vue';
import {createGraphFilters, graphFilters, resolveGraphProps} from 'mdxcn-vue/knap';
import type {GraphFilterContext, GraphFilterName} from 'mdxcn-vue/knap';
const filterName:GraphFilterName='graph_meter';
const filterContext:GraphFilterContext={rawValue:{value:0.5},reportWarning(w){void w.code;}};
const footnotes:FootnotesProps={title:'Notes'};
void [createGraphFilters([filterName]),graphFilters.graph_meter('0.5',undefined,filterContext),resolveGraphProps('graph-meter','0.5',undefined),footnotes];
// @ts-expect-error Unknown filters must not enter a subset.
createGraphFilters(['graph_unknown']);
// @ts-expect-error Filter string input is required even when rawValue is supplied.
graphFilters.graph_meter(0.5);
// @ts-expect-error Footnotes title is a string.
footnotes.title=2;
const installed:GraphComponentMap={'graph-stack':GraphStack};
const tag:GraphTag='graph-stack';
const hints:GraphAdapter={numeric:['ticks'],required:['rows']};
const numeric:NumericProps=['ticks'];
void [createGraphComponents(installed),graphComponents,coerceProps({ticks:'24'},numeric),GraphRow,PendingGraph,GRAPH_ADAPTERS[tag],hints];
// @ts-expect-error Unknown graph names must not enter the allowlist.
const invalidGraph:GraphComponentMap={'graph-knap':GraphStack};
void invalidGraph;
import type {StackRow} from 'mdxcn-vue/core';
import type {GraphUptimeProps,GraphCountdownProps,GraphActivityProps,GraphCalendarProps,GraphCellsProps,GraphMeterProps,GraphWaffleProps,GraphPlotProps,GraphKpiProps,GraphBarsProps,GraphSparkProps,GraphTreeProps,GraphCheckProps,GraphFlowProps,GraphSheetProps,GraphInvoiceProps,FaqProps,GraphBoardProps,GraphCompareProps,GraphMatrixProps,GraphHeatmapProps,GraphStackProps,CalloutProps,QuoteProps,TerminalProps,AnnotateProps,EnvProps,StepsProps,StepProps,ChangelogProps,ChangeProps,DecisionProps,ChatProps,ChatTurn,KeysProps,KeyBinding,GraphTimelineProps,TimelineEvent,TimelineState,GraphSpecProps,SpecRow,GraphScoreProps,GraphRankProps,GraphFunnelProps,GraphStatProps,GraphSlopeProps,GraphBulletProps,GraphGanttProps,GraphDiffProps,GraphWaterfallProps} from 'mdxcn-vue';
import {mdxcnMarkdown,withMdxcn} from 'mdxcn-markdown';
import type {MdxcnOptions} from 'mdxcn-markdown';
import MarkdownIt from 'markdown-it';
const row:StackRow={label:splitLabel('Web: 1 js').label,segments:[{label:'js',value:1}]};
const graph:GraphStackProps={title:'STACK',rows:[row]};
const callout:CalloutProps={type:'warning'};
const quote:QuoteProps={by:'Paul Graham'};
const terminal:TerminalProps={text:'$ run',prompt:'$'};
const annotate:AnnotateProps={code:'run // (1)',notes:['One']};
const env:EnvProps={vars:[{name:'A',required:true}]};
const steps:StepsProps={title:'INSTALL'};
const step:StepProps={state:'now'};
const changelog:ChangelogProps={version:'1'};
const change:ChangeProps={type:'add'};
const decision:DecisionProps={options:[{label:'Vue',state:'chosen'}]};
const turn:ChatTurn={by:'you',children:'hello',aside:true};
const binding:KeyBinding={keys:'Ctrl+K',action:'search',accent:true};
const chat:ChatProps={turns:[turn]};
const keys:KeysProps={bindings:[binding]};
const state:TimelineState='now';
const event:TimelineEvent={date:'one',label:'event',state,note:'note'};
const specRow:SpecRow={label:'One',value:'Value',accent:true,note:'note'};
const timeline:GraphTimelineProps={title:'T',events:[event]};
const spec:GraphSpecProps={title:'S',rows:[specRow]};
const score:GraphScoreProps={title:'S',items:[{label:'Docs',value:2.5,max:5}]};
const stat:GraphStatProps={title:'T',items:[{value:'142ms',hint:'−18ms',accent:true}]};
const slope:GraphSlopeProps={title:'T',fromLabel:'before',toLabel:'after',items:[{from:'1,200',to:1400}]};
const bullet:GraphBulletProps={title:'T',items:[{value:72,target:'80',max:100}]};
void [stat,slope,bullet];
const gantt:GraphGanttProps={title:'G',items:[{start:'0.2',end:0.8,complete:0.5}],ticks:['mon','fri']};
const faq:FaqProps={entries:[{question:'Q',answer:'A',accent:true}]};
const bars:GraphBarsProps={title:'B',from:{label:'before',values:[1,2],size:'lg'}};
const plot:GraphPlotProps={title:'P',data:[1,2],variant:'line'};
const activity:GraphActivityProps={title:'A',days:[{date:'2024-02-29',count:1200}],weekStartsOn:1};
const uptime:GraphUptimeProps={title:'U',days:['ok','empty'],columns:'2'};
const countdown:GraphCountdownProps={title:'C',to:new Date(0),written:{label:'',rest:'caption'}};
// @ts-expect-error invalid status
const badUptime:GraphUptimeProps={title:'U',days:['bad']};
// @ts-expect-error invalid instant
const badCountdown:GraphCountdownProps={title:'C',to:[]};
const calendar:GraphCalendarProps={year:'2024',month:2,written:[{day:29,today:true}],marks:'29'};
// @ts-expect-error Activity counts must be numeric.
activity.days=[{date:'2024-02-29',count:'bad'}];
// @ts-expect-error Calendar year must be a number or string.
calendar.year=[];
// @ts-expect-error Calendar accent must be boolean.
calendar.marks=[{day:29,accent:'yes'}];
void [activity,calendar];
const cells:GraphCellsProps={title:'C',items:[{label:'r',cells:[[1,0]]}]};
const meter:GraphMeterProps={title:'M',value:'67%',ticks:'14'};
const waffle:GraphWaffleProps={title:'W',value:0.5,cells:'40',columns:8};
// @ts-expect-error Cells requires numeric grid values
cells.items=[{label:'r',cells:[['bad']]}];
// @ts-expect-error Meter value requires a number or string
meter.value=[];
// @ts-expect-error Waffle columns requires a number or string
waffle.columns=[];
const kpi:GraphKpiProps={title:'K',value:'12',label:'reads',data:[1,2]};
// @ts-expect-error Plot variant is closed.
const badPlot:GraphPlotProps={title:'P',variant:'bars'};
// @ts-expect-error KPI numbers must be numeric.
const badKpi:GraphKpiProps={title:'K',data:['bad']};
const spark:GraphSparkProps={title:'S',data:'1 2',written:{data:[3],labels:['Mon']}};
// @ts-expect-error size has a closed union
bars.from={label:'bad',values:[1],size:'huge'};
// @ts-expect-error data arrays must contain numbers
spark.data=['bad'];
void [bars,spark];
const tree:GraphTreeProps={title:'T',nodes:[{label:'root',children:[{label:'leaf'}]}]};
const check:GraphCheckProps={title:'C',items:[{done:true,items:[{label:'sub'}]}]};
const flow:GraphFlowProps={title:'F',rows:[{nodes:[{label:'ship',tone:'accent',stretch:true}]}]};
// @ts-expect-error only declared FlowTone values are valid
flow.rows=[{nodes:[{label:'invalid',tone:'bright'}]}];
// @ts-expect-error done is boolean
check.items=[{done:'true'}];
void [tree,check,flow];
const sheet:GraphSheetProps={title:'S',sections:[{title:'C',rows:[['A']]}]};
const invoice:GraphInvoiceProps={title:'I',items:[{description:'A',amount:'0'}]};
// @ts-expect-error Invoice amount is literal text, never a number
const badInvoice:GraphInvoiceProps={title:'I',items:[{description:'A',amount:0}]};
void [sheet,invoice,badInvoice];
const board:GraphBoardProps={title:'B',columns:[{title:'C',items:[{label:'L',state:'now'}]}]};
// @ts-expect-error FAQ accent is boolean.
faq.entries=[{question:'Q',accent:'yes'}];
// @ts-expect-error Board state is a closed union.
board.columns=[{title:'C',items:[{label:'L',state:'later'}]}];
const compare:GraphCompareProps={title:'C',columns:['a'],rows:[{label:'r',values:[true]}]};
const matrix:GraphMatrixProps={title:'M',columns:['a'],rows:[{label:'r',values:[1]}]};
const heat:GraphHeatmapProps={title:'H',columns:['a'],rows:[{label:'r',values:[1]}]};
void [compare,matrix,heat];
// @ts-expect-error compare cells must be boolean or string
compare.rows=[{label:'r',values:[1]}];
// @ts-expect-error matrix cells cannot be boolean
matrix.rows=[{label:'r',values:[true]}];
// @ts-expect-error heat cells must be numeric
heat.rows=[{label:'r',values:['1']}];
const diff:GraphDiffProps={title:'D',rows:[{value:'31 kb',sign:'add'}],footer:{value:'103 kb'}};
const waterfall:GraphWaterfallProps={title:'W',items:[{value:'-1,234.5',kind:'out'}]};
void [gantt,diff,waterfall];
// @ts-expect-error Gantt start must be a number or string.
gantt.items=[{start:true,end:1}];
// @ts-expect-error Diff sign must be a closed union.
diff.rows=[{value:'2',sign:'plus'}];
// @ts-expect-error Waterfall kind must be a closed union.
waterfall.items=[{value:2,kind:'total'}];
// @ts-expect-error Stat value must remain numeric or a string.
stat.items=[{value:true}];
// @ts-expect-error Slope values must remain numeric or strings.
slope.items=[{from:true,to:1}];
// @ts-expect-error Bullet targets must remain numeric or strings.
bullet.items=[{value:1,target:true}];
const rank:GraphRankProps={title:'R',items:[{label:'Docs',value:'1,200'}]};
const funnel:GraphFunnelProps={title:'F',steps:[{label:'Ship',value:860}]};
// @ts-expect-error Score value must remain numeric.
score.items=[{label:'Docs',value:'2'}];
// @ts-expect-error Rank label must remain a string.
rank.items=[{label:42,value:2}];
// @ts-expect-error Funnel value must be numeric or a string.
funnel.steps=[{value:true}];
// @ts-expect-error Date must remain a string.
event.date=42;
// @ts-expect-error State must remain a closed union.
timeline.events=[{date:'one',state:'later'}];
// @ts-expect-error Value must remain a string.
specRow.value=42;
// @ts-expect-error Accent must remain a boolean.
spec.rows=[{label:'One',accent:'yes'}];
// @ts-expect-error Speaker must remain a string.
turn.by=42;
// @ts-expect-error Aside must remain a boolean.
chat.turns=[{by:'you',aside:'yes'}];
// @ts-expect-error Action must remain a string.
binding.action=42;
// @ts-expect-error Accent must remain a boolean.
keys.bindings=[{keys:'K',action:'search',accent:'yes'}];
// @ts-expect-error Step state must remain a closed union.
step.state='unknown';
// @ts-expect-error Change type must remain a closed union.
change.type='unknown';
// @ts-expect-error Version must remain a string.
changelog.version=42;
// @ts-expect-error Decision states must remain a closed union.
decision.options=[{label:'Vue',state:'now'}];
// @ts-expect-error Steps title must remain a string.
steps.title=42;
// @ts-expect-error Code must remain a string.
annotate.code=42;
// @ts-expect-error Notes must remain an array.
annotate.notes='wrong';
// @ts-expect-error Required must remain a boolean.
env.vars=[{name:'A',required:'yes'}];
// @ts-expect-error Callout types must remain a closed union.
callout.type='unknown';
// @ts-expect-error Attribution must remain a string.
quote.by=42;
// @ts-expect-error Terminal text must not accept arrays.
terminal.text=[];
const options:MdxcnOptions={components:['Terminal']};
new MarkdownIt().use(mdxcnMarkdown).use(withMdxcn,options);
// @ts-expect-error Unknown fields must not silently become any.
row.nonexistent=1;
// @ts-expect-error The root entry must preserve prop types.
graph.rows='wrong';
// @ts-expect-error Markdown declarations must preserve component names.
options.components=['Missing'];
// @ts-expect-error Subpath functions must preserve their return types.
splitLabel('Web').nonexistent;
`,
)
write(app, 'tsconfig.nodenext.json', {
  compilerOptions: {
    ...tsconfig.compilerOptions,
    module: 'NodeNext',
    moduleResolution: 'NodeNext',
  },
  include: ['src/type-contract.ts'],
})
writeInstallPolicy(app)
run(['install'], app)
write(
  app,
  'comark-check.mjs',
  `import assert from 'node:assert/strict';
import {createSSRApp,h} from 'vue';import {renderToString} from 'vue/server-renderer';
import {parseMarkdown} from 'comark';import {MarkdownDocument} from '@comark/vue';
import {graphComponents} from 'mdxcn-vue';
const {graphFilters,createGraphFilters}=await import('mdxcn-vue/knap');
assert.equal(createGraphFilters(['graph_meter']).graph_meter,graphFilters.graph_meter);
assert.match(graphFilters.graph_meter('0.5','PACKED'),/50%/);
const value=await parseMarkdown(graphFilters.graph_meter(JSON.stringify({value:0.5,ticks:10,caption:'packed Comark'}),'comark'));
const html=await renderToString(createSSRApp({render:()=>h(MarkdownDocument,{value,components:graphComponents})}));
assert.match(html,/<figure\\b/);assert.match(html,/packed Comark/);assert.match(html,/50%/);
assert.doesNotMatch(html,/· · ·|<graph-meter\\b/);
console.log('COMARK PACKED CONSUMER PASSED: real parser and Vue renderer');`,
)
run(['exec', 'node', 'comark-check.mjs'], app)
run(['exec', 'tsc', '--noEmit', '-p', 'tsconfig.nodenext.json'], app)
console.log('TYPE CONTRACT PASSED: NodeNext, skipLibCheck=false; invalid fields rejected')
run(['exec', 'vue-tsc', '--noEmit'], app)
run(['exec', 'vite', 'build'], app)
const fullLibraryBytes = mappedLibraryBytes(join(app, 'dist/assets'))
const fullBytes = files(join(app, 'dist/assets'), '.js').reduce(
  (sum, path) => sum + Buffer.byteLength(readFileSync(path)),
  0,
)
const builtCss = files(join(app, 'dist/assets'), '.css')
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n')
for (const selector of [
  '.graph-frame',
  '.graph-scroll-x',
  '.text-graph-muted',
  '.grid-cols-',
  '.px-5',
])
  assert.ok(builtCss.includes(selector), `Missing ${selector}`)

// Negative control: without packaged @source, package-only utilities disappear.
const noSource = ['graph', 'host', 'theme']
  .map((name) =>
    readFileSync(join(vueDist, `${name}.css`), 'utf8')
      .replace(/@source[^;]+;/g, '')
      .replace(/@import\s+['"]\.\/(?:graph|host|theme)\.css['"];?/g, ''),
  )
  .join('\n')
write(app, 'src/no-source.css', '@import "tailwindcss" source(none);\n@source "./";\n' + noSource)
write(
  app,
  'src/main.ts',
  "import {createApp} from 'vue';import App from './App.vue';import './no-source.css';createApp(App).mount('#app');",
)
run(['exec', 'vite', 'build'], app)
const negativeCss = files(join(app, 'dist/assets'), '.css')
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n')
assert.ok(
  !negativeCss.includes('.px-5'),
  'Negative control unexpectedly generated package-only utilities',
)

// A separate JS-only build measures GraphStack without other component imports.
write(
  app,
  'src/main.ts',
  "import {createApp,h} from 'vue';import {GraphStack} from 'mdxcn-vue';createApp({render:()=>h(GraphStack,{title:'ONLY',rows:[{label:'Web',segments:[{value:1,label:'js'}]}]})}).mount('#app');",
)
run(['exec', 'vite', 'build'], app)
const stackBundle = files(join(app, 'dist/assets'), '.js')
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n')
assert.match(stackBundle, /GraphStack/)
assert.doesNotMatch(
  stackBundle,
  /GraphTable|Endpoint|Footnotes|coerceProps|PendingGraph|mdxcn-markdown|markdown-it|@comark|shiki|knap/,
)
const modules = JSON.parse(readFileSync(join(app, 'modules.json'), 'utf8'))
const vueEntries = modules.filter((id) =>
  /\/vue\/dist\/vue\.runtime\.esm-bundler\.js$/.test(id.replaceAll('\\', '/')),
)
assert.equal(vueEntries.length, 1, 'Expected exactly one Vue runtime entry')
// getModuleIds includes the root entry's print-adapter chunk even after it is discarded.
// Check emitted module bytes as well as the final JS, rather than parsed dependency IDs.
const renderedModules = JSON.parse(readFileSync(join(app, 'rendered-modules.json'), 'utf8'))
assert.ok(renderedModules.length > 0, 'Missing emitted module attribution')
assert.ok(!renderedModules.some((id) => /mdxcn-markdown|markdown-it|@comark|shiki|knap/.test(id)))
assert.ok(
  !modules.some((id) =>
    /mdxcn-markdown|markdown-it|@comark|shiki|[\\/]node_modules[\\/]knap[\\/]/.test(id),
  ),
)
const stackBytes = Buffer.byteLength(stackBundle)
assert.ok(
  stackBytes < fullBytes * 0.75,
  'GraphStack must be substantially smaller than the full consumer',
)
console.log(
  `TREE-SHAKE full=${fullBytes} bytes GraphStack=${stackBytes} bytes removed=${fullBytes - stackBytes} bytes; Vue runtime entries=${vueEntries.length}`,
)

const stackLibraryBytes = mappedLibraryBytes(join(app, 'dist/assets'))
assert.ok(fullLibraryBytes > stackLibraryBytes && stackLibraryBytes > 0)
console.log(
  `LIBRARY ONLY (source-map attribution, Vue excluded, minify=false): full=${fullLibraryBytes} bytes GraphStack=${stackLibraryBytes} bytes`,
)
write(
  app,
  'src/main.ts',
  "import {createApp,h} from 'vue';import {Footnotes} from 'mdxcn-vue';createApp({render:()=>h(Footnotes)}).mount('#app');",
)
run(['exec', 'vite', 'build'], app)
const footnotesBundle = files(join(app, 'dist/assets'), '.js')
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n')
assert.match(footnotesBundle, /Footnotes/)
assert.doesNotMatch(
  footnotesBundle,
  /GraphStack|coerceProps|PendingGraph|graphFilters|toComarkBlock/,
)
const footnotesBytes = Buffer.byteLength(footnotesBundle)
assert.ok(footnotesBytes < stackBytes, 'Footnotes must not retain graph drawing modules')
console.log(`TREE-SHAKE Footnotes=${footnotesBytes} bytes`)

const site = join(root, 'vitepress-site')
write(site, 'package.json', {
  name: 'consumer-site',
  private: true,
  type: 'module',
  dependencies: {
    ...common,
    'mdxcn-vue': vueTar,
    'mdxcn-markdown': markdownTar,
    'markdown-it': '14.1.0',
    vitepress: '2.0.0-alpha.20',
  },
})
write(
  site,
  '.vitepress/config.ts',
  `import {defineConfig} from 'vitepress';import {mdxcnMarkdown,withMdxcn} from 'mdxcn-markdown';import tailwind from '@tailwindcss/vite';
export default defineConfig({markdown:{config:(md)=>{md.use(mdxcnMarkdown,{warn:(w)=>{throw new Error(JSON.stringify(w))}});md.use(withMdxcn,{warn:(w)=>console.log('EXPECTED_FALLBACK '+w.component)});}},vite:{plugins:[tailwind()]}});`,
)
write(
  site,
  '.vitepress/theme/index.ts',
  `import DefaultTheme from 'vitepress/theme';import {GraphUptime,GraphCountdown,GraphActivity,GraphCalendar,GraphCells,GraphMeter,GraphWaffle,Grid,GraphBars,GraphSpark,GraphPlot,GraphKpi,Series,GraphTree,GraphCheck,GraphFlow,Node,Task,Path,GraphSheet,GraphInvoice,Section,From,To,Meta,Item,Total,Faq,GraphBoard,GraphCompare,GraphMatrix,GraphHeatmap,Col,Row,GraphStack,GraphTable,Endpoint} from 'mdxcn-vue';import './style.css';export default {...DefaultTheme,enhanceApp({app}) {app.component('GraphStack',GraphStack);app.component('GraphTable',GraphTable);app.component('Endpoint',Endpoint);}};`,
)
write(site, '.vitepress/theme/style.css', css)
write(
  site,
  'index.md',
  '# Consumer\n\n<GraphStack title="STACK">\n\n- Web: 1 js\n\n</GraphStack>\n\n<GraphTable title="TABLE">\n\n| A |\n| --- |\n| B |\n\n</GraphTable>\n\n<Endpoint title="API">\n\nPOST /consumer\n\n```json\n{}\n```\n\n</Endpoint>',
)
writeInstallPolicy(site)
run(['install'], site)
// pnpm 12.4.1 compares a tarball's file: locator instead of its manifest version.
// Accept only that exact diagnostic, after verifying the installed manifests.
const peerReport = JSON.parse(run(['peers', 'check', '--json'], site, true, [0, 1]))['.']
assert.deepEqual(peerReport.missing, {})
assert.deepEqual(peerReport.conflicts, [])
assert.deepEqual(peerReport.intersections, {})
const badPeers = peerReport.bad ?? {}
assert.ok(Object.keys(badPeers).every((name) => name === 'mdxcn-vue'))
for (const issue of badPeers['mdxcn-vue'] ?? []) {
  assert.equal(issue.wantedRange, '^0.1.0')
  assert.equal(issue.foundVersion, 'file:../artifacts/mdxcn-vue.tgz')
  assert.deepEqual(issue.parents, [{ name: 'mdxcn-markdown', version: '0.1.0' }])
  assert.equal(issue.optional, false)
}
const installedVue = JSON.parse(
  readFileSync(join(site, 'node_modules/mdxcn-vue/package.json'), 'utf8'),
)
const installedMarkdown = JSON.parse(
  readFileSync(join(site, 'node_modules/mdxcn-markdown/package.json'), 'utf8'),
)
assert.equal(installedVue.version, '0.1.0')
assert.equal(installedMarkdown.peerDependencies['mdxcn-vue'], '^0.1.0')
console.log(
  'PACKED PEERS PASSED: installed 0.1.0 satisfies ^0.1.0; pnpm file-locator diagnostic isolated',
)
write(
  site,
  'index.md',
  readFileSync(join(site, 'index.md'), 'utf8') +
    '\n\n> [!NOTE]\n> Upgrade body.\n\n> Quote body.\n> — Ada, Notes\n\n```console\n$ run\noutput\n```\n\nFoot[^1].\n\n[^1]: Note body.\n',
)
const siteOutput = run(['exec', 'vitepress', 'build'], site, true)
const fallbackNames = [...siteOutput.matchAll(/EXPECTED_FALLBACK (\w+)/g)]
  .map((match) => match[1])
  .sort()
assert.deepEqual(fallbackNames, ['Callout', 'Footnotes', 'Quote', 'Terminal'])
const html = readFileSync(join(site, '.vitepress/dist/index.html'), 'utf8')
assert.equal((html.match(/<figure\b/g) ?? []).length, 3)
for (const value of ['Web', 'B', '/consumer']) assert.ok(html.includes(value))
for (const value of [
  'custom-block github-alert',
  'data-mdxcn="Quote"',
  'Quote body.',
  '$ run',
  'id="footnote1"',
  'href="#footnote-ref1"',
])
  assert.ok(html.includes(value), `Missing upgrade fallback ${value}`)
assert.doesNotMatch(html, /<(?:Faq|GraphBoard|Callout|Quote|Terminal|Footnotes)\b/)
console.log('VITEPRESS CONSUMER PASSED: 3 compiled figures, 4 warned native upgrade fallbacks')

// The same packed packages must render registered upgrades as real Vue figures.
write(
  site,
  'index.md',
  readFileSync(join(site, 'index.md'), 'utf8') +
    '\n\n<Annotate>\n\n```python\nrun() # (1)\n```\n\n1. One **note**.\n\n</Annotate>\n\n<Env>\n\n```bash\n# Required.\nCONSUMER_KEY=one\n```\n\n</Env>\n\n<Steps>\n\n1. Copy — Run the CLI.\n2. **Register**\n\n</Steps>\n\n<Changelog version="1">\n\n- added: Vue state lists\n\n</Changelog>\n\n<Decision>\n\n- **Vue** — typed components\n\nKeep rich `prose`.\n\n</Decision>\n\n<Chat>\n\n- you: consumer hello\n- agent: *consumer aside*\n\n</Chat>\n\n<Keys>\n\n- **Ctrl+K: consumer search**\n\n</Keys>\n\n<GraphTimeline title="TIMELINE">\n\n- **14:02: consumer event** — consumer note\n\n</GraphTimeline>\n\n<GraphSpec title="SPEC">\n\n- Path: `consumer/code`\n\n  consumer spec note\n\n</GraphSpec>\n\n<GraphScore title="SCORE">\n\n- Docs: 2.5/5\n\n</GraphScore>\n\n<GraphRank title="RANK">\n\n- 1,200 docs\n\n</GraphRank>\n\n<GraphFunnel title="FUNNEL">\n\n- 1,200 docs\n- 860 ship\n\n</GraphFunnel>\n\n<GraphStat title="STAT">\n\n- **142ms read — −18ms**\n\n</GraphStat>\n\n<GraphSlope title="SLOPE" fromLabel="before" toLabel="after">\n\n- read: 1,200 → 1,400\n\n</GraphSlope>\n\n<GraphBullet title="BULLET">\n\n- CPU: 72 / 80 of 100\n\n</GraphBullet>\n\n<GraphGantt title="GANTT">\n\n- build: 0.2 0.8 0.5\n\n</GraphGantt>\n\n<GraphDiff title="DIFF">\n\n- config: ~~old.js~~ new.ts\n- **shipped: 103 kb**\n\n</GraphDiff>\n\n<GraphWaterfall title="WATERFALL">\n\n- Revenue: 48\n- Refunds: -6\n- Profit: 42\n\n</GraphWaterfall>\n',
)
write(
  site,
  '.vitepress/config.ts',
  readFileSync(join(site, '.vitepress/config.ts'), 'utf8').replace(
    'md.use(withMdxcn,{warn:',
    "md.use(withMdxcn,{components:['Callout','Quote','Terminal','Footnotes'],warn:",
  ),
)
write(
  site,
  '.vitepress/theme/index.ts',
  `import DefaultTheme from 'vitepress/theme';import {GraphUptime,GraphCountdown,GraphActivity,GraphCalendar,GraphCells,GraphMeter,GraphWaffle,Grid,GraphBars,GraphSpark,GraphPlot,GraphKpi,Series,GraphTree,GraphCheck,GraphFlow,Node,Task,Path,GraphSheet,GraphInvoice,Section,From,To,Meta,Item,Total,Faq,GraphBoard,GraphCompare,GraphMatrix,GraphHeatmap,Col,Row,GraphStack,GraphTable,Endpoint,Footnotes,Callout,Quote,Terminal,Annotate,Env,Steps,Step,Changelog,Change,Decision,Chat,Keys,GraphTimeline,Event,GraphSpec,Field,GraphScore,GraphRank,GraphFunnel,Rank,Stage,GraphStat,GraphSlope,GraphBullet,Stat,Slope,Target,GraphGantt,GraphDiff,GraphWaterfall,Span,Line,Delta} from 'mdxcn-vue';import './style.css';export default {...DefaultTheme,enhanceApp({app}) {for(const [name,component] of Object.entries({GraphUptime,GraphCountdown,GraphActivity,GraphCalendar,GraphCells,GraphMeter,GraphWaffle,Grid,GraphBars,GraphSpark,GraphPlot,GraphKpi,Series,GraphTree,GraphCheck,GraphFlow,Node,Task,Path,GraphSheet,GraphInvoice,Section,From,To,Meta,Item,Total,Faq,GraphBoard,GraphCompare,GraphMatrix,GraphHeatmap,Col,Row,GraphStack,GraphTable,Endpoint,Footnotes,Callout,Quote,Terminal,Annotate,Env,Steps,Step,Changelog,Change,Decision,Chat,Keys,GraphTimeline,Event,GraphSpec,Field,GraphScore,GraphRank,GraphFunnel,Rank,Stage,GraphStat,GraphSlope,GraphBullet,Stat,Slope,Target,GraphGantt,GraphDiff,GraphWaterfall,Span,Line,Delta}))app.component(name,component);}};`,
)
write(
  site,
  'index.md',
  readFileSync(join(site, 'index.md'), 'utf8') +
    '\n\n<Faq>\n\n### consumer question\n\nconsumer answer\n\n</Faq>\n\n<GraphBoard title="BOARD">\n\n### Now\n- **consumer task**\n\n</GraphBoard>\n\n<GraphCompare title="COMPARE">\n\n| | A |\n| --- | --- |\n| r | yes |\n\n</GraphCompare>\n\n<GraphMatrix title="MATRIX">\n\n| | A |\n| --- | --- |\n| r | 1 |\n\n</GraphMatrix>\n\n<GraphHeatmap title="HEAT">\n\n| | A |\n| --- | --- |\n| r | 1 |\n\n</GraphHeatmap>\n\n<GraphSheet title="SHEET">\n\n### Section\n\n| A | B |\n| --- | --- |\n| Free | 0 |\n\n</GraphSheet>\n\n<GraphInvoice title="INVOICE" from="Studio">\n\n| Description | Amount |\n| --- | --- |\n| Free | 0 |\n\n**Due** 0\n\n</GraphInvoice>\n',
)
write(
  site,
  'index.md',
  readFileSync(join(site, 'index.md'), 'utf8') +
    '\n\n<GraphTree title="TREE">\n\n- root\n  - **consumer leaf** — ui\n\n</GraphTree>\n\n<GraphCheck title="CHECK">\n\n- [x] consumer parent\n  - [ ] consumer subtask\n\n</GraphCheck>\n\n<GraphFlow title="FLOW">\n\nwrite → **consumer ship**\n\n</GraphFlow>\n\n<GraphBars title="BARS">\n\n- before: 1 2\n- **after**: 2 3\n\n</GraphBars>\n\n<GraphSpark title="SPARK">\n\n1 2 — consumer spark\n\n</GraphSpark>\n\n<GraphPlot title="PLOT">\n\n- Mon: 1\n- Tue: 2\n\n</GraphPlot>\n\n<GraphKpi title="KPI">\n\n12 reads — +2\n\n1 2\n\n</GraphKpi>\n\n<GraphCells title="CELLS">\n\n- consumer grid: 1 0 / 0 1\n\n</GraphCells>\n\n<GraphMeter title="METER">\n\n67% — consumer meter\n\n</GraphMeter>\n\n<GraphWaffle title="WAFFLE">\n\n73% — consumer waffle\n\n</GraphWaffle>\n\n<GraphActivity title="ACTIVITY">\n\n- 2026-03-01: 1 2\n\n</GraphActivity>\n\n<GraphCalendar year="2024" month="2">\n\n- **29**: leap\n\n</GraphCalendar>\n\n<GraphUptime title="UPTIME">\n\nok*2 down\n\n</GraphUptime>\n\n<GraphCountdown title="COUNTDOWN">\n\n2026-12-01 — consumer countdown\n\n</GraphCountdown>\n',
)
const registeredOutput = run(['exec', 'vitepress', 'build'], site, true)
assert.deepEqual(
  [...registeredOutput.matchAll(/EXPECTED_FALLBACK (\w+)/g)].map((match) => match[1]),
  [],
)
const registeredHtml = readFileSync(join(site, '.vitepress/dist/index.html'), 'utf8')
assert.equal((registeredHtml.match(/<figure\b/g) ?? []).length, 46)
for (const value of [
  'consumer spark',
  'Sparkline with 2 points. consumer spark',
  'consumer question',
  'consumer answer',
  'consumer task',
  'Now: 1. 1 items.',
  'consumer event',
  'consumer note',
  '<code>consumer/code</code>',
  'consumer spec note',
  'consumer hello',
  '<em>consumer aside</em>',
  'consumer search',
  'Ctrl+K',
  'role="note"',
  '[ note ]',
  '<cite class="text-foreground not-italic">Ada</cite>',
  'Quote body.',
  '[ shell ]',
  '>run</span>',
  '>output</span>',
  'id="footnote1"',
  '[ python ]',
  '>run()</span>',
  '>One <strong>note</strong>.</div>',
  '>01</span>',
  '>Register</p>',
  '>added</span>',
  'Vue state lists',
  'Chose Vue over 0 other options.',
  '<code>prose</code>',
  '142ms',
  '−18ms',
  'read from 1,200 to 1,400',
  'CPU 72 / 80',
  'Docs 2.5 of 5',
  'docs 1,200',
  '>72%</span>',
  'CONSUMER_KEY',
  ' (required)</span>',
])
  assert.ok(registeredHtml.includes(value), `Missing registered upgrade ${value}`)
assert.doesNotMatch(
  registeredHtml,
  /<(?:GraphUptime|GraphCountdown|GraphActivity|GraphCalendar|GraphCells|GraphMeter|GraphWaffle|Grid|GraphBars|GraphSpark|GraphPlot|GraphKpi|Series|Callout|Quote|Terminal|Footnotes|Annotate|Env|Steps|Step|Changelog|Change|Decision|Chat|Keys|GraphTimeline|Event|GraphSpec|Field|GraphScore|GraphRank|GraphFunnel|Rank|Stage|GraphStat|GraphSlope|GraphBullet|Stat|Slope|Target|GraphCompare|GraphMatrix|GraphHeatmap|Col|Row|GraphGantt|GraphDiff|GraphWaterfall|Span|Line|Delta)\b/,
)
console.log(
  'REGISTERED VITEPRESS CONSUMER PASSED: 46 figures, Callout/Quote/Terminal/Annotate/Env/Steps/Changelog/Decision/Chat/Keys/GraphTimeline/GraphSpec/GraphScore/GraphRank/GraphFunnel/GraphBars/GraphSpark rendered; Footnotes IDs and backlinks preserved',
)

// Install generated registry payloads with the real CLI, without a server.
run(['registry:check'], repo)
const registry = join(root, 'registry-app')
write(registry, 'package.json', {
  name: 'consumer-registry',
  private: true,
  type: 'module',
  packageManager: 'pnpm@12.4.1',
  dependencies: { ...common, 'shadcn-vue': '2.8.2' },
})
write(registry, 'tsconfig.json', {
  ...tsconfig,
  compilerOptions: { ...tsconfig.compilerOptions, paths: { '@/*': ['./src/*'] } },
})
write(registry, 'vite.config.ts', viteConfig)
write(registry, 'index.html', readFileSync(join(app, 'index.html'), 'utf8'))
write(registry, 'components.json', {
  $schema: 'https://shadcn-vue.com/schema.json',
  style: 'new-york',
  typescript: true,
  tailwind: { config: '', css: 'src/style.css', baseColor: 'neutral', cssVariables: true },
  aliases: {
    components: '@/components',
    ui: '@/components/ui',
    utils: '@/lib/utils',
    lib: '@/lib',
    composables: '@/composables',
  },
})
write(
  registry,
  'src/style.css',
  '@import "tailwindcss";\n@import "./components/mdxcn/styles/graph.css";\n@import "./components/mdxcn/styles/host.css";\n@import "./components/mdxcn/styles/theme.css";\n',
)
write(
  registry,
  'src/main.ts',
  "import {createApp} from 'vue';import App from './App.vue';import './style.css';createApp(App).mount('#app');",
)
const registryApp = readFileSync(join(app, 'src/App.vue'), 'utf8')
  .replace(
    '<script setup lang="ts">',
    `<script setup lang="ts">
import {Footnotes} from './components/mdxcn/components/footnotes';
import {graphFilters} from './components/mdxcn/knap/graph-knap';
const printed=graphFilters.graph_meter('0.5','REGISTRY');`,
  )
  .replace(
    '<template>',
    '<template><pre>{{printed}}</pre><Footnotes><ol><li id="registry-note">Registry note <a href="#registry-ref">Back</a></li></ol></Footnotes>',
  )
  .replace(
    "import {GraphUptime,GraphCountdown,GraphActivity,GraphCalendar,GraphCells,GraphMeter,GraphWaffle,Grid,GraphBars,GraphSpark,GraphPlot,GraphKpi,Series,GraphTree,GraphCheck,GraphFlow,Node,Task,Path,GraphSheet,GraphInvoice,Section,From,To,Meta,Item,Total,Faq,GraphBoard,GraphCompare,GraphMatrix,GraphHeatmap,Col,Row,GraphStack,GraphTable,Endpoint,GraphTimer,Callout,Quote,Terminal,Annotate,Env,Steps,Step,Changelog,Change,Decision,Chat,Keys,GraphTimeline,Event,GraphSpec,Field,GraphScore,GraphRank,GraphFunnel,Rank,Stage,GraphStat,GraphSlope,GraphBullet,Stat,Slope,Target,GraphGantt,GraphDiff,GraphWaterfall,Span,Line,Delta} from 'mdxcn-vue';",
    "import {GraphUptime} from './components/mdxcn/components/graph-uptime';import {GraphCountdown} from './components/mdxcn/components/graph-countdown';import {GraphActivity} from './components/mdxcn/components/graph-activity';import {GraphCalendar} from './components/mdxcn/components/graph-calendar';import {GraphCells,Grid} from './components/mdxcn/components/graph-cells';import {GraphMeter} from './components/mdxcn/components/graph-meter';import {GraphWaffle} from './components/mdxcn/components/graph-waffle';import {GraphBars,Series} from './components/mdxcn/components/graph-bars';import {GraphSpark} from './components/mdxcn/components/graph-spark';import {GraphPlot} from './components/mdxcn/components/graph-plot';import {GraphKpi} from './components/mdxcn/components/graph-kpi';import {GraphTree,Node} from './components/mdxcn/components/graph-tree';import {GraphCheck,Task} from './components/mdxcn/components/graph-check';import {GraphFlow,Path} from './components/mdxcn/components/graph-flow';import {GraphSheet} from './components/mdxcn/components/graph-sheet';import {GraphInvoice} from './components/mdxcn/components/graph-invoice';import {Section,From,To,Meta,Item,Total} from './components/mdxcn/adapters/sheet-invoice';import {Faq} from './components/mdxcn/components/faq';import {GraphBoard} from './components/mdxcn/components/graph-board';import {GraphCompare,Col} from './components/mdxcn/components/graph-compare';import {GraphMatrix} from './components/mdxcn/components/graph-matrix';import {GraphHeatmap} from './components/mdxcn/components/graph-heatmap';import {Row} from './components/mdxcn/adapters/table';import {GraphStack} from './components/mdxcn/components/graph-stack';import {GraphTable} from './components/mdxcn/components/graph-table';import {Endpoint} from './components/mdxcn/components/endpoint';import {GraphTimer} from './components/mdxcn/components/graph-timer';import {Callout} from './components/mdxcn/components/callout';import {Quote} from './components/mdxcn/components/quote';import {Terminal} from './components/mdxcn/components/terminal';import {Annotate} from './components/mdxcn/components/annotate';import {Env} from './components/mdxcn/components/env';import {Steps,Step} from './components/mdxcn/components/steps';import {Changelog,Change} from './components/mdxcn/components/changelog';import {Decision} from './components/mdxcn/components/decision';import {Chat} from './components/mdxcn/components/chat';import {Keys} from './components/mdxcn/components/keys';import {GraphTimeline,Event} from './components/mdxcn/components/graph-timeline';import {GraphSpec,Field} from './components/mdxcn/components/graph-spec';import {GraphScore} from './components/mdxcn/components/graph-score';import {GraphRank,Rank} from './components/mdxcn/components/graph-rank';import {GraphFunnel,Stage} from './components/mdxcn/components/graph-funnel';import {GraphStat,Stat} from './components/mdxcn/components/graph-stat';import {GraphSlope,Slope} from './components/mdxcn/components/graph-slope';import {GraphBullet,Target} from './components/mdxcn/components/graph-bullet';import {GraphGantt,Span} from './components/mdxcn/components/graph-gantt';import {GraphDiff,Line} from './components/mdxcn/components/graph-diff';import {GraphWaterfall,Delta} from './components/mdxcn/components/graph-waterfall';",
  )
  .replaceAll("'mdxcn-vue/core'", "'./components/mdxcn/core'")
write(registry, 'src/App.vue', registryApp)
writeInstallPolicy(registry)
run(['install'], registry)
const cliOutput = join(root, 'registry-build')
run(
  ['exec', 'shadcn-vue', 'build', 'registry.json', '--cwd', repo, '--output', cliOutput],
  registry,
)
run(['exec', 'node', 'scripts/registry-build.mjs', '--check', '--from-cli', cliOutput], repo)
console.log('REGISTRY CLI BUILD PASSED: real source index and normalized payload parity')
const registryPaths = files(join(repo, 'public/r'), '.json').sort()
const localItems = registryPaths.map((path) => {
  const target = `registry-input/${basename(path)}`
  write(registry, target, readFileSync(path, 'utf8'))
  return `./${target}`
})
const registryInstall = run(['exec', 'shadcn-vue', 'add', ...localItems], registry, true)
assert.doesNotMatch(
  registryInstall,
  /overwrite.*(?:CSS|variables)|Would you like|Do you want|Continue\?|\(y\/N\)/i,
)
console.log('REGISTRY PROMPT CHECK PASSED: closed stdin, no --yes or --overwrite')
const copied = new Set()
for (const path of registryPaths) {
  const item = JSON.parse(readFileSync(path, 'utf8'))
  assert.match(item.meta.notice, /Keshav Bagaade/)
  for (const file of item.files) {
    assert.match(file.content, /Keshav Bagaade/)
    assert.equal(
      readFileSync(join(registry, file.target.replace(/^~\//, '')), 'utf8').replaceAll(
        '\r\n',
        '\n',
      ),
      file.content,
      `Registry CLI changed ${file.target}`,
    )
    copied.add(file.target)
  }
}
run(['exec', 'vue-tsc', '--noEmit'], registry)
run(['exec', 'vite', 'build'], registry)
const registryCss = files(join(registry, 'dist/assets'), '.css')
  .map((path) => readFileSync(path, 'utf8'))
  .join('\n')
for (const selector of ['.graph-frame', '.px-5', '.text-graph-muted'])
  assert.ok(registryCss.includes(selector))
console.log(
  `REGISTRY INSTALL PASSED: shadcn-vue 2.8.2, ${registryPaths.length} items, ${copied.size} source files; typecheck and build passed`,
)
const results = {
  fullBytes,
  stackBytes,
  footnotesBytes,
  removedBytes: fullBytes - stackBytes,
  fullLibraryBytes,
  stackLibraryBytes,
  vueRuntimeEntries: vueEntries.length,
  vitepressFigures: 3,
  registeredVitepressFigures: 46,
  upgradeFallbacks: fallbackNames,
  registryItems: registryPaths.length,
  registryFiles: copied.size,
}
const resultsPath = resolve(scratch, 'consumer-results.json')
writeFileSync(resultsPath, JSON.stringify(results, null, 2))
// Only remove the newly-created fixture, never the override directory itself.
assert.equal(dirname(root), scratch)
assert.ok(basename(root).startsWith('consumer-'))
rmSync(root, { recursive: true, force: true })
console.log(`CONSUMER CHECK PASSED; fixture removed; results: ${resultsPath}`)
