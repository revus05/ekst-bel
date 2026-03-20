"use client";

import { ThemeProvider } from "./theme-provider";

function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

export { AppProviders };
