import type { LocalizedText } from "@/lib/i18n";
import type { ResourceLanguage } from "@/lib/resource-types";
import { normalizeGlossaryValue } from "@/lib/adversary-attack";

export const FEATURE_TYPES = ["Passive", "Action", "Reaction"] as const;
export type FeatureType = (typeof FEATURE_TYPES)[number];

export const featureTypeOptions: { value: FeatureType; label: LocalizedText }[] = [
  { value: "Passive", label: { es: "Pasiva", pt: "Passiva" } },
  { value: "Action", label: { es: "Acción", pt: "Ação" } },
  { value: "Reaction", label: { es: "Reacción", pt: "Reação" } },
];

const contentLabels: Record<ResourceLanguage, Record<FeatureType, string>> = {
  en: { Passive: "Passive", Action: "Action", Reaction: "Reaction" },
  es: { Passive: "Pasiva", Action: "Acción", Reaction: "Reacción" },
  "pt-br": { Passive: "Passiva", Action: "Ação", Reaction: "Reação" },
};

const localizedFeatureTypes: Record<FeatureType, string[]> = {
  Passive: ["Pasiva", "Passiva"],
  Action: ["Acción", "Accion", "Ação", "Acao"],
  Reaction: ["Reacción", "Reaccion", "Reação", "Reacao"],
};

export function normalizeFeatureType(type: string): string {
  return normalizeGlossaryValue(type, localizedFeatureTypes);
}

export function featureTypeLabel(type: string, language: ResourceLanguage): string {
  return contentLabels[language][type as FeatureType] ?? type;
}
