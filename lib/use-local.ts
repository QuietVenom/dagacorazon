"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * React state backed by localStorage via useSyncExternalStore:
 * no hydration mismatches (the server sees the fallback value and the
 * client corrects itself) and reactive across components sharing a key.
 */

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();
// Cached snapshot per key: getSnapshot must return stable references.
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  const previous = cache.get(key);
  if (previous && previous.raw === raw) return previous.value as T;
  let value: T;
  try {
    value = raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    value = fallback;
  }
  cache.set(key, { raw, value });
  return value;
}

export function useLocalJSON<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    useCallback(
      (onChange: Listener) => {
        let set = listeners.get(key);
        if (!set) listeners.set(key, (set = new Set()));
        set.add(onChange);
        return () => set.delete(onChange);
      },
      [key],
    ),
    () => read(key, fallback),
    () => fallback,
  );

  const setValue = useCallback(
    (v: T | ((previous: T) => T)) => {
      const next =
        typeof v === "function" ? (v as (previous: T) => T)(read(key, fallback)) : v;
      localStorage.setItem(key, JSON.stringify(next));
      listeners.get(key)?.forEach((onChange) => onChange());
      return next;
    },
    // fallback is only a read-time default; assumed stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, setValue] as const;
}
