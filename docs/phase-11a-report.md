# Phase 11A — Pre-release cleanup

Starting point: `main`, `33c90b4`; the working tree was clean. System time:
2026-10-07 Wednesday 05:31 (Europe/Istanbul).

## Tree-shaking behavior of the root entry point

The 135.831-byte equality in the briefing could not be reproduced. In the new
measurement under the same conditions, the two components already differed in
size; however, unused item registrations and frame helpers remained in the
bundle. `sideEffects: ["**/*.css"]` already existed; CSS was not loaded from the
root JavaScript entry. `graphComponents` and knap factory calls already carried
the `@__PURE__` annotation.

The missing annotations were on the components' `defineComponent`, the item
markers' `defineItem`, and the frame helpers' `host` calls. These calls only
create the object they return. `defineItem` only writes the new object's schema
into a `WeakMap`; discarding the registration of an unused object does not affect
the registrations of objects in use. These calls were annotated while preserving
the public API, registration structure, and CSS contract. Registry source outputs
were regenerated.

`scripts/tree-shaking-check.mjs` runs a Vite 8.3.3/Rolldown production build with
the same Vue runtime and `minify=false`. The export value of a single entry is
assigned to a global field, so the import cannot be eliminated entirely. “All”
keeps the entire root export set live. HTML, mount, and CSS are absent from this
measurement; Vue is included.

| Root import | Before (bytes) | After (bytes) |
| --- | ---: | ---: |
| All export values | 258214 | 258797 |
| `GraphStack` | 74893 | 51045 |
| `Footnotes` | 69472 | 45333 |

The single-component/all-export ratio and the absence of unrelated
Footnotes/knap/Comark and item/frame symbols in the `GraphStack` bundle are tested
automatically. The check was integrated into `consumer:check`; single-component
size and a separate build for `Footnotes` are also tested in the packed tarball consumer.

Initial verification: **900 tests passed** in the Vue package; the tarball
consumer check passed with **52 registry items / 111 source files**. In the
consumer with mount, `minify=false`: all used components 300122, `GraphStack`
166498, `Footnotes` 160604 bytes. These are different entries from the global
export measurement above; the two measurements are not used as before/after
values for each other.

## Verification of documentation claims

The upstream checkout `16d817ad5ec54d89142e4c1cf26027b60d6df853` was verified
by command. Functions in the Activity source file were compiled with TypeScript
and executed: `days=[{date:'+275760-09-13',count:1}]`, `weekStartsOn=1` really
produces `RangeError: Invalid time value`. The briefing's `toISO(last)` does not
exist in the source; the error is in the loop's `toISO(time)` call. The port's
compiled `parseUTC` function rejects the same date; `buildWeeks` returns `[]`.
The Phase 9B report was corrected.

For Knap, `graph_meter({value:'oops'})` produced `NaN%` without warnings, and
`graph_spec({rows:[{label:'x'},{label:'y',value:{x:1}}]})` produced `undefined`
and `[object Object]` without warnings. The document says warnings are issued
only on read errors or throws; the schema validation claim was removed.
Untrusted filter input and the behavior of longer ASCII fences were explained.

Actual parse output obtained with Comark 0.7.0 showed that text after a
standalone `::` line in `body` remains outside the block, while inline `::`
remains inside the block. `coerceProps` dropped the string fields `once`, `only`,
and `onclick`. The `security()` plugin was executed; the `javascript:` URL and
inline handler were removed, but `<script>` and `<iframe>` tags remain when used
without options (verified by inspection); the documentation example was updated
with `blockedTags`.

Footnotes information is in `apps/docs/docs/mdx.md`, not a separate page; the
note was added there. In the production HTML, two backlinks carry only the `↩︎`
glyph and have no `aria-label`. No new label was added in this scope to avoid
changing the host's links and language. Correction (review): this omission is
NOT shared with upstream. Upstream mdxcn generates GFM footnotes with remark-gfm,
and its backlinks carry `aria-label="Back to reference 1"` (verified with
remark-gfm 4); `markdown-it-footnote` links contain only `↩︎`. This is an
accessibility difference in the Vue path compared with upstream, and the document
states it as such.

