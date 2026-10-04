import { afterEach, describe, expect, it, vi } from "vitest";
import { applyResponse, sendChat, type ChatResponse } from "./chat";
import { emptyDraft, emptyParty, todayIso, type DraftState } from "./documents";

const nda: DraftState = {
  documentId: "mutual-nda",
  fields: { purpose: "Joint venture", governingLaw: "Delaware" },
  parties: { party1: { ...emptyParty, company: "Acme Inc", name: "Ann Lee" } },
};

function response(overrides: Partial<ChatResponse>): ChatResponse {
  return { reply: "", documentId: "mutual-nda", fields: {}, parties: {}, ...overrides };
}

describe("applyResponse", () => {
  it("merges field updates and keeps existing values", () => {
    const next = applyResponse(nda, response({ fields: { jurisdiction: "New Castle, DE" } }));
    expect(next.fields).toEqual({ ...nda.fields, jurisdiction: "New Castle, DE" });
  });

  it("merges party updates without clearing other details", () => {
    const next = applyResponse(nda, response({ parties: { party1: { title: "CEO" }, party2: { company: "Globex" } } }));
    expect(next.parties.party1).toEqual({ ...emptyParty, company: "Acme Inc", name: "Ann Lee", title: "CEO" });
    expect(next.parties.party2).toEqual({ ...emptyParty, company: "Globex" });
  });

  it("starts a blank draft when the document is chosen or switched", () => {
    const chosen = applyResponse(emptyDraft, response({ documentId: "pilot-agreement", fields: { pilotPeriod: "60 days" } }));
    expect(chosen).toEqual({ documentId: "pilot-agreement", fields: { pilotPeriod: "60 days" }, parties: {} });
    const switched = applyResponse(nda, response({ documentId: "pilot-agreement" }));
    expect(switched).toEqual({ documentId: "pilot-agreement", fields: {}, parties: {} });
  });

  it("leaves the draft unchanged while no document is chosen", () => {
    expect(applyResponse(emptyDraft, response({ documentId: null }))).toEqual(emptyDraft);
  });
});

describe("sendChat", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("posts the conversation, draft and local date as JSON", async () => {
    const turn = response({ reply: "Hi" });
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(turn)));
    vi.stubGlobal("fetch", fetchMock);
    const messages = [{ role: "user" as const, content: "hello" }];

    await expect(sendChat(messages, nda)).resolves.toEqual(turn);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/chat");
    expect(JSON.parse(init.body)).toEqual({ ...nda, messages, today: todayIso() });
  });

  it("throws on an error response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));
    await expect(sendChat([], emptyDraft)).rejects.toThrow("500");
  });
});
