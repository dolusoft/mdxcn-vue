# Keys

Keyboard shortcuts from Markdown lists or typed bindings.

## Shortcuts

<Keys title="SHORTCUTS">

- **⌘K: search the docs**
- ⌘⇧C: copy the page as Markdown
- Ctrl+Shift+P: command palette
- g then d: go to docs
- Esc: close

</Keys>

## Typed data

<Keys title="DATA" :bindings="[{ keys: '⌘K', action: 'search the docs', accent: true }, { keys: 'Ctrl+Shift+P', action: 'command palette' }, { keys: 'g then d', action: 'go to docs' }]" />

```vue
<Keys :bindings="[{ keys: '⌘K', action: 'search', accent: true }]" />
```

`bindings` wins over Markdown, including an empty array; `null` and `undefined`
allow fallback. Each binding has string `keys` and `action`, with optional
boolean `accent`. There is no item API. List items use `keys: action`; bold
anywhere in an item marks it accented. Actions are plain text.

`⌘⇧P` splits into modifier glyphs and `P`; `Ctrl+Shift+P` splits at `+`.
Whitespace also separates keys; case-insensitive `then` starts another chord.
The original shortcut is read once by assistive technology; visual caps and
brackets are decorative. The component displays shortcuts and does not bind
keyboard events.

The title defaults to `keys`; `palette`, `corner`, `className`, and Vue frame
attrs are supported. Trusted Markdown compiles supported lists; complex bodies
and explicit bindings use the runtime reader. SSR stays visible; stagger is
capped at 200 ms.
