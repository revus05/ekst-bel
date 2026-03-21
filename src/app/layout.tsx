import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans } from "next/font/google";
import { cookies } from "next/headers";

import "./globals.css";
import { AppProviders } from "app/providers";
import { getCurrentUserFromCookies } from "shared/lib/auth/get-current-user";
import { getLocaleFromCookies } from "shared/lib/locale/server";
import { getThemeFromCookies } from "shared/lib/theme/server";
import { cn } from "shared/lib/utils";
import { CosmicBackground } from "shared/ui/cosmic-background";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "EKST Support",
  description:
    "Приложение клиентской поддержки для отправки отзывов, баг-репортов и предложений по продуктам компании.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = getThemeFromCookies(cookieStore);
  const locale = getLocaleFromCookies(cookieStore);
  const user = await getCurrentUserFromCookies(cookieStore);

  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        theme === "dark" && "dark",
        fontMono.variable,
        "font-sans",
        notoSans.variable,
      )}
    >
      <body className="relative isolate min-h-svh bg-background text-foreground">
        <div className="dark:block hidden">
          <CosmicBackground />
        </div>
        <AppProviders
          defaultLocale={locale}
          defaultTheme={theme}
          preloadedState={{
            theme: { value: theme },
            user: { currentUser: user },
          }}
        >
          <div className="relative min-h-svh">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
