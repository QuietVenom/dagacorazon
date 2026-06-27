import type { BrewType, SavedBrew } from "@/lib/storage";

/** Language a source document is written in (independent of the UI language). */
export type ResourceLanguage = "en" | "es" | "pt-br";

export const RESOURCE_LANGUAGES = ["en", "es", "pt-br"] as const satisfies readonly ResourceLanguage[];
export const BREW_TYPES = [
  "adversary",
  "colossus",
  "environment",
  "equipment",
] as const satisfies readonly BrewType[];

export interface Resource extends Omit<SavedBrew, "id" | "savedAt"> {
  language: ResourceLanguage;
  source: string;
}

export interface ResourcesResponse {
  type: BrewType;
  requestedLanguage: ResourceLanguage;
  selectedLanguage: ResourceLanguage;
  availableLanguages: ResourceLanguage[];
  resources: Resource[];
}

export function isResourceLanguage(value: unknown): value is ResourceLanguage {
  return (
    typeof value === "string" &&
    RESOURCE_LANGUAGES.includes(value as ResourceLanguage)
  );
}

export function isBrewType(value: unknown): value is BrewType {
  return typeof value === "string" && BREW_TYPES.includes(value as BrewType);
}
