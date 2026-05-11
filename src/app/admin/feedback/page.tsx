import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "shared/api/db";
import { getCurrentUser } from "shared/lib/auth/get-current-user";
import { isAdmin } from "shared/lib/auth/guards";
import { getMessages } from "shared/lib/i18n/messages";
import { getLocaleFromCookies } from "shared/lib/locale/server";
import { Header } from "widgets/header";
import { FeedbackList } from "widgets/feedback-list";

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
      productId: true,
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

  const items = feedbacks.map((f) => ({
    ...f,
    createdAt: f.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-svh">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="grid gap-2">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.18em]">
            {t.admin.feedbackSection}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.admin.feedbackTitle}
          </h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base">
            {t.admin.feedbackDescription}
          </p>
        </section>

        <FeedbackList
          items={items}
          isAdmin
          emptyMessage={t.admin.emptyDescription}
        />
      </main>
    </div>
  );
}

export default AdminFeedbackPage;
