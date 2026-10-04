import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Chat from "./Chat";
import { GREETING } from "@/lib/chat";
import { emptyDraft } from "@/lib/documents";

function mockFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function sendMessage(text: string) {
  fireEvent.change(screen.getByLabelText("Message"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
}

describe("Chat", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("opens with the greeting without calling the API", () => {
    const fetchMock = mockFetch(new Response("{}"));
    render(<Chat draft={emptyDraft} onResponse={() => {}} />);
    expect(screen.getByText(GREETING)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the conversation and draft, shows the reply and reports the response", async () => {
    const turn = { reply: "Which state's law?", documentId: "mutual-nda", fields: { purpose: "Joint venture" }, parties: {} };
    const fetchMock = mockFetch(new Response(JSON.stringify(turn)));
    const onResponse = vi.fn();
    render(<Chat draft={emptyDraft} onResponse={onResponse} />);

    sendMessage("A joint venture between Acme and Globex");

    expect(await screen.findByText("Which state's law?")).toBeTruthy();
    expect(screen.getByText("A joint venture between Acme and Globex")).toBeTruthy();
    expect(onResponse).toHaveBeenCalledWith(turn);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.messages).toEqual([
      { role: "assistant", content: GREETING },
      { role: "user", content: "A joint venture between Acme and Globex" },
    ]);
    expect(body.documentId).toBeNull();
  });

  it("shows an error and restores the message when the request fails", async () => {
    mockFetch(new Response("", { status: 500 }));
    const onResponse = vi.fn();
    render(<Chat draft={emptyDraft} onResponse={onResponse} />);

    sendMessage("Hello");

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect((screen.getByLabelText("Message") as HTMLTextAreaElement).value).toBe("Hello");
    expect(screen.queryByText("Hello", { selector: "p" })).toBeNull();
    expect(onResponse).not.toHaveBeenCalled();
  });

  it("does not send blank messages", () => {
    const fetchMock = mockFetch(new Response("{}"));
    render(<Chat draft={emptyDraft} onResponse={() => {}} />);
    sendMessage("   ");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
