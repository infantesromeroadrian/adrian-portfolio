export const MAX_REVEAL_DURATION_MS = 1_800;

type RevealClock = {
  now: () => number;
  request: (callback: () => void) => number;
  cancel: (id: number) => void;
};

export type TextReveal = {
  start: () => void;
  finish: () => void;
  cancel: () => void;
};

/** Presentation only: callers must validate and commit the complete answer first. */
export function createTextReveal(
  text: string,
  clock: RevealClock,
  onUpdate: (visibleText: string) => void,
  onComplete: () => void,
): TextReveal {
  // Without grapheme segmentation, show the whole answer rather than split a glyph.
  const graphemes = typeof Intl.Segmenter === "function"
    ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), ({ segment }) => segment)
    : [text];
  const duration = Math.min(MAX_REVEAL_DURATION_MS, Math.max(350, graphemes.length * 12));
  let state: "idle" | "running" | "finished" | "cancelled" = "idle";
  let frame: number | undefined;
  let startedAt = 0;
  let visibleText = "";

  const clearFrame = (): void => {
    if (frame !== undefined) clock.cancel(frame);
    frame = undefined;
  };

  const update = (next: string): void => {
    if (next === visibleText) return;
    visibleText = next;
    onUpdate(next);
  };

  const finish = (): void => {
    if (state === "finished" || state === "cancelled") return;
    state = "finished";
    clearFrame();
    update(text);
    onComplete();
  };

  const tick = (): void => {
    if (state !== "running") return;
    frame = undefined;
    const elapsed = clock.now() - startedAt;
    if (elapsed >= duration) {
      finish();
      return;
    }
    const count = Math.max(1, Math.floor(graphemes.length * Math.max(0, elapsed) / duration));
    update(graphemes.slice(0, count).join(""));
    if (state === "running") frame = clock.request(tick);
  };

  return {
    start() {
      if (state !== "idle") return;
      if (graphemes.length <= 1) {
        finish();
        return;
      }
      state = "running";
      startedAt = clock.now();
      tick();
    },
    finish,
    cancel() {
      if (state === "finished" || state === "cancelled") return;
      state = "cancelled";
      clearFrame();
    },
  };
}
