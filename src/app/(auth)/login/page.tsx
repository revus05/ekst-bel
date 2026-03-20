import { LoginForm } from "features/auth/ui/login-form";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "shared/ui/card";

function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Вход</CardTitle>
          <CardDescription>
            Войдите в аккаунт, чтобы отправлять обратную связь по продуктам
            компании.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <LoginForm />
          <p className="text-muted-foreground text-sm">
            Нет аккаунта?{" "}
            <Link
              className="text-primary font-medium underline-offset-4 hover:underline"
              href="/register"
            >
              Зарегистрируйтесь
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default LoginPage;
