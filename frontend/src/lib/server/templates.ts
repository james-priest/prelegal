import { readFile } from "node:fs/promises";
import path from "node:path";
import type { DocumentSpec, DraftableDocument } from "@/lib/documents";

// The repo-level templates/ directory is the single source of truth for the
// supported documents and their text. Pages read it at build time, when they
// are prerendered.
const TEMPLATES_DIR = path.join(process.cwd(), "..", "templates");

export async function loadDocumentSpecs(): Promise<DocumentSpec[]> {
  return JSON.parse(await readFile(path.join(TEMPLATES_DIR, "documents.json"), "utf8"));
}

/** Every supported document with its Standard Terms markdown. */
export async function loadDocuments(): Promise<DraftableDocument[]> {
  const specs = await loadDocumentSpecs();
  return Promise.all(
    specs.map(async (spec) => ({
      ...spec,
      standardTerms: await readFile(path.join(TEMPLATES_DIR, spec.template), "utf8"),
    })),
  );
}
