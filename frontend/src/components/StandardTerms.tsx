"use client";

import Markdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import { coverPageValue, type NdaFormData } from "@/lib/nda";

interface StandardTermsProps {
  /** Raw markdown from templates/Mutual-NDA.md (trusted, from the repo). */
  markdown: string;
  data: NdaFormData;
}

/**
 * Renders the Standard Terms, replacing `<span class="coverpage_link">Label</span>`
 * references with the user's cover page values where they read naturally
 * inline. Values are passed as React children, never as HTML, so user input
 * cannot inject markup.
 */
export default function StandardTerms({ markdown, data }: StandardTermsProps) {
  const components: Components = {
    span({ className, children }) {
      if (className !== "coverpage_link") return <span className={className}>{children}</span>;
      const label = String(children);
      const value = coverPageValue(label, data);
      if (value === null) return <span className="nda-coverpage-ref">{label}</span>;
      if (value === "") return <span className="nda-placeholder">[{label}]</span>;
      return <span className="nda-filled">{value}</span>;
    },
  };

  return (
    <section className="nda-standard-terms">
      <Markdown rehypePlugins={[rehypeRaw]} components={components}>
        {markdown}
      </Markdown>
    </section>
  );
}
