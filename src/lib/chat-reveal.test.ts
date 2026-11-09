import assert from "node:assert/strict";
import test from "node:test";
import { createTextReveal, MAX_REVEAL_DURATION_MS } from "./chat-reveal.ts";

function frameClock() {
  let time = 0;
  let nextId = 0;
  const pending = new Map<number, () => void>();
  const queued: (() => void)[] = [];
  return {
    now: () => time,
    request(callback: () => void) {
      pending.set(++nextId, callback);
      queued.push(callback);
      return nextId;
    },
    cancel(id: number) { pending.delete(id); },
    advance(milliseconds: number) {
      time += milliseconds;
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach((callback) => callback());
    },
    pendingCount: () => pending.size,
    replayQueued: () => queued.forEach((callback) => callback()),
  };
}

test("a maximum-length answer has intermediate frames and completes once within the brief cap", () => {
  const clock = frameClock();
  const answer = "😀".repeat(4_000);
  const frames: string[] = [];
  let completed = 0;
  const reveal = createTextReveal(answer, clock, (text) => frames.push(text), () => completed++);
  reveal.start();
  clock.advance(400);
  assert.ok(frames.length >= 2);
  assert.ok(frames.every((text) => text.length > 0 && text.length < answer.length));
  assert.equal(completed, 0);
  assert.ok(MAX_REVEAL_DURATION_MS <= 3_000);
  clock.advance(MAX_REVEAL_DURATION_MS - 400);
  assert.equal(frames.at(-1), answer);
  assert.equal(completed, 1);
  assert.equal(clock.pendingCount(), 0);
  clock.replayQueued();
  reveal.finish();
  reveal.start();
  assert.equal(completed, 1);
  assert.equal(frames.filter((text) => text === answer).length, 1);
});

test("show-full interrupts presentation immediately and obsolete frames cannot write again", () => {
  const clock = frameClock();
  const frames: string[] = [];
  let completed = 0;
  const answer = "A validated answer with evidence limits.";
  const reveal = createTextReveal(answer, clock, (text) => frames.push(text), () => completed++);
  reveal.start();
  clock.advance(80);
  reveal.finish();
  const count = frames.length;
  assert.equal(frames.at(-1), answer);
  assert.equal(clock.pendingCount(), 0);
  clock.replayQueued();
  clock.advance(10_000);
  reveal.cancel();
  assert.equal(frames.length, count);
  assert.equal(completed, 1);
});

test("cancellation isolates an old reveal from a replacement", () => {
  const clock = frameClock();
  const frames: string[] = [];
  let oldCompleted = 0;
  const old = createTextReveal("Old validated answer", clock, (text) => frames.push(text), () => oldCompleted++);
  old.start();
  old.cancel();
  const count = frames.length;
  clock.replayQueued();
  old.start();
  old.finish();
  assert.equal(frames.length, count);
  assert.equal(oldCompleted, 0);
  assert.equal(clock.pendingCount(), 0);

  let replacement = "";
  const next = createTextReveal("New validated answer", clock, (text) => { replacement = text; }, () => {});
  next.start();
  clock.advance(MAX_REVEAL_DURATION_MS);
  assert.equal(replacement, "New validated answer");
  assert.equal(frames.length, count);
});

test("intermediate text never splits combining marks, emoji modifiers, flags or ZWJ sequences", () => {
  const clock = frameClock();
  const clusters = ["e\u0301", "👩🏽‍💻", "🇪🇸", " ", "A", "\n", "👨‍👩‍👦"];
  const prefixes = new Set(clusters.map((_, index) => clusters.slice(0, index + 1).join("")));
  const frames: string[] = [];
  const reveal = createTextReveal(clusters.join(""), clock, (text) => frames.push(text), () => {});
  reveal.start();
  for (let index = 0; index < 40; index++) clock.advance(16);
  assert.ok(frames.length > 2);
  assert.ok(frames.every((text) => prefixes.has(text)));
  assert.equal(frames.at(-1), clusters.join(""));
});

test("a delayed frame catches up rather than extending presentation", () => {
  const clock = frameClock();
  let visible = "";
  const answer = "Validated answer ".repeat(100);
  const reveal = createTextReveal(answer, clock, (text) => { visible = text; }, () => {});
  reveal.start();
  clock.advance(30_000);
  assert.equal(visible, answer);
  assert.equal(clock.pendingCount(), 0);
});

test("finishing before start presents the whole answer without scheduling animation", () => {
  const clock = frameClock();
  const frames: string[] = [];
  let completed = 0;
  const reveal = createTextReveal("Immediate answer", clock, (text) => frames.push(text), () => completed++);
  reveal.finish();
  reveal.start();
  assert.deepEqual(frames, ["Immediate answer"]);
  assert.equal(completed, 1);
  assert.equal(clock.pendingCount(), 0);
});
