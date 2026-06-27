"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ImgHTMLAttributes,
} from "react";
import { createId } from "@/lib/id";
import { t, ui, useLanguage } from "@/lib/i18n";
import type { SavedBrew } from "@/lib/storage";
import { useCanvas } from "@/lib/canvas";
import {
  deleteCanvasImage,
  readCanvasImage,
  requestPersistentCanvasStorage,
  saveCanvasImage,
} from "@/lib/canvas-image-storage";
import { schemas, equipmentCategoryGroups } from "@/lib/creators";
import { useCanvasCatalog } from "@/lib/use-canvas-catalog";
import {
  emptyTrackerState,
  type BrewType,
  type CanvasElement,
  type StatblockSnapshot,
  type TrackerConfig,
  type TrackerState,
} from "@/lib/types";
import { Statblock } from "@/components/statblock";
import { ColossusSuperCard } from "@/components/colossus-super-card";
import { Collapsible } from "@/components/collapsible";
import { CanvasSessionsDialog } from "@/components/canvas-sessions-dialog";
import { CanvasRangeRuler } from "@/components/canvas-range-ruler";
import { FaRulerHorizontal } from "react-icons/fa";
import { MdGridOn, MdGridOff } from "react-icons/md";
import {
  TrashIcon,
  ImageIcon,
  PlusIcon,
  SessionsIcon,
  ChevronIcon,
  EditIcon,
} from "@/components/icons";
import {
  CANVAS_GRID_SIZE,
  RULER_ACTIVE_EVENT,
  type CanvasRangeMeasurement,
} from "@/lib/canvas-range";
import {
  useCanvasInteractions,
  type DragState,
  type ResizePreview,
  type View,
} from "@/lib/use-canvas-interactions";

const texts = {
  title: { es: "Mesa de juego", pt: "Mesa de jogo" },
  collapsePanel: { es: "Ocultar panel", pt: "Ocultar painel" },
  expandPanel: { es: "Mostrar panel", pt: "Mostrar painel" },
  tools: { es: "Herramientas", pt: "Ferramentas" },
  closePanel: { es: "Cerrar", pt: "Fechar" },
  snapOn: { es: "Ajuste a cuadrícula: activado", pt: "Ajuste à grade: ativado" },
  snapOff: { es: "Ajuste a cuadrícula: desactivado", pt: "Ajuste à grade: desativado" },
  token: { es: "Token", pt: "Token" },
  pc: { es: "Personaje", pt: "Personagem" },
  adversary: { es: "Adversario", pt: "Adversário" },
  tokenType: { es: "Tipo de token", pt: "Tipo de token" },
  counter: { es: "Contador", pt: "Contador" },
  counterName: { es: "Nombre del contador", pt: "Nome do contador" },
  note: { es: "Nota", pt: "Nota" },
  noteName: { es: "Título de la nota", pt: "Título da nota" },
  addThread: { es: "Agregar hilo", pt: "Adicionar tópico" },
  threadPlaceholder: { es: "Escribe una entrada…", pt: "Escreva uma entrada…" },
  emptyThreads: { es: "Sin hilos todavía.", pt: "Sem tópicos ainda." },
  colossus: { es: "Coloso", pt: "Colosso" },
  image: { es: "Imagen", pt: "Imagem" },
  imageToken: { es: "Token con imagen", pt: "Token com imagem" },
  adversariesSection: { es: "Adversarios", pt: "Adversários" },
  fromWorkshop: { es: "Tus adversarios", pt: "Seus adversários" },
  official: { es: "Adversario oficial", pt: "Adversário oficial" },
  quantity: { es: "Cantidad", pt: "Quantidade" },
  addAdversary: { es: "Agregar a la Mesa", pt: "Adicionar à Mesa" },
  selectOne: { es: "— Elegir —", pt: "— Escolher —" },
  emptyWorkshop: {
    es: "Crea adversarios en el Taller y aparecerán aquí, listos para la Mesa.",
    pt: "Crie adversários na Oficina e eles aparecerão aqui, prontos para a Mesa.",
  },
  colossusSection: { es: "Colosos", pt: "Colossos" },
  officialColossus: { es: "Coloso oficial", pt: "Colosso oficial" },
  fromWorkshopColossus: { es: "Tus colosos", pt: "Seus colossos" },
  emptyWorkshopColossus: {
    es: "Crea colosos en el Taller y aparecerán aquí, listos para la Mesa.",
    pt: "Crie colossos na Oficina e eles aparecerão aqui, prontos para a Mesa.",
  },
  environmentsSection: { es: "Entornos", pt: "Ambientes" },
  officialEnvironment: { es: "Entorno oficial", pt: "Ambiente oficial" },
  fromWorkshopEnv: { es: "Tus entornos", pt: "Seus ambientes" },
  emptyWorkshopEnv: {
    es: "Crea entornos en el Taller y aparecerán aquí, listos para la Mesa.",
    pt: "Crie ambientes na Oficina e eles aparecerão aqui, prontos para a Mesa.",
  },
  equipmentSection: { es: "Equipo", pt: "Equipamento" },
  officialEquipment: { es: "Equipo oficial", pt: "Equipamento oficial" },
  fromWorkshopEquip: { es: "Tus objetos", pt: "Seus itens" },
  emptyWorkshopEquip: {
    es: "Crea objetos en el Taller y aparecerán aquí, listos para la Mesa.",
    pt: "Crie itens na Oficina e eles aparecerão aqui, prontos para a Mesa.",
  },
  allCategories: { es: "Todas las categorías", pt: "Todas as categorias" },
  help: {
    es: "Arrastra para mover · rueda para acercar · selecciona una imagen para cambiar su tamaño",
    pt: "Arraste para mover · rolagem para aproximar · selecione uma imagem para alterar seu tamanho",
  },
  helpMobile: {
    es: "Pellizca para zoom · toca un elemento para editar",
    pt: "Pinça para zoom · toque um elemento para editar",
  },
  name: { es: "Nombre", pt: "Nome" },
  center: { es: "Centrar", pt: "Centralizar" },
  sessions: { es: "Sesiones", pt: "Sessões" },
  rangeRuler: { es: "Regla de alcance", pt: "Régua de alcance" },
  tier: { es: "Nivel", pt: "Nível" },
  imageStorageError: {
    es: "No se pudo guardar la imagen. Revisa el espacio disponible del navegador e inténtalo de nuevo.",
    pt: "Não foi possível salvar a imagem. Verifique o espaço disponível no navegador e tente novamente.",
  },
  resizeImage: {
    es: "Cambiar tamaño de la imagen",
    pt: "Alterar tamanho da imagem",
  },
};

// Token colors: gold for player characters, red for adversaries.
const PC_TOKEN_COLOR = "#d4a843";
const ADVERSARY_TOKEN_COLOR = "#b03040";

const DEFAULT_IMAGE_WIDTH = 560;
const MIN_IMAGE_WIDTH = 120;
const MAX_IMAGE_WIDTH = 4000;
const MIN_CANVAS_SCALE = 0.3;
const MAX_CANVAS_SCALE = 3;
const WHEEL_ZOOM_SENSITIVITY = 0.0006;

// Official adversaries dropped on the Table get every tracker by default.
const ALL_TRACKERS: TrackerConfig = { health: true, countdown: true, token: true };
// Equipment cards are reference, not combatants — no trackers.
const NO_TRACKERS: TrackerConfig = { health: false, countdown: false, token: false };

let tokenCounter = 0;

