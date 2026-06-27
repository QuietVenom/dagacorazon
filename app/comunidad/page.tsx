import { t, ui } from "@/lib/i18n-core";
import { getCurrentLanguage } from "@/lib/i18n-server";
import { CommunityIcon } from "@/components/icons";

const texts = {
  title: { es: "La Comunidad", pt: "A Comunidade" },
  subtitle: {
    es: "La biblioteca compartida de homebrew LATAM: adversarios, entornos y equipo creados por la comunidad, listos para usar en tu mesa.",
    pt: "A biblioteca compartilhada de homebrew LATAM: adversários, ambientes e equipamentos criados pela comunidade, prontos para usar na sua mesa.",
  },
  inProgress: {
    es: "Estamos construyendo esta sección. Cuando esté lista podrás publicar tus creaciones, explorar las de otras personas y llevarlas directo a tu Taller o tu Mesa.",
    pt: "Estamos construindo esta seção. Quando estiver pronta você poderá publicar suas criações, explorar as de outras pessoas e levá-las direto para sua Oficina ou sua Mesa.",
  },
};

export default async function CommunityPage() {
  const language = await getCurrentLanguage();

  return (
    <main className="animate-fade-in mx-auto max-w-3xl px-5 py-20 text-center">
      <span className="mb-6 inline-flex rounded-2xl bg-gold/10 p-5 text-gold">
        <CommunityIcon size={36} />
      </span>
      <h1 className="font-display text-3xl font-semibold">{t(texts.title, language)}</h1>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-mist">
        {t(texts.subtitle, language)}
      </p>
      <div className="mx-auto mt-10 max-w-lg rounded-card border border-dashed border-gold-dim/50 bg-card/60 p-8">
        <p className="font-display text-sm font-semibold tracking-widest text-gold uppercase">
          {t(ui.comingSoon, language)}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-mist">{t(texts.inProgress, language)}</p>
      </div>
    </main>
  );
}
