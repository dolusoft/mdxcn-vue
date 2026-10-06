# GraphWaterfall

Write `label: value`. First and last rows default to `start` and `end`; intermediate signs choose `in` or `out`. Explicit `kind` overrides that choice. Changes accumulate; start/end rows reset the running value and use their supplied value rather than computing a total. Data `items` → explicit compiler `list` → nonempty runtime list → `Delta` items. Empty data/list arrays suppress fallback; null permits it. `ticks` defaults to 24; `display`, `glyphs`, and `palette` customize output. Numbers use upstream `en-US` formatting, including Unicode minus for outgoing values. Unicode minus in numeric input retains upstream parsing behavior (zero). Stagger is capped at 250 ms.

<GraphWaterfall title="MARGIN" palette="duo">

- Revenue: 48
- Refunds: -6
- Hosting: -4
- Profit: 38

</GraphWaterfall>

```md
<GraphWaterfall title="MARGIN" palette="duo">

- Revenue: 48
- Refunds: -6
- Hosting: -4
- Profit: 38

</GraphWaterfall>
```

<GraphWaterfall title="TEAM">

- Start: 12
- Hired: 4
- Left: -2
- Now: 14

</GraphWaterfall>

```md
<GraphWaterfall title="TEAM">

- Start: 12
- Hired: 4
- Left: -2
- Now: 14

</GraphWaterfall>
```

```vue
<GraphWaterfall title="DATA" :items='[{"label":"Revenue","value":48},{"label":"Refunds","value":-6},{"label":"Hosting","value":-4},{"label":"Profit","value":38}]' />
<GraphWaterfall title="ITEM">
<Delta label="Revenue" :value="48" />
<Delta label="Refunds" :value="-6" />
<Delta label="Hosting" :value="-4" />
<Delta label="Profit" :value="38" />
</GraphWaterfall>
```

SSR content stays visible before animation setup. Frame props `corner`, `className`, and Vue attrs are supported.
