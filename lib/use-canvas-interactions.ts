"use client";

import { useCallback, type RefObject } from "react";
import type { CanvasPoint } from "@/lib/canvas-range";
import { CANVAS_GRID_SIZE } from "@/lib/canvas-range";

export type View = { x: number; y: number; scale: number };
export type ResizePreview = { id: string; width: number };
export type DragState =
  | { mode: "pan"; startX: number; startY: number; view: View }
  | { mode: "token"; id: string; startX: number; startY: number }
  | { mode: "ruler"; start: CanvasPoint }
  | {
      mode: "resize-image";
      id: string;
      startX: number;
      startWidth: number;
    }
  | null;

export function useCanvasInteractions({
  dragRef,
  setDragOffset,
  setResizePreview,
  stageRef,
  view,
}: {
  dragRef: RefObject<DragState>;
  setDragOffset: (value: { id: string; dx: number; dy: number } | null) => void;
  setResizePreview: (value: ResizePreview | null) => void;
  stageRef: RefObject<HTMLDivElement | null>;
  view: View;
}) {
  const resetCanvasInteraction = useCallback(() => {
    setDragOffset(null);
    setResizePreview(null);
    dragRef.current = null;
  }, [dragRef, setDragOffset, setResizePreview]);

  const stageCenter = useCallback(() => {
    const rect = stageRef.current?.getBoundingClientRect();
    return {
      x: ((rect?.width ?? 800) / 2 - view.x) / view.scale,
      y: ((rect?.height ?? 600) / 2 - view.y) / view.scale,
    };
  }, [stageRef, view]);

  const pointerToCanvasPoint = useCallback(
    (clientX: number, clientY: number): CanvasPoint => {
      const rect = stageRef.current?.getBoundingClientRect();
      const x = (clientX - (rect?.left ?? 0) - view.x) / view.scale;
      const y = (clientY - (rect?.top ?? 0) - view.y) / view.scale;
      return {
        x: Math.round(x / CANVAS_GRID_SIZE) * CANVAS_GRID_SIZE,
        y: Math.round(y / CANVAS_GRID_SIZE) * CANVAS_GRID_SIZE,
      };
    },
    [stageRef, view],
  );

  return { pointerToCanvasPoint, resetCanvasInteraction, stageCenter };
}
