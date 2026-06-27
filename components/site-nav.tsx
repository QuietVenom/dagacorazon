"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { GiHammerDrop } from "react-icons/gi";
import { t, ui, useLanguage, type Language } from "@/lib/i18n";
import {
  CommunityIcon,
  LogoIcon,
  MapIcon,
} from "@/components/icons";

const sections: {
  pathname: Route;
  label: typeof ui.workshop;
  Icon: ComponentType<{ size?: number }>;
}[] = [
  { pathname: "/taller", label: ui.workshop, Icon: GiHammerDrop },
  { pathname: "/mesa", label: ui.table, Icon: MapIcon },
  { pathname: "/comunidad", label: ui.community, Icon: CommunityIcon },
];

export function SiteNav() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-edge bg-abyss/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-display text-sm font-bold tracking-[0.15em] text-gold"
        >
          <LogoIcon size={24} />
          <span className="max-sm:hidden">DAGACORAZÓN</span>
        </Link>

        <div className="flex items-center gap-0.5 rounded-lg bg-white/3 p-1 sm:gap-1">
          {sections.map(({ pathname: p, label, Icon }) => {
            const isActive = pathname === p || pathname.startsWith(p + "/");
            return (
              <Link
                key={p}
                href={p}
                aria-current={isActive ? "page" : undefined}
                aria-label={t(label, language)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-2 font-display text-[11px] font-semibold tracking-wider uppercase transition-colors sm:px-3 sm:py-1.5 ${
                  isActive
                    ? "bg-gold text-abyss"
                    : "text-mist hover:bg-white/5 hover:text-bone active:bg-white/10"
                }`}
              >
                <Icon size={16} />
                <span className="max-sm:hidden">{t(label, language)}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="flex rounded-md border border-edge text-[11px] font-semibold"
            role="group"
            aria-label="Language"
          >
            {(["es", "pt"] as Language[]).map((i) => (
              <button
                key={i}
                onClick={() => setLanguage(i)}
                aria-pressed={language === i}
                className={`px-2.5 py-1.5 uppercase transition-colors first:rounded-l-md last:rounded-r-md ${
                  language === i
                    ? "bg-gold-dim/30 text-gold-bright"
                    : "text-haze hover:text-mist active:text-bone"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          <Link
            href="/entrar"
            className="shrink-0 rounded-md border border-gold-dim/60 px-2.5 py-2 font-display text-[11px] font-semibold tracking-wider text-gold uppercase transition-colors hover:bg-gold/10 active:bg-gold/15 sm:px-3 sm:py-1.5"
          >
            {t(ui.signIn, language)}
          </Link>
        </div>
      </nav>
    </header>
  );
}
