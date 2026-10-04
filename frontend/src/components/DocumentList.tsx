"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DocumentSpec } from "@/lib/documents";
import { listDrafts, partiesLabel, updatedLabel, type DraftSummary } from "@/lib/drafts";

/** The signed-in user's drafts, most recent first, each opening in the builder. */
export default function DocumentList({ documents }: { documents: DocumentSpec[] }) {
  const [drafts, setDrafts] = useState<DraftSummary[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listDrafts()
      .then(setDrafts)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p role="alert" className="text-sm text-red-800">Your documents could not be loaded: {error}</p>;
  if (drafts === null) return <p role="status" className="text-sm text-slate-600">Loading your documents…</p>;

  if (drafts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-8 py-14 text-center">
        <h2 className="font-serif text-xl font-semibold text-brand-navy">Start your first agreement</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
          Tell the assistant what you need, such as an NDA with a new partner, and it drafts the
          document as you answer.
        </p>
        <Link
          href="/draft/"
          className="mt-6 inline-block rounded-md bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-purple/90"
        >
          New document
        </Link>
      </div>
    );
  }

  const byId = new Map(documents.map((d) => [d.id, d]));
  return (
    <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
      {drafts.map((draft) => {
        const doc = byId.get(draft.documentId)!;
        const parties = partiesLabel(doc, draft.parties);
        return (
          <li key={draft.id}>
            <Link
              href={`/draft/?id=${draft.id}`}
              className="flex flex-col gap-1 px-5 py-4 hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-blue sm:flex-row sm:items-baseline sm:justify-between"
            >
              <span>
                <span className="block font-serif text-lg font-semibold text-brand-navy">{doc.name}</span>
                <span className="text-sm text-slate-600">{parties || "Parties not named yet"}</span>
              </span>
              <span className="text-sm text-slate-500">{updatedLabel(draft.updatedAt)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
