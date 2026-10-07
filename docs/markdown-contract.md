# Markdown compilation interface (Phase 2B-4)

The `mdxcnMarkdown` function in the `mdxcn-markdown` package is a `markdown-it` plugin.
It plugs into the VitePress `markdown.config` field; no additional Vite transform is required:

```ts
import { mdxcnMarkdown } from 'mdxcn-markdown'

export default {
  markdown: {
    config: (md) => { md.use(mdxcnMarkdown, { renderLinks: true }) },
  },
}
```

The `StackRow`, `StackSegment`, and `ProseNode` model types are defined in the
framework-independent `src/core/` directory of the `mdxcn-vue` package. The compiler converts
`markdown-it` token values into this model; it does not produce Vue VNodes. The parser
provided by the host is used; no runtime Markdown renderer is added.
The `labelContent` field carries the rich formatting of the text,
and the `label` field carries the accessibility text and row key.
The `segmentsFromText` fix is not a complete number grammar definition.

## Supported compilation blocks

- `GraphStack`: direct `ul > li` lists → `rows`; `strong`, `em`, `code`, and `link`
  are preserved within the row label. Nested and ordered lists use fallback.
- `GraphTable`: a single Markdown table → `headers`, `rows`, optional `footer`
  and `align`. The last row becomes the footer if its first cell is entirely bold or
  reads `Total`, and there are at least two body rows. `center` is ignored, as upstream does.
- `Endpoint`: paragraphs, at most one parameter table, and fence sections →
  `method`, `path`, `params`, `blocks`, `about`. Footer detection is not performed
  in the parameter table; an empty description becomes `undefined`. The `about` field
  carries one `ProseNode[]` per paragraph. Code indentation is preserved; only one trailing newline
  is removed. The `$ ` and `curl` prefixes produce a `request` label.
- `Annotate`: the first fence → `code` and the default `title`; direct `ol`/`ul`
  notes → `notes` containing rich `ProseNode[][]`. Markers are parsed in the runtime core
  reader. The precedence of the two data fields is independent; empty values
  do not fall back. If there is no code, an empty line is rendered. Notes containing multiple paragraphs or
  nested lists are left to the runtime reader to preserve their structure;
  nested note lists are not rendered, as upstream does.
- `Env`: the first fence (even if empty) → a nonempty direct list → raw text;
  the result is the `vars` array. An explicit `vars` field takes precedence over all Markdown inputs.
  List text uses the `KEY: value — note` format; a bold item
  produces the `required` flag. Core `parseEnv` preserves the upstream display
  grammar behavior: an empty line clears comments, invalid lines are skipped, and the ` #` sequence
  starts an inline comment even inside quotes. This is not a dotenv loader.
- `GraphTimeline`: `ol`/`ul` lists → `list`; the first visible paragraph becomes `head`,
  and subsequent paragraphs become `body`. The `date: label — note` text is parsed;
  if `body` exists, it takes precedence over the inline note. The `strong`/`em` state markers are searched for
  only within `head`, with `strong` taking precedence. Time text is preserved in the date field.
- `GraphSpec`: the same heading/body model → `list`; `label: value` is parsed.
  Code and links within `head` are preserved as rich values; the label prefix is trimmed
  using the raw text offset. `strong` produces an accent only in the heading. The body is the note.
  Unsupported token values such as `del`/`s` are preserved in the runtime path.

These two components use the following order: data props (`events`/`rows`) → compiler `list` input or
a nonempty host list → `Event`/`Field`. An empty data array
suppresses the slot; `null`/`undefined` use fallback. Data and item notes contain Vue
`VNodeChild`. The `StateListItem.head`/`body` fields are optional to avoid breaking
existing users' older inputs; the 5C compiler produces them.
The older `Steps`, `Changelog`, `Decision`, and `Keys` grammar/payload behavior is preserved.

The plugin captures raw blocks before the `html_block` rule; it leaves body token values
to the host core rules. Model conversion happens after the `inline`, emoji, typographer, and
`text_join` steps, and before the `anchor` step. The text meaning of the host entity
renderer function is decoded once; `text_special` is treated as text.
JSON is escaped for an HTML attribute and passed to the component via `v-bind`;
the Markdown slot is removed from a successful block. A multiline opening tag
is limited to 33 lines for components supported by the model compiler; opening/closing tags must be on their own lines. A blank line is required
between an outer HTML wrapper and the component to establish a Markdown block boundary.
If a list follows the opening tag, a blank line is inserted before it. Otherwise, VitePress
treats the list as raw HTML text; both paths preserve this behavior and issue a warning.
Blocks without a closing tag and blocks with a body on the opening line also issue warnings with locations.
Warning lines account for the frontmatter offset; `@include` locations refer to the expanded
host file, with no separate source mapping to the included file.

The `renderLinks: true` option uses the host `link_open` renderer function to preserve
VitePress URL transformation, dead-link recording, and the `title`, `target`, and `rel` fields.
The default, `false`, preserves the original href value. Since reference link definitions
are completed before inline conversion, later definitions can also be compiled.
Whitespace in table and list text is normalized with the same core function in both paths.
The fence language label is separated from metadata using the `/^[^\s:{[]+/` rule; `c++`,
which the VitePress highlighter function truncates, is recovered from the source metadata value.
Fences without a language are preserved with an `undefined` label. The accessible name
of an Endpoint code region includes both the caption and the code label.

## Fallback and trust boundary

