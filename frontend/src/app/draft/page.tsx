import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import DocumentBuilder from "@/components/DocumentBuilder";
import type { DocumentSpec, DraftableDocument } from "@/lib/documents";

export const metadata: Metadata = {
  title: "Draft an Agreement",
  description: "Draft a Common Paper legal agreement with an AI assistant and download it as a PDF.",
};

// The repo-level templates/ directory is the single source of truth for the
// supported documents and their text. It is read at build time, when this page
// is prerendered.
const TEMPLATES_DIR = path.join(process.cwd(), "..", "templates");

async function loadDocuments(): Promise<DraftableDocument[]> {
  const specs: DocumentSpec[] = JSON.parse(await readFile(path.join(TEMPLATES_DIR, "documents.json"), "utf8"));
  return Promise.all(
    specs.map(async (spec) => ({
      ...spec,
      standardTerms: await readFile(path.join(TEMPLATES_DIR, spec.template), "utf8"),
    })),
  );
}

export default async function DraftPage() {
  return <DocumentBuilder documents={await loadDocuments()} />;
}
