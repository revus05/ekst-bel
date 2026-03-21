"use client";

import { useAuth } from "features/auth/model/use-auth";
import Link from "next/link";
import { cn } from "shared/lib/utils";
import { Button } from "shared/ui/button";

type HeaderProps = {
  className?: string;
};

function Header({ className }: HeaderProps) {
  const { isAuthenticated, logout, user } = useAuth();

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

        <nav className="hidden items-center gap-2 md:flex">
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
        </nav>

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

          {isAuthenticated ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void logout()}
            >
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
          )}
        </div>
      </div>
    </header>
  );
}

export type { HeaderProps };
export { Header };
