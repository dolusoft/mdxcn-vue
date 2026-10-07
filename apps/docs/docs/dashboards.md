# dashboards

Three made-up products, one screen each. Every tile is a Markdown figure in a
plain CSS grid, so the same source works as a page, a README or a status post.

## lumen · site analytics

A small analytics product for a docs site. The top row is the week at a glance;
the bottom row says where readers came from and where they left.

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

<div class="dashboard-grid">

<GraphStat title="LAST 24H">

- 18.2k runs
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
