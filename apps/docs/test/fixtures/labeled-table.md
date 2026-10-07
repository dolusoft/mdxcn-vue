<script setup lang="ts">
import { Col } from 'mdxcn-vue'
</script>

# Labeled table paths

<GraphCompare title="PLANS" accent="Studio">

| | Solo | Studio |
| --- | --- | --- |
| Registry | yes | yes |
| Accent picker | yes | yes |
| Private source | no | yes |
| Price | $0 | $24 |

</GraphCompare>

<GraphCompare title="PLANS" accent="Studio">
<table><thead><tr><th></th><th>Solo</th><th>Studio</th></tr></thead><tbody><tr><td>Registry</td><td>yes</td><td>yes</td></tr><tr><td>Accent picker</td><td>yes</td><td>yes</td></tr><tr><td>Private source</td><td>no</td><td>yes</td></tr><tr><td>Price</td><td>$0</td><td>$24</td></tr></tbody></table>
</GraphCompare>

<GraphCompare title="PLANS" accent="Studio" :columns='["Solo","Studio"]' :rows='[{"label":"Registry","values":[true,true]},{"label":"Accent picker","values":[true,true]},{"label":"Private source","values":[false,true]},{"label":"Price","values":["$0","$24"]}]' />

<GraphCompare title="PLANS" accent="Studio" :columns='["Solo","Studio"]'>
<Col>Solo</Col><Col>Studio</Col><Row label="Registry">yes yes</Row><Row label="Accent picker">yes yes</Row><Row label="Private source">no yes</Row><Row label="Price">$0 $24</Row>
</GraphCompare>

<GraphCompare title="RENDER" accent="This">

| | Mermaid | SVG | This |
| --- | --- | --- | --- |
| Source | .md | .svg | .tsx |
| In git | yes | no | yes |
| Themable | no | no | yes |

</GraphCompare>

<GraphCompare title="RENDER" accent="This">
<table><thead><tr><th></th><th>Mermaid</th><th>SVG</th><th>This</th></tr></thead><tbody><tr><td>Source</td><td>.md</td><td>.svg</td><td>.tsx</td></tr><tr><td>In git</td><td>yes</td><td>no</td><td>yes</td></tr><tr><td>Themable</td><td>no</td><td>no</td><td>yes</td></tr></tbody></table>
</GraphCompare>

<GraphCompare title="RENDER" accent="This" :columns='["Mermaid","SVG","This"]' :rows='[{"label":"Source","values":[".md",".svg",".tsx"]},{"label":"In git","values":[true,false,true]},{"label":"Themable","values":[false,false,true]}]' />

<GraphCompare title="RENDER" accent="This" :columns='["Mermaid","SVG","This"]'>
<Col>Mermaid</Col><Col>SVG</Col><Col>This</Col><Row label="Source">.md .svg .tsx</Row><Row label="In git">yes no yes</Row><Row label="Themable">no no yes</Row>
</GraphCompare>

<GraphMatrix title="DETECT" accent="Pos">

| | Pos | Neg |
| --- | --- | --- |
| Pos | 41 | 3 |
| Neg | 2 | 54 |

</GraphMatrix>

<GraphMatrix title="DETECT" accent="Pos">
<table><thead><tr><th></th><th>Pos</th><th>Neg</th></tr></thead><tbody><tr><td>Pos</td><td>41</td><td>3</td></tr><tr><td>Neg</td><td>2</td><td>54</td></tr></tbody></table>
</GraphMatrix>

<GraphMatrix title="DETECT" accent="Pos" :columns='["Pos","Neg"]' :rows='[{"label":"Pos","values":[41,3]},{"label":"Neg","values":[2,54]}]' />

<GraphMatrix title="DETECT" accent="Pos" :columns='["Pos","Neg"]'>
<Row label="Pos">41 3</Row><Row label="Neg">2 54</Row>
</GraphMatrix>

<GraphMatrix title="P95" accent="write">

| | iad | sfo | nrt |
| --- | --- | --- | --- |
| read | 12 | 18 | 41 |
| write | 28 | 33 | 67 |
| queue | 4 | 6 | 9 |

</GraphMatrix>

<GraphMatrix title="P95" accent="write">
<table><thead><tr><th></th><th>iad</th><th>sfo</th><th>nrt</th></tr></thead><tbody><tr><td>read</td><td>12</td><td>18</td><td>41</td></tr><tr><td>write</td><td>28</td><td>33</td><td>67</td></tr><tr><td>queue</td><td>4</td><td>6</td><td>9</td></tr></tbody></table>
</GraphMatrix>

