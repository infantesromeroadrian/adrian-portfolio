import assert from "node:assert/strict";
import test from "node:test";
import { CHAT_SOURCE_RECORDS, CHAT_SOURCE_CONTEXT, resolveChatSources, validSourceIds } from "./chat-sources.ts";
import { professionalCases, professionalCasePaths } from "./professional-work.ts";
import { architectureStudies, securityWriteUps } from "./public-work.ts";
import {
  MAX_SOURCE_ID_CHARACTERS, MAX_SOURCE_TITLE_CHARACTERS, MAX_SOURCE_HREF_CHARACTERS,
  MAX_SOURCE_LIMITATION_CHARACTERS, SOURCE_DATE_PATTERN,
} from "./chat-contract.ts";

test("the source registry preserves professional contributions, decisions and evidence without copying facts", () => {
  assert.equal(CHAT_SOURCE_RECORDS.length, 14);
  assert.equal(new Set(CHAT_SOURCE_RECORDS.map((record) => record.id)).size, 14);
  for (const entry of professionalCases) {
    const source = CHAT_SOURCE_RECORDS.find((record) => record.id === `work:${entry.slug}`);
    assert.ok(source && "contribution" in source);
    assert.equal(source.contribution, entry.contribution);
    assert.equal(source.decisions, entry.decisions);
    assert.equal(source.evidence, entry.evidence);
    assert.equal(source.href, professionalCasePaths(entry.slug).page);
    assert.equal(source.limitation, entry.evidence.limitation);
    assert.equal(source.reviewedOn, entry.evidence.reviewedOn);
    const [card] = resolveChatSources([source.id]);
    assert.deepEqual(Object.keys(card!).sort(), ["href", "id", "kind", "limitation", "reviewedOn", "title"]);
  }
});

test("conceptual and HTB sources keep their provenance and do not invent review dates", () => {
  for (const entry of architectureStudies) {
    const source = CHAT_SOURCE_RECORDS.find((record) => record.href === entry.href);
    assert.equal(source?.kind, "conceptual");
    assert.ok(source?.limitation.includes(entry.limitation));
    assert.match(source!.limitation, /not proof of a professional implementation/);
    assert.ok(!("reviewedOn" in source!));
  }
  for (const entry of securityWriteUps) {
    const source = CHAT_SOURCE_RECORDS.find((record) => record.href === entry.href);
    assert.equal(source?.kind, "htb");
    assert.match(source!.id, /^htb:[a-f0-9]{12}$/);
    assert.ok(source?.limitation.includes(entry.scope));
    assert.ok(source?.limitation.includes(entry.takeaway));
    assert.ok(!("reviewedOn" in source!));
  }
  assert.match(CHAT_SOURCE_CONTEXT, /original input is unavailable/);
});

test("every source card satisfies the wire bounds and has a canonical link", () => {
  for (const record of CHAT_SOURCE_RECORDS) {
    const [card] = resolveChatSources([record.id]);
    assert.ok(card);
    for (const [value, maximum] of [
      [card.id, MAX_SOURCE_ID_CHARACTERS], [card.title, MAX_SOURCE_TITLE_CHARACTERS],
      [card.href, MAX_SOURCE_HREF_CHARACTERS], [card.limitation, MAX_SOURCE_LIMITATION_CHARACTERS],
    ] as const) {
      assert.ok(value.length > 0 && value.length <= maximum);
    }
    if (card.reviewedOn) assert.match(card.reviewedOn, SOURCE_DATE_PATTERN);
    const url = new URL(card.href, "https://portfolio.example");
    assert.equal(url.protocol, "https:");
    assert.equal(url.username + url.password + url.search + url.hash, "");
    if (card.kind === "htb") assert.equal(url.origin, "https://medium.com");
    else assert.equal(url.origin, "https://portfolio.example");
  }
});

test("untrusted references require exact membership and unique bounded IDs", () => {
  const id = "work:safe-copilot-recovery";
  for (const invalid of [null, {}, ["__proto__"], ["constructor"], ["https://evil.example"],
    [`${id}?x=1`], [`${id}#fragment`], [id, id], [1], ["x".repeat(101)],
    CHAT_SOURCE_RECORDS.slice(0, 4).map((record) => record.id)]) {
    assert.equal(validSourceIds(invalid), false);
  }
  assert.deepEqual(resolveChatSources(["__proto__"]), []);
  assert.equal(validSourceIds([]), true);
  assert.equal(validSourceIds([id]), true);
});
