"use client";

import { useEffect, useRef, useState } from "react";
import {
  DownloadIcon,
  EditIcon,
  PlusIcon,
  SessionsIcon,
  TrashIcon,
  UploadIcon,
} from "@/components/icons";
import type {
  CanvasSessionDownload,
  CanvasSessionSummary,
} from "@/lib/canvas";
import { t, useLanguage } from "@/lib/i18n";

const texts = {
  title: { es: "Sesiones del lienzo", pt: "Sessões da tela" },
  description: {
    es: "Cambia de lienzo o lleva una sesión completa a otro navegador.",
    pt: "Alterne a tela ou leve uma sessão completa para outro navegador.",
  },
  active: { es: "Activa", pt: "Ativa" },
  empty: { es: "Preparando tus sesiones…", pt: "Preparando suas sessões…" },
  newName: { es: "Nombre de la nueva sesión", pt: "Nome da nova sessão" },
  newPlaceholder: { es: "Ej. Batalla final", pt: "Ex. Batalha final" },
  newSession: { es: "Nueva sesión", pt: "Nova sessão" },
  import: { es: "Importar", pt: "Importar" },
  importing: { es: "Importando…", pt: "Importando…" },
  export: { es: "Exportar activa", pt: "Exportar ativa" },
  exporting: { es: "Exportando…", pt: "Exportando…" },
  close: { es: "Cerrar", pt: "Fechar" },
  imported: {
    es: "La sesión se importó y quedó activa.",
    pt: "A sessão foi importada e está ativa.",
  },
  importError: {
    es: "No se pudo importar. Verifica que sea un archivo de sesión válido.",
    pt: "Não foi possível importar. Verifique se o arquivo de sessão é válido.",
  },
  exportError: {
    es: "No se pudo exportar la sesión completa.",
    pt: "Não foi possível exportar a sessão completa.",
  },
  createError: {
    es: "No se pudo crear la sesión. Revisa el espacio disponible del navegador.",
    pt: "Não foi possível criar a sessão. Verifique o espaço disponível no navegador.",
  },
  delete: { es: "Eliminar", pt: "Excluir" },
  cancel: { es: "Cancelar", pt: "Cancelar" },
  deleteSession: { es: "Eliminar sesión", pt: "Excluir sessão" },
  deleteConfirmation: {
    es: "Se eliminará el lienzo y sus imágenes. Esta acción no se puede deshacer.",
    pt: "A tela e suas imagens serão excluídas. Esta ação não pode ser desfeita.",
  },
  deleteSuccess: {
    es: "La sesión se eliminó.",
    pt: "A sessão foi excluída.",
  },
  deleteError: {
    es: "No se pudo eliminar la sesión.",
    pt: "Não foi possível excluir a sessão.",
  },
  editSession: { es: "Editar nombre", pt: "Editar nome" },
  sessionName: { es: "Nombre de la sesión", pt: "Nome da sessão" },
  saveName: { es: "Guardar nombre", pt: "Salvar nome" },
  renameSuccess: {
    es: "El nombre de la sesión se actualizó.",
    pt: "O nome da sessão foi atualizado.",
  },
  renameError: {
    es: "No se pudo actualizar el nombre de la sesión.",
    pt: "Não foi possível atualizar o nome da sessão.",
  },
  keepOneSession: {
    es: "Debe conservarse al menos una sesión.",
    pt: "É necessário manter pelo menos uma sessão.",
  },
  updated: { es: "Actualizada", pt: "Atualizada" },
};

interface CanvasSessionsDialogProps {
  open: boolean;
  sessions: CanvasSessionSummary[];
  activeSessionId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => Promise<void>;
  onExport: (id: string) => Promise<CanvasSessionDownload>;
  onImport: (source: string) => Promise<string>;
}

