"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import * as React from "react";

import { useAppDispatch } from "shared/lib/store/hooks";
import {
  THEME_COOKIE_MAX_AGE,
  THEME_COOKIE_NAME,
  type ThemeMode,
} from "shared/lib/theme/constants";
import { setTheme } from "shared/model/theme/theme-slice";

function ThemeProvider({
  children,
  defaultTheme = "light",
  ...props
}: React.ComponentProps<typeof NextThemesProvider> & {
  defaultTheme?: ThemeMode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={false}
      storageKey={THEME_COOKIE_NAME}
      disableTransitionOnChange
      {...props}
    >
      <ThemeSync />
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  );
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

function ThemeSync() {
  const dispatch = useAppDispatch();
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    if (resolvedTheme !== "dark" && resolvedTheme !== "light") {
      return;
    }

    dispatch(setTheme(resolvedTheme));
    // biome-ignore lint/suspicious/noDocumentCookie: theme cookie is required for server-side preloaded theme and FOUC prevention
    document.cookie = `${THEME_COOKIE_NAME}=${resolvedTheme}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
  }, [dispatch, resolvedTheme]);

  return null;
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme();

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key.toLowerCase() !== "d") {
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [resolvedTheme, setTheme]);

  return null;
}

export { ThemeProvider };
