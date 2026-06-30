/* =========================================================================
   Forge · Parts catalog
   Prices are indicative euro (€) estimates, mid-2026 European retail.
   Every part carries the attributes the compatibility engine reasons over.
   ========================================================================= */

const CATEGORIES = [
  { id: 'cpu',     name: 'CPU',          icon: 'cpu',     essential: true,  hint: 'The processor — the brain of the build.' },
  { id: 'mobo',    name: 'Motherboard',  icon: 'board',   essential: true,  hint: 'Connects every part. Must match the CPU socket.' },
  { id: 'ram',     name: 'Memory',       icon: 'ram',     essential: true,  hint: 'DDR4 or DDR5 — must match the motherboard.' },
  { id: 'gpu',     name: 'Graphics',     icon: 'gpu',     essential: false, hint: 'The games engine. Optional if your CPU has graphics.' },
  { id: 'storage', name: 'Storage',      icon: 'ssd',     essential: true,  hint: 'Where Windows, games and files live.' },
  { id: 'psu',     name: 'Power supply', icon: 'psu',     essential: true,  hint: 'Feeds the whole system. Wattage must cover the load.' },
  { id: 'case',    name: 'Case',         icon: 'case',    essential: true,  hint: 'Houses everything. Must fit the motherboard & GPU.' },
  { id: 'cooler',  name: 'CPU cooler',   icon: 'fan',     essential: true,  hint: 'Keeps the CPU in check. Must fit the socket & case.' },
];

/* Socket → memory generation map used in several checks */
const SOCKET_MEM = {
  'AM5': 'DDR5',
  'AM4': 'DDR4',
  'LGA1700': ['DDR4', 'DDR5'], // board-dependent
  'LGA1851': 'DDR5',
};

