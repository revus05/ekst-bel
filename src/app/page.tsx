"use client";

import { useAuth } from "features/auth/model/use-auth";
import { useAppSelector } from "shared/lib/store/hooks";
import { Button } from "shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "shared/ui/card";

function Page() {
  const { logout, user } = useAuth();
  const theme = useAppSelector((state) => state.theme.value);

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Вы авторизованы</CardTitle>
          <CardDescription>
            Данные пользователя и тема были предзагружены на сервере и положены
            в redux store.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <div className="grid gap-1">
            <span className="text-muted-foreground">Пользователь</span>
            <span className="font-medium">{user?.name}</span>
            <span>{user?.email}</span>
          </div>
          <div className="grid gap-1">
            <span className="text-muted-foreground">Тема</span>
            <span className="font-medium capitalize">{theme}</span>
          </div>
          <Button type="button" variant="outline" onClick={() => void logout()}>
            Выйти
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default Page;
