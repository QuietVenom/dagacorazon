import type { LocalizedText } from "@/lib/i18n";
import type { BrewType } from "@/lib/storage";

/**
 * SRD reference content surfaced from the Workshop as guidance for the user.
 *
 * `moduleInfo` is the per-module guide rendered in the info dialog (Markdown).
 * `valueExplanations` are short, directed explanations shown next to specific
 * select fields (e.g. an adversary's role), keyed by `${schemaId}.${fieldKey}`
 * → stored value. Keep the stored value canonical; only labels/text localize.
 */

const adversaryGuide: LocalizedText = {
  es: `## Punto de partida recomendado

Si no sabes por dónde empezar, parte de un adversario existente y ajústalo.

- Si es del mismo \`Tier\` que el grupo, suele bastar con cambiar rasgos, ficción y algunas features.
- Si lo subes o bajas de \`Tier\`, cambia primero sus estadísticas base con la tabla siguiente.
- Al subir de \`Tier\` suele convenir añadir features; al bajarlo, quitarlas o simplificarlas.

## Estadísticas orientativas por Tier

| Estadística | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
| --- | --- | --- | --- | --- |
| Modificador de ataque | +1 | +2 | +3 | +4 |
| Dados de daño | 1d6+2 a 1d12+4 | 2d6+3 a 2d12+4 | 3d8+3 a 3d12+5 | 4d8+10 a 4d12+15 |
| Dificultad | 11 | 14 | 17 | 20 |
| Umbrales | 7 / 12 | 10 / 20 | 20 / 32 | 25 / 45 |

## Puntos de vida: cuánto dura el combate

La cantidad de \`PG\` define sobre todo cuánto tiempo permanece el adversario en escena.

| PG | Guía de uso |
| --- | --- |
| 1 | Cae con un solo golpe exitoso. No necesita umbrales. Ideal para Esbirro. |
| 2 | Puede caer de un golpe y con seguridad en dos. Solo necesita umbral Mayor. |
| 3 | Puede caer por un gran impacto. Para enemigos que resisten unos pocos golpes. |
| 4-6 | Rango seguro para un adversario Estándar. Dura varios golpes sin alargar la pelea. |
| 7-9 | Más duro de lo normal. Úsalo con moderación para evitar combates lentos. |
| 10+ | Muy difícil de derrotar. Normalmente solo uno por encuentro, con apoyo menor. |

## Reglas prácticas

- Si cambia de \`Tier\`, ajusta primero ataque, daño, dificultad y umbrales.
- Para un encuentro rápido, baja \`PG\` antes que quitar identidad al bloque.
- Para un jefe memorable, no subas solo números: añade presión táctica, foco múltiple o interacción con aliados.
- Si la pelea se siente larga, suele ser por exceso de \`PG\`, demasiados enemigos duros o muchas reacciones simultáneas.

> Elige el rol de cada adversario y usa el botón **?** junto a "Rol" para ver su función táctica.`,
  pt: `## Ponto de partida recomendado

Se não sabe por onde começar, parta de um adversário existente e ajuste.

- Se for do mesmo \`Tier\` que o grupo, costuma bastar mudar traços, ficção e algumas features.
- Se subir ou descer de \`Tier\`, mude primeiro os atributos base com a tabela a seguir.
- Ao subir de \`Tier\` costuma convir adicionar features; ao descer, remover ou simplificar.

## Atributos orientativos por Tier

| Atributo | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
| --- | --- | --- | --- | --- |
| Modificador de ataque | +1 | +2 | +3 | +4 |
| Dados de dano | 1d6+2 a 1d12+4 | 2d6+3 a 2d12+4 | 3d8+3 a 3d12+5 | 4d8+10 a 4d12+15 |
| Dificuldade | 11 | 14 | 17 | 20 |
| Limiares | 7 / 12 | 10 / 20 | 20 / 32 | 25 / 45 |

## Pontos de vida: quanto dura o combate

A quantidade de \`PV\` define sobretudo quanto tempo o adversário permanece em cena.

| PV | Guia de uso |
| --- | --- |
| 1 | Cai com um único golpe bem-sucedido. Não precisa de limiares. Ideal para Lacaio. |
| 2 | Pode cair de um golpe e com certeza em dois. Só precisa do limiar Maior. |
| 3 | Pode cair por um grande impacto. Para inimigos que resistem a poucos golpes. |
| 4-6 | Faixa segura para um adversário Padrão. Dura vários golpes sem alongar a luta. |
| 7-9 | Mais duro que o normal. Use com moderação para evitar combates lentos. |
| 10+ | Muito difícil de derrotar. Normalmente só um por encontro, com apoio menor. |

## Regras práticas

- Se mudar de \`Tier\`, ajuste primeiro ataque, dano, dificuldade e limiares.
- Para um encontro rápido, baixe \`PV\` antes de tirar a identidade do bloco.
- Para um chefe memorável, não suba só números: adicione pressão tática, foco múltiplo ou interação com aliados.
- Se a luta parecer longa, costuma ser por excesso de \`PV\`, inimigos duros demais ou muitas reações simultâneas.

> Escolha a função de cada adversário e use o botão **?** ao lado de "Função" para ver seu papel tático.`,
};

