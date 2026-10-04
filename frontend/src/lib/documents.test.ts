import { describe, expect, it } from "vitest";
import { documentFileName, emptyDraft, emptyParty, todayIso } from "./documents";
import { loadDocument } from "@/test/documents";

describe("todayIso", () => {
  it("formats the local date as yyyy-mm-dd", () => {
    expect(todayIso(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("documentFileName", () => {
  const pilot = loadDocument("pilot-agreement");

  it("joins the document name and the companies filled in so far", () => {
    const draft = { ...emptyDraft, parties: { provider: { ...emptyParty, company: " Acme " } } };
    expect(documentFileName(pilot, draft)).toBe("Pilot Agreement - Acme");
  });

  it("is just the document name before any company is known", () => {
    expect(documentFileName(pilot, emptyDraft)).toBe("Pilot Agreement");
  });
});
