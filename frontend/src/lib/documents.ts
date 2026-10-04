/**
 * Supported documents (templates/documents.json) and the state of a draft.
 * Field values are keyed by field key; party details by party key.
 */

export interface DocumentField {
  key: string;
  label: string;
  description: string;
  example: string;
  /** Substitute the value into the Standard Terms text (e.g. the NDA's Governing Law). */
  inline?: boolean;
}

export interface DocumentParty {
  key: string;
  label: string;
}

export interface DocumentSpec {
  id: string;
  name: string;
  description: string;
  template: string;
  parties: DocumentParty[];
  fields: DocumentField[];
}

/** A document with its Standard Terms markdown, read from templates/ at build time. */
export interface DraftableDocument extends DocumentSpec {
  standardTerms: string;
}

export interface Party {
  company: string;
  name: string;
  title: string;
  noticeAddress: string;
}

export interface DraftState {
  documentId: string | null;
  fields: Record<string, string>;
  parties: Record<string, Party>;
}

export const emptyParty: Party = { company: "", name: "", title: "", noticeAddress: "" };

export const emptyDraft: DraftState = { documentId: null, fields: {}, parties: {} };

export function partyOf(state: DraftState, key: string): Party {
  return state.parties[key] ?? emptyParty;
}

/** Today's date as yyyy-mm-dd in the user's local time zone. */
export function todayIso(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Suggested file name for the downloaded PDF (used as the document title). */
export function documentFileName(doc: DocumentSpec, state: DraftState): string {
  const companies = doc.parties.map((p) => partyOf(state, p.key).company.trim()).filter(Boolean);
  return [doc.name, ...companies].join(" - ");
}
