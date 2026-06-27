"use client";

import { useCallback } from "react";
import { createId } from "@/lib/id";
import { useLocalJSON } from "@/lib/use-local";
import type { BrewType, Trait, TrackerConfig, SavedSegment } from "@/lib/types";
import type { ResourceLanguage } from "@/lib/resource-types";

/**
 * Local brew storage (localStorage).
 *
 * Temporary bridge to MongoDB: same data shape the collections will use,
 * but kept in the browser. Once the database is connected this hook gets
 * replaced by server actions without touching the UI.
 */

export type { BrewType, SavedSegment };

export interface SavedBrew {
  id: string;
  type: BrewType;
  /** Form values, indexed by creator-schema field key. */
  data: Record<string, string>;
  traits: Trait[];
  segments: SavedSegment[];
  /** Which trackers the statblock shows. */
  trackers: TrackerConfig;
  /** Language the content is written in. Optional for brews saved before this field existed. */
  language?: ResourceLanguage;
  savedAt: string;
}

const STORAGE_KEY = "dagacorazon.brews";
const NO_BREWS: SavedBrew[] = [];

export function useBrews() {
  const [brews, setBrews] = useLocalJSON<SavedBrew[]>(STORAGE_KEY, NO_BREWS);

  const save = useCallback(
    (brew: Omit<SavedBrew, "id" | "savedAt"> & { id?: string }): SavedBrew => {
      const complete: SavedBrew = {
        ...brew,
        id: brew.id ?? createId(),
        savedAt: new Date().toISOString(),
      };
      setBrews((prev) => {
        const index = prev.findIndex((b) => b.id === complete.id);
        if (index < 0) return [...prev, complete];
        return prev.map((b, i) => (i === index ? complete : b));
      });
      return complete;
    },
    [setBrews],
  );

  const remove = useCallback(
    (id: string) => setBrews((prev) => prev.filter((b) => b.id !== id)),
    [setBrews],
  );

  return { brews, save, remove };
}
