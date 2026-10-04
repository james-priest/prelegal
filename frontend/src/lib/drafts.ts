/** Saved drafts API, plus helpers for showing drafts in lists. */

import { api } from "@/lib/api";
import type { ChatMessage } from "@/lib/chat";
import type { DocumentSpec, DraftState, Party } from "@/lib/documents";

export interface DraftSummary {
  id: number;
  documentId: string;
  parties: Record<string, Party>;
  updatedAt: string;
}

export interface SavedDraft extends DraftSummary {
  fields: Record<string, string>;
  messages: ChatMessage[];
  createdAt: string;
}

/** What the builder saves after each chat turn, once a document is chosen. */
export interface DraftContent {
  documentId: string;
  fields: Record<string, string>;
  parties: Record<string, Party>;
  messages: ChatMessage[];
}

export const listDrafts = () => api<DraftSummary[]>("/api/drafts");

export const getDraft = (id: number) => api<SavedDraft>(`/api/drafts/${id}`);

export const createDraft = (content: DraftContent) => api<SavedDraft>("/api/drafts", { method: "POST", body: content });

export const updateDraft = (id: number, content: DraftContent) =>
  api<SavedDraft>(`/api/drafts/${id}`, { method: "PUT", body: content });

export function toDraftState(draft: SavedDraft): DraftState {
  return { documentId: draft.documentId, fields: draft.fields, parties: draft.parties };
}

/** "Acme Inc and Globex LLC", in the document's party order; "" before any company is known. */
export function partiesLabel(doc: DocumentSpec, parties: Record<string, Party>): string {
  const companies = doc.parties.map((p) => parties[p.key]?.company.trim()).filter(Boolean);
  return companies.join(" and ");
}

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

/** "Updated 5 minutes ago", "Updated yesterday", or "Updated just now". */
export function updatedLabel(updatedAt: string, now: Date = new Date()): string {
  const elapsed = now.getTime() - new Date(updatedAt).getTime();
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, ms] of units) {
    if (elapsed >= ms) return `Updated ${format.format(-Math.floor(elapsed / ms), unit)}`;
  }
  return "Updated just now";
}
