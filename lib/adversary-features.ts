import type { FeatureType } from "@/lib/feature-types";
import type { ContentText, FeatureLibrary } from "@/lib/feature-library";

export type AdversaryFeatureGroup =
  | "Bruiser"
  | "Horde"
  | "Leader"
  | "Minion"
  | "Ranged"
  | "Skulk"
  | "Solo"
  | "Standard"
  | "Support"
  | "Common"
  | "Undead"
  | "Flying"
  | "Soft Moves";

export interface AdversaryFeatureTemplate {
  id: string;
  group: AdversaryFeatureGroup;
  type: FeatureType;
  title: ContentText;
  description: ContentText;
}

export const adversaryFeatureGroupLabels: Record<AdversaryFeatureGroup, ContentText> = {
  Bruiser: { en: "Bruiser", es: "Bruto", "pt-br": "Bruto" },
  Horde: { en: "Horde", es: "Horda", "pt-br": "Horda" },
  Leader: { en: "Leader", es: "Líder", "pt-br": "Líder" },
  Minion: { en: "Minion", es: "Esbirro", "pt-br": "Lacaio" },
  Ranged: { en: "Ranged", es: "A distancia", "pt-br": "À distância" },
  Skulk: { en: "Skulk", es: "Acechador", "pt-br": "Espreitador" },
  Solo: { en: "Solo", es: "Solo", "pt-br": "Solo" },
  Standard: { en: "Standard", es: "Estándar", "pt-br": "Padrão" },
  Support: { en: "Support", es: "Apoyo", "pt-br": "Suporte" },
  Common: { en: "Common", es: "Comunes", "pt-br": "Comuns" },
  Undead: { en: "Undead", es: "No muertos", "pt-br": "Mortos-vivos" },
  Flying: { en: "Flying", es: "Voladores", "pt-br": "Voadores" },
  "Soft Moves": {
    en: "Soft Moves",
    es: "Movimientos suaves",
    "pt-br": "Movimentos suaves",
  },
};

export const commonFeatureLabel: ContentText = {
  en: "Common Features",
  es: "Rasgos comunes",
  "pt-br": "Características comuns",
};

export const chooseFeatureLabel: ContentText = {
  en: "Choose a recommendation",
  es: "Elige una recomendación",
  "pt-br": "Escolha uma recomendação",
};

const feature = (
  id: string,
  group: AdversaryFeatureGroup,
  type: FeatureType,
  title: ContentText,
  description: ContentText,
): AdversaryFeatureTemplate => ({ id, group, type, title, description });