The docs production build passed. Evidence is in `f11a-docs-evidence.mjs`,
`f11a-docs-evidence.log`, and `f11a-docs-build.log` in the authorized scratch directory.

## Knap fixture and mutant evidence

`scripts/capture-knap-edge-cases.mjs` verifies the upstream commit ID and
produces an independent fixture by running only upstream TypeScript code.
`knap-edge-cases.json` stores normal outputs with upstream byte values.
Because upstream is already incorrect for YAML keys, the upstream output and
the manually defined correction are in separate fields; port output is not used
in fixture generation. Tests also compare the corrected YAML value with real
Comark parse output. The locale is fixed to `en-US` for the Funnel fixture;
the test also verifies that the production call supplies no locale argument.
This preserves the host default locale contract.

| Temporary mutant | Fixture input | Result |
| --- | --- | --- |
| Remove `padEnd` truncation | `abcdef`, width 3 → `abc` | Exit 1, assertion failed |
| Funnel `String()` instead of `toLocaleString()` | `1234.5` → `1,234.5` | Exit 1, assertion failed |
| Rank `Math.floor` instead of `Math.round` | `0.26`, `max=1`, `ticks=10` → 3 filled cells | Exit 1, assertion failed |
| Remove `flowMap` key quoting | Key `x, y` | Exit 1, assertion failed |
| Remove nested scalar key quoting | `x: y` under `outer` | Exit 1, assertion failed |
| Remove quoting of a key containing a map | `child` under `x: y` | Exit 1, assertion failed |

Each mutant was applied individually to the real source and the test was run;
the target fixture assertion failure was verified. Each time, the source was
restored byte for byte inside `finally`, and SHA-256 equality was tested.
Afterward, the 19 new tests passed again with pristine source. The five requested
categories were tested as six mutants because of the two branches of nested
keys. Evidence is in `f11a-mutations.mjs`, `f11a-mutants.json`,
`f11a-mutant-0.log` … `f11a-mutant-5.log`, and `f11a-mutants-pristine.log` in the
scratch directory.

Waffle ASCII output was limited to integer values `cells=0..10000`,
`columns=1..200`. The integer requirement was also necessary because very small
positive fractional `columns` could still produce a very long loop when only
an upper bound was imposed. Out-of-range inputs return the original value with
a single `FILTER_WARNING` warning. This upstream difference is documented in
docs. Values just above the upper bounds, very large values, fractional values,
allowed boundaries, and zero cells were tested. The registry payload was
regenerated. The new tests also cover the Activity date boundary and upstream's
malformed output without warnings.

## Final acceptance

`pnpm install --frozen-lockfile` passed with the existing lockfile; the lockfile
was unchanged. All workspace builds were run in production mode. Results:

| Check | Output |
| --- | --- |
| Install | `Lockfile is up to date, resolution step is skipped`; exit 0 |
| `pnpm -r build` | Vue, Markdown, docs production build; exit 0 |
| `pnpm -r test` | Vue **919**, Markdown **374**, docs **78** passed; total **1371** |
| `pnpm lint` | ESLint; exit 0 |
| `pnpm typecheck` | Three workspaces; exit 0 |
| `pnpm format:check` | `All matched files use Prettier code style!`; exit 0 |
| `pnpm consumer:check` | `CONSUMER CHECK PASSED`; 52 registry items, 111 sources; exit 0 |

Acceptance log file: `C:/Users/zahid/source/github/tmp/mdxcn-vue/f11a-acceptance.log`.
No acceptance step failed or was skipped. The format check was run again after
the report was completed. The 258774-byte “all” measurement after the first
commit became 258797 with the Waffle boundary check; the table shows the final
code. Existing fixture fallback and registry dependency warnings are not test
failures. No dev server or npm publication was performed. The final diff was
reviewed for the public API, preservation of `defineItem` registrations for
objects in use, error paths, the locale contract, and registry equality. No open
code finding remained. Three commits are created with explicit authorization,
unsigned, without bypassing hooks or permanent Git config changes; each commit
is immediately pushed normally.
