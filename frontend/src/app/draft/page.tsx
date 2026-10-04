import type { Metadata } from "next";
import { Suspense } from "react";
import AppShell from "@/components/AppShell";
import DraftPage from "@/components/DraftPage";
import { loadDocuments } from "@/lib/server/templates";

export const metadata: Metadata = {
  title: "Draft an agreement",
  description: "Draft a Common Paper legal agreement with an AI assistant and download it as a PDF.",
};

export default async function DraftRoute() {
  const documents = await loadDocuments();
  return (
    <AppShell fullHeight>
      <Suspense>
        <DraftPage documents={documents} />
      </Suspense>
    </AppShell>
  );
}
