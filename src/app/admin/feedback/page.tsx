import { redirect } from "next/navigation";
import { db } from "shared/api/db";
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

const feedbackTypeLabels = {
  BUG: "Баг",
  ERROR: "Ошибка",
  UI_UX: "UI/UX",
  FEATURE_REQUEST: "Предложение",
} as const;

const feedbackStatusLabels = {
  OPEN: "Открыто",
  IN_PROGRESS: "В работе",
  RESOLVED: "Решено",
} as const;

async function AdminFeedbackPage() {
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
    <div className="min-h-svh bg-background">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="grid gap-2">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.18em]">
            Админка
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Обращения пользователей
          </h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base">
            Полный список обращений с автором, продуктом и текущим статусом.
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
                        {new Date(feedback.createdAt).toLocaleString("ru-RU")}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full border px-3 py-1">
                      {feedbackTypeLabels[feedback.type]}
                    </span>
                    <span className="rounded-full border px-3 py-1">
                      {feedbackStatusLabels[feedback.status]}
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
                <CardTitle>Обращений пока нет</CardTitle>
                <CardDescription>
                  Когда пользователи начнут оставлять обращения, они появятся
                  здесь.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminFeedbackPage;
