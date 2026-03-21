import { ProfileSettingsForm } from "features/profile";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

async function ProfilePage() {
  const locale = getLocaleFromCookies(await cookies());
  const t = getMessages(locale);
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const feedbacks = await db.feedback.findMany({
    where: {
      userId: currentUser.id,
    },
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
            {t.profile.section}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {currentUser.name}
          </h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base">
            {t.profile.pageDescription}
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>{t.profile.settingsTitle}</CardTitle>
              <CardDescription>{t.profile.settingsDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="glass-panel mb-6 grid gap-3 rounded-[1.25rem] p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground text-sm">
                    {t.common.role}
                  </span>
                  <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-sm">
                    {currentUser.role === "ADMIN"
                      ? t.header.roleAdmin
                      : currentUser.role}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground text-sm">
                    {t.common.createdAt}
                  </span>
                  <span className="text-sm">
                    {new Date(currentUser.createdAt).toLocaleDateString(
                      t.localeTag,
                    )}
                  </span>
                </div>
              </div>
              <ProfileSettingsForm user={currentUser} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.profile.historyTitle}</CardTitle>
              <CardDescription>{t.profile.historyDescription}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {feedbacks.length ? (
                feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="glass-panel rounded-[1.25rem] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="grid gap-1">
                        <h2 className="font-medium">{feedback.title}</h2>
                        <p className="text-muted-foreground text-sm">
                          {feedback.product.name}
                        </p>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {new Date(feedback.createdAt).toLocaleString(
                          t.localeTag,
                        )}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1">
                        {t.feedbackType[feedback.type]}
                      </span>
                      <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1">
                        {t.feedbackStatus[feedback.status]}
                      </span>
                    </div>

                    <p className="text-muted-foreground mt-3 text-sm leading-6 whitespace-pre-wrap break-all">
                      {feedback.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="glass-panel rounded-[1.25rem] border-dashed p-5 text-sm text-muted-foreground">
                  {t.profile.emptyHistory}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
