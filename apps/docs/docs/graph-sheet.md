# sheet

<GraphSheet title="RFC">

### Scope

| Item | Owner | Status |
| --- | --- | --- |
| CLI copies files | priya | done |
| Docs previews | jon | now |

### Out of scope

| Item | Owner | Status |
| --- | --- | --- |
| npm package | — | later |
| Figma kit | — | later |

</GraphSheet>

<GraphSheet title="SURFACE">

### Frame

| Name | Kind | Stable |
| --- | --- | --- |
| Graph | primitive | yes |
| GraphBody | primitive | yes |

### Charts

| Name | Kind | Stable |
| --- | --- | --- |
| GraphTable | component | yes |
| GraphSheet | component | new |

</GraphSheet>

Explicit headers, sections, footer and align resolve independently. Empty arrays suppress fallback; null uses items or Markdown. Section rows override nested Row items. Only the first heading section supplies Markdown headers and alignment. Detected Total/bold last rows are removed and their Markdown footer is ignored. Use Foot or the footer prop for a footer.
