---
name: Design subagent CSS/theme rewrites need a Tailwind version check
description: After a design subagent rewrites the main theme CSS file (full theme overhaul, palette relaunch, etc.), verify it uses the project's actual Tailwind syntax version before trusting a visual screenshot.
---

When a design subagent does a full rewrite of the app's main CSS/theme file (e.g. `index.css`) as part of a big visual relaunch, it can write Tailwind v3 directives (`@tailwind base; @tailwind components; @tailwind utilities;`) into a project that actually uses Tailwind v4 (via `@tailwindcss/vite` + `@import "tailwindcss";`).

**Why:** `tsc --noEmit` and the dev server both build/start cleanly in this case — there is no compile error. The v4 pipeline just silently ignores the v3 `@tailwind` directives, so no Tailwind utility classes are generated at all. Every `flex`, `rounded-full`, `shadow-sm`, `text-slate-800`, etc. className in the app becomes a no-op. The rendered result looks like bare bordered/unstyled boxes — easy to mistake for "the design is just rough" rather than "the CSS pipeline is broken", especially if you only read the component code (which looks fine) instead of screenshotting.

**How to apply:** Whenever a subagent (or you) rewrites the main theme CSS file, grep it for `@tailwind ` and compare against the installed `tailwindcss` version (v4 needs `@import "tailwindcss";`, not the three `@tailwind` lines) before trusting a "looks done" report. Always screenshot at least 2-3 pages after a theme rewrite — don't rely solely on typecheck/build success — since this class of bug is invisible to the compiler.

Related pitfalls found in the same pass: subagents can also write invalid Tailwind gradient-text classes as `-webkit-background-clip-text` (should be `bg-clip-text`) and invalid JSX SVG props like `strokeLinelinejoin` (should be `strokeLinejoin`) — both compile-time TS errors or silently broken visuals, worth a quick grep sweep after any large generated-UI pass.
