# GraphStack

Stacked glyph tracks from typed rows, Markdown lists or declarative items. These
examples use the pinned upstream `bundle` and `tokens` datasets.

## Typed rows

<GraphStack title="BUNDLE" palette="multi" :rows="[
  { label: 'marketing', segments: [{ label: 'js', value: 48 }, { label: 'css', value: 22 }, { label: 'images', value: 30 }] },
  { label: 'docs', segments: [{ label: 'js', value: 28 }, { label: 'css', value: 18 }, { label: 'images', value: 54 }] }
]" />

```vue
<GraphStack title="BUNDLE" palette="multi" :rows="rows" />
```

## Markdown list

<GraphStack title="BUNDLE" palette="multi">

- marketing: 48 js, 22 css, 30 images
- docs: 28 js, 18 css, 54 images

</GraphStack>

```md
<GraphStack title="BUNDLE" palette="multi">

- marketing: 48 js, 22 css, 30 images
- docs: 28 js, 18 css, 54 images

</GraphStack>
```

## Item tags

<GraphStack title="BUNDLE" palette="multi">
  <Bar label="marketing">
    <Segment :value="48">js</Segment>
    <Segment :value="22">css</Segment>
    <Segment :value="30">images</Segment>
  </Bar>
  <Bar label="docs">
    <Segment :value="28">js</Segment>
    <Segment :value="18">css</Segment>
    <Segment :value="54">images</Segment>
  </Bar>
</GraphStack>

```vue
<GraphStack title="BUNDLE" palette="multi">
  <Bar label="marketing">
    <Segment :value="48">js</Segment>
    <Segment :value="22">css</Segment>
    <Segment :value="30">images</Segment>
  </Bar>
</GraphStack>
```

## Mono tokens

<GraphStack title="TOKENS" :ticks="28">

- week: 61 prompt, 27 completion, 12 cached

</GraphStack>

## Scoped accent and duo palette

<div data-accent="sunset">

<GraphStack title="TOKENS" palette="duo" :ticks="28" accent="completion">

- week: 61 prompt, 27 completion, 12 cached

</GraphStack>
</div>

`rows` takes precedence, including an empty array; otherwise a nonempty direct
Markdown list wins over `Bar` items. Item parsing runs in each render. Fragments
and comments are supported; custom wrappers, nested lists and arbitrary host
trees are outside this reader's contract. Inline strong/emphasis/code/links in
Markdown row labels retain their structure.

The `mdxcn-markdown` plugin compiles these repository Markdown lists to typed
`rows` before rendering. Dynamic content, item components and unsupported grammar
retain their runtime slots with a source-position warning. The runtime reader
remains available for application slots.

Import `tailwindcss` and `mdxcn-vue/theme.css` for the optional complete theme, or
`mdxcn-vue/host.css` to connect existing `--background`, `--foreground` and
`--destructive` host tokens. `mdxcn-vue/graph.css` exposes just graph utilities and
the package-local Tailwind v4 source registration. Supply Geist Mono yourself for
font parity. The muted token meets 4.5:1 against the supplied light/dark background;
custom host backgrounds must verify their own contrast.

SSR content is visible. After observer setup, offscreen rows reveal once over
220ms with a 50ms stagger; rows already in view stay visible on hydration.
Reduced motion disables reveals and cancels active animations.
