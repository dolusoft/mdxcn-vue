import { createGraphFilters } from 'mdxcn-vue/knap'
import { bars, meter, table } from './home-examples.js'
export default {
  load() {
    const filters = createGraphFilters(['graph_meter', 'graph_table', 'graph_bars'])
    return {
      meter: filters.graph_meter!(JSON.stringify(meter)),
      table: filters.graph_table!(JSON.stringify(table)),
      bars: filters.graph_bars!(JSON.stringify(bars)),
    }
  },
}
export declare const data: ReturnType<typeof import('./home.data').default.load>
