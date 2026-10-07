# Plot and KPI fixtures

<GraphPlot title="SIGNUPS" variant="line">

- Mon: 12
- Tue: 18
- Wed: 15
- Thu: 24
- Fri: 31

</GraphPlot>

<GraphPlot title="SIGNUPS" variant="line" :written="null">

- Mon: 12
- Tue: 18
- Wed: 15
- Thu: 24
- Fri: 31

</GraphPlot>

<GraphPlot title="SIGNUPS" variant="line" v-bind='{"data": [12, 18, 15, 24, 31], "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"]}' />

<GraphKpi title="READS">

**12,400** this week — +18%

4 5 5 6 8 7 9 8 11 10 12 14

</GraphKpi>

<GraphKpi title="READS" :written="null">

**12,400** this week — +18%

4 5 5 6 8 7 9 8 11 10 12 14

</GraphKpi>

<GraphKpi title="READS" v-bind='{"value": "12,400", "label": "this week", "hint": "+18%", "data": [4, 5, 5, 6, 8, 7, 9, 8, 11, 10, 12, 14]}' />


<GraphKpi title="LIST">

- 12,400 docs — +18%
- 4 5 6

</GraphKpi>

<GraphKpi title="LIST" :written="null">

- 12,400 docs — +18%
- 4 5 6

</GraphKpi>

<GraphKpi title="LIST" v-bind='{"value": "12,400", "label": "docs", "hint": "+18%", "data": [4, 5, 6]}' />

<GraphKpi title="QUOTE">

> 12 docs — +1%
>
> 1 2 3

</GraphKpi>

<GraphKpi title="QUOTE" :written="null">

> 12 docs — +1%
>
> 1 2 3

</GraphKpi>

<GraphKpi title="QUOTE" v-bind='{"value": "12", "label": "docs", "hint": "+1%", "data": [1, 2, 3]}' />
