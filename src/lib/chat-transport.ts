export async function fetchJsonWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  controller: AbortController,
  timeoutMs: number,
): Promise<{ response: Response; payload: unknown }> {
  controller.signal.throwIfAborted();
  let rejectAbort: () => void;
  const aborted = new Promise<never>((_, reject) => {
    rejectAbort = () => reject(controller.signal.reason);
    controller.signal.addEventListener("abort", rejectAbort, { once: true });
  });
  const timeout = setTimeout(() => {
    controller.abort(new DOMException("Request deadline exceeded", "TimeoutError"));
  }, timeoutMs);

  try {
    // Keep the deadline through body consumption, even if a transport ignores abort.
    const operation = async (): Promise<{ response: Response; payload: unknown }> => {
      const response = await fetch(input, { ...init, signal: controller.signal });
      const payload: unknown = await response.json();
      return { response, payload };
    };
    return await Promise.race([operation(), aborted]);
  } finally {
    clearTimeout(timeout);
    controller.signal.removeEventListener("abort", rejectAbort!);
  }
}
