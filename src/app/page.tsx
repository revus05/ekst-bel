import { redirect } from "next/navigation";
import { getCurrentUser } from "shared/lib/auth/get-current-user";
import { Header } from "widgets/header";
import { HeroSection } from "widgets/home";
import { ProductList } from "widgets/product-list";

async function Page() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <div className="min-h-svh">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <HeroSection currentUser={currentUser} />
        <ProductList />
      </main>
    </div>
  );
}

export default Page;
