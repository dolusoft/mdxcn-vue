# Code reader parity

<script setup>
const code = 'def fetch(url, times=3):  # (1)\n    return get(url)\n'
const notes = [[{ type: 'text', value: 'Three ' }, { type: 'strong', children: [{ type: 'text', value: 'tries' }] }, { type: 'text', value: '.' }]]
const vars = [{ name: 'DATABASE_URL', value: 'postgres://localhost:5432/app', note: 'Postgres connection string.', required: true }, { name: 'ANALYTICS_ID', value: '', required: false }]
const worker = [{ name: 'QUEUE_URL', value: 'redis://localhost:6379', note: 'jobs and retries', required: true }, { name: 'CONCURRENCY', value: '4', note: 'per process', required: false }]
</script>

<Annotate>

```python
def fetch(url, times=3):  # (1)
    return get(url)
```

1. Three **tries**.

</Annotate>

<Annotate title="python" :code="code" :notes="notes" />

<Annotate :notes="notes">

```python
def fetch(url, times=3):  # (1)
    return get(url)
```

</Annotate>

<Env>

```bash
# Postgres connection string. Required.
DATABASE_URL=postgres://localhost:5432/app

ANALYTICS_ID=
```

</Env>

<Env :vars="vars" />

<Env :vars="null">

```bash
# Postgres connection string. Required.
DATABASE_URL=postgres://localhost:5432/app

ANALYTICS_ID=
```

</Env>

<Env title="WORKER">

- **QUEUE_URL**: redis://localhost:6379 — jobs and retries
- CONCURRENCY: 4 — per process

</Env>

<Env title="WORKER" :vars="worker" />
