# Forge — Gaming PC Builder

Context file for any Claude agent working on this project. Keep it current: update
it whenever architecture, conventions, or open tasks change.

## What this is

**Forge** is a beautiful gaming-PC builder that lets a user build a PC from a broad
catalogue of real-world parts. It tells you what you need for a functioning PC, flags
compatible / incompatible combinations, explains what you'd need to use a different part,
and gives **price estimates in euros (€)** for every item. Target user is European (the
owner explicitly does not want USD).

It is a **static, vanilla HTML/CSS/JS app** — no framework, no build step, no
dependencies. Serve the folder over HTTP (`python -m http.server`), not `file://`.

**Not a PWA.** Service-worker / offline / installable support was **removed 2026-07-01**
(owner: it only ever added a service worker that served stale files and annoyed anyone
working on it). There is no `sw.js`, no `manifest.webmanifest`, no install button. A small
one-time cleanup script in `index.html` unregisters any service worker a returning visitor
still has and clears its caches — do **not** re-add a service worker.

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
- **The Claude preview HTTP-caches `css/*` and `js/*` hard** — a plain reload can serve
  stale assets. Assets are versioned (`?v=N` in index.html); bump that number when you edit
  CSS/JS so the change actually loads. If you still see stale output, clear everything in the
  browser console/eval before checking results (also unregisters any leftover service worker):
  `(async()=>{const rs=await navigator.serviceWorker.getRegistrations();for(const r of rs)await r.unregister();const ks=await caches.keys();for(const k of ks)await caches.delete(k);location.reload();})()`.

## File structure

```
index.html                 # markup + script/style links + one-time SW-cleanup snippet
css/styles.css             # all styling (theme variables at top)
js/data.js                 # CATEGORIES, PARTS (catalog), PRESETS, SOCKET_MEM
js/art.js                  # partArt(category, part) -> inline SVG line-art per part
js/compat.js               # compatibility engine (pure functions)
js/app.js                  # UI controller / state / events / persistence
icons/icon.svg             # red hexagon favicon (icon-192.png/icon-512.png now unused, PWA removed)
img/hex-tile.svg           # seamless tileable hexagon-mesh background (owner-supplied, fill #141414)
.claude/launch.json        # preview server config
CLAUDE.md                  # this file
```

## Data model (`js/data.js`)

- `CATEGORIES`: ordered list `{ id, name, icon, essential, hint }`. Slots: cpu, mobo,
  ram, gpu (optional), storage, psu, case, cooler.
- `PARTS`: object keyed by category id → array of part objects. Every part has `id`,
  `name`, `price` (euros, integer), `spec` (short tagline), plus rich, **accurate
  real-world spec fields** surfaced on the detail page via `SPEC_FIELDS` in `app.js`
  (cpu: cores/threads/pcore/ecore/base/boost/l3/arch/memSpeed/tdpRated/igpuName; gpu:
  vram/vramType/bus/boost/power_conn; ram: modules/speed/cl/voltage; mobo: chipset/
  ramSlots; storage: tech/form/pcie/read/write; psu: modular/fan/atx3/power_conn; case:
  radiator; cooler: fans). **Power note:** `tdp` = realistic PEAK power (AMD PPT / Intel
  MTP) used by the engine + PSU sizing; `tdpRated` = nominal boxed TDP. Both are shown so
  nothing is mislabelled. Plus the category-specific compatibility attributes:
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
- Presets modal, toast.
- **Mobile UI (≤900px) is a purpose-built app layout, NOT the shrunk desktop.** A fixed
  **bottom tab bar** (`#mobileNav`: Build / Parts / Summary) shows one full-screen view at a
  time — toggled by `document.body.dataset.mtab` (`setMobileTab` in app.js) with CSS
  `body[data-mtab="…"] .panel { display:none }`. Part cards become full-width **list rows**
  (thumbnail + name + spec + price + Add) via a CSS grid override, not a shrunken grid. The
  desktop 3-column layout is untouched. The old scroll-to-hide build panel + `#mobileBar`
  were removed. Detail page + spec sheet stack and scale up. `isMobile()` gates behaviour.
  NOTE: the Claude preview HTTP-caches `css/*` and `js/*` hard — a plain reload serves STALE
  assets. Assets are versioned (`?v=N` in index.html). **When you edit CSS/JS, bump that `?v=`
  number in index.html** so the change actually loads. Also: the preview can't emulate a true narrow *paint* width — trust
  `matchMedia`/computed styles + a real device over its screenshots.

