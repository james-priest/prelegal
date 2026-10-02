"use client";

import { useState, type ReactNode } from "react";
import { clampYears, MAX_TERM_YEARS, type NdaFormData, type PartyInfo, type PartyKey } from "@/lib/nda";

interface NdaFormProps {
  data: NdaFormData;
  onChange: <K extends keyof NdaFormData>(field: K, value: NdaFormData[K]) => void;
  onPartyChange: (party: PartyKey, field: keyof PartyInfo, value: string) => void;
}

const baseInputClass =
  "rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-stone-100 disabled:text-stone-400";
const inputClass = `${baseInputClass} w-full`;

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-stone-800">{label}</span>
      {hint && <span className="block text-xs text-stone-500">{hint}</span>}
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 border-t border-stone-200 pt-5 first:border-t-0 first:pt-0">
      <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

/**
 * Whole number of years. Keeps the raw text while editing (so the field can be
 * cleared and retyped) and normalizes it on blur.
 */
function YearsInput({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onChange: (years: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      type="number"
      min={1}
      max={MAX_TERM_YEARS}
      step={1}
      value={draft ?? value}
      disabled={disabled}
      aria-label={label}
      onChange={(e) => {
        setDraft(e.target.value);
        if (e.target.value !== "") onChange(clampYears(Number(e.target.value)));
      }}
      onBlur={() => setDraft(null)}
      className={`${baseInputClass} w-20`}
    />
  );
}

function TermChoice({
  name,
  checked,
  onSelect,
  children,
}: {
  name: string;
  checked: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <label className="flex items-center gap-3 text-sm text-stone-800">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
        className="h-4 w-4 accent-indigo-600"
      />
      {children}
    </label>
  );
}

function PartyFields({
  title,
  party,
  onChange,
}: {
  title: string;
  party: PartyInfo;
  onChange: (field: keyof PartyInfo, value: string) => void;
}) {
  return (
    <Section title={title}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Print name">
          <input className={inputClass} value={party.name} onChange={(e) => onChange("name", e.target.value)} />
        </Field>
        <Field label="Title">
          <input className={inputClass} value={party.title} onChange={(e) => onChange("title", e.target.value)} />
        </Field>
      </div>
      <Field label="Company">
        <input className={inputClass} value={party.company} onChange={(e) => onChange("company", e.target.value)} />
      </Field>
      <Field label="Notice address" hint="Use either email or postal address">
        <input
          className={inputClass}
          value={party.noticeAddress}
          onChange={(e) => onChange("noticeAddress", e.target.value)}
        />
      </Field>
    </Section>
  );
}

export default function NdaForm({ data, onChange, onPartyChange }: NdaFormProps) {
  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <Section title="Agreement">
        <Field label="Purpose" hint="How Confidential Information may be used">
          <textarea
            rows={3}
            className={inputClass}
            value={data.purpose}
            onChange={(e) => onChange("purpose", e.target.value)}
          />
        </Field>
        <Field label="Effective date">
          <input
            type="date"
            className={inputClass}
            value={data.effectiveDate}
            onChange={(e) => onChange("effectiveDate", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="MNDA term">
        <TermChoice
          name="mndaTermType"
          checked={data.mndaTermType === "fixed"}
          onSelect={() => onChange("mndaTermType", "fixed")}
        >
          Expires
          <YearsInput
            label="MNDA term in years"
            value={data.mndaTermYears}
            disabled={data.mndaTermType !== "fixed"}
            onChange={(years) => onChange("mndaTermYears", years)}
          />
          year(s) from Effective Date
        </TermChoice>
        <TermChoice
          name="mndaTermType"
          checked={data.mndaTermType === "untilTerminated"}
          onSelect={() => onChange("mndaTermType", "untilTerminated")}
        >
          Continues until terminated
        </TermChoice>
      </Section>

      <Section title="Term of confidentiality">
        <TermChoice
          name="confidentialityTermType"
          checked={data.confidentialityTermType === "fixed"}
          onSelect={() => onChange("confidentialityTermType", "fixed")}
        >
          <YearsInput
            label="Confidentiality term in years"
            value={data.confidentialityTermYears}
            disabled={data.confidentialityTermType !== "fixed"}
            onChange={(years) => onChange("confidentialityTermYears", years)}
          />
          year(s) from Effective Date
        </TermChoice>
        <TermChoice
          name="confidentialityTermType"
          checked={data.confidentialityTermType === "perpetual"}
          onSelect={() => onChange("confidentialityTermType", "perpetual")}
        >
          In perpetuity
        </TermChoice>
      </Section>

      <Section title="Governing law & jurisdiction">
        <Field label="Governing law" hint="State, e.g. Delaware">
          <input
            className={inputClass}
            value={data.governingLaw}
            onChange={(e) => onChange("governingLaw", e.target.value)}
          />
        </Field>
        <Field label="Jurisdiction" hint="City or county and state, e.g. New Castle, DE">
          <input
            className={inputClass}
            value={data.jurisdiction}
            onChange={(e) => onChange("jurisdiction", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Modifications">
        <Field label="MNDA modifications" hint="Optional changes to the Standard Terms">
          <textarea
            rows={3}
            className={inputClass}
            value={data.modifications}
            onChange={(e) => onChange("modifications", e.target.value)}
          />
        </Field>
      </Section>

      <PartyFields
        title="Party 1"
        party={data.party1}
        onChange={(field, value) => onPartyChange("party1", field, value)}
      />
      <PartyFields
        title="Party 2"
        party={data.party2}
        onChange={(field, value) => onPartyChange("party2", field, value)}
      />
    </form>
  );
}
