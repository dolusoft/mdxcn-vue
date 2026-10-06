# Stat, slope and bullet fixtures

<GraphStat title="THIS WEEK">

- 12,400 docs
- 4,100 copies
- **860 shipped**

</GraphStat>

<GraphStat title="THIS WEEK">
<ul>
<li>12,400 docs</li>
<li>4,100 copies</li>
<li><strong>860 shipped</strong></li>
</ul>
</GraphStat>

<GraphStat title="THIS WEEK" :items='[{"value":"12,400","label":"docs"},{"value":"4,100","label":"copies"},{"value":"860","label":"shipped","accent":true}]' />

<GraphStat title="THIS WEEK">
<Stat value="12,400" label="docs" />
<Stat value="4,100" label="copies" />
<Stat value="860" label="shipped" accent />
</GraphStat>

<GraphStat title="P95">

- 142ms read — −18ms
- **410ms write — +22ms**

</GraphStat>

<GraphStat title="P95">
<ul>
<li>142ms read — −18ms</li>
<li><strong>410ms write — +22ms</strong></li>
</ul>
</GraphStat>

<GraphStat title="P95" :items='[{"value":"142ms","label":"read","hint":"−18ms"},{"value":"410ms","label":"write","hint":"+22ms","accent":true}]' />

<GraphStat title="P95">
<Stat value="142ms" label="read" hint="−18ms" />
<Stat value="410ms" label="write" hint="+22ms" accent />
</GraphStat>

<GraphSlope title="TRAFFIC" palette="duo" fromLabel="2025" toLabel="2026">

- docs: 8,200 → 12,400
- copy: 5,100 → 4,100
- ship: 640 → 860

</GraphSlope>

<GraphSlope title="TRAFFIC" palette="duo" fromLabel="2025" toLabel="2026">
<ul>
<li>docs: 8,200 → 12,400</li>
<li>copy: 5,100 → 4,100</li>
<li>ship: 640 → 860</li>
</ul>
</GraphSlope>

<GraphSlope title="TRAFFIC" palette="duo" fromLabel="2025" toLabel="2026" :items='[{"label":"docs","from":8200,"to":12400},{"label":"copy","from":5100,"to":4100},{"label":"ship","from":640,"to":860}]' />

<GraphSlope title="TRAFFIC" palette="duo" fromLabel="2025" toLabel="2026">
<Slope label="docs" :from="8200" :to="12400" />
<Slope label="copy" :from="5100" :to="4100" />
<Slope label="ship" :from="640" :to="860" />
</GraphSlope>

<GraphSlope title="P95" fromLabel="before" toLabel="after">

- read: 160 → 142
- write: 388 → 410
- cache: 12 → 12

</GraphSlope>

<GraphSlope title="P95" fromLabel="before" toLabel="after">
<ul>
<li>read: 160 → 142</li>
<li>write: 388 → 410</li>
<li>cache: 12 → 12</li>
</ul>
</GraphSlope>

<GraphSlope title="P95" fromLabel="before" toLabel="after" :items='[{"label":"read","from":160,"to":142},{"label":"write","from":388,"to":410},{"label":"cache","from":12,"to":12}]' />

<GraphSlope title="P95" fromLabel="before" toLabel="after">
<Slope label="read" :from="160" :to="142" />
<Slope label="write" :from="388" :to="410" />
<Slope label="cache" :from="12" :to="12" />
</GraphSlope>

<GraphBullet title="BUDGET">

- Design: 42 / 40
- Motion: 18 / 24
- Docs: 9 / 12

</GraphBullet>

<GraphBullet title="BUDGET">
<ul>
<li>Design: 42 / 40</li>
<li>Motion: 18 / 24</li>
<li>Docs: 9 / 12</li>
</ul>
</GraphBullet>

<GraphBullet title="BUDGET" :items='[{"label":"Design","value":42,"target":40},{"label":"Motion","value":18,"target":24},{"label":"Docs","value":9,"target":12}]' />

<GraphBullet title="BUDGET">
<Target label="Design" :value="42" :target="40" />
<Target label="Motion" :value="18" :target="24" />
<Target label="Docs" :value="9" :target="12" />
</GraphBullet>

<GraphBullet title="LOAD">

- CPU: 72 / 80 of 100
- RAM: 34 / 64 of 100
- SSD: 91 / 90 of 100

</GraphBullet>

<GraphBullet title="LOAD">
<ul>
<li>CPU: 72 / 80 of 100</li>
<li>RAM: 34 / 64 of 100</li>
<li>SSD: 91 / 90 of 100</li>
</ul>
</GraphBullet>

<GraphBullet title="LOAD" :items='[{"label":"CPU","value":72,"target":80,"max":100},{"label":"RAM","value":34,"target":64,"max":100},{"label":"SSD","value":91,"target":90,"max":100}]' />

<GraphBullet title="LOAD">
<Target label="CPU" :value="72" :target="80" :max="100" />
<Target label="RAM" :value="34" :target="64" :max="100" />
<Target label="SSD" :value="91" :target="90" :max="100" />
</GraphBullet>
