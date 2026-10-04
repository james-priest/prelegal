"use client";

import Link from "next/link";
import { useState } from "react";
import Chat from "@/components/Chat";
import CoverPage from "@/components/CoverPage";
import StandardTerms from "@/components/StandardTerms";
import { applyResponse, type ChatResponse } from "@/lib/chat";
import { documentFileName, emptyDraft, type DraftableDocument, type DraftState } from "@/lib/documents";

/** AI chat + live preview of the chosen document. "Download PDF" prints only the document. */
export default function DocumentBuilder({ documents }: { documents: DraftableDocument[] }) {
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const doc = documents.find((d) => d.id === draft.documentId);

  function handleResponse(response: ChatResponse) {
    setDraft((d) => applyResponse(d, response));
  }

  function downloadPdf() {
    // Browsers use the document title as the default PDF file name.
    const originalTitle = document.title;
    document.title = documentFileName(doc!, draft);
    window.print();
    document.title = originalTitle;
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 print:bg-white">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4 print:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">Prelegal</p>
          <h1 className="text-lg font-semibold text-brand-navy">{doc?.name ?? "New Agreement"}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-brand-gray hover:text-brand-navy">
            Sign out
          </Link>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={!doc}
            className="rounded-md bg-brand-purple px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 disabled:opacity-50"
          >
            Download PDF
          </button>
        </div>
      </header>

      <main className="grid flex-1 lg:grid-cols-[minmax(22rem,28rem)_1fr] print:block">
        <aside className="flex h-[70vh] flex-col border-b border-stone-200 bg-white p-6 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0 print:hidden">
          <p className="mb-4 text-sm text-stone-600">
            Tell the assistant what you need and the agreement fills in as you go; use{" "}
            <strong>Download PDF</strong> and choose “Save as PDF” to keep a copy.
          </p>
          <div className="min-h-0 flex-1">
            <Chat draft={draft} onResponse={handleResponse} />
          </div>
        </aside>

        <div className="p-4 sm:p-8 print:p-0">
          {doc ? (
            <article className="doc-document mx-auto max-w-[8.5in] bg-white p-8 shadow-lg ring-1 ring-stone-200 sm:p-14 print:max-w-none print:p-0 print:shadow-none print:ring-0">
              <CoverPage doc={doc} draft={draft} />
              <div className="doc-page-break" />
              <StandardTerms markdown={doc.standardTerms} doc={doc} draft={draft} />
            </article>
          ) : (
            <div className="mx-auto mt-16 max-w-md text-center text-sm text-brand-gray">
              Your agreement will appear here once you choose a document in the chat.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
