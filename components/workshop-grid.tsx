"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo } from "react";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { t, ui, type Language } from "@/lib/i18n";
import { schemas } from "@/lib/creators";
import { useBrews } from "@/lib/storage";
import { DragonIcon, GemIcon, MountainIcon, SwordIcon } from "@/components/icons";

const icons = {
  sword: SwordIcon,
  dragon: DragonIcon,
  mountain: MountainIcon,
  gem: GemIcon,
};

const texts = {
  items: { es: "elementos", pt: "itens" },
  item: { es: "elemento", pt: "item" },
  resourcesTitle: { es: "Recursos", pt: "Recursos" },
  resourcesDesc: {
    es: "Importa y exporta tus creaciones y lienzos, o descarga plantillas vacías.",
    pt: "Importe e exporte suas criações e lienzos, ou baixe modelos vazios.",
  },
  resourcesTag: { es: "importar / exportar", pt: "importar / exportar" },
};

export function WorkshopGrid({ language }: { language: Language }) {
  const { brews } = useBrews();
  const counts = useMemo(
    () =>
      brews.reduce<Record<string, number>>((acc, b) => {
        acc[b.type] = (acc[b.type] ?? 0) + 1;
        return acc;
      }, {}),
    [brews],
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {schemas.map((e) => {
        const Icon = icons[e.icon];
        const n = counts[e.id] ?? 0;
        return (
          <Link
            key={e.id}
            href={`/taller/${e.slug}` as Route}
            className="group relative overflow-hidden rounded-card border border-edge bg-card p-6 transition-all before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 before:transition-opacity hover:-translate-y-0.5 hover:border-gold-dim hover:before:opacity-100 focus-visible:border-gold-dim focus-visible:before:opacity-100 active:border-gold-dim active:before:opacity-100"
          >
            <div className="flex items-start justify-between">
              <span className="mb-3 inline-flex rounded-lg bg-gold/10 p-2.5 text-gold">
                <Icon size={20} />
              </span>
              <span className="font-mono text-xs text-haze">
                {n > 0
                  ? `${n} ${t(n === 1 ? texts.item : texts.items, language)}`
                  : t(ui.noItems, language)}
              </span>
            </div>
            <h2 className="font-display text-lg font-semibold text-bone">
              {t(e.title, language)}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-mist">
              {t(e.subtitle, language)}
            </p>
          </Link>
        );
      })}

      <Link
        href="/taller/recursos"
        className="group relative overflow-hidden rounded-card border border-edge bg-card p-6 transition-all before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 before:transition-opacity hover:-translate-y-0.5 hover:border-gold-dim hover:before:opacity-100 focus-visible:border-gold-dim focus-visible:before:opacity-100 active:border-gold-dim active:before:opacity-100 sm:col-span-2"
      >
        <div className="flex items-start justify-between">
          <span className="mb-3 inline-flex rounded-lg bg-gold/10 p-2.5 text-gold">
            <FaArrowRightArrowLeft size={18} />
          </span>
          <span className="font-mono text-xs text-haze">
            {t(texts.resourcesTag, language)}
          </span>
        </div>
        <h2 className="font-display text-lg font-semibold text-bone">
          {t(texts.resourcesTitle, language)}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-mist">
          {t(texts.resourcesDesc, language)}
        </p>
      </Link>
    </div>
  );
}
