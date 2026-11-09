/** Server-only projection: import this from the API, never from browser scripts. */
import type { ChatSource } from "./chat-contract.ts";
import { MAX_CHAT_SOURCES, MAX_SOURCE_ID_CHARACTERS } from "./chat-contract.ts";
import { professionalCases, professionalCasePaths } from "./professional-work.ts";
import { architectureStudies, PORTFOLIO_URL, securityWriteUps } from "./public-work.ts";

const PROFESSIONAL_SOURCES = professionalCases.map((entry) => ({
  id: `work:${entry.slug}`,
  kind: "professional" as const,
  title: entry.title,
  href: professionalCasePaths(entry.slug).page,
  reviewedOn: entry.evidence.reviewedOn,
  limitation: entry.evidence.limitation,
  scope: entry.scope,
  problem: entry.problem,
  constraints: entry.constraints,
  contribution: entry.contribution,
  decisions: entry.decisions,
  evidence: entry.evidence,
}));

const CONCEPTUAL_SOURCES = architectureStudies.map((entry) => ({
  id: `concept:${entry.href.split("/").at(-1)!.replace(/\.html$/, "")}`,
  kind: "conceptual" as const,
  title: entry.title,
  href: entry.href,
  limitation: `Conceptual architecture study, not proof of a professional implementation or production deployment. ${entry.limitation}`,
  scope: entry.scope,
  problem: entry.problem,
  decision: entry.decision,
}));

const HTB_SOURCES = securityWriteUps.map((entry) => ({
  id: `htb:${entry.href.slice(-12)}`,
  kind: "htb" as const,
  title: entry.title,
  href: entry.href,
  limitation: `${entry.scope}, credited to HTB; not an original vulnerability discovery or research paper. ${entry.takeaway}`,
  scope: entry.scope,
  takeaway: entry.takeaway,
}));

export const CHAT_SOURCE_RECORDS = [...PROFESSIONAL_SOURCES, ...CONCEPTUAL_SOURCES, ...HTB_SOURCES];

function sourceCard(record: (typeof CHAT_SOURCE_RECORDS)[number]): ChatSource {
  return {
    id: record.id,
    kind: record.kind,
    title: record.title,
    href: record.href,
    ...("reviewedOn" in record ? { reviewedOn: record.reviewedOn } : {}),
    limitation: record.limitation,
  };
}

const sourcesById = new Map(CHAT_SOURCE_RECORDS.map((record) => [record.id, sourceCard(record)]));

/** References from the model and visitor history are both untrusted; membership is not a truth check. */
export function validSourceIds(value: unknown): value is readonly string[] {
  return Array.isArray(value)
    && value.length <= MAX_CHAT_SOURCES
    && new Set(value).size === value.length
    && value.every((id) => typeof id === "string"
      && id.length <= MAX_SOURCE_ID_CHARACTERS
      && sourcesById.has(id));
}

export function resolveChatSources(ids: readonly string[]): readonly ChatSource[] {
  if (!validSourceIds(ids)) return [];
  return ids.map((id) => ({ ...sourcesById.get(id)! }));
}

export const CHAT_SOURCE_CONTEXT = JSON.stringify(CHAT_SOURCE_RECORDS.map((record) => ({ ...record, href: new URL(record.href, PORTFOLIO_URL).href })));
