# Chat and Keys parity

<Chat title="SESSION">

- you: which graph shows a rollback?
- agent: Timeline. Bold the row where you rolled back.
- agent: *reads graph-timeline.tsx*
- agent: Then Diff for what the rollback changed.
- you: and on GitHub?
- agent: Paste the fenced ASCII. GitHub does not run MDX.

</Chat>

<Chat title="SESSION">
<ul>
<li>you: which graph shows a rollback?</li>
<li>agent: Timeline. Bold the row where you rolled back.</li>
<li>agent: <em>reads graph-timeline.tsx</em></li>
<li>agent: Then Diff for what the rollback changed.</li>
<li>you: and on GitHub?</li>
<li>agent: Paste the fenced ASCII. GitHub does not run MDX.</li>
</ul>
</Chat>

<Chat title="SESSION" :turns="[{ by: 'you', children: 'which graph shows a rollback?' }, { by: 'agent', children: 'Timeline. Bold the row where you rolled back.' }, { by: 'agent', children: [h('em', 'reads graph-timeline.tsx')], aside: true }, { by: 'agent', children: 'Then Diff for what the rollback changed.' }, { by: 'you', children: 'and on GitHub?' }, { by: 'agent', children: 'Paste the fenced ASCII. GitHub does not run MDX.' }]" />

<Chat title="SUPPORT" you="priya">

- priya: the timeline renders empty in our docs

- jon: Do you swap `li` in mdx-components?

  Wrap the map in `withMdxcn` and the graphs see list items again.

- priya: that was it

</Chat>

<Chat title="SUPPORT" you="priya">
<ul>
<li><p>priya: the timeline renders empty in our docs</p></li>
<li><p>jon: Do you swap <code>li</code> in mdx-components?</p><p>Wrap the map in <code>withMdxcn</code> and the graphs see list items again.</p></li>
<li><p>priya: that was it</p></li>
</ul>
</Chat>

<Keys title="SHORTCUTS">

- **⌘K: search the docs**
- ⌘⇧C: copy the page as Markdown
- Ctrl+Shift+P: command palette
- g then d: go to docs
- Esc: close

</Keys>

<Keys title="SHORTCUTS">
<ul>
<li><strong>⌘K: search the docs</strong></li>
<li>⌘⇧C: copy the page as Markdown</li>
<li>Ctrl+Shift+P: command palette</li>
<li>g then d: go to docs</li>
<li>Esc: close</li>
</ul>
</Keys>

<Keys title="SHORTCUTS" :bindings="[{ keys: '⌘K', action: 'search the docs', accent: true }, { keys: '⌘⇧C', action: 'copy the page as Markdown' }, { keys: 'Ctrl+Shift+P', action: 'command palette' }, { keys: 'g then d', action: 'go to docs' }, { keys: 'Esc', action: 'close' }]" />

<script setup>
import { h } from 'vue'
</script>
