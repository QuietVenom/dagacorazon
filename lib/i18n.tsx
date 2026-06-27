"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE_KEY,
  LEGACY_LANGUAGE_STORAGE_KEY,
  htmlLang,
  isLanguage,
  type Language,
} from "@/lib/i18n-core";

export { t, ui, type Language, type LocalizedText } from "@/lib/i18n-core";

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (l: Language) => void;
}>({ language: DEFAULT_LANGUAGE, setLanguage: () => {} });

function writeLanguageCookie(language: Language) {
  document.cookie = `${LANGUAGE_COOKIE_KEY}=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialLanguage: Language;
}) {
  const router = useRouter();
  const [language, setLanguageState] = useState(initialLanguage);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    writeLanguageCookie(next);
    localStorage.setItem(LEGACY_LANGUAGE_STORAGE_KEY, JSON.stringify(next));
    router.refresh();
  }, [router]);

  useEffect(() => {
    const legacyRaw = localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY);
    if (!legacyRaw) {
      writeLanguageCookie(initialLanguage);
      return;
    }

    try {
      const legacy = JSON.parse(legacyRaw);
      if (isLanguage(legacy) && legacy !== initialLanguage) {
        writeLanguageCookie(legacy);
        queueMicrotask(() => {
          setLanguageState(legacy);
          router.refresh();
        });
      } else {
        writeLanguageCookie(initialLanguage);
      }
    } catch {
      writeLanguageCookie(initialLanguage);
    }
  }, [initialLanguage, router]);

  useEffect(() => {
    document.documentElement.lang = htmlLang(language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
