import assert from "node:assert/strict";
import test from "node:test";
import {
  CHAT_COPY, GUIDED_PROMPTS, formatSourceDate, parseChatReply, rateLimitMessage, retryAfterSeconds,
} from "./chat-presentation.ts";
import { MAX_USER_CHARACTERS } from "./chat-contract.ts";
import type { ChatSource } from "./chat-contract.ts";

const source: ChatSource = {
  id: "work:sample-case",
  kind: "professional",
  title: "Sample public case",
  href: "/work/sample-case/",
  reviewedOn: "2026-11-08",
  limitation: "Synthetic fixture; no deployment claim.",
};
const reply = (sources: unknown[] = [source], message = "An evidence-bounded answer.") => ({ message, sources });

test("reply validation accepts bounded source kinds and preserves canonical metadata", () => {
  const sources = [
    source,
    { ...source, id: "concept:sample-study", kind: "conceptual", href: "/architecture/sample-study.html" },
    { ...source, id: "htb:sample-write-up", kind: "htb", href: "https://medium.com/@infantesromeroadrian/an%C3%A1lisis-sample-012345abcdef" },
  ];
  assert.deepEqual(parseChatReply(reply(sources)), reply(sources));
  assert.deepEqual(parseChatReply(reply([])), reply([]));
});

test("reply validation rejects malformed shapes, unknown fields, duplicates and excessive cards", () => {
  for (const payload of [
    null, [], "text", {}, { message: "Answer" }, { message: "Answer", sources: null },
    { ...reply(), html: "<b>extra</b>" }, reply([source, source]),
    reply(Array.from({ length: 4 }, (_, index) => ({ ...source, id: `work:sample-${index}` }))),
    reply([{ ...source, kind: "client" }]), reply([{ ...source, id: "htb:sample-case" }]),
    reply([{ ...source, title: { text: "unexpected" } }]), reply([{ ...source, extra: true }]),
    reply([{ ...source, reviewedOn: "2026-02-30" }]), reply([{ ...source, reviewedOn: "2026-11-08T00:00:00Z" }]),
    reply([{ ...source, reviewedOn: null }]), reply([], " "), reply([], "x".repeat(4_001)),
  ]) assert.equal(parseChatReply(payload), undefined, JSON.stringify(payload));
  assert.ok(parseChatReply(reply([], "x".repeat(4_000))));
  assert.ok(parseChatReply(reply([], "😀".repeat(4_000))));
  assert.equal(parseChatReply(reply([], "😀".repeat(4_001))), undefined);
});

test("each source string is bounded before it can reach the DOM", () => {
  for (const [field, maximum] of Object.entries({ id: 100, title: 240, href: 600, limitation: 1_600 })) {
    assert.equal(parseChatReply(reply([{ ...source, [field]: "x".repeat(maximum + 1) }])), undefined, field);
    assert.equal(parseChatReply(reply([{ ...source, [field]: " " }])), undefined, field);
  }
  assert.ok(parseChatReply(reply([{ ...source, title: "x".repeat(240), limitation: "x".repeat(1_600) }])));
});

test("source links reject active schemes, traversal, wrong origins and extra URL components", () => {
  for (const href of [
    "javascript:alert(1)", "data:text/html,hello", "//evil.example/work/sample/",
    "https://evil.example/work/sample/", "/work/../api/chat", "/work/%2e%2e/",
    "/work/sample-case/?next=evil", "/work/sample-case/#fragment", "/api/chat",
    "/architecture/sample-study.html", " /work/sample-case/",
  ]) assert.equal(parseChatReply(reply([{ ...source, href }])), undefined, href);

  const htb = { ...source, id: "htb:sample", kind: "htb" };
  for (const href of [
    "http://medium.com/@infantesromeroadrian/sample-012345abcdef",
    "https://medium.com.evil.example/@infantesromeroadrian/sample-012345abcdef",
    "https://user:pass@medium.com/@infantesromeroadrian/sample-012345abcdef",
    "https://medium.com/@someoneelse/sample-012345abcdef",
    "https://medium.com/@infantesromeroadrian/sample-012345abcdef?",
    "https://medium.com/@infantesromeroadrian/sample-012345abcdef#",
    "https://medium.com/@infantesromeroadrian/sample-012345abcdef?next=x",
    "https://medium.com/@infantesromeroadrian/sample-012345abcdef#x",
    "https://medium.com/@infantesromeroadrian/sample%2fother-012345abcdef",
    "https://medium.com/@infantesromeroadrian/sample%ZZ-012345abcdef",
  ]) assert.equal(parseChatReply(reply([{ ...htb, href }])), undefined, href);
});

test("Retry-After accepts sensible seconds or HTTP dates and never reflects arbitrary text", () => {
  const now = Date.UTC(2026, 10, 9, 12);
  assert.equal(retryAfterSeconds("2", now), 2);
  assert.equal(retryAfterSeconds("Mon, 09 Nov 2026 12:01:00 GMT", now), 60);
  for (const value of [null, "", "-5", "0", "0.5", "1e3", "86401", "<script>bad</script>", "2026-11-09", "Mon, 09 Nov 2026 11:00:00 GMT"]) {
    assert.equal(retryAfterSeconds(value, now), undefined, String(value));
  }
  assert.match(rateLimitMessage("en", 2), /2 seconds/);
  assert.match(rateLimitMessage("es", 2), /2 segundos/);
  assert.match(rateLimitMessage("es", 61), /2 minutos/);
  assert.equal(rateLimitMessage("es", NaN), CHAT_COPY.es.rateLimit);
});

test("both languages provide the same four bounded starter choices and localized controls", () => {
  assert.deepEqual(GUIDED_PROMPTS.en.map(({ id }) => id), GUIDED_PROMPTS.es.map(({ id }) => id));
  assert.equal(new Set(GUIDED_PROMPTS.en.map(({ id }) => id)).size, 4);
  for (const language of ["en", "es"] as const) {
    assert.ok(Object.values(CHAT_COPY[language]).every((text) => text.length > 0));
    assert.ok(GUIDED_PROMPTS[language].every(({ prompt }) => prompt.length > 0 && prompt.length <= MAX_USER_CHARACTERS));
  }
  assert.notEqual(CHAT_COPY.en.timeout, CHAT_COPY.es.timeout);
  assert.notEqual(CHAT_COPY.en.newTab, CHAT_COPY.es.newTab);
  assert.notEqual(formatSourceDate("2026-11-08", "en"), formatSourceDate("2026-11-08", "es"));
});
