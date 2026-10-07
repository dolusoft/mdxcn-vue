# dashboards

Small product screens, from full tiles down to single-line rows. Every figure
is plain Markdown in a CSS grid or table, and the products are made up.

## lumen · site analytics

A small analytics product for a docs site. The top row is the week at a glance;
the bottom row says where readers came from and where they left.

<div class="dashboard-grid dashboard-mini">

<GraphKpi title="LIVE">

**214** now — +9

8 9 12 10 14 13 17 19

</GraphKpi>

<GraphSpark title="PAGEVIEWS">

3 4 4 6 5 7 8 9 — up all week

</GraphSpark>

<GraphMeter title="SEARCH">

41% — found from search

</GraphMeter>

<GraphKpi title="READ TIME" value="3m 12s" label="per visit" hint="+14s" data="5 5 6 6 7 6 7 8" />

</div>

<div class="dashboard-grid">

<GraphKpi title="VISITORS">

**48,210** this week — +12%

31 34 33 38 41 39 44 47 45 49 52 55

</GraphKpi>

<GraphKpi title="BOUNCE">

**38%** of sessions — −4 pts

46 45 44 44 42 41 41 40 39 39 38 38

</GraphKpi>

<GraphPlot title="SIGNUPS" variant="line">

- Mon: 112
- Tue: 148
- Wed: 135
- Thu: 204
- Fri: 231
- Sat: 96
- Sun: 88

</GraphPlot>

<GraphRank title="TOP PAGES">

- 12,400 /docs
- 6,800 /install
- 3,100 /pricing
- 1,420 /changelog

</GraphRank>

<GraphFunnel title="ONBOARDING" stage="invite">

- 4,820 signed up
- 2,960 created a project
- 1,140 invite

</GraphFunnel>

<GraphHeatmap title="TRAFFIC" palette="duo">

| | 0 | 4 | 8 | 12 | 16 | 20 |
| --- | --- | --- | --- | --- | --- | --- |
| Mon | 1 | 0 | 5 | 9 | 7 | 3 |
| Tue | 0 | 1 | 6 | 10 | 8 | 2 |
| Wed | 1 | 0 | 6 | 12 | 7 | 2 |
| Thu | 0 | 1 | 5 | 9 | 9 | 4 |
| Fri | 0 | 0 | 4 | 7 | 5 | 1 |

</GraphHeatmap>

</div>

## relay · job runner

A queue that runs scheduled jobs for a team. On-call opens it first thing: is
anything failing, is the queue draining, which job is slow.

<div class="dashboard-grid dashboard-mini">

<GraphKpi title="RUNNING">

**28** jobs — now

20 24 31 29 26 30 27 28

</GraphKpi>

<GraphMeter title="WORKERS">

83% — 25 of 30 busy

</GraphMeter>

<GraphSpark title="FAILURES">

0 1 0 0 3 1 0 0 — one bad hour

</GraphSpark>

<GraphKpi title="PAGES">

**2** this shift — −3

5 4 6 3 4 2 3 2

</GraphKpi>

</div>

<div class="dashboard-grid">

<GraphStat title="LAST 24H">

- 18k runs
- 37 retried
- **4 failed**

</GraphStat>

<GraphWaffle title="SUCCESS">

99% — 18,199 of 18,240 runs

</GraphWaffle>

<GraphUptime :title='"SCHEDULER"' :from='"Sep 8"' :to='"Oct 7"'>

ok*11 degraded ok*9 down ok*8

</GraphUptime>

<GraphBars title="QUEUE DEPTH" palette="duo">

- yesterday: 40 22 18 64 30 12
- **today**: 28 16 14 31 18 9

</GraphBars>

<GraphBullet title="P95 RUNTIME">

- sync-invoices: 42 / 60
- resize-images: 74 / 60
- send-digest: 18 / 30

</GraphBullet>

<GraphCheck title="ON-CALL">

- [x] rerun failed exports
- [x] page the storage owner
- [ ] raise resize-images timeout — waiting on review

</GraphCheck>

</div>

## tally · billing

Monthly numbers for a subscription product. Finance reads the top row; the
product team reads the plan mix and the churn reasons.

<div class="dashboard-grid dashboard-mini">

<GraphKpi title="NEW">

**38** accounts — +5

22 25 27 26 30 33 35 38

</GraphKpi>

<GraphKpi title="CHURN">

**1.9%** monthly — −0.3

