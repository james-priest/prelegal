import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError } from "./api";

function mockFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("api", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends JSON and returns the parsed body", async () => {
    const fetchMock = mockFetch(new Response(JSON.stringify({ ok: true })));
    await expect(api("/api/x", { method: "POST", body: { a: 1 } })).resolves.toEqual({ ok: true });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(init.body).toBe('{"a":1}');
  });

  it("returns undefined for 204 No Content", async () => {
    mockFetch(new Response(null, { status: 204 }));
    await expect(api("/api/x", { method: "POST" })).resolves.toBeUndefined();
  });

  it("raises the FastAPI detail message with the status", async () => {
    mockFetch(new Response(JSON.stringify({ detail: "Not signed in" }), { status: 401 }));
    await expect(api("/api/x")).rejects.toEqual(new ApiError(401, "Not signed in"));
  });

  it("uses the first validation error message", async () => {
    const body = { detail: [{ msg: "value is not a valid email address" }] };
    mockFetch(new Response(JSON.stringify(body), { status: 422 }));
    await expect(api("/api/x")).rejects.toThrow("value is not a valid email address");
  });
});
