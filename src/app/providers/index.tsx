"use client";

import type { PreloadedStoreState } from "shared/lib/store/store";
import { Toaster } from "shared/ui/toaster";

import { QueryProvider } from "./query-provider";
import { StoreProvider } from "./store-provider";
import { ThemeProvider } from "./theme-provider";

function AppProviders({
  children,
  defaultTheme,
  preloadedState,
}: Readonly<{
  children: React.ReactNode;
  defaultTheme: "light" | "dark";
  preloadedState: PreloadedStoreState;
}>) {
  return (
    <StoreProvider preloadedState={preloadedState}>
      <QueryProvider>
        <ThemeProvider defaultTheme={defaultTheme}>
          {children}
          <Toaster />
        </ThemeProvider>
      </QueryProvider>
    </StoreProvider>
  );
}

export { AppProviders };
