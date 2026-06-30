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

## Open tasks (requested 2026-06-30)

1. [bug] Fix the overlay-eats-clicks issue above so buttons work.
2. [feature] **Part detail pages** — clicking a part opens a detail view (hash route
   `#part/<id>`, works on GitHub Pages) with full specs, compatibility notes vs current
   build, price, and an "Add to build" button — viewable *before* adding.
3. [feature] **Real product images** on the detail pages, sourced from an actual retailer
   or the brand. Use a graceful fallback to the SVG `partArt` if an image fails to load.
4. [polish] Mobile-first refinements without harming desktop.
5. [infra] GitHub repo (done early), GitHub **Pages** deployment.
6. [task] Email the owner a list of every part via the Gmail connector.
