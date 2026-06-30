"use client";

import Link from "next/link";
import type { Route } from "next";
import { t, ui, useLanguage } from "@/lib/i18n";

export function SiteFooter() {
  const { language } = useLanguage();

  return (
    <footer className="border-t border-edge bg-abyss/60 py-5 text-center">
      <Link
        href={"/about" as Route}
        className="font-display text-[11px] font-semibold tracking-widest uppercase text-haze transition-colors hover:text-mist"
      >
        {t(ui.about, language)}
      </Link>
    </footer>
  );
}
