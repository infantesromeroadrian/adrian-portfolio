import {
  MAX_ASSISTANT_CHARACTERS,
  MAX_CHAT_SOURCES,
  MAX_SOURCE_HREF_CHARACTERS,
  MAX_SOURCE_ID_CHARACTERS,
  MAX_SOURCE_LIMITATION_CHARACTERS,
  MAX_SOURCE_TITLE_CHARACTERS,
  SOURCE_DATE_PATTERN,
} from "./chat-contract.ts";
import type { ChatLanguage, ChatReply, ChatSource, ChatSourceKind } from "./chat-contract.ts";

const english = {
  assistantLabel: "AI portfolio assistant",
  eyebrow: "Portfolio assistant",
  title: "Ask about the work",
  language: "Chat language",
  open: "Open AI portfolio assistant",
  close: "Close AI portfolio assistant",
  toggle: "Ask AI",
  notice: "AI assistant. Answers use public portfolio information and may be wrong. This conversation is not persisted.",
  security: "How this assistant is secured",
  publicFacts: "Answers only from public portfolio facts.",
  untrusted: "Treats your messages as untrusted data.",
  rateLimited: "Rate-limited per visitor.",
  plainText: "Replies appear as plain text, never HTML. The conversation is not saved in your browser.",
  guide: "Explore the work",
  checking: "Checking availability…",
  ready: "Ask about the public work in this portfolio.",
  unavailable: "The assistant is unavailable right now. Check availability again or browse the portfolio.",
  preparing: "Preparing an answer…",
  received: "Answer received. AI responses may be wrong.",
  noAnswer: "No answer was received. You can try again.",
  retry: "Check availability again",
  conversation: "Conversation with the portfolio assistant",
  inputLabel: "Your message",
  placeholder: "Ask about this portfolio",
  send: "Send",
  sending: "Sending…",
  pauseOrb: "Pause orb motion",
  resumeOrb: "Resume orb motion",
  user: "You",
  assistant: "AI assistant",
  evidence: "Public evidence",
  professional: "Professional case",
  conceptual: "Conceptual study",
  htb: "HTB write-up",
  reviewed: "Evidence reviewed",
  limitation: "Evidence limit",
  newTab: "(opens in a new tab)",
  failure: "The assistant could not answer right now. Your draft is kept below. Please try again.",
  timeout: "The assistant took too long to respond. Your draft is kept below. Please try again.",
  rateLimit: "The assistant is receiving too many requests. Please try again later.",
};

export type ChatCopyKey = keyof typeof english;

export const CHAT_COPY = {
  en: english,
  es: {
    assistantLabel: "Asistente de IA del portfolio",
    eyebrow: "Asistente del portfolio",
    title: "Pregunte sobre el trabajo",
    language: "Idioma del chat",
    open: "Abrir el asistente de IA del portfolio",
    close: "Cerrar el asistente de IA del portfolio",
    toggle: "Pregunte a la IA",
    notice: "Asistente de IA. Responde con información pública del portfolio y puede equivocarse. Esta conversación no se guarda.",
    security: "Cómo se protege este asistente",
    publicFacts: "Responde solo con hechos públicos del portfolio.",
    untrusted: "Trata sus mensajes como datos no fiables.",
    rateLimited: "Limita las peticiones por visitante.",
    plainText: "Las respuestas son texto sin formato, nunca HTML. La conversación no se guarda en su navegador.",
    guide: "Explore el trabajo",
    checking: "Comprobando disponibilidad…",
    ready: "Pregunte sobre el trabajo público de este portfolio.",
    unavailable: "El asistente no está disponible ahora. Compruebe la disponibilidad de nuevo o explore el portfolio.",
    preparing: "Preparando una respuesta…",
    received: "Respuesta recibida. La IA puede equivocarse.",
    noAnswer: "No se ha recibido una respuesta. Puede intentarlo de nuevo.",
    retry: "Comprobar disponibilidad de nuevo",
    conversation: "Conversación con el asistente del portfolio",
    inputLabel: "Su mensaje",
    placeholder: "Pregunte sobre este portfolio",
    send: "Enviar",
    sending: "Enviando…",
    pauseOrb: "Pausar el movimiento del orbe",
    resumeOrb: "Reanudar el movimiento del orbe",
    user: "Usted",
    assistant: "Asistente de IA",
    evidence: "Evidencia pública",
    professional: "Caso profesional",
    conceptual: "Estudio conceptual",
    htb: "Análisis de HTB",
    reviewed: "Evidencia revisada",
    limitation: "Límite de la evidencia",
    newTab: "(se abre en una pestaña nueva)",
    failure: "El asistente no ha podido responder ahora. Su borrador se conserva abajo. Inténtelo de nuevo.",
    timeout: "El asistente ha tardado demasiado en responder. Su borrador se conserva abajo. Inténtelo de nuevo.",
    rateLimit: "El asistente está recibiendo demasiadas peticiones. Inténtelo más tarde.",
  },
} satisfies Record<ChatLanguage, Record<ChatCopyKey, string>>;