## Conventions

- **Commit every change** (owner requirement). Small, focused commits with clear messages.
- Keep **CLAUDE.md** in the repo and up to date — it's the shared context for all agents.
- No dependencies / no build step. Plain ES (IIFE in app.js, globals across script files).
- No service worker / PWA (removed 2026-07-01) — don't re-add one. Bust preview/browser cache
  by bumping `?v=N` in index.html.
- Euros everywhere. Integers, formatted with `Intl`/`toLocaleString('en-IE')`.

## Past issues fixed (kept for context — don't reintroduce these)

- **2026-06-30 — overlay ate every click:** `.modal-backdrop` set `display: grid` in CSS,
  which overrode the `hidden` attribute (UA `display:none`), so the preset modal overlay
  was always rendered at `z-index: 60`, transparent, covering the viewport. Fixed with
  `[hidden]{display:none!important}` at the top of `styles.css` — keep that rule.
- **2026-07-01 — stale SW cache silently broke the entire render:** `sw.js` served
  `index.html` cache-first with no versioning. A stale cached HTML (from before the mobile
  bottom-nav was added) paired with a fresh `app.js` that unconditionally did
  `el.mobileNav.addEventListener(...)` at the top level — `el.mobileNav` was `null`, threw,
  and silently killed the *entire* script (no visible error, nothing rendered: no tabs, no
  slots, no parts). This is almost certainly what "most things stop working / look janky"
  reports were actually seeing in production. Fixed two ways: (1) `sw.js` fetch handler now
  goes **network-first for navigation requests** (`e.request.mode === 'navigate'`) so
  `index.html` can never get permanently stuck stale — only the `?v=`-versioned hashed
  assets are cache-first; (2) `app.js` wraps every `el.X.addEventListener` in a null-safe
  `on()` helper and wraps the boot sequence in try/catch with `console.error`, so a future
  DOM/JS mismatch degrades instead of hard-crashing silently.
