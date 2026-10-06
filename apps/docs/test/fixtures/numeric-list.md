# Numeric upstream examples

<GraphScore title="REVIEW" >

- Performance: 4/5
- Accessibility: 5/5
- **Docs: 2.5/5**
- Motion: 4/5

</GraphScore>

<GraphScore title="REVIEW" >
<ul>
<li>Performance: 4/5</li>
<li>Accessibility: 5/5</li>
<li><strong>Docs: 2.5/5</strong></li>
<li>Motion: 4/5</li>
</ul>
</GraphScore>

<GraphScore title="REVIEW"  :items='[{"label": "Performance", "value": 4, "max": 5}, {"label": "Accessibility", "value": 5, "max": 5}, {"label": "Docs", "value": 2.5, "max": 5, "accent": true}, {"label": "Motion", "value": 4, "max": 5}]' />

<GraphScore title="VENDORS" glyphs="ascii">

- Acme: 8/10
- Globex: 6.5
- Initech: 4

</GraphScore>

<GraphScore title="VENDORS" glyphs="ascii">
<ul>
<li>Acme: 8/10</li>
<li>Globex: 6.5</li>
<li>Initech: 4</li>
</ul>
</GraphScore>

<GraphScore title="VENDORS" glyphs="ascii" :items='[{"label": "Acme", "value": 8, "max": 10}, {"label": "Globex", "value": 6.5}, {"label": "Initech", "value": 4}]' />

<GraphRank title="ROUTES" >

- 12,400 /docs
- 4,100 /install
- 860 /plot
- 420 /rank

</GraphRank>

<GraphRank title="ROUTES" >
<ul>
<li>12,400 /docs</li>
<li>4,100 /install</li>
<li>860 /plot</li>
<li>420 /rank</li>
</ul>
</GraphRank>

<GraphRank title="ROUTES"  :items='[{"label": "/docs", "value": 12400, "display": "12,400"}, {"label": "/install", "value": 4100, "display": "4,100"}, {"label": "/plot", "value": 860, "display": "860"}, {"label": "/rank", "value": 420, "display": "420"}]' />

<GraphRank title="ROUTES" >
<Rank :value="12400" display="12,400">/docs</Rank>
<Rank :value="4100" display="4,100">/install</Rank>
<Rank :value="860" display="860">/plot</Rank>
<Rank :value="420" display="420">/rank</Rank>
</GraphRank>

<GraphRank title="COVERAGE" :max="100">

- 100% frame
- 82% plot
- 41% invoice

</GraphRank>

<GraphRank title="COVERAGE" :max="100">
<ul>
<li>100% frame</li>
<li>82% plot</li>
<li>41% invoice</li>
</ul>
</GraphRank>

<GraphRank title="COVERAGE" :max="100" :items='[{"label": "frame", "value": 100, "display": "100%"}, {"label": "plot", "value": 82, "display": "82%"}, {"label": "invoice", "value": 41, "display": "41%"}]' />

<GraphFunnel title="INSTALL" stage="ship">

- 12,400 docs
- 4,100 copy
- 860 ship

</GraphFunnel>

<GraphFunnel title="INSTALL" stage="ship">
<ul>
<li>12,400 docs</li>
<li>4,100 copy</li>
<li>860 ship</li>
</ul>
</GraphFunnel>

<GraphFunnel title="INSTALL" stage="ship" :steps='[{"label": "docs", "value": 12400, "display": "12,400"}, {"label": "copy", "value": 4100, "display": "4,100"}, {"label": "ship", "value": 860, "display": "860"}]' />

<GraphFunnel title="INSTALL" stage="ship">
<Stage :value="12400" display="12,400">docs</Stage>
<Stage :value="4100" display="4,100">copy</Stage>
<Stage :value="860" display="860">ship</Stage>
</GraphFunnel>

<GraphFunnel title="SIGNUP" ticks="16">

- 8,000 visit
- 2,400 start
- 960 verify
- 180 paid

</GraphFunnel>

<GraphFunnel title="SIGNUP" ticks="16">
<ul>
<li>8,000 visit</li>
<li>2,400 start</li>
<li>960 verify</li>
<li>180 paid</li>
</ul>
</GraphFunnel>

<GraphFunnel title="SIGNUP" ticks="16" :steps='[{"label": "visit", "value": 8000, "display": "8,000"}, {"label": "start", "value": 2400, "display": "2,400"}, {"label": "verify", "value": 960, "display": "960"}, {"label": "paid", "value": 180, "display": "180"}]' />

