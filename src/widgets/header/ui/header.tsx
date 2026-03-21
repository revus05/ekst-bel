"use client";

import { useLocale } from "app/providers/locale-provider";
import { useAuth } from "features/auth/model/use-auth";
import {
  Check,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  SunMedium,
  UserCircle2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getMessages } from "shared/lib/i18n/messages";
import { cn } from "shared/lib/utils";
import { Button } from "shared/ui/button";

type HeaderProps = {
  className?: string;
};

function Header({ className }: HeaderProps) {
  const { isAuthenticated, logout, user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuId = useId();
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const text = getMessages(locale).header;

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

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target;

      if (
        userMenuRef.current?.contains(target as Node) ||
        userMenuTriggerRef.current?.contains(target as Node)
      ) {
        return;
      }

      setIsUserMenuOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUserMenuOpen]);

  useEffect(() => {
    void pathname;
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  }, [pathname]);

  const navigation = (
    <>
      <Button variant="ghost" asChild>
        <Link href="/">{text.home}</Link>
      </Button>
      {user?.role === "ADMIN" ? (
        <>
          <Button variant="ghost" asChild>
            <Link href="/admin/feedback">{text.feedback}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/admin/products/new">{text.addProduct}</Link>
          </Button>
        </>
      ) : null}
    </>
  );

  const authActions = isAuthenticated ? null : (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/login">{text.login}</Link>
      </Button>
      <Button asChild>
        <Link href="/register">{text.register}</Link>
      </Button>
    </div>
  );

  const userMenuContent = user ? (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <p className="text-sm font-medium">
          {user.name}
          {user.role === "ADMIN" ? ` · ${text.roleAdmin}` : ""}
        </p>
        <p className="text-muted-foreground text-xs">{user.email}</p>
      </div>

      <Button variant="outline" asChild className="w-full justify-start">
        <Link href="/profile">
          <UserCircle2 className="size-4" />
          {text.profile}
        </Link>
      </Button>

      <div className="grid gap-2">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-[0.18em]">
          {text.theme}
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={cn(
              "glass-field flex items-center justify-between rounded-xl px-3 py-2 text-sm",
              resolvedTheme !== "dark" && "border-sky-300/35 bg-white/16",
            )}
            onClick={() => setTheme("light")}
          >
            <span className="flex items-center gap-2">
              <SunMedium className="size-4" />
              {text.themeLight}
            </span>
            {resolvedTheme !== "dark" ? <Check className="size-4" /> : null}
          </button>
          <button
            type="button"
            className={cn(
              "glass-field flex items-center justify-between rounded-xl px-3 py-2 text-sm",
              resolvedTheme === "dark" && "border-sky-300/35 bg-white/16",
            )}
            onClick={() => setTheme("dark")}
          >
            <span className="flex items-center gap-2">
              <Moon className="size-4" />
              {text.themeDark}
            </span>
            {resolvedTheme === "dark" ? <Check className="size-4" /> : null}
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-[0.18em]">
          {text.language}
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={cn(
              "glass-field flex items-center justify-between rounded-xl px-3 py-2 text-sm",
              locale === "ru" && "border-sky-300/35 bg-white/16",
            )}
            onClick={() => setLocale("ru")}
          >
            <span>{locale === "en" ? "Russian" : "Русский"}</span>
            {locale === "ru" ? <Check className="size-4" /> : null}
          </button>
          <button
            type="button"
            className={cn(
              "glass-field flex items-center justify-between rounded-xl px-3 py-2 text-sm",
              locale === "en" && "border-sky-300/35 bg-white/16",
            )}
            onClick={() => setLocale("en")}
          >
            <span>English</span>
            {locale === "en" ? <Check className="size-4" /> : null}
          </button>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full justify-start"
        onClick={() => void logout()}
      >
        <LogOut className="size-4" />
        {text.logout}
      </Button>
    </div>
  ) : null;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/70 bg-background/55 backdrop-blur-2xl supports-backdrop-filter:bg-background/45",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="grid gap-0.5">
          <span className="text-lg font-semibold tracking-tight">
            EKST Support
          </span>
          <span className="text-muted-foreground text-xs">{text.subtitle}</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">{navigation}</nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative hidden sm:block">
              <button
                ref={userMenuTriggerRef}
                type="button"
                aria-expanded={isUserMenuOpen}
                aria-controls={userMenuId}
                className="glass-panel flex min-w-56 items-center justify-between gap-3 rounded-[1.25rem] px-4 py-3 text-left transition-transform"
                onClick={() => setIsUserMenuOpen((current) => !current)}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user.name}
                    {user.role === "ADMIN" ? ` · ${text.roleAdmin}` : ""}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 transition-transform",
                    isUserMenuOpen && "rotate-180",
                  )}
                />
              </button>

              {isUserMenuOpen ? (
                <div
                  id={userMenuId}
                  ref={userMenuRef}
                  className="glass-panel-strong bg-background absolute right-0 z-50 mt-3 w-80 rounded-[1.5rem] p-4"
                >
                  {userMenuContent}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="hidden md:flex">{authActions}</div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={isMenuOpen ? text.menuClose : text.menuOpen}
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
                aria-label={text.menuClose}
                onClick={() => setIsMenuOpen(false)}
              />

              <div
                id="mobile-navigation"
                className="glass-panel-strong absolute inset-x-4 top-4 rounded-[1.75rem] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="grid gap-1">
                    <span className="text-base font-semibold tracking-tight">
                      {text.menu}
                    </span>
                    {user ? (
                      <div className="text-sm">
                        <p className="font-medium">
                          {user.name}
                          {user.role === "ADMIN" ? ` · ${text.roleAdmin}` : ""}
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
                    aria-label={text.menuClose}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X />
                  </Button>
                </div>

                <nav className="mt-6 flex flex-col items-stretch gap-2">
                  {navigation}
                </nav>

                {userMenuContent ? (
                  <div className="glass-panel mt-6 rounded-[1.5rem] p-4">
                    {userMenuContent}
                  </div>
                ) : (
                  <div className="mt-6 flex flex-col items-stretch gap-2">
                    {authActions}
                  </div>
                )}
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
