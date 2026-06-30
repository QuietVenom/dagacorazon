import Image from "next/image";
import type { Metadata } from "next";
import { t } from "@/lib/i18n-core";
import { getCurrentLanguage } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Acerca de — Dagacorazón",
};

const texts = {
  aboutTitle: { es: "Acerca de Dagacorazón", pt: "Sobre o Dagacorazón" },

  // Legal SRD
  legalTitle: { es: "Aviso legal", pt: "Aviso legal" },
  copyrightTitle: { es: "Derechos de autor", pt: "Direitos autorais" },
  copyrightBody: {
    es: "Este sitio incluye materiales del Daggerheart System Reference Document 1.0, © Critical Role, LLC. Todos los derechos reservados.",
    pt: "Este site inclui materiais do Daggerheart System Reference Document 1.0, © Critical Role, LLC. Todos os direitos reservados.",
  },
  attributionTitle: { es: "Atribución", pt: "Atribuição" },
  attributionBody: {
    es: "Contenido público del juego creado y propiedad de Darrington Press, LLC. Disponible en",
    pt: "Conteúdo público do jogo criado e de propriedade da Darrington Press, LLC. Disponível em",
  },
  licenseTitle: { es: "Licencia", pt: "Licença" },
  licenseBody: {
    es: "Licenciado bajo la Darrington Press Community Gaming License:",
    pt: "Licenciado sob a Darrington Press Community Gaming License:",
  },
  modificationsTitle: { es: "Modificaciones", pt: "Modificações" },
  modificationsBody: {
    es: "Los bloques de estadísticas pueden tener ediciones menores para corregir errores evidentes.",
    pt: "Os blocos de estatísticas podem ter edições menores para corrigir erros óbvios.",
  },

  // About project
  projectTitle: { es: "El proyecto", pt: "O projeto" },
  projectDescription: {
    es: "Dagacorazón es una herramienta de juego y creación de homebrew para Daggerheart, enfocada en las comunidades hispanohablante y lusohablante de LATAM. Permite crear, compartir y usar adversarios, colosos, entornos y equipamiento directamente en la mesa de juego.",
    pt: "O Dagacorazón é uma ferramenta de jogo e criação de homebrew para Daggerheart, voltada para as comunidades hispano e lusófonas da LATAM. Permite criar, compartilhar e usar adversários, colossos, ambientes e equipamentos diretamente na mesa de jogo.",
  },
  techTitle: { es: "Tecnología", pt: "Tecnologia" },
  techBody: {
    es: "Construido con Next.js, TypeScript, Tailwind CSS y Cannon.js para la física de dados. Autenticación vía Auth.js.",
    pt: "Construído com Next.js, TypeScript, Tailwind CSS e Cannon.js para a física dos dados. Autenticação via Auth.js.",
  },
  creatorTitle: { es: "Creador", pt: "Criador" },
  creatorBody: {
    es: "Hecho por Izcoatl Avila Marcos. Para cualquier duda o contacto:",
    pt: "Feito por Izcoatl Avila Marcos. Para dúvidas ou contato:",
  },
  poweredBy: { es: "Impulsado por", pt: "Desenvolvido com" },
};

export default async function AboutPage() {
  const language = await getCurrentLanguage();

  return (
    <main className="mx-auto max-w-2xl px-5 py-16 space-y-16">

      {/* ── Legal SRD ── */}
      <section className="space-y-8">
        <h1 className="font-display text-2xl font-bold text-bone tracking-wide uppercase">
          {t(texts.legalTitle, language)}
        </h1>

        <div className="rounded-card border border-edge bg-card p-8 space-y-6 text-[15px] leading-relaxed text-mist">

          <div className="space-y-1">
            <h2 className="font-display text-xs font-bold tracking-[0.15em] uppercase text-gold">
              {t(texts.copyrightTitle, language)}
            </h2>
            <p>{t(texts.copyrightBody, language)}</p>
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-xs font-bold tracking-[0.15em] uppercase text-gold">
              {t(texts.attributionTitle, language)}
            </h2>
            <p>
              {t(texts.attributionBody, language)}{" "}
              <a
                href="https://www.daggerheart.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-bright underline hover:text-gold transition-colors"
              >
                daggerheart.com
              </a>
              .
            </p>
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-xs font-bold tracking-[0.15em] uppercase text-gold">
              {t(texts.licenseTitle, language)}
            </h2>
            <p>
              {t(texts.licenseBody, language)}{" "}
              <a
                href="https://darringtonpress.com/license/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-bright underline hover:text-gold transition-colors"
              >
                darringtonpress.com/license
              </a>
              .
            </p>
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-xs font-bold tracking-[0.15em] uppercase text-gold">
              {t(texts.modificationsTitle, language)}
            </h2>
            <p>{t(texts.modificationsBody, language)}</p>
          </div>
        </div>

        {/* Daggerheart Compatible badge */}
        <div className="flex justify-center pt-2">
          <Image
            src="/marca/daggerheart-compatible.png"
            alt="Daggerheart Compatible"
            width={200}
            height={200}
            className="opacity-90"
          />
        </div>
      </section>

      {/* ── About the project ── */}
      <section className="space-y-8">
        <h1 className="font-display text-2xl font-bold text-bone tracking-wide uppercase">
          {t(texts.projectTitle, language)}
        </h1>

        <div className="rounded-card border border-edge bg-card p-8 space-y-6 text-[15px] leading-relaxed text-mist">

          <p>{t(texts.projectDescription, language)}</p>

          <div className="space-y-1">
            <h2 className="font-display text-xs font-bold tracking-[0.15em] uppercase text-gold">
              {t(texts.techTitle, language)}
            </h2>
            <p>{t(texts.techBody, language)}</p>
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-xs font-bold tracking-[0.15em] uppercase text-gold">
              {t(texts.creatorTitle, language)}
            </h2>
            <p>
              {t(texts.creatorBody, language)}{" "}
              <a
                href="mailto:admin@kiizama.com"
                className="text-gold-bright underline hover:text-gold transition-colors"
              >
                admin@kiizama.com
              </a>
            </p>
          </div>
        </div>

        {/* Powered by Kiizama */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <span className="font-display text-xs font-semibold tracking-[0.15em] uppercase text-haze">
            {t(texts.poweredBy, language)}
          </span>
          <Image
            src="/marca/kiizama.png"
            alt="Kiizama"
            width={160}
            height={60}
            className="opacity-80"
          />
        </div>
      </section>

    </main>
  );
}