28 26 25 24 23 21 20 19

</GraphKpi>

<GraphMeter title="PAID">

94% — invoices settled

</GraphMeter>

<GraphKpi title="RENEWALS">

**312** due in Jan — +40

210 230 250 262 280 291 300 312

</GraphKpi>

</div>

<div class="dashboard-grid">

<GraphKpi title="MRR">

**$84.2k** this month — +6%

61 63 64 66 68 70 71 74 76 79 81 84

</GraphKpi>

<GraphMeter title="QUARTER GOAL">

72% — of $350k booked

</GraphMeter>

<GraphScore title="CHURN REASONS">

- Price: 4/5
- Missing feature: 3/5
- **Switched tool: 2/5**
- Support: 1/5

</GraphScore>

<GraphKpi title="REVENUE PER ACCOUNT">

**$116** a month — +$4

98 101 103 104 106 108 109 111 112 113 115 116

</GraphKpi>

<div class="dashboard-wide">

<GraphSlope title="PLANS" fromLabel="june" toLabel="sept">

- starter: 410 → 380
- team: 220 → 296
- business: 34 → 51

</GraphSlope>

</div>

</div>

### revenue bridge

All values are USD thousands; the closing balance includes every movement.

<div class="dashboard-grid">

<div class="dashboard-wide">

<GraphWaterfall title="MRR BRIDGE" palette="duo">

- Opening: 80
- New: 8
- Expansion: 3
- Contraction: -2
- Churn: -4.8
- Closing: 84.2

</GraphWaterfall>

</div>

</div>

## pulse · mini tiles

The same figures at their smallest. A tile needs a title and one number, so a
whole status wall fits in the width of a single chart.

<div class="dashboard-grid dashboard-mini">

<GraphKpi title="UPTIME">

**99.98%** — 30 days

9 9 9 8 9 9 9 9

</GraphKpi>

<GraphKpi title="P95">

**182ms** api — −11ms

9 8 8 7 7 6 6 5

</GraphKpi>

<GraphKpi title="ERRORS">

**0.4%** of calls — +0.1

2 2 3 2 3 4 3 4

</GraphKpi>

<GraphKpi title="DEPLOYS">

**12** today — +4

3 5 4 6 8 7 9 12

</GraphKpi>

<GraphMeter title="CPU">

61% — of 64 cores

</GraphMeter>

<GraphMeter title="MEMORY">

74% — of 256 GB

</GraphMeter>

<GraphMeter title="DISK">

38% — of 4 TB

</GraphMeter>

<GraphMeter title="CACHE HIT">

92% — reads from cache

</GraphMeter>

<GraphSpark title="QUEUE">

4 6 3 8 12 9 5 3 — drained by noon

</GraphSpark>

<GraphSpark title="LOGINS">

10 12 15 14 18 22 21 25 — steady climb

</GraphSpark>

<GraphSpark title="SIGNUPS">

5 3 6 4 7 9 8 11 — best week yet

</GraphSpark>

<GraphSpark title="REFUNDS">

2 1 2 0 1 0 0 1 — quiet

</GraphSpark>

<GraphKpi title="TICKETS">

**17** open — −6

30 28 27 24 22 20 19 17

</GraphKpi>

<GraphKpi title="NPS">

**46** this quarter — +3

38 40 41 43 42 44 45 46

</GraphKpi>

<GraphMeter title="BACKUP">

100% — last night

</GraphMeter>

<GraphKpi title="MTTR">

**14m** to recover — −6m

31 28 25 22 20 18 16 14

</GraphKpi>

</div>

## loom · room availability

Each cell is one desk. Gaps show where a team can still sit together.

<div class="dashboard-grid dashboard-mini">

<GraphCells title="NORTH">

- 8 of 12 occupied: 1 1 1 0 / 1 1 0 0 / 1 1 1 0

</GraphCells>

<GraphCells title="SOUTH">

- 5 of 12 occupied: 1 1 0 0 / 1 0 0 0 / 1 1 0 0

</GraphCells>

<GraphCells title="EAST">

- 12 of 12 occupied: 1 1 1 1 / 1 1 1 1 / 1 1 1 1

</GraphCells>

<GraphCells title="WEST">

- 2 of 12 occupied: 0 0 0 0 / 0 1 1 0 / 0 0 0 0

</GraphCells>

<GraphCells title="LAB">

- 4 of 6 occupied: 1 0 1 / 1 1 0

