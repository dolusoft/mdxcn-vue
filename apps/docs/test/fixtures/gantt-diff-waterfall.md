# Gantt, diff and waterfall fixtures

<GraphGantt title="LAUNCH" stage="build" :progress="0.58" :ticks="['q1','q2','q3','q4']">

- design: 0 0.35 1
- **build**: 0.2 0.75 0.55
- docs: 0.55 0.9 0.2
- ship: 0.85 1

</GraphGantt>

<GraphGantt title="LAUNCH" stage="build" :progress="0.58" :ticks="['q1','q2','q3','q4']">
<ul>
<li>design: 0 0.35 1</li>
<li><strong>build</strong>: 0.2 0.75 0.55</li>
<li>docs: 0.55 0.9 0.2</li>
<li>ship: 0.85 1</li>
</ul>
</GraphGantt>

<GraphGantt title="LAUNCH" stage="build" :progress="0.58" :ticks="['q1','q2','q3','q4']" :items='[{"label":"design","start":0,"end":0.35,"complete":1},{"label":"build","start":0.2,"end":0.75,"complete":0.55,"accent":true},{"label":"docs","start":0.55,"end":0.9,"complete":0.2},{"label":"ship","start":0.85,"end":1}]' />

<GraphGantt title="LAUNCH" stage="build" :progress="0.58" :ticks="['q1','q2','q3','q4']">
<Span label="design" :start="0" :end="0.35" :complete="1" />
<Span label="build" :start="0.2" :end="0.75" :complete="0.55" accent />
<Span label="docs" :start="0.55" :end="0.9" :complete="0.2" />
<Span label="ship" :start="0.85" :end="1" />
</GraphGantt>

<GraphGantt title="THIS WEEK" :columns="20" :ticks="['mon','wed','fri']">

- **rfc**: 0 0.4
- patch: 0.35 0.8
- review: 0.7 1

</GraphGantt>

<GraphGantt title="THIS WEEK" :columns="20" :ticks="['mon','wed','fri']">
<ul>
<li><strong>rfc</strong>: 0 0.4</li>
<li>patch: 0.35 0.8</li>
<li>review: 0.7 1</li>
</ul>
</GraphGantt>

<GraphGantt title="THIS WEEK" :columns="20" :ticks="['mon','wed','fri']" :items='[{"label":"rfc","start":0,"end":0.4,"accent":true},{"label":"patch","start":0.35,"end":0.8},{"label":"review","start":0.7,"end":1}]' />

<GraphGantt title="THIS WEEK" :columns="20" :ticks="['mon','wed','fri']">
<Span label="rfc" :start="0" :end="0.4" accent />
<Span label="patch" :start="0.35" :end="0.8" />
<Span label="review" :start="0.7" :end="1" />
</GraphGantt>

<GraphDiff title="BUNDLE" palette="duo">

- vendor: 84 kb
- app: +31 kb
- sourcemaps: -12 kb
- **shipped: 103 kb**

</GraphDiff>

<GraphDiff title="BUNDLE" palette="duo">
<ul>
<li>vendor: 84 kb</li>
<li>app: +31 kb</li>
<li>sourcemaps: -12 kb</li>
<li><strong>shipped: 103 kb</strong></li>
</ul>
</GraphDiff>

<GraphDiff title="BUNDLE" palette="duo" :rows='[{"label":"vendor","value":"84 kb"},{"label":"app","value":"31 kb","sign":"add"},{"label":"sourcemaps","value":"12 kb","sign":"remove"}]' :footer='{"label":"shipped","value":"103 kb"}' />

<GraphDiff title="BUNDLE" palette="duo">
<Line label="vendor" value="84 kb" />
<Line label="app" value="31 kb" sign="add" />
<Line label="sourcemaps" value="12 kb" sign="remove" />
<Line label="shipped" value="103 kb" total />
</GraphDiff>

<GraphDiff title="HEADCOUNT">

- start: 12
- hired: +3
- left: -1
- **now: 14**

</GraphDiff>

<GraphDiff title="HEADCOUNT">
<ul>
<li>start: 12</li>
<li>hired: +3</li>
<li>left: -1</li>
<li><strong>now: 14</strong></li>
</ul>
</GraphDiff>

<GraphDiff title="HEADCOUNT" :rows='[{"label":"start","value":"12"},{"label":"hired","value":"3","sign":"add"},{"label":"left","value":"1","sign":"remove"}]' :footer='{"label":"now","value":"14"}' />

<GraphDiff title="HEADCOUNT">
<Line label="start" value="12" />
<Line label="hired" value="3" sign="add" />
<Line label="left" value="1" sign="remove" />
<Line label="now" value="14" total />
</GraphDiff>

<GraphDiff title="MIGRATION">

- config: ~~next.config.js~~ next.config.ts
- middleware: ~~middleware.ts~~ proxy.ts
- app: +31 kb

</GraphDiff>

<GraphDiff title="MIGRATION">
<ul>
<li>config: <del>next.config.js</del> next.config.ts</li>
<li>middleware: <del>middleware.ts</del> proxy.ts</li>
<li>app: +31 kb</li>
</ul>
</GraphDiff>

<GraphDiff title="MIGRATION" :rows='[{"label":"config: next.config.js","value":"","sign":"remove"},{"label":"config: next.config.ts","value":"","sign":"add"},{"label":"middleware: middleware.ts","value":"","sign":"remove"},{"label":"middleware: proxy.ts","value":"","sign":"add"},{"label":"app","value":"31 kb","sign":"add"}]' />

<GraphDiff title="MIGRATION">
<Line label="config: next.config.js" value="" sign="remove" />
<Line label="config: next.config.ts" value="" sign="add" />
<Line label="middleware: middleware.ts" value="" sign="remove" />
<Line label="middleware: proxy.ts" value="" sign="add" />
<Line label="app" value="31 kb" sign="add" />
</GraphDiff>

<GraphWaterfall title="MARGIN" palette="duo">

- Revenue: 48
- Refunds: -6
- Hosting: -4
- Profit: 38

</GraphWaterfall>

<GraphWaterfall title="MARGIN" palette="duo">
<ul>
<li>Revenue: 48</li>
<li>Refunds: -6</li>
<li>Hosting: -4</li>
<li>Profit: 38</li>
</ul>
</GraphWaterfall>

<GraphWaterfall title="MARGIN" palette="duo" :items='[{"label":"Revenue","value":48},{"label":"Refunds","value":-6},{"label":"Hosting","value":-4},{"label":"Profit","value":38}]' />

<GraphWaterfall title="MARGIN" palette="duo">
<Delta label="Revenue" :value="48" />
<Delta label="Refunds" :value="-6" />
<Delta label="Hosting" :value="-4" />
<Delta label="Profit" :value="38" />
</GraphWaterfall>

<GraphWaterfall title="TEAM">

- Start: 12
- Hired: 4
- Left: -2
- Now: 14

</GraphWaterfall>

<GraphWaterfall title="TEAM">
<ul>
<li>Start: 12</li>
<li>Hired: 4</li>
<li>Left: -2</li>
<li>Now: 14</li>
</ul>
</GraphWaterfall>

<GraphWaterfall title="TEAM" :items='[{"label":"Start","value":12},{"label":"Hired","value":4},{"label":"Left","value":-2},{"label":"Now","value":14}]' />

<GraphWaterfall title="TEAM">
<Delta label="Start" :value="12" />
<Delta label="Hired" :value="4" />
<Delta label="Left" :value="-2" />
<Delta label="Now" :value="14" />
</GraphWaterfall>
