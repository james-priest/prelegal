import { partyOf, type DocumentSpec, type DraftState, type Party } from "@/lib/documents";

/** Shows the value, or a highlighted bracketed placeholder when it is blank. */
function Value({ value, placeholder }: { value: string | undefined; placeholder: string }) {
  const text = value?.trim();
  return text ? <>{text}</> : <span className="doc-placeholder">[{placeholder}]</span>;
}

const partyRows: { label: string; field?: keyof Party }[] = [
  { label: "Signature" },
  { label: "Print Name", field: "name" },
  { label: "Title", field: "title" },
  { label: "Company", field: "company" },
  { label: "Notice Address", field: "noticeAddress" },
  { label: "Date" },
];

/** Cover page for any document: its key terms, then a signature block per party. */
export default function CoverPage({ doc, draft }: { doc: DocumentSpec; draft: DraftState }) {
  return (
    <section>
      <h1>{doc.name}</h1>
      <p>
        This {doc.name} (the “Agreement”) consists of: (1) this Cover Page (“<strong>Cover Page</strong>”)
        and (2) the Common Paper {doc.name} Standard Terms (“<strong>Standard Terms</strong>”) that
        follow. Any modifications of the Standard Terms should be made on the Cover Page, which will
        control over conflicts with the Standard Terms.
      </p>

      {doc.fields.map((field) => (
        <div key={field.key}>
          <h3>{field.label}</h3>
          <p className="whitespace-pre-line">
            <Value value={draft.fields[field.key]} placeholder={field.label} />
          </p>
        </div>
      ))}

      <p>By signing this Cover Page, each party agrees to enter into this Agreement.</p>

      <table className="doc-signatures">
        <thead>
          <tr>
            <td />
            {doc.parties.map((party) => (
              <th key={party.key} scope="col">
                {party.label.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {partyRows.map(({ label, field }) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              {doc.parties.map((party) => (
                <td key={party.key}>{field ? partyOf(draft, party.key)[field] : null}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="doc-disclaimer">
        Draft prepared with Prelegal. This document is a draft and is subject to legal review before
        anyone signs or relies on it.
      </p>

      <p className="doc-attribution">
        Common Paper {doc.name} free to use under{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
      </p>
    </section>
  );
}
