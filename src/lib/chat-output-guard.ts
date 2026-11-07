/**
 * Deterministic output checks for the portfolio assistant.
 *
 * The system prompt is not a security boundary, so everything checkable without a model is
 * checked here: prompt echo, URLs and domains outside the published set, contact data,
 * unlisted employers or credentials, persona adoption, active markup and profanity. The guard
 * is intentionally conservative and fails closed to SAFE_FALLBACK_MESSAGE; it cannot prove a
 * free-text answer is true, which is why it complements (never replaces) the prompt rules.
 */

export const SAFE_FALLBACK_MESSAGE =
  "I can only answer questions about Adrian Infantes's public portfolio: his roles, certifications, write-ups and architecture studies. Ask about any of those and I will point you to the exact public link.";

export type GuardVerdict =
  | Readonly<{ ok: true }>
  | Readonly<{ ok: false; reason: GuardReason }>;

export type GuardReason =
  | "prompt-echo"
  | "unlisted-url"
  | "contact-data"
  | "unlisted-claim"
  | "persona"
  | "markup"
  | "code"
  | "offensive";

type GuardSources = Readonly<{
  /** Public facts: the source of allowed URLs and of names that may be mentioned. */
  facts: string;
  /** Behavioural rules: text that must never be reproduced verbatim. */
  rules: string;
}>;

export type OutputGuard = Readonly<{ check: (text: string) => GuardVerdict }>;

const SHINGLE_WORDS = 10;
const URL_PATTERN = /\bhttps?:\/\/[^\s<>"'()\]]+/gi;
const BARE_DOMAIN_PATTERN = /\b(?:[a-z0-9-]+\.)+(?:com|net|org|io|ai|dev|app|xyz|ru|cn|info|biz|me|co|es|eu|sh|ly|to)\b(?:\/\S*)?/gi;
const TRAILING_PUNCTUATION = /[.,;:!?]+$/;

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_CANDIDATE = /\+?\d[\d\s().-]{7,}\d/g;

/** Phone numbers: a digit run of at least nine digits. Date ranges such as 2020-2024 stay below that. */
function containsContactData(text: string): boolean {
  if (EMAIL_PATTERN.test(text)) {
    return true;
  }
  return (text.match(PHONE_CANDIDATE) ?? []).some((candidate) => candidate.replace(/\D/g, "").length >= 9);
}

const UNLISTED_CREDENTIALS = [
  "OSCP", "OSCE", "OSWE", "OSEP", "OSED", "CISSP", "CISM", "CISA", "CEH", "GPEN", "GCIH", "GSEC",
  "CRTO", "CRTP", "PNPT", "EJPT", "CCSP", "PMP", "CompTIA", "Security\\+", "PhD", "Ph\\.D", "doctorate", "doctoral",
];
const UNLISTED_CREDENTIAL_PATTERN = new RegExp(`\\b(?:${UNLISTED_CREDENTIALS.join("|")})(?![\\w])`, "i");

/** Employers, institutions and agencies that must not be attributed to Adrian unless the facts say so. */
const NAMED_ORGANISATIONS = [
  "Google", "Microsoft", "Meta", "Facebook", "OpenAI", "Anthropic", "Apple", "Tesla", "NVIDIA", "Netflix",
  "Telefónica", "Santander", "Verisure", "ERNI", "IBM", "Deloitte", "Accenture", "Indra", "NSA", "CIA", "GCHQ",
  "Palantir", "CrowdStrike", "Mandiant", "Oracle", "Salesforce", "Stanford", "MIT", "Harvard", "Oxford",
];

const PERSONA_PATTERNS: readonly RegExp[] = [
  /\b(?:i am|i'm|i’m|you are now|acting as|speaking as|as)\s+(?:now\s+)?(?:dan|stan|dude|an?\s+(?:evil|unfiltered|unrestricted|jailbroken)\s+\w+)\b/i,
  /\bdeveloper mode (?:enabled|activated|on)\b/i,
  /\bjailbreak(?:ed)?\s+(?:mode\s+)?(?:enabled|activated|successful)\b/i,
  /\bi (?:will|shall|can) (?:now )?ignore (?:all |my |the |any )?(?:previous |prior |above )?(?:instructions|rules|guidelines)\b/i,
  /\bi am (?:actually |really )?adrian\b/i,
  /\bin character\b/i,
  /^\s*\[?(?:dan|jailbreak|developer mode)\]?\s*:/im,
];

const MARKUP_PATTERNS: readonly RegExp[] = [
  /<\/?[a-z!][^>]*>/i,
  /!\[[^\]]*\]\([^)]*\)/,
  /\bjavascript:/i,
  /\bdata:[a-z]+\/[a-z0-9.+-]+/i,
];

