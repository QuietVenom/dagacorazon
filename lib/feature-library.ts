import type { ResourceLanguage } from "@/lib/resource-types";
import type { Trait } from "@/lib/types";
import type { FeatureType } from "@/lib/feature-types";

/** A localized string in every content language. */
export type ContentText = Record<ResourceLanguage, string>;

/** A single pickable feature recommendation. */
export interface FeatureTemplate {
  id: string;
  /** Bucket the template is shown under (role, feature type, …). */
  group: string;
  type: FeatureType;
  title: ContentText;
  description: ContentText;
}

/**
 * A set of recommendations offered by a creator's traits editor: a heading,
 * the placeholder option, the groups in display order, and the templates.
 */
export interface FeatureLibrary {
  /** Heading shown above the recommendation select. */
  label: ContentText;
  /** Placeholder option text. */
  choose: ContentText;
  /** Group keys with their labels, in display order. */
  groups: { key: string; label: ContentText }[];
  templates: FeatureTemplate[];
}

const placeholders: Record<
  ResourceLanguage,
  { name: string; damage: string; standardDamage: string }
> = {
  en: { name: "<name>", damage: "<damage>", standardDamage: "<standard damage>" },
  es: { name: "<nombre>", damage: "<daño>", standardDamage: "<daño estándar>" },
  "pt-br": { name: "<nome>", damage: "<dano>", standardDamage: "<dano padrão>" },
};

/** Replace `{{name}}`/`{{damage}}`/`{{standardDamage}}` with localized hints. */
export function withFeaturePlaceholders(value: string, language: ResourceLanguage): string {
  const p = placeholders[language];
  return value
    .replaceAll("{{name}}", p.name)
    .replaceAll("{{damage}}", p.damage)
    .replaceAll("{{standardDamage}}", p.standardDamage);
}

/** Localized title of a template (with placeholders resolved). */
export function featureTitle(template: FeatureTemplate, language: ResourceLanguage): string {
  return withFeaturePlaceholders(template.title[language], language);
}

/** Build an editable trait from a template in the given content language. */
export function instantiateFeature(
  template: FeatureTemplate,
  language: ResourceLanguage,
): Trait {
  return {
    name: withFeaturePlaceholders(template.title[language], language),
    type: template.type,
    description: withFeaturePlaceholders(template.description[language], language),
    libraryId: template.id,
  };
}
