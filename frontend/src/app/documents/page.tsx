import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import DocumentList from "@/components/DocumentList";
import { loadDocumentSpecs } from "@/lib/server/templates";

export const metadata: Metadata = { title: "Your documents" };

export default async function DocumentsPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold text-brand-navy">Your documents</h1>
        <p className="mt-2 mb-8 text-sm text-slate-600">
          Drafts are saved as you chat. Open one to keep editing or to download it.
        </p>
        <DocumentList documents={await loadDocumentSpecs()} />
      </main>
    </AppShell>
  );
}
