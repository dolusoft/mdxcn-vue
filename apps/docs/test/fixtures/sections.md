# Sections parity

<Faq>

### Is this an npm package?

No. The CLI copies the source into `registry/default`. You own it.

### Does it need MDX?

No. Comark reads `::graph-*` blocks from plain `.md`, and every figure has a fenced ASCII twin for GitHub.

### **Why is my timeline empty?**

Your `mdx-components.tsx` swaps `li` for its own component. Wrap the map in `withMdxcn`.

</Faq>

<Faq ><div></div><h3>Is this an npm package?</h3><p>No. The CLI copies the source into <code>registry/default</code>. You own it.</p><h3>Does it need MDX?</h3><p>No. Comark reads <code>::graph-*</code> blocks from plain <code>.md</code>, and every figure has a fenced ASCII twin for GitHub.</p><h3><strong>Why is my timeline empty?</strong></h3><p>Your <code>mdx-components.tsx</code> swaps <code>li</code> for its own component. Wrap the map in <code>withMdxcn</code>.</p></Faq>

<Faq  :entries='[{"question":"Is this an npm package?","accent":false,"answer":[{"tag":"p","content":[{"type":"text","value":"No. The CLI copies the source into "},{"type":"code","children":[{"type":"text","value":"registry/default"}]},{"type":"text","value":". You own it."}]}]},{"question":"Does it need MDX?","accent":false,"answer":[{"tag":"p","content":[{"type":"text","value":"No. Comark reads "},{"type":"code","children":[{"type":"text","value":"::graph-*"}]},{"type":"text","value":" blocks from plain "},{"type":"code","children":[{"type":"text","value":".md"}]},{"type":"text","value":", and every figure has a fenced ASCII twin for GitHub."}]}]},{"question":"Why is my timeline empty?","accent":true,"answer":[{"tag":"p","content":[{"type":"text","value":"Your "},{"type":"code","children":[{"type":"text","value":"mdx-components.tsx"}]},{"type":"text","value":" swaps "},{"type":"code","children":[{"type":"text","value":"li"}]},{"type":"text","value":" for its own component. Wrap the map in "},{"type":"code","children":[{"type":"text","value":"withMdxcn"}]},{"type":"text","value":"."}]}]}]' />

<GraphBoard title="ROADMAP">

### Shipped
- Callout, Steps, Terminal
- Comark adapter

### Now
- **Children for every graph**
- Board and Score — this drop

### Later
- *Figma kit*
- *Vue port* — if someone asks twice

</GraphBoard>

<GraphBoard title="ROADMAP"><div></div><h3>Shipped</h3><ul><li>Callout, Steps, Terminal</li><li>Comark adapter</li></ul><h3>Now</h3><ul><li><strong>Children for every graph</strong></li><li>Board and Score — this drop</li></ul><h3>Later</h3><ul><li><em>Figma kit</em></li><li><em>Vue port</em> — if someone asks twice</li></ul></GraphBoard>

<GraphBoard title="ROADMAP" :columns='[{"title":"Shipped","items":[{"label":"Callout, Steps, Terminal","state":"done"},{"label":"Comark adapter","state":"done"}]},{"title":"Now","items":[{"label":"Children for every graph","state":"now"},{"label":"Board and Score","note":"this drop","state":"done"}]},{"title":"Later","items":[{"label":"Figma kit","state":"next"},{"label":"Vue port","note":"if someone asks twice","state":"next"}]}]' />

<GraphBoard title="SPRINT 14" palette="duo">

### Todo
- *Postmortem for the cache flag*

### Doing
- **Roll back cache.v2**

### Done
- Page the on-call
- Freeze deploys

</GraphBoard>

<GraphBoard title="SPRINT 14" palette="duo"><div></div><h3>Todo</h3><ul><li><em>Postmortem for the cache flag</em></li></ul><h3>Doing</h3><ul><li><strong>Roll back cache.v2</strong></li></ul><h3>Done</h3><ul><li>Page the on-call</li><li>Freeze deploys</li></ul></GraphBoard>

<GraphBoard title="SPRINT 14" palette="duo" :columns='[{"title":"Todo","items":[{"label":"Postmortem for the cache flag","state":"next"}]},{"title":"Doing","items":[{"label":"Roll back cache.v2","state":"now"}]},{"title":"Done","items":[{"label":"Page the on-call","state":"done"},{"label":"Freeze deploys","state":"done"}]}]' />

