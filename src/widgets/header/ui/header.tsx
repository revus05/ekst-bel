"use client";

import { useAuth } from "features/auth/model/use-auth";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "shared/lib/utils";
import { Button } from "shared/ui/button";

type HeaderProps = {
  className?: string;
};

function Header({ className }: HeaderProps) {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMenuOpen]);

  const navigation = (
    <>
      <Button variant="ghost" asChild>
        <Link href="/">Главная</Link>
      </Button>
      {user?.role === "ADMIN" ? (
        <>
          <Button variant="ghost" asChild>
            <Link href="/admin/feedback">Обращения</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/admin/products/new">Добавить продукт</Link>
          </Button>
        </>
      ) : null}
    </>
  );

  const authActions = isAuthenticated ? (
    <Button type="button" variant="outline" onClick={() => void logout()}>
      Выйти
    </Button>
  ) : (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/login">Войти</Link>
      </Button>
      <Button asChild>
        <Link href="/register">Регистрация</Link>
      </Button>
    </div>
  );

  return (
    <header
      className={cn(
        "border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="grid gap-0.5">
          <span className="text-lg font-semibold tracking-tight">
            EKST Support
          </span>
          <span className="text-muted-foreground text-xs">
            Клиентская поддержка и обратная связь
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">{navigation}</nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user.name}
                {user.role === "ADMIN" ? " · Admin" : ""}
              </p>
              <p className="text-muted-foreground text-xs">{user.email}</p>
            </div>
          ) : null}

          <div className="hidden md:flex">{authActions}</div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {isMounted && isMenuOpen
        ? createPortal(
            <div className="fixed inset-0 z-50 md:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-black/45 backdrop-blur-md"
                aria-label="Закрыть мобильное меню"
                onClick={() => setIsMenuOpen(false)}
              />

              <div
                id="mobile-navigation"
                className="bg-background/98 absolute inset-x-4 top-4 rounded-2xl border p-5 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="grid gap-1">
                    <span className="text-base font-semibold tracking-tight">
                      Меню
                    </span>
                    {user ? (
                      <div className="text-sm">
                        <p className="font-medium">
                          {user.name}
                          {user.role === "ADMIN" ? " · Admin" : ""}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {user.email}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Закрыть меню"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X />
                  </Button>
                </div>

                <nav className="mt-6 flex flex-col items-stretch gap-2">
                  {navigation}
                </nav>

                <div className="mt-6 flex flex-col items-stretch gap-2">
                  {authActions}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}

export type { HeaderProps };
export { Header };
