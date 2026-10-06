/**
 * Build-time Markdown adapter. The markdown-it based compiler lands in phase 2;
 * for now the package only exposes its version marker so the workspace wiring
 * (build, types, tests) can be verified.
 */
export const MDXCN_MARKDOWN_STAGE = 'scaffold' as const