</GraphCells>

</div>

## cadence · publishing rhythm

Recent publishing activity sits beside the next editorial milestones.

<div class="dashboard-grid">

<GraphActivity title="PUBLISHED">

- 2026-09-01: 1 2 0 3 1 0 0 2 3 1 4 2 0 0 1 2 3 2 1 0 0 3 4 2 5 3 0 0

</GraphActivity>

<GraphCalendar title="OCTOBER" :year="2026" :month="10">

- 9: draft review
- 16: issue ready
- 23: publish
- 30: retrospective

</GraphCalendar>

</div>

## drift · release room

One release, seen as a schedule and as the work still in motion.

<div class="dashboard-grid">

<div class="dashboard-wide">

<GraphGantt title="RELEASE" stage="build" :progress="0.55" :ticks="['w1','w2','w3','w4']">

- design: 0 0.25 1
- **build**: 0.15 0.7 0.65
- verify: 0.55 0.9 0.1
- ship: 0.9 1

</GraphGantt>

</div>

<div class="dashboard-wide">

<GraphBoard title="HANDOFF">

### Ready
- Token review

### Active
- **Keyboard pass**
- **Migration notes**

### Next
- *Release rehearsal*

</GraphBoard>

</div>

</div>

## folio · delivery receipt

A completed package, with the work and its price in one place.

<div class="dashboard-grid">

<div class="dashboard-wide">

<GraphInvoice title="INVOICE 0042" from="folio" to="Northwind">

- No.: 0042
- Status: awaiting payment

| Description | Qty | Rate | Amount |
| --- | --- | --- | --- |
| Icon set | 1 | 600 | 600 |
| Review session | 2 | 150 | 300 |

**Amount due** USD 900

Payment by bank transfer.

</GraphInvoice>

</div>

</div>

## trace · service handoff

The ownership map and the latest probe explain where to look next.

<div class="dashboard-grid">

<GraphTree title="OWNERS">

- checkout
  - api — ada
  - **payments** — bora
  - receipts — cem

</GraphTree>

<Terminal title="LAST PROBE">

```text
$ trace probe checkout
api       84ms
payments  620ms
receipts  91ms
result: payments above 500ms
```

</Terminal>

</div>

## prism · response review

Compare each operation with the same response-time target.

<div class="dashboard-grid">

<GraphSpec title="TARGET">

- Scope: three regions
- Metric: p95
- **Limit: 200ms**
- Window: 24 hours

</GraphSpec>

<GraphMatrix title="P95 MS">

| | iad | sfo | nrt |
| --- | --- | --- | --- |
| read | 84 | 96 | 132 |
| write | 142 | 188 | 260 |
| queue | 18 | 24 | 39 |

</GraphMatrix>

</div>

## inside a table row

Small enough to sit in a cell. Each row carries its own trend and load, so the
table reads as a dashboard without leaving the list.

<div class="dashboard-table">
<table>
<thead><tr><th>service</th><th>requests, 8h</th><th>load</th><th>status</th></tr></thead>
<tbody>
<tr>
<td>api</td>
<td>

<GraphSpark>

12 14 13 18 22 21 25 27

</GraphSpark>

</td>
<td>

<GraphMeter>

61%

</GraphMeter>

</td>
<td>ok</td>
</tr>
<tr>
<td>search</td>
<td>

<GraphSpark>

8 7 9 8 6 7 9 10

</GraphSpark>

</td>
<td>

<GraphMeter>

38%

</GraphMeter>

</td>
<td>ok</td>
</tr>
<tr>
<td>billing</td>
<td>

<GraphSpark>

3 4 4 3 9 12 4 3

</GraphSpark>

</td>
<td>

<GraphMeter>

87%

</GraphMeter>

</td>
<td>slow</td>
</tr>
<tr>
<td>exports</td>
<td>

<GraphSpark>

2 2 1 0 0 0 0 0

</GraphSpark>

</td>
<td>

<GraphMeter>

4%

</GraphMeter>

</td>
<td>down</td>
</tr>
<tr>
<td>webhooks</td>
<td>

<GraphSpark>

5 6 6 7 7 8 9 9

</GraphSpark>

</td>
<td>

<GraphMeter>

52%

</GraphMeter>

</td>
<td>ok</td>
</tr>
</tbody>
</table>
</div>

### regions

Two weeks of uptime per region, with the error budget left.

