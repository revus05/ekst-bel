type EnvValue = string;

function logEnvError(key: string, message: string) {
  console.error(`[env] ${message}: "${key}".`);
}

function getOptionalEnvVariable(key: string): EnvValue | undefined {
  const value = process.env[key];

  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();

  return normalizedValue || undefined;
}

export function getEnvVariable(key: string): EnvValue {
  const value = getOptionalEnvVariable(key);

  if (!value) {
    logEnvError(key, "Environment variable is not defined");
    return "";
  }

  return value;
}

export const env = {
  DATABASE_URL: getEnvVariable("DATABASE_URL"),
  JWT_SECRET: getEnvVariable("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnvVariable("JWT_EXPIRES_IN"),
  CLOUDINARY_CLOUD_NAME: getEnvVariable("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: getEnvVariable("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnvVariable("CLOUDINARY_API_SECRET"),
  TELEGRAM_BOT_TOKEN: getOptionalEnvVariable("TELEGRAM_BOT_TOKEN"),
  TELEGRAM_CHAT_ID: getOptionalEnvVariable("TELEGRAM_CHAT_ID"),
} as const;
