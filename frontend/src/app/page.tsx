import { readFile } from "node:fs/promises";
import path from "node:path";
import NdaBuilder from "@/components/NdaBuilder";

// The repo-level templates/ directory is the single source of truth for
// agreement text. It is read at build time, when this page is prerendered.
const STANDARD_TERMS_PATH = path.join(process.cwd(), "..", "templates", "Mutual-NDA.md");

export default async function Home() {
  const standardTerms = await readFile(STANDARD_TERMS_PATH, "utf8");
  return <NdaBuilder standardTerms={standardTerms} />;
}
