# Changelog

## 0.1.0 — 2026-10-07

Initial release candidate; not yet published. Package names remain provisional.

- Port all 46 upstream mdxcn components to Vue 3, with typed props, item markers,
  shared frames, reveal behavior and framework-independent core models.
- Provide Tailwind v4 graph utilities, host token bindings and optional themes.
- Add the build-time markdown-it adapter and `withMdxcn` upgrades for trusted
  Markdown, with diagnostics and native fallbacks for unregistered components.
- Add optional Comark component adapters and framework-independent Knap filters.
- Distribute shadcn-vue registry items with their complete source dependencies
  and preserved upstream MIT notice.
- Verify packed declarations, CSS scanning, production Vite/VitePress builds,
  registry installation and tree-shaking in isolated consumers.

Known requirements: Node >=22.18, Vue ^3.5, markdown-it ^14 for the Markdown
package, and Tailwind v4 for styles. Vite 8.3.3 / TypeScript 6.0.3 and VitePress
2.0.0-alpha.20 are the verified toolchain. See `docs/inventory.md` for deliberate
differences from the pinned React upstream.
