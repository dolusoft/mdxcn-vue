# Registry generation and verification

The `pnpm registry:build` command uses our own `scripts/registry-build.mjs` script
to generate the `registry.json` source index and 52 `public/r/mdxcn-*.json` payload files.
The source index does not carry content; it points to actual TS/CSS files.
The `path` fields in the payload files match the source index; `.txt` is not required.
The `~/src/components/mdxcn/` target remains so that the CLI preserves the `src/` directory.

The `shadcn-vue build registry.json` command is not our distribution generator. The consumer
check adds the same MIT notice to the real CLI output and verifies its equality
with `public/r`. The `pnpm registry:check` command rejects stale generated output.

## Installation evidence without `.txt`

In a local `shadcn-vue 2.8.2` trial, the following command worked with closed stdin;
`--yes` and `--overwrite` were not used. Ten items/26 files were installed in the clean Phase 4A consumer.
The CSS/TS parsing error could not be reproduced; `.txt` was removed.

```sh
pnpm consumer:check
```

The installation command this check runs in the clean registry fixture directory:

```sh
pnpm exec shadcn-vue add ./registry-input/mdxcn-callout.json ./registry-input/mdxcn-core.json ./registry-input/mdxcn-css.json ./registry-input/mdxcn-endpoint.json ./registry-input/mdxcn-graph-frame.json ./registry-input/mdxcn-graph-stack.json ./registry-input/mdxcn-graph-table.json ./registry-input/mdxcn-graph-timer.json ./registry-input/mdxcn-quote.json ./registry-input/mdxcn-terminal.json
```

The briefing's byte-equality claim is not entirely correct on Windows: CSS files
are byte-identical, while the CLI writes TS files with CRLF line endings. The check only
normalizes the CRLF/LF difference; it does not use `trim()`, and the remaining content must be identical.
After the actual installation, the `vue-tsc --noEmit` and `vite build` commands also run.

Fixture directories use the existing `minimumReleaseAgeExclude` exception
for `vite@8.3.3` in the repository unchanged. Without this entry, installation of a new
consumer stops at pnpm's release-age check; the overall check is not disabled.

## Integration items

`mdxcn-graph-knap` is a pure TS `registry:lib` item; it contains the
`knap/graph-knap.ts` entry and renderer sources. It does not import the Vue runtime.
`mdxcn-mdx` distributes `Footnotes`, `Callout`, `Quote`, `Terminal`, and their source
dependencies. The host also configures the `withMdxcn` function in the `mdxcn-markdown`
package; the registry does not copy a second Markdown compiler.
