import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import StandardTerms from "./StandardTerms";
import { emptyDraft, type DraftState } from "@/lib/documents";
import { loadDocument } from "@/test/documents";

const nda = loadDocument("mutual-nda");
const pilot = loadDocument("pilot-agreement");

function renderTerms(doc = nda, fields: Record<string, string> = {}) {
  const draft: DraftState = { ...emptyDraft, documentId: doc.id, fields };
  return render(<StandardTerms markdown={doc.standardTerms} doc={doc} draft={draft} />);
}

describe("StandardTerms", () => {
  afterEach(cleanup);

  it("renders all 11 numbered sections of the NDA template", () => {
    const { container } = renderTerms();
    expect(container.querySelectorAll("ol > li")).toHaveLength(11);
  });

  it("fills inline fields into the terms", () => {
    const { container } = renderTerms(nda, { governingLaw: "Delaware", jurisdiction: "New Castle, DE" });
    expect(container.textContent).toContain("the laws of the State of Delaware");
    expect(container.textContent).toContain("courts located in New Castle, DE");
  });

  it("shows placeholders for missing inline values", () => {
    renderTerms();
    expect(screen.getAllByText("[Governing Law]").length).toBeGreaterThan(0);
    expect(screen.getAllByText("[Jurisdiction]").length).toBeGreaterThan(0);
  });

  it("renders other references as defined terms, even when filled in", () => {
    const { container } = renderTerms(pilot, { pilotPeriod: "Seventy-three days", governingLaw: "Delaware law" });
    const terms = [...container.querySelectorAll(".doc-term-ref")].map((el) => el.textContent);
    expect(terms).toContain("Pilot Period");
    expect(terms).toContain("Customer's");
    expect(container.textContent).not.toContain("Seventy-three days");
    expect(container.textContent).not.toContain("Delaware law");
    expect(container.querySelector('[class$="_link"]')).toBeNull();
  });

  it("renders user input as text, not HTML", () => {
    const { container } = renderTerms(nda, { governingLaw: "<img src=x onerror=alert(1)>" });
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("<img src=x onerror=alert(1)>");
  });
});
