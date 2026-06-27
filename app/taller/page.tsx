import { t } from "@/lib/i18n-core";
import { getCurrentLanguage } from "@/lib/i18n-server";
import { WorkshopGrid } from "@/components/workshop-grid";

const texts = {
  title: { es: "El Taller", pt: "A Oficina" },
  subtitle: {
    es: "Aquí se planea la campaña: elige qué quieres crear. Todo lo que guardes queda en tu colección y estará disponible en la Mesa.",
    pt: "Aqui se planeja a campanha: escolha o que quer criar. Tudo o que salvar fica na sua coleção e estará disponível na Mesa.",
  },
  localNotice: {
    es: "Por ahora tus creaciones se guardan en este navegador. Pronto: cuenta con Google Auth y respaldo en la nube.",
    pt: "Por enquanto suas criações ficam neste navegador. Em breve: conta com Google e backup na nuvem.",
  },
};

export default async function WorkshopPage() {
  const language = await getCurrentLanguage();

  return (
    <main className="animate-fade-in mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-display text-3xl font-semibold">{t(texts.title, language)}</h1>
      <p className="mt-2 mb-4 max-w-2xl text-[15px] leading-relaxed text-mist">
        {t(texts.subtitle, language)}
      </p>
      <p className="mb-8 inline-block rounded-lg border border-gold-dim/30 bg-gold/5 px-4 py-2.5 text-[13px] text-mist">
        ⚠ {t(texts.localNotice, language)}
      </p>

      <WorkshopGrid language={language} />
    </main>
  );
}
