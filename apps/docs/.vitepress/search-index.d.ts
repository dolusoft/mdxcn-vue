// Virtual module emitted by VitePress when `search.provider` is `local`:
// one lazy MiniSearch JSON dump per locale.
declare module '@localSearchIndex' {
  const index: Record<string, () => Promise<{ default: string }>>
  export default index
}