export function CanvasSessionsDialog({
  open,
  sessions,
  activeSessionId,
  onClose,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onExport,
  onImport,
}: CanvasSessionsDialogProps) {
  const { language } = useLanguage();
  const [newName, setNewName] = useState("");
  const [sessionToDelete, setSessionToDelete] =
    useState<CanvasSessionSummary | null>(null);
  const [sessionToRename, setSessionToRename] =
    useState<CanvasSessionSummary | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [busy, setBusy] = useState<"import" | "export" | "delete" | null>(
    null,
  );
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("aria-hidden"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  const dateFormatter = new Intl.DateTimeFormat(
    language === "pt" ? "pt-BR" : "es-MX",
    { dateStyle: "medium", timeStyle: "short" },
  );

  const download = async () => {
    if (!activeSessionId) return;
    setBusy("export");
    setMessage(null);
    try {
      const exported = await onExport(activeSessionId);
      const url = URL.createObjectURL(
        new Blob([exported.contents], { type: "application/json" }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = exported.filename;
      anchor.hidden = true;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch {
      setMessage({ tone: "error", text: t(texts.exportError, language) });
    } finally {
      setBusy(null);
    }
  };

  const importFile = async (file: File) => {
    setBusy("import");
    setMessage(null);
    try {
      await onImport(await file.text());
      setMessage({ tone: "success", text: t(texts.imported, language) });
    } catch {
      setMessage({ tone: "error", text: t(texts.importError, language) });
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const deleteSelectedSession = async () => {
    if (!sessionToDelete) return;
    setBusy("delete");
    setMessage(null);
    try {
      await onDelete(sessionToDelete.id);
      setSessionToDelete(null);
      setMessage({
        tone: "success",
        text: t(texts.deleteSuccess, language),
      });
    } catch {
      setMessage({ tone: "error", text: t(texts.deleteError, language) });
    } finally {
      setBusy(null);
    }
  };

  const renameSelectedSession = () => {
    if (!sessionToRename || !renameValue.trim()) return;
    try {
      onRename(sessionToRename.id, renameValue);
      setSessionToRename(null);
      setRenameValue("");
      setMessage({
        tone: "success",
        text: t(texts.renameSuccess, language),
      });
    } catch {
      setMessage({ tone: "error", text: t(texts.renameError, language) });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="canvas-sessions-title"
        aria-describedby="canvas-sessions-description"
        className="flex max-h-[min(760px,calc(100vh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gold-dim/50 bg-card shadow-2xl shadow-black/70"
      >
        <header className="flex items-start justify-between gap-4 border-b border-edge bg-ink/70 px-6 py-5">
          <div>
            <div className="mb-1 flex items-center gap-2 text-gold">
              <SessionsIcon size={20} />
              <h2
                id="canvas-sessions-title"
                className="font-display text-lg font-bold tracking-wide uppercase"
              >
                {t(texts.title, language)}
              </h2>
            </div>
            <p
              id="canvas-sessions-description"
              className="text-sm text-haze"
            >
              {t(texts.description, language)}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t(texts.close, language)}
            className="rounded-lg border border-edge px-3 py-1.5 text-sm text-mist transition-colors hover:border-gold-dim hover:text-bone focus-visible:outline-2 focus-visible:outline-gold"
          >
            {t(texts.close, language)}
          </button>
        </header>

        <div className="overflow-y-auto p-6">
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-edge p-5 text-center text-sm text-haze">
                {t(texts.empty, language)}
              </p>
            ) : (
              sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const isConfirmingDelete =
                  sessionToDelete?.id === session.id;
                const isRenaming = sessionToRename?.id === session.id;
                const canDelete = sessions.length > 1 && busy === null;
                return (
                  <div
                    key={session.id}
                    className={`rounded-xl border transition-colors ${
                      isActive
                        ? "border-gold-dim bg-gold/10"
                        : "border-edge bg-ink/45 hover:border-gold-dim/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => onSelect(session.id)}
                        aria-pressed={isActive}
                        className="flex min-w-0 flex-1 items-center justify-between gap-4 rounded-lg p-2 text-left focus-visible:outline-2 focus-visible:outline-gold"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-display text-sm font-semibold text-bone">
                            {session.name}
                          </span>
                          <span className="mt-1 block text-xs text-haze">
                            {t(texts.updated, language)}{" "}
                            {dateFormatter.format(new Date(session.updatedAt))}
                          </span>
                        </span>
                        {isActive && (
                          <span className="shrink-0 rounded-full border border-gold-dim/70 bg-gold/15 px-2.5 py-1 font-display text-[10px] font-bold tracking-wider text-gold uppercase">
                            {t(texts.active, language)}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => {
                          setSessionToDelete(null);
                          setSessionToRename(session);
                          setRenameValue(session.name);
                          setMessage(null);
                        }}
                        aria-label={`${t(texts.editSession, language)}: ${session.name}`}
                        title={t(texts.editSession, language)}
                        className="shrink-0 rounded-lg p-2 text-haze transition-colors hover:bg-gold/10 hover:text-gold focus-visible:outline-2 focus-visible:outline-gold disabled:opacity-30"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={!canDelete}
                        onClick={() => {
                          setSessionToRename(null);
                          setSessionToDelete(session);
                          setMessage(null);
                        }}
                        aria-label={`${t(texts.deleteSession, language)}: ${session.name}`}
                        title={
                          sessions.length <= 1
                            ? t(texts.keepOneSession, language)
                            : t(texts.deleteSession, language)
                        }
                        className="shrink-0 rounded-lg p-2 text-haze transition-colors hover:bg-blood/15 hover:text-blood-bright focus-visible:outline-2 focus-visible:outline-blood-bright disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                    {isRenaming && (
                      <form
                        className="flex gap-2 border-t border-gold-dim/30 bg-gold/5 px-4 py-3 max-sm:flex-col"
                        onSubmit={(event) => {
                          event.preventDefault();
                          renameSelectedSession();
                        }}
                      >
                        <label className="sr-only" htmlFor={`session-name-${session.id}`}>
                          {t(texts.sessionName, language)}
                        </label>
                        <input
                          id={`session-name-${session.id}`}
                          autoFocus
                          value={renameValue}
                          onChange={(event) => setRenameValue(event.target.value)}
                          className="min-w-0 flex-1 rounded-md border border-edge bg-field px-3 py-1.5 text-sm text-bone focus:border-gold-dim focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSessionToRename(null);
                            setRenameValue("");
                          }}
                          className="rounded-md border border-edge px-3 py-1.5 text-xs text-mist hover:text-bone"
                        >
                          {t(texts.cancel, language)}
                        </button>
                        <button
                          type="submit"
                          disabled={!renameValue.trim()}
                          className="rounded-md border border-gold-dim bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/15 disabled:opacity-40"
                        >
                          {t(texts.saveName, language)}
                        </button>
                      </form>
                    )}
                    {isConfirmingDelete && (
                      <div
                        role="group"
                        aria-label={`${t(texts.deleteSession, language)}: ${session.name}`}
                        className="border-t border-blood/35 bg-blood/10 px-4 py-3"
                      >
                        <p className="text-sm leading-snug text-bone">
                          {t(texts.deleteConfirmation, language)}
                        </p>
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={busy !== null}
                            onClick={() => setSessionToDelete(null)}
                            className="rounded-md border border-edge px-3 py-1.5 text-xs text-mist hover:text-bone disabled:opacity-50"
                          >
                            {t(texts.cancel, language)}
                          </button>
                          <button
                            type="button"
                            disabled={busy !== null}
                            onClick={() => void deleteSelectedSession()}
                            className="flex items-center gap-1.5 rounded-md border border-blood/70 bg-blood/20 px-3 py-1.5 text-xs font-semibold text-blood-bright hover:bg-blood/30 disabled:opacity-50"
                          >
                            <TrashIcon />
                            {t(texts.delete, language)}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <form
            className="mt-6 flex gap-2 border-t border-edge pt-5 max-sm:flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              try {
                onCreate(newName.trim() || t(texts.newSession, language));
                setNewName("");
                setMessage(null);
              } catch {
                setMessage({
                  tone: "error",
                  text: t(texts.createError, language),
                });
              }
            }}
          >
            <label className="sr-only" htmlFor="new-session-name">
              {t(texts.newName, language)}
            </label>
            <input
              id="new-session-name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder={t(texts.newPlaceholder, language)}
              className="min-w-0 flex-1 rounded-lg border border-edge bg-field px-3 py-2 text-sm text-bone placeholder:text-haze focus:border-gold-dim focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy !== null}
              className="flex items-center justify-center gap-2 rounded-lg border border-gold-dim bg-gold/10 px-4 py-2 font-display text-xs font-semibold tracking-wide text-gold uppercase transition-colors hover:bg-gold/15 disabled:opacity-50"
            >
              <PlusIcon /> {t(texts.newSession, language)}
            </button>
          </form>

          {message && (
            <p
              role="status"
              className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
                message.tone === "success"
                  ? "border-emerald-700/60 bg-emerald-950/30 text-emerald-300"
                  : "border-blood/60 bg-blood/15 text-blood-bright"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-edge bg-ink/55 px-6 py-4">
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            tabIndex={-1}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importFile(file);
            }}
          />
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-edge bg-field px-4 py-2 font-display text-xs font-semibold tracking-wide text-mist uppercase transition-colors hover:border-gold-dim hover:text-bone disabled:opacity-50"
          >
            <UploadIcon />
            {busy === "import"
              ? t(texts.importing, language)
              : t(texts.import, language)}
          </button>
          <button
            type="button"
            disabled={busy !== null || !activeSessionId}
            onClick={() => void download()}
            className="flex items-center gap-2 rounded-lg border border-gold-dim bg-gold/10 px-4 py-2 font-display text-xs font-semibold tracking-wide text-gold uppercase transition-colors hover:bg-gold/15 disabled:opacity-50"
          >
            <DownloadIcon />
            {busy === "export"
              ? t(texts.exporting, language)
              : t(texts.export, language)}
          </button>
        </footer>
      </section>
    </div>
  );
}
