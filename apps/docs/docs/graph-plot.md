# plot

<GraphPlot title="SIGNUPS" variant="line">

- Mon: 12
- Tue: 18
- Wed: 15
- Thu: 24
- Fri: 31

</GraphPlot>

<GraphPlot title="P95" data="2 3 3 5 4 7 6 8 5 9 7 6" :labels='["jan", "dec"]' />

<GraphPlot title="ERRORS" variant="line" :height='5' :progress='0.7' :data='[1, 1, 4, 2, 8, 3, 2, 1, 5, 2]' :labels='["mon", "fri"]' />

`data` wins over written series, including an empty array. `labels` wins independently; otherwise written list labels remain available even with explicit data. `written` is the compiler model. The shared `seriesOf` grammar retains aligned labels and filters invalid written values. Empty labels suppress the label row. The default height is seven and the default variant is area. `progress` reveals a clamped prefix; the last shown cap is primary. The scale includes zero, preserves negative values, and uses range one for equal limits. Arrays retain `NaN`; strings filter invalid tokens. Ticks use upstream integer strings or one decimal place, independent of locale.

Runtime readers discard VitePress `header-anchor` links, leave custom components opaque, and read fragments without cloning VNodes. DOM, classes and screen reader summaries follow upstream. Animation uses `vReveal` with a 30 ms increment capped at 240 ms. SSR remains visible. These are intentional animation differences. Browser checks remain for narrow screens, long series, light/dark contrast, reduced motion and observer/WAAPI timing.
