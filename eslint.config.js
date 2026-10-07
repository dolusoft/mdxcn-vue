import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.vitepress/cache/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },
  {
    // Preserve upstream public primitive and item names.
    rules: {
      'vue/multi-word-component-names': [
        'error',
        {
          ignores: [
            'Node',
            'Task',
            'Path',
            'Section',
            'From',
            'To',
            'Meta',
            'Item',
            'Total',
            'Faq',
            'Graph',
            'Bar',
            'Segment',
            'Head',
            'Row',
            'Foot',
            'Cell',
            'Endpoint',
            'Callout',
            'Quote',
            'Terminal',
            'Annotate',
            'Env',
            'Steps',
            'Step',
            'Changelog',
            'Change',
            'Decision',
            'Chat',
            'Keys',
            'Event',
            'Field',
            'Rank',
            'Stage',
            'Stat',
            'Slope',
            'Target',
            'Span',
            'Line',
            'Delta',
            'Col',
          ],
        },
      ],
      'vue/no-reserved-component-names': ['error', { htmlElementCaseSensitive: true }],
    },
  },
  {
    files: ['**/*.ts'],
    // Render-function modules export related primitives; optional props use Vue defaults.
    rules: { 'vue/one-component-per-file': 'off', 'vue/require-default-prop': 'off' },
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  prettier,
)
