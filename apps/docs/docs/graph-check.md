# GraphCheck

<GraphCheck title="LAUNCH">

- [x] freeze tokens
- [x] ship registry json
- [ ] write the postmortem — still open

</GraphCheck>

<GraphCheck title="REVIEW">

- [x] title is a sentence
- [x] numbers are tabular
- [ ] motion respects reduced — check the timer

</GraphCheck>

<GraphCheck title="RELEASE">

- [x] freeze tokens
- [ ] docs
  - [x] grammar page
  - [ ] mdx page — needs screenshots
- [ ] tag 1.3.0

</GraphCheck>

`items` wins, including `[]`; null uses a nonempty Markdown list, then `Task` markers. Markdown sublists are recursive; marker subtasks come only from `items`, not nested `Task` slots. `[x]` is case insensitive. A direct checkbox input also determines completion; an input inside a paragraph does not. Notes follow `splitDash`. The accessible count includes all depths; glyphs are decorative.

Loose list paragraphs keep a separating space. Runtime readers omit VitePress `header-anchor` links. Native DOM and classes follow upstream; reveal uses the shared `vReveal` directive with a 40 ms increment and a 240 ms cap. SSR is visible.
