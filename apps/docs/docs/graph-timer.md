# timer

Elapsed time, relative time or the local clock. These are the three pinned
upstream examples: `incident`, `last deploy` and `local`.

## Incident

<GraphTimer title="INCIDENT" kind="elapsed">

2026-08-27T08:00:00Z — api

</GraphTimer>

```vue
<GraphTimer title="INCIDENT" kind="elapsed">
  <p>2026-08-27T08:00:00Z — api</p>
</GraphTimer>
```

## Last deploy

<GraphTimer title="SHIPPED" kind="ago" at="2026-08-27T12:00:00Z" caption="last deploy" />

```vue
<GraphTimer title="SHIPPED" kind="ago"
  at="2026-08-27T12:00:00Z" caption="last deploy" />
```

## Local

<GraphTimer title="LOCAL" kind="clock" />

```vue
<GraphTimer title="LOCAL" kind="clock" />
```

`at` accepts a `Date`, epoch milliseconds or a date string. A paragraph can provide
the instant followed by a caption after a spaced em/en dash. Whitespace is
normalized. `at` and `caption` select their props independently before the written
values; an empty caption suppresses the written caption. Future instants clamp to
zero, and invalid/missing instants keep the placeholder.

The server and first client render both use `00:00:00` (`0s ago` for `ago`) and
screen reader text `timer`. After mount, the value and spoken description update
every second. The `clock` mode uses the user's local timezone. Like upstream,
the interval continues in hidden tabs; browser throttling may apply. Unmount
clears the interval. There is no live region announcing each second.

SSR content remains visible and reduced motion disables the entrance animation.
`useGraphNow(interval)` is also exported for composables using the same lifecycle.
