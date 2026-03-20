import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "EKST CRM",
    description:
      "Внутренняя CRM-система для работы с клиентскими заявками и историей обращений.",
  },
  {
    name: "EKST Portal",
    description:
      "Клиентский портал с доступом к заказам, документам и статусам обслуживания.",
  },
  {
    name: "EKST Analytics",
    description:
      "Панель аналитики с ключевыми метриками использования продукта и качеством сервиса.",
  },
  {
    name: "EKST Mobile",
    description:
      "Мобильное приложение для клиентов и полевых сотрудников с быстрым доступом к обращениям.",
  },
] as const;

async function main() {
  await prisma.product.createMany({
    data: products.map((product) => ({
      name: product.name,
      description: product.description,
    })),
    skipDuplicates: true,
  });

  console.info(`[seed] Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error("[seed] Failed to seed products.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