export const GUIDED_PROMPTS = {
  en: [
    { id: "security", label: "AI Security", prompt: "What public work shows Adrián’s approach to AI security?" },
    { id: "red-team", label: "Red teaming", prompt: "What do the HTB write-ups demonstrate, and what do they not prove?" },
    { id: "rag", label: "RAG / Guardrails", prompt: "How do the RAG and guardrail cases protect data and preserve state?" },
    { id: "evaluation", label: "Evaluation", prompt: "How does the advisory evaluation harness assess responses, and what are its limits?" },
  ],
  es: [
    { id: "security", label: "Seguridad de IA", prompt: "¿Qué trabajos públicos muestran el enfoque de Adrián sobre seguridad de IA?" },
    { id: "red-team", label: "Red teaming", prompt: "¿Qué demuestran los análisis de HTB y qué no permiten afirmar?" },
    { id: "rag", label: "RAG / Guardrails", prompt: "¿Cómo protegen los datos y conservan el estado los casos de RAG y guardrails?" },
    { id: "evaluation", label: "Evaluación", prompt: "¿Cómo evalúa respuestas el harness orientativo y cuáles son sus límites?" },
  ],
} as const;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedText(value: unknown, limit: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= limit;
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !SOURCE_DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function safeSourceHref(href: string, kind: ChatSourceKind): boolean {
  // Match raw local paths before URL normalization can erase traversal segments.
  if (kind === "professional") return /^\/work\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(href);
  if (kind === "conceptual") return /^\/architecture\/[a-z0-9]+(?:-[a-z0-9]+)*\.html$/.test(href);
  try {
    const url = new URL(href);
    if (url.protocol !== "https:" || url.host !== "medium.com" || url.username || url.password || href.includes("?") || href.includes("#")) return false;
    const path = decodeURIComponent(url.pathname);
    return href === url.href
      && /^\/@infantesromeroadrian\/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*-[a-f0-9]{12}$/u.test(path);
  } catch {
    return false;
  }
}

function validSource(value: unknown): value is ChatSource {
  if (!isRecord(value)) return false;
  const allowedKeys = ["id", "kind", "title", "href", "reviewedOn", "limitation"];
  if (Object.keys(value).some((key) => !allowedKeys.includes(key))) return false;
  if (value.kind !== "professional" && value.kind !== "conceptual" && value.kind !== "htb") return false;
  const idPrefix = { professional: "work:", conceptual: "concept:", htb: "htb:" }[value.kind];
  return boundedText(value.id, MAX_SOURCE_ID_CHARACTERS)
    && value.id.startsWith(idPrefix)
    && /^[a-z]+:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.id)
    && boundedText(value.title, MAX_SOURCE_TITLE_CHARACTERS)
    && boundedText(value.href, MAX_SOURCE_HREF_CHARACTERS)
    && safeSourceHref(value.href, value.kind)
    && boundedText(value.limitation, MAX_SOURCE_LIMITATION_CHARACTERS)
    && (!Object.hasOwn(value, "reviewedOn") || validDate(value.reviewedOn));
}

export function parseChatReply(value: unknown): ChatReply | undefined {
  if (!isRecord(value) || Object.keys(value).some((key) => key !== "message" && key !== "sources")) return;
  if (typeof value.message !== "string" || !value.message.trim()
    || Array.from(value.message).length > MAX_ASSISTANT_CHARACTERS || !Array.isArray(value.sources)) return;
  if (value.sources.length > MAX_CHAT_SOURCES || !value.sources.every(validSource)) return;
  if (new Set(value.sources.map((source) => source.id)).size !== value.sources.length) return;
  return { message: value.message.trim(), sources: value.sources };
}

export function retryAfterSeconds(value: string | null, nowMs: number): number | undefined {
  if (!value) return;
  const seconds = /^\d+$/.test(value)
    ? Number(value)
    : (/^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(value)
      ? Math.ceil((Date.parse(value) - nowMs) / 1_000)
      : NaN);
  return Number.isFinite(seconds) && seconds > 0 && seconds <= 86_400 ? seconds : undefined;
}

export function rateLimitMessage(language: ChatLanguage, seconds?: number): string {
  if (seconds === undefined || !Number.isFinite(seconds) || seconds <= 0 || seconds > 86_400) return CHAT_COPY[language].rateLimit;
  const unit = seconds < 60 ? "second" : seconds < 3_600 ? "minute" : "hour";
  const amount = Math.ceil(seconds / (unit === "second" ? 1 : unit === "minute" ? 60 : 3_600));
  const duration = new Intl.NumberFormat(language, { style: "unit", unit, unitDisplay: "long" }).format(amount);
  return language === "es"
    ? `El asistente está recibiendo demasiadas peticiones. Espere ${duration} antes de intentarlo de nuevo.`
    : `The assistant is receiving too many requests. Wait ${duration} before trying again.`;
}

export function formatSourceDate(date: string, language: ChatLanguage): string {
  return new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-GB", {
    dateStyle: "medium", timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
