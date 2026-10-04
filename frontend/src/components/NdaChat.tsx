"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { GREETING, sendChat, type ChatMessage, type FieldUpdates } from "@/lib/chat";
import type { NdaFormData } from "@/lib/nda";

interface NdaChatProps {
  data: NdaFormData;
  onUpdate: (updates: FieldUpdates) => void;
}

/** Freeform chat with the AI, which fills in the NDA as the user answers. */
export default function NdaChat({ data, onUpdate }: NdaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: GREETING }]);
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

    const history: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(history);
    setInput("");
    setError("");
    setPending(true);
    try {
      const turn = await sendChat(history, data);
      onUpdate(turn.fields);
      setMessages([...history, { role: "assistant", content: turn.reply }]);
    } catch {
      // Restore the unsent message so the user can retry.
      setMessages(messages);
      setInput(text);
      setError("The assistant could not respond. Please try again.");
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
    <div className="flex h-full flex-col">
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto pb-4" aria-live="polite">
        {messages.map((message, i) => (
          <p
            key={i}
            className={`max-w-[85%] whitespace-pre-line rounded-lg px-3 py-2 text-sm ${
              message.role === "user"
                ? "ml-auto bg-brand-blue text-white"
                : "bg-stone-100 text-stone-900"
            }`}
          >
            {message.content}
          </p>
        ))}
        {pending && <p className="text-sm text-brand-gray">Thinking…</p>}
      </div>

      {error && (
        <p role="alert" className="mb-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={send} className="flex gap-2 border-t border-stone-200 pt-4">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer…"
          aria-label="Message"
          className="flex-1 resize-none rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="self-end rounded-md bg-brand-purple px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
