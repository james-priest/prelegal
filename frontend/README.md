# Prelegal frontend

Next.js app for drafting legal agreements. It is statically exported (`out/`) and served by the backend. It provides a placeholder sign-in page (`/`) and the drafting page (`/draft/`): chat with an AI assistant that picks a supported document and fills in its cover page, see the completed agreement update live, and download it as a PDF.

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

- `src/app/page.tsx` + `src/components/LoginForm.tsx` — fake sign-in; submitting goes straight to `/draft/`.
- `src/app/draft/page.tsx` — server component that reads `templates/documents.json` (the supported documents) and each template's Standard Terms at build time, and renders the builder.
- `src/components/DocumentBuilder.tsx` — holds the draft state (chosen document, fields, parties); lays out the chat beside the live preview. **Download PDF** calls `window.print()`; print styles hide everything except the agreement, so users choose "Save as PDF".
- `src/components/Chat.tsx` — the chat; each AI turn returns a reply, the chosen document and field and party updates.
- `src/components/CoverPage.tsx` — generic cover page: each key term with its value or a placeholder, and a signature block per party.
- `src/components/StandardTerms.tsx` — renders a template's markdown. `<span class="…_link">` references show inline field values (the NDA's Governing Law and Jurisdiction) or render as defined terms. User input is rendered as text, never HTML.
- `src/lib/documents.ts` — document and draft types and helpers; `src/lib/chat.ts` — `/api/chat` client and `applyResponse`.
