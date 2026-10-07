# GraphBoard

Work columns from headings and lists, or typed `columns`.

<GraphBoard title="ROADMAP">

### Shipped
- Callout, Steps, Terminal
- Comark adapter

### Now
- **Children for every graph**
- Board and Score — this drop

### Later
- *Figma kit*
- *Vue port* — if someone asks twice

</GraphBoard>

<GraphBoard title="SPRINT 14" palette="duo">

### Todo
- *Postmortem for the cache flag*

### Doing
- **Roll back cache.v2**

### Done
- Page the on-call
- Freeze deploys

</GraphBoard>

Explicit `columns` (including `[]`) override headings; `null` falls back. Only the first four columns are rendered. Strings in `items` remain literal labels; bold Markdown marks `now`, italic marks `next`, and other items default to `done`. A note follows an em dash. Empty sections remain visible. No table or item component is defined upstream.
