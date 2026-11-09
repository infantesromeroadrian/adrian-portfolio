import assert from "node:assert/strict";
import test from "node:test";
import { fetchJsonWithTimeout } from "./chat-transport.ts";

// A separate bound makes a broken deadline fail rather than hang the test runner.
async function bounded<T>(operation: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const bound = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("request deadline did not settle")), 250);
  });
  try {
    return await Promise.race([operation, bound]);
  } finally {
    clearTimeout(timer!);
  }
}

test("deadline covers a stalled JSON body after response headers arrive", async (context) => {
  const controller = new AbortController();
  let receivedSignal: AbortSignal | null | undefined;
  context.mock.method(globalThis, "fetch", async (_input: unknown, init: RequestInit) => {
    receivedSignal = init.signal;
    return new Response(new ReadableStream({
      start(stream) {
        init.signal?.addEventListener("abort", () => stream.error(init.signal?.reason), { once: true });
      },
    }), { headers: { "Content-Type": "application/json" } });
  });

  try {
    await assert.rejects(bounded(fetchJsonWithTimeout("/api/chat", {}, controller, 20)), {
      name: "TimeoutError",
    });
    assert.equal(receivedSignal, controller.signal);
    assert.equal(controller.signal.aborted, true);
  } finally {
    controller.abort();
  }
});

test("deadline settles even when the transport ignores its abort signal", async (context) => {
  context.mock.method(globalThis, "fetch", () => new Promise(() => {}));
  const controller = new AbortController();
  await assert.rejects(bounded(fetchJsonWithTimeout("/api/chat", {}, controller, 20)), {
    name: "TimeoutError",
  });
  assert.equal(controller.signal.aborted, true);
});

test("caller cancellation settles a stalled body and remains distinct from timeout", async (context) => {
  const controller = new AbortController();
  context.mock.method(globalThis, "fetch", async () => new Response(new ReadableStream()));
  const operation = fetchJsonWithTimeout("/api/chat", {}, controller, 1_000);
  await new Promise<void>((resolve) => setImmediate(resolve));
  controller.abort();
  await assert.rejects(bounded(operation), { name: "AbortError" });
});

test("an already cancelled request never calls fetch", async (context) => {
  const fetchMock = context.mock.method(globalThis, "fetch", async () => Response.json({ available: true }));
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(fetchJsonWithTimeout("/api/chat", {}, controller, 20), { name: "AbortError" });
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("completed JSON preserves response metadata and clears the deadline", async (context) => {
  const response = Response.json({ message: "Public portfolio answer" }, {
    status: 429,
    headers: { "Retry-After": "90" },
  });
  context.mock.method(globalThis, "fetch", async () => response);
  const controller = new AbortController();
  const result = await fetchJsonWithTimeout("/api/chat", { method: "POST" }, controller, 20);
  assert.equal(result.response, response);
  assert.equal(result.response.headers.get("Retry-After"), "90");
  assert.deepEqual(result.payload, { message: "Public portfolio answer" });
  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.equal(controller.signal.aborted, false);
});
