import { cookies } from "next/headers";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE_KEY,
  htmlLang,
  isLanguage,
  type Language,
} from "@/lib/i18n-core";

export async function getCurrentLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LANGUAGE_COOKIE_KEY)?.value;
  return isLanguage(value) ? value : DEFAULT_LANGUAGE;
}

export async function getCurrentHtmlLang() {
  return htmlLang(await getCurrentLanguage());
}
