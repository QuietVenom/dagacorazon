"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  dataUrlToBlob,
  deleteCanvasImage,
  saveCanvasImage,
} from "@/lib/canvas-image-storage";
import {
  deserializeCanvasSession,
  serializeCanvasSession,
} from "@/lib/canvas-session-transfer";
import { createId } from "@/lib/id";
import { useLocalJSON } from "@/lib/use-local";
import type { CanvasElement } from "@/lib/types";

/** Legacy single-canvas key. Existing data is moved to the first session. */
export const CANVAS_KEY = "dagacorazon.lienzo";
export const CANVAS_SESSIONS_KEY = "dagacorazon.lienzo.sessions";

const PENDING_SESSION_KEY = "dagacorazon.lienzo.session.pending";
const NO_ELEMENTS: CanvasElement[] = [];
const EMPTY_SESSION_STATE: CanvasSessionState = {
  activeSessionId: null,
  sessions: [],
};

type LegacyCanvasElement = Omit<CanvasElement, "kind"> & {
  kind: CanvasElement["kind"] | "map";
};

export interface CanvasSessionSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface CanvasSessionState {
  activeSessionId: string | null;
  sessions: CanvasSessionSummary[];
}

export interface CanvasSessionDownload {
  filename: string;
  contents: string;
}

const sessionKey = (id: string) => `dagacorazon.lienzo.session.${id}`;

function normalizeElements(elements: LegacyCanvasElement[]): CanvasElement[] {
  return elements.map((element) =>
    element.kind === "map"
      ? { ...element, kind: "image" as const }
      : (element as CanvasElement),
  );
}

function readSessionElements(id: string): CanvasElement[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(sessionKey(id)) ?? "[]");
    return Array.isArray(parsed)
      ? normalizeElements(parsed as LegacyCanvasElement[])
      : [];
  } catch {
    return [];
  }
}

