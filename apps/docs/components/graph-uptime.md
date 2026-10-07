# GraphUptime

<GraphUptime :title='"API"' :from='"Jun 1"' :to='"Aug 29"'>

ok*18 degraded ok*22 down*2 ok*17 degraded*2 ok*28

</GraphUptime>

<GraphUptime :title='"WEBHOOKS"' :from='"Mon"' :to='"Fri"' :days='"ok ok ok degraded ok empty empty ok down ok ok ok"'>



</GraphUptime>

`days` accepts a status array or run string (`ok*40 down*2`). Valid statuses are `ok`, `degraded`, `down`, and `empty`; empty days are excluded from the uptime percentage. An explicit empty array wins over Markdown. `from` and `to` are literal presentation labels.

`columns` defaults to 30, accepts a static numeric string, and is normalized to a positive integer. Rows reveal at 50 ms intervals with a 240 ms maximum delay.
