type LogLevel = "debug" | "info" | "warn" | "error";

const formatArgs = (level: LogLevel, args: unknown[]) => {
  const prefix = `[YumYum:${level.toUpperCase()}]`;
  return [prefix, ...args];
};

export const logger = {
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(...formatArgs("debug", args));
    }
  },
  info: (...args: unknown[]) => {
    console.info(...formatArgs("info", args));
  },
  warn: (...args: unknown[]) => {
    console.warn(...formatArgs("warn", args));
  },
  error: (...args: unknown[]) => {
    console.error(...formatArgs("error", args));
  },
};

export type Logger = typeof logger;
