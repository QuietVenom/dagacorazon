"use client";

import { useEffect, useState } from "react";
import type { BrewType } from "@/lib/storage";
import type {
  ResourceLanguage,
  ResourcesResponse,
} from "@/lib/resource-types";

const resourceCache = new Map<string, ResourcesResponse>();

interface ResourceState {
  key: string;
  data?: ResourcesResponse;
  error?: Error;
}

export function useResources(type: BrewType, language: ResourceLanguage) {
  const key = `${type}:${language}`;
  const cached = resourceCache.get(key);
  const [state, setState] = useState<ResourceState>(() => ({
    key,
    data: cached,
  }));
  const data = cached ?? (state.key === key ? state.data : undefined);
  const error = state.key === key ? state.error : undefined;

  useEffect(() => {
    if (resourceCache.has(key)) return;

    const controller = new AbortController();

    void fetch(`/api/resources/${type}/${language}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`resources-${response.status}`);
        }
        return (await response.json()) as ResourcesResponse;
      })
      .then((data) => {
        resourceCache.set(key, data);
        setState({ key, data });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({
          key,
          error: error instanceof Error ? error : new Error("resources-error"),
        });
      });

    return () => controller.abort();
  }, [key, language, type]);

  return {
    resources: data?.resources ?? [],
    availableLanguages: data?.availableLanguages ?? [],
    selectedLanguage: data?.selectedLanguage ?? language,
    isLoading: !data && !error,
    error,
  };
}
