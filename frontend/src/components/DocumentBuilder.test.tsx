import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DocumentBuilder from "./DocumentBuilder";
import { GREETING } from "@/lib/chat";
import { loadDocument } from "@/test/documents";

const documents = [loadDocument("mutual-nda"), loadDocument("pilot-agreement")];

type Handler = (init: RequestInit) => unknown;

/** Routes fetch calls by "METHOD path" and records request bodies. */
function mockApi(routes: Record<string, Handler>) {
  const calls: { route: string; body: unknown }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (path: string, init: RequestInit) => {
      const route = `${init.method} ${path}`;
      calls.push({ route, body: init.body ? JSON.parse(String(init.body)) : undefined });
      const handler = routes[route];
      if (!handler) return new Response(JSON.stringify({ detail: "not found" }), { status: 404 });
      return new Response(JSON.stringify(handler(init)));
    }),
  );
  return calls;
}

function send(text: string) {
  fireEvent.change(screen.getByLabelText("Message"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
}

/** Echoes a saved draft the way the API returns it. */
const saved = (id: number) => (init: RequestInit) => ({
  id,
  ...JSON.parse(String(init.body)),
  createdAt: "2026-10-04T12:00:00Z",
  updatedAt: "2026-10-04T12:00:00Z",
});

const turn = (reply: string, fields: Record<string, string> = {}) => ({
  reply,
  documentId: "pilot-agreement",
  fields,
  parties: {},
});

describe("DocumentBuilder", () => {
  beforeEach(() => window.history.replaceState(null, "", "/draft/"));
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("does not save before a document is chosen", async () => {
    const calls = mockApi({
      "POST /api/chat": () => ({ reply: "Which agreement?", documentId: null, fields: {}, parties: {} }),
    });
    render(<DocumentBuilder documents={documents} draftId={null} />);
    send("Hi");
    expect(await screen.findByText("Which agreement?")).toBeTruthy();
    expect(calls.map((c) => c.route)).toEqual(["POST /api/chat"]);
    expect(screen.getByRole("button", { name: "Download PDF" })).toHaveProperty("disabled", true);
  });

  it("creates the draft on the first turn with a document, then updates it", async () => {
    let replies = 0;
    const calls = mockApi({
      "POST /api/chat": () => turn(`Reply ${++replies}`, { pilotPeriod: "60 days" }),
      "POST /api/drafts": saved(7),
      "PUT /api/drafts/7": saved(7),
    });
    render(<DocumentBuilder documents={documents} draftId={null} />);

    send("A 60 day pilot");
    expect(await screen.findByText("Saved")).toBeTruthy();
    expect(window.location.search).toBe("?id=7");
    const created = calls.find((c) => c.route === "POST /api/drafts")!.body;
    expect(created).toMatchObject({ documentId: "pilot-agreement", fields: { pilotPeriod: "60 days" } });
    expect((created as { messages: unknown[] }).messages).toEqual([
      { role: "assistant", content: GREETING },
      { role: "user", content: "A 60 day pilot" },
      { role: "assistant", content: "Reply 1" },
    ]);

    send("Delaware law");
    await screen.findByText("Reply 2");
    await vi.waitFor(() => expect(calls.at(-1)!.route).toBe("PUT /api/drafts/7"));
    expect(calls.filter((c) => c.route === "POST /api/drafts")).toHaveLength(1);
  });

  it("reopening a draft created earlier loads its latest saved version", async () => {
    let replies = 0;
    const calls = mockApi({
      "POST /api/chat": () => turn(`Reply ${++replies}`),
      "POST /api/drafts": saved(7),
      "PUT /api/drafts/7": saved(7),
      "GET /api/drafts/7": () => ({
        id: 7,
        documentId: "pilot-agreement",
        fields: {},
        parties: {},
        messages: [{ role: "assistant", content: "Latest saved turn" }],
        updatedAt: "2026-10-04T12:00:00Z",
        createdAt: "2026-10-04T12:00:00Z",
      }),
    });
    const first = render(<DocumentBuilder documents={documents} draftId={null} />);
    send("A pilot");
    await screen.findByText("Saved");
    first.unmount();

    // The new ?id=7 URL remounts the builder, which takes over the created draft without fetching.
    const remounted = render(<DocumentBuilder documents={documents} draftId={7} />);
    expect(screen.getByText("Reply 1")).toBeTruthy();
    send("Delaware law");
    await screen.findByText("Reply 2");
    await vi.waitFor(() => expect(calls.at(-1)!.route).toBe("PUT /api/drafts/7"));
    expect(calls.map((c) => c.route)).not.toContain("GET /api/drafts/7");
    remounted.unmount();

    // Later, e.g. from the documents list, the same draft is opened again.
    render(<DocumentBuilder documents={documents} draftId={7} />);
    expect(await screen.findByText("Latest saved turn")).toBeTruthy();
    expect(calls.map((c) => c.route)).toContain("GET /api/drafts/7");
  });

  it("opens a saved draft with its conversation and preview", async () => {
    mockApi({
      "GET /api/drafts/3": () => ({
        id: 3,
        documentId: "pilot-agreement",
        fields: { pilotPeriod: "Seventy-three days" },
        parties: {},
        messages: [{ role: "user", content: "Earlier message" }],
        updatedAt: "2026-10-04T12:00:00Z",
        createdAt: "2026-10-04T12:00:00Z",
      }),
    });
    render(<DocumentBuilder documents={documents} draftId={3} />);
    expect(await screen.findByText("Earlier message")).toBeTruthy();
    expect(screen.getByText("Seventy-three days")).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 1, name: "Pilot Agreement" }).length).toBeGreaterThan(0);
  });

  it("explains when a draft cannot be opened", async () => {
    mockApi({});
    render(<DocumentBuilder documents={documents} draftId={99} />);
    expect((await screen.findByRole("alert")).textContent).toContain("This draft could not be opened");
  });
});
