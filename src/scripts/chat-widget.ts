import { mountPortfolioOrb } from "./portfolio-orb";
import { fetchJsonWithTimeout } from "../lib/chat-transport";
import {
  MAX_CHAT_MESSAGES as MAX_HISTORY_MESSAGES,
  MAX_USER_CHARACTERS as MAX_MESSAGE_CHARACTERS,
} from "../lib/chat-contract";
import type { ChatLanguage, ChatMessage, ChatSource } from "../lib/chat-contract";
import {
  CHAT_COPY, GUIDED_PROMPTS, formatSourceDate, isRecord, parseChatReply,
  rateLimitMessage, retryAfterSeconds,
} from "../lib/chat-presentation";
import type { ChatCopyKey } from "../lib/chat-presentation";

type AvailabilityState = "checking" | "available" | "unavailable";
type StatusKey = "checking" | "ready" | "unavailable" | "preparing" | "received" | "noAnswer";
type ChatError = { kind: "failure" | "timeout" | "rateLimit"; retrySeconds?: number };

const SURFACE_OPEN_EVENT = "portfolio:surface-open";
const AVAILABILITY_TIMEOUT_MS = 5_000;
const CHAT_TIMEOUT_MS = 16_000;

function mountChatWidget(root: HTMLElement): void {
  const panel = root.querySelector<HTMLElement>("[data-chat-panel]");
  const toggle = root.querySelector<HTMLButtonElement>("[data-chat-toggle]");
  const closeButton = root.querySelector<HTMLButtonElement>("[data-chat-close]");
  const body = root.querySelector<HTMLElement>("[data-chat-body]");
  const status = root.querySelector<HTMLElement>("[data-chat-status]");
  const retryButton = root.querySelector<HTMLButtonElement>("[data-chat-retry]");
  const messages = root.querySelector<HTMLElement>("[data-chat-messages]");
  const errorMessage = root.querySelector<HTMLElement>("[data-chat-error]");
  const form = root.querySelector<HTMLFormElement>("[data-chat-form]");
  const input = root.querySelector<HTMLTextAreaElement>("[data-chat-input]");
  const submitButton = root.querySelector<HTMLButtonElement>("[data-chat-submit]");
  const count = root.querySelector<HTMLElement>("[data-chat-count]");
  const canvas = root.querySelector<HTMLCanvasElement>("[data-orb-canvas]");
  const pauseButton = root.querySelector<HTMLButtonElement>("[data-orb-pause]");
  const languageSelect = root.querySelector<HTMLSelectElement>("[data-chat-language]");
  const guide = root.querySelector<HTMLDetailsElement>("[data-chat-guide]");
  const starters = root.querySelectorAll<HTMLButtonElement>("[data-chat-starter]");
  if (
    !panel || !toggle || !closeButton || !body || !status || !messages || !errorMessage
    || !form || !input || !submitButton || !count || !canvas || !pauseButton || !retryButton
    || !languageSelect || !guide
  ) return;

  let language: ChatLanguage = "en";
  const disposeOrb = mountPortfolioOrb(canvas, toggle, pauseButton,
    (paused) => CHAT_COPY[language][paused ? "resumeOrb" : "pauseOrb"]);
  let availability: AvailabilityState = "checking";
  let statusKey: StatusKey = "checking";
  let currentError: ChatError | undefined;
  let busy = false;
  let open = false;
  let history: ChatMessage[] = [];
  let availabilityRequest: AbortController | undefined;
  let chatRequest: {
    controller: AbortController;
    pendingMessage: HTMLElement;
    text: string;
  } | undefined;

  const renderFeedback = (): void => {
    status.textContent = CHAT_COPY[language][statusKey];
    errorMessage.hidden = currentError === undefined;
    errorMessage.textContent = currentError
      ? (currentError.kind === "rateLimit"
        ? rateLimitMessage(language, currentError.retrySeconds)
        : CHAT_COPY[language][currentError.kind])
      : "";
  };

  const setStatus = (next: StatusKey): void => {
    statusKey = next;
    renderFeedback();
  };

  const setError = (next?: ChatError): void => {
    currentError = next;
    renderFeedback();
  };

  const updateControls = (): void => {
    const messageLength = Array.from(input.value).length;
    input.disabled = availability !== "available" || busy;
    submitButton.disabled = (
      availability !== "available"
      || busy
      || input.value.trim().length === 0
      || messageLength > MAX_MESSAGE_CHARACTERS
    );
    submitButton.textContent = CHAT_COPY[language][busy ? "sending" : "send"];
    starters.forEach((button) => { button.disabled = busy || availability !== "available"; });
    count.textContent = `${messageLength} / ${MAX_MESSAGE_CHARACTERS}`;
    panel.setAttribute("aria-busy", String(open && (busy || availability === "checking")));
  };

  const setAvailability = (nextState: AvailabilityState): void => {
    availability = nextState;
    panel.dataset.availability = nextState;
    setStatus(nextState === "available" ? "ready" : nextState);
    retryButton.hidden = nextState !== "unavailable";
    updateControls();
  };

  const refreshAvailability = async (): Promise<void> => {
    const previousRequest = availabilityRequest;
    const request = new AbortController();
    availabilityRequest = request;
    previousRequest?.abort();
    const retryHadFocus = document.activeElement === retryButton;
    setError();
    setAvailability("checking");

    try {
      const { response, payload } = await fetchJsonWithTimeout(
        "/api/chat",
        { cache: "no-store", headers: { Accept: "application/json" } },
        request,
        AVAILABILITY_TIMEOUT_MS,
      );
      if (availabilityRequest !== request || request.signal.aborted) return;
      setAvailability(response.ok && isRecord(payload) && payload.available === true ? "available" : "unavailable");
      if (response.status === 429) {
        setError({ kind: "rateLimit", retrySeconds: retryAfterSeconds(response.headers.get("Retry-After"), Date.now()) });
      }
    } catch {
      if (availabilityRequest !== request) return;
      setAvailability("unavailable");
    } finally {
      if (availabilityRequest === request) {
        availabilityRequest = undefined;
        if (open && retryHadFocus) {
          (availability === "available" ? input : retryButton).focus({ preventScroll: true });
        }
      }
    }
  };

  const closePanel = (returnFocus: boolean): void => {
    if (!open) return;
    open = false;
    const activeAvailabilityRequest = availabilityRequest;
    availabilityRequest = undefined;
    activeAvailabilityRequest?.abort();
    const activeChatRequest = chatRequest;
    chatRequest = undefined;
    activeChatRequest?.controller.abort();
    if (activeChatRequest) {
      activeChatRequest.pendingMessage.remove();
      input.value = activeChatRequest.text;
    }
    busy = false;
    updateControls();
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", CHAT_COPY[language].open);
    if (returnFocus) toggle.focus({ preventScroll: true });
  };

  const openPanel = (): void => {
    if (open) return;
    window.dispatchEvent(new CustomEvent(SURFACE_OPEN_EVENT, { detail: "chat" }));
    open = true;
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", CHAT_COPY[language].close);
    closeButton.focus({ preventScroll: true });
    void refreshAvailability();
  };

  const copyElement = (tag: string, key: ChatCopyKey): HTMLElement => {
    const element = document.createElement(tag);
    element.dataset.chatCopy = key;
    element.textContent = CHAT_COPY[language][key];
    element.lang = language;
    return element;
  };

  const renderSource = (source: ChatSource): HTMLLIElement => {
    const item = document.createElement("li");
    const kind = copyElement("p", source.kind);
    kind.className = "portfolio-chat__source-kind";
    const link = document.createElement("a");
    link.href = source.href;
    const title = document.createElement("span");
    title.lang = "en";
    title.textContent = source.title;
    link.append(title);
    if (source.kind === "htb") {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      const notice = copyElement("span", "newTab");
      notice.className = "visually-hidden";
      link.append(document.createTextNode(" "), notice);
    }
    item.append(kind, link);
    if (source.reviewedOn) {
      const reviewed = document.createElement("p");
      reviewed.className = "portfolio-chat__source-date";
      const date = document.createElement("time");
      date.dateTime = source.reviewedOn;
      date.dataset.chatReviewed = source.reviewedOn;
      date.textContent = formatSourceDate(source.reviewedOn, language);
      reviewed.append(copyElement("span", "reviewed"), document.createTextNode(": "), date);
      item.append(reviewed);
    }
    const limitation = document.createElement("p");
    limitation.className = "portfolio-chat__source-limit";
    const canonicalLimit = document.createElement("span");
    canonicalLimit.lang = "en";
    canonicalLimit.textContent = source.limitation;
    limitation.append(copyElement("span", "limitation"), document.createTextNode(": "), canonicalLimit);
    item.append(limitation);
    return item;
  };

  const renderMessage = (
    message: ChatMessage,
    pending = false,
    sources: readonly ChatSource[] = [],
    answerLanguage: ChatLanguage = language,
  ): HTMLElement => {
    const article = document.createElement("article");
    article.dataset.role = message.role;
    const heading = copyElement("h3", message.role === "user" ? "user" : "assistant");
    const content = document.createElement("p");
    content.textContent = message.content;
    if (message.role === "assistant") content.lang = answerLanguage;
    article.append(heading, content);
    if (sources.length > 0) {
      const heading = copyElement("h4", "evidence");
      const cards = document.createElement("ul");
      cards.className = "portfolio-chat__sources";
      sources.forEach((source) => cards.append(renderSource(source)));
      article.append(heading, cards);
    }
    messages.append(article);
    while (!pending && messages.childElementCount > MAX_HISTORY_MESSAGES) {
      messages.firstElementChild?.remove();
    }
    if (message.role === "assistant") {
      // Keep the answer visible before its evidence, even when the cards are long.
      body.scrollTop += article.getBoundingClientRect().top - body.getBoundingClientRect().top - 8;
    } else {
      body.scrollTop = body.scrollHeight;
    }
    return article;
  };

  const localizeInterface = (): void => {
    const copy = CHAT_COPY[language];
    languageSelect.value = language;
    root.lang = language;
    root.setAttribute("aria-label", copy.assistantLabel);
    root.querySelectorAll<HTMLElement>("[data-chat-copy]").forEach((element) => {
      const key = element.dataset.chatCopy as ChatCopyKey;
      element.textContent = copy[key];
      element.lang = language;
    });
    root.querySelectorAll<HTMLTimeElement>("[data-chat-reviewed]").forEach((element) => {
      element.textContent = formatSourceDate(element.dateTime, language);
    });
    starters.forEach((button) => {
      const starter = GUIDED_PROMPTS[language].find((entry) => entry.id === button.dataset.chatStarter);
      if (starter) {
        button.textContent = starter.label;
        button.title = starter.prompt;
      }
    });
    input.placeholder = copy.placeholder;
    closeButton.setAttribute("aria-label", copy.close);
    toggle.setAttribute("aria-label", open ? copy.close : copy.open);
    messages.setAttribute("aria-label", copy.conversation);
    pauseButton.textContent = copy[pauseButton.getAttribute("aria-pressed") === "true" ? "resumeOrb" : "pauseOrb"];
    renderFeedback();
    updateControls();
  };

  languageSelect.addEventListener("change", () => {
    if (languageSelect.value !== "en" && languageSelect.value !== "es") return;
    language = languageSelect.value;
    localizeInterface();
  });
  starters.forEach((button) => button.addEventListener("click", () => {
    if (busy || availability !== "available") return;
    const starter = GUIDED_PROMPTS[language].find((entry) => entry.id === button.dataset.chatStarter);
    if (!starter) return;
    input.value = starter.prompt;
    updateControls();
    input.focus({ preventScroll: true });
  }));

  toggle.addEventListener("click", () => {
    if (open) closePanel(true);
    else openPanel();
  });
  closeButton.addEventListener("click", () => closePanel(true));
  retryButton.addEventListener("click", () => { void refreshAvailability(); });
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
      || Array.from(text).length > MAX_MESSAGE_CHARACTERS
    ) return;

    busy = true;
    setError();
    guide.open = false;
    const requestLanguage = language;
    const userMessage: ChatMessage = { role: "user", content: text };
    const requestMessages = [...history, userMessage].slice(-MAX_HISTORY_MESSAGES);
    const pendingMessage = renderMessage(userMessage, true);
    input.value = "";
    setStatus("preparing");
    updateControls();

    const request = { controller: new AbortController(), pendingMessage, text };
    chatRequest = request;
    let failure: ChatError = { kind: "failure" };
    try {
      const { response, payload } = await fetchJsonWithTimeout(
        "/api/chat",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: requestMessages, language: requestLanguage }),
        },
        request.controller,
        CHAT_TIMEOUT_MS,
      );
      if (chatRequest !== request || request.controller.signal.aborted) return;
      const reply = response.ok ? parseChatReply(payload) : undefined;
      if (!reply) {
        if (response.status === 503) setAvailability("unavailable");
        if (response.status === 429) {
          failure = { kind: "rateLimit", retrySeconds: retryAfterSeconds(response.headers.get("Retry-After"), Date.now()) };
        }
        throw new Error("invalid_response");
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: reply.message,
        sourceIds: reply.sources.map((source) => source.id),
      };
      history = [...requestMessages, assistantMessage].slice(-MAX_HISTORY_MESSAGES);
      renderMessage(assistantMessage, false, reply.sources, requestLanguage);
      setStatus("received");
    } catch (error) {
      if (chatRequest !== request) return;
      pendingMessage.remove();
      input.value = text;
      setError(error instanceof DOMException && error.name === "TimeoutError" ? { kind: "timeout" } : failure);
      setStatus(availability === "available" ? "noAnswer" : "unavailable");
    } finally {
      if (chatRequest !== request) return;
      chatRequest = undefined;
      busy = false;
      updateControls();
      if (open) {
        (availability === "available" ? input : retryButton).focus({ preventScroll: true });
      }
    }
  });

  window.addEventListener("pagehide", (event) => {
    closePanel(false);
    if (!event.persisted) {
      history = [];
      disposeOrb();
    }
  });

  localizeInterface();
}

const chatRoot = document.querySelector<HTMLElement>("[data-portfolio-chat]");
if (chatRoot) mountChatWidget(chatRoot);
