import { Geist_Mono, Noto_Sans } from "next/font/google";

import "./globals.css";
import { AppProviders } from "app/providers";
import { cn } from "shared/lib/utils";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        notoSans.variable,
      )}
    >
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
