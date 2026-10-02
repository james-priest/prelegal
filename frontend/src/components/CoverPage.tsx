import type { ReactNode } from "react";
import {
  describeConfidentialityTerm,
  describeMndaTerm,
  formatDate,
  type NdaFormData,
  type PartyInfo,
} from "@/lib/nda";

/** Shows the value, or a highlighted bracketed placeholder when it is blank. */
function Value({ value, placeholder }: { value: string; placeholder: string }) {
  const text = value.trim();
  return text ? <>{text}</> : <span className="nda-placeholder">[{placeholder}]</span>;
}

function Checkbox({ checked, children }: { checked: boolean; children: ReactNode }) {
  return (
    <li className="flex gap-2">
      <span aria-hidden>{checked ? "☒" : "☐"}</span>
      <span className={checked ? undefined : "text-stone-400 line-through"}>{children}</span>
    </li>
  );
}

const partyRows: { label: string; field?: keyof PartyInfo }[] = [
  { label: "Signature" },
  { label: "Print Name", field: "name" },
  { label: "Title", field: "title" },
  { label: "Company", field: "company" },
  { label: "Notice Address", field: "noticeAddress" },
  { label: "Date" },
];

/** The Mutual NDA Cover Page, mirroring templates/Mutual-NDA-coverpage.md. */
export default function CoverPage({ data }: { data: NdaFormData }) {
  const fixedMnda = data.mndaTermType === "fixed";
  const fixedConfidentiality = data.confidentialityTermType === "fixed";

  return (
    <section>
      <h1>Mutual Non-Disclosure Agreement</h1>
      <p>
        This Mutual Non-Disclosure Agreement (the “MNDA”) consists of: (1) this Cover Page
        (“<strong>Cover Page</strong>”) and (2) the Common Paper Mutual NDA Standard Terms Version
        1.0 (“<strong>Standard Terms</strong>”) identical to those posted at{" "}
        <a href="https://commonpaper.com/standards/mutual-nda/1.0">
          commonpaper.com/standards/mutual-nda/1.0
        </a>
        . Any modifications of the Standard Terms should be made on the Cover Page, which will
        control over conflicts with the Standard Terms.
      </p>

      <h3>Purpose</h3>
      <p>
        <Value value={data.purpose} placeholder="Purpose" />
      </p>

      <h3>Effective Date</h3>
      <p>
        <Value value={formatDate(data.effectiveDate)} placeholder="Effective Date" />
      </p>

      <h3>MNDA Term</h3>
      <ul className="nda-checklist">
        <Checkbox checked={fixedMnda}>
          {describeMndaTerm({ ...data, mndaTermType: "fixed" })}
        </Checkbox>
        <Checkbox checked={!fixedMnda}>
          {describeMndaTerm({ ...data, mndaTermType: "untilTerminated" })}
        </Checkbox>
      </ul>

      <h3>Term of Confidentiality</h3>
      <ul className="nda-checklist">
        <Checkbox checked={fixedConfidentiality}>
          {describeConfidentialityTerm({ ...data, confidentialityTermType: "fixed" })}
        </Checkbox>
        <Checkbox checked={!fixedConfidentiality}>In perpetuity.</Checkbox>
      </ul>

      <h3>Governing Law &amp; Jurisdiction</h3>
      <p>
        Governing Law: <Value value={data.governingLaw} placeholder="Governing Law" />
      </p>
      <p>
        Jurisdiction: <Value value={data.jurisdiction} placeholder="Jurisdiction" />
      </p>

      <h3>MNDA Modifications</h3>
      <p className="whitespace-pre-line">{data.modifications.trim() || "None."}</p>

      <p>By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.</p>

      <table className="nda-signatures">
        <thead>
          <tr>
            <td />
            <th scope="col">PARTY 1</th>
            <th scope="col">PARTY 2</th>
          </tr>
        </thead>
        <tbody>
          {partyRows.map(({ label, field }) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{field ? data.party1[field] : null}</td>
              <td>{field ? data.party2[field] : null}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="nda-attribution">
        Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
      </p>
    </section>
  );
}
