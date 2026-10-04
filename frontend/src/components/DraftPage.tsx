"use client";

import { useSearchParams } from "next/navigation";
import DocumentBuilder from "@/components/DocumentBuilder";
import type { DraftableDocument } from "@/lib/documents";

/** Opens the draft named by ?id=, or a new one. Keyed so switching drafts starts fresh. */
export default function DraftPage({ documents }: { documents: DraftableDocument[] }) {
  const id = useSearchParams().get("id");
  return <DocumentBuilder key={id ?? "new"} documents={documents} draftId={id ? Number(id) : null} />;
}
