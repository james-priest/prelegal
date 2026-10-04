"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import CoverPage from "@/components/CoverPage";
import NdaChat from "@/components/NdaChat";
import StandardTerms from "@/components/StandardTerms";
import { applyUpdates, type FieldUpdates } from "@/lib/chat";
import { defaultFormData, documentFileName, todayIso, type NdaFormData } from "@/lib/nda";

const noopSubscribe = () => () => {};

/** AI chat + live document preview. "Download PDF" prints only the document. */
export default function NdaBuilder({ standardTerms }: { standardTerms: string }) {
  const [formData, setData] = useState<NdaFormData>(defaultFormData);

  // The Effective Date defaults to today. The page is prerendered at build
  // time, so "today" is read on the client only (blank in the server render).
  const today = useSyncExternalStore(noopSubscribe, todayIso, () => "");
  const data = formData.effectiveDate ? formData : { ...formData, effectiveDate: today };

  function updateFields(updates: FieldUpdates) {
    setData((d) => applyUpdates(d, updates));
  }

  function downloadPdf() {
    // Browsers use the document title as the default PDF file name.
    const originalTitle = document.title;
    document.title = documentFileName(data);
    window.print();
    document.title = originalTitle;
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 print:bg-white">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4 print:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">Prelegal</p>
          <h1 className="text-lg font-semibold text-brand-navy">Mutual NDA Creator</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-brand-gray hover:text-brand-navy">
            Sign out
          </Link>
          <button
            type="button"
            onClick={downloadPdf}
            className="rounded-md bg-brand-purple px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-purple/90 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
          >
            Download PDF
          </button>
        </div>
      </header>

      <main className="grid flex-1 lg:grid-cols-[minmax(22rem,28rem)_1fr] print:block">
        <aside className="flex h-[70vh] flex-col border-b border-stone-200 bg-white p-6 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0 print:hidden">
          <p className="mb-4 text-sm text-stone-600">
            Chat with the assistant and the agreement fills in as you go; use{" "}
            <strong>Download PDF</strong> and choose “Save as PDF” to keep a copy.
          </p>
          <div className="min-h-0 flex-1">
            <NdaChat data={data} onUpdate={updateFields} />
          </div>
        </aside>

        <div className="p-4 sm:p-8 print:p-0">
          <article className="nda-document mx-auto max-w-[8.5in] bg-white p-8 shadow-lg ring-1 ring-stone-200 sm:p-14 print:max-w-none print:p-0 print:shadow-none print:ring-0">
            <CoverPage data={data} />
            <div className="nda-page-break" />
            <StandardTerms markdown={standardTerms} data={data} />
          </article>
        </div>
      </main>
    </div>
  );
}
