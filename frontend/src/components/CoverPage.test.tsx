import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import CoverPage from "./CoverPage";
import { emptyParty, type DraftState } from "@/lib/documents";
import { loadDocument } from "@/test/documents";

const pilot = loadDocument("pilot-agreement");

describe("CoverPage", () => {
  afterEach(cleanup);

  it("lists every key term with its value or a placeholder", () => {
    const draft: DraftState = { documentId: pilot.id, fields: { pilotPeriod: "60 days" }, parties: {} };
    render(<CoverPage doc={pilot} draft={draft} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Pilot Agreement");
    for (const field of pilot.fields) expect(screen.getByRole("heading", { name: field.label })).toBeTruthy();
    expect(screen.getByText("60 days")).toBeTruthy();
    expect(screen.getByText("[Governing Law]")).toBeTruthy();
  });

  it("has a signature column per party with their details", () => {
    const draft: DraftState = {
      documentId: pilot.id,
      fields: {},
      parties: { provider: { ...emptyParty, company: "Acme Inc", name: "Ann Lee" } },
    };
    render(<CoverPage doc={pilot} draft={draft} />);
    expect(screen.getAllByRole("columnheader").map((th) => th.textContent)).toEqual(["CUSTOMER", "PROVIDER"]);
    expect(screen.getByText("Acme Inc")).toBeTruthy();
    expect(screen.getByText("Ann Lee")).toBeTruthy();
  });
});
