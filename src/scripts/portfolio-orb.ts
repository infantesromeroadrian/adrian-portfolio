type OrbNode = {
  angle: number;
  radius: number;
  phase: number;
  size: number;
  connections: number[];
};

const ORB_SIZE = 72;
const NODE_COUNT = 44;

function deterministicFraction(index: number, salt: number): number {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43_758.5453;
  return value - Math.floor(value);
}

export function mountPortfolioOrb(
  canvas: HTMLCanvasElement,
  toggle: HTMLButtonElement,
  pauseButton: HTMLButtonElement,
): () => void {
  const context = canvas.getContext("2d");
  if (!context) return () => undefined;

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = ORB_SIZE * pixelRatio;
  canvas.height = ORB_SIZE * pixelRatio;
  context.scale(pixelRatio, pixelRatio);
  toggle.dataset.canvasReady = "true";

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const listeners = new AbortController();
  const nodes: OrbNode[] = Array.from({ length: NODE_COUNT }, (_, index) => ({
    angle: deterministicFraction(index, 1) * Math.PI * 2,
    radius: 14 + deterministicFraction(index, 2) * 16,
    phase: deterministicFraction(index, 3) * Math.PI * 2,
    size: 0.65 + deterministicFraction(index, 4) * 0.95,
    connections: [],
  }));

  nodes.forEach((node, nodeIndex) => {
    node.connections = nodes
      .map((candidate, candidateIndex) => ({
        index: candidateIndex,
        distance: Math.hypot(
          Math.cos(node.angle) * node.radius - Math.cos(candidate.angle) * candidate.radius,
          Math.sin(node.angle) * node.radius - Math.sin(candidate.angle) * candidate.radius,
        ),
      }))
      .filter(({ index, distance }) => index !== nodeIndex && distance < 10)
      .sort((left, right) => left.distance - right.distance)
      .slice(0, 3)
      .map(({ index }) => index);
  });

  let animationFrame = 0;
  let elapsedSeconds = 0;
  let previousTime = 0;
  let hoverAmount = 0;
  let hoverTarget = 0;
  let paused = false;
  let suspended = false;
  let disposed = false;
  let reducedMotion = motionPreference.matches;

  const draw = (): void => {
    context.clearRect(0, 0, ORB_SIZE, ORB_SIZE);
    const rotation = reducedMotion ? 0 : elapsedSeconds * 0.08;
    const positions = nodes.map((node) => {
      const angle = node.angle + rotation;
      const drift = reducedMotion ? 0 : Math.sin(elapsedSeconds * 0.55 + node.phase) * 0.65;
      return {
        x: ORB_SIZE / 2 + Math.cos(angle) * (node.radius + drift),
        y: ORB_SIZE / 2 + Math.sin(angle) * (node.radius + drift),
      };
    });

    context.strokeStyle = `rgba(255, 255, 255, ${0.22 + hoverAmount * 0.3})`;
    context.lineWidth = 0.5;
    context.beginPath();
    nodes.forEach((node, nodeIndex) => {
      const point = positions[nodeIndex];
      if (!point) return;
      node.connections.forEach((connection) => {
        const connectedPoint = positions[connection];
        if (!connectedPoint || connection <= nodeIndex) return;
        context.moveTo(point.x, point.y);
        context.lineTo(connectedPoint.x, connectedPoint.y);
      });
    });
    context.stroke();

    positions.forEach((point, index) => {
      const node = nodes[index];
      if (!node) return;
      context.fillStyle = index % 9 === 0 ? "#ffffff" : "rgba(255, 255, 255, 0.76)";
      context.beginPath();
      context.arc(point.x, point.y, node.size + hoverAmount * 0.2, 0, Math.PI * 2);
      context.fill();
    });
  };

  const canAnimate = (): boolean => (
    !disposed && !paused && !suspended && !document.hidden && !reducedMotion
  );

  const tick = (time: number): void => {
    animationFrame = 0;
    if (!canAnimate()) return;
    if (previousTime > 0) elapsedSeconds += Math.min(time - previousTime, 50) / 1_000;
    previousTime = time;
    hoverAmount += (hoverTarget - hoverAmount) * 0.12;
    draw();
    animationFrame = window.requestAnimationFrame(tick);
  };

  const syncAnimation = (): void => {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previousTime = 0;
    if (reducedMotion) hoverAmount = 0;
    draw();
    if (canAnimate()) animationFrame = window.requestAnimationFrame(tick);
  };

  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    window.cancelAnimationFrame(animationFrame);
    listeners.abort();
    motionPreference.removeEventListener("change", handleMotionPreference);
  };

  const handleMotionPreference = (event: MediaQueryListEvent): void => {
    reducedMotion = event.matches;
    syncAnimation();
  };

  toggle.addEventListener("pointerenter", () => {
    hoverTarget = 1;
  }, { signal: listeners.signal });
  toggle.addEventListener("pointerleave", () => {
    hoverTarget = 0;
  }, { signal: listeners.signal });
  pauseButton.addEventListener("click", () => {
    paused = !paused;
    pauseButton.setAttribute("aria-pressed", String(paused));
    pauseButton.textContent = paused ? "Resume orb motion" : "Pause orb motion";
    syncAnimation();
  }, { signal: listeners.signal });
  document.addEventListener("visibilitychange", syncAnimation, { signal: listeners.signal });
  window.addEventListener("pagehide", (event) => {
    suspended = true;
    if (event.persisted) syncAnimation();
    else dispose();
  }, { signal: listeners.signal });
  window.addEventListener("pageshow", () => {
    suspended = false;
    syncAnimation();
  }, { signal: listeners.signal });
  motionPreference.addEventListener("change", handleMotionPreference);

  syncAnimation();
  return dispose;
}
