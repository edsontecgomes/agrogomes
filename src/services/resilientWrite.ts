const TRANSIENT_FIREBASE_CODES = new Set([
  "aborted",
  "cancelled",
  "deadline-exceeded",
  "internal",
  "network-request-failed",
  "resource-exhausted",
  "unavailable",
  "unknown",
]);

const WRITE_TIMEOUT_CODE =
  "eqtara-write-timeout";

function createWriteTimeoutError(
  timeoutMs: number,
) {
  return Object.assign(
    new Error(
      `A gravação não respondeu em ${timeoutMs}ms.`,
    ),
    {
      code: WRITE_TIMEOUT_CODE,
    },
  );
}

function getErrorCode(error: unknown): string {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error)
  ) {
    return "";
  }

  const code = String(
    (error as { code?: unknown }).code ?? "",
  );

  const parts = code.split("/");

  return parts[parts.length - 1] ?? "";
}

export function shouldFallbackToOffline(
  error: unknown,
): boolean {
  if (
    typeof navigator !== "undefined" &&
    !navigator.onLine
  ) {
    return true;
  }

  if (
    getErrorCode(error) ===
    WRITE_TIMEOUT_CODE
  ) {
    return true;
  }

  return TRANSIENT_FIREBASE_CODES.has(
    getErrorCode(error),
  );
}

export async function withWriteTimeout<T>(
  operation: Promise<T>,
  timeoutMs = 10_000,
): Promise<T> {
  let timeoutId:
    | ReturnType<typeof setTimeout>
    | undefined;

  const timeout = new Promise<never>(
    (_, reject) => {
      timeoutId = setTimeout(
        () =>
          reject(
            createWriteTimeoutError(
              timeoutMs,
            ),
          ),
        timeoutMs,
      );
    },
  );

  try {
    return await Promise.race([
      operation,
      timeout,
    ]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