const colossusGuide: LocalizedText = {
  es: `## Qué hace distinto a un Coloso

Un coloso no es solo un adversario grande: es un conjunto de segmentos que obliga al grupo a descubrir qué partes importan, cómo alcanzarlas, en qué orden destruirlas y qué riesgos aparecen al atacar cada sección. Dale siempre un título evocador.

## Punto de partida recomendado

- Si tienes ejemplos previos, parte de uno y ajústalo.
- Diseña primero la lógica del encuentro: acceso, segmentos críticos, protección, castigos y ventanas de oportunidad.
- Después asigna estadísticas con la tabla por \`Tier\`.

## Estadísticas orientativas por Tier

| Estadística | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
| --- | --- | --- | --- | --- |
| Modificador de ataque | +2 | +2 | +3 | +4 |
| Dados de daño | 1d6+2 a 1d12+4 | 2d8+6 a 2d20+2 | 3d8+3 a 3d12+8 | 4d8+10 a 3d20+10 |
| Dificultad | 13 | 14 | 15 | 17 |
| Umbrales | 11 / 22 | 16 / 25 | 25 / 48 | 30 / 65 |

## Cómo se derrota un coloso

- Cae automáticamente cuando todos sus segmentos son destruidos.
- Muchos colosos no requieren destruirlos todos porque tienen segmentos \`Fatal\`.
- Cómo acceden los PJ a esos segmentos es parte central del diseño.

## PG de segmentos

- Lo normal es entre \`3\` y \`6 PG\` por segmento.
- Los segmentos repetidos van en el extremo bajo; los cruciales suelen tener más.
- Algunos pueden tener \`0 PG\` si no son vulnerables al daño directo.
- Cuidado con los segmentos invulnerables: si los jugadores sienten que no pueden avanzar, frustra.

## Checklist rápido

- ¿Tiene un título evocador?
- ¿Hay al menos un segmento cuya destrucción cambie claramente el combate?
- ¿Los jugadores pueden descubrir cómo progresar sin adivinar a ciegas?
- ¿La distribución de \`PG\` recompensa atacar las partes importantes?`,
  pt: `## O que torna um Colosso diferente

Um colosso não é só um adversário grande: é um conjunto de segmentos que obriga o grupo a descobrir quais partes importam, como alcançá-las, em que ordem destruí-las e que riscos surgem ao atacar cada seção. Dê sempre um título evocativo.

## Ponto de partida recomendado

- Se tiver exemplos prévios, parta de um e ajuste.
- Projete primeiro a lógica do encontro: acesso, segmentos críticos, proteção, punições e janelas de oportunidade.
- Depois atribua atributos com a tabela por \`Tier\`.

## Atributos orientativos por Tier

| Atributo | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
| --- | --- | --- | --- | --- |
| Modificador de ataque | +2 | +2 | +3 | +4 |
| Dados de dano | 1d6+2 a 1d12+4 | 2d8+6 a 2d20+2 | 3d8+3 a 3d12+8 | 4d8+10 a 3d20+10 |
| Dificuldade | 13 | 14 | 15 | 17 |
| Limiares | 11 / 22 | 16 / 25 | 25 / 48 | 30 / 65 |

## Como se derrota um colosso

- Cai automaticamente quando todos os seus segmentos são destruídos.
- Muitos colossos não exigem destruir todos porque têm segmentos \`Fatal\`.
- Como os PJs acessam esses segmentos é parte central do design.

## PV dos segmentos

- O normal é entre \`3\` e \`6 PV\` por segmento.
- Segmentos repetidos ficam no extremo baixo; os cruciais costumam ter mais.
- Alguns podem ter \`0 PV\` se não forem vulneráveis a dano direto.
- Cuidado com segmentos invulneráveis: se os jogadores sentem que não avançam, frustra.

## Checklist rápido

- Tem um título evocativo?
- Há ao menos um segmento cuja destruição muda claramente o combate?
- Os jogadores conseguem descobrir como progredir sem adivinhar às cegas?
- A distribuição de \`PV\` recompensa atacar as partes importantes?`,
};

