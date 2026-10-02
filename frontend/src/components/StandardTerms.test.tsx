import { readFileSync } from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StandardTerms from "./StandardTerms";
import { defaultFormData } from "@/lib/nda";

const markdown = readFileSync(
  path.join(__dirname, "..", "..", "..", "templates", "Mutual-NDA.md"),
  "utf8",
);

describe("StandardTerms", () => {
  it("renders all 11 numbered sections of the repo template", () => {
    const { container } = render(<StandardTerms markdown={markdown} data={defaultFormData} />);
    expect(container.querySelectorAll("ol > li")).toHaveLength(11);
  });

  it("fills governing law and jurisdiction into the terms", () => {
    const data = { ...defaultFormData, governingLaw: "Delaware", jurisdiction: "New Castle, DE" };
    const { container } = render(<StandardTerms markdown={markdown} data={data} />);
    expect(container.textContent).toContain("the laws of the State of Delaware");
    expect(container.textContent).toContain("courts located in New Castle, DE");
    expect(container.querySelector(".coverpage_link")).toBeNull();
  });

  it("shows placeholders for missing values", () => {
    render(<StandardTerms markdown={markdown} data={defaultFormData} />);
    expect(screen.getAllByText("[Governing Law]").length).toBeGreaterThan(0);
    expect(screen.getAllByText("[Jurisdiction]").length).toBeGreaterThan(0);
  });

  it("renders user input as text, not HTML", () => {
    const data = { ...defaultFormData, governingLaw: "<img src=x onerror=alert(1)>" };
    const { container } = render(<StandardTerms markdown={markdown} data={data} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("<img src=x onerror=alert(1)>");
  });
});
