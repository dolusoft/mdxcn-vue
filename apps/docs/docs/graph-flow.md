# flow

<GraphFlow title="OPTIMISTIC UI">

tap → server → update

tap → **update** → *server syncs*

</GraphFlow>

<GraphFlow title="PUBLISH PATH">

write → review → ship

</GraphFlow>

`rows` wins, including `[]`; null uses `Path` markers, a list, paragraphs, then raw text lines. Arrows accept `→`, `->`, `—>` and `=>`. Bold nodes use the primary tone; italic nodes use the secondary tone. Each inline text node splits separately, matching upstream. `stretch` is available through typed data; arrows are decorative and retain upstream accent color independently of palette.

Loose list paragraphs keep a separating space. Runtime readers omit VitePress `header-anchor` links. Native DOM and classes follow upstream; reveal uses the shared `vReveal` directive with a 40 ms increment and a 240 ms cap. SSR is visible.
