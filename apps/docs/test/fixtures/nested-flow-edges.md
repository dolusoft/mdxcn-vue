# Edge fixtures

<GraphTree title="LOOSE">

- first

  second — note

  1. child

     continuation

</GraphTree>

<GraphTree :nodes="null" title="LOOSE">

- first

  second — note

  1. child

     continuation

</GraphTree>

<GraphTree title="LOOSE" v-bind="{&quot;nodes&quot;:[{&quot;label&quot;:&quot;first second&quot;,&quot;meta&quot;:&quot;note&quot;,&quot;accent&quot;:false,&quot;children&quot;:[{&quot;label&quot;:&quot;child continuation&quot;,&quot;accent&quot;:false}]}]}" />

<GraphCheck title="LOOSE">

- [x] first

  continuation

  1. [ ] child

     detail

</GraphCheck>

<GraphCheck :items="null" title="LOOSE">

- [x] first

  continuation

  1. [ ] child

     detail

</GraphCheck>

<GraphCheck title="LOOSE" v-bind="{&quot;items&quot;:[{&quot;label&quot;:&quot;first continuation&quot;,&quot;done&quot;:false,&quot;items&quot;:[{&quot;label&quot;:&quot;child detail&quot;,&quot;done&quot;:false}]}]}" />

<GraphFlow title="HEADING">

### write → ship

</GraphFlow>

<GraphFlow :rows="null" title="HEADING">

### write → ship

</GraphFlow>

<GraphFlow title="HEADING" v-bind="{&quot;rows&quot;:[{&quot;nodes&quot;:[{&quot;label&quot;:&quot;write&quot;},{&quot;label&quot;:&quot;ship&quot;}]}]}" />

<GraphFlow title="MIXED">

1. A->**B**=>*C*—>D → E
2. next

</GraphFlow>

<GraphFlow :rows="null" title="MIXED">

1. A->**B**=>*C*—>D → E
2. next

</GraphFlow>

<GraphFlow title="MIXED" v-bind="{&quot;rows&quot;:[{&quot;nodes&quot;:[{&quot;label&quot;:&quot;A&quot;},{&quot;label&quot;:&quot;B&quot;,&quot;tone&quot;:&quot;accent&quot;},{&quot;label&quot;:&quot;C&quot;,&quot;tone&quot;:&quot;muted&quot;},{&quot;label&quot;:&quot;D&quot;},{&quot;label&quot;:&quot;E&quot;}]},{&quot;nodes&quot;:[{&quot;label&quot;:&quot;next&quot;}]}]}" />
