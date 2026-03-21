import { AddProductForm } from "features/add-product";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "shared/lib/auth/get-current-user";
import { isAdmin } from "shared/lib/auth/guards";
import { getMessages } from "shared/lib/i18n/messages";
import { getLocaleFromCookies } from "shared/lib/locale/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "shared/ui/card";
import { Header } from "widgets/header";

async function NewProductPage() {
  const locale = getLocaleFromCookies(await cookies());
  const t = getMessages(locale);
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!isAdmin(currentUser)) {
    redirect("/");
  }

  return (
    <div className="min-h-svh">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="grid gap-2">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.18em]">
            {t.admin.section}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.admin.title}
          </h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base">
            {t.admin.newProductDescription}
          </p>
        </section>

        <Card className="max-w-3xl justify-center">
          <CardHeader>
            <CardTitle>{t.admin.newProductTitle}</CardTitle>
            <CardDescription>{t.admin.newProductInfo}</CardDescription>
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
