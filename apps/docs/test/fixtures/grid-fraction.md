# Grid and fraction fixtures

<GraphCells title="TWO WAYS TO LEARN" >

- fragments: 1 0 1 0 0 / 0 1 0 1 0 / 1 0 0 0 1
- a system: 1 1 1 1 1 / 1 1 1 1 1 / 1 1 1 1 1

</GraphCells>

<GraphCells title="TWO WAYS TO LEARN" :items="null">

- fragments: 1 0 1 0 0 / 0 1 0 1 0 / 1 0 0 0 1
- a system: 1 1 1 1 1 / 1 1 1 1 1 / 1 1 1 1 1

</GraphCells>

<GraphCells title="TWO WAYS TO LEARN" v-bind='{"items": [{"label": "fragments", "cells": [[1, 0, 1, 0, 0], [0, 1, 0, 1, 0], [1, 0, 0, 0, 1]]}, {"label": "a system", "cells": [[1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1]]}]}' />

<GraphCells title="COVERAGE" >

- this week: 1 1 1 1 0 / 1 1 0 1 1 / 1 0 1 1 1

</GraphCells>

<GraphCells title="COVERAGE" :items="null">

- this week: 1 1 1 1 0 / 1 1 0 1 1 / 1 0 1 1 1

</GraphCells>

<GraphCells title="COVERAGE" v-bind='{"items": [{"label": "this week", "cells": [[1, 1, 1, 1, 0], [1, 1, 0, 1, 1], [1, 0, 1, 1, 1]]}]}' />

<GraphMeter title="DISK" >

78% — of 500 GB

</GraphMeter>

<GraphMeter title="DISK" :written="null">

78% — of 500 GB

</GraphMeter>

<GraphMeter title="DISK" v-bind='{"value": "78%", "caption": "of 500 GB"}' />

<GraphWaffle title="TESTS" >

91% — 182 of 200 green

</GraphWaffle>

<GraphWaffle title="TESTS" :written="null">

91% — 182 of 200 green

</GraphWaffle>

<GraphWaffle title="TESTS" v-bind='{"value": "91%", "caption": "182 of 200 green"}' />

<GraphCells title="EDGE" >

- **row**: 1   0 /
  0 1
  - ignored: 0

</GraphCells>

<GraphCells title="EDGE" :items="null">

- **row**: 1   0 /
  0 1
  - ignored: 0

</GraphCells>

<GraphCells title="EDGE" v-bind='{"items": [{"label": "row", "cells": [[1, 0], [0, 1]]}]}' />

<GraphMeter title="EDGE" >

**67%**   — disk
usage

</GraphMeter>

<GraphMeter title="EDGE" :written="null">

**67%**   — disk
usage

</GraphMeter>

<GraphMeter title="EDGE" v-bind='{"value": "67%", "caption": "disk usage"}' />

<GraphWaffle title="EDGE" >

**67%**   — disk
usage

</GraphWaffle>

<GraphWaffle title="EDGE" :written="null">

**67%**   — disk
usage

</GraphWaffle>

<GraphWaffle title="EDGE" v-bind='{"value": "67%", "caption": "disk usage"}' />

<GraphMeter title="INLINE" >

**67%**
*used*

</GraphMeter>

<GraphMeter title="INLINE" :written="null">

**67%**
*used*

</GraphMeter>

<GraphMeter title="INLINE" value="67%used" />

<GraphWaffle title="INLINE" >

**67%**
*used*

</GraphWaffle>

<GraphWaffle title="INLINE" :written="null">

**67%**
*used*

</GraphWaffle>

<GraphWaffle title="INLINE" value="67%used" />

<GraphMeter title="BLOCKS" >

67%

used

</GraphMeter>

<GraphMeter title="BLOCKS" :written="null">

67%

used

</GraphMeter>

<GraphMeter title="BLOCKS" value="67%" caption="used" />

<GraphWaffle title="BLOCKS" >

- 67%
- used

</GraphWaffle>

<GraphWaffle title="BLOCKS" :written="null">

- 67%
- used

</GraphWaffle>

<GraphWaffle title="BLOCKS" value="67%" caption="used" />

<GraphCells title="BLOCKS" >

- a: 1 0

  0 1

</GraphCells>

<GraphCells title="BLOCKS" :items="null">

- a: 1 0

  0 1

</GraphCells>

<GraphCells title="BLOCKS" v-bind='{"items": [{"label": "a", "cells": [[1, 0, 0, 1]]}]}' />