const environmentGuide: LocalizedText = {
  es: `## Punto de partida recomendado

Si no sabes por dónde empezar, parte de un entorno existente y ajústalo.

- Si ya está en el \`Tier\` del grupo, suele bastar con cambiar color, ficción y algunas features.
- Si lo subes o bajas de \`Tier\`, cambia primero sus estadísticas base con la tabla siguiente.
- Si invoca adversarios, adapta también esos adversarios al \`Tier\` adecuado.

## Estadísticas orientativas por Tier

| Estadística | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
| --- | --- | --- | --- | --- |
| Dados de daño | 1d6+1 a 1d8+3 | 2d6+3 a 2d10+2 | 3d8+3 a 3d10+1 | 4d8+3 a 4d10+10 |
| Dificultad | 11 | 14 | 17 | 20 |

## Principio importante

Un bloque de entorno no limita todo lo que puede pasar en escena. Sus features sirven para impulsar la imaginación, crear presión y abrir preguntas interesantes. Si en la ficción surge otra consecuencia coherente, úsala.

## Reglas prácticas

- Para un entorno más peligroso, sube daño o añade una feature activa antes de llenar la escena de adversarios extra.
- Para un entorno memorable, cambia reglas de posicionamiento, visibilidad, movimiento o recursos.
- Si invoca criaturas, que no roben todo el protagonismo a la escena principal.
- Un buen entorno no solo castiga: también ofrece información, oportunidades o decisiones.

> Elige el tipo de entorno y usa el botón **?** junto a "Tipo" para ver qué amenazas y features sugiere.`,
  pt: `## Ponto de partida recomendado

Se não sabe por onde começar, parta de um ambiente existente e ajuste.

- Se já estiver no \`Tier\` do grupo, costuma bastar mudar cor, ficção e algumas features.
- Se subir ou descer de \`Tier\`, mude primeiro os atributos base com a tabela a seguir.
- Se invocar adversários, adapte também esses adversários ao \`Tier\` adequado.

## Atributos orientativos por Tier

| Atributo | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
| --- | --- | --- | --- | --- |
| Dados de dano | 1d6+1 a 1d8+3 | 2d6+3 a 2d10+2 | 3d8+3 a 3d10+1 | 4d8+3 a 4d10+10 |
| Dificuldade | 11 | 14 | 17 | 20 |

## Princípio importante

Um bloco de ambiente não limita tudo o que pode acontecer em cena. Suas features servem para impulsionar a imaginação, criar pressão e abrir perguntas interessantes. Se na ficção surgir outra consequência coerente, use-a.

## Regras práticas

- Para um ambiente mais perigoso, suba o dano ou adicione uma feature ativa antes de encher a cena de adversários extras.
- Para um ambiente memorável, mude regras de posicionamento, visibilidade, movimento ou recursos.
- Se invocar criaturas, que não roubem todo o protagonismo da cena principal.
- Um bom ambiente não só pune: também oferece informação, oportunidades ou decisões.

> Escolha o tipo de ambiente e use o botão **?** ao lado de "Tipo" para ver que ameaças e features ele sugere.`,
};

