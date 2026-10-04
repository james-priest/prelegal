import { describe, expect, it } from "vitest";
import { partiesLabel, updatedLabel } from "./drafts";
import { emptyParty } from "./documents";
import { loadDocument } from "@/test/documents";

describe("partiesLabel", () => {
  const pilot = loadDocument("pilot-agreement");

  it("joins companies in the document's party order", () => {
    const parties = { provider: { ...emptyParty, company: "Acme" }, customer: { ...emptyParty, company: "Globex" } };
    expect(partiesLabel(pilot, parties)).toBe("Globex and Acme");
  });

  it("skips parties without a company", () => {
    expect(partiesLabel(pilot, { provider: { ...emptyParty, company: "Acme" } })).toBe("Acme");
    expect(partiesLabel(pilot, {})).toBe("");
  });
});

describe("updatedLabel", () => {
  const now = new Date("2026-10-04T12:00:00Z");

  it("describes how long ago the draft changed", () => {
    expect(updatedLabel("2026-10-04T11:59:40Z", now)).toBe("Updated just now");
    expect(updatedLabel("2026-10-04T11:55:00Z", now)).toBe("Updated 5 minutes ago");
    expect(updatedLabel("2026-10-04T09:00:00Z", now)).toBe("Updated 3 hours ago");
    expect(updatedLabel("2026-10-03T08:00:00Z", now)).toBe("Updated yesterday");
  });
});
