import { RegisterForm } from "features/auth/ui/register-form";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "shared/ui/card";

function RegisterPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>
            Создайте аккаунт, чтобы сообщать о багах, ошибках и предлагать
            улучшения.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <RegisterForm />
          <p className="text-muted-foreground text-sm">
            Уже есть аккаунт?{" "}
            <Link
              className="text-primary font-medium underline-offset-4 hover:underline"
              href="/login"
            >
              Войдите
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default RegisterPage;
