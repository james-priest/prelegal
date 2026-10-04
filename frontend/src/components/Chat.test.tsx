import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Chat from "./Chat";
import type { ChatMessage } from "@/lib/chat";

const messages: ChatMessage[] = [
  { role: "assistant", content: "What do you need?" },
  { role: "user", content: "An NDA" },
];

function type(text: string) {
  fireEvent.change(screen.getByLabelText("Message"), { target: { value: text } });
}

describe("Chat", () => {
  afterEach(cleanup);

  it("focuses the message input when it opens", () => {
    render(<Chat messages={messages} onSend={vi.fn()} />);
    expect(document.activeElement).toBe(screen.getByLabelText("Message"));
  });

  it("shows the conversation", () => {
    render(<Chat messages={messages} onSend={vi.fn()} />);
    expect(screen.getByText("What do you need?")).toBeTruthy();
    expect(screen.getByText("An NDA")).toBeTruthy();
  });

  it("sends the trimmed message and clears the input", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<Chat messages={messages} onSend={onSend} />);
    type("  Delaware law  ");
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSend).toHaveBeenCalledWith("Delaware law");
    expect((screen.getByLabelText("Message") as HTMLTextAreaElement).value).toBe("");
  });

  it("sends on Enter but not on Shift+Enter", () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<Chat messages={messages} onSend={onSend} />);
    type("Hello");
    fireEvent.keyDown(screen.getByLabelText("Message"), { key: "Enter", shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByLabelText("Message"), { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("Hello");
  });

  it("restores the message and shows an error when sending fails", async () => {
    render(<Chat messages={messages} onSend={vi.fn().mockRejectedValue(new Error("500"))} />);
    type("Hello");
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect((screen.getByLabelText("Message") as HTMLTextAreaElement).value).toBe("Hello");
  });

  it("does not send blank messages", () => {
    const onSend = vi.fn();
    render(<Chat messages={messages} onSend={onSend} />);
    type("   ");
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSend).not.toHaveBeenCalled();
  });
});
