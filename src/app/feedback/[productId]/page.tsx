import { FeedbackForm } from "features/submit-feedback";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { db } from "shared/api/db";
import { getCurrentUser } from "shared/lib/auth/get-current-user";
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

type FeedbackPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

async function FeedbackPage({ params }: FeedbackPageProps) {
  const locale = getLocaleFromCookies(await cookies());
  const t = getMessages(locale);
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const { productId } = await params;
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-svh">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="grid gap-2">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.18em]">
            {t.feedback.pageSection}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base">
            {t.feedback.pageDescription}
          </p>
        </section>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>{t.feedback.requestTitle}</CardTitle>
            <CardDescription>{product.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <FeedbackForm initialProductId={product.id} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default FeedbackPage;
