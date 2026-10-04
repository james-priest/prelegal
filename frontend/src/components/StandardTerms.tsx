"use client";

import Markdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import type { DocumentSpec, DraftState } from "@/lib/documents";

interface StandardTermsProps {
  /** Raw markdown from the document's template (trusted, from the repo). */
  markdown: string;
  doc: DocumentSpec;
  draft: DraftState;
}

/**
 * Renders the Standard Terms. Each `<span class="…_link">Label</span>` refers to
 * a cover page term: fields marked `inline` show their value (or a placeholder);
 * all others render as a bold defined term. Values are passed as React
 * children, never as HTML, so user input cannot inject markup.
 */
export default function StandardTerms({ markdown, doc, draft }: StandardTermsProps) {
  const inlineFields = new Map(doc.fields.filter((f) => f.inline).map((f) => [f.label, f.key]));

  const components: Components = {
    span({ className, children }) {
      if (!className?.endsWith("_link")) return <span className={className}>{children}</span>;
      const label = String(children);
      const key = inlineFields.get(label);
      if (key === undefined) return <span className="doc-term-ref">{label}</span>;
      const value = draft.fields[key]?.trim();
      if (!value) return <span className="doc-placeholder">[{label}]</span>;
      return <span className="doc-filled">{value}</span>;
    },
  };

  return (
    <section>
      <Markdown rehypePlugins={[rehypeRaw]} components={components}>
        {markdown}
      </Markdown>
    </section>
  );
}
