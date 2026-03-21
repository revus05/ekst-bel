const LOCALE_COOKIE_NAME = "locale";
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type AppLocale = "ru" | "en";

const DEFAULT_LOCALE: AppLocale = "ru";

export type { AppLocale };
export { DEFAULT_LOCALE, LOCALE_COOKIE_MAX_AGE, LOCALE_COOKIE_NAME };