function useCanvasImage(imageId?: string, legacyImage?: string) {
  const [storedSource, setStoredSource] = useState<{
    imageId: string;
    source: string;
  } | null>(null);

  useEffect(() => {
    if (!imageId) return;

    let objectUrl: string | undefined;
    let cancelled = false;

    void readCanvasImage(imageId)
      .then((image) => {
        if (!image || cancelled) return;
        objectUrl = URL.createObjectURL(image);
        setStoredSource({ imageId, source: objectUrl });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageId]);

  if (!imageId) return legacyImage;
  return storedSource?.imageId === imageId ? storedSource.source : undefined;
}

function CanvasImage({
  imageId,
  legacyImage,
  alt,
  ...props
}: {
  imageId?: string;
  legacyImage?: string;
  alt: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "alt" | "src">) {
  const source = useCanvasImage(imageId, legacyImage);
  if (!source) return null;
  // Blob and data URLs are browser-local and cannot use Next.js image optimization.
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} src={source} alt={alt} />;
}

export function TableCanvas() {
  const { language } = useLanguage();
  // Shared canvas persistence (also written by the Workshop's "Send to Table").
  const {
    elements,
    setElements,
    sessions,
    activeSessionId,
    selectSession,
    createSession,
    renameSession,
    deleteSession,
    exportSession,
    importSession,
  } = useCanvas();
  const [selection, setSelection] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  // On mobile the tools live in a bottom sheet instead of the side panel.
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [imageStorageError, setImageStorageError] = useState(false);
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 });
  const [rulerActive, setRulerActive] = useState(false);
  const [rangeMeasurement, setRangeMeasurement] =
    useState<CanvasRangeMeasurement | null>(null);
  // Visual offset during drag; persisted only when released.
  const [dragOffset, setDragOffset] = useState<{
    id: string;
    dx: number;
    dy: number;
  } | null>(null);
  const [resizePreview, setResizePreview] = useState<ResizePreview | null>(null);
  const [officialIndex, setOfficialIndex] = useState("");
  const [workshopId, setWorkshopId] = useState("");
  const [officialColossusIndex, setOfficialColossusIndex] = useState("");
  const [workshopColossusId, setWorkshopColossusId] = useState("");
  const [officialEnvIndex, setOfficialEnvIndex] = useState("");
  const [workshopEnvId, setWorkshopEnvId] = useState("");
  const [equipCategory, setEquipCategory] = useState("");
  const [officialEquipIndex, setOfficialEquipIndex] = useState("");
  const [workshopEquipId, setWorkshopEquipId] = useState("");
  const {
    adversaryBrews,
    colossusBrews,
    environmentBrews,
    equipmentBrews,
    filteredOfficialEquipment,
    officialAdversaries,
    officialColossi,
    officialEnvironments,
    workshopBrews,
    workshopColossi,
    workshopEnvironments,
    workshopEquipment,
  } = useCanvasCatalog({ language, equipCategory });
  const [quantity, setQuantity] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState>(null);
  // Active touch points (by pointerId) and the in-progress pinch, for
  // two-finger zoom on touch devices.
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{
    startDist: number;
    startScale: number;
    startView: View;
    startMidX: number;
    startMidY: number;
  } | null>(null);

  const {
    pointerToCanvasPoint,
    resetCanvasInteraction: resetCanvasPointerInteraction,
    stageCenter,
  } = useCanvasInteractions({
    dragRef,
    setDragOffset,
    setResizePreview,
    stageRef,
    view,
  });

  const resetCanvasInteraction = () => {
    setSelection(null);
    setRulerActive(false);
    setRangeMeasurement(null);
    resetCanvasPointerInteraction();
  };

  // Delete selected element with Delete/Backspace.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selection &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        setElements((els) => els.filter((el) => el.id !== selection));
        setSelection(null);
      }
      if (e.key === "Escape" && rulerActive) {
        setRulerActive(false);
        setRangeMeasurement(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [rulerActive, selection, setElements]);

  // Track the desktop breakpoint so the tools render as a side panel (md+) or
  // as a bottom sheet (mobile). SSR defaults to desktop; corrected on mount.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Let the global dice button lift clear of the ruler legend.
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(RULER_ACTIVE_EVENT, { detail: rulerActive }),
    );
  }, [rulerActive]);
  useEffect(
    () => () => {
      window.dispatchEvent(new CustomEvent(RULER_ACTIVE_EVENT, { detail: false }));
    },
    [],
  );

  const addElement = (partial: Omit<CanvasElement, "id" | "x" | "y">) => {
    const { x, y } = stageCenter();
    const offset = (tokenCounter++ % 5) * 24;
    const next: CanvasElement = {
      ...partial,
      id: createId(),
      x: x + offset,
      y: y + offset,
    };
    setElements((els) => [...els, next]);
    setSelection(next.id);
  };

  // Drop `count` statblock cards built from a snapshot, fanned out from center.
  const addStatblocks = (snapshot: StatblockSnapshot, name: string, count: number) => {
    const { x, y } = stageCenter();
    const news: CanvasElement[] = Array.from({ length: count }, (_, i) => ({
      id: createId(),
      kind: "statblock",
      name,
      x: x + i * 40,
      y: y + i * 40,
      statblock: snapshot,
      trackerState: emptyTrackerState(),
    }));
    setElements((els) => [...els, ...news]);
    setSelection(news[news.length - 1].id);
  };

  const updateTrackerState = (id: string, next: TrackerState) =>
    setElements((els) => els.map((el) => (el.id === id ? { ...el, trackerState: next } : el)));

  const patchElement = (id: string, patch: Partial<CanvasElement>) =>
    setElements((els) => els.map((el) => (el.id === id ? { ...el, ...patch } : el)));

  const removeElement = (id: string) => {
    setElements((els) => els.filter((el) => el.id !== id));
    setSelection((current) => (current === id ? null : current));
  };

  // Adjust a counter from its latest value (not the render-time closure) so
  // rapid clicks each register.
  const adjustCount = (id: string, delta: number) =>
    setElements((els) =>
      els.map((el) =>
        el.id === id ? { ...el, count: Math.max(0, (el.count ?? 0) + delta) } : el,
      ),
    );

  // The token type toggle: switch a plain token between PC (gold) and
  // adversary (red), keeping its kind and color in sync.
  const setTokenType = (id: string, type: "pc" | "adversary") =>
    patchElement(id, {
      kind: type === "pc" ? "pc-token" : "adversary-token",
      color: type === "pc" ? PC_TOKEN_COLOR : ADVERSARY_TOKEN_COLOR,
    });

  const addThread = (id: string) =>
    setElements((els) =>
      els.map((el) =>
        el.id === id
          ? {
              ...el,
              threads: [
                ...(el.threads ?? []),
                { id: createId(), text: "", createdAt: new Date().toISOString() },
              ],
            }
          : el,
      ),
    );

  const updateThread = (id: string, threadId: string, text: string) =>
    setElements((els) =>
      els.map((el) =>
        el.id === id
          ? {
              ...el,
              threads: (el.threads ?? []).map((thread) =>
                thread.id === threadId ? { ...thread, text } : thread,
              ),
            }
          : el,
      ),
    );

  const removeThread = (id: string, threadId: string) =>
    setElements((els) =>
      els.map((el) =>
        el.id === id
          ? { ...el, threads: (el.threads ?? []).filter((thread) => thread.id !== threadId) }
          : el,
      ),
    );

  // Threads are timestamped in the user's locale and timezone.
  const threadDateLocale = language === "pt" ? "pt-BR" : "es-ES";
  const formatThreadDate = (iso: string) =>
    new Date(iso).toLocaleString(threadDateLocale, {
      dateStyle: "short",
      timeStyle: "short",
    });

  const toggleCollapse = (id: string) =>
    setElements((els) => els.map((el) => (el.id === id ? { ...el, collapsed: !el.collapsed } : el)));

  const uploadImage = (kind: "pc-token" | "image") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const imageId = createId();
      setImageStorageError(false);

      try {
        requestPersistentCanvasStorage();
        await saveCanvasImage(imageId, file);
        addElement({
          kind,
          name: file.name.replace(/\.\w+$/, ""),
          imageId,
        });
      } catch {
        await deleteCanvasImage(imageId).catch(() => undefined);
        setImageStorageError(true);
      }
    };
    input.click();
  };

  // ── Pointer interaction: stage pan and token drag ──
  const startRangeMeasurement = (e: React.PointerEvent) => {
    const start = pointerToCanvasPoint(e.clientX, e.clientY);
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { mode: "ruler", start };
    setRangeMeasurement({ start, end: start });
    setSelection(null);
  };

  // Two-finger pinch: begin once a second pointer lands (not while measuring).
  // A pinch overrides any single-pointer pan/drag already in progress.
  const beginPinchIfNeeded = () => {
    if (rulerActive || pinchRef.current || pointersRef.current.size !== 2) return;
    const [p1, p2] = [...pointersRef.current.values()];
    pinchRef.current = {
      startDist: Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1,
      startScale: view.scale,
      startView: view,
      startMidX: (p1.x + p2.x) / 2,
      startMidY: (p1.y + p2.y) / 2,
    };
    dragRef.current = null;
    setDragOffset(null);
  };

  const onPointerDownStage = (e: React.PointerEvent) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size >= 2) {
      beginPinchIfNeeded();
      return;
    }
    if (rulerActive) {
      startRangeMeasurement(e);
      return;
    }
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { mode: "pan", startX: e.clientX, startY: e.clientY, view };
    setSelection(null);
  };

  const onPointerDownToken = (e: React.PointerEvent, el: CanvasElement) => {
    e.stopPropagation();
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size >= 2) {
      beginPinchIfNeeded();
      return;
    }
    if (rulerActive) {
      startRangeMeasurement(e);
      return;
    }
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      mode: "token",
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
    };
    setSelection(el.id);
  };

  const onPointerDownImageResize = (
    e: React.PointerEvent<HTMLButtonElement>,
    element: CanvasElement,
  ) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const startWidth = element.imageWidth ?? DEFAULT_IMAGE_WIDTH;
    dragRef.current = {
      mode: "resize-image",
      id: element.id,
      startX: e.clientX,
      startWidth,
    };
    setResizePreview({ id: element.id, width: startWidth });
    setSelection(element.id);
  };

  const onKeyDownImageResize = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    element: CanvasElement,
  ) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    e.stopPropagation();
    const currentWidth = element.imageWidth ?? DEFAULT_IMAGE_WIDTH;
    const step = e.shiftKey ? 100 : 20;
    const nextWidth = Math.min(
      MAX_IMAGE_WIDTH,
      Math.max(
        MIN_IMAGE_WIDTH,
        currentWidth + (e.key === "ArrowRight" ? step : -step),
      ),
    );
    const widthDelta = nextWidth - currentWidth;
    setElements((elements) =>
      elements.map((item) =>
        item.id === element.id
          ? {
              ...item,
              imageWidth: nextWidth,
              x: item.x + widthDelta / 2,
            }
          : item,
      ),
    );
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    const pinch = pinchRef.current;
    if (pinch && pointersRef.current.size >= 2) {
      const [p1, p2] = [...pointersRef.current.values()];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const rect = stageRef.current?.getBoundingClientRect();
      const left = rect?.left ?? 0;
      const top = rect?.top ?? 0;
      const nextScale = Math.min(
        MAX_CANVAS_SCALE,
        Math.max(MIN_CANVAS_SCALE, pinch.startScale * (dist / pinch.startDist)),
      );
      // Keep the world point initially under the fingers anchored to the
      // current midpoint (zoom + follow-pan).
      const worldX = (pinch.startMidX - left - pinch.startView.x) / pinch.startScale;
      const worldY = (pinch.startMidY - top - pinch.startView.y) / pinch.startScale;
      setView({
        scale: nextScale,
        x: midX - left - worldX * nextScale,
        y: midY - top - worldY * nextScale,
      });
      return;
    }
    const a = dragRef.current;
    if (!a) return;
    if (a.mode === "pan") {
      setView({
        ...a.view,
        x: a.view.x + e.clientX - a.startX,
        y: a.view.y + e.clientY - a.startY,
      });
    } else if (a.mode === "token") {
      setDragOffset({
        id: a.id,
        dx: (e.clientX - a.startX) / view.scale,
        dy: (e.clientY - a.startY) / view.scale,
      });
    } else if (a.mode === "ruler") {
      setRangeMeasurement({
        start: a.start,
        end: pointerToCanvasPoint(e.clientX, e.clientY),
      });
    } else {
      const width = Math.min(
        MAX_IMAGE_WIDTH,
        Math.max(
          MIN_IMAGE_WIDTH,
          a.startWidth + (e.clientX - a.startX) / view.scale,
        ),
      );
      setResizePreview({ id: a.id, width });
    }
  };

  const onPointerUp = (e?: React.PointerEvent) => {
    if (e) pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    const a = dragRef.current;
    if (a?.mode === "token" && dragOffset && dragOffset.id === a.id) {
      const { id, dx, dy } = dragOffset;
      // With snap on, drop the element onto the nearest grid intersection.
      const snap = (n: number) =>
        snapToGrid ? Math.round(n / CANVAS_GRID_SIZE) * CANVAS_GRID_SIZE : n;
      setElements((els) =>
        els.map((el) =>
          el.id === id ? { ...el, x: snap(el.x + dx), y: snap(el.y + dy) } : el,
        ),
      );
    } else if (
      a?.mode === "resize-image" &&
      resizePreview?.id === a.id
    ) {
      const widthDelta = resizePreview.width - a.startWidth;
      setElements((els) =>
        els.map((el) =>
          el.id === a.id
            ? {
                ...el,
                imageWidth: resizePreview.width,
                x: el.x + widthDelta / 2,
              }
            : el,
        ),
      );
    }
    setDragOffset(null);
    setResizePreview(null);
    dragRef.current = null;
  };

  // Wheel zoom. Attached natively as a non-passive listener so preventDefault
  // is allowed — React's synthetic onWheel is passive and would warn.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      const deltaMultiplier =
        e.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : e.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? rect.height
            : 1;
      const normalizedDelta = Math.max(
        -100,
        Math.min(100, e.deltaY * deltaMultiplier),
      );
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      setView((previous) => {
        const nextScale = Math.min(
          MAX_CANVAS_SCALE,
          Math.max(
            MIN_CANVAS_SCALE,
            previous.scale * Math.exp(-normalizedDelta * WHEEL_ZOOM_SENSITIVITY),
          ),
        );
        const canvasX = (cursorX - previous.x) / previous.scale;
        const canvasY = (cursorY - previous.y) / previous.scale;

        return {
          scale: nextScale,
          x: cursorX - canvasX * nextScale,
          y: cursorY - canvasY * nextScale,
        };
      });
    };
    stage.addEventListener("wheel", handler, { passive: false });
    return () => stage.removeEventListener("wheel", handler);
  }, [setView]);

  const selected = elements.find((el) => el.id === selection);

  const positionOf = (el: CanvasElement) => ({
    x: el.x + (dragOffset?.id === el.id ? dragOffset.dx : 0),
    y: el.y + (dragOffset?.id === el.id ? dragOffset.dy : 0),
  });

  const imageWidthOf = (element: CanvasElement) =>
    resizePreview?.id === element.id
      ? resizePreview.width
      : (element.imageWidth ?? DEFAULT_IMAGE_WIDTH);

  const imageLeftOf = (element: CanvasElement) => {
    const width = imageWidthOf(element);
    const storedWidth = element.imageWidth ?? DEFAULT_IMAGE_WIDTH;
    const previewOffset =
      resizePreview?.id === element.id ? (width - storedWidth) / 2 : 0;
    return positionOf(element).x + previewOffset - width / 2;
  };

  const toolButtonClasses =
    "flex w-full items-center gap-2 rounded-lg border border-edge bg-ink px-3 py-2 text-left font-display text-[11px] font-semibold tracking-wide text-mist uppercase transition-colors hover:border-gold-dim hover:text-bone";
  const closeSessions = useCallback(() => setSessionsOpen(false), []);

  // Localized label for a select-field value (e.g. role/category), falling
  // back to the stored value (SRD roles are kept in English).
  const fieldLabel = (type: BrewType, key: string, value: string) => {
    const field = schemas.find((s) => s.id === type)?.fields.find((f) => f.key === key);
    const option = field?.options?.find((o) => o.value === value);
    return option ? t(option.label, language) : value;
  };

  // Secondary line for a workshop brew in the picker: tier + role/category, so
  // the list reads "Dire Wolf · Nivel 1 · Acechador" instead of just the name.
  const describeBrew = (brew: SavedBrew) => {
    const tier = brew.data.tier ? `${t(texts.tier, language)} ${brew.data.tier}` : "";
    const parts =
      brew.type === "adversary"
        ? [tier, fieldLabel("adversary", "role", brew.data.role)]
        : brew.type === "colossus"
          ? [t(texts.colossus, language), tier]
          : brew.type === "equipment"
            ? [fieldLabel("equipment", "category", brew.data.category), tier]
            : [tier, fieldLabel("environment", "category", brew.data.category)];
    return [brew.data.name || brew.type, ...parts].filter(Boolean).join(" · ");
  };

  // Shared tools content: rendered in the desktop side panel and the mobile
  // bottom sheet (only one is mounted at a time, gated by `isDesktop`).
  const toolsBody = (
    <>
        <button
          className={`${toolButtonClasses} mb-2 border-gold-dim/60 bg-gold/10 text-gold`}
          onClick={() => setSessionsOpen(true)}
        >
          <SessionsIcon /> {t(texts.sessions, language)}
        </button>
        <button
          className={toolButtonClasses}
          onClick={() =>
            addElement({
              kind: "pc-token",
              name: t(texts.token, language),
              color: PC_TOKEN_COLOR,
            })
          }
        >
          <PlusIcon /> {t(texts.token, language)}
        </button>
        <button
          className={toolButtonClasses}
          onClick={() => addElement({ kind: "counter", name: "", count: 0 })}
        >
          <PlusIcon /> {t(texts.counter, language)}
        </button>
        <button
          className={toolButtonClasses}
          onClick={() => addElement({ kind: "note", name: "", threads: [] })}
        >
          <PlusIcon /> {t(texts.note, language)}
        </button>
        <button className={toolButtonClasses} onClick={() => uploadImage("pc-token")}>
          <ImageIcon /> {t(texts.imageToken, language)}
        </button>
        <button className={toolButtonClasses} onClick={() => uploadImage("image")}>
          <ImageIcon /> {t(texts.image, language)}
        </button>
        {imageStorageError && (
          <p role="alert" className="text-xs leading-snug text-blood-bright">
            {t(texts.imageStorageError, language)}
          </p>
        )}

        {/* ── Adversaries: official + workshop, collapsible ── */}
        <div className="mt-4 border-t border-edge pt-3">
          <Collapsible title={t(texts.adversariesSection, language)}>
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-[10px] font-semibold tracking-[0.15em] text-mist uppercase">
                {t(texts.official, language)}
              </h3>
              <select
                aria-label={t(texts.official, language)}
                className="w-full cursor-pointer rounded-lg border border-edge bg-field px-2.5 py-1.5 text-[13px] text-bone focus:border-gold-dim focus:outline-none"
                value={officialIndex}
                onChange={(e) => setOfficialIndex(e.target.value)}
              >
                <option value="">{t(texts.selectOne, language)}</option>
                {officialAdversaries.map((r, i) => (
                  <option key={i} value={i}>
                    {r.data.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-mist">{t(texts.quantity, language)}</span>
                <div className="flex items-center overflow-hidden rounded-md border border-edge">
                  <button
                    type="button"
                    aria-label="−"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2 py-0.5 text-mist hover:bg-white/5"
                  >
                    −
                  </button>
                  <span className="min-w-6 text-center text-sm font-bold text-bone">{quantity}</span>
                  <button
                    type="button"
                    aria-label="+"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="px-2 py-0.5 text-mist hover:bg-white/5"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                className={`${toolButtonClasses} justify-center border-gold-dim/60 bg-gold/10 text-gold disabled:opacity-40`}
                disabled={officialIndex === ""}
                onClick={() => {
                  const r = officialAdversaries[Number(officialIndex)];
                  if (!r) return;
                  addStatblocks(
                    { brewType: "adversary", data: r.data, traits: r.traits, segments: r.segments, trackers: ALL_TRACKERS, language: r.language },
                    r.data.name,
                    quantity,
                  );
                }}
              >
                <PlusIcon /> {t(texts.addAdversary, language)}
              </button>

              <h3 className="mt-2 font-display text-[10px] font-semibold tracking-[0.15em] text-mist uppercase">
                {t(texts.fromWorkshop, language)}
              </h3>
              {adversaryBrews.length === 0 ? (
                <p className="text-[13px] leading-snug text-haze italic">
                  {t(texts.emptyWorkshop, language)}
                </p>
              ) : (
                <>
                  <select
                    aria-label={t(texts.fromWorkshop, language)}
                    className="w-full cursor-pointer rounded-lg border border-edge bg-field px-2.5 py-1.5 text-[13px] text-bone focus:border-gold-dim focus:outline-none"
                    value={workshopId}
                    onChange={(e) => setWorkshopId(e.target.value)}
                  >
                    <option value="">{t(texts.selectOne, language)}</option>
                    {workshopBrews.map((brew) => (
                      <option key={brew.id} value={brew.id}>
                        {describeBrew(brew)}
                      </option>
                    ))}
                  </select>
                  <button
                    className={`${toolButtonClasses} justify-center border-gold-dim/60 bg-gold/10 text-gold disabled:opacity-40`}
                    disabled={workshopId === ""}
                    onClick={() => {
                      const brew = workshopBrews.find((item) => item.id === workshopId);
                      if (!brew) return;
                      addStatblocks(
                        {
                          brewType: brew.type,
                          data: brew.data,
                          traits: brew.traits,
                          segments: brew.segments,
                          trackers: brew.trackers,
                          language: brew.language,
                        },
                        brew.data.name || brew.type,
                        1,
                      );
                    }}
                  >
                    <PlusIcon /> {t(texts.addAdversary, language)}
                  </button>
                </>
              )}
            </div>
          </Collapsible>
        </div>

        {/* ── Colossi: official + workshop, collapsible ── */}
        <div className="mt-4 border-t border-edge pt-3">
          <Collapsible title={t(texts.colossusSection, language)}>
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-[10px] font-semibold tracking-[0.15em] text-mist uppercase">
                {t(texts.officialColossus, language)}
              </h3>
              <select
                aria-label={t(texts.officialColossus, language)}
                className="w-full cursor-pointer rounded-lg border border-edge bg-field px-2.5 py-1.5 text-[13px] text-bone focus:border-gold-dim focus:outline-none"
                value={officialColossusIndex}
                onChange={(e) => setOfficialColossusIndex(e.target.value)}
              >
                <option value="">{t(texts.selectOne, language)}</option>
                {officialColossi.map((r, i) => (
                  <option key={i} value={i}>
                    {r.data.name}
                  </option>
                ))}
              </select>
              <button
                className={`${toolButtonClasses} justify-center border-gold-dim/60 bg-gold/10 text-gold disabled:opacity-40`}
                disabled={officialColossusIndex === ""}
                onClick={() => {
                  const r = officialColossi[Number(officialColossusIndex)];
                  if (!r) return;
                  addStatblocks(
                    { brewType: "colossus", data: r.data, traits: r.traits, segments: r.segments, trackers: ALL_TRACKERS, language: r.language },
                    r.data.name,
                    1,
                  );
                }}
              >
                <PlusIcon /> {t(texts.addAdversary, language)}
              </button>

              <h3 className="mt-2 font-display text-[10px] font-semibold tracking-[0.15em] text-mist uppercase">
                {t(texts.fromWorkshopColossus, language)}
              </h3>
              {colossusBrews.length === 0 ? (
                <p className="text-[13px] leading-snug text-haze italic">
                  {t(texts.emptyWorkshopColossus, language)}
                </p>
              ) : (
                <>
                  <select
                    aria-label={t(texts.fromWorkshopColossus, language)}
                    className="w-full cursor-pointer rounded-lg border border-edge bg-field px-2.5 py-1.5 text-[13px] text-bone focus:border-gold-dim focus:outline-none"
                    value={workshopColossusId}
                    onChange={(e) => setWorkshopColossusId(e.target.value)}
                  >
                    <option value="">{t(texts.selectOne, language)}</option>
                    {workshopColossi.map((brew) => (
                      <option key={brew.id} value={brew.id}>
                        {describeBrew(brew)}
                      </option>
                    ))}
                  </select>
                  <button
                    className={`${toolButtonClasses} justify-center border-gold-dim/60 bg-gold/10 text-gold disabled:opacity-40`}
                    disabled={workshopColossusId === ""}
                    onClick={() => {
                      const brew = workshopColossi.find((item) => item.id === workshopColossusId);
                      if (!brew) return;
                      addStatblocks(
                        {
                          brewType: brew.type,
                          data: brew.data,
                          traits: brew.traits,
                          segments: brew.segments,
                          trackers: brew.trackers,
                          language: brew.language,
                        },
                        brew.data.name || brew.type,
                        1,
                      );
                    }}
                  >
                    <PlusIcon /> {t(texts.addAdversary, language)}
                  </button>
                </>
              )}
            </div>
          </Collapsible>
        </div>

        {/* ── Environments: official + workshop, collapsible ── */}
        <div className="mt-4 border-t border-edge pt-3">
          <Collapsible title={t(texts.environmentsSection, language)}>
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-[10px] font-semibold tracking-[0.15em] text-mist uppercase">
                {t(texts.officialEnvironment, language)}
              </h3>
              <select
                aria-label={t(texts.officialEnvironment, language)}
                className="w-full cursor-pointer rounded-lg border border-edge bg-field px-2.5 py-1.5 text-[13px] text-bone focus:border-gold-dim focus:outline-none"
                value={officialEnvIndex}
                onChange={(e) => setOfficialEnvIndex(e.target.value)}
              >
                <option value="">{t(texts.selectOne, language)}</option>
                {officialEnvironments.map((r, i) => (
                  <option key={i} value={i}>
                    {r.data.name}
                  </option>
                ))}
              </select>
              <button
                className={`${toolButtonClasses} justify-center border-gold-dim/60 bg-gold/10 text-gold disabled:opacity-40`}
                disabled={officialEnvIndex === ""}
                onClick={() => {
                  const r = officialEnvironments[Number(officialEnvIndex)];
                  if (!r) return;
                  addStatblocks(
                    { brewType: "environment", data: r.data, traits: r.traits, segments: r.segments, trackers: ALL_TRACKERS, language: r.language },
                    r.data.name,
                    1,
                  );
                }}
              >
                <PlusIcon /> {t(texts.addAdversary, language)}
              </button>

              <h3 className="mt-2 font-display text-[10px] font-semibold tracking-[0.15em] text-mist uppercase">
                {t(texts.fromWorkshopEnv, language)}
              </h3>
              {environmentBrews.length === 0 ? (
                <p className="text-[13px] leading-snug text-haze italic">
                  {t(texts.emptyWorkshopEnv, language)}
                </p>
              ) : (
                <>
                  <select
                    aria-label={t(texts.fromWorkshopEnv, language)}
                    className="w-full cursor-pointer rounded-lg border border-edge bg-field px-2.5 py-1.5 text-[13px] text-bone focus:border-gold-dim focus:outline-none"
                    value={workshopEnvId}
                    onChange={(e) => setWorkshopEnvId(e.target.value)}
                  >
                    <option value="">{t(texts.selectOne, language)}</option>
                    {workshopEnvironments.map((brew) => (
                      <option key={brew.id} value={brew.id}>
                        {describeBrew(brew)}
                      </option>
                    ))}
                  </select>
                  <button
                    className={`${toolButtonClasses} justify-center border-gold-dim/60 bg-gold/10 text-gold disabled:opacity-40`}
                    disabled={workshopEnvId === ""}
                    onClick={() => {
                      const brew = workshopEnvironments.find((item) => item.id === workshopEnvId);
                      if (!brew) return;
                      addStatblocks(
                        {
                          brewType: brew.type,
                          data: brew.data,
                          traits: brew.traits,
                          segments: brew.segments,
                          trackers: brew.trackers,
                          language: brew.language,
                        },
                        brew.data.name || brew.type,
                        1,
                      );
                    }}
                  >
                    <PlusIcon /> {t(texts.addAdversary, language)}
                  </button>
                </>
              )}
            </div>
          </Collapsible>
        </div>

        {/* ── Equipment: official (filtered by category) + workshop ── */}
        <div className="mt-4 border-t border-edge pt-3">
          <Collapsible title={t(texts.equipmentSection, language)}>
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-[10px] font-semibold tracking-[0.15em] text-mist uppercase">
                {t(texts.officialEquipment, language)}
              </h3>
              <select
                aria-label={t(texts.allCategories, language)}
                className="w-full cursor-pointer rounded-lg border border-edge bg-field px-2.5 py-1.5 text-[13px] text-bone focus:border-gold-dim focus:outline-none"
                value={equipCategory}
                onChange={(e) => {
                  setEquipCategory(e.target.value);
                  setOfficialEquipIndex("");
                }}
              >
                <option value="">{t(texts.allCategories, language)}</option>
                {equipmentCategoryGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {t(group.label, language)}
                  </option>
                ))}
              </select>
              <select
                aria-label={t(texts.officialEquipment, language)}
                className="w-full cursor-pointer rounded-lg border border-edge bg-field px-2.5 py-1.5 text-[13px] text-bone focus:border-gold-dim focus:outline-none"
                value={officialEquipIndex}
                onChange={(e) => setOfficialEquipIndex(e.target.value)}
              >
                <option value="">{t(texts.selectOne, language)}</option>
                {filteredOfficialEquipment.map((r, i) => (
                  <option key={i} value={i}>
                    {r.data.name}
                  </option>
                ))}
              </select>
              <button
                className={`${toolButtonClasses} justify-center border-gold-dim/60 bg-gold/10 text-gold disabled:opacity-40`}
                disabled={officialEquipIndex === ""}
                onClick={() => {
                  const r = filteredOfficialEquipment[Number(officialEquipIndex)];
                  if (!r) return;
                  addStatblocks(
                    { brewType: "equipment", data: r.data, traits: r.traits, segments: r.segments, trackers: NO_TRACKERS, language: r.language },
                    r.data.name,
                    1,
                  );
                }}
              >
                <PlusIcon /> {t(texts.addAdversary, language)}
              </button>

              <h3 className="mt-2 font-display text-[10px] font-semibold tracking-[0.15em] text-mist uppercase">
                {t(texts.fromWorkshopEquip, language)}
              </h3>
              {equipmentBrews.length === 0 ? (
                <p className="text-[13px] leading-snug text-haze italic">
                  {t(texts.emptyWorkshopEquip, language)}
                </p>
              ) : (
                <>
                  <select
                    aria-label={t(texts.fromWorkshopEquip, language)}
                    className="w-full cursor-pointer rounded-lg border border-edge bg-field px-2.5 py-1.5 text-[13px] text-bone focus:border-gold-dim focus:outline-none"
                    value={workshopEquipId}
                    onChange={(e) => setWorkshopEquipId(e.target.value)}
                  >
                    <option value="">{t(texts.selectOne, language)}</option>
                    {workshopEquipment.map((brew) => (
                      <option key={brew.id} value={brew.id}>
                        {describeBrew(brew)}
                      </option>
                    ))}
                  </select>
                  <button
                    className={`${toolButtonClasses} justify-center border-gold-dim/60 bg-gold/10 text-gold disabled:opacity-40`}
                    disabled={workshopEquipId === ""}
                    onClick={() => {
                      const brew = workshopEquipment.find((item) => item.id === workshopEquipId);
                      if (!brew) return;
                      addStatblocks(
                        {
                          brewType: brew.type,
                          data: brew.data,
                          traits: brew.traits,
                          segments: brew.segments,
                          trackers: brew.trackers,
                          language: brew.language,
                        },
                        brew.data.name || brew.type,
                        1,
                      );
                    }}
                  >
                    <PlusIcon /> {t(texts.addAdversary, language)}
                  </button>
                </>
              )}
            </div>
          </Collapsible>
        </div>

        {/* ── Inspector of selected element ── */}
        {selected && (
          <div className="mt-auto rounded-lg border border-gold-dim/40 bg-card p-3">
            <label
              htmlFor="token-name"
              className="mb-1 block font-display text-[10px] font-semibold tracking-wider text-mist uppercase"
            >
              {t(texts.name, language)}
            </label>
            <input
              id="token-name"
              className="w-full rounded-md border border-edge bg-field px-2 py-1.5 text-sm text-bone focus:border-gold-dim focus:outline-none"
              value={selected.name}
              onChange={(e) => patchElement(selected.id, { name: e.target.value })}
            />
            {(selected.kind === "pc-token" || selected.kind === "adversary-token") &&
              !selected.imageId &&
              !selected.image && (
                <div className="mt-3">
                  <span className="mb-1 block font-display text-[10px] font-semibold tracking-wider text-mist uppercase">
                    {t(texts.tokenType, language)}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {(
                      [
                        { type: "pc", label: texts.pc, color: PC_TOKEN_COLOR, active: selected.kind === "pc-token" },
                        { type: "adversary", label: texts.adversary, color: ADVERSARY_TOKEN_COLOR, active: selected.kind === "adversary-token" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.type}
                        type="button"
                        aria-pressed={option.active}
                        onClick={() => setTokenType(selected.id, option.type)}
                        className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 font-display text-[11px] font-semibold transition-colors ${
                          option.active
                            ? "border-gold-dim bg-gold/10 text-bone"
                            : "border-edge text-mist hover:border-gold-dim hover:text-bone"
                        }`}
                      >
                        <span
                          className="h-3 w-3 shrink-0 rounded-full border border-abyss/40"
                          style={{ background: option.color }}
                        />
                        {t(option.label, language)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            <button
              onClick={() => removeElement(selected.id)}
              className="mt-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-blood-bright transition-colors hover:bg-blood/15"
            >
              <TrashIcon /> {t(ui.remove, language)}
            </button>
          </div>
        )}
    </>
  );

  return (
    <div className="flex h-[calc(100dvh-56px)]">
      {/* ── Tools: side panel on desktop, bottom sheet on mobile ── */}
      {isDesktop && panelOpen && (
        <aside className="flex w-60 shrink-0 flex-col gap-2 overflow-y-auto border-r border-edge bg-ink/60 p-4">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h1 className="font-display text-sm font-bold tracking-wider text-gold uppercase">
              {t(texts.title, language)}
            </h1>
            <button
              type="button"
              aria-label={t(texts.collapsePanel, language)}
              title={t(texts.collapsePanel, language)}
              onClick={() => setPanelOpen(false)}
              className="-mr-1 shrink-0 rounded-md p-1 text-mist transition-colors hover:bg-white/5 hover:text-bone"
            >
              <ChevronIcon size={18} className="rotate-90" />
            </button>
          </div>
          {toolsBody}
        </aside>
      )}

      {/* Mobile tools — bottom sheet */}
      {!isDesktop && mobileToolsOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/50"
            onClick={() => setMobileToolsOpen(false)}
          />
          <aside className="pb-safe fixed inset-x-0 bottom-0 z-[60] flex max-h-[85dvh] flex-col gap-2 overflow-y-auto rounded-t-2xl border-t border-edge bg-ink/95 p-4 shadow-2xl shadow-black/70 backdrop-blur">
            <div className="mb-1 flex items-center justify-between gap-2">
              <h1 className="font-display text-sm font-bold tracking-wider text-gold uppercase">
                {t(texts.title, language)}
              </h1>
              <button
                type="button"
                aria-label={t(texts.closePanel, language)}
                onClick={() => setMobileToolsOpen(false)}
                className="-mr-1 shrink-0 rounded-md p-1.5 text-mist transition-colors hover:bg-white/5 hover:text-bone"
              >
                ✕
              </button>
            </div>
            {toolsBody}
          </aside>
        </>
      )}

      {/* ── Stage ── */}
      <div
        ref={stageRef}
        className={`relative flex-1 touch-none overflow-hidden ${
          rulerActive
            ? "cursor-crosshair"
            : "cursor-grab active:cursor-grabbing"
        }`}
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(212,168,67,0.12) 1px, transparent 1px)",
          backgroundSize: `${CANVAS_GRID_SIZE * view.scale}px ${CANVAS_GRID_SIZE * view.scale}px`,
          backgroundPosition: `${view.x}px ${view.y}px`,
        }}
        onPointerDown={onPointerDownStage}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {isDesktop && !panelOpen && (
          <button
            type="button"
            aria-label={t(texts.expandPanel, language)}
            title={t(texts.expandPanel, language)}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setPanelOpen(true)}
            className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-lg border border-edge bg-ink/85 px-2.5 py-1.5 font-display text-[11px] font-semibold tracking-wide text-gold uppercase backdrop-blur transition-colors hover:border-gold-dim"
          >
            <ChevronIcon size={16} className="-rotate-90" />
            {t(texts.title, language)}
          </button>
        )}
        {!isDesktop && !mobileToolsOpen && (
          <button
            type="button"
            aria-label={t(texts.tools, language)}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setMobileToolsOpen(true)}
            className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-lg border border-edge bg-ink/85 px-3 py-2 font-display text-[11px] font-semibold tracking-wide text-gold uppercase backdrop-blur transition-colors hover:border-gold-dim active:bg-gold/10"
          >
            <PlusIcon size={14} /> {t(texts.tools, language)}
          </button>
        )}

        {/* Grid snap toggle (top-right): snap dropped elements to the grid. */}
        <button
          type="button"
          aria-pressed={snapToGrid}
          aria-label={t(snapToGrid ? texts.snapOn : texts.snapOff, language)}
          title={t(snapToGrid ? texts.snapOn : texts.snapOff, language)}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setSnapToGrid((v) => !v)}
          className={`absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-lg border backdrop-blur transition-colors ${
            snapToGrid
              ? "border-gold-dim bg-gold/15 text-gold"
              : "border-edge bg-ink/85 text-mist hover:border-gold-dim hover:text-bone"
          }`}
        >
          {snapToGrid ? <MdGridOn size={20} /> : <MdGridOff size={20} />}
        </button>

        {/* Floating canvas controls. While the ruler is active its legend
            occupies the bottom strip, so lift Centrar above it and hide the
            ruler toggle (the legend carries its own close button). */}
        <button
          type="button"
          aria-label={t(texts.center, language)}
          title={t(texts.center, language)}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setView({ x: 0, y: 0, scale: 1 })}
          className={`absolute left-5 z-50 flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-bright text-2xl leading-none text-abyss shadow-lg shadow-gold/25 transition-all hover:scale-108 ${
            rulerActive
              ? "bottom-[calc(7rem+env(safe-area-inset-bottom))]"
              : "bottom-[calc(1.25rem+env(safe-area-inset-bottom))]"
          }`}
        >
          ⌖
        </button>
        <button
          type="button"
          aria-pressed={rulerActive}
          aria-label={t(texts.rangeRuler, language)}
          title={t(texts.rangeRuler, language)}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            setRulerActive((active) => {
              if (active) setRangeMeasurement(null);
              return !active;
            });
          }}
          className={`absolute left-1/2 z-50 flex h-13 w-13 -translate-x-1/2 items-center justify-center rounded-full border shadow-lg transition-all hover:scale-108 ${
            rulerActive
              ? "bottom-[calc(7rem+env(safe-area-inset-bottom))] border-sky-300 bg-sky-400/90 text-abyss shadow-sky-400/30"
              : "bottom-[calc(1.25rem+env(safe-area-inset-bottom))] border-gold-dim/60 bg-ink/85 text-gold backdrop-blur hover:border-gold-dim"
          }`}
        >
          <FaRulerHorizontal size={18} />
        </button>

        <div
          className="absolute top-0 left-0"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: "0 0",
          }}
        >
          {elements.map((el) =>
            el.kind === "image" ? (
              <div
                key={el.id}
                onPointerDown={(e) => onPointerDownToken(e, el)}
                className={`absolute rounded-lg ${
                  selection === el.id ? "ring-2 ring-gold" : ""
                }`}
                style={{
                  left: imageLeftOf(el),
                  top: positionOf(el).y - 200,
                  width: imageWidthOf(el),
                  zIndex: 0,
                }}
              >
                <CanvasImage
                  imageId={el.imageId}
                  legacyImage={el.image}
                  alt={el.name}
                  draggable={false}
                  className="block h-auto w-full max-w-none rounded-lg select-none"
                />
                {selection === el.id && (
                  <button
                    type="button"
                    aria-label={t(texts.resizeImage, language)}
                    title={t(texts.resizeImage, language)}
                    onPointerDown={(e) => onPointerDownImageResize(e, el)}
                    onKeyDown={(e) => onKeyDownImageResize(e, el)}
                    className="absolute right-0 bottom-0 h-6 w-6 translate-x-1/2 translate-y-1/2 cursor-nwse-resize touch-none rounded-sm border-2 border-abyss bg-gold shadow-lg shadow-black/50 after:absolute after:right-1 after:bottom-1 after:h-2 after:w-2 after:border-r-2 after:border-b-2 after:border-abyss"
                  />
                )}
              </div>
            ) : el.kind === "counter" ? (
              <div
                key={el.id}
                onPointerDown={(e) => e.stopPropagation()}
                className={`absolute w-44 overflow-hidden rounded-lg border bg-card shadow-2xl shadow-black/50 ${
                  selection === el.id ? "border-gold ring-2 ring-gold" : "border-edge"
                }`}
                style={{ left: positionOf(el).x, top: positionOf(el).y, zIndex: 2 }}
              >
                <div
                  onPointerDown={(e) => onPointerDownToken(e, el)}
                  className="flex cursor-move items-center justify-between bg-abyss/90 px-2 py-1"
                >
                  <span className="font-display text-[10px] font-semibold tracking-wider text-gold uppercase">
                    {t(texts.counter, language)}
                  </span>
                  <button
                    type="button"
                    aria-label={t(ui.remove, language)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => removeElement(el.id)}
                    className="rounded p-0.5 text-haze hover:text-blood-bright"
                  >
                    <TrashIcon />
                  </button>
                </div>
                <div className="flex flex-col items-center gap-2.5 p-2.5">
                  <input
                    value={el.name}
                    placeholder={t(texts.counterName, language)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onChange={(e) => patchElement(el.id, { name: e.target.value })}
                    className="w-full rounded-md border border-edge bg-field px-2 py-1 text-center text-[13px] text-bone placeholder:text-haze focus:border-gold-dim focus:outline-none"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="−"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => adjustCount(el.id, -1)}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-edge text-lg text-mist transition-colors hover:border-gold-dim hover:text-bone"
                    >
                      −
                    </button>
                    <span className="min-w-10 text-center font-display text-2xl font-bold text-gold tabular-nums">
                      {el.count ?? 0}
                    </span>
                    <button
                      type="button"
                      aria-label="+"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => adjustCount(el.id, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-edge text-lg text-mist transition-colors hover:border-gold-dim hover:text-bone"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ) : el.kind === "note" ? (
              <div
                key={el.id}
                onPointerDown={(e) => e.stopPropagation()}
                className={`absolute flex max-h-96 w-64 flex-col overflow-hidden rounded-lg border bg-card shadow-2xl shadow-black/50 ${
                  selection === el.id ? "border-gold ring-2 ring-gold" : "border-edge"
                }`}
                style={{ left: positionOf(el).x, top: positionOf(el).y, zIndex: 2 }}
              >
                <div
                  onPointerDown={(e) => onPointerDownToken(e, el)}
                  className="flex cursor-move items-center justify-between bg-abyss/90 px-2 py-1"
                >
                  <span className="font-display text-[10px] font-semibold tracking-wider text-gold uppercase">
                    {t(texts.note, language)}
                  </span>
                  <button
                    type="button"
                    aria-label={t(ui.remove, language)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => removeElement(el.id)}
                    className="rounded p-0.5 text-haze hover:text-blood-bright"
                  >
                    <TrashIcon />
                  </button>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto p-2.5">
                  <input
                    value={el.name}
                    placeholder={t(texts.noteName, language)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onChange={(e) => patchElement(el.id, { name: e.target.value })}
                    className="w-full rounded-md border border-edge bg-field px-2 py-1 text-[13px] font-semibold text-bone placeholder:text-haze focus:border-gold-dim focus:outline-none"
                  />
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => addThread(el.id)}
                    className="flex items-center justify-center gap-1.5 rounded-md border border-gold-dim/50 bg-gold/10 px-2 py-1 font-display text-[11px] font-semibold tracking-wide text-gold uppercase transition-colors hover:bg-gold/15"
                  >
                    <PlusIcon size={13} /> {t(texts.addThread, language)}
                  </button>
                  {(el.threads ?? []).length === 0 ? (
                    <p className="text-center text-[12px] text-haze italic">
                      {t(texts.emptyThreads, language)}
                    </p>
                  ) : (
                    (el.threads ?? []).map((thread) => (
                      <div
                        key={thread.id}
                        className="rounded-md border border-edge bg-field/50 p-2"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <time className="font-display text-[10px] tracking-wide text-haze">
                            {formatThreadDate(thread.createdAt)}
                          </time>
                          <button
                            type="button"
                            aria-label={t(ui.remove, language)}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => removeThread(el.id, thread.id)}
                            className="rounded p-0.5 text-haze hover:text-blood-bright"
                          >
                            <TrashIcon size={12} />
                          </button>
                        </div>
                        <textarea
                          value={thread.text}
                          placeholder={t(texts.threadPlaceholder, language)}
                          rows={2}
                          onPointerDown={(e) => e.stopPropagation()}
                          onChange={(e) => updateThread(el.id, thread.id, e.target.value)}
                          className="w-full resize-y rounded border border-edge bg-field px-2 py-1 text-[13px] leading-snug text-bone placeholder:text-haze focus:border-gold-dim focus:outline-none"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : el.kind === "statblock" && el.statblock?.brewType === "colossus" ? (
              <div
                key={el.id}
                onPointerDown={(e) => e.stopPropagation()}
                className={`absolute ${selection === el.id ? "rounded-lg ring-2 ring-gold" : ""}`}
                style={{ left: positionOf(el).x, top: positionOf(el).y, zIndex: 2 }}
              >
                <ColossusSuperCard
                  snapshot={el.statblock}
                  name={el.name}
                  collapsed={el.collapsed ?? false}
                  state={el.trackerState ?? emptyTrackerState()}
                  onStateChange={(next) => updateTrackerState(el.id, next)}
                  onToggleCollapse={() => toggleCollapse(el.id)}
                  onRemove={() => setElements((els) => els.filter((x) => x.id !== el.id))}
                  onHeaderPointerDown={(e) => onPointerDownToken(e, el)}
                />
              </div>
            ) : el.kind === "statblock" && el.statblock ? (
              <div
                key={el.id}
                // Stop pointerdown on the card from panning the stage; the
                // drag handle below starts the move, trackers stay clickable.
                onPointerDown={(e) => e.stopPropagation()}
                className={`absolute w-[340px] overflow-hidden rounded-lg shadow-2xl shadow-black/50 ${
                  selection === el.id ? "ring-2 ring-gold" : ""
                }`}
                style={{ left: positionOf(el).x, top: positionOf(el).y, zIndex: 2 }}
              >
                <div
                  onPointerDown={(e) => onPointerDownToken(e, el)}
                  className="flex cursor-move items-center justify-between bg-abyss/90 px-3 py-1.5"
                >
                  <span className="truncate font-display text-xs font-semibold text-gold">
                    {el.name}
                  </span>
                  <button
                    type="button"
                    aria-label={t(ui.remove, language)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setElements((els) => els.filter((x) => x.id !== el.id))}
                    className="rounded p-0.5 text-haze hover:text-blood-bright"
                  >
                    <TrashIcon />
                  </button>
                </div>
                <Statblock
                  brewType={el.statblock.brewType}
                  data={el.statblock.data}
                  traits={el.statblock.traits}
                  segments={el.statblock.segments}
                  trackers={el.statblock.trackers}
                  contentLanguage={el.statblock.language}
                  state={el.trackerState ?? emptyTrackerState()}
                  onStateChange={(next) => updateTrackerState(el.id, next)}
                  rollableDamage
                />
              </div>
            ) : (
              <button
                key={el.id}
                onPointerDown={(e) => onPointerDownToken(e, el)}
                aria-label={el.name}
                className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-move overflow-visible select-none focus-visible:outline-none"
                style={{
                  left: positionOf(el).x,
                  top: positionOf(el).y,
                  width: CANVAS_GRID_SIZE,
                  height: CANVAS_GRID_SIZE,
                  zIndex: 1,
                }}
              >
                <span
                  className={`flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 shadow-lg transition-shadow group-focus-visible:ring-2 group-focus-visible:ring-gold ${
                    selection === el.id
                      ? "border-gold-bright ring-2 ring-gold/50"
                      : "border-edge"
                  }`}
                  style={{
                    background:
                      el.imageId || el.image ? undefined : el.color,
                  }}
                >
                  {(el.imageId || el.image) && (
                    <CanvasImage
                      imageId={el.imageId}
                      legacyImage={el.image}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  )}
                </span>
                <span className="pointer-events-none absolute top-full left-1/2 mt-1 max-w-24 -translate-x-1/2 truncate rounded border border-edge/80 bg-abyss/90 px-1.5 py-0.5 font-display text-[8px] leading-none font-semibold tracking-wide whitespace-nowrap text-bone shadow-md shadow-black/50">
                  {el.name || "?"}
                </span>
              </button>
            ),
          )}
        </div>

        {rulerActive && (
          <CanvasRangeRuler
            measurement={rangeMeasurement}
            view={view}
            onClear={() => setRangeMeasurement(null)}
            onClose={() => {
              setRulerActive(false);
              setRangeMeasurement(null);
            }}
          />
        )}

        {/* Selected element label (sits above the bottom-center ruler control).
            On mobile it doubles as a shortcut to open the tools/inspector. */}
        {selected &&
          (isDesktop ? (
            <div className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full border border-edge bg-card/90 px-4 py-1.5 font-display text-xs tracking-wide text-gold">
              {selected.name}
            </div>
          ) : (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setMobileToolsOpen(true)}
              className="absolute bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 z-30 flex max-w-[80vw] -translate-x-1/2 items-center gap-1.5 rounded-full border border-gold-dim/60 bg-card/95 px-4 py-2 font-display text-xs tracking-wide text-gold shadow-lg backdrop-blur active:bg-gold/10"
            >
              <EditIcon size={13} />
              <span className="truncate">{selected.name || t(texts.name, language)}</span>
            </button>
          ))}

        {/* Help: full hint on desktop, short touch hint on mobile. */}
        <p className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-abyss/70 px-4 py-1 text-center text-xs text-haze max-sm:hidden">
          {t(texts.help, language)}
        </p>
        {!selected && !rulerActive && (
          <p className="pointer-events-none absolute bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 max-w-[88vw] -translate-x-1/2 rounded-full bg-abyss/70 px-3 py-1 text-center text-[11px] text-haze sm:hidden">
            {t(texts.helpMobile, language)}
          </p>
        )}
      </div>
      <CanvasSessionsDialog
        open={sessionsOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onClose={closeSessions}
        onSelect={(id) => {
          resetCanvasInteraction();
          selectSession(id);
        }}
        onCreate={(name) => {
          resetCanvasInteraction();
          createSession(name);
        }}
        onRename={renameSession}
        onDelete={async (id) => {
          await deleteSession(id);
          resetCanvasInteraction();
        }}
        onExport={exportSession}
        onImport={async (source) => {
          const id = await importSession(source);
          resetCanvasInteraction();
          return id;
        }}
      />
    </div>
  );
}
