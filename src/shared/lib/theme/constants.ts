const THEME_COOKIE_NAME = "theme";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type ThemeMode = "light" | "dark";

const DEFAULT_THEME: ThemeMode = "light";

export type { ThemeMode };
export { DEFAULT_THEME, THEME_COOKIE_MAX_AGE, THEME_COOKIE_NAME };
