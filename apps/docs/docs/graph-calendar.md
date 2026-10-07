# calendar

<GraphCalendar :year='2026' :month='3'>

- 4: freeze tokens
- 12: registry listed
- **18: docs go live**
- 27: postmortem due

</GraphCalendar>

<GraphCalendar :year='2026' :month='8' :today='27' marks="12 18 27"/>

<GraphCalendar title="SHIP WEEK" :year='2026' :month='3' :weekStartsOn='0' :marks='[{"day": 12, "accent": true}, {"day": 18}]'/>

`weekStartsOn` accepts `0` (Sunday) or `1` (Monday). UTC arithmetic and fixed month names keep SSR stable.

`marks` takes precedence over the list; `today` still falls back to its first bold day. `written` carries the compiled list without overriding explicit marks. No custom item component is required.
