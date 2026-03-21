import "server-only";

import { Bot } from "grammy";
import { env } from "shared/config/env";

type SendFeedbackNotificationParams = {
  authorEmail: string;
  authorName: string;
  description: string;
  productName: string;
  title: string;
};

let telegramBot: Bot | null | undefined;

function getTelegramBot() {
  if (telegramBot !== undefined) {
    return telegramBot;
  }

  if (!env.TELEGRAM_BOT_TOKEN) {
    telegramBot = null;
    return telegramBot;
  }

  telegramBot = new Bot(env.TELEGRAM_BOT_TOKEN);

  return telegramBot;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function sendFeedbackNotification({
  authorEmail,
  authorName,
  description,
  productName,
  title,
}: SendFeedbackNotificationParams) {
  if (!env.TELEGRAM_CHAT_ID) {
    return;
  }

  const bot = getTelegramBot();

  if (!bot) {
    return;
  }

  const message = [
    "<b>Новое обращение</b>",
    `Автор: <b>${escapeHtml(authorName)}</b> (${escapeHtml(authorEmail)})`,
    `Продукт: <b>${escapeHtml(productName)}</b>`,
    `Тема: <b>${escapeHtml(title)}</b>`,
    "",
    "<b>Текст обращения:</b>",
    escapeHtml(description),
  ].join("\n");

  await bot.api.sendMessage(env.TELEGRAM_CHAT_ID, message, {
    parse_mode: "HTML",
  });
}

export { sendFeedbackNotification };
