# Chat

A conversation from a speaker-prefixed Markdown list or typed turns.

## Session

<Chat title="SESSION">

- you: which graph shows a rollback?
- agent: Timeline. Bold the row where you rolled back.
- agent: *reads graph-timeline.tsx*
- agent: Then Diff for what the rollback changed.
- you: and on GitHub?
- agent: Paste the fenced ASCII. GitHub does not run MDX.

</Chat>

## Support thread

<Chat title="SUPPORT" you="priya">

- priya: the timeline renders empty in our docs

- jon: Do you swap `li` in mdx-components?

  Wrap the map in `withMdxcn` and the graphs see list items again.

- priya: that was it

</Chat>

## Typed data

<Chat title="DATA" :turns="[{ by: 'you', children: 'Which input?', aside: false }, { by: 'agent', children: 'Typed turns or a Markdown list.' }]" />

```vue
<Chat :turns="[{ by: 'you', children: 'Hello' }]" />
```

`turns` wins over Markdown, including an empty array; `null` and `undefined`
allow fallback. There is no item API. Each turn has `by`, optional Vue
`children`, and optional boolean `aside`. A speaker prefix must contain 1–24
characters before `:`; list items without one are ignored. Nested lists are
excluded. Loose list turns retain body paragraphs and rich inline content.

`you` defaults to the first speaker. Asker matching is case-insensitive;
adjacent speaker grouping is case-sensitive. An explicit empty `you` suppresses
prompts for nonempty speaker names. A lone italic message with no body is an
aside. Repeated speakers keep screen-reader text but hide the visible label.

The title defaults to `chat` and `prompt` to `>`; `palette`, `corner`,
`className`, and Vue frame attrs are supported. `list` is an internal compiler
input. Trusted Markdown compiles supported lists; complex bodies and explicit
data props use the runtime reader. SSR stays visible; stagger is capped at 300 ms.
