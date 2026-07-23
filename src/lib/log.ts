/**
 * Structured logging.
 *
 * One line of JSON per event in production, so a log aggregator can parse and
 * query it; a readable line in development. Never pass a secret, password,
 * token or signed URL as a field — the logger does not redact, the caller must
 * not include them.
 */

type Level = "info" | "warn" | "error";

interface LogFields {
  [key: string]: string | number | boolean | null | undefined;
}

function emit(level: Level, message: string, fields: LogFields = {}): void {
  const clean: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) clean[key] = value;
  }

  if (process.env.NODE_ENV === "production") {
    const line = JSON.stringify({
      level,
      message,
      time: new Date().toISOString(),
      ...clean,
    });
    console[level === "info" ? "log" : level](line);
  } else {
    const suffix = Object.keys(clean).length
      ? " " +
        Object.entries(clean)
          .map(([k, v]) => `${k}=${v}`)
          .join(" ")
      : "";
    console[level === "info" ? "log" : level](`[${level}] ${message}${suffix}`);
  }
}

export const log = {
  info: (message: string, fields?: LogFields) => emit("info", message, fields),
  warn: (message: string, fields?: LogFields) => emit("warn", message, fields),
  error: (message: string, fields?: LogFields) =>
    emit("error", message, fields),
};

/**
 * Error-tracking seam. Today it logs structured errors; wiring Sentry is
 * dropping `@sentry/nextjs` in here and calling `Sentry.captureException`.
 * Kept behind one function so nothing else needs to change.
 */
export function reportError(
  error: unknown,
  context: Record<string, string | undefined> = {},
): void {
  log.error("unhandled_error", {
    ...context,
    error: error instanceof Error ? error.message : String(error),
    stack:
      error instanceof Error ? error.stack?.split("\n")[1]?.trim() : undefined,
  });
}
