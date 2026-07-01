/* =========================================================================
   Forge · App controller
   ========================================================================= */
(function () {
  'use strict';

  const STORAGE_KEY = 'forge.build.v1';

  /* ---- State ---- */
  let build = {};            // slotId -> part object
  let activeCat = 'cpu';     // currently browsed category
  let searchTerm = '';

  /* ---- Element refs ---- */
  const $ = (id) => document.getElementById(id);
  const el = {
    slotList: $('slotList'), catTabs: $('catTabs'), partGrid: $('partGrid'),
    emptyState: $('emptyState'), catalogTitle: $('catalogTitle'), catalogSub: $('catalogSub'),
    search: $('searchInput'), compatBanner: $('compatBanner'),
    totalPrice: $('totalPrice'), partCount: $('partCount'), wattReadout: $('wattReadout'),
    reportList: $('reportList'), psuMeter: $('psuMeter'), psuBarFill: $('psuBarFill'),
    psuLoadText: $('psuLoadText'), psuHint: $('psuHint'),
    healthPill: $('healthPill'), healthLabel: $('healthLabel'), slotProgress: $('slotProgress'),
    presetBtn: $('presetBtn'), resetBtn: $('resetBtn'), shareBtn: $('shareBtn'),
    presetModal: $('presetModal'), presetGrid: $('presetGrid'), presetClose: $('presetClose'),
    toast: $('toast'), installBtn: $('installBtn'),
    buildPanel: $('buildPanel'), buildToggle: $('buildToggle'), slotCollapse: $('slotCollapse'),
    partDetail: $('partDetail'),
    mobileNav: $('mobileNav'), mnavTotal: $('mnavTotal'), mnavBadge: $('mnavBadge'),
  };

  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

  /* ---- Icons (inline SVG) ---- */
  const ICONS = {
    cpu:  '<rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>',
    board:'<rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="6" height="6"/><path d="M16 7h2M16 11h2M7 16h10"/>',
    ram:  '<path d="M2 9h20v7H2z"/><path d="M6 16v3M10 16v3M14 16v3M18 16v3"/>',
    gpu:  '<rect x="2" y="6" width="20" height="11" rx="2"/><circle cx="9" cy="11.5" r="2.5"/><circle cx="16" cy="11.5" r="2"/>',
    ssd:  '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/>',
    psu:  '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="3"/><path d="M16 9v6"/>',
    case: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 6h6M9 9h6"/><circle cx="12" cy="16" r="2"/>',
    fan:  '<circle cx="12" cy="12" r="9"/><path d="M12 12c0-4 1-6 3-6s2 4-3 6c4 0 6 1 6 3s-4 2-6-3c0 4-1 6-3 6s-2-4 3-6c-4 0-6-1-6-3s4-2 6 3z"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    warn: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.3 1.7 18a2 2 0 0 0 1.7 3h17.2a2 2 0 0 0 1.7-3L14.4 3.3a2 2 0 0 0-3.4 0z"/>',
    err:  '<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  };
  const svg = (name, size = 18) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;

  const fmtPrice = (n) => Number(n).toLocaleString('en-IE');
  const fmtCap = (gb) => gb >= 1000 ? (gb / 1000) + ' TB' : gb + ' GB';
  const esc = (s) => String(s).replace(/"/g, '&quot;');

  /* Find a part (and its category) by id across the whole catalog. */
  function findPart(id) {
    for (const cat of Object.keys(PARTS)) {
      const part = PARTS[cat].find(p => p.id === id);
      if (part) return { cat, part };
    }
    return null;
  }

  /* Card thumbnail / detail hero: real product photo if present, else SVG art.
     The <img> falls back to the SVG illustration if the photo fails to load. */
  function partThumb(cat, p) {
    const art = partArt(cat, p);
    if (!p.img) return art;
    return `<img class="part-photo" src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy"
      onerror="this.parentNode.classList.add('photo-failed');this.remove();" />
      <span class="art-fallback">${art}</span>`;
  }

  const caseBoardSupport = (form) => ({
    'ATX': 'ATX, Micro-ATX, Mini-ITX',
    'Micro-ATX': 'Micro-ATX, Mini-ITX',
    'Mini-ITX': 'Mini-ITX',
  }[form] || form);
  const memList = (m) => Array.isArray(m) ? m.join(' / ') : m;

  /* Full, accurate spec sheet per category for the detail page.
     Every row reads a real structured field from js/data.js. */
  const SPEC_FIELDS = {
    cpu: [
      ['Cores / threads', p => p.pcore != null ? `${p.cores} cores (${p.pcore}P + ${p.ecore}E) · ${p.threads} threads` : `${p.cores} cores · ${p.threads} threads`],
      ['Base clock', p => p.base + ' GHz'],
      ['Max boost clock', p => p.boost + ' GHz'],
      ['L3 cache', p => p.l3 + ' MB'],
      ['Architecture', p => p.arch],
      ['Socket', p => p.socket],
      ['Memory support', p => `${memList(p.mem)}${p.memSpeed ? ` · up to ${p.memSpeed.toLocaleString('en-IE')} MT/s` : ''}`],
      ['Integrated graphics', p => p.igpu ? (p.igpuName || 'Yes') : 'None — needs a graphics card'],
      ['Rated TDP', p => p.tdpRated + ' W'],
      ['Peak power draw', p => p.tdp + ' W (PPT / Max Turbo)'],
      ['Boxed cooler', p => p.cooler_inc ? 'Included' : 'Not included — buy one separately'],
    ],
    mobo: [
      ['Socket', p => p.socket],
      ['Chipset', p => p.chipset],
      ['Memory type', p => memList(p.mem)],
      ['RAM slots', p => `${p.ramSlots} × DIMM`],
      ['Form factor', p => p.form],
      ['M.2 slots', p => `${p.m2} × M.2 NVMe`],
      ['Graphics slot', p => `PCIe ${p.pcie} ×16`],
      ['Wi-Fi', p => p.wifi ? 'Built-in' : 'Not included — use Ethernet or add a card'],
    ],
    ram: [
      ['Type', p => p.mem],
      ['Total capacity', p => fmtCap(p.size)],
      ['Kit', p => p.modules],
      ['Speed', p => `${p.speed.toLocaleString('en-IE')} MT/s`],
      ['CAS latency', p => 'CL' + p.cl],
      ['Voltage', p => p.voltage.toFixed(2) + ' V'],
      ['Shortage note', p => p.shortage ? '⚠ Priced up by the 2026 DRAM shortage' : '—'],
    ],
    gpu: [
      ['Brand', p => p.brand],
      ['Video memory', p => `${p.vram} GB ${p.vramType}`],
      ['Memory bus', p => p.bus + '-bit'],
      ['Reference boost clock', p => `${p.boost.toLocaleString('en-IE')} MHz`],
      ['Board power (TDP)', p => p.tdp + ' W'],
      ['Card length', p => p.length + ' mm'],
      ['Min. recommended PSU', p => p.psu_min + ' W'],
      ['Power connector', p => p.power_conn],
    ],
    storage: [
      ['Type', p => p.tech],
      ['Interface', p => p.pcie],
      ['Form factor', p => p.form],
      ['Capacity', p => fmtCap(p.size)],
      ['Sequential read', p => `~${p.read.toLocaleString('en-IE')} MB/s`],
      ['Sequential write', p => `~${p.write.toLocaleString('en-IE')} MB/s`],
    ],
    psu: [
      ['Wattage', p => p.watt + ' W'],
      ['Efficiency', p => '80 PLUS ' + p.rating],
      ['Form factor', p => p.form],
      ['Modularity', p => p.modular],
      ['Fan', p => p.fan],
      ['ATX 3.0', p => p.atx3 ? 'Yes' : 'No'],
      ['GPU power connector', p => p.power_conn],
    ],
    case: [
      ['Form factor', p => p.form],
      ['Motherboard support', p => caseBoardSupport(p.form)],
      ['Max GPU length', p => p.gpu_max + ' mm'],
      ['Max air-cooler height', p => p.cooler_max + ' mm'],
      ['Radiator support', p => p.radiator],
      ['Power supply', p => p.psu_form + ' form factor'],
    ],
    cooler: [
      ['Type', p => p.type === 'aio' ? 'Liquid AIO (radiator)' : 'Air tower'],
      ['Size', p => p.type === 'aio' ? p.rad + ' mm radiator' : p.height + ' mm tall'],
      ['Fans', p => p.fans],
      ['Cooling capacity', p => `Up to ~${p.tdp_max} W CPUs`],
      ['Socket support', p => p.sockets.join(', ')],
    ],
  };

  /* ---- Persistence ---- */
  function save() {
    const ids = {};
    Object.keys(build).forEach(k => { ids[k] = build[k].id; });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch (e) {}
  }
  function load() {
    try {
      const ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      Object.keys(ids).forEach(slot => {
        const part = (PARTS[slot] || []).find(p => p.id === ids[slot]);
        if (part) build[slot] = part;
      });
    } catch (e) {}
  }

  /* ---- Toast ---- */
  let toastTimer;
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.hidden = false;
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.classList.remove('show');
      setTimeout(() => { el.toast.hidden = true; }, 300);
    }, 2400);
  }

  /* ====================================================== RENDER ===== */

  function renderTabs() {
    el.catTabs.innerHTML = CATEGORIES.map(c => {
      const filled = !!build[c.id];
      return `<button class="cat-tab ${activeCat === c.id ? 'active' : ''} ${filled ? 'filled' : ''}" data-cat="${c.id}">
        <span class="cat-tab-ico">${svg(c.icon, 16)}</span>
        <span>${c.name}</span>
        ${filled ? `<span class="tab-tick">${svg('check', 12)}</span>` : ''}
      </button>`;
    }).join('');
    updateCatTabsFade();
  }

  // Horizontally-scrolling category tabs have no native cue that there's more off-screen —
  // fade the edge(s) that still have content to scroll to, so it reads as scrollable.
  function updateCatTabsFade() {
    const t = el.catTabs;
    const max = t.scrollWidth - t.clientWidth;
    t.classList.toggle('fade-l', t.scrollLeft > 4);
    t.classList.toggle('fade-r', t.scrollLeft < max - 4);
  }

  function renderSlots() {
    el.slotList.innerHTML = CATEGORIES.map(c => {
      const part = build[c.id];
      const isActive = activeCat === c.id;
      if (part) {
        return `<li class="slot filled ${isActive ? 'active' : ''}" data-cat="${c.id}">
          <span class="slot-thumb">${partArt(c.id, part)}</span>
          <div class="slot-body">
            <span class="slot-cat">${c.name}</span>
            <span class="slot-name">${part.name}</span>
          </div>
          <span class="slot-price">€${fmtPrice(part.price)}</span>
          <button class="slot-remove" data-remove="${c.id}" title="Remove" aria-label="Remove ${part.name}">✕</button>
        </li>`;
      }
      return `<li class="slot empty ${isActive ? 'active' : ''} ${c.essential ? '' : 'optional'}" data-cat="${c.id}">
        <span class="slot-ico">${svg(c.icon)}</span>
        <div class="slot-body">
          <span class="slot-cat">${c.name}${c.essential ? '' : ' <em>· optional</em>'}</span>
          <span class="slot-name muted">${c.essential ? 'Not chosen yet' : 'Optional — tap to add'}</span>
        </div>
        <span class="slot-add">+</span>
      </li>`;
    }).join('');
  }

  /* Filter a part list against the current build for compatibility flags */
  function compatFlag(slot, part) {
    // Build a hypothetical build with this part slotted in
    const hypo = Object.assign({}, build, { [slot]: part });
    const issues = analyse(hypo).filter(i => i.slot === slot);
    if (issues.some(i => i.severity === 'error')) return 'error';
    if (issues.some(i => i.severity === 'warn')) return 'warn';
    return 'ok';
  }

  function renderParts() {
    const cat = CATEGORIES.find(c => c.id === activeCat);
    el.catalogTitle.textContent = cat.name;
    el.catalogSub.textContent = cat.hint;

    let list = PARTS[activeCat] || [];
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(p => (p.name + ' ' + (p.spec || '')).toLowerCase().includes(t));
    }

    // Show contextual banner about what's needed for this category
    renderCatBanner();

    if (!list.length) {
      el.partGrid.innerHTML = '';
      el.emptyState.hidden = false;
      return;
    }
    el.emptyState.hidden = true;

    el.partGrid.innerHTML = list.map(p => {
      const selected = build[activeCat] && build[activeCat].id === p.id;
      const flag = (build.cpu || build.mobo || build.case || build.gpu) ? compatFlag(activeCat, p) : 'ok';
      const flagBadge = flag === 'error'
        ? `<span class="part-flag err">${svg('err', 13)} Incompatible</span>`
        : flag === 'warn'
          ? `<span class="part-flag warn">${svg('warn', 13)} Check fit</span>`
          : '';
      const shortageTag = p.shortage ? `<span class="shortage-tag" title="Affected by the 2026 DRAM shortage">⚠ Shortage</span>` : '';
      return `<article class="part-card ${selected ? 'selected' : ''} flag-${flag}" data-part="${p.id}" role="button" tabindex="0" aria-label="View ${p.name} details">
        <div class="part-media">${partThumb(activeCat, p)}${shortageTag}</div>
        <div class="part-top">
          <h3>${p.name}</h3>
          <span class="part-price">${p.price === 0 ? 'Free' : '€' + fmtPrice(p.price)}</span>
        </div>
        <p class="part-spec">${p.spec || ''}</p>
        <div class="part-foot">
          ${flagBadge || '<span class="part-flag ok">' + svg('check', 13) + ' Compatible</span>'}
          <button class="quick-add ${selected ? 'added' : ''}" data-quickadd="${p.id}" aria-label="${selected ? 'Remove from build' : 'Add to build'}">${selected ? 'Added ✓' : '+ Add'}</button>
        </div>
      </article>`;
    }).join('');
  }

  function renderCatBanner() {
    // Tell the user what's needed to unlock / constrain this category
    let msg = '';
    if (activeCat === 'mobo' && build.cpu) {
      msg = `Showing boards for <strong>${build.cpu.socket}</strong> to match your ${build.cpu.name}. Others are marked incompatible.`;
    } else if (activeCat === 'cpu' && build.mobo) {
      msg = `Your ${build.mobo.name} uses the <strong>${build.mobo.socket}</strong> socket — pick a matching CPU.`;
    } else if (activeCat === 'ram') {
      const base = build.mobo
        ? `This board needs <strong>${Array.isArray(build.mobo.mem) ? build.mobo.mem.join('/') : build.mobo.mem}</strong> memory. `
        : '';
      msg = `${base}<strong>Heads-up:</strong> prices reflect the ongoing 2026 global DRAM shortage — memory is unusually expensive right now.`;
    } else if (activeCat === 'gpu' && build.case) {
      msg = `Cards up to <strong>${build.case.gpu_max}mm</strong> fit your ${build.case.name}.`;
    } else if (activeCat === 'cooler' && build.case) {
      msg = `Air coolers up to <strong>${build.case.cooler_max}mm</strong> tall fit this case.`;
    } else if (activeCat === 'psu' && (build.cpu || build.gpu)) {
      const draw = estimateDraw(build);
      msg = `Estimated draw so far: <strong>~${draw}W</strong>. Aim for <strong>${recommendedPsu(draw)}W+</strong>.`;
    }
    if (msg) {
      el.compatBanner.innerHTML = msg;
      el.compatBanner.hidden = false;
    } else {
      el.compatBanner.hidden = true;
    }
  }

  function renderSummary() {
    const parts = Object.values(build);
    const total = parts.reduce((s, p) => s + p.price, 0);
    el.totalPrice.textContent = fmtPrice(total);
    el.partCount.textContent = `${parts.length} part${parts.length === 1 ? '' : 's'}`;
    const draw = estimateDraw(build);
    el.wattReadout.textContent = `${draw} W est. draw`;

    // Report
    const issues = analyse(build);
    const missing = missingEssentials(build, CATEGORIES);

    let html = '';
    if (!parts.length) {
      html = `<li class="report-item neutral">Add parts to see live compatibility checks.</li>`;
    } else {
      // errors first, then warns, then info, then ok
      const order = { error: 0, warn: 1, info: 2, ok: 3 };
      const sorted = issues.slice().sort((a, b) => order[a.severity] - order[b.severity]);
      html = sorted.map(i => {
        const ico = i.severity === 'error' ? 'err' : i.severity === 'warn' ? 'warn' : i.severity === 'info' ? 'info' : 'check';
        return `<li class="report-item ${i.severity}">${svg(ico, 15)}<span>${i.msg}</span></li>`;
      }).join('');

      if (missing.length) {
        html += `<li class="report-item warn">${svg('warn', 15)}<span>Still need: ${missing.map(m => m.name).join(', ')}.</span></li>`;
      }
      if (!issues.length && !missing.length) {
        html = `<li class="report-item ok">${svg('check', 15)}<span>Everything checks out — this build is ready to order.</span></li>` + html;
      }
    }
    el.reportList.innerHTML = html;

    // PSU meter
    if (build.psu && (build.cpu || build.gpu)) {
      const pct = Math.min(100, Math.round((draw / build.psu.watt) * 100));
      el.psuMeter.hidden = false;
      el.psuBarFill.style.width = pct + '%';
      el.psuBarFill.className = pct > 90 ? 'danger' : pct > 75 ? 'warn' : 'good';
      el.psuLoadText.textContent = `${draw}W / ${build.psu.watt}W · ${pct}%`;
      el.psuHint.textContent = pct > 90
        ? 'Running very close to capacity — size up.'
        : pct > 75 ? 'A little tight under load; fine but warm.'
        : 'Comfortable headroom for boosts and longevity.';
    } else {
      el.psuMeter.hidden = true;
    }

    // Health pill + progress
    const health = buildHealth(build, CATEGORIES);
    const filledEssentials = CATEGORIES.filter(c => c.essential && build[c.id]).length;
    const totalEssentials = CATEGORIES.filter(c => c.essential).length;
    el.slotProgress.textContent = `${filledEssentials} / ${totalEssentials} essentials`;

    const map = {
      empty: ['empty', 'Empty build'],
      error: ['error', 'Incompatible parts'],
      warn:  ['warn', 'Almost there'],
      ok:    ['ok', 'Ready to build'],
    };
    const [cls, label] = map[health];
    el.healthPill.className = 'health-pill ' + cls;
    el.healthLabel.textContent = label;

    // Mobile bottom nav mirrors the total + essentials progress.
    el.mnavTotal.textContent = fmtPrice(total);
    el.mnavBadge.textContent = `${filledEssentials}/${totalEssentials}`;
    el.mnavBadge.className = 'mnav-badge ' + cls;
  }

  function renderAll() {
    renderTabs();
    renderSlots();
    renderParts();
    renderSummary();
  }

  /* ============================================= DETAIL PAGE / ROUTER == */

  function renderDetail(id) {
    const found = findPart(id);
    if (!found) { location.hash = ''; return; }
    const { cat, part } = found;
    const category = CATEGORIES.find(c => c.id === cat);
    const selected = build[cat] && build[cat].id === part.id;

    // Live compatibility of this part against the current build.
    const hypo = Object.assign({}, build, { [cat]: part });
    const issues = analyse(hypo).filter(i => i.slot === cat);
    const order = { error: 0, warn: 1, info: 2, ok: 3 };
    issues.sort((a, b) => order[a.severity] - order[b.severity]);
    const compatHtml = issues.length
      ? issues.map(i => {
          const ico = i.severity === 'error' ? 'err' : i.severity === 'warn' ? 'warn' : i.severity === 'info' ? 'info' : 'check';
          return `<li class="report-item ${i.severity}">${svg(ico, 15)}<span>${i.msg}</span></li>`;
        }).join('')
      : `<li class="report-item info">${svg('info', 15)}<span>Pick other parts to see how this fits your build.</span></li>`;

    const rows = (SPEC_FIELDS[cat] || []).map(([label, get]) => {
      let val; try { val = get(part); } catch (e) { val = '—'; }
      return `<div class="spec-row"><dt>${label}</dt><dd>${val}</dd></div>`;
    }).join('');

    el.partDetail.innerHTML = `
      <div class="detail-inner">
        <div class="detail-bar">
          <button class="detail-back" id="detailBack" aria-label="Back to catalog">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <span>Back</span>
          </button>
          <span class="detail-cat">${category.name}</span>
        </div>
        <div class="detail-grid">
          <div class="detail-media">
            ${part.shortage ? '<span class="shortage-tag">⚠ Shortage</span>' : ''}
            ${partThumb(cat, part)}
          </div>
          <div class="detail-info">
            <h2>${part.name}</h2>
            <p class="detail-spec">${part.spec || ''}</p>
            <div class="detail-pricerow">
              <span class="detail-price">${part.price === 0 ? 'Free' : '€' + fmtPrice(part.price)}</span>
              <button class="primary-btn detail-add ${selected ? 'is-remove' : ''}" id="detailAdd">
                ${selected ? 'Remove from build' : 'Add to build'}
              </button>
            </div>
            <h3 class="detail-h3">Specifications</h3>
            <dl class="spec-list">${rows}</dl>
            <h3 class="detail-h3">Compatibility with your build</h3>
            <ul class="report-list detail-compat">${compatHtml}</ul>
            ${part.shortage ? '<p class="detail-foot-note">⚠ Memory prices reflect the ongoing 2026 global DRAM shortage and are higher than usual.</p>' : ''}
          </div>
        </div>
      </div>`;

    el.partDetail.hidden = false;
    document.body.classList.add('detail-open');
    el.partDetail.scrollTop = 0;

    $('detailBack').addEventListener('click', () => { history.length > 1 ? history.back() : (location.hash = ''); });
    $('detailAdd').addEventListener('click', () => {
      if (build[cat] && build[cat].id === part.id) delete build[cat];
      else build[cat] = part;
      save();
      activeCat = cat;
      renderAll();
      renderDetail(id); // refresh the button state
      toast(build[cat] && build[cat].id === part.id ? `${part.name} added.` : `${part.name} removed.`);
    });
  }

  function closeDetail() {
    el.partDetail.hidden = true;
    el.partDetail.innerHTML = '';
    document.body.classList.remove('detail-open');
  }

  function router() {
    const m = location.hash.match(/^#\/part\/(.+)$/);
    if (m) renderDetail(decodeURIComponent(m[1]));
    else closeDetail();
  }
  function openDetail(id) { location.hash = '#/part/' + encodeURIComponent(id); }

  /* ====================================================== ACTIONS ==== */

  function selectCategory(catId) {
    activeCat = catId;
    searchTerm = '';
    el.search.value = '';
    renderAll();
    // On mobile, jump to the Parts tab so the catalog is in view.
    if (isMobile()) setMobileTab('parts');
  }

  function togglePart(partId) {
    const part = (PARTS[activeCat] || []).find(p => p.id === partId);
    if (!part) return;
    if (build[activeCat] && build[activeCat].id === partId) {
      delete build[activeCat]; // tap again to deselect
    } else {
      build[activeCat] = part;
      // Auto-advance to the next empty essential for a guided flow
      const order = CATEGORIES.map(c => c.id);
      const idx = order.indexOf(activeCat);
      const next = order.slice(idx + 1).find(id => CATEGORIES.find(c => c.id === id).essential && !build[id]);
      if (next) activeCat = next;
    }
    save();
    renderAll();
  }

  function removePart(catId) {
    delete build[catId];
    save();
    renderAll();
  }

  function reset() {
    build = {};
    activeCat = 'cpu';
    save();
    renderAll();
    toast('Build cleared.');
  }

  function applyPreset(preset) {
    build = {};
    Object.keys(preset.parts).forEach(slot => {
      const part = (PARTS[slot] || []).find(p => p.id === preset.parts[slot]);
      if (part) build[slot] = part;
    });
    activeCat = 'cpu';
    save();
    renderAll();
    closePresets();
    toast(`Loaded “${preset.name}”.`);
  }

  function buildSummaryText() {
    const lines = ['🛠️  My Forge gaming PC build', ''];
    let total = 0;
    CATEGORIES.forEach(c => {
      const p = build[c.id];
      if (p) {
        lines.push(`${c.name.padEnd(13)} ${p.name}  —  €${fmtPrice(p.price)}`);
        total += p.price;
      }
    });
    lines.push('', `Total: €${fmtPrice(total)}  ·  ~${estimateDraw(build)}W est. draw`);
    const errs = analyse(build).filter(i => i.severity === 'error');
    if (errs.length) {
      lines.push('', '⚠ Issues:');
      errs.forEach(e => lines.push(' - ' + e.msg));
    } else if (Object.keys(build).length) {
      lines.push('✓ All selected parts are compatible.');
    }
    return lines.join('\n');
  }

  async function shareBuild() {
    if (!Object.keys(build).length) { toast('Add some parts first!'); return; }
    const text = buildSummaryText();
    try {
      await navigator.clipboard.writeText(text);
      toast('Build summary copied to clipboard.');
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Build summary copied.'); }
      catch (_) { toast('Copy failed — select & copy manually.'); }
      document.body.removeChild(ta);
    }
  }

  /* ---- Presets modal ---- */
  function openPresets() {
    el.presetGrid.innerHTML = PRESETS.map(p => {
      const total = Object.values(p.parts).reduce((s, id) => {
        for (const slot in PARTS) { const f = PARTS[slot].find(x => x.id === id); if (f) return s + f.price; }
        return s;
      }, 0);
      return `<button class="preset-card" data-preset="${p.id}" style="--accent:${p.accent}">
        <div class="preset-glow"></div>
        <h3>${p.name}</h3>
        <p>${p.blurb}</p>
        <span class="preset-price">from €${fmtPrice(total)}</span>
      </button>`;
    }).join('');
    el.presetModal.hidden = false;
    requestAnimationFrame(() => el.presetModal.classList.add('open'));
  }
  function closePresets() {
    el.presetModal.classList.remove('open');
    setTimeout(() => { el.presetModal.hidden = true; }, 200);
  }

  /* ====================================================== EVENTS ===== */

  // A missing element here (e.g. a stale service-worker cache serving an older
  // index.html alongside a newer app.js) must not throw and abort every listener
  // below it — that would silently kill the whole app with no visible error.
  const on = (node, evt, fn) => { if (node) node.addEventListener(evt, fn); };

  on(el.catTabs, 'click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (btn) selectCategory(btn.dataset.cat);
  });
  on(el.catTabs, 'scroll', updateCatTabsFade);
  window.addEventListener('resize', updateCatTabsFade);

  on(el.slotList, 'click', (e) => {
    const rm = e.target.closest('[data-remove]');
    if (rm) { e.stopPropagation(); removePart(rm.dataset.remove); return; }
    const slot = e.target.closest('[data-cat]');
    if (slot) selectCategory(slot.dataset.cat);
  });

  on(el.partGrid, 'click', (e) => {
    const qa = e.target.closest('[data-quickadd]');
    if (qa) { e.stopPropagation(); togglePart(qa.dataset.quickadd); return; }
    const card = e.target.closest('[data-part]');
    if (card) openDetail(card.dataset.part);
  });
  on(el.partGrid, 'keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-part]');
    if (card) { e.preventDefault(); openDetail(card.dataset.part); }
  });

  window.addEventListener('hashchange', router);

  on(el.search, 'input', (e) => {
    searchTerm = e.target.value.trim();
    renderParts();
  });

  on(el.resetBtn, 'click', reset);
  on(el.shareBtn, 'click', shareBuild);
  on(el.presetBtn, 'click', openPresets);
  on(el.presetClose, 'click', closePresets);
  on(el.presetModal, 'click', (e) => { if (e.target === el.presetModal) closePresets(); });
  on(el.presetGrid, 'click', (e) => {
    const card = e.target.closest('[data-preset]');
    if (card) applyPreset(PRESETS.find(p => p.id === card.dataset.preset));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (el.presetModal && !el.presetModal.hidden) closePresets();
    else if (el.partDetail && !el.partDetail.hidden) location.hash = '';
  });

  /* ---- Build panel manual collapse (desktop convenience only) ---- */
  on(el.buildToggle, 'click', () => {
    if (isMobile()) return; // on mobile the build panel is its own tab
    const willCollapse = !el.buildPanel.classList.contains('collapsed');
    el.buildPanel.classList.toggle('collapsed', willCollapse);
    el.buildToggle.setAttribute('aria-expanded', String(!willCollapse));
  });

  /* ---- Mobile bottom-tab navigation (Build / Parts / Summary) ---- */
  function setMobileTab(t) {
    document.body.dataset.mtab = t;
    el.mobileNav.querySelectorAll('[data-mtab]').forEach(b => b.classList.toggle('active', b.dataset.mtab === t));
    window.scrollTo(0, 0);
  }
  on(el.mobileNav, 'click', (e) => {
    const b = e.target.closest('[data-mtab]');
    if (b) setMobileTab(b.dataset.mtab);
  });

  /* ---- PWA install prompt ---- */
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (el.installBtn) el.installBtn.hidden = false;
  });
  on(el.installBtn, 'click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    el.installBtn.hidden = true;
  });
  window.addEventListener('appinstalled', () => { if (el.installBtn) el.installBtn.hidden = true; toast('Forge installed!'); });

  /* ---- Boot ---- */
  try {
    load();
    if (!Object.keys(build).length) activeCat = 'cpu';
    document.body.dataset.mtab = 'parts'; // default mobile tab (ignored on desktop)
    renderAll();
    router(); // handle a deep-link to #/part/<id> on first load
  } catch (err) {
    console.error('Forge failed to render:', err);
  }
})();
