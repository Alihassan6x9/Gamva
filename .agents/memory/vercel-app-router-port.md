---
name: Vercel Next.js App Router port without src/ layout
description: fullstack-copy-frontend.sh only auto-detects client/src or src/ layouts; Next.js App Router backups (app/ dir, no src/) need manual porting.
---

`fullstack-copy-frontend.sh`'s client-dir auto-detection looks for `client/src`, `src/components`, `src/pages`, `src/App.tsx`, or `src/main.tsx` in `.migration-backup/`. A Next.js App Router project (routes under `app/`, no `src/` at all) matches none of these and the script exits with "Could not find client directory."

**Why:** The script assumes a pre-existing Vite-shaped `src/` tree to copy wholesale. App Router projects have a fundamentally different shape (route folders, `page.js`/`layout.js` files, colocated client components) that doesn't map 1:1 onto that assumption.

**How to apply:** For small/medium App Router backups, skip the script and port files by hand into the new `react-vite` artifact: convert each route file to a page component, replace `next/navigation` (`useRouter`, `useSearchParams`) with `wouter` (`useLocation`, `useSearch`, `useParams`), inline `next.config.mjs` env/redirect settings into `vite.config.ts`, and rewrite `NEXT_PUBLIC_*` env reads to `import.meta.env.VITE_*`. Also guard any client SDK that throws on missing config (e.g. Firebase `initializeApp`) behind a config-presence check so the app doesn't hard-crash when env vars aren't set yet — show a friendly in-app message instead.
