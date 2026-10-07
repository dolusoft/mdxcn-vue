# Nested list and flow fixtures

<GraphTree title="REGISTRY">

- registry/default
  - graph-frame
    - graph-frame.tsx — ui
    - graph-motion.ts — lib
  - graph-tree
    - **graph-tree.tsx** — ui

</GraphTree>

<GraphTree :nodes="null" title="REGISTRY">

- registry/default
  - graph-frame
    - graph-frame.tsx — ui
    - graph-motion.ts — lib
  - graph-tree
    - **graph-tree.tsx** — ui

</GraphTree>

<GraphTree title="REGISTRY" v-bind="{&quot;nodes&quot;:[{&quot;label&quot;:&quot;registry/default&quot;,&quot;accent&quot;:true,&quot;children&quot;:[{&quot;label&quot;:&quot;graph-frame&quot;,&quot;accent&quot;:false,&quot;children&quot;:[{&quot;label&quot;:&quot;graph-frame.tsx&quot;,&quot;accent&quot;:false,&quot;meta&quot;:&quot;ui&quot;},{&quot;label&quot;:&quot;graph-motion.ts&quot;,&quot;accent&quot;:false,&quot;meta&quot;:&quot;lib&quot;}]},{&quot;label&quot;:&quot;graph-tree&quot;,&quot;accent&quot;:true,&quot;children&quot;:[{&quot;label&quot;:&quot;graph-tree.tsx&quot;,&quot;accent&quot;:true,&quot;meta&quot;:&quot;ui&quot;}]}]}]}" />

<GraphTree title="ON CALL">

- platform
  - api — priya
  - **workers** — jon
  - edge — mina

</GraphTree>

<GraphTree :nodes="null" title="ON CALL">

- platform
  - api — priya
  - **workers** — jon
  - edge — mina

</GraphTree>

<GraphTree title="ON CALL" v-bind="{&quot;nodes&quot;:[{&quot;label&quot;:&quot;platform&quot;,&quot;accent&quot;:true,&quot;children&quot;:[{&quot;label&quot;:&quot;api&quot;,&quot;accent&quot;:false,&quot;meta&quot;:&quot;priya&quot;},{&quot;label&quot;:&quot;workers&quot;,&quot;accent&quot;:true,&quot;meta&quot;:&quot;jon&quot;},{&quot;label&quot;:&quot;edge&quot;,&quot;accent&quot;:false,&quot;meta&quot;:&quot;mina&quot;}]}]}" />

<GraphCheck title="LAUNCH">

- [x] freeze tokens
- [x] ship registry json
- [ ] write the postmortem — still open

</GraphCheck>

<GraphCheck :items="null" title="LAUNCH">

- [x] freeze tokens
- [x] ship registry json
- [ ] write the postmortem — still open

</GraphCheck>

<GraphCheck title="LAUNCH" v-bind="{&quot;items&quot;:[{&quot;label&quot;:&quot;freeze tokens&quot;,&quot;done&quot;:true},{&quot;label&quot;:&quot;ship registry json&quot;,&quot;done&quot;:true},{&quot;label&quot;:&quot;write the postmortem&quot;,&quot;done&quot;:false,&quot;note&quot;:&quot;still open&quot;}]}" />

<GraphCheck title="REVIEW">

- [x] title is a sentence
- [x] numbers are tabular
- [ ] motion respects reduced — check the timer

</GraphCheck>

<GraphCheck :items="null" title="REVIEW">

- [x] title is a sentence
- [x] numbers are tabular
- [ ] motion respects reduced — check the timer

</GraphCheck>

<GraphCheck title="REVIEW" v-bind="{&quot;items&quot;:[{&quot;label&quot;:&quot;title is a sentence&quot;,&quot;done&quot;:true},{&quot;label&quot;:&quot;numbers are tabular&quot;,&quot;done&quot;:true},{&quot;label&quot;:&quot;motion respects reduced&quot;,&quot;done&quot;:false,&quot;note&quot;:&quot;check the timer&quot;}]}" />

<GraphCheck title="RELEASE">

- [x] freeze tokens
- [ ] docs
  - [x] grammar page
  - [ ] mdx page — needs screenshots
- [ ] tag 1.3.0

</GraphCheck>

<GraphCheck :items="null" title="RELEASE">

- [x] freeze tokens
- [ ] docs
  - [x] grammar page
  - [ ] mdx page — needs screenshots
- [ ] tag 1.3.0

</GraphCheck>

<GraphCheck title="RELEASE" v-bind="{&quot;items&quot;:[{&quot;label&quot;:&quot;freeze tokens&quot;,&quot;done&quot;:true},{&quot;label&quot;:&quot;docs&quot;,&quot;done&quot;:false,&quot;items&quot;:[{&quot;label&quot;:&quot;grammar page&quot;,&quot;done&quot;:true},{&quot;label&quot;:&quot;mdx page&quot;,&quot;done&quot;:false,&quot;note&quot;:&quot;needs screenshots&quot;}]},{&quot;label&quot;:&quot;tag 1.3.0&quot;,&quot;done&quot;:false}]}" />

<GraphFlow title="OPTIMISTIC UI">

tap → server → update

tap → **update** → *server syncs*

</GraphFlow>

<GraphFlow :rows="null" title="OPTIMISTIC UI">

tap → server → update

tap → **update** → *server syncs*

</GraphFlow>

<GraphFlow title="OPTIMISTIC UI" v-bind="{&quot;rows&quot;:[{&quot;nodes&quot;:[{&quot;label&quot;:&quot;tap&quot;},{&quot;label&quot;:&quot;server&quot;},{&quot;label&quot;:&quot;update&quot;}]},{&quot;nodes&quot;:[{&quot;label&quot;:&quot;tap&quot;},{&quot;label&quot;:&quot;update&quot;,&quot;tone&quot;:&quot;accent&quot;},{&quot;label&quot;:&quot;server syncs&quot;,&quot;tone&quot;:&quot;muted&quot;}]}]}" />

<GraphFlow title="PUBLISH PATH">

write → review → ship

</GraphFlow>

<GraphFlow :rows="null" title="PUBLISH PATH">

write → review → ship

</GraphFlow>

<GraphFlow title="PUBLISH PATH" v-bind="{&quot;rows&quot;:[{&quot;nodes&quot;:[{&quot;label&quot;:&quot;write&quot;},{&quot;label&quot;:&quot;review&quot;},{&quot;label&quot;:&quot;ship&quot;}]}]}" />
