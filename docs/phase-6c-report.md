# Phase 6C — Chat margin and final numeric-list delivery

Starting point: `main`, `815c017`; the working tree was clean. The upstream
checkout `16d817ad5ec54d89142e4c1cf26027b60d6df853` was verified by command.
Three sources, shared readers, and seven upstream examples were read. System time:
2026-10-07 Wednesday 02:50 (Europe/Istanbul).

## Assumptions corrected from the briefing

- `GraphGantt` does not draw date ranges: `start`/`end` are numeric fractions,
  and `ticks` are text labels. No date parser was added. The upstream `numberOf`
  behavior for invalid values and date-like strings was tested.
- `GraphDiff` contains three examples; a total of seven independent examples/28 figures were used.
- `Keys` uses `dl` rather than list rows; the `li + li` rule does not apply.
- The old registry counts in the README were corrected to the actual 28 generated items.

## Implementation and shared reader decision

For `Chat`, the unlayered `li + li { margin: 0 }` rule became `revert-layer`.
The cascade test with real build CSS and the VitePress rules loaded last
verifies that `mt-4`/`mt-1` utility rules win and that list rows without utilities
retain the preflight `margin: 0` value.
Steps, Changelog, Decision, Env, GraphStack, and all completed numeric-list
components are covered; the actual `dl` structure is verified for Keys.

`GraphGantt`/`Span`, `GraphDiff`/`Line`, and `GraphWaterfall`/`Delta` were added
with typed props, framework-independent models, and item adapters. Gantt/Waterfall
use the shared `numericList` reader. Diff uses the same plain text/strong
description but separately reads the direct `del`/`s` host structure of the first
paragraph with `itemParts`: a text-only model would lose rewrite information.
`del` was added to the `ProseNode` model; Markdown compiler strike token support
is enabled only for GraphDiff. There is no VNode cloning/modification in the new paths.

Data → explicit compiler `list` → nonempty runtime list → item priority was
implemented. An empty data/list array overrides fallback input; null falls back.
Diff selects `rows` and `footer` independently, and the first `total` footer
wins. Empty `rows` do not override the list footer field. An explicitly empty
item label is preserved.

Upstream DOM/class/a11y, Gantt completion/playhead/stage/tick labels, Diff
markers and shared prefix rewrite, Waterfall cumulative ranges, negative running
totals, and explicit start/end reset behavior were preserved.
Gantt/Waterfall use 50 ms increments/a 250 ms cap; Diff uses 40 ms increments/a
200 ms cap. In each, the cap was tested with only the last of 60 rows visible.

The Markdown, runtime host, prop, and item paths of the seven examples produce
the same DOM; caption IDs are unique and SSR is visible. The three components
pass hydration without warnings and compiled dynamic slot updates. Hydration
also covers the Gantt axis/playhead, Diff rewrite/footer, and a negative
Waterfall total.
Waterfall numbers are formatted with an explicit `en-US` locale, as upstream;
there is no date formatting or timezone dependency. Unicode minus numeric input
becomes 0, as upstream; the final row total is not calculated automatically and
uses the supplied value.

Docs/sidebar, README, inventory, public API/core export snapshots, ESLint item
names, and registry/consumer checks were updated.

## Acceptance output

The full chain returned **exit 0**:

```sh
pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check && pnpm consumer:check
```

| Check | Result |
| --- | --- |
| Install | `Already up to date`, lockfile unchanged |
| Build | Vue, Markdown, VitePress client/server/static pages successful |
| Test | Vue 397, Markdown 213, docs 51; **661**, none failed/skipped |
| New tests | **44**: Vue 22, Markdown 19, docs 3; starting count 617 |
| Lint / typecheck | ESLint and three workspaces successful |
| Format | `All matched files use Prettier code style!` |
| Registry build/check | `28 items from library sources` |
| Registry CLI | 28 items, 62 source files; payload equality, typecheck/build successful |
| Consumer | `CONSUMER CHECK PASSED`; 24 figures in the registered VitePress consumer |
| Package types | Bundler/NodeNext, `skipLibCheck=false`; incorrect field types rejected |
| Tree shaking | One Vue runtime; full 234994 bytes, GraphStack 167628 bytes |
| Library only | Full 68106 bytes, GraphStack 13672 bytes excluding Vue |

The `start` field in the `GanttDiffWaterfallTypes.vue` fixture was temporarily
set to `true`; root `pnpm typecheck` returned exit 1:

```text
test/fixtures/GanttDiffWaterfallTypes.vue(4,31): error TS2322: Type 'boolean' is not assignable to type 'string | number'.
```

The fixture was restored to its original byte content; typecheck passed in the
final full chain. Evidence is in `f6c-acceptance.log`, `f6c-negative.log`,
`f6c-consumer.log`, and `consumer-results.json` under
`C:/Users/zahid/source/github/tmp/mdxcn-vue/`.

## Test expectations and issues corrected during the work

The existing cascade test now expects the base margin value rather than the
graph reset selector; this is necessary because `revert-layer` takes the selected
value from the base layer. Tailwind simplifies `mt-1` to `var(--spacing)`;
the added test was corrected to match the actual compiled expression. An
incorrect table assumption was initially added to the Keys test; it was adapted
to the actual `dl` structure. The first Chat commit was made while this test was
failing; the incorrect command order did not stop the acceptance failure before
the commit. The correction was pushed in a separate commit; the final chain is green.

The new Gantt test had an incorrect opacity expectation for the duo palette;
upstream `seriesDim` defines 0.4 only for the mono palette, but the motion `show`
variant sets opacity to 1, removing this dimming. In the Vue implementation,
`stage` dimming is permanent. The test was corrected to verify both cases.
The Diff decorative `+` check also included graph corners; the selector was
narrowed to row markers. The new Gantt playhead selector was corrected to the
actual span track structure. An unnecessary regex escape lint error was fixed.
No existing component data/behavior expectations were relaxed.

Public API snapshots expanded with the new export names; the registered consumer
figure expectation changed from 21 → 24, and registry items from 25 → 28. Registry
payload changes were generated from the new dependency closure and shared
`ProseNode` type. Existing files' line endings were preserved.

## Intentional differences and measurements to make in the browser

The existing `vReveal`, Vue item markers, and compiler `list` input are used
instead of React Motion. The string forms of Gantt `columns` and Waterfall
`ticks` support Vue attribute usage. Custom component boundaries are opaque;
Fragment is transparent. Upstream number grammar, clamping, and drawing at
least one cell at zero width are preserved.

No dev server, live browser/E2E session, or npm publication was performed; no new
dependency was added. The actual 16/4 px margin and 302 px figure height for Chat
will be measured again. Light/dark, narrow-screen overflow, long label clipping,
Gantt playhead alignment, Diff marker contrast, negative Waterfall alignment,
screen reader order, visibility with JS disabled/reduced motion, CLS, and actual
observer/WAAPI delay are browser checks. Automated cascade/hydration does not
replace these measurements.

Delivery uses an explicitly authorized unsigned commit and normal push without
bypassing hooks. Commit IDs, a clean working tree, and equality with `origin/main`
are reported in the final message as verified by command.
