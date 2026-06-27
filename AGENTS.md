<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:daggerheart-localization-rules -->
# Daggerheart Localization

When translating or reviewing Daggerheart content, use the local skill at `.codex/skills/daggerheart-localization/`.
It defines the canonical equivalents for ranges, adversary roles, scene types, and recurring mechanical terms in English, Spanish, and Brazilian Portuguese.

For enum-backed UI such as dropdowns, filters, or stored values, preserve the internal English value and localize only the displayed label unless a schema migration is explicitly intended.
Do not invent alternate translations for canonical terms if the skill glossary already defines one.
<!-- END:daggerheart-localization-rules -->
