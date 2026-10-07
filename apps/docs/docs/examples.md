# examples

Short write-ups with two graphs each. A refactor, an incident, a tradeoff, a
pull request. Each graph has its own page with its props.

<p class="example-index">
  <a href="#refactor">refactor</a>
  <a href="#incident">incident</a>
  <a href="#pick-one">pick one</a>
  <a href="#pull-request">pull request</a>
  <a href="#this-week">this week</a>
  <a href="#migration">migration</a>
  <a href="./dashboards">dashboards</a>
</p>

<Callout type="tip">

Every figure below is written in plain Markdown inside the component tag. Paste
the same body into a README and it still reads as a list.

</Callout>

## refactor

You're moving auth checks out of handlers. Show the request path first, then
the work in order, with the current week marked.

<GraphFlow title="AUTH">

request → handler → *session util*

request → **middleware** → handler

</GraphFlow>

<p class="example-caption"><a href="./graph-flow">flow</a> · request path</p>

<GraphTimeline title="PLAN">

- w1: extract session helper
- **w2: move checks to middleware**
- *w3: delete the old util*

</GraphTimeline>

<p class="example-caption"><a href="./graph-timeline">timeline</a> · rollout plan</p>

```md
<GraphFlow title="AUTH">

request → handler → *session util*

request → **middleware** → handler

</GraphFlow>

<GraphTimeline title="PLAN">

- w1: extract session helper
- **w2: move checks to middleware**
- *w3: delete the old util*

</GraphTimeline>
```

## incident

p95 crossed the line, you rolled back a flag, and the postmortem is still open.
The strip is the two days people felt it.

<GraphTimeline title="INCIDENT">

- 14:02: p95 crossed 800ms
- **14:11: rolled back the cache flag**
- *14:40: write the postmortem*

</GraphTimeline>

<p class="example-caption"><a href="./graph-timeline">timeline</a> · timeline</p>

<GraphUptime :title='"API"' :from='"Aug 14"' :to='"Aug 27"'>

ok*5 degraded ok*2 down*2 ok*4

</GraphUptime>

<p class="example-caption"><a href="./graph-uptime">uptime</a> · uptime strip</p>

```md
<GraphTimeline title="INCIDENT">

- 14:02: p95 crossed 800ms
- **14:11: rolled back the cache flag**
- *14:40: write the postmortem*

</GraphTimeline>

<GraphUptime :title='"API"' :from='"Aug 14"' :to='"Aug 27"'>

ok*5 degraded ok*2 down*2 ok*4

</GraphUptime>
```

## pick one

You're choosing a queue. Checks and dashes first. Bundle size only if that's
part of the argument.

<GraphCompare title="QUEUE" accent="BullMQ">

| | BullMQ | SQS |
| --- | --- | --- |
| in-process | yes | no |
| retries | yes | yes |
| ops | redis | aws |
| local | yes | no |

</GraphCompare>

<p class="example-caption"><a href="./graph-compare">compare</a> · feature matrix</p>

<GraphRank title="INSTALL">

- 48 bullmq
- 31 ioredis
- 120 aws sdk

</GraphRank>

<p class="example-caption"><a href="./graph-rank">rank</a> · bundle size</p>

```md
<GraphCompare title="QUEUE" accent="BullMQ">

| | BullMQ | SQS |
| --- | --- | --- |
| in-process | yes | no |
| retries | yes | yes |
| ops | redis | aws |
| local | yes | no |

</GraphCompare>

<GraphRank title="INSTALL">

- 48 bullmq
- 31 ioredis
- 120 aws sdk

</GraphRank>
```

## pull request

A review comment with a file list and a coverage slope. The reader shouldn't
have to open the diff to get the shape.

<GraphDiff title="FILES" palette="duo">

- auth.ts: +new
- session.ts: moved
- legacy-auth.ts: -gone

</GraphDiff>

<p class="example-caption"><a href="./graph-diff">diff</a> · files changed</p>

<GraphSlope title="COVERAGE" fromLabel="main" toLabel="this pr">

- auth: 41 → 88
- billing: 72 → 74
- docs: 11 → 40

</GraphSlope>

<p class="example-caption"><a href="./graph-slope">slope</a> · coverage</p>

```md
<GraphDiff title="FILES" palette="duo">

- auth.ts: +new
- session.ts: moved
- legacy-auth.ts: -gone

</GraphDiff>

<GraphSlope title="COVERAGE" fromLabel="main" toLabel="this pr">

- auth: 41 → 88
- billing: 72 → 74
- docs: 11 → 40

</GraphSlope>
```

## this week

Monday stand-up. The track is the calendar. The numbers are what's in review,
blocked, and already shipped.

<GraphGantt title="THIS WEEK" :columns="20" :ticks="['mon', 'wed', 'fri']" stage="patch">

- rfc: 0 0.4 1
- **patch**: 0.35 0.8 0.55
- review: 0.7 1 0

</GraphGantt>

<p class="example-caption"><a href="./graph-gantt">gantt</a> · calendar</p>

<GraphStat title="BOARD">

- 4 in review
- 2 blocked
- **9 shipped**

</GraphStat>

<p class="example-caption"><a href="./graph-stat">stat</a> · board counts</p>

```md
<GraphGantt title="THIS WEEK" :columns="20" :ticks="['mon', 'wed', 'fri']" stage="patch">

- rfc: 0 0.4 1
- **patch**: 0.35 0.8 0.55
- review: 0.7 1 0

</GraphGantt>

<GraphStat title="BOARD">

- 4 in review
- 2 blocked
- **9 shipped**

</GraphStat>
```

## migration

A backfill that's still running. The fill is the share. The figure is the row
count, with the last points of the job underneath.

<GraphMeter title="ROWS">

67% — users table

</GraphMeter>

<p class="example-caption"><a href="./graph-meter">meter</a> · job progress</p>

<GraphKpi title="MIGRATED">

**1.2M** of 1.8M rows — 67%

2 3 3 5 8 9 11 12 14 16 18 21

</GraphKpi>

<p class="example-caption"><a href="./graph-kpi">kpi</a> · rows migrated</p>

```md
<GraphMeter title="ROWS">

67% — users table

</GraphMeter>

<GraphKpi title="MIGRATED">

**1.2M** of 1.8M rows — 67%

2 3 3 5 8 9 11 12 14 16 18 21

</GraphKpi>
```
