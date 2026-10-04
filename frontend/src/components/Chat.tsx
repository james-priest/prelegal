"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { ChatMessage } from "@/lib/chat";

interface ChatProps {
  messages: ChatMessage[];
  /** Sends a message; rejects if the assistant could not respond. */
  onSend: (text: string) => Promise<void>;
}

/** The conversation with the assistant. The parent owns the messages; this owns the input. */
export default function Chat({ messages, onSend }: ChatProps) {
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current!;
    list.scrollTop = list.scrollHeight;
  }, [messages, pending]);

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    setInput("");
    setError("");
    setPending(true);
    try {
      await onSend(text);
    } catch {
      // Restore the unsent message so the user can retry.
      setInput(text);
      setError("The assistant could not respond. Try sending your message again.");
    } finally {
      setPending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-5" aria-live="polite">
        {messages.map((message, i) => (
          <p
            key={i}
            className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              message.role === "user"
                ? "ml-auto rounded-br-sm bg-brand-navy text-white"
                : "rounded-bl-sm bg-surface text-slate-800"
            }`}
          >
            {message.content}
          </p>
        ))}
        {pending && <p className="text-sm text-slate-500">Drafting a reply…</p>}
      </div>

      <form onSubmit={send} className="shrink-0 border-t border-slate-200 p-4">
        {error && (
          <p role="alert" className="mb-2 text-sm text-red-800">
            {error}
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your agreement or answer the question…"
            aria-label="Message"
            className="flex-1 resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="rounded-md bg-brand-purple px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-purple/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 disabled:opacity-50"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Press Enter to send, Shift+Enter for a new line.</p>
      </form>
    </div>
  );
}
