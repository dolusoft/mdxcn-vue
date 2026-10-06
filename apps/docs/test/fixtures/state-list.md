# State list parity

<Steps title="INSTALL">

1. Copy the source

   Run the shadcn CLI. Files land under registry/default.

2. **Register it**

   Export the component from mdx-components.tsx.

3. *Write*

   Use it between paragraphs. No import line.

</Steps>

<Steps title="INSTALL"><Step title="Copy the source"><p>Run the shadcn CLI. Files land under registry/default.</p></Step><Step title="Register it" state="now"><p>Export the component from mdx-components.tsx.</p></Step><Step title="Write" state="next"><p>Use it between paragraphs. No import line.</p></Step></Steps>

<Steps title="INSTALL"><ol><li><p>Copy the source</p><p>Run the shadcn CLI. Files land under registry/default.</p></li><li><p><strong>Register it</strong></p><p>Export the component from mdx-components.tsx.</p></li><li><p><em>Write</em></p><p>Use it between paragraphs. No import line.</p></li></ol></Steps>

<Steps title="ROLLBACK">

1. Flip the flag — cache.v2 to off in the dashboard.
2. Watch p95 — Two minutes. It should drop under 300ms.
3. Write it down — Open the postmortem before you leave.

</Steps>

<Steps title="ROLLBACK"><Step title="Flip the flag">cache.v2 to off in the dashboard.</Step><Step title="Watch p95">Two minutes. It should drop under 300ms.</Step><Step title="Write it down">Open the postmortem before you leave.</Step></Steps>

<Changelog version="1.2.0" date="Mar 12">

- added: Callout, Quote, Steps, Terminal, Changelog
- changed: Graphs read MDX children as well as arrays
- fixed: Timeline connector on Safari
- removed: The legacy accent prop

</Changelog>

<Changelog version="1.2.0" date="Mar 12"><Change type="add">Callout, Quote, Steps, Terminal, Changelog</Change><Change>Graphs read MDX children as well as arrays</Change><Change type="fix">Timeline connector on Safari</Change><Change type="remove">The legacy accent prop</Change></Changelog>

<Changelog version="1.2.0" date="Mar 12"><ul><li>added: Callout, Quote, Steps, Terminal, Changelog</li><li>changed: Graphs read MDX children as well as arrays</li><li>fixed: Timeline connector on Safari</li><li>removed: The legacy accent prop</li></ul></Changelog>

<Decision title="DATABASE" status="accepted" date="Mar 12">

- **Postgres** — boring, and we already run it
- *Mongo* — no joins we trust
- SQLite — fine until the second writer

Revisit if writes pass `2k` a second.

</Decision>

<Decision title="DATABASE" status="accepted" date="Mar 12" :options="[{label:'Postgres',reason:'boring, and we already run it',state:'chosen'},{label:'Mongo',reason:'no joins we trust',state:'rejected'},{label:'SQLite',reason:'fine until the second writer'}]"><p>Revisit if writes pass <code>2k</code> a second.</p></Decision>

<Decision title="DATABASE" status="accepted" date="Mar 12"><ul><li><strong>Postgres</strong> — boring, and we already run it</li><li><em>Mongo</em> — no joins we trust</li><li>SQLite — fine until the second writer</li></ul><p>Revisit if writes pass <code>2k</code> a second.</p></Decision>
