# Phase 10A — Comark runtime adapter

Time obtained from the system: 2026-10-07 Wednesday 04:55 (Europe/Istanbul).
Starting point: `main`, `d4535d7`; the uncommitted adapter changes from the
previous run were preserved and completed. No dev server or npm publication was performed.

## Delivery

`createGraphComponents` maps selected components, while `graphComponents` maps
46 graphs and the `row` layout component to Comark tags. `coerceProps`, upstream
`numeric`/`required` hints, `PendingGraph`, the public API, and registry delivery
were completed. Existing graph models and item adapters were reused; field
priority remains in the graph component. Custom component contents are not expanded.
Inside a table, `row` is an item marker; in other contexts, it is a responsive layout.

The `/docs/comark` page uses the real `MarkdownDocument` renderer under
`Suspense`. The VitePress data loader parses body/YAML examples during the build;
the production output contains three visible figures and a responsive row. The
absence of a parser in the client bundle was also tested.

## Dependency decision

`pnpm add` was used with user approval: `comark` and `@comark/vue` **0.7.0**
were added to the Vue package's `devDependencies`, `@comark/vue` **0.7.0** to
the docs host's `dependencies`, and `comark` **0.7.0** to its `devDependencies`.
The test imports the parser directly; docs uses the parser during the build.
The adapter's only runtime dependency is the existing Vue peer package; Comark
belongs to the host. The clean tarball consumer also installs both Comark
packages at the same version.

In the installed `@comark/vue` manifest, the `katex`, `beautiful-mermaid`, and
`shiki` peers have `peerDependenciesMeta.optional: true`. They were not added
because these features are not used. Package manifests and the published
renderer source were read; framework internal APIs were not ported.

## Verification and corrected errors

The 21 family examples in the independent JSON fixture were tested with real
`parseMarkdown` and the Vue renderer. Stack/table item markers, PendingGraph →
Markdown body → YAML/binding updates, and SSR/hydration were also checked through
the real parser. The hydration test has no mismatch or invalid prop warnings.
There are **52 new Vue tests**, including numeric coercion edge cases, data
priority, native attribute forwarding, remounting, and the public type contract.
Two tests were added to docs.

- The use of `doc.document` in the upstream `COMARK_WIRE` example is incorrect
  with 0.7.0: the real parser returns the document directly. The new example uses `value=document`.
- `█ 3` in the initial docs stack example did not match the segment grammar. It
  was corrected to `3 js`; the segment's `aria-label` value is also checked.
- `GraphStack` used in the previous run's consumer type fixture had not been
  imported. The NodeNext check caught the error; the import was added.
- Creating the new full map at the top level caused all graphs to enter the
  bundle for a consumer using only `GraphStack`. The `@__PURE__` annotation was
  added to the pure calls that create the map and the `graphTags` array.
  The existing tree-shaking check passed again; expectations were not relaxed.

Final acceptance commands, exit code **0**:

```text
pnpm install              PASS
pnpm -r build             PASS
pnpm -r test              PASS: Vue 807, Markdown 363, docs 76
pnpm lint                 PASS
pnpm typecheck            PASS
pnpm format:check         PASS
pnpm consumer:check       PASS
pnpm registry:build       PASS: 50 items
pnpm registry:check       PASS: 50 items
```

A total of **1246 tests**, **54 new tests** compared with the initial 1192 tests.
Consumer outputs:

```text
COMARK PACKED CONSUMER PASSED: real parser and Vue renderer
TYPE CONTRACT PASSED: NodeNext, skipLibCheck=false; invalid fields rejected
TREE-SHAKE full=299272 bytes GraphStack=168744 bytes removed=130528 bytes
Vue runtime entries=1
LIBRARY ONLY: full=122196 bytes GraphStack=14721 bytes
REGISTRY INSTALL PASSED: shadcn-vue 2.8.2, 50 items, 103 source files
CONSUMER CHECK PASSED; fixture removed
```

Bundle measurements have minification disabled; library figures are calculated
from source maps excluding Vue. The check for 3 compiled and 45 registered
figures in the VitePress consumer passed. Registry CLI source/payload equality,
prompt-free installation with stdin closed, typecheck, and build passed. Logs
are in `C:/Users/zahid/source/github/tmp/mdxcn-vue/f10a-*.log`, and the results
summary is in `consumer-results.json`. Expected Markdown fallback warnings from
existing fixtures may appear during the build; acceptance commands finished with zero.

## `mdx` assessment and intentional differences

Upstream `mdx` is not a separate graph: it handles alert → `Callout`, byline →
`Quote`, console/shell session → `Terminal`, the footnote frame, and preservation
of MDX host tags. `withMdxcn` in `mdxcn-markdown` covers the initial transformations
in the existing Markdown host. The React component-map API was not ported to Vue;
a separate `mdx` registry item and `Footnotes` distribution should be evaluated
in Phase 10B. No `mdx` code or `graph-knap` changes were made in this round.

Vue preserves the native `class` field; React `className` conversion is not
applied. Kebab key conversion preserves `data-*` and `aria-*` fields. Missing
required data produces PendingGraph; the gate is bypassed when a body exists,
and the field priority of an explicitly empty array remains in the existing
graph. Changed props remount the graph; body updates proceed through Vue
reactivity. Network streaming and retaining the last successful document when
YAML parsing fails are the host's responsibility.

## Commit and subsequent visual acceptance

Small docs corrections were pushed in the previous run with the separate
unsigned commit `d4535d7`. This delivery is staged by filename and enters the
unsigned commit and normal push workflow with user authorization; the final
commit ID is provided in the delivery message.

No browser/E2E measurements were made. Responsive row, layout and CLS during
streaming, glyph/font fallback, light/dark contrast, reduced motion, and
observer/WAAPI behavior must be measured in a live browser session. Passing
acceptance commands does not replace these visual measurements.