const PARTS = {
  /* ----------------------------------------------------------- CPUs ---- */
  cpu: [
    { id: 'cpu-r5-7600',   name: 'AMD Ryzen 5 7600',        price: 189, socket: 'AM5', mem: 'DDR5', tdp: 105, igpu: true,  cores: 6,  spec: '6C/12T · 5.1GHz · iGPU', cooler_inc: true },
    { id: 'cpu-r7-7700x',  name: 'AMD Ryzen 7 7700X',       price: 289, socket: 'AM5', mem: 'DDR5', tdp: 105, igpu: true,  cores: 8,  spec: '8C/16T · 5.4GHz · iGPU' },
    { id: 'cpu-r7-7800x3d',name: 'AMD Ryzen 7 7800X3D',     price: 379, socket: 'AM5', mem: 'DDR5', tdp: 120, igpu: true,  cores: 8,  spec: '8C/16T · 3D V-Cache · gaming king' },
    { id: 'cpu-r7-9700x',  name: 'AMD Ryzen 7 9700X',       price: 349, socket: 'AM5', mem: 'DDR5', tdp: 120, igpu: true,  cores: 8,  spec: '8C/16T · 5.5GHz · Zen 5' },
    { id: 'cpu-r7-9800x3d',name: 'AMD Ryzen 7 9800X3D',     price: 499, socket: 'AM5', mem: 'DDR5', tdp: 162, igpu: true,  cores: 8,  spec: '8C/16T · Zen 5 3D · fastest gaming CPU' },
    { id: 'cpu-r9-9900x',  name: 'AMD Ryzen 9 9900X',       price: 429, socket: 'AM5', mem: 'DDR5', tdp: 162, igpu: true,  cores: 12, spec: '12C/24T · 5.6GHz · Zen 5' },
    { id: 'cpu-r5-5600',   name: 'AMD Ryzen 5 5600',        price: 119, socket: 'AM4', mem: 'DDR4', tdp: 88,  igpu: false, cores: 6,  spec: '6C/12T · budget AM4', cooler_inc: true },
    { id: 'cpu-r7-5700x3d',name: 'AMD Ryzen 7 5700X3D',     price: 199, socket: 'AM4', mem: 'DDR4', tdp: 105, igpu: false, cores: 8,  spec: '8C/16T · 3D V-Cache on AM4' },
    { id: 'cpu-i5-12400f', name: 'Intel Core i5-12400F',    price: 139, socket: 'LGA1700', mem: ['DDR4','DDR5'], tdp: 117, igpu: false, cores: 6, spec: '6P/12T · superb value', cooler_inc: true },
    { id: 'cpu-i5-14600k', name: 'Intel Core i5-14600K',    price: 269, socket: 'LGA1700', mem: ['DDR4','DDR5'], tdp: 181, igpu: true,  cores: 14, spec: '6P+8E/20T · 5.3GHz · iGPU' },
    { id: 'cpu-i7-14700k', name: 'Intel Core i7-14700K',    price: 379, socket: 'LGA1700', mem: ['DDR4','DDR5'], tdp: 253, igpu: true,  cores: 20, spec: '8P+12E/28T · 5.6GHz · iGPU' },
    { id: 'cpu-i9-14900k', name: 'Intel Core i9-14900K',    price: 549, socket: 'LGA1700', mem: ['DDR4','DDR5'], tdp: 253, igpu: true,  cores: 24, spec: '8P+16E/32T · 6.0GHz · iGPU' },
    { id: 'cpu-cu5-245k',  name: 'Intel Core Ultra 5 245K', price: 309, socket: 'LGA1851', mem: 'DDR5', tdp: 159, igpu: true,  cores: 14, spec: '6P+8E/14T · Arrow Lake · iGPU' },
    { id: 'cpu-cu7-265k',  name: 'Intel Core Ultra 7 265K', price: 409, socket: 'LGA1851', mem: 'DDR5', tdp: 250, igpu: true,  cores: 20, spec: '8P+12E/20T · Arrow Lake · iGPU' },
    { id: 'cpu-cu9-285k',  name: 'Intel Core Ultra 9 285K', price: 619, socket: 'LGA1851', mem: 'DDR5', tdp: 250, igpu: true,  cores: 24, spec: '8P+16E/24T · flagship · iGPU' },
  ],

  /* --------------------------------------------------- Motherboards ---- */
  mobo: [
    { id: 'mb-b650-pro',   name: 'MSI B650 Tomahawk WiFi',     price: 199, socket: 'AM5', mem: 'DDR5', form: 'ATX',     m2: 3, pcie: '5.0', wifi: true,  spec: 'AM5 · DDR5 · ATX · Wi-Fi 6E' },
    { id: 'mb-x670e',      name: 'ASUS ROG Strix X670E-F',     price: 379, socket: 'AM5', mem: 'DDR5', form: 'ATX',     m2: 4, pcie: '5.0', wifi: true,  spec: 'AM5 · DDR5 · ATX · PCIe 5.0 GPU' },
    { id: 'mb-b650-itx',   name: 'Gigabyte B650I AX',          price: 219, socket: 'AM5', mem: 'DDR5', form: 'Mini-ITX',m2: 2, pcie: '4.0', wifi: true,  spec: 'AM5 · DDR5 · Mini-ITX · Wi-Fi' },
    { id: 'mb-a620',       name: 'ASRock A620M Pro',           price: 99,  socket: 'AM5', mem: 'DDR5', form: 'Micro-ATX',m2: 1, pcie: '4.0', wifi: false, spec: 'AM5 · DDR5 · mATX · budget' },
    { id: 'mb-b550',       name: 'MSI B550 Gaming Plus',       price: 119, socket: 'AM4', mem: 'DDR4', form: 'ATX',     m2: 2, pcie: '4.0', wifi: false, spec: 'AM4 · DDR4 · ATX' },
    { id: 'mb-b550-itx',   name: 'ASUS ROG B550-I',            price: 189, socket: 'AM4', mem: 'DDR4', form: 'Mini-ITX',m2: 2, pcie: '4.0', wifi: true,  spec: 'AM4 · DDR4 · Mini-ITX · Wi-Fi' },
    { id: 'mb-b760-ddr5',  name: 'MSI B760 Gaming Plus DDR5',  price: 159, socket: 'LGA1700', mem: 'DDR5', form: 'ATX', m2: 2, pcie: '4.0', wifi: false, spec: 'LGA1700 · DDR5 · ATX' },
    { id: 'mb-b760-ddr4',  name: 'Gigabyte B760 DS3H DDR4',    price: 129, socket: 'LGA1700', mem: 'DDR4', form: 'ATX', m2: 2, pcie: '4.0', wifi: false, spec: 'LGA1700 · DDR4 · ATX · saves on RAM' },
    { id: 'mb-z790',       name: 'ASUS TUF Z790-Plus WiFi',    price: 289, socket: 'LGA1700', mem: 'DDR5', form: 'ATX', m2: 4, pcie: '5.0', wifi: true,  spec: 'LGA1700 · DDR5 · ATX · OC + Wi-Fi' },
    { id: 'mb-z890',       name: 'MSI MAG Z890 Tomahawk',      price: 329, socket: 'LGA1851', mem: 'DDR5', form: 'ATX', m2: 4, pcie: '5.0', wifi: true,  spec: 'LGA1851 · DDR5 · ATX · Arrow Lake' },
    { id: 'mb-b860',       name: 'ASRock B860M Pro-A',         price: 169, socket: 'LGA1851', mem: 'DDR5', form: 'Micro-ATX', m2: 2, pcie: '5.0', wifi: false, spec: 'LGA1851 · DDR5 · mATX' },
  ],

  /* ----------------------------------------------------------- RAM ----- */
  // NOTE: Memory prices reflect the 2026 global DRAM shortage — DDR5/DDR4 kits
  // are running roughly 1.6–2.0× their 2024 lows. Flagged with `shortage: true`.
  ram: [
    { id: 'ram-ddr5-16-6000', name: 'Corsair Vengeance 16GB DDR5-6000', price: 109, mem: 'DDR5', size: 16, shortage: true, spec: '2×8GB · 6000MT/s · CL30' },
    { id: 'ram-ddr5-32-6000', name: 'G.Skill Trident Z5 32GB DDR5-6000',price: 199, mem: 'DDR5', size: 32, shortage: true, spec: '2×16GB · 6000MT/s · CL30 · sweet spot' },
    { id: 'ram-ddr5-32-6400', name: 'Kingston Fury 32GB DDR5-6400',     price: 219, mem: 'DDR5', size: 32, shortage: true, spec: '2×16GB · 6400MT/s · CL32' },
    { id: 'ram-ddr5-64-6000', name: 'Corsair Vengeance 64GB DDR5-6000', price: 399, mem: 'DDR5', size: 64, shortage: true, spec: '2×32GB · creators & heavy multitask' },
    { id: 'ram-ddr4-16-3600', name: 'Corsair Vengeance LPX 16GB DDR4',  price: 72,  mem: 'DDR4', size: 16, shortage: true, spec: '2×8GB · 3600MT/s · CL18 · scarce, EOL' },
    { id: 'ram-ddr4-32-3600', name: 'G.Skill Ripjaws V 32GB DDR4-3600', price: 129, mem: 'DDR4', size: 32, shortage: true, spec: '2×16GB · 3600MT/s · CL16 · scarce, EOL' },
  ],

  /* ----------------------------------------------------------- GPUs ---- */
  gpu: [
    { id: 'gpu-rtx4060',   name: 'NVIDIA RTX 4060 8GB',       price: 299, tdp: 115, length: 200, psu_min: 450, spec: '1080p high refresh · DLSS 3' },
    { id: 'gpu-rtx4060ti', name: 'NVIDIA RTX 4060 Ti 16GB',   price: 449, tdp: 165, length: 245, psu_min: 550, spec: '1080p/1440p · 16GB' },
    { id: 'gpu-rtx4070s',  name: 'NVIDIA RTX 4070 Super',     price: 619, tdp: 220, length: 280, psu_min: 650, spec: '1440p ultra · DLSS 3' },
    { id: 'gpu-rtx4070tis',name: 'NVIDIA RTX 4070 Ti Super',  price: 819, tdp: 285, length: 305, psu_min: 700, spec: '1440p/4K · 16GB' },
    { id: 'gpu-rtx4080s',  name: 'NVIDIA RTX 4080 Super',     price: 1069,tdp: 320, length: 336, psu_min: 750, spec: '4K high refresh' },
    { id: 'gpu-rtx4090',   name: 'NVIDIA RTX 4090 24GB',      price: 1899,tdp: 450, length: 358, psu_min: 850, spec: '4K no compromise · enormous', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Asus_Strix_RTX_4090.jpg/512px-Asus_Strix_RTX_4090.jpg' },
    { id: 'gpu-rx7600',    name: 'AMD Radeon RX 7600 8GB',    price: 269, tdp: 165, length: 204, psu_min: 450, spec: '1080p value' },
    { id: 'gpu-rx7800xt',  name: 'AMD Radeon RX 7800 XT',     price: 519, tdp: 263, length: 267, psu_min: 700, spec: '1440p ultra · 16GB' },
    { id: 'gpu-rx7900xtx', name: 'AMD Radeon RX 7900 XTX',    price: 949, tdp: 355, length: 287, psu_min: 800, spec: '4K · 24GB raster monster', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Sapphire_AMD_Radeon_RX_7900_XTX.jpg/512px-Sapphire_AMD_Radeon_RX_7900_XTX.jpg' },
    { id: 'gpu-arc-b580',  name: 'Intel Arc B580 12GB',       price: 279, tdp: 190, length: 272, psu_min: 500, spec: '1440p value · 12GB' },
  ],

  /* -------------------------------------------------------- Storage ---- */
  storage: [
    { id: 'ssd-1tb-g4',  name: 'Samsung 990 EVO 1TB NVMe',     price: 79,  iface: 'M.2', size: 1000, spec: 'PCIe 4.0 · ~5000MB/s' },
    { id: 'ssd-2tb-g4',  name: 'WD Black SN770 2TB NVMe',      price: 129, iface: 'M.2', size: 2000, spec: 'PCIe 4.0 · 2TB' },
    { id: 'ssd-2tb-g5',  name: 'Crucial T705 2TB PCIe 5.0',   price: 219, iface: 'M.2', size: 2000, spec: 'PCIe 5.0 · ~14000MB/s' },
    { id: 'ssd-4tb-g4',  name: 'Samsung 990 Pro 4TB',         price: 309, iface: 'M.2', size: 4000, spec: 'PCIe 4.0 · 4TB workhorse' },
    { id: 'ssd-sata-1tb',name: 'Crucial MX500 1TB SATA',      price: 69,  iface: 'SATA', size: 1000, spec: '2.5" SATA · universal' },
    { id: 'hdd-4tb',     name: 'Seagate BarraCuda 4TB HDD',   price: 89,  iface: 'SATA', size: 4000, spec: '3.5" HDD · bulk storage' },
  ],

  /* --------------------------------------------------- Power supply ---- */
  psu: [
    { id: 'psu-550',  name: 'Corsair RM550e 550W',        price: 79,  watt: 550,  rating: 'Gold',   form: 'ATX', spec: '550W · 80+ Gold · fully modular' },
    { id: 'psu-650',  name: 'be quiet! Pure Power 650W',  price: 89,  watt: 650,  rating: 'Gold',   form: 'ATX', spec: '650W · 80+ Gold' },
    { id: 'psu-750',  name: 'Corsair RM750e 750W',        price: 109, watt: 750,  rating: 'Gold',   form: 'ATX', spec: '750W · 80+ Gold · PCIe 5.0' },
    { id: 'psu-850',  name: 'Seasonic Focus GX 850W',     price: 139, watt: 850,  rating: 'Gold',   form: 'ATX', spec: '850W · 80+ Gold · 12VHPWR' },
    { id: 'psu-1000', name: 'Corsair RM1000x 1000W',      price: 189, watt: 1000, rating: 'Gold',   form: 'ATX', spec: '1000W · 80+ Gold · big GPU ready' },
    { id: 'psu-1200', name: 'be quiet! Dark Power 1200W', price: 269, watt: 1200, rating: 'Platinum',form: 'ATX', spec: '1200W · 80+ Platinum · headroom' },
    { id: 'psu-sfx-750',name:'Corsair SF750 SFX 750W',    price: 159, watt: 750,  rating: 'Platinum',form: 'SFX', spec: '750W · SFX · for Mini-ITX' },
  ],

  /* ---------------------------------------------------------- Cases ---- */
  case: [
    { id: 'case-o11',    name: 'Lian Li O11 Dynamic EVO',  price: 159, form: 'ATX',     gpu_max: 422, cooler_max: 167, psu_form: 'ATX', spec: 'ATX · dual-chamber · glass showcase' },
    { id: 'case-4000d',  name: 'Corsair 4000D Airflow',    price: 99,  form: 'ATX',     gpu_max: 360, cooler_max: 170, psu_form: 'ATX', spec: 'ATX · superb airflow · value' },
    { id: 'case-pop',    name: 'Fractal Pop Air',          price: 89,  form: 'ATX',     gpu_max: 405, cooler_max: 170, psu_form: 'ATX', spec: 'ATX · mesh front · colourful' },
    { id: 'case-north',  name: 'Fractal North',            price: 139, form: 'ATX',     gpu_max: 355, cooler_max: 170, psu_form: 'ATX', spec: 'ATX · walnut + mesh · gorgeous' },
    { id: 'case-meshify',name: 'Fractal Meshify 2 Compact',price: 119, form: 'ATX',     gpu_max: 360, cooler_max: 169, psu_form: 'ATX', spec: 'ATX · compact tower' },
    { id: 'case-m+atx',  name: 'NZXT H510 Flow (mATX)',    price: 79,  form: 'Micro-ATX',gpu_max: 360, cooler_max: 165, psu_form: 'ATX', spec: 'Micro-ATX · clean build' },
    { id: 'case-a4h2o',  name: 'Lian Li A4-H2O (ITX)',     price: 129, form: 'Mini-ITX', gpu_max: 322, cooler_max: 70,  psu_form: 'SFX', spec: 'Mini-ITX · tiny · SFX PSU only' },
    { id: 'case-ncore',  name: 'NR200P MAX (ITX)',         price: 149, form: 'Mini-ITX', gpu_max: 336, cooler_max: 67,  psu_form: 'SFX', spec: 'Mini-ITX · AIO included class' },
  ],

  /* -------------------------------------------------------- Coolers ---- */
  cooler: [
    { id: 'cool-stock',   name: 'Stock air cooler',           price: 0,   type: 'air', height: 70,  rad: 0,   sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 105, spec: 'Bundled with some CPUs · quiet enough' },
    { id: 'cool-ak620',   name: 'DeepCool AK620 (air)',       price: 59,  type: 'air', height: 160, rad: 0,   sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 260, spec: 'Dual-tower air · handles anything' },
    { id: 'cool-pa120',   name: 'Thermalright Peerless 120',  price: 39,  type: 'air', height: 155, rad: 0,   sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 245, spec: 'Air · legendary value' },
    { id: 'cool-nh-l9',   name: 'Noctua NH-L9 (low profile)', price: 49,  type: 'air', height: 37,  rad: 0,   sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 95,  spec: 'Low profile · fits tiny cases' },
    { id: 'cool-aio240',  name: 'Arctic Liquid Freezer 240',  price: 79,  type: 'aio', height: 0,   rad: 240, sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 280, spec: '240mm AIO · cool & quiet' },
    { id: 'cool-aio360',  name: 'Arctic Liquid Freezer 360',  price: 99,  type: 'aio', height: 0,   rad: 360, sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 350, spec: '360mm AIO · best-in-class' },
    { id: 'cool-aio280',  name: 'NZXT Kraken 280 RGB',        price: 149, type: 'aio', height: 0,   rad: 280, sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 300, spec: '280mm AIO · LCD pump' },
  ],
};

/* Curated starter builds (ids reference PARTS above) */
const PRESETS = [
  {
    id: 'budget', name: '1080p Budget Hero', blurb: 'Crushes esports & 1080p at a friendly price.',
    accent: '#34d399',
    parts: { cpu: 'cpu-i5-12400f', mobo: 'mb-b760-ddr4', ram: 'ram-ddr4-16-3600', gpu: 'gpu-rx7600', storage: 'ssd-1tb-g4', psu: 'psu-550', case: 'case-m+atx', cooler: 'cool-stock' }
  },
  {
    id: 'sweet', name: '1440p Sweet Spot', blurb: 'The build most people should buy. Quiet, fast, future-proof.',
    accent: '#60a5fa',
    parts: { cpu: 'cpu-r7-7800x3d', mobo: 'mb-b650-pro', ram: 'ram-ddr5-32-6000', gpu: 'gpu-rtx4070s', storage: 'ssd-2tb-g4', psu: 'psu-750', case: 'case-4000d', cooler: 'cool-aio240' }
  },
  {
    id: 'ultra', name: '4K Ultra Beast', blurb: 'No compromises. Max settings, max frames, max bragging rights.',
    accent: '#c084fc',
    parts: { cpu: 'cpu-r7-9800x3d', mobo: 'mb-x670e', ram: 'ram-ddr5-32-6000', gpu: 'gpu-rtx4090', storage: 'ssd-2tb-g5', psu: 'psu-1000', case: 'case-o11', cooler: 'cool-aio360' }
  },
  {
    id: 'sff', name: 'Small Form Factor', blurb: 'Console-sized footprint, full desktop power.',
    accent: '#fbbf24',
    parts: { cpu: 'cpu-r7-7700x', mobo: 'mb-b650-itx', ram: 'ram-ddr5-32-6000', gpu: 'gpu-rtx4070s', storage: 'ssd-2tb-g4', psu: 'psu-sfx-750', case: 'case-ncore', cooler: 'cool-nh-l9' }
  },
];

if (typeof module !== 'undefined') module.exports = { CATEGORIES, PARTS, PRESETS, SOCKET_MEM };
