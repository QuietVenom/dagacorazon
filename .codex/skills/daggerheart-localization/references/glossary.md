# Daggerheart Localization Glossary

This file is the canonical term map for Daggerheart content in this repository.

## Scope

Use these equivalents for:

- SRD resource JSON files
- UI labels
- dropdown options
- filters and chips
- translation reviews

If a value is an internal enum or stored identifier, keep the English raw value and localize only the label.

## Canonical Ranges

| English | Spanish | Portuguese (Brazil) |
| --- | --- | --- |
| `Melee` | `Cuerpo a cuerpo` | `Corpo a corpo` |
| `Very Close` | `Muy cerca` | `Muito perto` |
| `Close` | `Cerca` | `Perto` |
| `Far` | `Lejos` | `Longe` |
| `Very Far` | `Muy lejos` | `Muito longe` |

Use this exact order in UI controls:

1. `Melee`
2. `Very Close`
3. `Close`
4. `Far`
5. `Very Far`

## Canonical Adversary Roles

| English | Spanish | Portuguese (Brazil) |
| --- | --- | --- |
| `Bruiser` | `Bruto` | `Bruto` |
| `Horde` | `Horda` | `Horda` |
| `Leader` | `Líder` | `Líder` |
| `Minion` | `Esbirro` | `Lacaio` |
| `Ranged` | `A distancia` | `À distância` |
| `Skulk` | `Acechador` | `Espreitador` |
| `Social` | `Social` | `Social` |
| `Solo` | `Solo` | `Solo` |
| `Standard` | `Estándar` | `Padrão` |
| `Support` | `Apoyo` | `Suporte` |

Use this exact order in UI controls:

1. `Bruiser`
2. `Horde`
3. `Leader`
4. `Minion`
5. `Ranged`
6. `Skulk`
7. `Social`
8. `Solo`
9. `Standard`
10. `Support`

## Canonical Scene Types

| English | Spanish | Portuguese (Brazil) |
| --- | --- | --- |
| `Exploration` | `Exploración` | `Exploração` |
| `Social` | `Social` | `Social` |
| `Traversal` | `Travesía` | `Travessia` |
| `Event` | `Evento` | `Evento` |

## Canonical Feature Labels

| English | Spanish | Portuguese (Brazil) |
| --- | --- | --- |
| `Passive` | `Pasiva` | `Passiva` |
| `Action` | `Acción` | `Ação` |
| `Reaction` | `Reacción` | `Reação` |

## Canonical Attack Types

| English | Spanish | Portuguese (Brazil) |
| --- | --- | --- |
| `Physical` | `Físico` | `Físico` |
| `Magical` | `Mágico` | `Mágico` |
| `Physical & Magical` | `Físico y mágico` | `Físico e mágico` |

Use this exact order in UI controls:

1. `Physical`
2. `Magical`
3. `Physical & Magical`

## Canonical Equipment Categories

| English | Spanish | Portuguese (Brazil) |
| --- | --- | --- |
| `Physical Weapon` | `Arma física` | `Arma física` |
| `Magic Weapon` | `Arma mágica` | `Arma mágica` |
| `Secondary Weapon` | `Arma secundaria` | `Arma secundária` |
| `Wheelchair` | `Silla de ruedas` | `Cadeira de rodas` |
| `Armor` | `Armadura` | `Armadura` |
| `Loot` | `Botín` | `Saque` |
| `Consumable` | `Consumible` | `Consumível` |

Use these raw English values in stored data and localize only the visible label.

## Canonical Core Mechanics

| English | Spanish | Portuguese (Brazil) |
| --- | --- | --- |
| `Fear` | `Miedo` | `Medo` |
| `Hope` | `Esperanza` | `Esperança` |
| `Hope Die` | `Dado de Esperanza` | `Dado de Esperança` |
| `Stress` | `Estrés` | `Estresse` |
| `Restrained` | `Inmovilizado` | `Imobilizado` |
| `Vulnerable` | `Vulnerable` | `Vulnerável` |
| `Agility Roll` | `tirada de Agilidad` | `teste de Agilidade` |
| `Strength Roll` | `tirada de Fuerza` | `teste de Força` |
| `Finesse Roll` | `tirada de Fineza` | `teste de Finesse` |
| `Instinct Roll` | `tirada de Instinto` | `teste de Instinto` |
| `Knowledge Roll` | `tirada de Conocimiento` | `teste de Conhecimento` |
| `Presence Roll` | `tirada de Presencia` | `teste de Presença` |
| `Agility Reaction Roll` | `tirada de Reacción de Agilidad` | `teste de Reação de Agilidade` |
| `Strength Reaction Roll` | `tirada de Reacción de Fuerza` | `teste de Reação de Força` |
| `Finesse Reaction Roll` | `tirada de Reacción de Fineza` | `teste de Reação de Finesse` |
| `Instinct Reaction Roll` | `tirada de Reacción de Instinto` | `teste de Reação de Instinto` |
| `Knowledge Reaction Roll` | `tirada de Reacción de Conocimiento` | `teste de Reação de Conhecimento` |
| `Presence Reaction Roll` | `tirada de Reacción de Presencia` | `teste de Reação de Presença` |

## Canonical UI Rule

When the product stores English values like these:

- `Melee`
- `Very Close`
- `Bruiser`
- `Minion`
- `Physical`
- `Traversal`

do this:

- keep the raw value in English
- translate only the visible label
- do not rewrite persisted enums unless there is an intentional schema migration

## Tier Conventions

Keep `Tier` in English in display strings unless product requirements change.

Examples:

- `Tier 1 Bruto`
- `Tier 2 Líder`
- `Tier 3 À distância`

## Horde Shorthand Convention

For the tier shorthand only:

- English: `Horde (X/HP)`
- Spanish: `Horda (X/CV)`
- Portuguese (Brazil): `Horda (X/CV)`

Outside that shorthand, preserve existing project conventions for `HP` and other stat abbreviations unless the repository is explicitly being normalized.

## Existing Project Preference

When a proper noun or stat block name already exists in localized project resources, prefer that project-localized name instead of retranslating it from scratch.

Examples:

- use the established localized adversary names from `resources/adversaries/`
- use the established localized environment names from `resources/environment/`

## Missing Term Policy

If a term is not listed here:

1. preserve the English term temporarily
2. do not invent a one-off translation in a single file
3. add the term here before spreading it across the project
