/* =========================================================================
   Forge · Parts catalog
   Prices are indicative euro (€) estimates, mid-2026 European retail.
   Spec fields are real manufacturer specifications for each part.

   Power note: `tdp` holds the realistic PEAK package power (AMD PPT / Intel
   Maximum Turbo Power) — the number that matters for PSU sizing, and what the
   compatibility engine uses. `tdpRated` holds the nominal rated TDP shown on
   the box. Both are surfaced on the detail page so nothing is mislabelled.
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
    { id: 'cpu-r5-7600',   name: 'AMD Ryzen 5 7600',        price: 189, socket: 'AM5', mem: 'DDR5', memSpeed: 5200, cores: 6,  threads: 12, base: 3.8, boost: 5.1, l3: 32, arch: 'Zen 4', tdp: 88,  tdpRated: 65,  igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: true, spec: '6C/12T · 5.1GHz boost · iGPU' },
    { id: 'cpu-r7-7700x',  name: 'AMD Ryzen 7 7700X',       price: 289, socket: 'AM5', mem: 'DDR5', memSpeed: 5200, cores: 8,  threads: 16, base: 4.5, boost: 5.4, l3: 32, arch: 'Zen 4', tdp: 142, tdpRated: 105, igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: false, spec: '8C/16T · 5.4GHz boost · iGPU' },
    { id: 'cpu-r7-7800x3d',name: 'AMD Ryzen 7 7800X3D',     price: 379, socket: 'AM5', mem: 'DDR5', memSpeed: 5200, cores: 8,  threads: 16, base: 4.2, boost: 5.0, l3: 96, arch: 'Zen 4 (3D V-Cache)', tdp: 162, tdpRated: 120, igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: false, spec: '8C/16T · 96MB 3D V-Cache · gaming king' },
    { id: 'cpu-r5-9600x',  name: 'AMD Ryzen 5 9600X',       price: 249, socket: 'AM5', mem: 'DDR5', memSpeed: 5600, cores: 6,  threads: 12, base: 3.9, boost: 5.4, l3: 32, arch: 'Zen 5', tdp: 88,  tdpRated: 65,  igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: false, spec: '6C/12T · 5.4GHz boost · Zen 5' },
    { id: 'cpu-r7-9700x',  name: 'AMD Ryzen 7 9700X',       price: 349, socket: 'AM5', mem: 'DDR5', memSpeed: 5600, cores: 8,  threads: 16, base: 3.8, boost: 5.5, l3: 32, arch: 'Zen 5', tdp: 88,  tdpRated: 65,  igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: false, spec: '8C/16T · 5.5GHz boost · Zen 5' },
    { id: 'cpu-r7-9800x3d',name: 'AMD Ryzen 7 9800X3D',     price: 499, socket: 'AM5', mem: 'DDR5', memSpeed: 5600, cores: 8,  threads: 16, base: 4.7, boost: 5.2, l3: 96, arch: 'Zen 5 (3D V-Cache)', tdp: 162, tdpRated: 120, igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: false, spec: '8C/16T · 96MB 3D V-Cache · fastest gaming CPU' },
    { id: 'cpu-r9-9900x',  name: 'AMD Ryzen 9 9900X',       price: 429, socket: 'AM5', mem: 'DDR5', memSpeed: 5600, cores: 12, threads: 24, base: 4.4, boost: 5.6, l3: 64, arch: 'Zen 5', tdp: 162, tdpRated: 120, igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: false, spec: '12C/24T · 5.6GHz boost · Zen 5' },
    { id: 'cpu-r9-9950x3d',name: 'AMD Ryzen 9 9950X3D',     price: 699, socket: 'AM5', mem: 'DDR5', memSpeed: 5600, cores: 16, threads: 32, base: 4.3, boost: 5.7, l3: 128,arch: 'Zen 5 (3D V-Cache)', tdp: 200, tdpRated: 170, igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: false, spec: '16C/32T · 128MB 3D V-Cache · do-it-all flagship' },
    { id: 'cpu-r5-5600',   name: 'AMD Ryzen 5 5600',        price: 119, socket: 'AM4', mem: 'DDR4', memSpeed: 3200, cores: 6,  threads: 12, base: 3.5, boost: 4.4, l3: 32, arch: 'Zen 3', tdp: 88,  tdpRated: 65,  igpu: false, igpuName: null, cooler_inc: true, spec: '6C/12T · 4.4GHz boost · budget AM4' },
    { id: 'cpu-r7-5700x3d',name: 'AMD Ryzen 7 5700X3D',     price: 199, socket: 'AM4', mem: 'DDR4', memSpeed: 3200, cores: 8,  threads: 16, base: 3.0, boost: 4.1, l3: 96, arch: 'Zen 3 (3D V-Cache)', tdp: 142, tdpRated: 105, igpu: false, igpuName: null, cooler_inc: false, spec: '8C/16T · 96MB 3D V-Cache on AM4' },
    { id: 'cpu-i5-12400f', name: 'Intel Core i5-12400F',    price: 139, socket: 'LGA1700', mem: ['DDR4','DDR5'], memSpeed: 4800, cores: 6, pcore: 6, ecore: 0, threads: 12, base: 2.5, boost: 4.4, l3: 18, arch: 'Alder Lake', tdp: 117, tdpRated: 65, igpu: false, igpuName: null, cooler_inc: true, spec: '6P/12T · 4.4GHz boost · superb value' },
    { id: 'cpu-i5-14600k', name: 'Intel Core i5-14600K',    price: 269, socket: 'LGA1700', mem: ['DDR4','DDR5'], memSpeed: 5600, cores: 14, pcore: 6, ecore: 8, threads: 20, base: 3.5, boost: 5.3, l3: 24, arch: 'Raptor Lake Refresh', tdp: 181, tdpRated: 125, igpu: true, igpuName: 'Intel UHD 770', cooler_inc: false, spec: '6P+8E / 20T · 5.3GHz boost · iGPU' },
    { id: 'cpu-i7-14700k', name: 'Intel Core i7-14700K',    price: 379, socket: 'LGA1700', mem: ['DDR4','DDR5'], memSpeed: 5600, cores: 20, pcore: 8, ecore: 12, threads: 28, base: 3.4, boost: 5.6, l3: 33, arch: 'Raptor Lake Refresh', tdp: 253, tdpRated: 125, igpu: true, igpuName: 'Intel UHD 770', cooler_inc: false, spec: '8P+12E / 28T · 5.6GHz boost · iGPU' },
    { id: 'cpu-i9-14900k', name: 'Intel Core i9-14900K',    price: 549, socket: 'LGA1700', mem: ['DDR4','DDR5'], memSpeed: 5600, cores: 24, pcore: 8, ecore: 16, threads: 32, base: 3.2, boost: 6.0, l3: 36, arch: 'Raptor Lake Refresh', tdp: 253, tdpRated: 125, igpu: true, igpuName: 'Intel UHD 770', cooler_inc: false, spec: '8P+16E / 32T · 6.0GHz boost · iGPU' },
    { id: 'cpu-cu5-245k',  name: 'Intel Core Ultra 5 245K', price: 309, socket: 'LGA1851', mem: 'DDR5', memSpeed: 6400, cores: 14, pcore: 6, ecore: 8, threads: 14, base: 4.2, boost: 5.2, l3: 24, arch: 'Arrow Lake', tdp: 159, tdpRated: 125, igpu: true, igpuName: 'Intel Graphics (Xe)', cooler_inc: false, spec: '6P+8E / 14T · 5.2GHz boost · Arrow Lake' },
    { id: 'cpu-cu7-265k',  name: 'Intel Core Ultra 7 265K', price: 409, socket: 'LGA1851', mem: 'DDR5', memSpeed: 6400, cores: 20, pcore: 8, ecore: 12, threads: 20, base: 3.9, boost: 5.5, l3: 30, arch: 'Arrow Lake', tdp: 250, tdpRated: 125, igpu: true, igpuName: 'Intel Graphics (Xe)', cooler_inc: false, spec: '8P+12E / 20T · 5.5GHz boost · Arrow Lake' },
    { id: 'cpu-cu9-285k',  name: 'Intel Core Ultra 9 285K', price: 619, socket: 'LGA1851', mem: 'DDR5', memSpeed: 6400, cores: 24, pcore: 8, ecore: 16, threads: 24, base: 3.7, boost: 5.7, l3: 36, arch: 'Arrow Lake', tdp: 250, tdpRated: 125, igpu: true, igpuName: 'Intel Graphics (Xe)', cooler_inc: false, spec: '8P+16E / 24T · 5.7GHz boost · flagship' },
  ],

  /* --------------------------------------------------- Motherboards ---- */
  mobo: [
    { id: 'mb-b650-pro',   name: 'MSI B650 Tomahawk WiFi',     price: 199, socket: 'AM5', chipset: 'AMD B650', mem: 'DDR5', ramSlots: 4, form: 'ATX',      m2: 3, pcie: '5.0', wifi: true,  spec: 'AM5 · DDR5 · ATX · Wi-Fi 6E' },
    { id: 'mb-x670e',      name: 'ASUS ROG Strix X670E-F',     price: 379, socket: 'AM5', chipset: 'AMD X670E', mem: 'DDR5', ramSlots: 4, form: 'ATX',     m2: 4, pcie: '5.0', wifi: true,  spec: 'AM5 · DDR5 · ATX · PCIe 5.0 GPU' },
    { id: 'mb-b650-itx',   name: 'Gigabyte B650I AX',          price: 219, socket: 'AM5', chipset: 'AMD B650', mem: 'DDR5', ramSlots: 2, form: 'Mini-ITX', m2: 2, pcie: '4.0', wifi: true,  spec: 'AM5 · DDR5 · Mini-ITX · Wi-Fi' },
    { id: 'mb-a620',       name: 'ASRock A620M Pro',           price: 99,  socket: 'AM5', chipset: 'AMD A620', mem: 'DDR5', ramSlots: 4, form: 'Micro-ATX', m2: 1, pcie: '4.0', wifi: false, spec: 'AM5 · DDR5 · mATX · budget' },
    { id: 'mb-b550',       name: 'MSI B550 Gaming Plus',       price: 119, socket: 'AM4', chipset: 'AMD B550', mem: 'DDR4', ramSlots: 4, form: 'ATX',      m2: 2, pcie: '4.0', wifi: false, spec: 'AM4 · DDR4 · ATX' },
    { id: 'mb-b550-itx',   name: 'ASUS ROG B550-I',            price: 189, socket: 'AM4', chipset: 'AMD B550', mem: 'DDR4', ramSlots: 2, form: 'Mini-ITX', m2: 2, pcie: '4.0', wifi: true,  spec: 'AM4 · DDR4 · Mini-ITX · Wi-Fi' },
    { id: 'mb-b760-ddr5',  name: 'MSI B760 Gaming Plus DDR5',  price: 159, socket: 'LGA1700', chipset: 'Intel B760', mem: 'DDR5', ramSlots: 4, form: 'ATX', m2: 2, pcie: '4.0', wifi: false, spec: 'LGA1700 · DDR5 · ATX' },
    { id: 'mb-b760-ddr4',  name: 'Gigabyte B760 DS3H DDR4',    price: 129, socket: 'LGA1700', chipset: 'Intel B760', mem: 'DDR4', ramSlots: 4, form: 'ATX', m2: 2, pcie: '4.0', wifi: false, spec: 'LGA1700 · DDR4 · ATX · saves on RAM' },
    { id: 'mb-z790',       name: 'ASUS TUF Z790-Plus WiFi',    price: 289, socket: 'LGA1700', chipset: 'Intel Z790', mem: 'DDR5', ramSlots: 4, form: 'ATX', m2: 4, pcie: '5.0', wifi: true,  spec: 'LGA1700 · DDR5 · ATX · OC + Wi-Fi' },
    { id: 'mb-z890',       name: 'MSI MAG Z890 Tomahawk',      price: 329, socket: 'LGA1851', chipset: 'Intel Z890', mem: 'DDR5', ramSlots: 4, form: 'ATX', m2: 4, pcie: '5.0', wifi: true,  spec: 'LGA1851 · DDR5 · ATX · Arrow Lake' },
    { id: 'mb-b860',       name: 'ASRock B860M Pro-A',         price: 169, socket: 'LGA1851', chipset: 'Intel B860', mem: 'DDR5', ramSlots: 4, form: 'Micro-ATX', m2: 2, pcie: '5.0', wifi: false, spec: 'LGA1851 · DDR5 · mATX' },
  ],

  /* ----------------------------------------------------------- RAM ----- */
  // NOTE: Memory prices reflect the 2026 global DRAM shortage — DDR5/DDR4 kits
  // are running roughly 1.6–2.0× their 2024 lows. Flagged with `shortage: true`.
  ram: [
    { id: 'ram-ddr5-16-6000', name: 'Corsair Vengeance 16GB DDR5-6000',       price: 109, mem: 'DDR5', size: 16, modules: '2 × 8GB',  speed: 6000, cl: 30, voltage: 1.35, shortage: true, spec: '2×8GB · 6000MT/s · CL30 · entry' },
    { id: 'ram-ddr5-32-6000', name: 'G.Skill Trident Z5 32GB DDR5-6000',      price: 199, mem: 'DDR5', size: 32, modules: '2 × 16GB', speed: 6000, cl: 30, voltage: 1.35, shortage: true, spec: '2×16GB · 6000MT/s · CL30 · AM5 sweet spot' },
    { id: 'ram-ddr5-32-6400', name: 'Kingston Fury Beast 32GB DDR5-6400',     price: 219, mem: 'DDR5', size: 32, modules: '2 × 16GB', speed: 6400, cl: 32, voltage: 1.40, shortage: true, spec: '2×16GB · 6400MT/s · CL32' },
    { id: 'ram-ddr5-32-8000', name: 'G.Skill Trident Z5 RGB 32GB DDR5-8000',  price: 329, mem: 'DDR5', size: 32, modules: '2 × 16GB', speed: 8000, cl: 38, voltage: 1.45, shortage: true, spec: '2×16GB · 8000MT/s · CL38 · Arrow Lake / high-OC' },
    { id: 'ram-ddr5-48-6000', name: 'Corsair Vengeance 48GB DDR5-6000',       price: 279, mem: 'DDR5', size: 48, modules: '2 × 24GB', speed: 6000, cl: 30, voltage: 1.35, shortage: true, spec: '2×24GB · 6000MT/s · CL30 · extra headroom' },
    { id: 'ram-ddr5-64-6000', name: 'Corsair Vengeance 64GB DDR5-6000',       price: 399, mem: 'DDR5', size: 64, modules: '2 × 32GB', speed: 6000, cl: 30, voltage: 1.35, shortage: true, spec: '2×32GB · 6000MT/s · heavy multitask' },
    { id: 'ram-ddr5-96-6000', name: 'G.Skill Trident Z5 96GB DDR5-6000',      price: 589, mem: 'DDR5', size: 96, modules: '2 × 48GB', speed: 6000, cl: 30, voltage: 1.40, shortage: true, spec: '2×48GB · 6000MT/s · creators & workstation' },
    { id: 'ram-ddr4-16-3600', name: 'Corsair Vengeance LPX 16GB DDR4',        price: 72,  mem: 'DDR4', size: 16, modules: '2 × 8GB',  speed: 3600, cl: 18, voltage: 1.35, shortage: true, spec: '2×8GB · 3600MT/s · CL18 · legacy AM4/LGA1700' },
    { id: 'ram-ddr4-32-3600', name: 'G.Skill Ripjaws V 32GB DDR4-3600',       price: 129, mem: 'DDR4', size: 32, modules: '2 × 16GB', speed: 3600, cl: 16, voltage: 1.35, shortage: true, spec: '2×16GB · 3600MT/s · CL16 · legacy' },
  ],

  /* ----------------------------------------------------------- GPUs ---- */
  /* NVIDIA RTX 50 (Blackwell, GDDR7, DLSS 4) · AMD RX 9000 (RDNA 4, FSR 4) ·
     Intel Arc B-series (Battlemage). Last-gen RTX 40 / RX 7000 retired. */
  gpu: [
    { id: 'gpu-rtx5060',   name: 'NVIDIA RTX 5060 8GB',        price: 319, brand: 'NVIDIA', vram: 8,  vramType: 'GDDR7', bus: 128, boost: 2497, tdp: 145, length: 200, psu_min: 450, power_conn: '1× 8-pin',            spec: '1080p high refresh · DLSS 4' },
    { id: 'gpu-rtx5060ti', name: 'NVIDIA RTX 5060 Ti 16GB',    price: 459, brand: 'NVIDIA', vram: 16, vramType: 'GDDR7', bus: 128, boost: 2572, tdp: 180, length: 200, psu_min: 550, power_conn: '1× 8-pin',            spec: '1080p/1440p · 16GB · DLSS 4' },
    { id: 'gpu-rtx5070',   name: 'NVIDIA RTX 5070 12GB',       price: 649, brand: 'NVIDIA', vram: 12, vramType: 'GDDR7', bus: 192, boost: 2512, tdp: 250, length: 242, psu_min: 650, power_conn: '1× 16-pin (12V-2×6)', spec: '1440p ultra · DLSS 4 MFG' },
    { id: 'gpu-rtx5070ti', name: 'NVIDIA RTX 5070 Ti 16GB',    price: 879, brand: 'NVIDIA', vram: 16, vramType: 'GDDR7', bus: 256, boost: 2452, tdp: 300, length: 300, psu_min: 750, power_conn: '1× 16-pin (12V-2×6)', spec: '1440p/4K · 16GB' },
    { id: 'gpu-rtx5080',   name: 'NVIDIA RTX 5080 16GB',       price: 1189,brand: 'NVIDIA', vram: 16, vramType: 'GDDR7', bus: 256, boost: 2617, tdp: 360, length: 304, psu_min: 850, power_conn: '1× 16-pin (12V-2×6)', spec: '4K high refresh' },
    { id: 'gpu-rtx5090',   name: 'NVIDIA RTX 5090 32GB',       price: 1999,brand: 'NVIDIA', vram: 32, vramType: 'GDDR7', bus: 512, boost: 2407, tdp: 575, length: 304, psu_min: 1000,power_conn: '1× 16-pin (12V-2×6)', spec: '4K/8K halo · 32GB · colossal' },
    { id: 'gpu-rx9060xt',  name: 'AMD Radeon RX 9060 XT 16GB', price: 349, brand: 'AMD',    vram: 16, vramType: 'GDDR6', bus: 128, boost: 3130, tdp: 160, length: 245, psu_min: 500, power_conn: '1× 8-pin',            spec: '1080p/1440p · 16GB value' },
    { id: 'gpu-rx9070',    name: 'AMD Radeon RX 9070 16GB',    price: 629, brand: 'AMD',    vram: 16, vramType: 'GDDR6', bus: 256, boost: 2520, tdp: 220, length: 290, psu_min: 650, power_conn: '2× 8-pin',            spec: '1440p ultra · efficient · 16GB' },
    { id: 'gpu-rx9070xt',  name: 'AMD Radeon RX 9070 XT 16GB', price: 689, brand: 'AMD',    vram: 16, vramType: 'GDDR6', bus: 256, boost: 2970, tdp: 304, length: 290, psu_min: 750, power_conn: '2× 8-pin',            spec: '1440p/4K raster · 16GB' },
    { id: 'gpu-arc-b580',  name: 'Intel Arc B580 12GB',        price: 279, brand: 'Intel',  vram: 12, vramType: 'GDDR6', bus: 192, boost: 2670, tdp: 190, length: 272, psu_min: 500, power_conn: '1× 8-pin',            spec: '1440p value · 12GB' },
    { id: 'gpu-arc-b570',  name: 'Intel Arc B570 10GB',        price: 239, brand: 'Intel',  vram: 10, vramType: 'GDDR6', bus: 160, boost: 2500, tdp: 150, length: 245, psu_min: 450, power_conn: '1× 8-pin',            spec: '1080p value · 10GB' },
  ],

  /* -------------------------------------------------------- Storage ---- */
  storage: [
    { id: 'ssd-1tb-g4',  name: 'Samsung 990 EVO 1TB NVMe',     price: 79,  iface: 'M.2', form: 'M.2 2280', tech: 'NVMe SSD', pcie: 'PCIe 4.0 ×4', size: 1000, read: 5000,  write: 4200,  spec: 'PCIe 4.0 · ~5000MB/s' },
    { id: 'ssd-2tb-g4',  name: 'WD Black SN770 2TB NVMe',      price: 129, iface: 'M.2', form: 'M.2 2280', tech: 'NVMe SSD', pcie: 'PCIe 4.0 ×4', size: 2000, read: 5150,  write: 4850,  spec: 'PCIe 4.0 · 2TB' },
    { id: 'ssd-2tb-g5',  name: 'Crucial T705 2TB PCIe 5.0',   price: 219, iface: 'M.2', form: 'M.2 2280', tech: 'NVMe SSD', pcie: 'PCIe 5.0 ×4', size: 2000, read: 14100, write: 12600, spec: 'PCIe 5.0 · ~14000MB/s' },
    { id: 'ssd-4tb-g4',  name: 'Samsung 990 Pro 4TB',         price: 309, iface: 'M.2', form: 'M.2 2280', tech: 'NVMe SSD', pcie: 'PCIe 4.0 ×4', size: 4000, read: 7450,  write: 6900,  spec: 'PCIe 4.0 · 4TB workhorse' },
    { id: 'ssd-sata-1tb',name: 'Crucial MX500 1TB SATA',      price: 69,  iface: 'SATA', form: '2.5-inch', tech: 'SATA SSD', pcie: 'SATA III 6Gb/s', size: 1000, read: 560, write: 510, spec: '2.5" SATA · universal' },
    { id: 'hdd-4tb',     name: 'Seagate BarraCuda 4TB HDD',   price: 89,  iface: 'SATA', form: '3.5-inch', tech: 'Hard drive · 5400 RPM', pcie: 'SATA III 6Gb/s', size: 4000, read: 190, write: 190, spec: '3.5" HDD · bulk storage' },
  ],

  /* --------------------------------------------------- Power supply ---- */
  psu: [
    { id: 'psu-550',  name: 'Corsair RM550e 550W',        price: 79,  watt: 550,  rating: 'Gold',   form: 'ATX', modular: 'Fully modular', fan: '120mm', atx3: true,  power_conn: '2× PCIe 8-pin', spec: '550W · 80+ Gold · fully modular' },
    { id: 'psu-650',  name: 'be quiet! Pure Power 12 M 650W', price: 89, watt: 650, rating: 'Gold', form: 'ATX', modular: 'Fully modular', fan: '120mm', atx3: true,  power_conn: '1× 12V-2×6 (600W)', spec: '650W · 80+ Gold' },
    { id: 'psu-750',  name: 'Corsair RM750e 750W',        price: 109, watt: 750,  rating: 'Gold',   form: 'ATX', modular: 'Fully modular', fan: '120mm', atx3: true,  power_conn: '1× 12VHPWR (16-pin)', spec: '750W · 80+ Gold · PCIe 5.0' },
    { id: 'psu-850',  name: 'Seasonic Focus GX 850W',     price: 139, watt: 850,  rating: 'Gold',   form: 'ATX', modular: 'Fully modular', fan: '120mm', atx3: true,  power_conn: '1× 12VHPWR (16-pin)', spec: '850W · 80+ Gold · 12VHPWR' },
    { id: 'psu-1000', name: 'Corsair RM1000x 1000W',      price: 189, watt: 1000, rating: 'Gold',   form: 'ATX', modular: 'Fully modular', fan: '135mm', atx3: true,  power_conn: '1× 12VHPWR (16-pin)', spec: '1000W · 80+ Gold · big GPU ready' },
    { id: 'psu-1200', name: 'be quiet! Dark Power 13 1200W', price: 269, watt: 1200, rating: 'Platinum', form: 'ATX', modular: 'Fully modular', fan: '135mm', atx3: true, power_conn: '1× 12VHPWR (16-pin)', spec: '1200W · 80+ Platinum · headroom' },
    { id: 'psu-sfx-750',name:'Corsair SF750 SFX 750W',    price: 159, watt: 750,  rating: 'Platinum',form: 'SFX', modular: 'Fully modular', fan: '92mm',  atx3: true,  power_conn: '1× 12VHPWR (16-pin)', spec: '750W · SFX · for Mini-ITX' },
  ],

  /* ---------------------------------------------------------- Cases ---- */
  case: [
    { id: 'case-o11',    name: 'Lian Li O11 Dynamic EVO',  price: 159, form: 'ATX',      gpu_max: 422, cooler_max: 167, psu_form: 'ATX', radiator: 'Up to 360mm (top/side/bottom)', spec: 'ATX · dual-chamber · glass showcase' },
    { id: 'case-4000d',  name: 'Corsair 4000D Airflow',    price: 99,  form: 'ATX',      gpu_max: 360, cooler_max: 170, psu_form: 'ATX', radiator: 'Up to 360mm (front)', spec: 'ATX · superb airflow · value' },
    { id: 'case-pop',    name: 'Fractal Pop Air',          price: 89,  form: 'ATX',      gpu_max: 405, cooler_max: 170, psu_form: 'ATX', radiator: 'Up to 360mm (front)', spec: 'ATX · mesh front · colourful' },
    { id: 'case-north',  name: 'Fractal North',            price: 139, form: 'ATX',      gpu_max: 355, cooler_max: 170, psu_form: 'ATX', radiator: 'Up to 360mm (front)', spec: 'ATX · walnut + mesh · gorgeous' },
    { id: 'case-meshify',name: 'Fractal Meshify 2 Compact',price: 119, form: 'ATX',      gpu_max: 360, cooler_max: 169, psu_form: 'ATX', radiator: 'Up to 360mm (front)', spec: 'ATX · compact tower' },
    { id: 'case-m+atx',  name: 'NZXT H510 Flow (mATX)',    price: 79,  form: 'Micro-ATX', gpu_max: 360, cooler_max: 165, psu_form: 'ATX', radiator: 'Up to 280mm (front)', spec: 'Micro-ATX · clean build' },
    { id: 'case-a4h2o',  name: 'Lian Li A4-H2O (ITX)',     price: 129, form: 'Mini-ITX',  gpu_max: 322, cooler_max: 70,  psu_form: 'SFX', radiator: 'Up to 240mm (side)', spec: 'Mini-ITX · tiny · SFX PSU only' },
    { id: 'case-ncore',  name: 'NR200P MAX (ITX)',         price: 149, form: 'Mini-ITX',  gpu_max: 336, cooler_max: 67,  psu_form: 'SFX', radiator: '280mm AIO included', spec: 'Mini-ITX · AIO included class' },
  ],

  /* -------------------------------------------------------- Coolers ---- */
  cooler: [
    { id: 'cool-stock',   name: 'Stock air cooler',           price: 0,   type: 'air', height: 70,  rad: 0,   fans: '1× 92mm',  sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 105, spec: 'Bundled with some CPUs · quiet enough' },
    { id: 'cool-ak620',   name: 'DeepCool AK620 (air)',       price: 59,  type: 'air', height: 160, rad: 0,   fans: '2× 120mm', sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 260, spec: 'Dual-tower air · handles anything' },
    { id: 'cool-pa120',   name: 'Thermalright Peerless 120',  price: 39,  type: 'air', height: 155, rad: 0,   fans: '2× 120mm', sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 245, spec: 'Air · legendary value' },
    { id: 'cool-nh-l9',   name: 'Noctua NH-L9 (low profile)', price: 49,  type: 'air', height: 37,  rad: 0,   fans: '1× 92mm',  sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 95,  spec: 'Low profile · fits tiny cases' },
    { id: 'cool-aio240',  name: 'Arctic Liquid Freezer 240',  price: 79,  type: 'aio', height: 0,   rad: 240, fans: '2× 120mm', sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 280, spec: '240mm AIO · cool & quiet' },
    { id: 'cool-aio360',  name: 'Arctic Liquid Freezer 360',  price: 99,  type: 'aio', height: 0,   rad: 360, fans: '3× 120mm', sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 350, spec: '360mm AIO · best-in-class' },
    { id: 'cool-aio280',  name: 'NZXT Kraken 280 RGB',        price: 149, type: 'aio', height: 0,   rad: 280, fans: '2× 140mm', sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 300, spec: '280mm AIO · LCD pump' },
  ],
};

