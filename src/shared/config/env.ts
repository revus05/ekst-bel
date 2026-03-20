type EnvValue = string;

function logEnvError(key: string, message: string) {
  console.error(`[env] ${message}: "${key}".`);
}

export function getEnvVariable(key: string): EnvValue {
  const value = process.env[key];

  if (typeof value !== "string") {
    logEnvError(key, "Environment variable is not defined");
    return "";
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    logEnvError(key, "Environment variable is empty");
    return "";
  }

  return normalizedValue;
}

export const env = {
  DATABASE_URL: getEnvVariable("DATABASE_URL"),
} as const;