<GraphMatrix title="P95" accent="write" :columns='["iad","sfo","nrt"]' :rows='[{"label":"read","values":[12,18,41]},{"label":"write","values":[28,33,67]},{"label":"queue","values":[4,6,9]}]' />

<GraphMatrix title="P95" accent="write" :columns='["iad","sfo","nrt"]'>
<Row label="read">12 18 41</Row><Row label="write">28 33 67</Row><Row label="queue">4 6 9</Row>
</GraphMatrix>

<GraphHeatmap title="DEPLOYS" palette="duo">

| | 0 | 4 | 8 | 12 | 16 | 20 |
| --- | --- | --- | --- | --- | --- | --- |
| Mon | 0 | 1 | 4 | 8 | 6 | 1 |
| Tue | 0 | 0 | 5 | 9 | 4 | 2 |
| Wed | 1 | 0 | 6 | 12 | 5 | 1 |
| Thu | 0 | 2 | 4 | 7 | 8 | 3 |
| Fri | 0 | 1 | 3 | 5 | 2 | 0 |
| Sat | 0 | 0 | 1 | 0 | 0 | 0 |
| Sun | 0 | 0 | 0 | 1 | 0 | 0 |

</GraphHeatmap>

<GraphHeatmap title="DEPLOYS" palette="duo">
<table><thead><tr><th></th><th>0</th><th>4</th><th>8</th><th>12</th><th>16</th><th>20</th></tr></thead><tbody><tr><td>Mon</td><td>0</td><td>1</td><td>4</td><td>8</td><td>6</td><td>1</td></tr><tr><td>Tue</td><td>0</td><td>0</td><td>5</td><td>9</td><td>4</td><td>2</td></tr><tr><td>Wed</td><td>1</td><td>0</td><td>6</td><td>12</td><td>5</td><td>1</td></tr><tr><td>Thu</td><td>0</td><td>2</td><td>4</td><td>7</td><td>8</td><td>3</td></tr><tr><td>Fri</td><td>0</td><td>1</td><td>3</td><td>5</td><td>2</td><td>0</td></tr><tr><td>Sat</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td></tr><tr><td>Sun</td><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td></tr></tbody></table>
</GraphHeatmap>

<GraphHeatmap title="DEPLOYS" palette="duo" :columns='["0","4","8","12","16","20"]' :rows='[{"label":"Mon","values":[0,1,4,8,6,1]},{"label":"Tue","values":[0,0,5,9,4,2]},{"label":"Wed","values":[1,0,6,12,5,1]},{"label":"Thu","values":[0,2,4,7,8,3]},{"label":"Fri","values":[0,1,3,5,2,0]},{"label":"Sat","values":[0,0,1,0,0,0]},{"label":"Sun","values":[0,0,0,1,0,0]}]' />

<GraphHeatmap title="DEPLOYS" palette="duo" :columns='["0","4","8","12","16","20"]'>
<Row label="Mon">0 1 4 8 6 1</Row><Row label="Tue">0 0 5 9 4 2</Row><Row label="Wed">1 0 6 12 5 1</Row><Row label="Thu">0 2 4 7 8 3</Row><Row label="Fri">0 1 3 5 2 0</Row><Row label="Sat">0 0 1 0 0 0</Row><Row label="Sun">0 0 0 1 0 0</Row>
</GraphHeatmap>

<GraphHeatmap title="TESTS" :max="10" :legend="false">

| | a | b | c | d |
| --- | --- | --- | --- | --- |
| auth | 10 | 8 | 4 | 2 |
| billing | 6 | 10 | 7 | 1 |
| docs | 2 | 3 | 9 | 8 |

</GraphHeatmap>

<GraphHeatmap title="TESTS" :max="10" :legend="false">
<table><thead><tr><th></th><th>a</th><th>b</th><th>c</th><th>d</th></tr></thead><tbody><tr><td>auth</td><td>10</td><td>8</td><td>4</td><td>2</td></tr><tr><td>billing</td><td>6</td><td>10</td><td>7</td><td>1</td></tr><tr><td>docs</td><td>2</td><td>3</td><td>9</td><td>8</td></tr></tbody></table>
</GraphHeatmap>

<GraphHeatmap title="TESTS" :max="10" :legend="false" :columns='["a","b","c","d"]' :rows='[{"label":"auth","values":[10,8,4,2]},{"label":"billing","values":[6,10,7,1]},{"label":"docs","values":[2,3,9,8]}]' />

<GraphHeatmap title="TESTS" :max="10" :legend="false" :columns='["a","b","c","d"]'>
<Row label="auth">10 8 4 2</Row><Row label="billing">6 10 7 1</Row><Row label="docs">2 3 9 8</Row>
</GraphHeatmap>

