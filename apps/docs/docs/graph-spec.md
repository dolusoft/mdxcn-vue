# spec

Rows take precedence over lists, then Field markers. Empty rows suppress the slot; null and undefined read it. Bold in the head accents the value. Inline code and links survive in list values; body paragraphs become notes.

`Field.label` is required; `value` falls back to child text. `note` accepts Vue content. Data rows have plain string values; rich inline values use lists. `corner`, `className` and Vue attrs apply to the frame. Reveal delays cap at 200 ms; SSR and reduced motion stay visible.

## Example 1

<GraphSpec title="TYPE">

- Family: Geist Mono
- Size: 14 / 21
- Tracking: +0.02em
- Figures: tabular
- **Accent: --graph-accent**

</GraphSpec>

## Example 2

<GraphSpec title="SHIP TO">

- Name: A. Rao
- City: Bengaluru
- Carrier: Delhivery
- **ETA: Thu**

</GraphSpec>

## Example 3

<GraphSpec title="INSTALL">

- Command: `pnpm dlx shadcn@latest add @mdxcn/all`

- Lands in: `registry/default`

  Edit it there. Nothing to update later.

- Needs: [motion](https://motion.dev)

</GraphSpec>
