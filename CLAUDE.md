# Forge — Gaming PC Builder

Context file for any Claude agent working on this project. Keep it current: update
it whenever architecture, conventions, or open tasks change.

## What this is

**Forge** is a beautiful, installable **PWA** (Progressive Web App) that lets a user
build a gaming PC from a broad catalogue of real-world parts. It tells you what you
need for a functioning PC, flags compatible / incompatible combinations, explains what
you'd need to use a different part, and gives **price estimates in euros (€)** for every
item. Target user is European (the owner explicitly does not want USD).

It is a **static, vanilla HTML/CSS/JS app** — no framework, no build step, no
dependencies. It must run by serving the folder over HTTP (the service worker and PWA
install need `http(s)://`, not `file://`).

## Owner / preferences

- Owner GitHub: **HoodedHacker32**. Email: elliotactoncarey@gmail.com.
- Prices must be in **euros**, never dollars.
- Design must NOT look like generic "AI slop". Current aesthetic: **hard red (#ff2532)
  + white on near-black**, with a **serious hexagon motif** throughout (hex brand mark,
  hex icons, hex-grid background, angular notched-corner buttons via `--cut` clip-path).
  Avoid purple/teal gradients (previous look, rejected).
- **Mobile-friendliness is a priority**, but must not feel harsh/compromised on desktop.

## Run / preview

- Local preview server (configured in `.claude/launch.json`): `python -m http.server 4173`.
  Then open `http://localhost:4173/`. Use Python, not `npx http-server` (npx was
  unreliable here).
- The Claude preview sandbox **blocks programmatic `window.scrollTo`** and `element.click()`
  bypasses overlays — so to test real click behaviour, check `document.elementFromPoint`
  on a button's centre rather than trusting `.click()`.

## File structure

```
index.html                 # markup + script/style links + SW registration
css/styles.css             # all styling (theme variables at top)
js/data.js                 # CATEGORIES, PARTS (catalog), PRESETS, SOCKET_MEM
js/art.js                  # partArt(category, part) -> inline SVG line-art per part
js/compat.js               # compatibility engine (pure functions)
js/app.js                  # UI controller / state / events / persistence
manifest.webmanifest       # PWA manifest
sw.js                      # service worker (offline-first cache; bump CACHE on asset change)
icons/icon.svg             # red hexagon app icon (+ icon-192.png, icon-512.png generated)
.claude/launch.json        # preview server config
CLAUDE.md                  # this file
```

## Data model (`js/data.js`)

- `CATEGORIES`: ordered list `{ id, name, icon, essential, hint }`. Slots: cpu, mobo,
  ram, gpu (optional), storage, psu, case, cooler.
- `PARTS`: object keyed by category id → array of part objects. Every part has `id`,
  `name`, `price` (euros, integer), `spec` (short string), plus category-specific
  attributes the engine reasons over:
  - cpu: `socket` (AM5/AM4/LGA1700/LGA1851), `mem`, `tdp`, `igpu`, `cores`, `cooler_inc`
  - mobo: `socket`, `mem`, `form` (ATX/Micro-ATX/Mini-ITX), `m2`, `pcie`, `wifi`
  - ram: `mem` (DDR4/DDR5), `size` (GB), `shortage` (true — see below)
  - gpu: `tdp`, `length` (mm), `psu_min` (W)
  - storage: `iface` (M.2/SATA), `size` (GB)
  - psu: `watt`, `rating`, `form` (ATX/SFX)
  - case: `form`, `gpu_max` (mm), `cooler_max` (mm air height), `psu_form`
  - cooler: `type` (air/aio), `height` (mm), `rad` (mm), `sockets` [], `tdp_max`
- `PRESETS`: curated builds referencing part ids, with `accent` colour + `blurb`.

### DRAM shortage

Memory prices are deliberately inflated (~1.6–2.0×) to reflect the **2026 global DRAM
shortage**, and each RAM part carries `shortage: true`. The UI shows a "⚠ Shortage" tag
on RAM cards and a heads-up banner in the Memory category. Keep this — it's an explicit
owner requirement ("does it account for the global ram shortage").

## Compatibility engine (`js/compat.js`)

Pure functions over a `build` object `{ cpu, mobo, ram, gpu, storage, psu, case, cooler }`
(values are part objects or undefined). Key exports:

- `analyse(build)` → array of `{ severity, slot, msg }`, severity ∈ `error|warn|ok|info`.
- `estimateDraw(build)` → est. system watts. `recommendedPsu(draw)` → suggested PSU size.
- `missingEssentials(build, categories)`, `buildHealth(build, categories)` → `empty|error|warn|ok`.

Rules covered: CPU↔socket, board/CPU↔DDR generation, case↔board form factor, case↔GPU
length, case↔cooler height, cooler↔socket + TDP capacity, PSU form↔case, PSU wattage vs
draw + GPU minimum, storage M.2 availability, no-iGPU-needs-GPU, cooler-not-included,
no-Wi-Fi guidance.

The catalog dims + badges incompatible parts live (per-card `compatFlag`), and the
contextual banner explains constraints ("this board needs DDR5", "cards up to 360mm fit").

## UI controller (`js/app.js`)

- State: `build` (slot→part), `activeCat`, `searchTerm`. Persisted to `localStorage`
  key `forge.build.v1` (stores ids only; rehydrated against PARTS on load).
- Renders: category tabs, build slots (left), part cards (centre, with `partArt`
  illustration + price + live compat flag), summary (right: total €, est. draw, report,
  PSU load meter, copy-summary).
- Build panel is **collapsible**: header toggle with animated chevron, and auto-folds on
  scroll-down / reveals on scroll-up (so it never blocks the catalog on mobile).
- Presets modal, toast, PWA install button (`beforeinstallprompt`).

## Conventions

- **Commit every change** (owner requirement). Small, focused commits with clear messages.
- Keep **CLAUDE.md** in the repo and up to date — it's the shared context for all agents.
- No dependencies / no build step. Plain ES (IIFE in app.js, globals across script files).
- Bump `CACHE` in `sw.js` whenever cached asset list or contents change, or the SW serves
  stale files.
- Euros everywhere. Integers, formatted with `Intl`/`toLocaleString('en-IE')`.

## Known issue found (2026-06-30) — FIX PENDING

**Root cause of "most buttons don't work":** `.modal-backdrop` sets `display: grid` in
CSS, which **overrides the `hidden` attribute** (UA `display:none`). So the preset modal
overlay is always rendered at `z-index: 60`, transparent, covering the whole viewport and
intercepting every click. Fix: make `[hidden]` win (e.g. `[hidden]{display:none!important}`
and/or `.modal-backdrop[hidden]{display:none}`). This was the first thing to fix.

## Repo & deployment

- GitHub repo: **https://github.com/HoodedHacker32/forge-pc-builder** (public).
- Live site (GitHub Pages, main branch / root): **https://hoodedhacker32.github.io/forge-pc-builder/**.
- Pages was enabled via `gh api -X POST repos/.../pages -f source[branch]=main -f source[path]=/`.
- Pushing to `main` redeploys automatically (build_type: legacy). First deploy can take a
  couple of minutes.

## Open tasks (requested 2026-06-30) — status

1. [DONE] Fix the overlay-eats-clicks bug — `[hidden]{display:none!important}`.
2. [DONE] **Part detail pages** — hash route `#/part/<id>`, full specs, live compatibility,
   price, Add/Remove, keyboard + Escape support. Implemented in `app.js` (renderDetail/
   router/openDetail). Cards now open the detail; a quick-add button adds without leaving.
3. [INFRA DONE, IMAGES PARTIAL] **Real product images.** `partThumb()` renders `p.img`
   (a real photo) with automatic `onerror` fallback to the SVG `partArt`. **5 of 70 parts
   have real photos** so far (RTX 4090, RX 7900 XTX, Arc B580, i9-14900K, Lian Li O11
   Dynamic) — all the others fall back to the SVG illustration. Reason it's only 5: this
   sandbox has **no outbound network** (curl
   returns 000) so images can't be downloaded/verified here, and free, correctly-matched
   per-SKU product photos are scarce (Wikimedia mostly has die-shots or video screenshots
   for the rest). **Working pattern to add more:** set `img` on a part in `js/data.js` to
   `https://commons.wikimedia.org/wiki/Special:FilePath/<Exact_File_Name>.jpg?width=600`
   (the officially-supported hotlink endpoint — 301-redirects to the canonical thumb; the
   user's browser loads it client-side, so it works on Pages even though the sandbox can't).
   Verify a candidate file exists by WebFetching the Special:FilePath URL and checking it
   redirects to a real `upload.wikimedia.org/...thumb...` URL. The `onerror` fallback keeps
   the UI clean for any that fail, so it is safe to add URLs you can't render here. Avoid
   die-shots / video-screenshot files — prefer filenames that clearly name the retail card
   (e.g. `Asus_Strix_RTX_4090.jpg`). For non-GPU parts, retailer/brand CDN URLs also work
   if hotlink-friendly + https; the user can paste preferred URLs to wire in directly.
4. [DONE] Mobile-first refinements (detail layout, touch targets, breakpoints).
5. [DONE] GitHub repo + Pages.
6. [BLOCKED] Email the owner the full parts list. The **Gmail connector is not connected**
   to the account (`create_draft` returns "requires authentication"). Once the user connects
   Gmail, create a draft to elliotactoncarey@gmail.com — a generator script pattern is in
   the git history (node one-liner over `js/data.js`). 70 parts total.