export const adversaryFeatureLibrary: AdversaryFeatureTemplate[] = [
  feature(
    "bruiser-momentum",
    "Bruiser",
    "Reaction",
    { en: "Momentum", es: "Impulso", "pt-br": "Ímpeto" },
    {
      en: "When {{name}} makes a successful attack against a PC, you gain a Fear.",
      es: "Cuando {{name}} realiza un ataque exitoso contra un PJ, obtienes un Miedo.",
      "pt-br": "Quando {{name}} faz um ataque bem-sucedido contra um PJ, você ganha um Medo.",
    },
  ),
  feature(
    "bruiser-ramp-up",
    "Bruiser",
    "Passive",
    { en: "Ramp Up", es: "Aceleración", "pt-br": "Avanço" },
    {
      en: "You must spend a Fear to spotlight {{name}}. While spotlighted, they can make their standard attack against all targets within range.",
      es: "Debes gastar un Miedo para poner en foco a {{name}}. Mientras esté en foco, puede realizar su ataque estándar contra todos los objetivos dentro del alcance.",
      "pt-br": "Você deve gastar um Medo para colocar {{name}} em foco. Enquanto estiver em foco, pode fazer seu ataque padrão contra todos os alvos dentro do alcance.",
    },
  ),
  feature(
    "bruiser-slow",
    "Bruiser",
    "Passive",
    { en: "Slow", es: "Lento", "pt-br": "Lento" },
    {
      en: "When you spotlight {{name}} and they don't have a token on their stat block, they can't act yet. Place a token on their stat block and describe what they're preparing to do. When you spotlight {{name}} and they have a token on their stat block, clear the token and they can act.",
      es: "Cuando pones en foco a {{name}} y no tiene una ficha en su bloque de estadísticas, todavía no puede actuar. Coloca una ficha en su bloque y describe lo que se prepara para hacer. Cuando vuelvas a ponerlo en foco y tenga una ficha, retírala y podrá actuar.",
      "pt-br": "Quando você coloca {{name}} em foco e não há uma ficha em seu bloco de estatísticas, ele ainda não pode agir. Coloque uma ficha no bloco e descreva o que está preparando. Quando você o colocar em foco novamente e houver uma ficha, remova-a e ele poderá agir.",
    },
  ),
  feature(
    "bruiser-terrifying",
    "Bruiser",
    "Passive",
    { en: "Terrifying", es: "Aterrador", "pt-br": "Aterrorizante" },
    {
      en: "When {{name}} makes a successful attack, all PCs within Far range lose a Hope and you gain a Fear.",
      es: "Cuando {{name}} realiza un ataque exitoso, todos los PJ dentro del alcance Lejos pierden una Esperanza y tú ganas un Miedo.",
      "pt-br": "Quando {{name}} faz um ataque bem-sucedido, todos os PJs em alcance Longe perdem uma Esperança e você ganha um Medo.",
    },
  ),
  feature(
    "horde",
    "Horde",
    "Passive",
    {
      en: "Horde ({{damage}})",
      es: "Horda ({{damage}})",
      "pt-br": "Horda ({{damage}})",
    },
    {
      en: "When {{name}} have marked half or more of their HP, their standard attack deals {{damage}} physical damage instead.",
      es: "Cuando {{name}} haya marcado la mitad o más de sus HP, su ataque estándar inflige {{damage}} de daño físico en su lugar.",
      "pt-br": "Quando {{name}} tiver marcado metade ou mais de seus HP, seu ataque padrão causa {{damage}} de dano físico em vez disso.",
    },
  ),
  feature(
    "leader-terrifying",
    "Leader",
    "Passive",
    { en: "Terrifying", es: "Aterrador", "pt-br": "Aterrorizante" },
    {
      en: "When {{name}} makes a successful attack, all PCs within Far range lose a Hope and you gain a Fear.",
      es: "Cuando {{name}} realiza un ataque exitoso, todos los PJ dentro del alcance Lejos pierden una Esperanza y tú ganas un Miedo.",
      "pt-br": "Quando {{name}} faz um ataque bem-sucedido, todos os PJs em alcance Longe perdem uma Esperança e você ganha um Medo.",
    },
  ),
  feature(
    "leader-relentless",
    "Leader",
    "Passive",
    { en: "Relentless (X)", es: "Implacable (X)", "pt-br": "Implacável (X)" },
    {
      en: "{{name}} can be spotlighted up to X times per GM turn. Spend Fear as usual to spotlight them.",
      es: "{{name}} puede ser puesto en foco hasta X veces por turno del MJ. Gasta Miedo como de costumbre para ponerlo en foco.",
      "pt-br": "{{name}} pode ser colocado em foco até X vezes por turno do MJ. Gaste Medo normalmente para colocá-lo em foco.",
    },
  ),
  feature(
    "leader-activate-allies",
    "Leader",
    "Action",
    { en: "Activate Allies", es: "Activar aliados", "pt-br": "Ativar aliados" },
    {
      en: "Spend X Fear to spotlight 1d4 allies. Attacks they make while spotlighted in this way deal half damage.",
      es: "Gasta X Miedo para poner en foco a 1d4 aliados. Los ataques que realicen mientras estén en foco de esta forma infligen la mitad del daño.",
      "pt-br": "Gaste X Medo para colocar 1d4 aliados em foco. Os ataques que fizerem enquanto estiverem em foco dessa forma causam metade do dano.",
    },
  ),
  feature(
    "leader-direct-damage",
    "Leader",
    "Action",
    { en: "Direct Damage", es: "Daño directo", "pt-br": "Dano direto" },
    {
      en: "If the target or {{name}} has a Condition, damage dealt by {{name}} does direct damage.",
      es: "Si el objetivo o {{name}} tiene una Condición, el daño que inflige {{name}} es daño directo.",
      "pt-br": "Se o alvo ou {{name}} tiver uma Condição, o dano causado por {{name}} é dano direto.",
    },
  ),
  feature(
    "leader-call-reinforcements",
    "Leader",
    "Action",
    {
      en: "Call Reinforcements",
      es: "Pedir refuerzos",
      "pt-br": "Chamar reforços",
    },
    {
      en: "Once per scene, mark a Stress to summon [a different adversary], which appears at [Range] range.",
      es: "Una vez por escena, marca un Estrés para invocar a [un adversario diferente], que aparece a alcance [Rango].",
      "pt-br": "Uma vez por cena, marque um Estresse para invocar [um adversário diferente], que aparece em alcance [Alcance].",
    },
  ),
  feature(
    "leader-merciless",
    "Leader",
    "Passive",
    { en: "Merciless (1)", es: "Despiadado (1)", "pt-br": "Impiedoso (1)" },
    {
      en: "When {{name}} is spotlighted, spotlight one additional ally without requiring a Fear to be spent.",
      es: "Cuando {{name}} sea puesto en foco, pon en foco a un aliado adicional sin tener que gastar Miedo.",
      "pt-br": "Quando {{name}} for colocado em foco, coloque um aliado adicional em foco sem precisar gastar Medo.",
    },
  ),
  feature(
    "leader-tactician",
    "Leader",
    "Action",
    { en: "Tactician", es: "Táctico", "pt-br": "Estrategista" },
    {
      en: "When you spotlight {{name}}, mark a Stress to also spotlight two allies within Close range.",
      es: "Cuando pongas en foco a {{name}}, marca un Estrés para poner también en foco a dos aliados dentro del alcance Cerca.",
      "pt-br": "Quando você colocar {{name}} em foco, marque um Estresse para também colocar em foco dois aliados em alcance Perto.",
    },
  ),
  feature(
    "minion",
    "Minion",
    "Passive",
    { en: "Minion (X)", es: "Esbirro (X)", "pt-br": "Lacaio (X)" },
    {
      en: "{{name}} is defeated when they take any damage. For every X damage a PC deals to {{name}}, defeat an additional Minion within range the attack would succeed against.",
      es: "{{name}} es derrotado cuando recibe cualquier cantidad de daño. Por cada X de daño que un PJ inflija a {{name}}, derrota a un Esbirro adicional dentro del alcance contra el que el ataque tendría éxito.",
      "pt-br": "{{name}} é derrotado quando sofre qualquer quantidade de dano. Para cada X de dano que um PJ causar a {{name}}, derrote um Lacaio adicional dentro do alcance em que o ataque teria sucesso.",
    },
  ),
  feature(
    "minion-group-attack",
    "Minion",
    "Action",
    { en: "Group Attack", es: "Ataque grupal", "pt-br": "Ataque em grupo" },
    {
      en: "Spend a Fear to choose a target and spotlight all {{name}} within Close range of them. Those Minions move into Melee range of the target and make one shared attack roll. On a success, they deal {{standardDamage}} physical damage each. Combine this damage.",
      es: "Gasta un Miedo para elegir un objetivo y poner en foco a todos los {{name}} dentro del alcance Cerca. Esos Esbirros se mueven a alcance Cuerpo a cuerpo del objetivo y realizan una tirada de ataque compartida. Si tienen éxito, infligen {{standardDamage}} de daño físico cada uno. Combina este daño.",
      "pt-br": "Gaste um Medo para escolher um alvo e colocar em foco todos os {{name}} em alcance Perto dele. Esses Lacaios se movem para o alcance Corpo a corpo do alvo e fazem uma jogada de ataque compartilhada. Em caso de sucesso, causam {{standardDamage}} de dano físico cada um. Combine esse dano.",
    },
  ),
  feature(
    "ranged-opportunity-shot",
    "Ranged",
    "Reaction",
    {
      en: "Opportunity Shot",
      es: "Disparo de oportunidad",
      "pt-br": "Disparo de oportunidade",
    },
    {
      en: "When another adversary deals damage to a target within Far range of {{name}}, you can mark a Stress to add [extra damage] to the damage roll.",
      es: "Cuando otro adversario inflija daño a un objetivo dentro del alcance Lejos de {{name}}, puedes marcar un Estrés para agregar [daño adicional] a la tirada de daño.",
      "pt-br": "Quando outro adversário causar dano a um alvo em alcance Longe de {{name}}, você pode marcar um Estresse para adicionar [dano adicional] à jogada de dano.",
    },
  ),
  feature(
    "ranged-opportunist",
    "Ranged",
    "Passive",
    { en: "Opportunist", es: "Oportunista", "pt-br": "Oportunista" },
    {
      en: "When two or more adversaries are within Very Close range of a creature, all damage {{name}} deals to that creature is doubled.",
      es: "Cuando dos o más adversarios estén dentro del alcance Muy cerca de una criatura, todo el daño que {{name}} inflija a esa criatura se duplica.",
      "pt-br": "Quando dois ou mais adversários estiverem em alcance Muito perto de uma criatura, todo o dano que {{name}} causar a essa criatura é dobrado.",
    },
  ),
  feature(
    "ranged-hit-multiple-targets",
    "Ranged",
    "Reaction",
    {
      en: "Hit Multiple Targets",
      es: "Golpear a varios objetivos",
      "pt-br": "Atingir vários alvos",
    },
    {
      en: "Spend a Fear to make an attack against [number] targets within Far range. Targets {{name}} succeeds against take [reduced damage].",
      es: "Gasta un Miedo para realizar un ataque contra [número] objetivos dentro del alcance Lejos. Los objetivos contra los que {{name}} tenga éxito reciben [daño reducido].",
      "pt-br": "Gaste um Medo para fazer um ataque contra [número] alvos em alcance Longe. Os alvos contra os quais {{name}} tiver sucesso sofrem [dano reduzido].",
    },
  ),
  feature(
    "skulk-ambush",
    "Skulk",
    "Action",
    { en: "Ambush", es: "Emboscada", "pt-br": "Emboscada" },
    {
      en: "While Hidden, make an attack against a target within [Range] range. On a success, deal [increased damage] physical damage.",
      es: "Mientras estés Oculto, realiza un ataque contra un objetivo dentro del alcance [Rango]. Si tienes éxito, inflige [daño aumentado] de daño físico.",
      "pt-br": "Enquanto estiver Escondido, faça um ataque contra um alvo em alcance [Alcance]. Em caso de sucesso, cause [dano aumentado] de dano físico.",
    },
  ),
  feature(
    "skulk-cloaked",
    "Skulk",
    "Action",
    { en: "Cloaked", es: "Camuflado", "pt-br": "Camuflado" },
    {
      en: "Become Hidden until after {{name}}'s next attack. Attacks made while Hidden from this feature have advantage.",
      es: "Queda Oculto hasta después del próximo ataque de {{name}}. Los ataques realizados mientras esté Oculto por este rasgo tienen ventaja.",
      "pt-br": "Fique Escondido até depois do próximo ataque de {{name}}. Ataques feitos enquanto estiver Escondido por esta característica têm vantagem.",
    },
  ),
  feature(
    "solo-relentless",
    "Solo",
    "Passive",
    { en: "Relentless (X)", es: "Implacable (X)", "pt-br": "Implacável (X)" },
    {
      en: "{{name}} can be spotlighted up to two times per GM turn. Spend Fear as usual to spotlight them.",
      es: "{{name}} puede ser puesto en foco hasta dos veces por turno del MJ. Gasta Miedo como de costumbre para ponerlo en foco.",
      "pt-br": "{{name}} pode ser colocado em foco até duas vezes por turno do MJ. Gaste Medo normalmente para colocá-lo em foco.",
    },
  ),
  feature(
    "solo-countdown",
    "Solo",
    "Reaction",
    {
      en: "Countdown to Something Bad",
      es: "Cuenta atrás para algo malo",
      "pt-br": "Contagem regressiva para algo ruim",
    },
    {
      en: "Countdown (Loop 1d6). When [the countdown activation condition], activate the countdown. When it triggers, {{name}} does something powerful ([make an attack or force a Reaction Roll]). All targets that [it succeeds against or that fail] suffer [a negative outcome].",
      es: "Cuenta atrás (Bucle 1d6). Cuando [se cumpla la condición de activación], activa la cuenta atrás. Cuando se dispare, {{name}} hace algo poderoso ([realiza un ataque u obliga a una tirada de Reacción]). Todos los objetivos [contra los que tenga éxito o que fallen] sufren [un resultado negativo].",
      "pt-br": "Contagem regressiva (Ciclo 1d6). Quando [a condição de ativação acontecer], ative a contagem. Quando ela disparar, {{name}} faz algo poderoso ([faz um ataque ou exige um teste de Reação]). Todos os alvos [contra os quais tiver sucesso ou que falharem] sofrem [um resultado negativo].",
    },
  ),
  feature(
    "standard-too-many",
    "Standard",
    "Passive",
    {
      en: "Too Many to Handle",
      es: "Demasiados para manejar",
      "pt-br": "Muitos para lidar",
    },
    {
      en: "When {{name}} is within Melee range of a creature and at least one other {{name}} is within Close range, all attacks against that creature have advantage.",
      es: "Cuando {{name}} esté a alcance Cuerpo a cuerpo de una criatura y al menos otro {{name}} esté dentro del alcance Cerca, todos los ataques contra esa criatura tienen ventaja.",
      "pt-br": "Quando {{name}} estiver em alcance Corpo a corpo de uma criatura e pelo menos outro {{name}} estiver em alcance Perto, todos os ataques contra essa criatura têm vantagem.",
    },
  ),
  feature(
    "standard-pack-tactics",
    "Standard",
    "Passive",
    {
      en: "Pack Tactics",
      es: "Tácticas de manada",
      "pt-br": "Táticas de matilha",
    },
    {
      en: "If {{name}} makes a successful standard attack and another {{name}} is within Melee range of the target, deal [extra damage] physical damage instead of their standard damage and you gain a Fear.",
      es: "Si {{name}} realiza un ataque estándar exitoso y otro {{name}} está a alcance Cuerpo a cuerpo del objetivo, inflige [daño adicional] de daño físico en lugar de su daño estándar y obtienes un Miedo.",
      "pt-br": "Se {{name}} fizer um ataque padrão bem-sucedido e outro {{name}} estiver em alcance Corpo a corpo do alvo, cause [dano adicional] de dano físico em vez do dano padrão e você ganha um Medo.",
    },
  ),
  feature(
    "support-aoe-condition",
    "Support",
    "Action",
    {
      en: "AOE Condition",
      es: "Condición de área",
      "pt-br": "Condição em área",
    },
    {
      en: "Spend a Fear to make an attack against all targets within Very Close range. Targets {{name}} succeeds against become Restrained and Vulnerable [because of something that happened in the fiction]. A target can break free, ending both conditions, with a successful Trait Roll.",
      es: "Gasta un Miedo para realizar un ataque contra todos los objetivos dentro del alcance Muy cerca. Los objetivos contra los que {{name}} tenga éxito quedan Inmovilizados y Vulnerables [por algo que ocurrió en la ficción]. Un objetivo puede liberarse y terminar ambas condiciones con una tirada de Rasgo exitosa.",
      "pt-br": "Gaste um Medo para fazer um ataque contra todos os alvos em alcance Muito perto. Os alvos contra os quais {{name}} tiver sucesso ficam Imobilizados e Vulneráveis [por algo que aconteceu na ficção]. Um alvo pode se libertar e encerrar ambas as condições com um teste de Traço bem-sucedido.",
    },
  ),
  feature(
    "common-armor-shredding",
    "Common",
    "Action",
    {
      en: "Armor-Shredding Move",
      es: "Movimiento desgarrador de armadura",
      "pt-br": "Movimento destruidor de armadura",
    },
    {
      en: "Make a standard attack. On a success, the target must mark an Armor Slot without receiving its benefits (they can still use armor to reduce the damage). If they can't mark an Armor Slot, they must mark an additional HP.",
      es: "Realiza un ataque estándar. Si tienes éxito, el objetivo debe marcar un Espacio de Armadura sin recibir sus beneficios (aún puede usar armadura para reducir el daño). Si no puede marcar un Espacio de Armadura, debe marcar un HP adicional.",
      "pt-br": "Faça um ataque padrão. Em caso de sucesso, o alvo deve marcar um Espaço de Armadura sem receber seus benefícios (ainda pode usar armadura para reduzir o dano). Se não puder marcar um Espaço de Armadura, deve marcar um HP adicional.",
    },
  ),
  feature(
    "common-conditional-extra-damage",
    "Common",
    "Passive",
    {
      en: "Conditional Extra Damage",
      es: "Daño adicional condicional",
      "pt-br": "Dano adicional condicional",
    },
    {
      en: "When {{name}} succeeds on a standard attack [because of a reason or Conditions], they deal [higher damage] physical damage instead of their standard damage.",
      es: "Cuando {{name}} tenga éxito en un ataque estándar [por una razón o Condiciones], inflige [daño mayor] de daño físico en lugar de su daño estándar.",
      "pt-br": "Quando {{name}} tiver sucesso em um ataque padrão [por um motivo ou Condições], causa [dano maior] de dano físico em vez do dano padrão.",
    },
  ),
  feature(
    "common-cause-condition",
    "Common",
    "Action",
    { en: "Cause Condition", es: "Causar condición", "pt-br": "Causar condição" },
    {
      en: "[Do something that would cause a temporary condition]. The target has the [Condition]. Targets with the [Condition] [what the Condition does], [timeframe or means of clearing the Condition].",
      es: "[Haz algo que cause una condición temporal]. El objetivo obtiene la [Condición]. Los objetivos con la [Condición] [efecto de la Condición], [duración o forma de eliminarla].",
      "pt-br": "[Faça algo que cause uma condição temporária]. O alvo recebe a [Condição]. Alvos com a [Condição] [efeito da Condição], [duração ou forma de removê-la].",
    },
  ),
  feature(
    "undead-ghost",
    "Undead",
    "Passive",
    { en: "Ghost", es: "Fantasma", "pt-br": "Fantasma" },
    {
      en: "{{name}} has resistance to physical damage. Mark a Stress to move up to Close range through solid objects.",
      es: "{{name}} tiene resistencia al daño físico. Marca un Estrés para moverse hasta alcance Cerca atravesando objetos sólidos.",
      "pt-br": "{{name}} tem resistência a dano físico. Marque um Estresse para se mover até alcance Perto através de objetos sólidos.",
    },
  ),
  feature(
    "undead-horrifying",
    "Undead",
    "Passive",
    { en: "Horrifying", es: "Horripilante", "pt-br": "Horripilante" },
    {
      en: "Targets who mark HP from {{name}}'s attacks must also mark a Stress.",
      es: "Los objetivos que marquen HP por los ataques de {{name}} también deben marcar un Estrés.",
      "pt-br": "Alvos que marcarem HP devido aos ataques de {{name}} também devem marcar um Estresse.",
    },
  ),
  feature(
    "undead-unsettling",
    "Undead",
    "Passive",
    { en: "Unsettling", es: "Inquietante", "pt-br": "Perturbador" },
    {
      en: "PCs that roll with Fear when attacking {{name}} mark a Stress.",
      es: "Los PJ que tiren con Miedo al atacar a {{name}} marcan un Estrés.",
      "pt-br": "PJs que rolarem com Medo ao atacar {{name}} marcam um Estresse.",
    },
  ),
  feature(
    "flying",
    "Flying",
    "Passive",
    { en: "Flying", es: "Volador", "pt-br": "Voador" },
    {
      en: "While flying, {{name}} gains a +3 bonus to their Difficulty.",
      es: "Mientras vuela, {{name}} obtiene una bonificación de +3 a su Dificultad.",
      "pt-br": "Enquanto estiver voando, {{name}} recebe um bônus de +3 em sua Dificuldade.",
    },
  ),
  feature(
    "soft-bruiser",
    "Soft Moves",
    "Action",
    {
      en: "Bruiser Soft Move",
      es: "Movimiento suave de Bruto",
      "pt-br": "Movimento suave de Bruto",
    },
    {
      en: "{{name}} roars in anger, preparing for its next strike. The next time {{name}} attacks, it gains an additional 1d4 to its attack roll.",
      es: "{{name}} ruge de ira y se prepara para su próximo golpe. La próxima vez que ataque, obtiene 1d4 adicional en su tirada de ataque.",
      "pt-br": "{{name}} ruge de raiva, preparando seu próximo golpe. Na próxima vez que atacar, recebe 1d4 adicional em sua jogada de ataque.",
    },
  ),
  feature(
    "soft-horde",
    "Soft Moves",
    "Action",
    {
      en: "Horde Soft Move",
      es: "Movimiento suave de Horda",
      "pt-br": "Movimento suave de Horda",
    },
    {
      en: "{{name}} rally together, gaining strength. They clear 1 HP or 1 Stress.",
      es: "{{name}} se reagrupa y recupera fuerzas. Elimina 1 HP o 1 Estrés.",
      "pt-br": "{{name}} se reúne e recupera forças. Remove 1 HP ou 1 Estresse.",
    },
  ),
  feature(
    "soft-leader",
    "Soft Moves",
    "Action",
    {
      en: "Leader Soft Move",
      es: "Movimiento suave de Líder",
      "pt-br": "Movimento suave de Líder",
    },
    {
      en: "{{name}} encourages one of their allies, giving them advantage on their next attack roll.",
      es: "{{name}} anima a uno de sus aliados y le da ventaja en su próxima tirada de ataque.",
      "pt-br": "{{name}} encoraja um de seus aliados, concedendo vantagem em sua próxima jogada de ataque.",
    },
  ),
  feature(
    "soft-minion",
    "Soft Moves",
    "Action",
    {
      en: "Minion Soft Move",
      es: "Movimiento suave de Esbirro",
      "pt-br": "Movimento suave de Lacaio",
    },
    {
      en: "{{name}} moves into a better position, surrounding the target.",
      es: "{{name}} se mueve a una mejor posición y rodea al objetivo.",
      "pt-br": "{{name}} se move para uma posição melhor, cercando o alvo.",
    },
  ),
  feature(
    "soft-ranged",
    "Soft Moves",
    "Action",
    {
      en: "Ranged Soft Move",
      es: "Movimiento suave de A distancia",
      "pt-br": "Movimento suave de À distância",
    },
    {
      en: "{{name}} focuses for their next attack, adding +X to the damage of their next attack if it hits.",
      es: "{{name}} se concentra para su próximo ataque y agrega +X al daño si impacta.",
      "pt-br": "{{name}} se concentra para seu próximo ataque, adicionando +X ao dano se acertar.",
    },
  ),
  feature(
    "soft-skulk",
    "Soft Moves",
    "Action",
    {
      en: "Skulk Soft Move",
      es: "Movimiento suave de Acechador",
      "pt-br": "Movimento suave de Espreitador",
    },
    {
      en: "{{name}} retreats to a better position, disengaging from the PCs.",
      es: "{{name}} se retira a una mejor posición y se desengancha de los PJ.",
      "pt-br": "{{name}} recua para uma posição melhor, se afastando dos PJs.",
    },
  ),
  feature(
    "soft-solo",
    "Soft Moves",
    "Action",
    {
      en: "Solo Soft Move",
      es: "Movimiento suave de Solo",
      "pt-br": "Movimento suave de Solo",
    },
    {
      en: "[This depends on the adversary.]",
      es: "[Esto depende del adversario.]",
      "pt-br": "[Isto depende do adversário.]",
    },
  ),
  feature(
    "soft-standard",
    "Soft Moves",
    "Action",
    {
      en: "Standard Soft Move",
      es: "Movimiento suave de Estándar",
      "pt-br": "Movimento suave de Padrão",
    },
    {
      en: "{{name}} braces for the next attack. Their Difficulty increases by 1 until the next GM turn.",
      es: "{{name}} se prepara para el próximo ataque. Su Dificultad aumenta en 1 hasta el siguiente turno del MJ.",
      "pt-br": "{{name}} se prepara para o próximo ataque. Sua Dificuldade aumenta em 1 até o próximo turno do MJ.",
    },
  ),
  feature(
    "soft-support",
    "Soft Moves",
    "Action",
    {
      en: "Support Soft Move",
      es: "Movimiento suave de Apoyo",
      "pt-br": "Movimento suave de Suporte",
    },
    {
      en: "{{name}} clears a condition on themselves or someone else.",
      es: "{{name}} elimina una condición propia o de otra persona.",
      "pt-br": "{{name}} remove uma condição de si ou de outra pessoa.",
    },
  ),
];

/** Adversary recommendations, grouped by role, for the traits editor. */
export const adversaryFeatures: FeatureLibrary = {
  label: commonFeatureLabel,
  choose: chooseFeatureLabel,
  groups: (Object.keys(adversaryFeatureGroupLabels) as AdversaryFeatureGroup[]).map(
    (key) => ({ key, label: adversaryFeatureGroupLabels[key] }),
  ),
  templates: adversaryFeatureLibrary,
};
