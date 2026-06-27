import { t } from "@/lib/i18n-core";
import { getCurrentLanguage } from "@/lib/i18n-server";
import { LogoIcon } from "@/components/icons";
import { SignInButton } from "@/components/sign-in-button";

const texts = {
  title: { es: "Entra a Dagacorazón", pt: "Entre no Dagacorazón" },
  subtitle: {
    es: "Con tu cuenta podrás guardar creaciones en la nube, sincronizarlas entre dispositivos y compartirlas con la comunidad.",
    pt: "Com sua conta você poderá salvar criações na nuvem, sincronizá-las entre dispositivos e compartilhá-las com a comunidade.",
  },
  google: { es: "Continuar con Google", pt: "Continuar com o Google" },
  beta: {
    es: "El acceso está en construcción: por ahora puedes usar todo el Taller y la Mesa sin cuenta.",
    pt: "O acesso está em construção: por enquanto você pode usar toda a Oficina e a Mesa sem conta.",
  },
};

export default async function SignInPage() {
  const language = await getCurrentLanguage();

  return (
    <main className="animate-fade-in mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
      <span className="mb-6 text-gold">
        <LogoIcon size={56} />
      </span>
      <h1 className="font-display text-2xl font-semibold">{t(texts.title, language)}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-mist">{t(texts.subtitle, language)}</p>

      <SignInButton label={t(texts.google, language)} />

      <p className="mt-6 rounded-lg border border-gold-dim/30 bg-gold/5 px-4 py-2.5 text-[13px] text-mist">
        ⚠ {t(texts.beta, language)}
      </p>
    </main>
  );
}
