# Changelog

Release notes with added, changed, fixed, and removed states.

## Release

<Changelog version="1.2.0" date="Mar 12">

- added: Callout, Quote, Steps, Terminal, Changelog
- changed: Graphs read MDX children as well as arrays
- fixed: Timeline connector on Safari
- removed: The legacy accent prop

</Changelog>

## Titled

<Changelog title="CHANGELOG" version="0.9.0" date="Feb 02">

- added: Knap filters
- fixed: Uptime wraps at 30 days on narrow screens

</Changelog>

## Items

<Changelog version="1.2.0"><Change type="add"><p>Read <a href="./steps.html">Steps</a>.</p></Change><Change type="fix">Timeline connector on Safari</Change><Change type="remove">The legacy accent prop</Change></Changelog>

```vue
<Changelog version="1.2.0">
  <Change type="add"><p>New <code>Steps</code> component.</p></Change>
  <Change type="fix">Timeline connector on Safari</Change>
</Changelog>
```

A nonempty direct `ul` or `ol` list wins over `Change` markers; empty lists allow
marker fallback. List text splits `type: body` and becomes plain text, as in
upstream. Item slots preserve rich markup. Type aliases are `add`, `added`, `+`;
`change`, `changed`, `~`; `fix`, `fixed`, `*`; `remove`, `removed`, `-`.
Unknown types in list text use `change`. `Change` defaults to `change`.

`version` is required. The frame title uses `title ?? version`; an empty title
suppresses the caption. A date or nonempty title adds a metadata row.
`palette`, `corner`, `className`, and Vue frame attrs are supported. There is no
upstream data array API; `list` is compiler input. Complex markup and dynamic
content fall back to the runtime reader with a compiler warning.

SSR is visible. Reveal delays grow by 50 ms and stop at 250 ms. The upstream
mobile layout hides the type labels; decorative glyphs remain `aria-hidden`.
