import "server-only";

import {
  DEFAULT_THEME,
  THEME_COOKIE_NAME,
  type ThemeMode,
} from "shared/lib/theme/constants";

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

function normalizeTheme(theme: string | null | undefined): ThemeMode {
  return theme === "dark" ? "dark" : DEFAULT_THEME;
}

function getThemeFromCookies(cookieStore: CookieReader): ThemeMode {
  return normalizeTheme(cookieStore.get(THEME_COOKIE_NAME)?.value);
}

export { getThemeFromCookies, normalizeTheme };
