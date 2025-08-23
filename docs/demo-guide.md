# Screenshots and Demo Recording Guide

Use this guide to produce consistent screenshots and a 60–90s product demo.

## Quick demo script (60–90s)

1. Hook (3–5s)
   - “An AI-powered resume builder that tailors your resume to a job in minutes.”
2. Home + Guest mode (5–10s)
   - Show the Home page and the “Continue as guest” card.
   - Click Continue as guest.
3. Template selection (10–15s)
   - Pick a template and click Start with This Template.
   - Mention drag-and-drop section ordering and live preview.
4. Upload or Generate (10–15s)
   - Show Upload tab (PDF/DOCX/TXT) or paste a job and click Generate.
5. Builder (15–20s)
   - Adjust font/color, reorder sections, and show autosave and high-contrast toggle.
6. Export (10–15s)
   - Click Export as PDF and show the downloaded file name.
7. Close (5s)
   - “Fast, ATS‑friendly, secure tokens with httpOnly refresh.”

## Screenshot checklist

Capture both desktop and mobile where noted.

- Home hero + guest-mode card (desktop + mobile)
- Template gallery preview (desktop)
- Upload tab with accepted types (desktop)
- Builder layout: left sidebar, editor, right preview (desktop + mobile)
- Export toolbar (desktop + mobile)
- PDF download confirmation or file preview (desktop)

## Recording tips

- Resolution: 1920×1080 (or 1280×720). Cursor highlight on click.
- UI zoom: 100–110% for readability.
- Record as guest or against a seeded demo backend; avoid showing secrets.
- Keep narration brisk; trim pauses.

## Environment prep

- Frontend: `npm run build && npm run preview` (or `npm run dev`).
- Backend: Ensure env set; run FastAPI server.
- Optional: Set `VITE_API_BASE_URL` to point at your backend.

## Optional talking points (if time allows)

- ATS-friendly templates and PDF export
- AI optimization from job description
- Security: short-lived access token, httpOnly refresh cookie, CSRF on refresh
- Rate limiting and optional Redis backoff for auth
