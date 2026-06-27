"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaInfoCircle, FaQuestion } from "react-icons/fa";
import { t, useLanguage, type LocalizedText } from "@/lib/i18n";

const texts = {
  info: { es: "Información", pt: "Informação" },
  close: { es: "Cerrar", pt: "Fechar" },
  pickFirst: {
    es: "Elige una opción para ver su explicación.",
    pt: "Escolha uma opção para ver sua explicação.",
  },
} satisfies Record<string, LocalizedText>;

/**
 * Info button (ⓘ) that opens a dialog rendering a Markdown guide. Used per
 * Workshop module to surface the SRD reference content.
 */
export function InfoModal({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${t(texts.info, language)}: ${title}`}
        title={t(texts.info, language)}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-edge text-gold transition-colors hover:border-gold-dim hover:bg-gold/10 active:bg-gold/15"
      >
        <FaInfoCircle size={16} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] grid place-items-end p-0 sm:place-items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="pb-safe relative flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-gold-dim/40 bg-card shadow-2xl shadow-black/70 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-edge bg-ink/60 px-4 py-3">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold tracking-wider text-gold uppercase">
                <FaInfoCircle size={15} /> {title}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t(texts.close, language)}
                className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-mist transition-colors hover:bg-white/5 hover:text-bone"
              >
                ✕
              </button>
            </div>
            <div className="info-prose overflow-y-auto px-5 py-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Small help button (?) shown next to a select. Opens a popover with the
 * directed explanation for the currently selected value.
 */
export function ValueHelp({
  label,
  explanation,
}: {
  /** Field label, shown as the popover header. */
  label: string;
  /** Localized explanation for the current value, or undefined when none. */
  explanation?: string;
}) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={label}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold-dim/60 text-[10px] text-gold transition-colors hover:bg-gold/10 active:bg-gold/15"
      >
        <FaQuestion size={9} />
      </button>

      {open && (
        <>
          <span
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <span
            role="dialog"
            aria-label={label}
            className="absolute top-full right-0 z-50 mt-2 block w-[min(20rem,78vw)] rounded-lg border border-gold-dim/40 bg-card p-3 text-left shadow-2xl shadow-black/60"
          >
            <span className="mb-1 block font-display text-[11px] font-semibold tracking-wider text-gold uppercase">
              {label}
            </span>
            <span className="block text-[13px] leading-relaxed text-mist">
              {explanation ?? t(texts.pickFirst, language)}
            </span>
          </span>
        </>
      )}
    </span>
  );
}
