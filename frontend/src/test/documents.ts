import { readFileSync } from "node:fs";
import path from "node:path";
import type { DocumentSpec, DraftableDocument } from "@/lib/documents";

const TEMPLATES_DIR = path.join(__dirname, "..", "..", "..", "templates");

/** Loads a document from the repo's templates/documents.json, with its Standard Terms. */
export function loadDocument(id: string): DraftableDocument {
  const specs: DocumentSpec[] = JSON.parse(readFileSync(path.join(TEMPLATES_DIR, "documents.json"), "utf8"));
  const spec = specs.find((s) => s.id === id)!;
  return { ...spec, standardTerms: readFileSync(path.join(TEMPLATES_DIR, spec.template), "utf8") };
}
