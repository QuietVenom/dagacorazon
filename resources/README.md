# Resources

Contenido jugable consumido por el Taller (`Start from`) para adversarios,
colosos, entornos y equipo.

Este directorio contiene únicamente fuentes de datos que la app carga y
adapta en [lib/resources.ts](../lib/resources.ts). La UI no lee estos JSON
directamente.

## Qué hay actualmente

La cobertura actual de `resources/` es esta:

| Tipo | Carpetas / archivos actuales | Idiomas disponibles | Fuente |
| --- | --- | --- | --- |
| Adversaries | `adversaries/adversaries-srd-{en,es,pt-br}.json` | `en`, `es`, `pt-br` | SRD |
| Environments | `environment/environment-srd-{en,es,pt-br}.json` | `en`, `es`, `pt-br` | SRD |
| Colossus | `colossus/colossus-community-{en,es,pt-br}.json` | `en`, `es`, `pt-br` | Comunidad Dagacorazón |
| Equipment | `equipment/equipment-srd-*.json` | `en`, `es`, `pt-br` | SRD |

### Desglose actual de equipo

El contenido de `equipment/` está dividido por categoría:

- `physical-weapons`
- `magic-weapons`
- `secondary-weapons`
- `wheelchairs`
- `armor`
- `loot`
- `consumables`

## Cómo usa esto la app

- Cada archivo fuente debe estar importado y registrado en [lib/resources.ts](../lib/resources.ts).
- El selector `Start from` se alimenta del arreglo `sources`.
- El selector de idioma depende del campo `language` registrado para cada fuente.
- Los filtros del selector dependen de los campos `filterable` definidos en [lib/creators.ts](../lib/creators.ts).
- Los documentos fuente se conservan lo más verbatim posible; la normalización ocurre en `lib/resources.ts`.

## Estructura esperada

```text
resources/
  adversaries/
  colossus/
  environment/
  equipment/
  README.md
```

Convención de nombres recomendada:

- `<type>-<source>-<lang>.json`
- ejemplos:
  - `adversaries-srd-en.json`
  - `environment-srd-es.json`
  - `colossus-community-es.json`
  - `colossus-community-en.json`
  - `colossus-community-pt-br.json`
  - `equipment-srd-pt-br-armor.json`

No todos los tipos usan exactamente la misma granularidad:

- adversaries y environment hoy usan un archivo por idioma
- colossus hoy usa un archivo comunitario por idioma
- equipment hoy usa varios archivos por idioma y categoría

## Formatos admitidos

`lib/resources.ts` soporta dos formas base de documento:

- objeto indexado por nombre
- arreglo de registros

Ambas son válidas mientras cada registro tenga la forma que el adaptador
espera para su tipo.

## Formato habitual por tipo

### Adversaries

Normalmente usan objetos indexados por nombre con campos como:

- `name`
- `tier`
- `description`
- `motivestactics`
- `difficulty`
- `thresholds`
- `hp`
- `stress`
- `atk`
- `weapons`
- `experience`
- `features`

Ejemplo real: [resources/adversaries/adversaries-srd-en.json](/Users/izcomarcos/Documents/development/dagacorazon/resources/adversaries/adversaries-srd-en.json)

Notas:

- `tier` puede venir combinado, por ejemplo `Tier 1 Solo`.
- `features` suele venir como markdown tipo `**Nombre – Tipo:** descripción`.
- Los nombres en mayúsculas se normalizan para display al cargar.

### Environments

Suelen usar una forma parecida a adversaries, pero con:

- `impulses`
- `potentialadversaries`

en lugar de `motivestactics` y `weapons`.

Ejemplo real: [resources/environment/environment-srd-en.json](/Users/izcomarcos/Documents/development/dagacorazon/resources/environment/environment-srd-en.json)

### Colossus

El contenido actual es comunitario y está disponible en `en`, `es` y `pt-br`. Además de los campos base,
puede incluir estructura específica como:

- `title`
- `size`
- `segments`

Ejemplo real: [resources/colossus/colossus-community-es.json](/Users/izcomarcos/Documents/development/dagacorazon/resources/colossus/colossus-community-es.json)

### Equipment

Equipment admite dos estilos:

- registros compactos con `name`, `category`, `description`, `features`
- registros estructurados SRD con campos como:
  - `tier`
  - `trait`
  - `range`
  - `damage`
  - `damageType`
  - `burden`
  - `baseThresholds`
  - `baseScore`
  - `roll`

Ejemplos reales:

- [resources/equipment/equipment-srd-en-physical-weapons.json](/Users/izcomarcos/Documents/development/dagacorazon/resources/equipment/equipment-srd-en-physical-weapons.json)
- [resources/equipment/equipment-srd-en-armor.json](/Users/izcomarcos/Documents/development/dagacorazon/resources/equipment/equipment-srd-en-armor.json)

## Cómo agregar una fuente nueva

1. Coloca el JSON en la carpeta correcta dentro de `resources/`.
2. Importa el archivo en [lib/resources.ts](../lib/resources.ts).
3. Agrega una entrada al arreglo `sources` con:
   - `type`
   - `language`
   - `label`
   - `document`
4. Verifica que el adaptador del tipo ya soporte la forma del registro.

Si la forma del documento no coincide con las variantes ya soportadas, hay que
extender el adaptador en `lib/resources.ts`.

## Qué no va aquí

- Logos, ilustraciones u otros assets públicos: van en [`public/`](../public/).
- Documentación de referencia para usuarios: no forma parte de este índice de
  fuentes consumidas por la app.

## Atribución

El contenido derivado del Daggerheart SRD se usa bajo la Darrington Press
Community Gaming License. Daggerheart™ pertenece a Darrington Press. El
contenido comunitario sigue la atribución que corresponda a su fuente.
