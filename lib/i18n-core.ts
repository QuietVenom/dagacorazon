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
  duality: { es: "Dualidad", pt: "Dualidade" },
  hope: { es: "Esperanza", pt: "Esperança" },
  fear: { es: "Miedo", pt: "Medo" },
  critical: { es: "¡Crítico!", pt: "Crítico!" },
  withHope: { es: "con Esperanza", pt: "com Esperança" },
  withFear: { es: "con Miedo", pt: "com Medo" },
} satisfies Record<string, LocalizedText>;
