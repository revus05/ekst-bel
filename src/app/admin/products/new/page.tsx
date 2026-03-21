import { AddProductForm } from "features/add-product";
import { redirect } from "next/navigation";
import { getCurrentUser } from "shared/lib/auth/get-current-user";
import { isAdmin } from "shared/lib/auth/guards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "shared/ui/card";
import { Header } from "widgets/header";

async function NewProductPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!isAdmin(currentUser)) {
    redirect("/");
  }

  return (
    <div className="min-h-svh bg-background">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="grid gap-2">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.18em]">
            Админка
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Добавление продукта
          </h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base">
            Создайте новый продукт компании и загрузите его обложку в
            Cloudinary.
          </p>
        </section>

        <Card className="max-w-3xl flex justify-center">
          <CardHeader>
            <CardTitle>Новый продукт</CardTitle>
            <CardDescription>
              После создания продукт сразу появится на главной странице и станет
              доступен для сбора обратной связи.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddProductForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default NewProductPage;
