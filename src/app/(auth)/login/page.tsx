import { LoginForm } from "features/auth/ui/login-form";
import { cookies } from "next/headers";
import Link from "next/link";
import { getMessages } from "shared/lib/i18n/messages";
import { getLocaleFromCookies } from "shared/lib/locale/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "shared/ui/card";

async function LoginPage() {
  const locale = getLocaleFromCookies(await cookies());
  const t = getMessages(locale);
  return (
    <main className="relative flex min-h-svh items-center justify-center p-6">
      <div className="glass-panel-strong absolute inset-x-6 top-6 h-28 rounded-[2rem] blur-3xl sm:inset-x-auto sm:left-1/2 sm:w-[28rem] sm:-translate-x-1/2" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t.auth.login}</CardTitle>
          <CardDescription>{t.auth.loginDescription}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <LoginForm />
          <p className="text-muted-foreground text-sm">
            {t.auth.noAccount}{" "}
            <Link
              className="text-primary font-medium underline-offset-4 hover:underline"
              href="/register"
            >
              {t.auth.registerLink}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default LoginPage;
