/**
 * Data model and pure helpers for the Common Paper Mutual NDA (Version 1.0).
 *
 * The cover page captures the deal-specific values; the Standard Terms
 * (templates/Mutual-NDA.md) reference them by name via
 * `<span class="coverpage_link">…</span>` tags.
 */

export type MndaTermType = "fixed" | "untilTerminated";
export type ConfidentialityTermType = "fixed" | "perpetual";

export interface PartyInfo {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
}

export interface NdaFormData {
  purpose: string;
  /** ISO date (yyyy-mm-dd), empty until set. */
  effectiveDate: string;
  mndaTermType: MndaTermType;
  mndaTermYears: number;
  confidentialityTermType: ConfidentialityTermType;
  confidentialityTermYears: number;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1: PartyInfo;
  party2: PartyInfo;
}

export type PartyKey = "party1" | "party2";

const emptyParty: PartyInfo = {
  name: "",
  title: "",
  company: "",
  noticeAddress: "",
};

export const defaultFormData: NdaFormData = {
  purpose:
    "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: "",
  mndaTermType: "fixed",
  mndaTermYears: 1,
  confidentialityTermType: "fixed",
  confidentialityTermYears: 1,
  governingLaw: "",
  jurisdiction: "",
  modifications: "",
  party1: emptyParty,
  party2: emptyParty,
};

/** Today's date as yyyy-mm-dd in the user's local time zone. */
export function todayIso(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Formats an ISO date as e.g. "October 1, 2026"; returns "" if invalid. */
export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return "";
  const [, y, m, d] = match.map(Number);
  // Construct in local time so the displayed day never shifts by time zone.
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const MAX_TERM_YEARS = 99;

/** Coerces user input to a whole number of years between 1 and 99. */
export function clampYears(years: number): number {
  if (!Number.isFinite(years)) return 1;
  return Math.min(MAX_TERM_YEARS, Math.max(1, Math.round(years)));
}

export function formatYears(years: number): string {
  return `${years} year${years === 1 ? "" : "s"}`;
}

export function describeMndaTerm(data: NdaFormData): string {
  return data.mndaTermType === "fixed"
    ? `Expires ${formatYears(data.mndaTermYears)} from Effective Date.`
    : "Continues until terminated in accordance with the terms of the MNDA.";
}

export function describeConfidentialityTerm(data: NdaFormData): string {
  return data.confidentialityTermType === "fixed"
    ? `${formatYears(data.confidentialityTermYears)} from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
    : "In perpetuity.";
}

/**
 * Value to substitute for a cover page reference in the Standard Terms.
 *
 * Only references that read naturally inline (e.g. "the laws of the State of
 * Delaware") are substituted; this returns the trimmed value, which is "" when
 * not yet filled in. Others such as "Purpose" or "MNDA Term" are defined terms
 * whose values live on the cover page, so this returns null and the reference
 * is rendered as-is.
 */
export function coverPageValue(label: string, data: NdaFormData): string | null {
  switch (label) {
    case "Governing Law":
      return data.governingLaw.trim();
    case "Jurisdiction":
      return data.jurisdiction.trim();
    default:
      return null;
  }
}

/** Suggested file name for the downloaded PDF (used as the document title). */
export function documentFileName(data: NdaFormData): string {
  const companies = [data.party1.company, data.party2.company]
    .map((c) => c.trim())
    .filter(Boolean);
  return ["Mutual-NDA", ...companies].join(" - ");
}
