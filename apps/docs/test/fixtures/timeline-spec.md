# Timeline and spec parity

<GraphTimeline title="SHIPPED">

- Mar 12: CLI copies the files
- **Mar 18: Docs, live previews**
- *Apr 02: Registry listed*

</GraphTimeline>

<GraphTimeline :list="null" title="SHIPPED">

- Mar 12: CLI copies the files
- **Mar 18: Docs, live previews**
- *Apr 02: Registry listed*

</GraphTimeline>

<GraphTimeline title="INCIDENT">

- 14:02: p95 crossed 800ms
- **14:11: rolled back the cache flag**
- *14:40: write the postmortem*

</GraphTimeline>

<GraphTimeline :list="null" title="INCIDENT">

- 14:02: p95 crossed 800ms
- **14:11: rolled back the cache flag**
- *14:40: write the postmortem*

</GraphTimeline>

<GraphTimeline title="NIGHT">

- 14:02: p95 crossed 800ms — paged the on-call

- **14:11: rolled back the cache flag**

  Errors stopped inside a minute. Latency took ten.

- *14:40: write the postmortem*

</GraphTimeline>

<GraphTimeline :list="null" title="NIGHT">

- 14:02: p95 crossed 800ms — paged the on-call

- **14:11: rolled back the cache flag**

  Errors stopped inside a minute. Latency took ten.

- *14:40: write the postmortem*

</GraphTimeline>

<GraphSpec title="TYPE">

- Family: Geist Mono
- Size: 14 / 21
- Tracking: +0.02em
- Figures: tabular
- **Accent: --graph-accent**

</GraphSpec>

<GraphSpec :list="null" title="TYPE">

- Family: Geist Mono
- Size: 14 / 21
- Tracking: +0.02em
- Figures: tabular
- **Accent: --graph-accent**

</GraphSpec>

<GraphSpec title="SHIP TO">

- Name: A. Rao
- City: Bengaluru
- Carrier: Delhivery
- **ETA: Thu**

</GraphSpec>

<GraphSpec :list="null" title="SHIP TO">

- Name: A. Rao
- City: Bengaluru
- Carrier: Delhivery
- **ETA: Thu**

</GraphSpec>

<GraphSpec title="INSTALL">

- Command: `pnpm dlx shadcn@latest add @mdxcn/all`

- Lands in: `registry/default`

  Edit it there. Nothing to update later.

- Needs: [motion](https://motion.dev)

</GraphSpec>

<GraphSpec :list="null" title="INSTALL">

- Command: `pnpm dlx shadcn@latest add @mdxcn/all`

- Lands in: `registry/default`

  Edit it there. Nothing to update later.

- Needs: [motion](https://motion.dev)

</GraphSpec>

<GraphTimeline title="SHIPPED" :events="[{date:'Mar 12',label:'CLI copies the files'}, {date:'Mar 18',label:'Docs, live previews',state:'now'}, {date:'Apr 02',label:'Registry listed',state:'next'}]" />

<GraphTimeline title="SHIPPED">
<Event date="Mar 12">CLI copies the files</Event>
<Event date="Mar 18" state="now">Docs, live previews</Event>
<Event date="Apr 02" state="next">Registry listed</Event>
</GraphTimeline>

<GraphSpec title="TYPE" :rows="[{label:'Family',value:'Geist Mono'}, {label:'Size',value:'14 / 21'}, {label:'Tracking',value:'+0.02em'}, {label:'Figures',value:'tabular'}, {label:'Accent',value:'--graph-accent',accent:true}]" />

<GraphSpec title="TYPE">
<Field label="Family">Geist Mono</Field>
<Field label="Size">14 / 21</Field>
<Field label="Tracking">+0.02em</Field>
<Field label="Figures">tabular</Field>
<Field label="Accent" accent>--graph-accent</Field>
</GraphSpec>