<div class="dashboard-table">
<table>
<thead><tr><th>region</th><th>last 14 days</th><th>budget left</th><th>p95</th></tr></thead>
<tbody>
<tr>
<td>eu-west</td>
<td>

<GraphUptime :days='"ok ok ok ok ok ok ok ok ok ok ok ok ok ok"'>



</GraphUptime>

</td>
<td>

<GraphMeter>

92%

</GraphMeter>

</td>
<td>118ms</td>
</tr>
<tr>
<td>us-east</td>
<td>

<GraphUptime :days='"ok ok ok degraded ok ok ok ok ok ok ok ok ok ok"'>



</GraphUptime>

</td>
<td>

<GraphMeter>

71%

</GraphMeter>

</td>
<td>142ms</td>
</tr>
<tr>
<td>ap-south</td>
<td>

<GraphUptime :days='"ok ok ok ok ok down down ok ok degraded ok ok ok ok"'>



</GraphUptime>

</td>
<td>

<GraphMeter>

18%

</GraphMeter>

</td>
<td>305ms</td>
</tr>
<tr>
<td>sa-east</td>
<td>

<GraphUptime :days='"ok ok ok ok ok ok ok ok ok ok ok ok degraded ok"'>



</GraphUptime>

</td>
<td>

<GraphMeter>

84%

</GraphMeter>

</td>
<td>211ms</td>
</tr>
</tbody>
</table>
</div>

### team

A weekly review: commits per day, review quality, and hours against plan.

<div class="dashboard-table">
<table>
<thead><tr><th>person</th><th>commits</th><th>review</th><th>hours</th></tr></thead>
<tbody>
<tr>
<td>ada</td>
<td>

<GraphSpark>

4 6 3 8 5 2 0

</GraphSpark>

</td>
<td>

<GraphMeter>

80% — review score 4/5

</GraphMeter>

</td>
<td>

36 / 40 h

</td>
</tr>
<tr>
<td>bora</td>
<td>

<GraphSpark>

2 3 5 4 6 7 1

</GraphSpark>

</td>
<td>

<GraphMeter>

100% — review score 5/5

</GraphMeter>

</td>
<td>

42 / 40 h

</td>
</tr>
<tr>
<td>cem</td>
<td>

<GraphSpark>

1 0 2 1 3 2 0

</GraphSpark>

</td>
<td>

<GraphMeter>

60% — review score 3/5

</GraphMeter>

</td>
<td>

22 / 40 h

</td>
</tr>
<tr>
<td>deniz</td>
<td>

<GraphSpark>

5 5 6 4 7 6 2

</GraphSpark>

</td>
<td>

<GraphMeter>

80% — review score 4/5

</GraphMeter>

</td>
<td>

39 / 40 h

</td>
</tr>
</tbody>
</table>
</div>

### accounts

Customer health at a glance: revenue trend, seat usage, and the open checklist.

<div class="dashboard-table">
<table>
<thead><tr><th>account</th><th>revenue, 12 mo</th><th>seats used</th><th>renewal</th></tr></thead>
<tbody>
<tr>
<td>northwind</td>
<td>

<GraphSpark>

8 9 9 10 11 11 12 13 13 14 15 16

</GraphSpark>

</td>
<td>

<GraphMeter>

88% — 44 of 50 seats

</GraphMeter>

</td>
<td>

<GraphCheck>

- [ ] waiting on signature

</GraphCheck>

</td>
</tr>
<tr>
<td>blue harbor</td>
<td>

<GraphSpark>

14 14 13 13 12 12 11 11 10 9 9 8

</GraphSpark>

</td>
<td>

<GraphMeter>

35% — 7 of 20 seats

</GraphMeter>

</td>
<td>

<GraphCheck>

- [ ] call not booked

</GraphCheck>

</td>
</tr>
<tr>
<td>kestrel</td>
<td>

<GraphSpark>

3 3 4 4 5 6 6 7 8 8 9 10

</GraphSpark>

</td>
<td>

<GraphMeter>

96% — 96 of 100 seats

</GraphMeter>

</td>
<td>

<GraphCheck>

- [x] signed

</GraphCheck>

</td>
</tr>
</tbody>
</table>
</div>

### releases

Each release with its file changes and how coverage moved.

<div class="dashboard-table">
<table>
<thead><tr><th>version</th><th>changes</th><th>coverage</th><th>state</th></tr></thead>
<tbody>
<tr>
<td>v2.4.0</td>
<td>

