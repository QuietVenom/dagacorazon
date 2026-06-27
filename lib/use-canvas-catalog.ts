"use client";

import { useCallback, useMemo } from "react";
import { equipmentCategoryGroups } from "@/lib/creators";
import type { Language } from "@/lib/i18n";
import type { ResourceLanguage } from "@/lib/resource-types";
import { useBrews, type SavedBrew } from "@/lib/storage";
import { useResources } from "@/lib/use-resources";

export function useCanvasCatalog({
  language,
  equipCategory,
}: {
  language: Language;
  equipCategory: string;
}) {
  const { brews: allBrews } = useBrews();
  const preferredLanguage: ResourceLanguage = language === "pt" ? "pt-br" : "es";
  const officialAdversaries = useResources("adversary", preferredLanguage).resources;
  const officialColossi = useResources("colossus", preferredLanguage).resources;
  const officialEnvironments = useResources("environment", preferredLanguage).resources;
  const officialEquipment = useResources("equipment", preferredLanguage).resources;

  const adversaryBrews = useMemo(
    () => allBrews.filter((brew) => brew.type === "adversary"),
    [allBrews],
  );
  const colossusBrews = useMemo(
    () => allBrews.filter((brew) => brew.type === "colossus"),
    [allBrews],
  );
  const environmentBrews = useMemo(
    () => allBrews.filter((brew) => brew.type === "environment"),
    [allBrews],
  );
  const equipmentBrews = useMemo(
    () => allBrews.filter((brew) => brew.type === "equipment"),
    [allBrews],
  );

  const sortedByName = useCallback(
    (list: SavedBrew[]) =>
      [...list].sort((a, b) =>
        (a.data.name || a.type).localeCompare(b.data.name || b.type, language),
      ),
    [language],
  );

  const filteredOfficialEquipment = useMemo(() => {
    if (!equipCategory) return officialEquipment;
    const values = equipmentCategoryGroups.find((group) => group.id === equipCategory)?.values ?? [];
    return officialEquipment.filter((resource) => values.includes(resource.data.category));
  }, [equipCategory, officialEquipment]);

  return {
    adversaryBrews,
    colossusBrews,
    environmentBrews,
    equipmentBrews,
    filteredOfficialEquipment,
    officialAdversaries,
    officialColossi,
    officialEnvironments,
    officialEquipment,
    workshopBrews: sortedByName(adversaryBrews),
    workshopColossi: sortedByName(colossusBrews),
    workshopEnvironments: sortedByName(environmentBrews),
    workshopEquipment: sortedByName(equipmentBrews),
  };
}
