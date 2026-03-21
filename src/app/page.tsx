import { redirect } from "next/navigation";

import { getCurrentUser } from "shared/lib/auth/get-current-user";
import { Header } from "widgets/header";
import { ProductList } from "widgets/product-list";

async function Page() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <div className="min-h-svh bg-background">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <section className="grid gap-3">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.18em]">
            Дашборд поддержки
          </p>
          <div className="grid gap-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Здравствуйте, {currentUser.name}
            </h1>
            <p className="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base">
              Выберите продукт компании и отправьте баг-репорт, описание ошибки,
              сообщение о нелогичном поведении или предложение по улучшению.
            </p>
          </div>
        </section>

        <ProductList />
      </main>
    </div>
  );
}

export default Page;