const equipmentGuide: LocalizedText = {
  es: `## Regla general por Tier

El equipo de \`Tier 1\` suele ser sencillo. A medida que sube el \`Tier\`, puede volverse más potente o especializado. Recuerda que incluso el equipo básico escala bien en manos de personajes de nivel alto, porque su competencia, nivel y mejoras aumentan su impacto.

## Tres grandes categorías

- \`Weapons\` (armas)
- \`Armor\` (armadura)
- \`Loot\` (botín)

## Armas

- Definen: \`Tier\`, rasgo, rango, daño, tipo de daño y carga.
- El daño se escribe como \`dX+Y\` (p. ej. \`d10+3\`); la cantidad de dados la da la competencia del personaje.
- La carga indica una o dos manos: normalmente no se manejan armas cuya carga total supere \`2\`.

## Armadura

- Registra umbrales base, puntuación base y features si aplica.
- Los umbrales \`Menor\` y \`Mayor\` reciben un bono igual al nivel de quien la lleva, y la puntuación también mejora al subir de nivel.
- Por eso, no infles demasiado sus números iniciales.

## Botín

- La categoría más simple: nombre y una feature que describa qué hace.
- El botín general suele ser reutilizable; el consumible se pierde al usarlo.

## Reglas prácticas

- Para un arma, piensa primero en la fantasía de uso y luego en rango, rasgo y carga.
- Para armadura, recuerda que ya escala con el nivel del usuario.
- Para botín, prioriza efectos claros y evocadores sobre texto largo.

> Elige el tipo de equipo y usa el botón **?** junto a "Tipo" para ver qué define a cada categoría.`,
  pt: `## Regra geral por Tier

O equipamento de \`Tier 1\` costuma ser simples. Conforme o \`Tier\` sobe, pode ficar mais potente ou especializado. Lembre que mesmo o equipamento básico escala bem nas mãos de personagens de nível alto, porque proficiência, nível e melhorias aumentam seu impacto.

## Três grandes categorias

- \`Weapons\` (armas)
- \`Armor\` (armadura)
- \`Loot\` (saque)

## Armas

- Definem: \`Tier\`, atributo, alcance, dano, tipo de dano e carga.
- O dano é escrito como \`dX+Y\` (ex. \`d10+3\`); a quantidade de dados vem da proficiência do personagem.
- A carga indica uma ou duas mãos: normalmente não se usam armas cuja carga total passe de \`2\`.

## Armadura

- Registra limiares base, pontuação base e features, se houver.
- Os limiares \`Menor\` e \`Maior\` recebem um bônus igual ao nível de quem a usa, e a pontuação também melhora ao subir de nível.
- Por isso, não infle demais seus números iniciais.

## Saque

- A categoria mais simples: nome e uma feature que descreva o que faz.
- O saque geral costuma ser reutilizável; o consumível se perde ao usar.

## Regras práticas

- Para uma arma, pense primeiro na fantasia de uso e depois em alcance, atributo e carga.
- Para armadura, lembre que ela já escala com o nível do usuário.
- Para saque, priorize efeitos claros e evocativos em vez de texto longo.

> Escolha o tipo de equipamento e use o botão **?** ao lado de "Tipo" para ver o que define cada categoria.`,
};

export const moduleInfo: Record<BrewType, LocalizedText> = {
  adversary: adversaryGuide,
  colossus: colossusGuide,
  environment: environmentGuide,
  equipment: equipmentGuide,
};

/**
 * Directed explanations for individual select values, keyed by
 * `${schemaId}.${fieldKey}` → stored value.
 */
export const valueExplanations: Record<
  string,
  Record<string, LocalizedText>
