# План реализации приложения клиентской поддержки

## Стек технологий
* **Фронтенд:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui.
* **Бэкенд:** Next.js API Routes.
* **База данных и ORM:** PostgreSQL, Prisma.
* **Пакетный менеджер:** Bun.
* **Архитектура:** Feature-Sliced Design (FSD).

---

## Модуль 1: Настройка базы данных и схемы (Prisma)
**Цель:** Создать структуру данных для пользователей, продуктов и отзывов.

1.  **Подключение к БД:** Настроить `.env` файл с `DATABASE_URL` для PostgreSQL.
2.  **Схема Prisma (`prisma/schema.prisma`):**
    * Модель `User`: `id`, `email`, `password` (хэш), `name`, `createdAt`, `updatedAt`.
    * Модель `Product`: `id`, `name`, `description`, `createdAt`.
    * Модель `Feedback`: `id`, `userId` (связь с `User`), `productId` (связь с `Product`), `type` (Enum: BUG, ERROR, UI_UX, FEATURE_REQUEST), `title`, `description`, `status` (Enum: OPEN, IN_PROGRESS, RESOLVED), `createdAt`.
3.  **Инициализация клиента:** Создать синглтон Prisma клиента в слое `shared/api/db.ts` для использования в API роутах.
4.  **Сидирование (Seeding):** Написать скрипт (`prisma/seed.ts`) с использованием Bun для заполнения таблицы `Product` тестовыми данными (продуктами компании).

## Модуль 2: Слой Shared (Инфраструктура и UI)
**Цель:** Подготовить базовые компоненты и утилиты.

1.  **shadcn/ui:** Сгенерировать базовые UI-компоненты в папку `src/shared/ui`:
    * `Button`, `Input`, `Textarea`, `Label`, `Select` (для выбора типа отзыва и продукта), `Card`, `Form` (react-hook-form + zod для валидации), `Toast` (для уведомлений).
2.  **Утилиты:** * Настроить утилиты для работы с классами (clsx, tailwind-merge) в `src/shared/lib/utils.ts`.
    * Настроить API-клиент (например, fetch-обертку или axios) в `src/shared/api/api-client.ts`.

## Модуль 3: Авторизация (Entities & Features)
**Цель:** Реализовать регистрацию, вход и защиту маршрутов.

1.  **Бэкенд (API Routes):**
    * `app/api/auth/register/route.ts`: API для создания пользователя (хэширование пароля через `bcrypt` или аналог, совместимый с Bun).
    * `app/api/auth/login/route.ts`: API для проверки учетных данных и выдачи JWT токена (или сессии).
    * `app/api/auth/me/route.ts`: API для получения текущего пользователя по токену.
2.  **Слой Entities (`src/entities/user`):**
    * `model`: Описать TypeScript типы (`User`, `AuthResponse`).
    * `api`: Функции для вызова API регистрации, логина и получения профиля.
3.  **Слой Features (`src/features/auth`):**
    * `ui/LoginForm`: Форма авторизации с валидацией zod.
    * `ui/RegisterForm`: Форма регистрации с валидацией zod.
    * Хуки для управления состоянием сессии (например, `useAuth`).
4.  **Слой Shared (`src/shared/lib/auth`):**
    * Middleware (`middleware.ts` в корне) для защиты приватных роутов (редирект неавторизованных на `/login`).

## Модуль 4: Сущность Продукта (Entities)
**Цель:** Вывод списка доступных продуктов компании.

1.  **Бэкенд (API Routes):**
    * `app/api/products/route.ts`: GET-запрос для получения списка всех продуктов из БД.
2.  **Слой Entities (`src/entities/product`):**
    * `model`: Тип `Product`.
    * `api`: Функция `getProducts`.
    * `ui/ProductCard`: Компонент для визуального отображения продукта в списке.

## Модуль 5: Создание Отзывов и Баг-репортов (Entities & Features)
**Цель:** Реализация функционала отправки фидбека.

1.  **Бэкенд (API Routes):**
    * `app/api/feedback/route.ts`: POST-запрос для создания записи `Feedback`. Должен проверять авторизацию пользователя и принимать `productId`, `type`, `title`, `description`.
    * *(Опционально)* GET-запрос для получения истории отзывов пользователя.
2.  **Слой Entities (`src/entities/feedback`):**
    * `model`: Типы `Feedback`, `FeedbackType`.
3.  **Слой Features (`src/features/submit-feedback`):**
    * `ui/FeedbackForm`: Форма (react-hook-form + zod), включающая:
        * Выбор продукта (Select данных из `entities/product`).
        * Выбор типа отзыва (Select: Баг, Ошибка, Нелогичность, Предложение).
        * Поле заголовка (Input).
        * Поле подробного описания (Textarea).
    * Обработка сабмита: вызов API, показ Toast при успехе, сброс формы.

## Модуль 6: Слой Widgets (Композиция)
**Цель:** Собрать крупные блоки интерфейса.

1.  **`src/widgets/header`:** Шапка сайта с логотипом компании, навигацией и кнопкой "Выйти" (или ссылкой на логин). Использует `entities/user` для проверки состояния.
2.  **`src/widgets/product-list`:** Сетка продуктов, использующая `entities/product/ui/ProductCard`. По клику на продукт пользователь должен переходить к форме отзыва с предвыбранным продуктом.

## Модуль 7: Слой Pages (Страницы приложения)
**Цель:** Интеграция виджетов и фичей на конкретных URL.

1.  **Страница Регистрации (`app/(auth)/register/page.tsx`):**
    * Использует `features/auth/ui/RegisterForm`.
2.  **Страница Логина (`app/(auth)/login/page.tsx`):**
    * Использует `features/auth/ui/LoginForm`.
3.  **Главная страница / Дашборд (`app/page.tsx`):**
    * Защищенный маршрут.
    * Использует `widgets/header`.
    * Отображает приветствие и `widgets/product-list`, предлагая выбрать продукт для обратной связи.
4.  **Страница отправки отзыва (`app/feedback/[productId]/page.tsx`):**
    * Защищенный маршрут.
    * Использует `widgets/header`.
    * Использует `features/submit-feedback/ui/FeedbackForm`, куда прокидывается ID выбранного продукта из URL.

## Модуль 8: Слой App (Связывание и Провайдеры)
**Цель:** Глобальная настройка.

1.  **`app/layout.tsx`:** Глобальные стили (Tailwind), подключение шрифтов, инициализация `Toaster` из shadcn/ui.
2.  **Провайдеры (`src/app/providers`):** При необходимости добавление React Query Provider (или SWR) для кэширования запросов списка продуктов и управления состоянием загрузки.