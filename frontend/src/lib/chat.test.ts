import { afterEach, describe, expect, it, vi } from "vitest";
import { applyUpdates, sendChat } from "./chat";
import { defaultFormData, todayIso } from "./nda";

describe("applyUpdates", () => {
  it("applies non-null values and leaves null or missing fields unchanged", () => {
    const data = { ...defaultFormData, governingLaw: "Delaware" };
    const next = applyUpdates(data, { purpose: "Joint venture", governingLaw: null });
    expect(next.purpose).toBe("Joint venture");
    expect(next.governingLaw).toBe("Delaware");
    expect(next.jurisdiction).toBe("");
  });

  it("merges party fields without clearing the others", () => {
    const data = { ...defaultFormData, party1: { ...defaultFormData.party1, name: "Ann Lee" } };
    const next = applyUpdates(data, { party1: { company: "Acme Inc", name: null } });
    expect(next.party1).toEqual({ ...defaultFormData.party1, name: "Ann Lee", company: "Acme Inc" });
    expect(next.party2).toEqual(defaultFormData.party2);
  });

  it("clamps term years to the allowed range", () => {
    const next = applyUpdates(defaultFormData, { mndaTermYears: 0, confidentialityTermYears: 250 });
    expect(next.mndaTermYears).toBe(1);
    expect(next.confidentialityTermYears).toBe(99);
  });

  it("does not mutate the input", () => {
    const data = structuredClone(defaultFormData);
    applyUpdates(data, { purpose: "x", party1: { name: "y" } });
    expect(data).toEqual(defaultFormData);
  });
});

describe("sendChat", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("posts messages and fields as JSON", async () => {
    const turn = { reply: "Hi", fields: {} };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(turn)));
    vi.stubGlobal("fetch", fetchMock);
    const messages = [{ role: "user" as const, content: "hello" }];

    await expect(sendChat(messages, defaultFormData)).resolves.toEqual(turn);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/chat");
    expect(JSON.parse(init.body)).toEqual({ messages, fields: defaultFormData, today: todayIso() });
  });

  it("throws on an error response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));
    await expect(sendChat([], defaultFormData)).rejects.toThrow("500");
  });
});
