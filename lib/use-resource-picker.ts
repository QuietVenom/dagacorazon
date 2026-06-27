"use client";

import { useCallback, useMemo, useState } from "react";
import type { CreatorField, CreatorSchema } from "@/lib/creators";
import type { ResourceLanguage } from "@/lib/resource-types";
import type { Language } from "@/lib/i18n";
import { useResources } from "@/lib/use-resources";

function sortFacetValues(values: string[]) {
  values.sort((a, b) => {
    const na = Number(a);
    const nb = Number(b);
    return !isNaN(na) && !isNaN(nb) ? na - nb : a.localeCompare(b);
  });
  return values;
}

export function useResourcePicker({
  schema,
  language,
  normalizeData,
  activeTabValues,
  groupField,
}: {
  schema: CreatorSchema;
  language: Language;
  normalizeData: (value: Record<string, string>) => Record<string, string>;
  activeTabValues: string[];
  groupField: string;
}) {
  const [selectedResource, setSelectedResource] = useState("");
  const [facets, setFacets] = useState<Record<string, string>>({});
  const [pickedLanguage, setPickedLanguage] = useState<ResourceLanguage | null>(null);
  const preferredLanguage: ResourceLanguage = language === "pt" ? "pt-br" : "es";
  const requestedLanguage = pickedLanguage ?? preferredLanguage;
  const {
    resources: rawResources,
    availableLanguages: resourceLanguages,
    selectedLanguage: resourceLanguage,
    isLoading,
    error,
  } = useResources(schema.id, requestedLanguage);

  const resources = useMemo(
    () => rawResources.map((resource) => ({ ...resource, data: normalizeData(resource.data) })),
    [normalizeData, rawResources],
  );

  const inActiveTab = useCallback(
    (row: Record<string, string>) =>
      activeTabValues.length === 0 || activeTabValues.includes(row[groupField] ?? ""),
    [activeTabValues, groupField],
  );

  const facetFields = useMemo(
    () =>
      schema.fields.filter((field: CreatorField) => {
        if (!field.filterable) return false;
        if (groupField && field.key === groupField) return false;
        if (field.categories && field.categories.length > 0) {
          return (
            activeTabValues.length === 0 ||
            field.categories.some((category) => activeTabValues.includes(category))
          );
        }
        return true;
      }),
    [activeTabValues, groupField, schema.fields],
  );

  const visibleResources = useMemo(
    () => resources.filter((resource) => inActiveTab(resource.data)),
    [inActiveTab, resources],
  );

  const facetOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const field of facetFields) {
      map[field.key] = sortFacetValues([
        ...new Set(visibleResources.map((resource) => resource.data[field.key]).filter(Boolean)),
      ]);
    }
    return map;
  }, [facetFields, visibleResources]);

  const filteredResources = useMemo(
    () =>
      visibleResources.filter((resource) =>
        facetFields.every((field) => !facets[field.key] || resource.data[field.key] === facets[field.key]),
      ),
    [facetFields, facets, visibleResources],
  );

  const resetResourceSelection = useCallback(() => {
    setSelectedResource("");
    setFacets({});
  }, []);

  return {
    error,
    facetFields,
    facetOptions,
    facets,
    filteredResources,
    hasResourcePicker: isLoading || resourceLanguages.length > 0 || resources.length > 0,
    inActiveTab,
    isLoading,
    preferredLanguage,
    resourceLanguage,
    resourceLanguages,
    selectedResource,
    setFacets,
    setPickedLanguage,
    setSelectedResource,
    resetResourceSelection,
  };
}
