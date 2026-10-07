# env

Environment variables from data, a fence, a Markdown list, or raw text.
Values are displayed without masking. Never put real secrets, passwords, or
access tokens in documentation examples.

Comments describe a key; a comment containing `required` marks it as required.

## .env

<Env>

```bash
# Postgres connection string. Required.
DATABASE_URL=postgres://localhost:5432/app

# Origin for absolute links in llms.txt
SITE_URL=https://mdxcn.dev

# Leave empty to turn analytics off
ANALYTICS_ID=
```

</Env>

## As a list

<Env title="WORKER">

- **QUEUE_URL**: redis://localhost:6379 — jobs and retries
- CONCURRENCY: 4 — per process
- LOG_LEVEL: info

</Env>

## Typed data

<Env title="WORKER" :vars="[{ name: 'QUEUE_URL', value: 'redis://localhost:6379', note: 'jobs and retries', required: true }, { name: 'CONCURRENCY', value: '4', note: 'per process' }, { name: 'LOG_LEVEL', value: 'info' }]" />

```vue
<Env :vars="[{ name: 'DATABASE_URL', value: 'postgres://localhost:5432/app', required: true }]" />
```

`vars` wins over the first fence, then a nonempty list, then raw text. An empty
`vars` array or empty first fence suppresses all lower-priority inputs; `null`
and `undefined` allow fallback. List text uses `KEY: value — note`; any bold
host inside the item marks it required. Empty values display an em dash.

The title defaults to `.env`; `palette`, `corner`, `className`, and Vue frame
attrs are supported. There is no item API. Required keys include screen-reader
text; decorative stars and the repeated legend are hidden from assistive technology.

This is the upstream display parser, not a dotenv loader: it splits inline
comments at whitespace followed by `#`, including inside quoted values. Blank
lines clear accumulated comments; invalid lines are ignored. Trusted Markdown
compiles to typed props when supported and falls back to the runtime reader
for explicit data props or complex bodies. SSR stays visible; stagger is capped at 200 ms.
