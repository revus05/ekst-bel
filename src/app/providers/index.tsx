"use client";

import type { PreloadedStoreState } from "shared/lib/store/store";
import { Toaster } from "shared/ui/toaster";

import { LocaleProvider } from "./locale-provider";
import { QueryProvider } from "./query-provider";
import { StoreProvider } from "./store-provider";
import { ThemeProvider } from "./theme-provider";

function AppProviders({
  children,
  defaultTheme,
  defaultLocale,
  preloadedState,
}: Readonly<{
  children: React.ReactNode;
  defaultTheme: "light" | "dark";
  defaultLocale: "ru" | "en";
  preloadedState: PreloadedStoreState;
}>) {
  return (
    <StoreProvider preloadedState={preloadedState}>
      <QueryProvider>
        <LocaleProvider defaultLocale={defaultLocale}>
          <ThemeProvider defaultTheme={defaultTheme}>
            {children}
            <Toaster />
          </ThemeProvider>
        </LocaleProvider>
      </QueryProvider>
    </StoreProvider>
  );
}

export { AppProviders };
