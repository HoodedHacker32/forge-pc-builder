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
  };

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
      return `<button class="part-card ${selected ? 'selected' : ''} flag-${flag}" data-part="${p.id}">
        <div class="part-media">${partArt(activeCat, p)}${shortageTag}</div>
        <div class="part-top">
          <h3>${p.name}</h3>
          <span class="part-price">${p.price === 0 ? 'Free' : '€' + fmtPrice(p.price)}</span>
        </div>
        <p class="part-spec">${p.spec || ''}</p>
        <div class="part-foot">
          ${flagBadge || '<span class="part-flag ok">' + svg('check', 13) + ' Compatible</span>'}
          <span class="part-action">${selected ? 'Selected ✓' : 'Add to build'}</span>
        </div>
      </button>`;
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
  }

  function renderAll() {
    renderTabs();
    renderSlots();
    renderParts();
    renderSummary();
  }

  /* ====================================================== ACTIONS ==== */

  function selectCategory(catId) {
    activeCat = catId;
    searchTerm = '';
    el.search.value = '';
    renderAll();
    // On small screens, bring the catalog into view
    if (window.matchMedia('(max-width: 900px)').matches) {
      document.querySelector('.catalog-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  el.catTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (btn) selectCategory(btn.dataset.cat);
  });

  el.slotList.addEventListener('click', (e) => {
    const rm = e.target.closest('[data-remove]');
    if (rm) { e.stopPropagation(); removePart(rm.dataset.remove); return; }
    const slot = e.target.closest('[data-cat]');
    if (slot) selectCategory(slot.dataset.cat);
  });

  el.partGrid.addEventListener('click', (e) => {
    const card = e.target.closest('[data-part]');
    if (card) togglePart(card.dataset.part);
  });

  el.search.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim();
    renderParts();
  });

  el.resetBtn.addEventListener('click', reset);
  el.shareBtn.addEventListener('click', shareBuild);
  el.presetBtn.addEventListener('click', openPresets);
  el.presetClose.addEventListener('click', closePresets);
  el.presetModal.addEventListener('click', (e) => { if (e.target === el.presetModal) closePresets(); });
  el.presetGrid.addEventListener('click', (e) => {
    const card = e.target.closest('[data-preset]');
    if (card) applyPreset(PRESETS.find(p => p.id === card.dataset.preset));
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePresets(); });

  /* ---- Collapsible build panel (folds away on scroll) ---- */
  let manualOverride = false;     // user clicked the toggle, respect their choice
  function setCollapsed(collapsed) {
    el.buildPanel.classList.toggle('collapsed', collapsed);
    el.buildToggle.setAttribute('aria-expanded', String(!collapsed));
  }
  el.buildToggle.addEventListener('click', () => {
    const willCollapse = !el.buildPanel.classList.contains('collapsed');
    setCollapsed(willCollapse);
    manualOverride = true;
  });
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    // Near the top: always reveal and hand control back to auto-folding.
    if (y < 80) { manualOverride = false; setCollapsed(false); lastY = y; return; }
    if (manualOverride) { lastY = y; return; }
    // Scrolling down past the header → fold away; scrolling up → reveal.
    if (y > 200 && y > lastY) setCollapsed(true);
    else if (y < lastY - 24) setCollapsed(false);
    lastY = y;
  }, { passive: true });

  /* ---- PWA install prompt ---- */
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    el.installBtn.hidden = false;
  });
  el.installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    el.installBtn.hidden = true;
  });
  window.addEventListener('appinstalled', () => { el.installBtn.hidden = true; toast('Forge installed!'); });

  /* ---- Boot ---- */
  load();
  if (!Object.keys(build).length) activeCat = 'cpu';
  renderAll();
})();
