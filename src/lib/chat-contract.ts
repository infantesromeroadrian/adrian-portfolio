/** Browser-safe wire types and bounds. Keep source catalogues, prompts and credentials out of this module. */
export type ChatLanguage = "en" | "es";
export type ChatSourceKind = "professional" | "conceptual" | "htb";

export const MAX_CHAT_MESSAGES = 8;
export const MAX_USER_CHARACTERS = 2_000;
export const MAX_ASSISTANT_CHARACTERS = 4_000;
export const MAX_CHAT_SOURCES = 3;
export const MAX_SOURCE_ID_CHARACTERS = 100;
export const MAX_SOURCE_TITLE_CHARACTERS = 240;
export const MAX_SOURCE_HREF_CHARACTERS = 600;
export const MAX_SOURCE_LIMITATION_CHARACTERS = 1_600;
export const SOURCE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type ChatSource = Readonly<{
  id: string;
  kind: ChatSourceKind;
  title: string;
  href: string;
  reviewedOn?: string;
  limitation: string;
}>;

export type ChatMessage =
  | Readonly<{ role: "user"; content: string }>
  | Readonly<{ role: "assistant"; content: string; sourceIds?: readonly string[] }>;

export type ChatRequest = Readonly<{
  messages: readonly ChatMessage[];
  language?: ChatLanguage;
}>;

export type ChatReply = Readonly<{
  message: string;
  sources: readonly ChatSource[];
}>;
