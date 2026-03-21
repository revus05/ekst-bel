"use client";

import * as React from "react";

import {
  type AppLocale,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
} from "shared/lib/locale/constants";

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

function LocaleProvider({
  children,
  defaultLocale = DEFAULT_LOCALE,
}: Readonly<{
  children: React.ReactNode;
  defaultLocale?: AppLocale;
}>) {
  const [locale, setLocaleState] = React.useState<AppLocale>(defaultLocale);

  const setLocale = React.useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
    document.documentElement.lang = nextLocale;
    // biome-ignore lint/suspicious/noDocumentCookie: locale persistence is required for user settings
    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = React.useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

function useLocale() {
  const context = React.useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider.");
  }

  return context;
}

export { LocaleProvider, useLocale };
