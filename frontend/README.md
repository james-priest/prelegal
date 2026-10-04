# Prelegal frontend

Next.js app for drafting legal agreements. It is statically exported (`out/`) and served by the backend. Pages: sign in (`/`), sign up (`/signup/`), your documents (`/documents/`) and drafting (`/draft/`, or `/draft/?id=…` for a saved draft): chat with an AI assistant that picks a supported document and fills in its cover page, see the agreement update live, and download it as a PDF.

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

- `src/app/page.tsx`, `src/app/signup/page.tsx` — `AuthLayout` (brand panel with a sample cover page) around `AuthForm` (sign in or sign up, then `/documents/`).
- `src/components/AppShell.tsx` — signed-in top bar; sends signed-out visitors to `/`.
- `src/app/documents/page.tsx` + `src/components/DocumentList.tsx` — the user's drafts, most recent first.
- `src/app/draft/page.tsx` — reads `templates/documents.json` and each template's Standard Terms at build time (`src/lib/server/templates.ts`). `DraftPage` keys `DocumentBuilder` by `?id=`.
- `src/components/DocumentBuilder.tsx` — owns the draft and chat messages; after each turn with a chosen document it creates (then updates) the saved draft. Lays out the chat beside the live preview, filling the window. **Download PDF** calls `window.print()`; print styles hide everything except the agreement.
- `src/components/Chat.tsx` — the conversation and message input.
- `src/components/CoverPage.tsx` — key terms, signature block per party, and the draft disclaimer (printed).
- `src/components/StandardTerms.tsx` — renders a template's markdown. `<span class="…_link">` references show inline field values (the NDA's Governing Law and Jurisdiction) or render as defined terms. User input is rendered as text, never HTML.
- `src/lib/` — `api.ts` (fetch helper), `auth.ts`, `drafts.ts`, `chat.ts` (`/api/chat` client and `applyResponse`), `documents.ts` (types and helpers).