<GraphDiff palette="duo">

- 14 files: +new

</GraphDiff>

</td>
<td>

<GraphMeter>

84%

</GraphMeter>

</td>
<td>shipped</td>
</tr>
<tr>
<td>v2.3.2</td>
<td>

<GraphDiff palette="duo">

- 1 file: moved

</GraphDiff>

</td>
<td>

<GraphMeter>

81%

</GraphMeter>

</td>
<td>shipped</td>
</tr>
<tr>
<td>v2.5.0</td>
<td>

<GraphDiff palette="duo">

- 9 files: -gone

</GraphDiff>

</td>
<td>

<GraphMeter>

77%

</GraphMeter>

</td>
<td>in review</td>
</tr>
</tbody>
</table>
</div>

## compact rows

The same cells with the frames dropped and the padding cut, for lists where a
row should stay one line tall.

### endpoints

Calls and error share per route.

<div class="dashboard-table dashboard-compact">
<table>
<thead><tr><th>route</th><th>calls, 24h</th><th>errors</th><th>p95</th></tr></thead>
<tbody>
<tr>
<td>GET /users</td>
<td>

<GraphSpark>

9 11 12 10 14 15 13 16

</GraphSpark>

</td>
<td>

<GraphMeter>

1%

</GraphMeter>

</td>
<td>84ms</td>
</tr>
<tr>
<td>POST /orders</td>
<td>

<GraphSpark>

4 5 5 7 6 8 9 9

</GraphSpark>

</td>
<td>

<GraphMeter>

3%

</GraphMeter>

</td>
<td>210ms</td>
</tr>
<tr>
<td>GET /search</td>
<td>

<GraphSpark>

12 10 13 15 14 16 18 17

</GraphSpark>

</td>
<td>

<GraphMeter>

0%

</GraphMeter>

</td>
<td>120ms</td>
</tr>
<tr>
<td>POST /upload</td>
<td>

<GraphSpark>

2 2 3 1 2 4 3 2

</GraphSpark>

</td>
<td>

<GraphMeter>

12%

</GraphMeter>

</td>
<td>1.4s</td>
</tr>
<tr>
<td>GET /reports</td>
<td>

<GraphSpark>

1 1 2 2 1 3 2 2

</GraphSpark>

</td>
<td>

<GraphMeter>

6%

</GraphMeter>

</td>
<td>890ms</td>
</tr>
<tr>
<td>DELETE /cart</td>
<td>

<GraphSpark>

3 2 3 4 3 3 2 3

</GraphSpark>

</td>
<td>

<GraphMeter>

2%

</GraphMeter>

</td>
<td>66ms</td>
</tr>
</tbody>
</table>
</div>

### hosts

A fleet list: CPU and memory as bars, a week of health as a strip.

<div class="dashboard-table dashboard-compact">
<table>
<thead><tr><th>host</th><th>cpu</th><th>memory</th><th>last 7 days</th></tr></thead>
<tbody>
<tr>
<td>web-01</td>
<td>

<GraphMeter>

42%

</GraphMeter>

</td>
<td>

<GraphMeter>

61%

</GraphMeter>

</td>
<td>

<GraphUptime :days='"ok ok ok ok ok ok ok"'>



</GraphUptime>

</td>
</tr>
<tr>
<td>web-02</td>
<td>

<GraphMeter>

47%

</GraphMeter>

</td>
<td>

<GraphMeter>

58%

</GraphMeter>

</td>
<td>

<GraphUptime :days='"ok ok degraded ok ok ok ok"'>



</GraphUptime>

</td>
</tr>
<tr>
<td>db-01</td>
<td>

<GraphMeter>

78%

</GraphMeter>

</td>
<td>

<GraphMeter>

89%

</GraphMeter>

</td>
<td>

<GraphUptime :days='"ok ok ok ok ok ok ok"'>



</GraphUptime>

</td>
</tr>
<tr>
<td>queue-01</td>
<td>

<GraphMeter>

23%

</GraphMeter>

</td>
<td>

<GraphMeter>

35%

</GraphMeter>

</td>
<td>

<GraphUptime :days='"ok down ok ok ok ok ok"'>



</GraphUptime>

</td>
</tr>
<tr>
<td>cache-01</td>
<td>

<GraphMeter>

15%

</GraphMeter>

</td>
<td>

<GraphMeter>

92%

</GraphMeter>

</td>
<td>

