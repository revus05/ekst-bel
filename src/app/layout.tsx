import { Geist_Mono, Noto_Sans } from "next/font/google";
import { cookies } from "next/headers";

import "./globals.css";
import { AppProviders } from "app/providers";
import { getCurrentUserFromCookies } from "shared/lib/auth/get-current-user";
import { getThemeFromCookies } from "shared/lib/theme/server";
import { cn } from "shared/lib/utils";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = getThemeFromCookies(cookieStore);
  const user = await getCurrentUserFromCookies(cookieStore);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        theme === "dark" && "dark",
        fontMono.variable,
        "font-sans",
        notoSans.variable,
      )}
    >
      <body>
        <AppProviders
          defaultTheme={theme}
          preloadedState={{
            theme: { value: theme },
            user: { currentUser: user },
          }}
        >
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