const OFFENSIVE_PATTERN =
  /\b(?:fuck\w*|shit\w*|bitch\w*|asshole|cunt|motherfuck\w*|nigg\w*|faggot|retard(?:ed)?|puta|cabr[oó]n|gilipollas|hijo de puta|mierda)\b/i;

const CODE_FENCE = /```|~~~/;
const CODE_LINE = /^\s*(?:def |function |class |import |from \S+ import |#include|#!\/|const |let |var |public |private |return |if \(|for \(|while \(|SELECT\b.+\bFROM\b)/;
const INLINE_SQL = /\bSELECT\b[^.\n]{1,80}\bFROM\b/;

/**
 * The assistant has no legitimate reason to return source code. Fenced blocks, inline SQL, or
 * code-looking lines in relevant proportion (two or more, or a third of the lines) count.
 */
function looksLikeCode(text: string): boolean {
  if (CODE_FENCE.test(text) || INLINE_SQL.test(text)) {
    return true;
  }
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  const codeLines = lines.filter((line) => CODE_LINE.test(line)).length;
  return codeLines >= 2 || (lines.length > 0 && codeLines / lines.length >= 1 / 3);
}

function words(text: string): readonly string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(" ")
    .filter(Boolean);
}

function shingles(text: string, size: number): ReadonlySet<string> {
  const tokens = words(text);
  const found = new Set<string>();
  for (let index = 0; index + size <= tokens.length; index += 1) {
    found.add(tokens.slice(index, index + size).join(" "));
  }
  return found;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createOutputGuard(sources: GuardSources): OutputGuard {
  const allowedUrls = new Set(
    (sources.facts.match(URL_PATTERN) ?? []).map((url) => url.replace(TRAILING_PUNCTUATION, "")),
  );
  const allowedHosts = new Set([...allowedUrls].map((url) => new URL(url).hostname.toLowerCase()));
  const ruleShingles = shingles(sources.rules, SHINGLE_WORDS);
  const factsLower = sources.facts.toLowerCase();
  const forbiddenOrganisations = NAMED_ORGANISATIONS
    .filter((name) => !factsLower.includes(name.toLowerCase()))
    .map((name) => new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(name)}(?![\\p{L}\\p{N}])`, "u"));

  function check(text: string): GuardVerdict {
    for (const shingle of shingles(text, SHINGLE_WORDS)) {
      if (ruleShingles.has(shingle)) {
        return { ok: false, reason: "prompt-echo" };
      }
    }

    for (const raw of text.match(URL_PATTERN) ?? []) {
      if (!allowedUrls.has(raw.replace(TRAILING_PUNCTUATION, ""))) {
        return { ok: false, reason: "unlisted-url" };
      }
    }
    const withoutUrls = text.replace(URL_PATTERN, " ");
    if (containsContactData(withoutUrls)) {
      return { ok: false, reason: "contact-data" };
    }
    for (const domain of withoutUrls.match(BARE_DOMAIN_PATTERN) ?? []) {
      const host = domain.split("/", 1)[0]?.toLowerCase() ?? "";
      if (!allowedHosts.has(host)) {
        return { ok: false, reason: "unlisted-url" };
      }
    }

    if (
      UNLISTED_CREDENTIAL_PATTERN.test(text) ||
      forbiddenOrganisations.some((pattern) => pattern.test(text))
    ) {
      return { ok: false, reason: "unlisted-claim" };
    }
    if (PERSONA_PATTERNS.some((pattern) => pattern.test(text))) {
      return { ok: false, reason: "persona" };
    }
    if (MARKUP_PATTERNS.some((pattern) => pattern.test(text))) {
      return { ok: false, reason: "markup" };
    }
    if (looksLikeCode(text)) {
      return { ok: false, reason: "code" };
    }
    if (OFFENSIVE_PATTERN.test(text)) {
      return { ok: false, reason: "offensive" };
    }
    return { ok: true };
  }

  return { check };
}
