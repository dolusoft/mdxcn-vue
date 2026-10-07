# Compiler fixture

<GraphStack title="STACK" :ticks="3">

- **Web** *app* `ui` [docs](/docs/graph-table): 2 js, 1 css

</GraphStack>

<GraphTable title="TABLE">

| Name | Count |
| --- | ---: |
| *Web* | `2` |
| [Docs](/docs/graph-table) | 3 |
| **Sum** | 5 |

</GraphTable>

<Endpoint title="API">

POST /api/test

See **docs** and [link](/docs/graph-table).

| Param | Type | Description |
| --- | --- | --- |
| **id** | string | Use `slug` and *web* |
| empty | | |

```bash
  curl /api/test
```

```json
  { "ok": true }

```

</Endpoint>

<GraphStack title="STACK" :ticks="3" v-if="true">

- **Web** *app* `ui` [docs](/docs/graph-table): 2 js, 1 css

</GraphStack>

<GraphTable title="TABLE" v-if="true">

| Name | Count |
| --- | ---: |
| *Web* | `2` |
| [Docs](/docs/graph-table) | 3 |
| **Sum** | 5 |

</GraphTable>

<Endpoint title="API" v-if="true">

POST /api/test

See **docs** and [link](/docs/graph-table).

| Param | Type | Description |
| --- | --- | --- |
| **id** | string | Use `slug` and *web* |
| empty | | |

```bash
  curl /api/test
```

<pre><code class="language-json">  { &quot;ok&quot;: true }

</code></pre>

</Endpoint>
