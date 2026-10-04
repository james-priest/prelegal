# Prelegal frontend

Next.js app for drafting legal agreements. It is statically exported (`out/`) and served by the backend. It currently provides a placeholder sign-in page (`/`) and the **Mutual NDA Creator** (`/nda/`): chat with an AI assistant that fills in the cover page, see the completed Common Paper Mutual NDA update live, and download it as a PDF.

## Getting started

Run from this `frontend/` directory (the app reads agreement text from `../templates/` at build time). The chat calls `/api/chat`, so to use it run `npm run build` and serve `out/` from the backend (see `../backend/README.md`):

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script               | Purpose                          |
| -------------------- | -------------------------------- |
| `npm run dev`        | Start the dev server             |
| `npm run build`      | Static export to `out/`          |
| `npm run lint`       | ESLint                           |
| `npm test`           | Run Vitest unit tests once       |
| `npm run test:watch` | Run Vitest in watch mode         |

## How it works

- `src/app/page.tsx` + `src/components/LoginForm.tsx` — fake sign-in; submitting goes straight to `/nda/`.
- `src/app/nda/page.tsx` — server component that reads `templates/Mutual-NDA.md` (the Standard Terms) and renders the builder.
- `src/components/NdaBuilder.tsx` — holds the NDA field state; lays out the chat beside the live preview. **Download PDF** calls `window.print()`; print styles hide everything except the agreement, so users choose "Save as PDF".
- `src/components/NdaChat.tsx` — the chat; each AI turn returns a reply plus field updates.
- `src/lib/chat.ts` — `/api/chat` client and `applyUpdates` (merges non-null updates into the fields).
- `src/components/CoverPage.tsx` — the filled-in cover page (mirrors `templates/Mutual-NDA-coverpage.md`).
- `src/components/StandardTerms.tsx` — renders the Standard Terms markdown, substituting Governing Law and Jurisdiction into the `<span class="coverpage_link">` references. User input is rendered as text, never HTML.
- `src/lib/nda.ts` — data model and pure helpers (unit tested in `nda.test.ts`).
