import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import NdaChat from "./NdaChat";
import { GREETING } from "@/lib/chat";
import { defaultFormData } from "@/lib/nda";

function mockFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function sendMessage(text: string) {
  fireEvent.change(screen.getByLabelText("Message"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
}

describe("NdaChat", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("opens with the greeting without calling the API", () => {
    const fetchMock = mockFetch(new Response("{}"));
    render(<NdaChat data={defaultFormData} onUpdate={() => {}} />);
    expect(screen.getByText(GREETING)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the conversation, shows the reply and applies field updates", async () => {
    const fields = { purpose: "Joint venture" };
    const fetchMock = mockFetch(new Response(JSON.stringify({ reply: "Which state's law?", fields })));
    const onUpdate = vi.fn();
    render(<NdaChat data={defaultFormData} onUpdate={onUpdate} />);

    sendMessage("A joint venture between Acme and Globex");

    expect(await screen.findByText("Which state's law?")).toBeTruthy();
    expect(screen.getByText("A joint venture between Acme and Globex")).toBeTruthy();
    expect(onUpdate).toHaveBeenCalledWith(fields);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.messages).toEqual([
      { role: "assistant", content: GREETING },
      { role: "user", content: "A joint venture between Acme and Globex" },
    ]);
  });

  it("shows an error and restores the message when the request fails", async () => {
    mockFetch(new Response("", { status: 500 }));
    const onUpdate = vi.fn();
    render(<NdaChat data={defaultFormData} onUpdate={onUpdate} />);

    sendMessage("Hello");

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect((screen.getByLabelText("Message") as HTMLTextAreaElement).value).toBe("Hello");
    expect(screen.queryByText("Hello", { selector: "p" })).toBeNull();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("does not send blank messages", () => {
    const fetchMock = mockFetch(new Response("{}"));
    render(<NdaChat data={defaultFormData} onUpdate={() => {}} />);
    sendMessage("   ");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
