# Endpoint

One API route with parameters, prose and request/response blocks. This example
uses the pinned upstream `one component` dataset. Repository Markdown is compiled
to typed props before heading anchors and syntax highlighting.

## One component

<Endpoint>

GET /api/v1/components/:slug

One component from the catalog, with its props. See the [catalog](/components/graph-table).

| Param | Type | |
| --- | --- | --- |
| **slug** | string | Registry slug, like `graph-table` |

```bash
$ curl https://mdxcn.dev/api/v1/components/graph-meter
```

```json
{ "slug": "graph-meter", "name": "GraphMeter", "props": [ … ] }
```

</Endpoint>

```vue
<Endpoint>
  <p>GET /api/v1/components/:slug</p>
  <p>One component from the catalog, with its props.</p>
  <table>
    <thead><tr><th>Param</th><th>Type</th><th></th></tr></thead>
    <tbody><tr>
      <td><strong>slug</strong></td><td>string</td>
      <td>Registry slug, like <code>graph-table</code></td>
    </tr></tbody>
  </table>
  <pre><code class="language-bash">$ curl https://mdxcn.dev/api/v1/components/graph-meter</code></pre>
  <pre><code class="language-json">{ "slug": "graph-meter", "name": "GraphMeter", "props": [ … ] }</code></pre>
</Endpoint>
```

The `mdxcn-markdown` plugin reads raw fence tokens before VitePress adds its
highlighter wrappers. Runtime slots also accept one `div.language-* > pre` level;
copy buttons and language labels are ignored.

## Typed data

<Endpoint method="GET" path="/api/v1/components/:slug"
  :params="[{ name: 'slug', type: 'string', required: true, description: [
    { type: 'text', value: 'Registry slug, like ' },
    { type: 'code', children: [{ type: 'text', value: 'graph-table' }] }
  ] }]"
  :blocks="[
    { label: 'request', code: '$ curl https://mdxcn.dev/api/v1/components/graph-meter' },
    { label: 'json', code: '{ &quot;slug&quot;: &quot;graph-meter&quot;, &quot;name&quot;: &quot;GraphMeter&quot;, &quot;props&quot;: [ … ] }' }
  ]">

One component from the catalog, with its props. See the [catalog](/components/graph-table).

</Endpoint>

Each field selects its source independently: `method` → first route → `GET`;
`path` → first route → `/`; `params` → first table; `blocks` → direct `pre` hosts.
Empty props and arrays win; `null` and `undefined` fall back. Route methods are
case insensitive and displayed in uppercase. Supported methods are `GET`, `POST`,
`PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS` and `QUERY`. Other paragraphs remain
visible even with typed data.

Parameter tables read `tbody > tr > th/td` independently of GraphTable footer
detection. Bold names are required; descriptions retain host code and links.
Typed descriptions accept strings, VNodes, VNode arrays or `ProseNode[]`.
Fence labels default to the code language; `$ ` or `curl` prefixes mean `request`.
Exactly one trailing newline is removed; indentation stays intact.

Required markers are decorative and each required name has screen reader text.
SSR stays visible, and reduced motion disables the reveal animation. The parameter
grid collapses to three columns on small screens, keeping descriptions below names.
