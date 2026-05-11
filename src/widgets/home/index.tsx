"use client";

import { useLocale } from "app/providers/locale-provider";
import type { FC } from "react";
import { getMessages } from "shared/lib/i18n/messages";

export const HeroSection: FC = () => {
  const { locale } = useLocale();
  const t = getMessages(locale);

  return (
    <section className="grid gap-3">
      <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.18em]">
        {t.common.supportDashboard}
      </p>
      <div className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.home.title}
        </h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base">
          {t.home.description}
        </p>
      </div>
    </section>
  );
};
