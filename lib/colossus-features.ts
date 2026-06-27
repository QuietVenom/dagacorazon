import type { FeatureType } from "@/lib/feature-types";
import type { ContentText, FeatureLibrary, FeatureTemplate } from "@/lib/feature-library";

/**
 * Recommended colossus features, offered in both the main card and the segment
 * editors. Grouped by feature type (Passive / Action / Reaction) the same way
 * the source material organizes them.
 */

const groupLabels: Record<FeatureType, ContentText> = {
  Passive: { en: "Passive", es: "Pasiva", "pt-br": "Passiva" },
  Action: { en: "Action", es: "Acción", "pt-br": "Ação" },
  Reaction: { en: "Reaction", es: "Reacción", "pt-br": "Reação" },
};

const feature = (
  id: string,
  type: FeatureType,
  title: ContentText,
  description: ContentText,
): FeatureTemplate => ({ id, group: type, type, title, description });

const templates: FeatureTemplate[] = [
  // ── Passive ──
  feature(
    "fatal",
    "Passive",
    { en: "Fatal", es: "Fatal", "pt-br": "Fatal" },
    {
      en: "When this segment is Destroyed, the colossus is defeated.",
      es: "Cuando este segmento es Destruido, el coloso es derrotado.",
      "pt-br": "Quando este segmento é Destruído, o colosso é derrotado.",
    },
  ),
  feature(
    "chain",
    "Passive",
    { en: "Chain (A)", es: "Cadena (A)", "pt-br": "Corrente (A)" },
    {
      en: "When all segments in this chain are Destroyed, the colossus is defeated.",
      es: "Cuando todos los segmentos de esta cadena son Destruidos, el coloso es derrotado.",
      "pt-br": "Quando todos os segmentos desta corrente são Destruídos, o colosso é derrotado.",
    },
  ),
  feature(
    "strike-melee",
    "Passive",
    { en: "Strike (Melee)", es: "Golpe (Cuerpo a cuerpo)", "pt-br": "Golpe (Corpo a corpo)" },
    {
      en: "This segment is immune to damage from attacks not made within Melee range.",
      es: "Este segmento es inmune al daño de ataques que no se hagan dentro del rango Cuerpo a cuerpo.",
      "pt-br": "Este segmento é imune a dano de ataques que não sejam feitos dentro do alcance Corpo a corpo.",
    },
  ),
  feature(
    "armored",
    "Passive",
    { en: "Armored", es: "Acorazado", "pt-br": "Blindado" },
    {
      en: "When this segment marks HP from an attack, it marks 1 fewer HP.",
      es: "Cuando este segmento marca PG por un ataque, marca 1 PG menos.",
      "pt-br": "Quando este segmento marca PV por um ataque, marca 1 PV a menos.",
    },
  ),
  feature(
    "climbing",
    "Passive",
    { en: "Climbing (+3)", es: "Escalada (+3)", "pt-br": "Escalada (+3)" },
    {
      en: "This segment's Difficulty gains a +3 bonus against action rolls made to climb it.",
      es: "La Dificultad de este segmento gana un bono de +3 contra las tiradas de acción para escalarlo.",
      "pt-br": "A Dificuldade deste segmento ganha um bônus de +3 contra os testes de ação feitos para escalá-lo.",
    },
  ),
  feature(
    "not-climbable",
    "Passive",
    { en: "Not Climbable", es: "No escalable", "pt-br": "Não escalável" },
    {
      en: "This segment can't be climbed.",
      es: "Este segmento no puede ser escalado.",
      "pt-br": "Este segmento não pode ser escalado.",
    },
  ),
  feature(
    "weak-point",
    "Passive",
    { en: "Weak Point", es: "Punto débil", "pt-br": "Ponto fraco" },
    {
      en: "The colossus has a weak point on this segment. When this segment marks HP from an attack made within Melee range, it marks an additional HP.",
      es: "El coloso tiene un punto débil en este segmento. Cuando este segmento marca PG por un ataque hecho dentro del rango Cuerpo a cuerpo, marca un PG adicional.",
      "pt-br": "O colosso tem um ponto fraco neste segmento. Quando este segmento marca PV por um ataque feito dentro do alcance Corpo a corpo, marca um PV adicional.",
    },
  ),
  // ── Action ──
  feature(
    "shake-off",
    "Action",
    { en: "Shake Off", es: "Sacudida", "pt-br": "Sacudir" },
    {
      en: "Spend a Fear to throw off foes. All creatures on the colossus must make a Strength Reaction Roll. Targets who fail fall to the ground and must mark a HP. Targets who succeed must mark a Stress.",
      es: "Gasta un Miedo para arrojar a los enemigos. Todas las criaturas sobre el coloso deben hacer una tirada de Reacción de Fuerza. Los objetivos que fallan caen al suelo y deben marcar un PG. Los objetivos que tienen éxito deben marcar un Estrés.",
      "pt-br": "Gaste um Medo para arremessar os inimigos. Todas as criaturas sobre o colosso devem fazer um teste de Reação de Força. Os alvos que falham caem ao chão e devem marcar um PV. Os alvos que têm sucesso devem marcar um Estresse.",
    },
  ),
  feature(
    "kudamats-rage",
    "Action",
    { en: "Kudamat's Rage", es: "Furia de Kudamat", "pt-br": "Fúria de Kudamat" },
    {
      en: "Spend 2 Fear to force all PCs within Very Far range to succeed on a Presence Reaction Roll or become Shaken. While Shaken, they don't gain Hope on a result with Hope and instead clear the Shaken condition.",
      es: "Gasta 2 Miedo para forzar a todos los PJ dentro del rango Muy lejos a superar una tirada de Reacción de Presencia o quedar Conmocionados. Mientras están Conmocionados, no ganan Esperanza en un resultado con Esperanza y, en su lugar, eliminan la condición Conmocionado.",
      "pt-br": "Gaste 2 Medo para forçar todos os PJs dentro do alcance Muito longe a ter sucesso em um teste de Reação de Presença ou ficar Abalados. Enquanto Abalados, não ganham Esperança em um resultado com Esperança e, em vez disso, removem a condição Abalado.",
    },
  ),
  // ── Reaction ──
  feature(
    "swatting-pests",
    "Reaction",
    { en: "Swatting Pests", es: "Aplastar plagas", "pt-br": "Esmagar pragas" },
    {
      en: "When the colossus is attacked by a flying target within Far range, you can make a standard attack against the attacker. On a success, add a d20 to the damage roll and the target is knocked to the ground within Far range.",
      es: "Cuando un objetivo volador ataca al coloso dentro del rango Lejos, puedes hacer un ataque estándar contra el atacante. Si tiene éxito, añade un d20 a la tirada de daño y el objetivo es derribado al suelo dentro del rango Lejos.",
      "pt-br": "Quando um alvo voador ataca o colosso dentro do alcance Longe, você pode fazer um ataque padrão contra o atacante. Com sucesso, adicione um d20 à rolagem de dano e o alvo é derrubado ao chão dentro do alcance Longe.",
    },
  ),
  feature(
    "collapsed",
    "Reaction",
    { en: "Collapsed", es: "Derrumbado", "pt-br": "Desabado" },
    {
      en: "When the colossus marks at least 1 HP on all Leg segments, it Collapses. While the colossus is Collapsed, segments that aren't accessible from the ground can be climbed.",
      es: "Cuando el coloso marca al menos 1 PG en todos los segmentos de Pierna, se Derrumba. Mientras el coloso está Derrumbado, los segmentos que no son accesibles desde el suelo pueden ser escalados.",
      "pt-br": "Quando o colosso marca pelo menos 1 PV em todos os segmentos de Perna, ele Desaba. Enquanto o colosso está Desabado, os segmentos que não são acessíveis a partir do chão podem ser escalados.",
    },
  ),
  feature(
    "colossal-power",
    "Reaction",
    { en: "Colossal Power", es: "Poder colosal", "pt-br": "Poder colossal" },
    {
      en: "When the colossus fails an attack, you gain a Fear.",
      es: "Cuando el coloso falla un ataque, ganas un Miedo.",
      "pt-br": "Quando o colosso falha um ataque, você ganha um Medo.",
    },
  ),
];

export const colossusFeatures: FeatureLibrary = {
  label: {
    en: "Recommended Features",
    es: "Rasgos recomendados",
    "pt-br": "Características recomendadas",
  },
  choose: {
    en: "Choose a recommendation",
    es: "Elige una recomendación",
    "pt-br": "Escolha uma recomendação",
  },
  groups: (Object.keys(groupLabels) as FeatureType[]).map((key) => ({
    key,
    label: groupLabels[key],
  })),
  templates,
};
