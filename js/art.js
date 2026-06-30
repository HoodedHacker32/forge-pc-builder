/* =========================================================================
   Forge · Part artwork
   Generates a distinct line-art SVG illustration per part, varying with the
   part's own specs. Palette: white line / hard red accent on transparent.
   Returns an <svg> string that scales to its container.
   ========================================================================= */
(function (global) {
  'use strict';

  const W = '#f4f4f6';   // white line
  const R = '#ff2532';   // hard red accent
  const D = '#7a0a12';   // deep red

  // faint hexagon watermark behind every illustration
  function hexWatermark() {
    const pts = (cx, cy, r) => {
      let p = [];
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 180 * (60 * i - 30);
        p.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
      }
      return p.join(' ');
    };
    return `<g stroke="${R}" stroke-opacity="0.10" fill="none" stroke-width="1.5">
      <polygon points="${pts(252, 28, 34)}"/>
      <polygon points="${pts(40, 138, 26)}"/>
    </g>`;
  }

  function label(text) {
    if (!text) return '';
    return `<g>
      <rect x="10" y="132" rx="3" width="${18 + text.length * 7.2}" height="20" fill="${R}" fill-opacity="0.14" stroke="${R}" stroke-opacity="0.55"/>
      <text x="20" y="146" font-family="'Space Grotesk',sans-serif" font-size="12" font-weight="700" fill="${R}" letter-spacing="0.5">${text}</text>
    </g>`;
  }

  function frame(inner, lbl) {
    return `<svg viewBox="0 0 300 160" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" class="part-art" aria-hidden="true">
      ${hexWatermark()}
      <g fill="none" stroke="${W}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">${inner}</g>
      ${label(lbl)}
    </svg>`;
  }

  /* ---- CPU: heat-spreader chip with pins ---- */
  function cpu(p) {
    const cx = 150, s = 84, x = cx - s / 2, y = 80 - s / 2;
    let pins = '';
    for (let i = 0; i < 7; i++) {
      const o = x + 12 + i * 10;
      pins += `<line x1="${o}" y1="${y - 9}" x2="${o}" y2="${y}"/><line x1="${o}" y1="${y + s}" x2="${o}" y2="${y + s + 9}"/>`;
      const v = y + 12 + i * 10;
      pins += `<line x1="${x - 9}" y1="${v}" x2="${x}" y2="${v}"/><line x1="${x + s}" y1="${v}" x2="${x + s + 9}" y2="${v}"/>`;
    }
    return frame(`
      ${pins}
      <rect x="${x}" y="${y}" width="${s}" height="${s}" rx="6"/>
      <rect x="${x + 14}" y="${y + 14}" width="${s - 28}" height="${s - 28}" rx="4" stroke="${R}"/>
      <path d="M${x + 6} ${y + 18} L${x + 18} ${y + 6}" stroke="${R}"/>
    `, `${p.cores}C · ${p.socket}`);
  }

  /* ---- Motherboard: PCB with socket, DIMMs, PCIe, chipset hex ---- */
  function mobo(p) {
    return frame(`
      <rect x="40" y="20" width="220" height="120" rx="6"/>
      <rect x="58" y="36" width="46" height="46" rx="4" stroke="${R}"/>
      <line x1="64" y1="42" x2="98" y2="76" stroke="${R}" stroke-width="1.4"/>
      <g stroke-width="3">
        <line x1="120" y1="34" x2="120" y2="86"/><line x1="132" y1="34" x2="132" y2="86"/>
        <line x1="144" y1="34" x2="144" y2="86"/><line x1="156" y1="34" x2="156" y2="86"/>
      </g>
      <line x1="58" y1="104" x2="200" y2="104" stroke-width="4"/>
      <line x1="58" y1="120" x2="180" y2="120" stroke-width="4"/>
      <polygon points="214,104 226,111 226,125 214,132 202,125 202,111" stroke="${R}"/>
      <rect x="40" y="26" width="10" height="40" fill="${W}" fill-opacity="0.0"/>
    `, `${p.form} · ${p.socket}`);
  }

  /* ---- RAM: two DIMM modules with heat-spreader fins ---- */
  function ram(p) {
    const stick = (x) => `
      <rect x="${x}" y="34" width="46" height="84" rx="4"/>
      <g stroke-width="2" stroke="${R}">
        <line x1="${x + 8}" y1="40" x2="${x + 8}" y2="58"/><line x1="${x + 18}" y1="40" x2="${x + 18}" y2="58"/>
        <line x1="${x + 28}" y1="40" x2="${x + 28}" y2="58"/><line x1="${x + 38}" y1="40" x2="${x + 38}" y2="58"/>
      </g>
      <line x1="${x + 4}" y1="100" x2="${x + 42}" y2="100"/>
      <g stroke-width="3">
        <line x1="${x + 8}" y1="118" x2="${x + 8}" y2="126"/><line x1="${x + 18}" y1="118" x2="${x + 18}" y2="126"/>
        <line x1="${x + 28}" y1="118" x2="${x + 28}" y2="126"/><line x1="${x + 38}" y1="118" x2="${x + 38}" y2="126"/>
      </g>`;
    return frame(`${stick(112)}${stick(166)}`, `${p.size}GB · ${p.mem}`);
  }

  /* ---- GPU: shroud + fans (count scales with card length) ---- */
  function gpu(p) {
    const fans = p.length >= 290 ? 3 : 2;
    const cardW = 200, x = 50, y = 50, fanR = 26;
    const gap = cardW / fans;
    let f = '';
    for (let i = 0; i < fans; i++) {
      const fx = x + gap * (i + 0.5);
      f += `<circle cx="${fx}" cy="${y + 35}" r="${fanR}" stroke="${R}"/><circle cx="${fx}" cy="${y + 35}" r="4"/>`;
      for (let a = 0; a < 5; a++) {
        const ang = (a / 5) * Math.PI * 2;
        f += `<line x1="${fx}" y1="${y + 35}" x2="${(fx + fanR * 0.85 * Math.cos(ang)).toFixed(1)}" y2="${(y + 35 + fanR * 0.85 * Math.sin(ang)).toFixed(1)}" stroke-width="1.4"/>`;
      }
    }
    return frame(`
      <rect x="${x}" y="${y}" width="${cardW}" height="70" rx="6"/>
      ${f}
      <line x1="${x}" y1="${y + 70}" x2="${x}" y2="${y + 88}"/>
      <rect x="${x - 4}" y="${y + 86}" width="60" height="6"/>
      <line x1="${x + cardW}" y1="${y - 6}" x2="${x + cardW}" y2="${y + 78}" stroke-width="3"/>
    `, `${fans}-fan`);
  }

  /* ---- Storage: M.2 stick or 2.5"/3.5" drive ---- */
  function storage(p) {
    if (p.iface === 'M.2') {
      return frame(`
        <rect x="40" y="62" width="210" height="36" rx="4"/>
        <g stroke-width="2"><rect x="56" y="70" width="34" height="20" rx="2" stroke="${R}"/>
        <rect x="98" y="70" width="34" height="20" rx="2" stroke="${R}"/></g>
        <g stroke-width="3"><line x1="150" y1="68" x2="150" y2="92"/><line x1="158" y1="68" x2="158" y2="92"/></g>
        <circle cx="234" cy="80" r="7"/>
        <line x1="40" y1="80" x2="30" y2="80"/>
      `, `${p.size >= 1000 ? (p.size / 1000) + 'TB' : p.size + 'GB'} · NVMe`);
    }
    return frame(`
      <rect x="60" y="40" width="180" height="80" rx="6"/>
      <circle cx="150" cy="80" r="26" stroke="${R}"/>
      <circle cx="150" cy="80" r="5"/>
      <line x1="150" y1="80" x2="170" y2="64" stroke="${R}" stroke-width="1.6"/>
      <circle cx="78" cy="56" r="3"/><circle cx="222" cy="56" r="3"/>
    `, `${p.size >= 1000 ? (p.size / 1000) + 'TB' : p.size + 'GB'} · ${p.iface}`);
  }

  /* ---- PSU: unit with fan grille + wattage ---- */
  function psu(p) {
    return frame(`
      <rect x="46" y="38" width="208" height="84" rx="6"/>
      <circle cx="104" cy="80" r="32" stroke="${R}"/>
      <g stroke-width="1.4">
        ${[0,1,2,3,4,5].map(i=>{const a=i/6*Math.PI*2;return `<line x1="104" y1="80" x2="${(104+28*Math.cos(a)).toFixed(1)}" y2="${(80+28*Math.sin(a)).toFixed(1)}"/>`;}).join('')}
      </g>
      <g stroke-width="2"><rect x="170" y="54" width="16" height="11" rx="2"/><rect x="194" y="54" width="16" height="11" rx="2"/>
      <rect x="218" y="54" width="16" height="11" rx="2"/><rect x="170" y="74" width="16" height="11" rx="2"/>
      <rect x="194" y="74" width="16" height="11" rx="2"/></g>
    `, `${p.watt}W · ${p.rating}`);
  }

  /* ---- Case: tower with window + front IO ---- */
  function pcCase(p) {
    return frame(`
      <rect x="96" y="18" width="108" height="124" rx="8"/>
      <rect x="108" y="42" width="64" height="86" rx="4" stroke="${R}"/>
      <g stroke-width="2"><circle cx="190" cy="30" r="2.5"/><circle cx="190" cy="38" r="2.5"/></g>
      <line x1="108" y1="30" x2="150" y2="30"/>
      <line x1="100" y1="142" x2="100" y2="150"/><line x1="200" y1="142" x2="200" y2="150"/>
    `, p.form);
  }

  /* ---- Cooler: air tower or AIO (radiator + pump) ---- */
  function cooler(p) {
    if (p.type === 'aio') {
      return frame(`
        <rect x="40" y="50" width="96" height="60" rx="5"/>
        <g stroke-width="2">${[0,1,2,3,4,5,6].map(i=>`<line x1="${48+i*12}" y1="50" x2="${48+i*12}" y2="110"/>`).join('')}</g>
        <path d="M136 64 C 170 64 178 60 198 70" stroke="${R}"/>
        <path d="M136 96 C 170 96 178 100 198 90" stroke="${R}"/>
        <rect x="196" y="58" width="58" height="44" rx="6"/>
        <circle cx="225" cy="80" r="15" stroke="${R}"/><circle cx="225" cy="80" r="4"/>
      `, `${p.rad}mm AIO`);
    }
    return frame(`
      <rect x="112" y="20" width="76" height="80" rx="4"/>
      <g stroke-width="1.6">${[0,1,2,3,4,5,6,7].map(i=>`<line x1="112" y1="${28+i*9}" x2="188" y2="${28+i*9}"/>`).join('')}</g>
      <circle cx="150" cy="118" r="24" stroke="${R}"/><circle cx="150" cy="118" r="4"/>
      ${[0,1,2,3,4].map(a=>{const ang=a/5*Math.PI*2;return `<line x1="150" y1="118" x2="${(150+20*Math.cos(ang)).toFixed(1)}" y2="${(118+20*Math.sin(ang)).toFixed(1)}" stroke-width="1.4"/>`;}).join('')}
    `, `${p.height}mm air`);
  }

  const ART = { cpu, mobo, ram, gpu, storage, psu, case: pcCase, cooler };

  global.partArt = function (category, part) {
    const fn = ART[category];
    return fn ? fn(part) : '';
  };
})(window);