function downloadFilename(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "sesion"}.dagacorazon.json`;
}

export function useCanvas() {
  const [sessionState, setSessionState] = useLocalJSON<CanvasSessionState>(
    CANVAS_SESSIONS_KEY,
    EMPTY_SESSION_STATE,
  );
  const initializationStarted = useRef(false);
  const migrationRunning = useRef(false);

  const activeSession =
    sessionState.sessions.find(
      (session) => session.id === sessionState.activeSessionId,
    ) ?? sessionState.sessions[0];
  const activeSessionId = activeSession?.id ?? null;

  const [storedElements, setStoredElements] = useLocalJSON<
    LegacyCanvasElement[]
  >(activeSessionId ? sessionKey(activeSessionId) : PENDING_SESSION_KEY, NO_ELEMENTS);

  useEffect(() => {
    if (sessionState.sessions.length > 0 || initializationStarted.current) return;
    initializationStarted.current = true;

    const id = createId();
    const key = sessionKey(id);
    const now = new Date().toISOString();
    const legacy = localStorage.getItem(CANVAS_KEY);

    try {
      if (legacy !== null) localStorage.removeItem(CANVAS_KEY);
      localStorage.setItem(key, legacy ?? "[]");
      setSessionState({
        activeSessionId: id,
        sessions: [
          {
            id,
            name: "Sesión principal",
            createdAt: now,
            updatedAt: now,
          },
        ],
      });
    } catch (error) {
      localStorage.removeItem(key);
      if (legacy !== null) localStorage.setItem(CANVAS_KEY, legacy);
      initializationStarted.current = false;
      throw error;
    }
  }, [sessionState.sessions.length, setSessionState]);

  useEffect(() => {
    if (
      activeSessionId &&
      activeSessionId !== sessionState.activeSessionId
    ) {
      setSessionState((previous) => ({
        ...previous,
        activeSessionId,
      }));
    }
  }, [activeSessionId, sessionState.activeSessionId, setSessionState]);

  const elements = useMemo(
    () => normalizeElements(storedElements),
    [storedElements],
  );

  useEffect(() => {
    if (!storedElements.some((element) => element.kind === "map")) return;
    setStoredElements((previous) =>
      previous.map((element) =>
        element.kind === "map"
          ? { ...element, kind: "image" as const }
          : element,
      ),
    );
  }, [setStoredElements, storedElements]);

  const touchActiveSession = useCallback(() => {
    if (!activeSessionId) return;
    const now = new Date().toISOString();
    setSessionState((previous) => ({
      ...previous,
      sessions: previous.sessions.map((session) =>
        session.id === activeSessionId
          ? { ...session, updatedAt: now }
          : session,
      ),
    }));
  }, [activeSessionId, setSessionState]);

  const setElements = useCallback(
    (
      value:
        | CanvasElement[]
        | ((previous: CanvasElement[]) => CanvasElement[]),
    ) => {
      if (!activeSessionId) return NO_ELEMENTS;

      let removedImages: string[] = [];
      const next = setStoredElements((previous) => {
        const normalizedPrevious = normalizeElements(previous);
        const resolved =
          typeof value === "function" ? value(normalizedPrevious) : value;
        const retainedImages = new Set(
          resolved.flatMap((element) =>
            element.imageId ? [element.imageId] : [],
          ),
        );
        removedImages = normalizedPrevious.flatMap((element) =>
          element.imageId && !retainedImages.has(element.imageId)
            ? [element.imageId]
            : [],
        );

        return resolved;
      });

      removedImages.forEach((imageId) => {
        void deleteCanvasImage(imageId);
      });
      touchActiveSession();
      return next;
    },
    [activeSessionId, setStoredElements, touchActiveSession],
  );

  useEffect(() => {
    const legacyImages = storedElements.filter(
      (element) => element.image?.startsWith("data:") && !element.imageId,
    );
    if (legacyImages.length === 0 || migrationRunning.current) return;

    migrationRunning.current = true;
    void Promise.allSettled(
      legacyImages.map(async (element) => {
        const imageId = createId();
        await saveCanvasImage(imageId, await dataUrlToBlob(element.image!));
        return [element.id, imageId] as const;
      }),
    )
      .then((results) => {
        const migrations = results.flatMap((result) =>
          result.status === "fulfilled" ? [result.value] : [],
        );
        if (migrations.length === 0) return;

        const imageIds = new Map<string, string>(migrations);
        try {
          setStoredElements((previous) =>
            previous.map((element) => {
              const imageId = imageIds.get(element.id);
              if (!imageId) return element;
              const migrated = { ...element, imageId };
              delete migrated.image;
              return migrated;
            }),
          );
        } catch {
          migrations.forEach(([, imageId]) => {
            void deleteCanvasImage(imageId);
          });
        }
      })
      .finally(() => {
        migrationRunning.current = false;
      });
  }, [setStoredElements, storedElements]);

  const addElement = useCallback(
    (element: Omit<CanvasElement, "id">): string => {
      const id = createId();
      setElements((previous) => [...previous, { ...element, id }]);
      return id;
    },
    [setElements],
  );

  const selectSession = useCallback(
    (id: string) => {
      if (!sessionState.sessions.some((session) => session.id === id)) return;
      setSessionState((previous) => ({ ...previous, activeSessionId: id }));
    },
    [sessionState.sessions, setSessionState],
  );

  const createSession = useCallback(
    (name: string) => {
      const id = createId();
      const now = new Date().toISOString();
      const summary: CanvasSessionSummary = {
        id,
        name: name.trim() || "Nueva sesión",
        createdAt: now,
        updatedAt: now,
      };

      localStorage.setItem(sessionKey(id), "[]");
      try {
        setSessionState((previous) => ({
          activeSessionId: id,
          sessions: [...previous.sessions, summary],
        }));
      } catch (error) {
        localStorage.removeItem(sessionKey(id));
        throw error;
      }
      return id;
    },
    [setSessionState],
  );

  const renameSession = useCallback(
    (id: string, name: string) => {
      const nextName = name.trim();
      if (!nextName) throw new Error("invalid-session-name");
      if (!sessionState.sessions.some((session) => session.id === id)) {
        throw new Error("session-not-found");
      }

      const now = new Date().toISOString();
      setSessionState((previous) => ({
        ...previous,
        sessions: previous.sessions.map((session) =>
          session.id === id
            ? { ...session, name: nextName, updatedAt: now }
            : session,
        ),
      }));
    },
    [sessionState.sessions, setSessionState],
  );

  const deleteSession = useCallback(
    async (id: string) => {
      if (sessionState.sessions.length <= 1) {
        throw new Error("last-session");
      }
      if (!sessionState.sessions.some((session) => session.id === id)) {
        throw new Error("session-not-found");
      }

      const deletedElements = readSessionElements(id);
      const remainingSessions = sessionState.sessions.filter(
        (session) => session.id !== id,
      );
      const nextActiveSessionId =
        sessionState.activeSessionId === id
          ? (remainingSessions[0]?.id ?? null)
          : sessionState.activeSessionId;

      setSessionState({
        activeSessionId: nextActiveSessionId,
        sessions: remainingSessions,
      });
      localStorage.removeItem(sessionKey(id));

      const retainedImageIds = new Set(
        remainingSessions.flatMap((session) =>
          readSessionElements(session.id).flatMap((element) =>
            element.imageId ? [element.imageId] : [],
          ),
        ),
      );
      await Promise.allSettled(
        deletedElements.flatMap((element) =>
          element.imageId && !retainedImageIds.has(element.imageId)
            ? [deleteCanvasImage(element.imageId)]
            : [],
        ),
      );
    },
    [sessionState, setSessionState],
  );

  const exportSession = useCallback(
    async (id: string): Promise<CanvasSessionDownload> => {
      const session = sessionState.sessions.find((item) => item.id === id);
      if (!session) throw new Error("session-not-found");

      const payload = await serializeCanvasSession(
        session.name,
        readSessionElements(id),
      );
      return {
        filename: downloadFilename(session.name),
        contents: JSON.stringify(payload, null, 2),
      };
    },
    [sessionState.sessions],
  );

  const importSession = useCallback(
    async (source: string) => {
      const imported = await deserializeCanvasSession(source);
      const id = createId();
      const now = new Date().toISOString();
      const key = sessionKey(id);

      try {
        localStorage.setItem(key, JSON.stringify(imported.elements));
        setSessionState((previous) => ({
          activeSessionId: id,
          sessions: [
            ...previous.sessions,
            {
              id,
              name: imported.name,
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
      } catch (error) {
        localStorage.removeItem(key);
        await Promise.allSettled(
          imported.elements.flatMap((element) =>
            element.imageId ? [deleteCanvasImage(element.imageId)] : [],
          ),
        );
        throw error;
      }
      return id;
    },
    [setSessionState],
  );

  return {
    elements,
    setElements,
    addElement,
    sessions: sessionState.sessions,
    activeSession,
    activeSessionId,
    selectSession,
    createSession,
    renameSession,
    deleteSession,
    exportSession,
    importSession,
  };
}
