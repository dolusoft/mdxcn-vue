import { graphFilters } from 'mdxcn-vue/knap'

export default {
  load() {
    return {
      ascii: graphFilters.graph_meter('0.67', 'SHIPPED'),
      comark: graphFilters.graph_meter('0.67', 'comark'),
    }
  },
}
export declare const data: ReturnType<typeof import('./knap.data').default.load>