- **2026-07-01 — mobile Build tab: prices/remove-buttons clipped off-screen:**
  `#slotCollapse` is `display:grid` with no `grid-template-columns` declared, so its single
  implicit column sized to the content's max-content width instead of the container width
  (classic CSS grid "blowout"). Desktop's `overflow:hidden` masked it; mobile's
  `overflow:visible` (needed since the panel doesn't collapse there) exposed it, and
  `body{overflow-x:hidden}` silently clipped the overflow with no scrollbar — so every
  price and remove (×) button was invisible past ~345px in. Fixed with
  `grid-template-columns: minmax(0, 1fr)` on `.slot-collapse`. If a similar single-column
  grid wrapper is added elsewhere, give it `minmax(0, 1fr)` too, not bare `1fr`/`auto`.
- **2026-07-01 — other mobile/responsive jank found via live preview testing at every
  breakpoint** (documented so they aren't reintroduced): build-slot remove buttons only
  showed on `:hover` (unreachable on touch — now always visible on mobile); all `:hover`
  effects were unconditional, so tapping on touch left a stuck hover state (now wrapped in
  `@media (hover: hover) and (pointer: fine)`); category tabs overflow horizontally with no
  scroll affordance (added JS-driven `.fade-l`/`.fade-r` mask classes); the preset modal had
  no internal scroll so short viewports permanently hid the last preset card(s) with no way
  to reach them (fixed with a flex modal + scrollable `.preset-grid`, plus
  `grid-auto-rows: max-content` — `align-content: normal` resolves to `stretch` for grid
  containers, which was squashing card rows to fit instead of letting them overflow/scroll);
  the toast notification overlapped and hid the mobile bottom tab bar (repositioned above it
  on mobile). Bumped asset version to `v=8` for all of this.
- **2026-07-01 — desktop imagery + background overhaul (`v=9`):** owner reported desktop
  looked "broken" — root cause was the 5 mismatched real photos among 65 line-art cards (see
  open task 3). Removed all photos; `partThumb()` now always renders the bespoke line-art, so
  the catalog is visually consistent everywhere. Polished `.part-media` (taller, internal
  padding, drop-shadow on the art, a faint red seam — a vertical divider in the mobile row
  layout). Replaced the tiny 28×49 stroke-hex data-URI background (owner: "doesn't work") with
  an owner-supplied **seamless tileable hexagon mesh** at `img/hex-tile.svg`, tiled via
  `.aurora::after { background: url(../img/hex-tile.svg) repeat; background-size:300px }` with a
  radial mask so it fades toward the bottom. Also fixed a latent version drift: `index.html`
  had been at `?v=6` while `sw.js` pre-cached `?v=8` (the pre-cache silently never matched) —
  everything is now unified at `?v=9`, and `hex-tile.svg` was added to the SW `ASSETS` list.
- **2026-07-01 — PWA / service worker removed entirely (`v=10`):** owner's call — the SW never
  delivered real value and mostly served stale files that annoyed anyone developing on it (it
  was the root of two prior render bugs). Deleted `sw.js` + `manifest.webmanifest`, the SW
  registration, the `manifest`/`apple-touch-icon` links, and the install button + its
  `beforeinstallprompt`/`appinstalled` handlers and `.install-btn` CSS. Replaced the SW
  registration in `index.html` with a **one-time cleanup** that unregisters any existing SW and
  clears its caches on load, so returning visitors (incl. the live Pages site) self-heal instead
  of staying stuck on a cached build. Assets bumped to `?v=10`. The two SW-related "past issues"
  above are now moot but kept for history — **do not re-add a service worker.**

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
3. [DONE — DECIDED AGAINST PHOTOS] **Part imagery = unified bespoke line-art, no photos.**
   The real-photo experiment (5 of 70 parts had Wikimedia photos: RTX 4090, RX 7900 XTX,
   Arc B580, i9-14900K, Lian Li O11) was **removed 2026-07-01** at the owner's direction.
   Reason: a handful of mismatched marketing shots (branding, backgrounds, odd framing — the
   Lian Li one was a der8auer-edition desk photo with text) sitting among 65 clean SVG cards
   read as broken/janky on desktop, and the sandbox has no outbound network to source/verify
   consistent per-SKU photos. Decision: **`partThumb()` now always returns `partArt()`** — the
   bespoke white-line/red-accent line-art (`js/art.js`), consistent for every part, fully
   on-brand ("not AI slop"), zero network dependency. The `img` field, the `<img>`/`onerror`
   fallback, and the `.part-photo`/`.art-fallback`/`.photo-failed` CSS were all deleted.
   **Do not reintroduce mixed photos** unless the owner supplies a *complete, consistent*
   clean-cutout set for all 70 parts. To upgrade imagery, improve `js/art.js` instead.
4. [DONE] Mobile-first refinements (detail layout, touch targets, breakpoints).
5. [DONE] GitHub repo + Pages.
6. [BLOCKED] Email the owner the full parts list. The **Gmail connector is not connected**
   to the account (`create_draft` returns "requires authentication"). Once the user connects
   Gmail, create a draft to elliotactoncarey@gmail.com — a generator script pattern is in
   the git history (node one-liner over `js/data.js`). 70 parts total.
7. [DONE] Fix "UI looks janky on resize/mobile" (requested 2026-07-01) — see "Past issues
   fixed" above. Root cause was a stale-SW-cache render crash plus a handful of genuine
   responsive bugs (CSS grid blowout clipping prices, hover-stuck touch states, unreachable
   modal content, toast overlapping the tab bar). All fixed and verified across breakpoints
   (320px–1440px+, portrait and landscape) in the live preview.
