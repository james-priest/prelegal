import type { ReactNode } from "react";
import Wordmark from "@/components/Wordmark";

/** Placeholder text as the agreement shows it: a term still to be filled in. */
function Blank({ children }: { children: ReactNode }) {
  return <span className="rounded-sm bg-brand-yellow/40 px-1 text-[#5a4200]">{children}</span>;
}

function Term({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t border-slate-200 py-2.5 first:border-t-0">
      <dt className="font-sans text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}

/** A cover page mid-draft: what Prelegal produces, shown on the sign-in screens. */
function PaperSample() {
  return (
    <div aria-hidden className="w-full max-w-sm rotate-[-1.5deg] rounded-sm bg-white px-8 py-9 font-serif text-[0.95rem] text-slate-800 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
      <p className="text-center text-lg font-semibold text-brand-navy">Mutual Non-Disclosure Agreement</p>
      <p className="mt-1 text-center font-sans text-xs text-slate-500">Cover Page</p>
      <dl className="mt-6">
        <Term label="Purpose">Evaluating a joint venture between the parties</Term>
        <Term label="Effective Date">October 5, 2026</Term>
        <Term label="Governing Law">
          <Blank>[Governing Law]</Blank>
        </Term>
        <Term label="Parties">
          Acme Inc and <Blank>[Company]</Blank>
        </Term>
      </dl>
    </div>
  );
}

/** Split screen for signing in and signing up: the product on the left, the form on the right. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="flex flex-col justify-between gap-12 bg-brand-navy px-8 py-10 text-white sm:px-14 lg:py-14">
        <Wordmark inverted />
        <div className="max-w-md">
          <h2 className="font-serif text-3xl leading-tight font-semibold sm:text-4xl">
            Standard agreements, drafted in a conversation.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/75">
            Describe the deal. Prelegal picks the right Common Paper template and fills it in as you
            answer, ready for your lawyer to review.
          </p>
        </div>
        <div className="hidden justify-center lg:flex">
          <PaperSample />
        </div>
      </section>
      <main className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
