/** The Prelegal name with its highlighter mark. */
export default function Wordmark({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-serif text-xl font-semibold ${inverted ? "text-white" : "text-brand-navy"}`}>
      <span aria-hidden className="h-4 w-2.5 -skew-x-12 rounded-[2px] bg-brand-yellow" />
      Prelegal
    </span>
  );
}
