---
name: daggerheart-localization
description: Use when translating or reviewing Daggerheart terms between English, Spanish, and Brazilian Portuguese in JSON resources, UI labels, dropdowns, filters, docs, or game text. Defines canonical equivalents for ranges, adversary roles, scene types, and recurring mechanical terms so translations stay consistent and enum-backed UI does not drift.
---

# Daggerheart Localization

## Overview

This skill is the canonical glossary for Daggerheart localization in this repository.
Use it to keep translations stable across resources, UI copy, and enum-backed controls.

## When To Use

Use this skill when any task involves:

- translating Daggerheart JSON resources or SRD-derived text
- localizing UI labels, dropdown options, filters, chips, or tables
- reviewing terminology drift in `en`, `es`, and `pt-BR`
- deciding how to render ranges, adversary roles, scene types, or core mechanics
- checking whether a term should stay in English because it is an internal enum

## Workflow

1. Preserve schema and storage values.
   If code or persisted data uses English enum values such as `Melee`, `Very Close`, `Bruiser`, or `Minion`, keep those raw values in English unless the schema is explicitly being migrated.
   Localize the user-facing label only.

2. Read [references/glossary.md](references/glossary.md) before translating.
   It is the source of truth for canonical equivalents.

3. Use glossary terms exactly.
   Do not improvise variants such as `cuerpo-a-cuerpo` vs `melee`, `bravucón` vs `bruto`, or `atirador` vs `à distância` unless the glossary explicitly allows it.

4. Preserve Daggerheart tone.
   Favor editorial fantasy language, but do not replace canonical mechanical terms with looser prose.

5. Keep project conventions stable.
   If an older file uses a conflicting translation, prefer the glossary going forward and flag the file for cleanup instead of spreading the inconsistency.

## Translation Rules

- For UI selects and filters:
  Keep the internal option value in English.
  Translate only the displayed label per locale.

- For JSON resource keys:
  Preserve structural keys such as `tier`, `features`, `difficulty`, `name`, `description`.
  Translate only the string values those keys hold.

- For proper nouns and named stat blocks:
  Prefer existing project-localized names from the repository when they already exist.

- For missing terms:
  Preserve the English source term and add it to the glossary instead of inventing an ad hoc translation in one file.

## References

- Canonical term mappings: [references/glossary.md](references/glossary.md)
