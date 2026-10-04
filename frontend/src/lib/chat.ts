/**
 * Client for the NDA chat API (POST /api/chat). The assistant replies with a
 * message plus field updates, where null means "leave unchanged".
 */

import { clampYears, todayIso, type NdaFormData, type PartyInfo, type PartyKey } from "@/lib/nda";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type PartyUpdates = { [K in keyof PartyInfo]?: string | null };

export type FieldUpdates = {
  [K in Exclude<keyof NdaFormData, PartyKey>]?: NdaFormData[K] | null;
} & { party1?: PartyUpdates; party2?: PartyUpdates };

export interface ChatTurn {
  reply: string;
  fields: FieldUpdates;
}

/** Opening message, shown before any call to the API. */
export const GREETING =
  "Hi! I'll help you draft a Mutual NDA. To start, what is the purpose of the agreement, and which two companies are involved?";

type NonNullFields<T> = { [K in keyof T]?: NonNullable<T[K]> };

function withoutNulls<T extends object>(updates: T): NonNullFields<T> {
  return Object.fromEntries(Object.entries(updates).filter(([, v]) => v != null)) as NonNullFields<T>;
}

/** Merges the assistant's non-null field updates into the form data. */
export function applyUpdates(data: NdaFormData, updates: FieldUpdates): NdaFormData {
  const { party1 = {}, party2 = {}, ...rest } = updates;
  const next: NdaFormData = {
    ...data,
    ...withoutNulls(rest),
    party1: { ...data.party1, ...withoutNulls(party1) },
    party2: { ...data.party2, ...withoutNulls(party2) },
  };
  return {
    ...next,
    mndaTermYears: clampYears(next.mndaTermYears),
    confidentialityTermYears: clampYears(next.confidentialityTermYears),
  };
}

/**
 * Sends the conversation, current fields and the user's local date (the
 * server's clock may be in another time zone); returns the assistant's turn.
 */
export async function sendChat(messages: ChatMessage[], fields: NdaFormData): Promise<ChatTurn> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, fields, today: todayIso() }),
  });
  if (!response.ok) throw new Error(`Chat request failed (${response.status})`);
  return response.json();
}
