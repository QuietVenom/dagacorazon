import { Fragment } from "react";
import type { ComponentType } from "react";
import type { Route } from "next";
import Link from "next/link";
import { GiHammerDrop } from "react-icons/gi";
import { t } from "@/lib/i18n-core";
import { getCurrentLanguage } from "@/lib/i18n-server";
import { CommunityIcon, LogoIcon, MapIcon } from "@/components/icons";

const texts = {
  tagline: {
    es: "Forja tu propio mundo",
    pt: "Forje seu próprio mundo",
  },
  subtitle: {
    es: "Planea en el Taller, juega en la Mesa y próximamente comparte con toda la comunidad LATAM.",
    pt: "Planeje na Oficina, jogue na Mesa e em breve compartilhe com toda a comunidade LATAM.",
  },
  workshopTitle: { es: "El Taller", pt: "A Oficina" },
  workshopDesc: {
    es: "Tu espacio de planeación y creación: diseña cada pieza de tu campaña con vista previa en vivo.",
    pt: "Seu espaço de planejamento e criação: projete cada peça da sua campanha com pré-visualização ao vivo.",
  },
  tableTitle: { es: "La Mesa", pt: "A Mesa" },
  tableDesc: {
    es: "Donde la planeación cobra vida: un lienzo libre con tokens, imágenes y tus creaciones listas para el encuentro.",
    pt: "Onde o planejamento ganha vida: uma tela livre com tokens, imagens e suas criações prontas para o encontro.",
  },
  communityTitle: { es: "La Comunidad", pt: "A Comunidade" },
  communityDesc: {
    es: "Una biblioteca compartida de contenido casero: usa lo que otros crearon y aporta lo tuyo.",
    pt: "Uma biblioteca compartilhada de conteúdo caseiro: use o que outros criaram e contribua com o seu.",
  },
  enter: { es: "Entrar", pt: "Entrar" },
  disclaimer: {
    es: "Proyecto comunitario sin afiliación con Darrington Press. Daggerheart™ es propiedad de sus autores.",
    pt: "Projeto comunitário sem afiliação com a Darrington Press. Daggerheart™ é propriedade de seus autores.",
  },
};

const doors: {
  path: Route;
  title: typeof texts.workshopTitle;
  desc: typeof texts.workshopDesc;
  Icon: ComponentType<{ size?: number }>;
}[] = [
  { path: "/taller", title: texts.workshopTitle, desc: texts.workshopDesc, Icon: GiHammerDrop },
  { path: "/mesa", title: texts.tableTitle, desc: texts.tableDesc, Icon: MapIcon },
  { path: "/comunidad", title: texts.communityTitle, desc: texts.communityDesc, Icon: CommunityIcon },
];

export default async function HomePage() {
  const language = await getCurrentLanguage();

  return (
    <main className="animate-fade-in mx-auto max-w-5xl px-5 pt-20 pb-24 text-center">
      <div className="mb-6 inline-flex text-gold">
        <LogoIcon size={72} />
      </div>
      <h1 className="mx-auto max-w-3xl font-display text-4xl leading-tight font-bold text-bone sm:text-5xl">
        {t(texts.tagline, language)}
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-mist">
        {t(texts.subtitle, language)}
      </p>

      <div className="mt-14 grid gap-5 text-left sm:grid-cols-3">
        {doors.map(({ path, title, desc, Icon }) => (
          <Link
            key={path}
            href={path}
            className="group relative overflow-hidden rounded-card border border-edge bg-card p-6 transition-all before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-gold before:to-transparent before:opacity-0 before:transition-opacity hover:-translate-y-1 hover:border-gold-dim hover:shadow-xl hover:shadow-black/40 hover:before:opacity-100 focus-visible:border-gold-dim focus-visible:before:opacity-100 active:border-gold-dim active:before:opacity-100"
          >
            <span className="mb-4 inline-flex rounded-lg bg-gold/10 p-3 text-gold">
              <Icon size={22} />
            </span>
            <h2 className="font-display text-lg font-semibold text-bone">
              {t(title, language)}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-mist">{t(desc, language)}</p>
            <span className="mt-4 inline-block font-display text-[11px] font-semibold tracking-widest text-gold uppercase">
              {t(texts.enter, language)} →
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-20 text-xs text-haze italic">
        {t(texts.disclaimer, language)
          .split("™")
          .map((part, i, parts) => (
            <Fragment key={i}>
              {part}
              {i < parts.length - 1 && (
                <sup className="align-super text-[0.6em]">™</sup>
              )}
            </Fragment>
          ))}
      </p>
    </main>
  );
}
