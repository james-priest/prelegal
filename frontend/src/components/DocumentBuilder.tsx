"use client";

import { useEffect, useState } from "react";
import Chat from "@/components/Chat";
import CoverPage from "@/components/CoverPage";
import StandardTerms from "@/components/StandardTerms";
import { applyResponse, GREETING, sendChat, type ChatMessage } from "@/lib/chat";
import { documentFileName, emptyDraft, type DraftableDocument, type DraftState } from "@/lib/documents";
import { createDraft, getDraft, partiesLabel, toDraftState, updateDraft, type SavedDraft } from "@/lib/drafts";

type SaveStatus = "unsaved" | "saving" | "saved" | "failed";

const saveLabels: Record<SaveStatus, string> = {
  unsaved: "",
  saving: "Saving…",
  saved: "Saved",
  failed: "Not saved. Your next message will try again.",
};

/**
 * Hands a just-created draft to the builder that mounts for its new URL
 * (?id=…), so it starts from the saved state instead of reloading it.
 */
let justCreated: SavedDraft | null = null;

/** The handed-over draft if it is `id`, once: later opens load the latest version from the server. */
function takeCreated(id: number | null): SavedDraft | null {
  const draft = justCreated?.id === id ? justCreated : null;
  justCreated = null;
  return draft;
}

/** Prints the page; browsers use the document title as the default PDF file name. */
function printAs(title: string) {
  const originalTitle = document.title;
  document.title = title;
  window.print();
  document.title = originalTitle;
}

interface DocumentBuilderProps {
  documents: DraftableDocument[];
  /** The saved draft to open, or null for a new one. */
  draftId: number | null;
}

/** AI chat + live preview of the chosen document, saved after every turn once a document is chosen. */
export default function DocumentBuilder({ documents, draftId }: DocumentBuilderProps) {
  const [handedOver] = useState(() => takeCreated(draftId));
  const [draft, setDraft] = useState<DraftState>(handedOver ? toDraftState(handedOver) : emptyDraft);
  const [messages, setMessages] = useState<ChatMessage[]>(
    handedOver?.messages ?? [{ role: "assistant", content: GREETING }],
  );
  const [loaded, setLoaded] = useState(draftId === null || handedOver !== null);
  const [loadError, setLoadError] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(draftId === null ? "unsaved" : "saved");
  const [savedId, setSavedId] = useState(draftId);
  const doc = documents.find((d) => d.id === draft.documentId);

  useEffect(() => {
    if (loaded) return;
    getDraft(draftId!)
      .then((saved) => {
        setDraft(toDraftState(saved));
        setMessages(saved.messages);
        setLoaded(true);
      })
      .catch((e: Error) => setLoadError(e.message));
  }, [draftId, loaded]);

  async function save(next: DraftState, history: ChatMessage[]) {
    if (next.documentId === null) return;
    const content = { ...next, documentId: next.documentId, messages: history };
    setSaveStatus("saving");
    try {
      if (savedId === null) {
        justCreated = await createDraft(content);
        setSavedId(justCreated.id);
        window.history.replaceState(null, "", `?id=${justCreated.id}`);
      } else {
        await updateDraft(savedId, content);
      }
      setSaveStatus("saved");
    } catch {
      setSaveStatus("failed");
    }
  }

  async function handleSend(text: string) {
    const history: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(history);
    try {
      const response = await sendChat(history, draft);
      const next = applyResponse(draft, response);
      const withReply: ChatMessage[] = [...history, { role: "assistant", content: response.reply }];
      setDraft(next);
      setMessages(withReply);
      await save(next, withReply);
    } catch (e) {
      setMessages(messages);
      throw e;
    }
  }

  if (loadError) {
    return <p role="alert" className="p-8 text-sm text-red-800">This draft could not be opened: {loadError}</p>;
  }
  if (!loaded) return <p role="status" className="p-8 text-sm text-slate-600">Opening your draft…</p>;

  const parties = doc ? partiesLabel(doc, draft.parties) : "";
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[26rem_minmax(0,1fr)] lg:grid-rows-1 print:block">
      <aside className="min-h-0 border-b border-slate-200 bg-white lg:border-r lg:border-b-0 print:hidden">
        <Chat messages={messages} onSend={handleSend} />
      </aside>

      <section className="flex min-h-0 flex-col print:block">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3 print:hidden">
          <div className="min-w-0">
            <h1 className="truncate font-serif text-lg font-semibold text-brand-navy">{doc?.name ?? "New agreement"}</h1>
            <p className="truncate text-sm text-slate-500">{parties || "Tell the assistant what you need to get started."}</p>
          </div>
          <div className="flex items-center gap-4">
            <span role="status" className={`text-sm ${saveStatus === "failed" ? "text-red-800" : "text-slate-500"}`}>
              {saveLabels[saveStatus]}
            </span>
            <button
              type="button"
              onClick={() => printAs(documentFileName(doc!, draft))}
              disabled={!doc}
              className="rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-brand-navy shadow-xs hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:opacity-50"
            >
              Download PDF
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8 print:overflow-visible print:p-0">
          <p className="mx-auto mb-6 max-w-[8.5in] border-l-4 border-brand-yellow bg-white px-4 py-3 text-sm text-slate-700 print:hidden">
            Drafts from Prelegal are a starting point, not legal advice. Have a qualified lawyer review the
            document before anyone signs or relies on it.
          </p>
          {doc ? (
            <article className="doc-document mx-auto max-w-[8.5in] bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:p-14 print:max-w-none print:p-0 print:shadow-none print:ring-0">
              <CoverPage doc={doc} draft={draft} />
              <div className="doc-page-break" />
              <StandardTerms markdown={doc.standardTerms} doc={doc} draft={draft} />
            </article>
          ) : (
            <div className="mx-auto mt-16 max-w-md text-center">
              <h2 className="font-serif text-xl font-semibold text-brand-navy">Your agreement will appear here</h2>
              <p className="mt-2 text-sm text-slate-600">
                Prelegal drafts NDAs, cloud service, pilot, partnership, data processing and other
                Common Paper agreements. Describe what you need in the chat.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
