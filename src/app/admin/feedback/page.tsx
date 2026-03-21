import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "shared/api/db";
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

async function AdminFeedbackPage() {
  const locale = getLocaleFromCookies(await cookies());
  const t = getMessages(locale);
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!isAdmin(currentUser)) {
    redirect("/");
  }

  const feedbacks = await db.feedback.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      product: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="min-h-svh">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="grid gap-2">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.18em]">
            {t.admin.section}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.admin.feedbackTitle}
          </h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base">
            {t.admin.feedbackDescription}
          </p>
        </section>

        <section className="grid gap-4">
          {feedbacks.length ? (
            feedbacks.map((feedback) => (
              <Card key={feedback.id}>
                <CardHeader className="gap-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="grid gap-1">
                      <CardTitle>{feedback.title}</CardTitle>
                      <CardDescription>
                        {feedback.user.name} · {feedback.user.email}
                      </CardDescription>
                    </div>

                    <div className="text-muted-foreground text-sm sm:text-right">
                      <p>{feedback.product.name}</p>
                      <p>
                        {new Date(feedback.createdAt).toLocaleString(
                          t.localeTag,
                        )}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full border px-3 py-1">
                      {t.feedbackType[feedback.type]}
                    </span>
                    <span className="rounded-full border px-3 py-1">
                      {t.feedbackStatus[feedback.status]}
                    </span>
                  </div>

                  <p className="text-sm leading-6 whitespace-pre-wrap break-all line-clamp-3 text-muted-foreground">
                    {feedback.description}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t.admin.empty}</CardTitle>
                <CardDescription>{t.admin.emptyDescription}</CardDescription>
              </CardHeader>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminFeedbackPage;
