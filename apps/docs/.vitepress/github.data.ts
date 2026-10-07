// Star count for the header, read once per build. Offline or rate-limited
// builds render the GitHub button without a count.
export default {
  async load(): Promise<{ stars: number | null }> {
    try {
      const response = await fetch('https://api.github.com/repos/dolusoft/mdxcn-vue', {
        headers: { accept: 'application/vnd.github+json' },
        signal: AbortSignal.timeout(5000),
      })
      if (!response.ok) return { stars: null }
      const repo = (await response.json()) as { stargazers_count?: unknown }
      return { stars: typeof repo.stargazers_count === 'number' ? repo.stargazers_count : null }
    } catch {
      return { stars: null }
    }
  },
}
export declare const data: Awaited<ReturnType<typeof import('./github.data').default.load>>
