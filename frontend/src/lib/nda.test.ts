import { describe, expect, it } from "vitest";
import {
  clampYears,
  coverPageValue,
  defaultFormData,
  describeConfidentialityTerm,
  describeMndaTerm,
  documentFileName,
  formatDate,
  formatYears,
  todayIso,
  type NdaFormData,
} from "./nda";

const withData = (overrides: Partial<NdaFormData>): NdaFormData => ({
  ...defaultFormData,
  ...overrides,
});

describe("todayIso", () => {
  it("formats the local date as yyyy-mm-dd", () => {
    expect(todayIso(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("formatDate", () => {
  it("formats an ISO date in long form without shifting the day", () => {
    expect(formatDate("2026-10-01")).toBe("October 1, 2026");
  });

  it("returns an empty string for blank or malformed input", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate("10/01/2026")).toBe("");
  });
});

describe("clampYears", () => {
  it("rounds to a whole number within 1-99", () => {
    expect(clampYears(1.5)).toBe(2);
    expect(clampYears(0)).toBe(1);
    expect(clampYears(-3)).toBe(1);
    expect(clampYears(1000)).toBe(99);
    expect(clampYears(Number.NaN)).toBe(1);
  });
});

describe("formatYears", () => {
  it("pluralizes correctly", () => {
    expect(formatYears(1)).toBe("1 year");
    expect(formatYears(3)).toBe("3 years");
  });
});

describe("describeMndaTerm", () => {
  it("describes a fixed term", () => {
    expect(describeMndaTerm(withData({ mndaTermYears: 2 }))).toBe(
      "Expires 2 years from Effective Date.",
    );
  });

  it("describes a term that continues until terminated", () => {
    expect(describeMndaTerm(withData({ mndaTermType: "untilTerminated" }))).toBe(
      "Continues until terminated in accordance with the terms of the MNDA.",
    );
  });
});

describe("describeConfidentialityTerm", () => {
  it("describes a fixed term with the trade secret carve-out", () => {
    expect(describeConfidentialityTerm(withData({ confidentialityTermYears: 5 }))).toMatch(
      /^5 years from Effective Date, but in the case of trade secrets/,
    );
  });

  it("describes a perpetual term", () => {
    expect(describeConfidentialityTerm(withData({ confidentialityTermType: "perpetual" }))).toBe(
      "In perpetuity.",
    );
  });
});

describe("coverPageValue", () => {
  it("substitutes governing law and jurisdiction, trimmed", () => {
    const data = withData({ governingLaw: " Delaware ", jurisdiction: "New Castle, DE" });
    expect(coverPageValue("Governing Law", data)).toBe("Delaware");
    expect(coverPageValue("Jurisdiction", data)).toBe("New Castle, DE");
  });

  it("returns an empty string for substitutable fields not yet filled in", () => {
    expect(coverPageValue("Governing Law", defaultFormData)).toBe("");
  });

  it("returns null for defined terms that stay as references", () => {
    for (const label of ["Purpose", "Effective Date", "MNDA Term", "Term of Confidentiality"]) {
      expect(coverPageValue(label, defaultFormData)).toBeNull();
    }
  });
});

describe("documentFileName", () => {
  it("includes the party companies when present", () => {
    const data = withData({
      party1: { ...defaultFormData.party1, company: "Acme Inc." },
      party2: { ...defaultFormData.party2, company: " Globex " },
    });
    expect(documentFileName(data)).toBe("Mutual-NDA - Acme Inc. - Globex");
  });

  it("falls back to a generic name", () => {
    expect(documentFileName(defaultFormData)).toBe("Mutual-NDA");
  });
});
