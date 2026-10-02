"use client";

import { useState, useSyncExternalStore } from "react";
import CoverPage from "@/components/CoverPage";
import NdaForm from "@/components/NdaForm";
import StandardTerms from "@/components/StandardTerms";
import {
  defaultFormData,
  documentFileName,
  todayIso,
  type NdaFormData,
  type PartyInfo,
  type PartyKey,
} from "@/lib/nda";

const noopSubscribe = () => () => {};

/** Form + live document preview. "Download PDF" prints only the document. */
export default function NdaBuilder({ standardTerms }: { standardTerms: string }) {
  const [formData, setData] = useState<NdaFormData>(defaultFormData);

  // The Effective Date defaults to today. The page is prerendered at build
  // time, so "today" is read on the client only (blank in the server render).
  const today = useSyncExternalStore(noopSubscribe, todayIso, () => "");
  const data = formData.effectiveDate ? formData : { ...formData, effectiveDate: today };

  function updateField<K extends keyof NdaFormData>(field: K, value: NdaFormData[K]) {
    setData((d) => ({ ...d, [field]: value }));
  }

  function updateParty(party: PartyKey, field: keyof PartyInfo, value: string) {
    setData((d) => ({ ...d, [party]: { ...d[party], [field]: value } }));
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
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Prelegal</p>
          <h1 className="text-lg font-semibold text-stone-900">Mutual NDA Creator</h1>
        </div>
        <button
          type="button"
          onClick={downloadPdf}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Download PDF
        </button>
      </header>

      <main className="grid flex-1 lg:grid-cols-[minmax(22rem,28rem)_1fr] print:block">
        <aside className="border-b border-stone-200 bg-white p-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-b-0 print:hidden">
          <p className="mb-6 text-sm text-stone-600">
            Fill in the details below. The agreement updates as you type; use{" "}
            <strong>Download PDF</strong> and choose “Save as PDF” to keep a copy.
          </p>
          <NdaForm data={data} onChange={updateField} onPartyChange={updateParty} />
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
