/* =========================================================================
   Forge · Compatibility engine
   Pure functions over a `build` object: { cpu, mobo, ram, gpu, storage, psu,
   case, cooler } where each value is a part object (or undefined).
   Produces issues with severity: 'error' | 'warn' | 'ok' | 'info'.
   ========================================================================= */

const FORM_FACTOR_FIT = {
  // case form -> motherboard forms it accepts
  'ATX':       ['ATX', 'Micro-ATX', 'Mini-ITX'],
  'Micro-ATX': ['Micro-ATX', 'Mini-ITX'],
  'Mini-ITX':  ['Mini-ITX'],
};

function memMatches(part, memType) {
  const m = part.mem;
  return Array.isArray(m) ? m.includes(memType) : m === memType;
}

/* Estimate total system power draw (W) from the selected parts. */
function estimateDraw(build) {
  let w = 0;
  if (build.cpu) w += build.cpu.tdp || 0;
  if (build.gpu) w += build.gpu.tdp || 0;
  // Motherboard, RAM, drives, fans, pump — rough fixed overhead.
  w += 70;
  if (build.storage) w += 10;
  if (build.cooler && build.cooler.type === 'aio') w += 15;
  return Math.round(w);
}

/* Recommended PSU = draw with headroom, rounded to a sensible size. */
function recommendedPsu(draw) {
  const withHeadroom = draw * 1.5; // ~50% headroom for transients & efficiency
  const sizes = [450, 550, 650, 750, 850, 1000, 1200];
  return sizes.find(s => s >= withHeadroom) || 1200;
}

