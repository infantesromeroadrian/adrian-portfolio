import { mountPortfolioOrb } from "./portfolio-orb";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AvailabilityState = "checking" | "available" | "unavailable";

const SURFACE_OPEN_EVENT = "portfolio:surface-open";
const MAX_HISTORY_MESSAGES = 8;
const MAX_MESSAGE_CHARACTERS = 2_000;
const MAX_RESPONSE_CHARACTERS = 4_000;
const AVAILABILITY_TIMEOUT_MS = 5_000;
const CHAT_TIMEOUT_MS = 16_000;
const SHORT_RETRY_SECONDS = 60;

const FAILURE_MESSAGE = "The assistant could not answer. Please try again.";
const SHORT_RATE_LIMIT_MESSAGE = "Too many messages in a short time. Please wait a minute and try again.";
const LONG_RATE_LIMIT_MESSAGE = "The assistant has reached its message limit. Please try again later.";

function rateLimitMessage(response: Response): string {
  const retryAfterSeconds = Number(response.headers.get("Retry-After"));
  return Number.isFinite(retryAfterSeconds) && retryAfterSeconds > SHORT_RETRY_SECONDS
    ? LONG_RATE_LIMIT_MESSAGE
    : SHORT_RATE_LIMIT_MESSAGE;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  controller: AbortController,
  timeoutMs: number,
): Promise<Response> {
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

function mountChatWidget(root: HTMLElement): void {
  const panel = root.querySelector<HTMLElement>("[data-chat-panel]");
  const toggle = root.querySelector<HTMLButtonElement>("[data-chat-toggle]");
  const closeButton = root.querySelector<HTMLButtonElement>("[data-chat-close]");
  const body = root.querySelector<HTMLElement>("[data-chat-body]");
  const status = root.querySelector<HTMLElement>("[data-chat-status]");
  const messages = root.querySelector<HTMLElement>("[data-chat-messages]");
  const errorMessage = root.querySelector<HTMLElement>("[data-chat-error]");
  const form = root.querySelector<HTMLFormElement>("[data-chat-form]");
  const input = root.querySelector<HTMLTextAreaElement>("[data-chat-input]");
  const submitButton = root.querySelector<HTMLButtonElement>("[data-chat-submit]");
  const count = root.querySelector<HTMLElement>("[data-chat-count]");
  const canvas = root.querySelector<HTMLCanvasElement>("[data-orb-canvas]");
  const pauseButton = root.querySelector<HTMLButtonElement>("[data-orb-pause]");
  if (
    !panel || !toggle || !closeButton || !body || !status || !messages || !errorMessage
    || !form || !input || !submitButton || !count || !canvas || !pauseButton
  ) return;

  const disposeOrb = mountPortfolioOrb(canvas, toggle, pauseButton);
  let availability: AvailabilityState = "checking";
  let busy = false;
  let open = false;
  let history: ChatMessage[] = [];
  let availabilityRequest: AbortController | undefined;
  let chatRequest: AbortController | undefined;

  const updateControls = (): void => {
    const messageLength = input.value.length;
    input.disabled = availability !== "available" || busy;
    submitButton.disabled = (
      availability !== "available"
      || busy
      || input.value.trim().length === 0
      || messageLength > MAX_MESSAGE_CHARACTERS
    );
    submitButton.textContent = busy ? "Sending…" : "Send";
    count.textContent = `${messageLength} / ${MAX_MESSAGE_CHARACTERS}`;
    panel.setAttribute("aria-busy", String(busy || availability === "checking"));
  };

  const setAvailability = (nextState: AvailabilityState): void => {
    availability = nextState;
    panel.dataset.availability = nextState;
    if (nextState === "checking") status.textContent = "Checking availability…";
    if (nextState === "available") status.textContent = "The assistant is available.";
    if (nextState === "unavailable") {
      status.textContent = "The assistant is unavailable. You can still browse the portfolio.";
    }
    updateControls();
  };

  const refreshAvailability = async (): Promise<void> => {
    availabilityRequest?.abort();
    const request = new AbortController();
    availabilityRequest = request;
    setAvailability("checking");

    try {
      const response = await fetchWithTimeout(
        "/api/chat",
        { cache: "no-store", headers: { Accept: "application/json" } },
        request,
        AVAILABILITY_TIMEOUT_MS,
      );
      const payload: unknown = response.ok ? await response.json() : null;
      if (availabilityRequest !== request || request.signal.aborted) return;
      setAvailability(isRecord(payload) && payload.available === true ? "available" : "unavailable");
    } catch {
      if (availabilityRequest !== request || request.signal.aborted) return;
      setAvailability("unavailable");
    } finally {
      if (availabilityRequest === request) availabilityRequest = undefined;
    }
  };

  const closePanel = (returnFocus: boolean): void => {
    if (!open) return;
    open = false;
    availabilityRequest?.abort();
    const activeChatRequest = chatRequest;
    chatRequest = undefined;
    activeChatRequest?.abort();
    busy = false;
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open AI portfolio assistant");
    if (returnFocus) toggle.focus({ preventScroll: true });
  };

  const openPanel = (): void => {
    if (open) return;
    window.dispatchEvent(new CustomEvent(SURFACE_OPEN_EVENT, { detail: "chat" }));
    open = true;
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close AI portfolio assistant");
    closeButton.focus({ preventScroll: true });
    void refreshAvailability();
  };

  const renderMessage = (message: ChatMessage): HTMLElement => {
    const article = document.createElement("article");
    article.dataset.role = message.role;
    const heading = document.createElement("h3");
    heading.textContent = message.role === "user" ? "You" : "AI assistant";
    const content = document.createElement("p");
    content.textContent = message.content;
    article.append(heading, content);
    messages.append(article);
    while (messages.childElementCount > MAX_HISTORY_MESSAGES) {
      messages.firstElementChild?.remove();
    }
    body.scrollTop = body.scrollHeight;
    return article;
  };

  toggle.addEventListener("click", () => {
    if (open) closePanel(true);
    else openPanel();
  });
  closeButton.addEventListener("click", () => closePanel(true));
  input.addEventListener("input", updateControls);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      closePanel(true);
    }
  });
  window.addEventListener(SURFACE_OPEN_EVENT, (event) => {
    if (event instanceof CustomEvent && event.detail !== "chat") closePanel(false);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (
      availability !== "available"
      || busy
      || text.length === 0
      || text.length > MAX_MESSAGE_CHARACTERS
    ) return;

    busy = true;
    errorMessage.hidden = true;
    const userMessage: ChatMessage = { role: "user", content: text };
    const requestMessages = [...history, userMessage].slice(-MAX_HISTORY_MESSAGES);
    const pendingMessage = renderMessage(userMessage);
    input.value = "";
    status.textContent = "Preparing an answer…";
    updateControls();

    const request = new AbortController();
    chatRequest = request;
    let failureMessage = FAILURE_MESSAGE;
    try {
      const response = await fetchWithTimeout(
        "/api/chat",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: requestMessages }),
        },
        request,
        CHAT_TIMEOUT_MS,
      );
      const payload: unknown = await response.json();
      if (
        !response.ok
        || !isRecord(payload)
        || typeof payload.message !== "string"
        || payload.message.trim().length === 0
        || payload.message.length > MAX_RESPONSE_CHARACTERS
      ) {
        if (response.status === 503) setAvailability("unavailable");
        if (response.status === 429) failureMessage = rateLimitMessage(response);
        throw new Error("invalid_response");
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: payload.message.trim(),
      };
      history = [...requestMessages, assistantMessage].slice(-MAX_HISTORY_MESSAGES);
      renderMessage(assistantMessage);
      status.textContent = "Answer received. AI responses may be wrong.";
    } catch {
      pendingMessage.remove();
      input.value = text;
      if (chatRequest !== request) return;
      errorMessage.textContent = failureMessage;
      errorMessage.hidden = false;
      status.textContent = availability === "available"
        ? "Your message was not sent."
        : "The assistant is unavailable.";
    } finally {
      if (chatRequest !== request) return;
      chatRequest = undefined;
      busy = false;
      updateControls();
      if (open && availability === "available") input.focus({ preventScroll: true });
    }
  });

  window.addEventListener("pagehide", (event) => {
    availabilityRequest?.abort();
    chatRequest?.abort();
    if (!event.persisted) {
      history = [];
      disposeOrb();
    } else {
      closePanel(false);
    }
  });

  updateControls();
}

const chatRoot = document.querySelector<HTMLElement>("[data-portfolio-chat]");
if (chatRoot) mountChatWidget(chatRoot);
