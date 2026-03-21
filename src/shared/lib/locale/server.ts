import "server-only";

import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

import {
  type AppLocale,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
} from "./constants";

function normalizeLocale(locale: string | null | undefined): AppLocale {
  return locale === "en" ? "en" : DEFAULT_LOCALE;
}

function getLocaleFromCookies(cookieStore: ReadonlyRequestCookies): AppLocale {
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

export { getLocaleFromCookies, normalizeLocale };
