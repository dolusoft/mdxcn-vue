# GraphTimeline

Events take precedence over lists, then Event markers. Empty events suppress the slot; null and undefined read it. Bold in the head marks now, italic marks next, and bold wins. Body paragraphs override an inline dash note. Dates are display strings, including time-of-day labels.

`Event.date` is required; `label` falls back to child text. `note` accepts Vue content. `palette`, `corner`, `className` and Vue attrs apply to the frame. Reveal delays cap at 250 ms; SSR and reduced motion stay visible.

## Example 1

<GraphTimeline title="SHIPPED">

- Mar 12: CLI copies the files
- **Mar 18: Docs, live previews**
- *Apr 02: Registry listed*

</GraphTimeline>

## Example 2

<GraphTimeline title="INCIDENT">

- 14:02: p95 crossed 800ms
- **14:11: rolled back the cache flag**
- *14:40: write the postmortem*

</GraphTimeline>

## Example 3

<GraphTimeline title="NIGHT">

- 14:02: p95 crossed 800ms — paged the on-call

- **14:11: rolled back the cache flag**

  Errors stopped inside a minute. Latency took ten.

- *14:40: write the postmortem*

</GraphTimeline>