/* Curated starter builds (ids reference PARTS above) */
const PRESETS = [
  {
    id: 'budget', name: '1080p Budget Hero', blurb: 'Crushes esports & 1080p at a friendly price.',
    accent: '#34d399',
    parts: { cpu: 'cpu-i5-12400f', mobo: 'mb-b760-ddr4', ram: 'ram-ddr4-16-3600', gpu: 'gpu-rtx5060', storage: 'ssd-1tb-g4', psu: 'psu-550', case: 'case-m+atx', cooler: 'cool-stock' }
  },
  {
    id: 'sweet', name: '1440p Sweet Spot', blurb: 'The build most people should buy. Quiet, fast, future-proof.',
    accent: '#60a5fa',
    parts: { cpu: 'cpu-r7-7800x3d', mobo: 'mb-b650-pro', ram: 'ram-ddr5-32-6000', gpu: 'gpu-rtx5070ti', storage: 'ssd-2tb-g4', psu: 'psu-750', case: 'case-4000d', cooler: 'cool-aio240' }
  },
  {
    id: 'ultra', name: '4K Ultra Beast', blurb: 'No compromises. Max settings, max frames, max bragging rights.',
    accent: '#c084fc',
    parts: { cpu: 'cpu-r7-9800x3d', mobo: 'mb-x670e', ram: 'ram-ddr5-32-6000', gpu: 'gpu-rtx5090', storage: 'ssd-2tb-g5', psu: 'psu-1200', case: 'case-o11', cooler: 'cool-aio360' }
  },
  {
    id: 'sff', name: 'Small Form Factor', blurb: 'Console-sized footprint, full desktop power.',
    accent: '#fbbf24',
    parts: { cpu: 'cpu-r7-7700x', mobo: 'mb-b650-itx', ram: 'ram-ddr5-32-6000', gpu: 'gpu-rtx5070', storage: 'ssd-2tb-g4', psu: 'psu-sfx-750', case: 'case-ncore', cooler: 'cool-nh-l9' }
  },
];

if (typeof module !== 'undefined') module.exports = { CATEGORIES, PARTS, PRESETS, SOCKET_MEM };
