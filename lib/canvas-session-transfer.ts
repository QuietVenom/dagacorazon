"use client";

import {
  blobToDataUrl,
  dataUrlToBlob,
  deleteCanvasImage,
  readCanvasImage,
  saveCanvasImage,
} from "@/lib/canvas-image-storage";
import { createId } from "@/lib/id";
import type { CanvasElement } from "@/lib/types";

export const FORMAT = "dagacorazon-lienzo";
const VERSION = 1;
const ELEMENT_KINDS = new Set([
  "pc-token",
  "adversary-token",
  "image",
  "counter",
  "note",
  "statblock",
  "map",
]);

type RecordValue = Record<string, unknown>;

export interface CanvasSessionExport {
  format: typeof FORMAT;
  version: typeof VERSION;
  exportedAt: string;
  session: {
    name: string;
    elements: CanvasElement[];
  };
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeElement(value: unknown): CanvasElement {
  if (!isRecord(value)) throw new Error("invalid-element");
  if (typeof value.kind !== "string" || !ELEMENT_KINDS.has(value.kind)) {
    throw new Error("invalid-element-kind");
  }
  if (!Number.isFinite(value.x) || !Number.isFinite(value.y)) {
    throw new Error("invalid-element-position");
  }

  const sanitized = { ...value };
  delete sanitized.imageId;
  delete sanitized.id;
  delete sanitized.kind;
  delete sanitized.name;
  delete sanitized.image;

  return {
    ...sanitized,
    id: createId(),
    kind:
      value.kind === "map"
        ? "image"
        : (value.kind as CanvasElement["kind"]),
    name: typeof value.name === "string" ? value.name : "",
    x: value.x as number,
    y: value.y as number,
    image: typeof value.image === "string" ? value.image : undefined,
  } as CanvasElement;
}

export async function serializeCanvasSession(
  name: string,
  elements: CanvasElement[],
): Promise<CanvasSessionExport> {
  const portableElements = await Promise.all(
    elements.map(async (element) => {
      if (!element.imageId) return element;

      const image = await readCanvasImage(element.imageId);
      if (!image) throw new Error("missing-image");

      const portable = {
        ...element,
        image: await blobToDataUrl(image),
      };
      delete portable.imageId;
      return portable;
    }),
  );

  return {
    format: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    session: { name, elements: portableElements },
  };
}

export async function deserializeCanvasSession(
  source: string,
): Promise<{ name: string; elements: CanvasElement[] }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    throw new Error("invalid-json");
  }

  if (
    !isRecord(parsed) ||
    parsed.format !== FORMAT ||
    parsed.version !== VERSION ||
    !isRecord(parsed.session) ||
    !Array.isArray(parsed.session.elements)
  ) {
    throw new Error("invalid-format");
  }

  const elements = parsed.session.elements.map(normalizeElement);
  const savedImageIds: string[] = [];

  try {
    const importedElements: CanvasElement[] = [];
    for (const element of elements) {
      if (!element.image?.startsWith("data:image/")) {
        const withoutInvalidImage = { ...element };
        delete withoutInvalidImage.image;
        importedElements.push(withoutInvalidImage);
        continue;
      }

      const imageId = createId();
      await saveCanvasImage(imageId, await dataUrlToBlob(element.image));
      savedImageIds.push(imageId);

      const imported = { ...element, imageId };
      delete imported.image;
      importedElements.push(imported);
    }

    const rawName = parsed.session.name;
    return {
      name:
        typeof rawName === "string" && rawName.trim()
          ? rawName.trim()
          : "Sesión importada",
      elements: importedElements,
    };
  } catch (error) {
    await Promise.allSettled(savedImageIds.map(deleteCanvasImage));
    throw error;
  }
}
