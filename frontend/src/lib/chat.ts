/**
 * Client for the chat API (POST /api/chat). Each assistant turn returns a
 * reply, the chosen document (if any) and the fields and party details it
 * filled in.
 */

import { api } from "@/lib/api";
import { emptyDraft, partyOf, todayIso, type DraftState, type Party } from "@/lib/documents";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  documentId: string | null;
  fields: Record<string, string>;
  parties: Record<string, Partial<Party>>;
}

/** Opening message, shown before any call to the API. */
export const GREETING =
  "Hi! I'm Prelegal's assistant. I can draft NDAs, cloud service, pilot, partnership and other standard agreements. What do you need?";

/** Applies an assistant turn; switching documents starts from a blank draft. */
export function applyResponse(state: DraftState, response: ChatResponse): DraftState {
  const base =
    response.documentId === state.documentId ? state : { ...emptyDraft, documentId: response.documentId };
  const parties = { ...base.parties };
  for (const [key, updates] of Object.entries(response.parties)) {
    parties[key] = { ...partyOf(base, key), ...updates };
  }
  return { documentId: base.documentId, fields: { ...base.fields, ...response.fields }, parties };
}

/**
 * Sends the conversation, the draft and the user's local date (the server's
 * clock may be in another time zone); returns the assistant's turn.
 */
export function sendChat(messages: ChatMessage[], state: DraftState): Promise<ChatResponse> {
  return api<ChatResponse>("/api/chat", { method: "POST", body: { ...state, messages, today: todayIso() } });
}
