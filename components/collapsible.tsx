"use client";

import { useState, type ReactNode } from "react";
import { ChevronIcon } from "@/components/icons";

/** Disclosure section with a chevron header. Uncontrolled open state. */
export function Collapsible({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 py-1 font-display text-[11px] font-semibold tracking-[0.2em] text-haze uppercase transition-colors hover:text-mist"
      >
        <span>
          {title}
          {count != null && count > 0 && <span className="ml-1.5 text-gold">{count}</span>}
        </span>
        <ChevronIcon open={open} size={14} />
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}
