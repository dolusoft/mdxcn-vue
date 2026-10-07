# GraphCountdown

<GraphCountdown :title='"LAUNCH"'>

2027-01-15T09:00:00Z — until 2.0

</GraphCountdown>

<GraphCountdown :title='"FREEZE"' :to='"2027-01-01T00:00:00Z"' :done='"open"' :caption='"until launch"'>



</GraphCountdown>

<GraphCountdown :title='"WINDOW"' :to='"2020-01-01T00:00:00Z"' :done='"closed"'>



</GraphCountdown>

`to` accepts a Date, a finite epoch timestamp (including zero), or an ISO date/time string. Date-only and timezone-free ISO values use UTC; include `Z` or an offset to specify an instant. Non-ISO strings remain at the placeholder.

SSR and the first hydration render show `00:00:00`. The mounted clock updates every second and stops on unmount. `done` replaces the value at completion. The upstream screen-reader summary is preserved without an `aria-live` region.

`to` overrides the written date; `caption` independently overrides the written caption. `written` is the portable compiler model.
