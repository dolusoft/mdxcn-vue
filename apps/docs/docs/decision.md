# decision

Options, reasons, and the prose that follows a decision. Bold selects chosen;
italic selects rejected; plain items remain open.

## Database

<Decision title="DATABASE" status="accepted" date="Mar 12">

- **Postgres** — boring, and we already run it
- *Mongo* — no joins we trust
- SQLite — fine until the second writer

Revisit if writes pass 2k a second.

</Decision>

## Rendering

<Decision title="CHARTS">

- **Glyphs in a frame** — copy the source, no chart runtime
- *SVG* — does not survive a README
- *Canvas* — no text to select or search
- Mermaid — fine for flows, wrong for numbers

Every figure has a fenced twin for GitHub.

</Decision>

## Typed data

<Decision title="DATABASE" :options="[{ label: 'Postgres', reason: 'boring, and we already run it', state: 'chosen' }, { label: 'Mongo', reason: 'no joins we trust', state: 'rejected' }, { label: 'SQLite', reason: 'fine until the second writer' }]"><p>Revisit if writes pass <code>2k</code> a second.</p></Decision>

```vue
<Decision :options="[{ label: 'Postgres', state: 'chosen', reason: 'Already running' }]">
  <p>Revisit later.</p>
</Decision>
```

`options` wins over direct `ul` or `ol` list items. An empty array suppresses
list options; `null` and `undefined` allow fallback. All non-list element prose
still renders, including prose before the list. Raw text outside elements is
ignored, matching upstream. Labels and reasons are plain text; surrounding prose
retains code, links, strong and emphasis. Bold anywhere in an item wins over italic.
Only the first chosen option is used in the screen-reader summary.

The title defaults to `decision`. `status`, `date`, `palette`, `corner`,
`className`, and Vue frame attrs are supported. There is no item API.
`after` is compiler input for prose paragraphs. Complex HTML, nested lists and
explicit data props use the runtime path with a compiler warning.

SSR is visible. Reveal delays grow by 50 ms and stop at 250 ms;
reduced motion skips animation.