<GraphUptime :days='"ok ok ok ok degraded ok ok"'>



</GraphUptime>

</td>
</tr>
</tbody>
</table>
</div>

### products

A storefront table: sales trend, stock left, and the margin.

<div class="dashboard-table dashboard-compact">
<table>
<thead><tr><th>product</th><th>sales, 8 wk</th><th>stock</th><th>margin</th></tr></thead>
<tbody>
<tr>
<td>desk lamp</td>
<td>

<GraphSpark>

5 6 8 7 9 12 11 14

</GraphSpark>

</td>
<td>

<GraphMeter>

34%

</GraphMeter>

</td>
<td>41%</td>
</tr>
<tr>
<td>notebook</td>
<td>

<GraphSpark>

20 18 19 22 21 24 23 26

</GraphSpark>

</td>
<td>

<GraphMeter>

78%

</GraphMeter>

</td>
<td>62%</td>
</tr>
<tr>
<td>backpack</td>
<td>

<GraphSpark>

9 8 7 7 6 5 5 4

</GraphSpark>

</td>
<td>

<GraphMeter>

91%

</GraphMeter>

</td>
<td>38%</td>
</tr>
<tr>
<td>mug</td>
<td>

<GraphSpark>

3 4 3 5 6 5 7 8

</GraphSpark>

</td>
<td>

<GraphMeter>

12%

</GraphMeter>

</td>
<td>55%</td>
</tr>
</tbody>
</table>
</div>

## cpu and memory

Four ways to fit a machine into one row. Each bar in the core column is one
core, so a hot core stands out from a busy host at a glance.

### per core

Eight cores as eight bars, with the load averages beside them.

<div class="dashboard-table dashboard-compact">
<table>
<thead><tr><th>host</th><th>cores</th><th>load 1 · 5 · 15</th><th>temp</th></tr></thead>
<tbody>
<tr>
<td>build-01</td>
<td>

<GraphSpark>

9 9 8 9 9 8 9 9

</GraphSpark>

</td>
<td>7.8 · 7.1 · 6.4</td>
<td>81°C</td>
</tr>
<tr>
<td>build-02</td>
<td>

<GraphSpark>

2 1 3 1 2 1 2 1

</GraphSpark>

</td>
<td>0.9 · 1.2 · 1.4</td>
<td>44°C</td>
</tr>
<tr>
<td>api-01</td>
<td>

<GraphSpark>

9 2 1 2 1 1 2 1

</GraphSpark>

</td>
<td>1.6 · 1.5 · 1.5</td>
<td>52°C</td>
</tr>
<tr>
<td>api-02</td>
<td>

<GraphSpark>

4 5 4 6 5 4 5 4

</GraphSpark>

</td>
<td>3.8 · 3.6 · 3.2</td>
<td>58°C</td>
</tr>
<tr>
<td>ml-01</td>
<td>

<GraphSpark>

9 9 9 9 0 0 0 0

</GraphSpark>

</td>
<td>4.0 · 4.0 · 3.9</td>
<td>76°C</td>
</tr>
</tbody>
</table>
</div>

### memory split

Where the memory went: used, page cache, and what is left, next to swap.

<div class="dashboard-table dashboard-compact">
<table>
<thead><tr><th>host</th><th>used · cache · free</th><th>swap</th><th>pressure</th></tr></thead>
<tbody>
<tr>
<td>db-01</td>
<td>

<GraphStack palette="multi" :rows="[{ label: '', segments: [{ label: 'used', value: 71 }, { label: 'cache', value: 24 }, { label: 'free', value: 5 }] }]" />

</td>
<td>

<GraphMeter>

2%

</GraphMeter>

</td>
<td>low</td>
</tr>
<tr>
<td>db-02</td>
<td>

<GraphStack palette="multi" :rows="[{ label: '', segments: [{ label: 'used', value: 88 }, { label: 'cache', value: 9 }, { label: 'free', value: 3 }] }]" />

</td>
<td>

<GraphMeter>

34%

</GraphMeter>

</td>
<td>high</td>
</tr>
<tr>
<td>web-01</td>
<td>

<GraphStack palette="multi" :rows="[{ label: '', segments: [{ label: 'used', value: 32 }, { label: 'cache', value: 18 }, { label: 'free', value: 50 }] }]" />

</td>
<td>

<GraphMeter>

0%

</GraphMeter>

</td>
<td>none</td>
</tr>
<tr>
<td>cache-01</td>
<td>

