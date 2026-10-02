# Prelegal frontend

Next.js app for drafting legal agreements. It currently provides the **Mutual NDA Creator**: fill in the cover page details in a form, see the completed Common Paper Mutual NDA update live, and download it as a PDF.

## Getting started

Run from this `frontend/` directory (the app reads agreement text from `../templates/` at build time):

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script               | Purpose                          |
| -------------------- | -------------------------------- |
| `npm run dev`        | Start the dev server             |
| `npm run build`      | Production build (static page)   |
| `npm start`          | Serve the production build       |
| `npm run lint`       | ESLint                           |
| `npm test`           | Run Vitest unit tests once       |
| `npm run test:watch` | Run Vitest in watch mode         |

## How it works

- `src/app/page.tsx` — server component that reads `templates/Mutual-NDA.md` (the Standard Terms) and renders the builder.
- `src/components/NdaBuilder.tsx` — holds form state; lays out the form beside the live preview. **Download PDF** calls `window.print()`; print styles hide everything except the agreement, so users choose "Save as PDF".
- `src/components/NdaForm.tsx` — the cover page form.
- `src/components/CoverPage.tsx` — the filled-in cover page (mirrors `templates/Mutual-NDA-coverpage.md`).
- `src/components/StandardTerms.tsx` — renders the Standard Terms markdown, substituting Governing Law and Jurisdiction into the `<span class="coverpage_link">` references. User input is rendered as text, never HTML.
- `src/lib/nda.ts` — data model and pure helpers (unit tested in `nda.test.ts`).
