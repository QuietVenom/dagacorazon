export type Language = "es" | "pt";

/** Bilingual UI text: every user-facing string travels as this pair. */
export type LocalizedText = { es: string; pt: string };

export const DEFAULT_LANGUAGE: Language = "es";
export const LANGUAGE_COOKIE_KEY = "dagacorazon.lang";
export const LEGACY_LANGUAGE_STORAGE_KEY = "dagacorazon.idioma";

export const languages = ["es", "pt"] as const satisfies readonly Language[];

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && languages.includes(value as Language);
}

export const htmlLang = (language: Language) =>
  language === "pt" ? "pt-BR" : "es-419";

export const t = (text: LocalizedText, language: Language) => text[language];

/** Shared UI dictionary (navigation, actions, empty states). */
export const ui = {
  home: { es: "Inicio", pt: "Início" },
  workshop: { es: "Taller", pt: "Oficina" },
  table: { es: "Mesa", pt: "Mesa" },
  community: { es: "Comunidad", pt: "Comunidade" },
  signIn: { es: "Entrar", pt: "Entrar" },
  save: { es: "Guardar", pt: "Salvar" },
  exportJson: { es: "Exportar JSON", pt: "Exportar JSON" },
  add: { es: "Agregar", pt: "Adicionar" },
  remove: { es: "Eliminar", pt: "Excluir" },
  preview: { es: "Vista previa", pt: "Pré-visualização" },
  noItems: { es: "Aún no hay elementos", pt: "Ainda não há itens" },
  comingSoon: { es: "Próximamente", pt: "Em breve" },
  traits: { es: "Rasgos", pt: "Características" },
  traitName: { es: "Nombre del rasgo", pt: "Nome da característica" },
  traitDesc: {
    es: "Descripción del rasgo…",
    pt: "Descrição da característica…",
  },
  rollDice: { es: "Tirar dados", pt: "Rolar dados" },
  about: { es: "Acerca de", pt: "Sobre" },
  aboutTitle: { es: "Acerca de Dagacorazón", pt: "Sobre o Dagacorazón" },
  srdSectionTitle: { es: "Aviso legal", pt: "Aviso legal" },
  srdCopyrightTitle: { es: "Derechos de autor", pt: "Direitos autorais" },
  srdCopyrightBody: {
    es: "Este sitio incluye materiales del Daggerheart System Reference Document 1.0, © Critical Role, LLC. Todos los derechos reservados.",
    pt: "Este site inclui materiais do Daggerheart System Reference Document 1.0, © Critical Role, LLC. Todos os direitos reservados.",
  },
  srdAttributionTitle: { es: "Atribución", pt: "Atribuição" },
  srdAttributionBody: {
    es: "Contenido público del juego creado y propiedad de Darrington Press, LLC. Disponible en",
    pt: "Conteúdo público do jogo criado e de propriedade da Darrington Press, LLC. Disponível em",
  },
  srdLicenseTitle: { es: "Licencia", pt: "Licença" },
  srdLicenseBody: {
    es: "Licenciado bajo la Darrington Press Community Gaming License:",
    pt: "Licenciado sob a Darrington Press Community Gaming License:",
  },
  srdModificationsTitle: { es: "Modificaciones", pt: "Modificações" },
  srdModificationsBody: {
    es: "Los bloques de estadísticas pueden tener ediciones menores para corregir errores evidentes.",
    pt: "Os blocos de estatísticas podem ter edições menores para corrigir erros óbvios.",
  },
  projectSectionTitle: { es: "El proyecto", pt: "O projeto" },
  projectDescription: {
    es: "Dagacorazón es una herramienta de juego y creación de homebrew para Daggerheart, enfocada en la comunidad hispanohablante y lusohablante de LATAM. Permite crear, compartir y usar adversarios, colosos, entornos y equipamiento directamente en la mesa de juego.",
    pt: "O Dagacorazón é uma ferramenta de jogo e criação de homebrew para Daggerheart, voltada para as comunidades hispano e lusófonas da LATAM. Permite criar, compartilhar e usar adversários, colossos, ambientes e equipamentos diretamente na mesa de jogo.",
  },
  techTitle: { es: "Tecnología", pt: "Tecnologia" },
  techBody: {
    es: "Construido con Next.js, TypeScript, Tailwind CSS y Cannon.js para la física de dados. Autenticación vía Auth.js.",
    pt: "Construído com Next.js, TypeScript, Tailwind CSS e Cannon.js para a física dos dados. Autenticação via Auth.js.",
  },
  creatorTitle: { es: "Creador", pt: "Criador" },
  creatorBody: {
    es: "Hecho por Izcoatl Avila Marcos. Para cualquier duda o contacto:",
    pt: "Feito por Izcoatl Avila Marcos. Para dúvidas ou contato:",
  },
  duality: { es: "Dualidad", pt: "Dualidade" },
  hope: { es: "Esperanza", pt: "Esperança" },
  fear: { es: "Miedo", pt: "Medo" },
  critical: { es: "¡Crítico!", pt: "Crítico!" },
  withHope: { es: "con Esperanza", pt: "com Esperança" },
  withFear: { es: "con Miedo", pt: "com Medo" },
} satisfies Record<string, LocalizedText>;