<GraphStack palette="multi" :rows="[{ label: '', segments: [{ label: 'used', value: 55 }, { label: 'cache', value: 40 }, { label: 'free', value: 5 }] }]" />

</td>
<td>

<GraphMeter>

0%

</GraphMeter>

</td>
<td>low</td>
</tr>
</tbody>
</table>
</div>

### containers

Containers against their limits: an hour of CPU, memory used of the limit, and restarts.

<div class="dashboard-table dashboard-compact">
<table>
<thead><tr><th>container</th><th>cpu, 1h</th><th>memory / limit</th><th>restarts</th></tr></thead>
<tbody>
<tr>
<td>checkout</td>
<td>

<GraphSpark>

3 4 4 5 9 8 4 3 3 4 5 4

</GraphSpark>

</td>
<td>

<GraphMeter>

62%

</GraphMeter>

</td>
<td>0</td>
</tr>
<tr>
<td>image-resize</td>
<td>

<GraphSpark>

1 1 9 9 9 2 1 1 9 9 2 1

</GraphSpark>

</td>
<td>

<GraphMeter>

97%

</GraphMeter>

</td>
<td>4 · OOM</td>
</tr>
<tr>
<td>mailer</td>
<td>

<GraphSpark>

1 1 1 2 1 1 1 1 2 1 1 1

</GraphSpark>

</td>
<td>

<GraphMeter>

18%

</GraphMeter>

</td>
<td>0</td>
</tr>
<tr>
<td>search-index</td>
<td>

<GraphSpark>

6 6 7 7 8 8 8 9 9 9 9 9

</GraphSpark>

</td>
<td>

<GraphMeter>

81%

</GraphMeter>

</td>
<td>1</td>
</tr>
</tbody>
</table>
</div>

### top processes

The heaviest processes on one host: CPU share now, and resident memory over ten minutes.

<div class="dashboard-table dashboard-compact">
<table>
<thead><tr><th>process</th><th>cpu</th><th>rss, 10 min</th><th>threads</th></tr></thead>
<tbody>
<tr>
<td>postgres</td>
<td>

<GraphMeter>

38%

</GraphMeter>

</td>
<td>

<GraphSpark>

6 6 6 7 7 7 7 7 8 8

</GraphSpark>

</td>
<td>142</td>
</tr>
<tr>
<td>node</td>
<td>

<GraphMeter>

22%

</GraphMeter>

</td>
<td>

<GraphSpark>

3 4 5 6 7 8 9 9 9 9

</GraphSpark>

</td>
<td>11</td>
</tr>
<tr>
<td>nginx</td>
<td>

<GraphMeter>

6%

</GraphMeter>

</td>
<td>

<GraphSpark>

2 2 2 2 2 2 2 2 2 2

</GraphSpark>

</td>
<td>9</td>
</tr>
<tr>
<td>backup</td>
<td>

<GraphMeter>

51%

</GraphMeter>

</td>
<td>

<GraphSpark>

1 3 5 7 5 3 1 1 1 1

</GraphSpark>

</td>
<td>4</td>
</tr>
</tbody>
</table>
</div>

## spool · batch outcomes

Outcome shares are done / retry / failed. Each health mark is one check.

<div class="dashboard-table dashboard-compact">
<table>
<thead>
<tr><th>queue</th><th>outcome mix</th><th>share %</th><th>last 7 checks</th></tr>
</thead>
<tbody>
<tr>
<td>images</td>
<td class="dashboard-stack-cell">

<GraphStack title="" palette="multi" :ticks="16" :rows="[{ label: '', segments: [{ label: 'done', value: 92 }, { label: 'retry', value: 6 }, { label: 'failed', value: 2 }] }]" />

</td>
<td>92 / 6 / 2</td>
<td>

<GraphUptime :days="'ok ok degraded ok ok ok ok'">

</GraphUptime>

</td>
</tr>
<tr>
<td>exports</td>
<td class="dashboard-stack-cell">

<GraphStack title="" palette="multi" :ticks="16" :rows="[{ label: '', segments: [{ label: 'done', value: 71 }, { label: 'retry', value: 21 }, { label: 'failed', value: 8 }] }]" />

</td>
<td>71 / 21 / 8</td>
<td>

<GraphUptime :days="'ok ok down degraded ok ok ok'">

</GraphUptime>

</td>
</tr>
</tbody>
</table>
</div>
