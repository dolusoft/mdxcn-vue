# Series fixtures

<GraphBars title="THROUGHPUT" palette="duo">

- before: 2 4 3 5 2
- **after**: 2 4 3 5 2

</GraphBars>

<GraphBars :series="null" title="THROUGHPUT" palette="duo">

- before: 2 4 3 5 2
- **after**: 2 4 3 5 2

</GraphBars>

<GraphBars title="THROUGHPUT" palette="duo" v-bind="{&quot;series&quot;:[{&quot;label&quot;:&quot;before&quot;,&quot;values&quot;:[2,4,3,5,2]},{&quot;label&quot;:&quot;after&quot;,&quot;values&quot;:[2,4,3,5,2],&quot;size&quot;:&quot;lg&quot;}]}" />

<GraphBars title="DRAFT TO SHIPPED" processor="edit">

- draft: 1 2 2 3 1
- **shipped**: 3 5 4 6 5

</GraphBars>

<GraphBars :series="null" title="DRAFT TO SHIPPED" processor="edit">

- draft: 1 2 2 3 1
- **shipped**: 3 5 4 6 5

</GraphBars>

<GraphBars title="DRAFT TO SHIPPED" processor="edit" v-bind="{&quot;series&quot;:[{&quot;label&quot;:&quot;draft&quot;,&quot;values&quot;:[1,2,2,3,1]},{&quot;label&quot;:&quot;shipped&quot;,&quot;values&quot;:[3,5,4,6,5],&quot;size&quot;:&quot;lg&quot;}]}" />

<GraphSpark title="DEPLOYS">

2 3 0*3 5 8 6 9 — three quiet days, then a busy week

</GraphSpark>

<GraphSpark :written="null" title="DEPLOYS">

2 3 0*3 5 8 6 9 — three quiet days, then a busy week

</GraphSpark>

<GraphSpark title="DEPLOYS" v-bind="{&quot;written&quot;:{&quot;data&quot;:[2,3,0,0,0,5,8,6,9],&quot;labels&quot;:[],&quot;caption&quot;:&quot;three quiet days, then a busy week&quot;}}" />

<GraphBars title="LOOSE">

- A: 1

  2

  - **child**: 99

</GraphBars>

<GraphBars :series="null" title="LOOSE">

- A: 1

  2

  - **child**: 99

</GraphBars>

<GraphBars title="LOOSE" v-bind="{&quot;series&quot;:[{&quot;label&quot;:&quot;A&quot;,&quot;values&quot;:[12],&quot;size&quot;:&quot;lg&quot;}]}" />

<GraphSpark title="LABELS">

1. Mon: 12,400ms
2. bad: no
3. 3
4. Tue: -4.5

99 — ignored

</GraphSpark>

<GraphSpark :written="null" title="LABELS">

1. Mon: 12,400ms
2. bad: no
3. 3
4. Tue: -4.5

99 — ignored

</GraphSpark>

<GraphSpark title="LABELS" v-bind="{&quot;written&quot;:{&quot;data&quot;:[12400,3,-4.5],&quot;labels&quot;:[&quot;Mon&quot;,&quot;&quot;,&quot;Tue&quot;]}}" />

<GraphSpark title="SOURCE">

1 **2** *3*

4 — **bold** [link](/)

</GraphSpark>

<GraphSpark :written="null" title="SOURCE">

1 **2** *3*

4 — **bold** [link](/)

</GraphSpark>

<GraphSpark title="SOURCE" v-bind="{&quot;written&quot;:{&quot;data&quot;:[1,4],&quot;labels&quot;:[],&quot;caption&quot;:&quot;**bold** link&quot;}}" />

<GraphSpark title="HEADING">

## 1 2 — heading

</GraphSpark>

<GraphSpark :written="null" title="HEADING">

## 1 2 — heading

</GraphSpark>

<GraphSpark title="HEADING" v-bind="{&quot;written&quot;:{&quot;data&quot;:[1,2],&quot;labels&quot;:[],&quot;caption&quot;:&quot;heading&quot;}}" />