function analyse(build) {
  const issues = [];
  const add = (severity, slot, msg) => issues.push({ severity, slot, msg });

  const { cpu, mobo, ram, gpu, storage, psu, case: pcCase, cooler } = build;

  /* ---- CPU ↔ Motherboard socket ---- */
  if (cpu && mobo) {
    if (cpu.socket === mobo.socket) {
      add('ok', 'mobo', `${cpu.name} fits the ${mobo.socket} socket.`);
    } else {
      add('error', 'mobo', `Socket mismatch — ${cpu.name} needs ${cpu.socket}, but this board is ${mobo.socket}. Pick an ${cpu.socket} motherboard.`);
    }
  }

  /* ---- Memory generation: CPU/board ↔ RAM ---- */
  if (mobo && ram) {
    if (memMatches(mobo, ram.mem)) {
      add('ok', 'ram', `${ram.mem} memory matches the motherboard.`);
    } else {
      const boardMem = Array.isArray(mobo.mem) ? mobo.mem.join('/') : mobo.mem;
      add('error', 'ram', `Memory mismatch — this board takes ${boardMem}, but the kit is ${ram.mem}. Choose ${boardMem} memory.`);
    }
  }
  if (cpu && ram && !memMatches(cpu, ram.mem) && cpu.socket !== 'LGA1700') {
    add('error', 'ram', `${cpu.name} only supports ${Array.isArray(cpu.mem) ? cpu.mem.join('/') : cpu.mem} memory.`);
  }

  /* ---- Case ↔ Motherboard form factor ---- */
  if (pcCase && mobo) {
    const accepts = FORM_FACTOR_FIT[pcCase.form] || [];
    if (accepts.includes(mobo.form)) {
      add('ok', 'case', `${mobo.form} board fits the ${pcCase.form} case.`);
    } else {
      add('error', 'case', `The ${pcCase.form} case can't fit a ${mobo.form} motherboard. Use a larger case or a smaller board.`);
    }
  }

  /* ---- Case ↔ GPU length ---- */
  if (pcCase && gpu) {
    if (gpu.length <= pcCase.gpu_max) {
      add('ok', 'gpu', `${gpu.name} (${gpu.length}mm) fits — up to ${pcCase.gpu_max}mm allowed.`);
    } else {
      add('error', 'gpu', `${gpu.name} is ${gpu.length}mm but the case allows ${pcCase.gpu_max}mm. It won't fit — pick a shorter card or bigger case.`);
    }
  }

  /* ---- Case ↔ Cooler clearance ---- */
  if (pcCase && cooler) {
    if (cooler.type === 'air') {
      if (cooler.height <= pcCase.cooler_max) {
        add('ok', 'cooler', `Cooler height ${cooler.height}mm clears the ${pcCase.cooler_max}mm case limit.`);
      } else {
        add('error', 'cooler', `${cooler.name} is ${cooler.height}mm tall — too big for this case (${pcCase.cooler_max}mm max). Use a shorter cooler or AIO.`);
      }
    } else if (cooler.type === 'aio') {
      // ITX showcase cases here support up to ~280; treat 360 in tiny ITX as a warning.
      if (pcCase.form === 'Mini-ITX' && cooler.rad >= 360) {
        add('warn', 'cooler', `A ${cooler.rad}mm radiator rarely fits Mini-ITX cases — double-check ${pcCase.name} radiator support.`);
      } else {
        add('ok', 'cooler', `${cooler.rad}mm AIO — verify radiator mounting, but generally fine here.`);
      }
    }
  }

  /* ---- Cooler ↔ Socket ---- */
  if (cooler && cpu) {
    if (cooler.sockets.includes(cpu.socket)) {
      // capacity check
      if ((cpu.tdp || 0) > (cooler.tdp_max || 999)) {
        add('warn', 'cooler', `${cooler.name} may struggle with ${cpu.name}'s heat output. A beefier cooler will run cooler & quieter.`);
      } else {
        add('ok', 'cooler', `${cooler.name} supports the ${cpu.socket} socket.`);
      }
    } else {
      add('error', 'cooler', `${cooler.name} has no ${cpu.socket} mounting bracket.`);
    }
  }

  /* ---- PSU form factor ↔ Case ---- */
  if (psu && pcCase) {
    if (pcCase.psu_form === 'SFX' && psu.form === 'ATX') {
      add('error', 'psu', `${pcCase.name} only takes an SFX power supply — this is a larger ATX unit.`);
    } else if (pcCase.psu_form === 'ATX' && psu.form === 'SFX') {
      add('info', 'psu', `An SFX PSU works in this ATX case but may need a bracket. An ATX unit is simpler.`);
    } else {
      add('ok', 'psu', `${psu.form} power supply fits the case.`);
    }
  }

  /* ---- PSU wattage ↔ system draw ---- */
  if (psu && (cpu || gpu)) {
    const draw = estimateDraw(build);
    const need = recommendedPsu(draw);
    const gpuMin = gpu ? gpu.psu_min : 0;
    const required = Math.max(need, gpuMin);
    if (psu.watt < gpuMin) {
      add('error', 'psu', `${gpu.name} needs at least a ${gpuMin}W PSU. This ${psu.watt}W unit is undersized.`);
    } else if (psu.watt < draw + 50) {
      add('error', 'psu', `System draws ~${draw}W; a ${psu.watt}W PSU has no safety margin. Aim for ${required}W+.`);
    } else if (psu.watt < required) {
      add('warn', 'psu', `${psu.watt}W works but is tight (~${draw}W draw). ${required}W gives healthier headroom for boosts & longevity.`);
    } else {
      add('ok', 'psu', `${psu.watt}W comfortably covers the ~${draw}W system draw.`);
    }
  }

  /* ---- Storage ↔ Motherboard M.2 ---- */
  if (storage && mobo) {
    if (storage.iface === 'M.2' && mobo.m2 < 1) {
      add('error', 'storage', `This board has no M.2 slot for an NVMe drive.`);
    } else if (storage.iface === 'M.2') {
      add('ok', 'storage', `NVMe drive uses one of the board's ${mobo.m2} M.2 slots.`);
    } else {
      add('ok', 'storage', `SATA drive connects via a standard SATA port.`);
    }
  }

  /* ---- No discrete GPU & no iGPU → no display ---- */
  if (cpu && !gpu && cpu.igpu === false) {
    add('error', 'gpu', `${cpu.name} has no integrated graphics — you must add a graphics card to get a picture.`);
  }
  if (cpu && !gpu && cpu.igpu === true) {
    add('info', 'gpu', `No graphics card selected — ${cpu.name}'s integrated graphics will run the display (fine for light gaming).`);
  }

  /* ---- Helpful guidance / "what you need" prompts ---- */
  if (cpu && !cpu.cooler_inc && !cooler) {
    add('warn', 'cooler', `${cpu.name} ships without a cooler — you'll need to add one.`);
  }
  if (mobo && mobo.wifi === false && !issues.some(i => i.slot === 'mobo' && i.severity === 'error')) {
    add('info', 'mobo', `This board has no built-in Wi-Fi — use Ethernet or add a Wi-Fi card/USB adapter.`);
  }

  return issues;
}

/* What essential slots are still empty? */
function missingEssentials(build, categories) {
  return categories.filter(c => c.essential && !build[c.id]);
}

/* Overall health: 'error' | 'warn' | 'ok' | 'empty' */
function buildHealth(build, categories) {
  const filled = categories.some(c => build[c.id]);
  if (!filled) return 'empty';
  const issues = analyse(build);
  if (issues.some(i => i.severity === 'error')) return 'error';
  const missing = missingEssentials(build, categories);
  if (missing.length) return 'warn';
  if (issues.some(i => i.severity === 'warn')) return 'warn';
  return 'ok';
}

if (typeof module !== 'undefined') {
  module.exports = { analyse, estimateDraw, recommendedPsu, missingEssentials, buildHealth };
}