If `{{ }}` interpolation, Vue directives, custom components, item tags, raw
HTML, unsupported inline/block tokens, or unresolved reference links
are found, the block is not converted. Blocks with explicit data props also
use fallback to preserve field-level runtime precedence. The source Markdown
is left to normal host compilation; a `[mdxcn-markdown] file:line` warning states the reason.
The `warn` callback option receives the same information in structured form. The source range
of a successfully compiled block is stored in the token `map` field.

**Only trusted Markdown within the repository is used.** The generated Vue template
is executable; this plugin does not provide sanitization for user input.
Runtime Markdown/Comark is outside the scope of this phase. Compilation support for `GraphTimer`
was not added; its existing runtime contract continues.

## `withMdxcn` transformations

The separate `withMdxcn` plugin plugs into the same trusted Markdown host.
The `alerts`, `quotes`, `terminals`, and `footnotes` options default to `true`.
GitHub alerts and upstream Obsidian alias values target `Callout`; quotes with a
`—`/`―`/`–`/`--` byline marker on the last line target `Quote`; console/session fences
and shell fences with predominantly `$ ` prompts target `Terminal`.
Shell scripts without prompts remain unchanged. The host produces footnote token values;
VitePress provides this, while a plain `markdown-it` host installs its own footnote plugin.

The `components` list contains only the `Callout`, `Quote`, `Terminal`, and
`Footnotes` names registered by the host. Listed targets produce component tags;
`type`/`title` for `Callout`, `by`/`source` for `Quote`, and
`prompt`/`text` for `Terminal` are passed through JSON binding. `Footnotes` wraps the original host
section; ID, forward-link, and backlink values are preserved.
In Phase 4A, `Callout`, `Quote`, and `Terminal` are provided as real Vue components.
For `Terminal`, `text` is a compiler input that does not exist upstream: an explicit value takes precedence
over slot text; an empty string suppresses the slot, while `null`/`undefined` read the slot.
The bodies of prose components remain slots; there is no item adapter.
Fences inside `Terminal`, `Endpoint`, `Annotate`, and `Env` tags are left to their own readers;
no nested automatic `Terminal` is produced.

`withMdxcn` also processes `blockquote` token values inside a frame: an alert/byline
in an explicit `Callout` or `Quote` body can be converted to a registered target.
There is no general transformation barrier for the frame. Only matching code reader
tags prevent fence upgrades; HTML comments and unclosed tags
do not block subsequent fences.

The default empty list produces HTML with a source-located warning: host alert output
(`aside` if it has no alert renderer function of its own), a `blockquote` with a byline, the host
`pre > code` structure, and the original footnote section. Rich body formatting is preserved.
Options disable only this plugin's transformations; they do not disable host features
such as VitePress's own alert function. The registry contains sixteen components plus frame,
core, and CSS files, for a total of nineteen items.

Runtime Endpoint unwraps the VitePress `div.language-* > pre` wrapper by one level;
`button.copy` and `span.lang` are not treated as content. If the highlighter has removed
empty lines at the end of the source code, the VNode reader cannot restore them. The compilation
path preserves the raw fence value; for this reason, the significant trailing newline parity fixture
uses direct `pre > code` runtime input.

## Verification

Token → model tests use independent expected objects. The docs config test
verifies transformation on three real pages. The production fixture tests each of the compilation/runtime
paths against independent expected cell, prose, glyph, accessible name, and
whitespace-sensitive code values; it then checks DOM equality.
Only caption IDs are normalized, and Vue comment nodes are removed;
the uniqueness and relationships of actual IDs are verified separately. Code whitespace
is not collapsed. Browser hydration and visual measurements require separate verification.

The Phase 2A reader accepts only the `ul > li` structure at the slot root, optional `p`/`span`,
and `strong`/`em`/`code`/`a` nodes. `Fragment` is unwrapped, and `Comment`
is filtered out. Custom component boundaries and nested lists are not interpreted. The item schema reads
only declared fields; it converts kebab-case keys to camelCase,
sets empty boolean values to `true`, and applies defaults. Slots are not cached
inside `computed`; they are read on each render.

## VitePress fence appearance inside Callout

The `Callout` body preserves the host-generated slot. For a code fence, VitePress
produces a `div.language-*` wrapper, a theme-dependent background, `button.copy`,
`span.lang`, and a vertical `1rem` margin (16 px with the default root font).
On narrow screens, the horizontal margin is `-1.5rem`; above `40rem`, it is `0`.
These are not part of the upstream `GraphProse` contract;
the current `host.css` does not neutralize this fence interface. Therefore,
visual upstream parity is not guaranteed for this input format. A plain `pre > code`
slot uses the upstream prose structure without the VitePress fence interface.

This boundary was documented: the host interface was preserved in this narrowly scoped delivery
because a general CSS reset would change copy/language and highlighter features.
Fence spacing and light/dark colors should be measured separately in the browser.

## Terminal opening tag limit

`Terminal` is not among the components supported by the model compiler above.
An explicit `Terminal` tag must be written on a single line; a multiline opening
tag is not supported in the Markdown host path:

```md
<Terminal prompt="$">
```

An opening tag split across three lines as `<Terminal` / `prompt="$"` / `>`
is read by `markdown-it` as a paragraph and blockquote. A console fence inside it
may also receive an automatic `Terminal` transformation; the outer tag is not considered
a preserved runtime component. The 33-line support does not apply to this tag.