> = {
  "adversary.role": {
    Bruiser: {
      es: "Combatiente de corta distancia. Suele causar mucho daño y tener más PG que la media, con menor modificador de ataque y dificultad. Frecuente en ataques de área o golpes que desplazan.",
      pt: "Combatente de curta distância. Costuma causar muito dano e ter mais PV que a média, com menor modificador de ataque e dificuldade. Comum em ataques em área ou golpes que empurram.",
    },
    Horde: {
      es: "Representa grupos numerosos de enemigos débiles. Dificultad baja, modificador de ataque bajo y umbrales promedio. Su daño empieza alto y suele reducirse a la mitad tras recibir bastante daño.",
      pt: "Representa grupos numerosos de inimigos fracos. Dificuldade baixa, modificador de ataque baixo e limiares medianos. Seu dano começa alto e costuma cair pela metade após sofrer bastante dano.",
    },
    Leader: {
      es: "Sus estadísticas superan a otros adversarios de su Tier. Causa mucho daño y tiene dificultad alta. Casi siempre trae features para invocar, reforzar o poner en foco a sus aliados.",
      pt: "Seus atributos superam os de outros adversários do mesmo Tier. Causa muito dano e tem dificuldade alta. Quase sempre traz features para invocar, reforçar ou destacar seus aliados.",
    },
    Minion: {
      es: "Siempre tiene 1 PG y no usa umbrales. Hace daño fijo en vez de tirar dados, para agilizar la mesa. Su modificador de ataque suele ser bajo, pero es peligroso en grupo con Group Attack.",
      pt: "Sempre tem 1 PV e não usa limiares. Causa dano fixo em vez de rolar dados, para agilizar a mesa. Seu modificador de ataque costuma ser baixo, mas é perigoso em grupo com Group Attack.",
    },
    Ranged: {
      es: "Suele tener menos umbrales y menos PG. Golpea fuerte y evita el cuerpo a cuerpo siempre que puede.",
      pt: "Costuma ter menos limiares e menos PV. Golpeia forte e evita o corpo a corpo sempre que pode.",
    },
    Skulk: {
      es: "Suele tener PG bajo y daño base modesto. Brilla por sus features y experiencias: movilidad, emboscada o daño extra contra PJ Vulnerables.",
      pt: "Costuma ter PV baixo e dano base modesto. Brilha por suas features e experiências: mobilidade, emboscada ou dano extra contra PJs Vulneráveis.",
    },
    Social: {
      es: "Estadísticas de combate pobres: poco PG, poco daño y umbrales bajos. No busca dominar una pelea directa; destaca en Estrés, distracción, manipulación o invocar ayuda.",
      pt: "Atributos de combate fracos: pouco PV, pouco dano e limiares baixos. Não busca dominar uma luta direta; destaca-se em Estresse, distração, manipulação ou em invocar ajuda.",
    },
    Solo: {
      es: "Estadísticas por encima de la media, a menudo como un Líder. Se diferencia porque suele actuar varias veces, normalmente con Relentless. En jefes por fases, cada fase agradece menos PG que la media.",
      pt: "Atributos acima da média, muitas vezes como um Líder. Diferencia-se por costumar agir várias vezes, normalmente com Relentless. Em chefes por fases, cada fase pede menos PV que a média.",
    },
    Standard: {
      es: "Perfil medio y estable. Sirve para proteger a otros adversarios y completar números.",
      pt: "Perfil médio e estável. Serve para proteger outros adversários e completar números.",
    },
    Support: {
      es: "Estadísticas de combate bajas para su Tier, salvo el Estrés, más alto para alimentar sus habilidades. Sus features manipulan el campo, debilitan PJ o curan/potencian aliados.",
      pt: "Atributos de combate baixos para seu Tier, exceto o Estresse, mais alto para alimentar suas habilidades. Suas features manipulam o campo, enfraquecem PJs ou curam/fortalecem aliados.",
    },
  },
  "environment.category": {
    Traversal: {
      es: "Se centra en atravesar o superar el entorno. Propone reglas claras de avance, navegación o resistencia, con consecuencias por fallo. Ejemplos: pantano venenoso, lago helado, gauntlet de trampas.",
      pt: "Foca em atravessar ou superar o ambiente. Propõe regras claras de avanço, navegação ou resistência, com consequências por falha. Exemplos: pântano venenoso, lago gelado, corredor de armadilhas.",
    },
    Social: {
      es: "El combate no es su interacción principal. Sus features se enfocan en obtener información, acceder a personas o recursos y sufrir consecuencias por errores sociales. Suele presionar con Estrés. Ejemplos: tribunal, gala, casa de ópera.",
      pt: "O combate não é sua interação principal. Suas features focam em obter informação, acessar pessoas ou recursos e sofrer consequências por erros sociais. Costuma pressionar com Estresse. Exemplos: tribunal, gala, casa de ópera.",
    },
    Exploration: {
      es: "Se centra en interactividad y descubrimiento. Sus features explican cómo interactúan los PJ con el lugar, qué pueden descubrir y qué pasa si se equivocan. Ejemplos: biblioteca olvidada, tumba, jardín despierto.",
      pt: "Foca em interatividade e descoberta. Suas features explicam como os PJs interagem com o lugar, o que podem descobrir e o que acontece se errarem. Exemplos: biblioteca esquecida, tumba, jardim desperto.",
    },
    Event: {
      es: "El tipo más espectacular y específico: representa actividades o circunstancias excepcionales (más que un espacio físico) que alteran las reglas normales. Sus features definen qué cambia, qué oportunidades surgen y cómo afecta a PJ y adversarios. Ejemplos: grieta dimensional, batalla sobre dirigible, alineación celestial.",
      pt: "O tipo mais espetacular e específico: representa atividades ou circunstâncias excepcionais (mais que um espaço físico) que alteram as regras normais. Suas features definem o que muda, que oportunidades surgem e como afeta PJs e adversários. Exemplos: fenda dimensional, batalha sobre dirigível, alinhamento celestial.",
    },
  },
  "equipment.category": {
    "Physical Weapon": {
      es: "Arma principal de personajes orientados al daño físico. Define rasgo, rango, daño (dX+Y; los dados los da la competencia), tipo de daño y carga.",
      pt: "Arma principal de personagens voltados ao dano físico. Define atributo, alcance, dano (dX+Y; os dados vêm da proficiência), tipo de dano e carga.",
    },
    "Magic Weapon": {
      es: "Arma principal de personajes orientados al daño mágico. Comparte las estadísticas de arma: rasgo, rango, daño, tipo y carga.",
      pt: "Arma principal de personagens voltados ao dano mágico. Compartilha os atributos de arma: atributo, alcance, dano, tipo e carga.",
    },
    "Secondary Weapon": {
      es: "Ocupa la mano libre cuando el arma principal es de una mano. Suele aportar utilidad extra y a menudo hace daño físico.",
      pt: "Ocupa a mão livre quando a arma principal é de uma mão. Costuma trazer utilidade extra e muitas vezes causa dano físico.",
    },
    Wheelchair: {
      es: "Equipo de movilidad que se registra como un objeto con estadísticas tipo arma (rasgo, rango, daño, carga) según su diseño.",
      pt: "Equipamento de mobilidade registrado como um item com atributos no estilo de arma (atributo, alcance, dano, carga) conforme seu design.",
    },
    Armor: {
      es: "Protección base: umbrales base y puntuación base. Importante: los umbrales Menor y Mayor reciben un bono igual al nivel de quien la lleva, así que no infles sus números iniciales.",
      pt: "Proteção base: limiares base e pontuação base. Importante: os limiares Menor e Maior recebem um bônus igual ao nível de quem a usa, então não infle seus números iniciais.",
    },
    Loot: {
      es: "La categoría más simple y flexible. Solo necesita nombre y una feature que describa qué hace. El botín general suele ser reutilizable.",
      pt: "A categoria mais simples e flexível. Precisa apenas de nome e uma feature que descreva o que faz. O saque geral costuma ser reutilizável.",
    },
    Consumable: {
      es: "Como el botín, pero se pierde al usarlo. Prioriza efectos claros y evocadores sobre texto largo.",
      pt: "Como o saque, mas se perde ao usar. Priorize efeitos claros e evocativos em vez de texto longo.",
    },
  },
};

/** Look up a directed explanation for a select value, if one exists. */
export const valueExplanationFor = (
  schemaId: string,
  fieldKey: string,
  value: string,
): LocalizedText | undefined =>
  value ? valueExplanations[`${schemaId}.${fieldKey}`]?.[value] : undefined;

/** Whether a field offers per-value explanations at all (to show the button). */
export const fieldHasExplanations = (schemaId: string, fieldKey: string) =>
  Boolean(valueExplanations[`${schemaId}.${fieldKey}`]);
