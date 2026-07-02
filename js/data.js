/* =========================================================================
   Forge · Parts catalog
   Prices are indicative euro (€) estimates, mid-2026 European retail, researched
   against current RRPs/street prices (Jul 2026). NOTE: the 2026 AI-driven DRAM +
   NAND shortage has RAM at ~2.5–4× and SSDs at ~2× their 2024 lows — those numbers
   are correct, not typos. GPU/CPU sit near MSRP. Re-check when the shortage eases
   (analysts: not before late 2027).
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
  /* `perf` = relative 1080p gaming index (Ryzen 7 9800X3D = 100) — feeds the build
     performance estimate. `legacy: true` marks retired-platform chips (AM4, Alder Lake). */
  cpu: [
    { id: 'cpu-r5-7600',   name: 'AMD Ryzen 5 7600',        price: 189, socket: 'AM5', mem: 'DDR5', memSpeed: 5200, cores: 6,  threads: 12, base: 3.8, boost: 5.1, l3: 32, arch: 'Zen 4', tdp: 88,  tdpRated: 65,  igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: true,  perf: 72,  img: 'https://c1.neweggimages.com/productimage/nb640/19-113-770-02.jpg', spec: '6C/12T · 5.1GHz boost · iGPU' },
    { id: 'cpu-r7-7700x',  name: 'AMD Ryzen 7 7700X',       price: 289, socket: 'AM5', mem: 'DDR5', memSpeed: 5200, cores: 8,  threads: 16, base: 4.5, boost: 5.4, l3: 32, arch: 'Zen 4', tdp: 142, tdpRated: 105, igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: false, perf: 78,  img: 'https://c1.neweggimages.com/productimage/nb640/19-113-768-V15.jpg', spec: '8C/16T · 5.4GHz boost · iGPU' },
    { id: 'cpu-r7-7800x3d',name: 'AMD Ryzen 7 7800X3D',     price: 379, socket: 'AM5', mem: 'DDR5', memSpeed: 5200, cores: 8,  threads: 16, base: 4.2, boost: 5.0, l3: 96, arch: 'Zen 4 (3D V-Cache)', tdp: 162, tdpRated: 120, igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: false, perf: 96,  img: 'https://c1.neweggimages.com/productimage/nb640/19-113-793-04.png', spec: '8C/16T · 96MB 3D V-Cache · gaming king' },
    { id: 'cpu-r5-9600x',  name: 'AMD Ryzen 5 9600X',       price: 249, socket: 'AM5', mem: 'DDR5', memSpeed: 5600, cores: 6,  threads: 12, base: 3.9, boost: 5.4, l3: 32, arch: 'Zen 5', tdp: 88,  tdpRated: 65,  igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: false, perf: 76,  img: 'https://c1.neweggimages.com/productimage/nb640/19-113-844-08.jpg', spec: '6C/12T · 5.4GHz boost · Zen 5' },
    { id: 'cpu-r7-9700x',  name: 'AMD Ryzen 7 9700X',       price: 349, socket: 'AM5', mem: 'DDR5', memSpeed: 5600, cores: 8,  threads: 16, base: 3.8, boost: 5.5, l3: 32, arch: 'Zen 5', tdp: 88,  tdpRated: 65,  igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: false, perf: 82,  img: 'https://c1.neweggimages.com/productimage/nb640/19-113-843-08.jpg', spec: '8C/16T · 5.5GHz boost · Zen 5' },
    { id: 'cpu-r7-9800x3d',name: 'AMD Ryzen 7 9800X3D',     price: 549, socket: 'AM5', mem: 'DDR5', memSpeed: 5600, cores: 8,  threads: 16, base: 4.7, boost: 5.2, l3: 96, arch: 'Zen 5 (3D V-Cache)', tdp: 162, tdpRated: 120, igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: false, perf: 100, img: 'https://c1.neweggimages.com/productimage/nb640/19-113-877-03.png', spec: '8C/16T · 96MB 3D V-Cache · fastest gaming CPU' },
    { id: 'cpu-r9-9900x',  name: 'AMD Ryzen 9 9900X',       price: 429, socket: 'AM5', mem: 'DDR5', memSpeed: 5600, cores: 12, threads: 24, base: 4.4, boost: 5.6, l3: 64, arch: 'Zen 5', tdp: 162, tdpRated: 120, igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: false, perf: 84,  img: 'https://c1.neweggimages.com/productimage/nb640/19-113-842-01.png', spec: '12C/24T · 5.6GHz boost · Zen 5' },
    { id: 'cpu-r9-9950x3d',name: 'AMD Ryzen 9 9950X3D',     price: 749, socket: 'AM5', mem: 'DDR5', memSpeed: 5600, cores: 16, threads: 32, base: 4.3, boost: 5.7, l3: 128,arch: 'Zen 5 (3D V-Cache)', tdp: 200, tdpRated: 170, igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: false, perf: 100, img: 'https://c1.neweggimages.com/productimage/nb640/19-113-884-01.png', spec: '16C/32T · 128MB 3D V-Cache · do-it-all flagship' },
    { id: 'cpu-r5-5600',   name: 'AMD Ryzen 5 5600',        price: 119, socket: 'AM4', mem: 'DDR4', memSpeed: 3200, cores: 6,  threads: 12, base: 3.5, boost: 4.4, l3: 32, arch: 'Zen 3', tdp: 88,  tdpRated: 65,  igpu: false, igpuName: null, cooler_inc: true,  perf: 58, legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/A2W0S210105hx8rA.jpg', spec: '6C/12T · 4.4GHz boost · budget AM4' },
    { id: 'cpu-r7-5700x3d',name: 'AMD Ryzen 7 5700X3D',     price: 199, socket: 'AM4', mem: 'DDR4', memSpeed: 3200, cores: 8,  threads: 16, base: 3.0, boost: 4.1, l3: 96, arch: 'Zen 3 (3D V-Cache)', tdp: 142, tdpRated: 105, igpu: false, igpuName: null, cooler_inc: false, perf: 74, legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/19-113-734-S02.jpg', spec: '8C/16T · 96MB 3D V-Cache on AM4' },
    { id: 'cpu-i5-12400f', name: 'Intel Core i5-12400F',    price: 139, socket: 'LGA1700', mem: ['DDR4','DDR5'], memSpeed: 4800, cores: 6, pcore: 6, ecore: 0, threads: 12, base: 2.5, boost: 4.4, l3: 18, arch: 'Alder Lake', tdp: 117, tdpRated: 65, igpu: false, igpuName: null, cooler_inc: true, perf: 64, legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/19-118-360-09.jpg', spec: '6P/12T · 4.4GHz boost · superb value' },
    { id: 'cpu-i5-14600k', name: 'Intel Core i5-14600K',    price: 269, socket: 'LGA1700', mem: ['DDR4','DDR5'], memSpeed: 5600, cores: 14, pcore: 6, ecore: 8, threads: 20, base: 3.5, boost: 5.3, l3: 24, arch: 'Raptor Lake Refresh', tdp: 181, tdpRated: 125, igpu: true, igpuName: 'Intel UHD 770', cooler_inc: false, perf: 82, img: 'https://c1.neweggimages.com/ProductImage/19-118-470-07.jpg', spec: '6P+8E / 20T · 5.3GHz boost · iGPU' },
    { id: 'cpu-i7-14700k', name: 'Intel Core i7-14700K',    price: 359, socket: 'LGA1700', mem: ['DDR4','DDR5'], memSpeed: 5600, cores: 20, pcore: 8, ecore: 12, threads: 28, base: 3.4, boost: 5.6, l3: 33, arch: 'Raptor Lake Refresh', tdp: 253, tdpRated: 125, igpu: true, igpuName: 'Intel UHD 770', cooler_inc: false, perf: 90, img: 'https://c1.neweggimages.com/productimage/nb640/19-118-466-06.jpg', spec: '8P+12E / 28T · 5.6GHz boost · iGPU' },
    { id: 'cpu-i9-14900k', name: 'Intel Core i9-14900K',    price: 529, socket: 'LGA1700', mem: ['DDR4','DDR5'], memSpeed: 5600, cores: 24, pcore: 8, ecore: 16, threads: 32, base: 3.2, boost: 6.0, l3: 36, arch: 'Raptor Lake Refresh', tdp: 253, tdpRated: 125, igpu: true, igpuName: 'Intel UHD 770', cooler_inc: false, perf: 94, img: 'https://c1.neweggimages.com/productimage/nb640/19-118-462-03.jpg', spec: '8P+16E / 32T · 6.0GHz boost · iGPU' },
    { id: 'cpu-cu5-245k',  name: 'Intel Core Ultra 5 245K', price: 279, socket: 'LGA1851', mem: 'DDR5', memSpeed: 6400, cores: 14, pcore: 6, ecore: 8, threads: 14, base: 4.2, boost: 5.2, l3: 24, arch: 'Arrow Lake', tdp: 159, tdpRated: 125, igpu: true, igpuName: 'Intel Graphics (Xe)', cooler_inc: false, perf: 78, img: 'https://c1.neweggimages.com/ProductImage/19-118-508-15.jpg', spec: '6P+8E / 14T · 5.2GHz boost · Arrow Lake' },
    { id: 'cpu-cu7-265k',  name: 'Intel Core Ultra 7 265K', price: 309, socket: 'LGA1851', mem: 'DDR5', memSpeed: 6400, cores: 20, pcore: 8, ecore: 12, threads: 20, base: 3.9, boost: 5.5, l3: 30, arch: 'Arrow Lake', tdp: 250, tdpRated: 125, igpu: true, igpuName: 'Intel Graphics (Xe)', cooler_inc: false, perf: 86, img: 'https://c1.neweggimages.com/productimage/nb640/19-118-506-07.jpg', spec: '8P+12E / 20T · 5.5GHz boost · Arrow Lake' },
    { id: 'cpu-cu9-285k',  name: 'Intel Core Ultra 9 285K', price: 619, socket: 'LGA1851', mem: 'DDR5', memSpeed: 6400, cores: 24, pcore: 8, ecore: 16, threads: 24, base: 3.7, boost: 5.7, l3: 36, arch: 'Arrow Lake', tdp: 250, tdpRated: 125, igpu: true, igpuName: 'Intel Graphics (Xe)', cooler_inc: false, perf: 90, img: 'https://c1.neweggimages.com/ProductImage/19-118-505-08.jpg', spec: '8P+16E / 24T · 5.7GHz boost · flagship' },
    { id: 'cpu-r5-7600x',  name: 'AMD Ryzen 5 7600X',       price: 219, socket: 'AM5', mem: 'DDR5', memSpeed: 5200, cores: 6,  threads: 12, base: 4.7, boost: 5.3, l3: 32, arch: 'Zen 4', tdp: 142, tdpRated: 105, igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: false, perf: 74, img: 'https://c1.neweggimages.com/productimage/nb640/19-113-770-02.jpg', spec: '6C/12T · 5.3GHz boost · iGPU' },
    { id: 'cpu-r9-7950x',  name: 'AMD Ryzen 9 7950X',       price: 499, socket: 'AM5', mem: 'DDR5', memSpeed: 5200, cores: 16, threads: 32, base: 4.5, boost: 5.7, l3: 64, arch: 'Zen 4', tdp: 230, tdpRated: 170, igpu: true,  igpuName: 'Radeon (2-core RDNA 2)', cooler_inc: false, perf: 86, img: 'https://c1.neweggimages.com/productimage/nb640/19-113-771-09.jpg', spec: '16C/32T · 5.7GHz boost · Zen 4 workstation' },
    { id: 'cpu-r9-5950x',  name: 'AMD Ryzen 9 5950X',       price: 399, socket: 'AM4', mem: 'DDR4', memSpeed: 3200, cores: 16, threads: 32, base: 3.4, boost: 4.9, l3: 64, arch: 'Zen 3', tdp: 142, tdpRated: 105, igpu: false, igpuName: null, cooler_inc: false, perf: 72, legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/B1MBS2111150RD3BI2E.jpg', spec: '16C/32T · 4.9GHz boost · AM4' },
    { id: 'cpu-r5-5600x',  name: 'AMD Ryzen 5 5600X',       price: 149, socket: 'AM4', mem: 'DDR4', memSpeed: 3200, cores: 6,  threads: 12, base: 3.7, boost: 4.6, l3: 32, arch: 'Zen 3', tdp: 88,  tdpRated: 65,  igpu: false, igpuName: null, cooler_inc: true,  perf: 60, legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/A2W0S210105hx8rA.jpg', spec: '6C/12T · 4.6GHz boost · AM4' },
    { id: 'cpu-i5-13400f', name: 'Intel Core i5-13400F',    price: 219, socket: 'LGA1700', mem: ['DDR4','DDR5'], memSpeed: 4800, cores: 10, pcore: 6, ecore: 4, threads: 16, base: 2.5, boost: 4.6, l3: 20, arch: 'Raptor Lake', tdp: 148, tdpRated: 65, igpu: false, igpuName: null, cooler_inc: true, perf: 66, legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/19-118-431-06.jpg', spec: '6P+4E / 16T · 4.6GHz boost · value' },
    { id: 'cpu-i9-13900k', name: 'Intel Core i9-13900K',    price: 449, socket: 'LGA1700', mem: ['DDR4','DDR5'], memSpeed: 5600, cores: 24, pcore: 8, ecore: 16, threads: 32, base: 3.0, boost: 5.8, l3: 36, arch: 'Raptor Lake', tdp: 253, tdpRated: 125, igpu: true, igpuName: 'Intel UHD 770', cooler_inc: false, perf: 92, legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/19-118-412-V03.jpg', spec: '8P+16E / 32T · 5.8GHz boost · Raptor Lake' },
  ],

  /* --------------------------------------------------- Motherboards ---- */
  mobo: [
    { id: 'mb-b650-pro',   name: 'MSI B650 Tomahawk WiFi',     price: 199, socket: 'AM5', chipset: 'AMD B650', mem: 'DDR5', ramSlots: 4, form: 'ATX',      m2: 3, pcie: '5.0', wifi: true,  img: 'https://c1.neweggimages.com/productimage/nb640/13-144-557-06.jpg', spec: 'AM5 · DDR5 · ATX · Wi-Fi 6E' },
    { id: 'mb-x670e',      name: 'ASUS ROG Strix X670E-F',     price: 379, socket: 'AM5', chipset: 'AMD X670E', mem: 'DDR5', ramSlots: 4, form: 'ATX',     m2: 4, pcie: '5.0', wifi: true,  img: 'https://c1.neweggimages.com/productimage/nb640/AFYUD2401120XY3JHC0.jpg', spec: 'AM5 · DDR5 · ATX · PCIe 5.0 GPU' },
    { id: 'mb-b650-itx',   name: 'Gigabyte B650I AX',          price: 219, socket: 'AM5', chipset: 'AMD B650', mem: 'DDR5', ramSlots: 2, form: 'Mini-ITX', m2: 2, pcie: '4.0', wifi: true,  img: 'https://c1.neweggimages.com/productimage/nb640/AGBAS240428143E5069.jpg', spec: 'AM5 · DDR5 · Mini-ITX · Wi-Fi' },
    { id: 'mb-a620',       name: 'ASRock A620M Pro',           price: 99,  socket: 'AM5', chipset: 'AMD A620', mem: 'DDR5', ramSlots: 4, form: 'Micro-ATX', m2: 1, pcie: '4.0', wifi: false, img: 'https://c1.neweggimages.com/productimage/nb640/13-162-117-02.jpg', spec: 'AM5 · DDR5 · mATX · budget' },
    { id: 'mb-b550',       name: 'MSI B550 Gaming Plus',       price: 119, socket: 'AM4', chipset: 'AMD B550', mem: 'DDR4', ramSlots: 4, form: 'ATX',      m2: 2, pcie: '4.0', wifi: false, legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/13-144-325-V80.jpg', spec: 'AM4 · DDR4 · ATX' },
    { id: 'mb-b550-itx',   name: 'ASUS ROG B550-I',            price: 189, socket: 'AM4', chipset: 'AMD B550', mem: 'DDR4', ramSlots: 2, form: 'Mini-ITX', m2: 2, pcie: '4.0', wifi: true,  legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/13-119-322-01.jpg', spec: 'AM4 · DDR4 · Mini-ITX · Wi-Fi' },
    { id: 'mb-b760-ddr5',  name: 'MSI B760 Gaming Plus DDR5',  price: 159, socket: 'LGA1700', chipset: 'Intel B760', mem: 'DDR5', ramSlots: 4, form: 'ATX', m2: 2, pcie: '4.0', wifi: false, spec: 'LGA1700 · DDR5 · ATX' },
    { id: 'mb-b760-ddr4',  name: 'Gigabyte B760 DS3H DDR4',    price: 129, socket: 'LGA1700', chipset: 'Intel B760', mem: 'DDR4', ramSlots: 4, form: 'ATX', m2: 2, pcie: '4.0', wifi: false, img: 'https://c1.neweggimages.com/productimage/nb640/13-145-426-02.jpg', spec: 'LGA1700 · DDR4 · ATX · saves on RAM' },
    { id: 'mb-z790',       name: 'ASUS TUF Z790-Plus WiFi',    price: 289, socket: 'LGA1700', chipset: 'Intel Z790', mem: 'DDR5', ramSlots: 4, form: 'ATX', m2: 4, pcie: '5.0', wifi: true,  img: 'https://c1.neweggimages.com/productimage/nb640/13-119-618-01.png', spec: 'LGA1700 · DDR5 · ATX · OC + Wi-Fi' },
    { id: 'mb-z890',       name: 'MSI MAG Z890 Tomahawk',      price: 329, socket: 'LGA1851', chipset: 'Intel Z890', mem: 'DDR5', ramSlots: 4, form: 'ATX', m2: 4, pcie: '5.0', wifi: true,  img: 'https://c1.neweggimages.com/productimage/nb640/13-144-669-06.png', spec: 'LGA1851 · DDR5 · ATX · Arrow Lake' },
    { id: 'mb-b860',       name: 'ASRock B860M Pro-A',         price: 169, socket: 'LGA1851', chipset: 'Intel B860', mem: 'DDR5', ramSlots: 4, form: 'Micro-ATX', m2: 2, pcie: '5.0', wifi: false, img: 'https://c1.neweggimages.com/productimage/nb640/13-162-215-03.png', spec: 'LGA1851 · DDR5 · mATX' },
    { id: 'mb-z790e-strix', name: 'ASUS ROG Strix Z790-E Gaming WiFi', price: 449, socket: 'LGA1700', chipset: 'Intel Z790', mem: 'DDR5', ramSlots: 4, form: 'ATX',       m2: 5, pcie: '5.0', wifi: true,  img: 'https://c1.neweggimages.com/productimage/nb640/13-119-598-03.png', spec: 'LGA1700 · DDR5 · ATX · PCIe 5.0 + Wi-Fi' },
    { id: 'mb-z790-edge',   name: 'MSI MPG Z790 Edge WiFi',        price: 329, socket: 'LGA1700', chipset: 'Intel Z790', mem: 'DDR5', ramSlots: 4, form: 'ATX',       m2: 4, pcie: '5.0', wifi: true,  img: 'https://c1.neweggimages.com/productimage/nb640/13-144-564-V01.jpg', spec: 'LGA1700 · DDR5 · ATX · PCIe 5.0' },
    { id: 'mb-z790-steel',  name: 'ASRock Z790 Steel Legend WiFi', price: 259, socket: 'LGA1700', chipset: 'Intel Z790', mem: 'DDR5', ramSlots: 4, form: 'ATX',       m2: 4, pcie: '5.0', wifi: true,  img: 'https://c1.neweggimages.com/productimage/nb640/13-162-090-07.jpg', spec: 'LGA1700 · DDR5 · ATX · Wi-Fi' },
    { id: 'mb-b760-aorus',  name: 'Gigabyte B760 Aorus Elite AX',  price: 189, socket: 'LGA1700', chipset: 'Intel B760', mem: 'DDR5', ramSlots: 4, form: 'ATX',       m2: 3, pcie: '4.0', wifi: true,  img: 'https://c1.neweggimages.com/productimage/nb640/13-145-431-02.jpg', spec: 'LGA1700 · DDR5 · ATX · Wi-Fi' },
    { id: 'mb-b760m-prime', name: 'ASUS Prime B760M-A AX',         price: 149, socket: 'LGA1700', chipset: 'Intel B760', mem: 'DDR5', ramSlots: 4, form: 'Micro-ATX', m2: 2, pcie: '4.0', wifi: true,  img: 'https://c1.neweggimages.com/productimage/nb640/13-119-640-03.png', spec: 'LGA1700 · DDR5 · mATX · Wi-Fi' },
    { id: 'mb-b760m-msi',   name: 'MSI PRO B760M-A WiFi DDR5',     price: 155, socket: 'LGA1700', chipset: 'Intel B760', mem: 'DDR5', ramSlots: 4, form: 'Micro-ATX', m2: 2, pcie: '4.0', wifi: true,  img: 'https://c1.neweggimages.com/productimage/nb640/AJEPS240313029SNMAC.jpg', spec: 'LGA1700 · DDR5 · mATX · Wi-Fi' },
    { id: 'mb-x670e-tuf',   name: 'ASUS TUF Gaming X670E-Plus WiFi', price: 289, socket: 'AM5', chipset: 'AMD X670E', mem: 'DDR5', ramSlots: 4, form: 'ATX',       m2: 4, pcie: '5.0', wifi: true,  img: 'https://c1.neweggimages.com/productimage/nb640/AFYUD2401120XY42M79.jpg', spec: 'AM5 · DDR5 · ATX · PCIe 5.0 + Wi-Fi' },
    { id: 'mb-x670e-master',name: 'Gigabyte X670E Aorus Master',   price: 449, socket: 'AM5', chipset: 'AMD X670E', mem: 'DDR5', ramSlots: 4, form: 'ATX',       m2: 4, pcie: '5.0', wifi: true,  img: 'https://c1.neweggimages.com/productimage/nb640/13-145-405-02.jpg', spec: 'AM5 · DDR5 · ATX · high-end VRM + Wi-Fi' },
    { id: 'mb-b650m-prors', name: 'ASRock B650M Pro RS',           price: 139, socket: 'AM5', chipset: 'AMD B650', mem: 'DDR5', ramSlots: 4, form: 'Micro-ATX', m2: 2, pcie: '4.0', wifi: false, img: 'https://c1.neweggimages.com/ProductImage/13-162-130-04.png', spec: 'AM5 · DDR5 · mATX · value' },
    { id: 'mb-b550m-ds3h',  name: 'Gigabyte B550M DS3H',           price: 89,  socket: 'AM4', chipset: 'AMD B550', mem: 'DDR4', ramSlots: 4, form: 'Micro-ATX', m2: 1, pcie: '4.0', wifi: false, legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/13-145-210-V80.jpg', spec: 'AM4 · DDR4 · mATX · budget' },
    { id: 'mb-b450m-pro4',  name: 'ASRock B450M Pro4',             price: 75,  socket: 'AM4', chipset: 'AMD B450', mem: 'DDR4', ramSlots: 4, form: 'Micro-ATX', m2: 1, pcie: '3.0', wifi: false, legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/13-157-843-V80.jpg', spec: 'AM4 · DDR4 · mATX · legacy budget' },
  ],

  /* ----------------------------------------------------------- RAM ----- */
  // NOTE: Memory prices reflect the (worsening) 2026 global DRAM shortage — AI/HBM
  // demand pushed DDR5 kits to roughly 2.5–3.5× their 2024 lows (32GB DDR5-6000 now
  // ~€350). DDR4 is EOL and also elevated. All flagged with `shortage: true`.
  ram: [
    { id: 'ram-ddr5-16-6000', name: 'Corsair Vengeance 16GB DDR5-6000',       price: 239, mem: 'DDR5', size: 16, modules: '2 × 8GB',  speed: 6000, cl: 30, voltage: 1.35, shortage: true, img: 'https://c1.neweggimages.com/productimage/nb640/20-236-888-01.jpg', spec: '2×8GB · 6000MT/s · CL30 · entry' },
    { id: 'ram-ddr5-32-6000', name: 'G.Skill Trident Z5 32GB DDR5-6000',      price: 369, mem: 'DDR5', size: 32, modules: '2 × 16GB', speed: 6000, cl: 30, voltage: 1.35, shortage: true, img: 'https://c1.neweggimages.com/productimage/nb640/20-374-351-09.png', spec: '2×16GB · 6000MT/s · CL30 · AM5 sweet spot' },
    { id: 'ram-ddr5-32-6400', name: 'Kingston Fury Beast 32GB DDR5-6400',     price: 399, mem: 'DDR5', size: 32, modules: '2 × 16GB', speed: 6400, cl: 32, voltage: 1.40, shortage: true, img: 'https://c1.neweggimages.com/productimage/nb640/20-242-737-02.jpg', spec: '2×16GB · 6400MT/s · CL32' },
    { id: 'ram-ddr5-32-8000', name: 'G.Skill Trident Z5 RGB 32GB DDR5-8000',  price: 459, mem: 'DDR5', size: 32, modules: '2 × 16GB', speed: 8000, cl: 38, voltage: 1.45, shortage: true, img: 'https://c1.neweggimages.com/productimage/nb640/20-374-351-09.png', spec: '2×16GB · 8000MT/s · CL38 · Arrow Lake / high-OC' },
    { id: 'ram-ddr5-48-6000', name: 'Corsair Vengeance 48GB DDR5-6000',       price: 459, mem: 'DDR5', size: 48, modules: '2 × 24GB', speed: 6000, cl: 30, voltage: 1.35, shortage: true, img: 'https://c1.neweggimages.com/productimage/nb640/20-236-888-01.jpg', spec: '2×24GB · 6000MT/s · CL30 · extra headroom' },
    { id: 'ram-ddr5-64-6000', name: 'Corsair Vengeance 64GB DDR5-6000',       price: 629, mem: 'DDR5', size: 64, modules: '2 × 32GB', speed: 6000, cl: 30, voltage: 1.35, shortage: true, img: 'https://c1.neweggimages.com/productimage/nb640/20-236-888-01.jpg', spec: '2×32GB · 6000MT/s · heavy multitask' },
    { id: 'ram-ddr5-96-6000', name: 'G.Skill Trident Z5 96GB DDR5-6000',      price: 699, mem: 'DDR5', size: 96, modules: '2 × 48GB', speed: 6000, cl: 30, voltage: 1.40, shortage: true, img: 'https://c1.neweggimages.com/productimage/nb640/20-374-351-09.png', spec: '2×48GB · 6000MT/s · creators & workstation' },
    { id: 'ram-ddr5-32-6000-cru', name: 'Crucial Pro OC 32GB DDR5-6000',        price: 349, mem: 'DDR5', size: 32, modules: '2 × 16GB', speed: 6000, cl: 36, voltage: 1.35, shortage: true, img: 'https://c1.neweggimages.com/productimage/nb640/20-156-394-12.jpg', spec: '2×16GB · 6000MT/s · CL36 · value OC' },
    { id: 'ram-ddr5-32-6000-tf',  name: 'Team T-Force Delta RGB 32GB DDR5-6000', price: 339, mem: 'DDR5', size: 32, modules: '2 × 16GB', speed: 6000, cl: 30, voltage: 1.35, shortage: true, img: 'https://c1.neweggimages.com/productimage/nb640/20-331-923-02.jpg', spec: '2×16GB · 6000MT/s · CL30 · RGB' },
    { id: 'ram-ddr5-32-6400-dom', name: 'Corsair Dominator Platinum RGB 32GB DDR5-6400', price: 449, mem: 'DDR5', size: 32, modules: '2 × 16GB', speed: 6400, cl: 32, voltage: 1.40, shortage: true, img: 'https://c1.neweggimages.com/productimage/nb640/20-236-946-02.png', spec: '2×16GB · 6400MT/s · CL32 · premium RGB' },
    { id: 'ram-ddr4-16-3600', name: 'Corsair Vengeance LPX 16GB DDR4',        price: 109,  mem: 'DDR4', size: 16, modules: '2 × 8GB',  speed: 3600, cl: 18, voltage: 1.35, shortage: true, legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/20-233-859-V03.jpg', spec: '2×8GB · 3600MT/s · CL18 · legacy AM4/LGA1700' },
    { id: 'ram-ddr4-32-3600', name: 'G.Skill Ripjaws V 32GB DDR4-3600',       price: 199, mem: 'DDR4', size: 32, modules: '2 × 16GB', speed: 3600, cl: 16, voltage: 1.35, shortage: true, legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/20-232-907-03.jpg', spec: '2×16GB · 3600MT/s · CL16 · legacy' },
  ],

  /* ----------------------------------------------------------- GPUs ---- */
  /* Current gen: NVIDIA RTX 50 (Blackwell, GDDR7, DLSS 4) · AMD RX 9000 (RDNA 4,
     FSR 4) · Intel Arc B-series (Battlemage). Last-gen cards (RTX 40/30, RX 7000/
     6000) are kept below with `legacy: true` — still buyable, harder to find.
     `perf` = relative gaming index (RTX 5090 = 100) feeding the build perf estimate. */
  gpu: [
    { id: 'gpu-rtx5060',   name: 'NVIDIA RTX 5060 8GB',        price: 319, brand: 'NVIDIA', vram: 8,  vramType: 'GDDR7', bus: 128, boost: 2497, tdp: 145, length: 200, psu_min: 450, power_conn: '1× 8-pin',            perf: 30,  img: 'https://c1.neweggimages.com/productimage/nb640/14-126-801-12.png', spec: '1080p high refresh · DLSS 4' },
    { id: 'gpu-rtx5060ti', name: 'NVIDIA RTX 5060 Ti 16GB',    price: 459, brand: 'NVIDIA', vram: 16, vramType: 'GDDR7', bus: 128, boost: 2572, tdp: 180, length: 200, psu_min: 550, power_conn: '1× 8-pin',            perf: 37,  img: 'https://c1.neweggimages.com/productimage/nb640/14-126-799-01.png', spec: '1080p/1440p · 16GB · DLSS 4' },
    { id: 'gpu-rtx5070',   name: 'NVIDIA RTX 5070 12GB',       price: 599, brand: 'NVIDIA', vram: 12, vramType: 'GDDR7', bus: 192, boost: 2512, tdp: 250, length: 242, psu_min: 650, power_conn: '1× 16-pin (12V-2×6)', perf: 52,  img: 'https://c1.neweggimages.com/productimage/nb640/14-126-761-01.png', spec: '1440p ultra · DLSS 4 MFG' },
    { id: 'gpu-rtx5070ti', name: 'NVIDIA RTX 5070 Ti 16GB',    price: 899, brand: 'NVIDIA', vram: 16, vramType: 'GDDR7', bus: 256, boost: 2452, tdp: 300, length: 300, psu_min: 750, power_conn: '1× 16-pin (12V-2×6)', perf: 66,  img: 'https://c1.neweggimages.com/productimage/nb640/14-126-756-12.png', spec: '1440p/4K · 16GB' },
    { id: 'gpu-rtx5080',   name: 'NVIDIA RTX 5080 16GB',       price: 1189,brand: 'NVIDIA', vram: 16, vramType: 'GDDR7', bus: 256, boost: 2617, tdp: 360, length: 304, psu_min: 850, power_conn: '1× 16-pin (12V-2×6)', perf: 78,  img: 'https://c1.neweggimages.com/productimage/nb640/14-932-755-05.png', spec: '4K high refresh' },
    { id: 'gpu-rtx5090',   name: 'NVIDIA RTX 5090 32GB',       price: 2199,brand: 'NVIDIA', vram: 32, vramType: 'GDDR7', bus: 512, boost: 2407, tdp: 575, length: 304, psu_min: 1000,power_conn: '1× 16-pin (12V-2×6)', perf: 100, img: 'https://c1.neweggimages.com/productimage/nb640/14-932-762-14.jpg', spec: '4K/8K halo · 32GB · colossal' },
    { id: 'gpu-rx9060xt',  name: 'AMD Radeon RX 9060 XT 16GB', price: 389, brand: 'AMD',    vram: 16, vramType: 'GDDR6', bus: 128, boost: 3130, tdp: 160, length: 245, psu_min: 500, power_conn: '1× 8-pin',            perf: 40,  img: 'https://c1.neweggimages.com/productimage/nb640/14-126-804-02.png', spec: '1080p/1440p · 16GB value' },
    { id: 'gpu-rx9070',    name: 'AMD Radeon RX 9070 16GB',    price: 629, brand: 'AMD',    vram: 16, vramType: 'GDDR6', bus: 256, boost: 2520, tdp: 220, length: 290, psu_min: 650, power_conn: '2× 8-pin',            perf: 58,  img: 'https://c1.neweggimages.com/productimage/nb640/14-131-874-01.png', spec: '1440p ultra · efficient · 16GB' },
    { id: 'gpu-rx9070xt',  name: 'AMD Radeon RX 9070 XT 16GB', price: 689, brand: 'AMD',    vram: 16, vramType: 'GDDR6', bus: 256, boost: 2970, tdp: 304, length: 290, psu_min: 750, power_conn: '2× 8-pin',            perf: 70,  img: 'https://c1.neweggimages.com/productimage/nb640/14-202-450-01.png', spec: '1440p/4K raster · 16GB' },
    { id: 'gpu-arc-b580',  name: 'Intel Arc B580 12GB',        price: 279, brand: 'Intel',  vram: 12, vramType: 'GDDR6', bus: 192, boost: 2670, tdp: 190, length: 272, psu_min: 500, power_conn: '1× 8-pin',            perf: 32,  img: 'https://c1.neweggimages.com/productimage/nb640/14-883-006-16.png', spec: '1440p value · 12GB' },
    { id: 'gpu-arc-b570',  name: 'Intel Arc B570 10GB',        price: 239, brand: 'Intel',  vram: 10, vramType: 'GDDR6', bus: 160, boost: 2500, tdp: 150, length: 245, psu_min: 450, power_conn: '1× 8-pin',            perf: 26,  img: 'https://c1.neweggimages.com/productimage/nb640/14-993-014-01.png', spec: '1080p value · 10GB' },

    /* ---- Previous generation — still sold, availability thinning ---- */
    { id: 'gpu-rtx4090',   name: 'NVIDIA RTX 4090 24GB',       price: 2299,brand: 'NVIDIA', vram: 24, vramType: 'GDDR6X', bus: 384, boost: 2520, tdp: 450, length: 358, psu_min: 850, power_conn: '1× 16-pin (12VHPWR)', perf: 90,  legacy: true, img: 'https://dlcdnwebimgs.asus.com/gain/EFF9D6D8-2F6C-4E76-989F-E5DB594052BA/w1000/h732', spec: 'Ada flagship · 24GB · still a 4K monster' },
    { id: 'gpu-rtx4080',   name: 'NVIDIA RTX 4080 16GB',       price: 1149, brand: 'NVIDIA', vram: 16, vramType: 'GDDR6X', bus: 256, boost: 2505, tdp: 320, length: 336, psu_min: 750, power_conn: '1× 16-pin (12VHPWR)', perf: 72,  legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/14-137-766-01.jpg', spec: '4K high refresh · Ada' },
    { id: 'gpu-rtx4070ti', name: 'NVIDIA RTX 4070 Ti 12GB',    price: 799, brand: 'NVIDIA', vram: 12, vramType: 'GDDR6X', bus: 192, boost: 2610, tdp: 285, length: 305, psu_min: 700, power_conn: '2× 8-pin',            perf: 60,  legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/14-500-545-10.jpg', spec: '1440p/4K · Ada' },
    { id: 'gpu-rtx4070s',  name: 'NVIDIA RTX 4070 Super 12GB',  price: 629, brand: 'NVIDIA', vram: 12, vramType: 'GDDR6X', bus: 192, boost: 2475, tdp: 220, length: 280, psu_min: 650, power_conn: '2× 8-pin',            perf: 56,  legacy: true, img: 'https://www.palit.biz/product/vga/picture/p05087/p05087_propng_441658b99047a113.png', spec: '1440p ultra · Ada' },
    { id: 'gpu-rtx4070',   name: 'NVIDIA RTX 4070 12GB',       price: 559, brand: 'NVIDIA', vram: 12, vramType: 'GDDR6X', bus: 192, boost: 2475, tdp: 200, length: 267, psu_min: 650, power_conn: '1× 16-pin (12VHPWR)', perf: 48,  legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/14-932-610-V01.jpg', spec: '1440p · efficient Ada' },
    { id: 'gpu-rtx4060ti', name: 'NVIDIA RTX 4060 Ti 16GB',    price: 429, brand: 'NVIDIA', vram: 16, vramType: 'GDDR6',  bus: 128, boost: 2535, tdp: 165, length: 245, psu_min: 550, power_conn: '1× 8-pin',            perf: 36,  legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/14-133-857-01.jpg', spec: '1080p/1440p · 16GB' },
    { id: 'gpu-rtx4060',   name: 'NVIDIA RTX 4060 8GB',        price: 319, brand: 'NVIDIA', vram: 8,  vramType: 'GDDR6',  bus: 128, boost: 2460, tdp: 115, length: 200, psu_min: 450, power_conn: '1× 8-pin',            perf: 28,  legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/14-932-630-17.jpg', spec: '1080p high refresh · efficient' },
    { id: 'gpu-rtx3060',   name: 'NVIDIA RTX 3060 12GB',       price: 279, brand: 'NVIDIA', vram: 12, vramType: 'GDDR6',  bus: 192, boost: 1777, tdp: 170, length: 242, psu_min: 550, power_conn: '1× 8-pin',            perf: 20,  legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/14-137-632-03.jpg', spec: '1080p · Ampere · 12GB budget' },
    { id: 'gpu-rx7900xtx', name: 'AMD Radeon RX 7900 XTX 24GB', price: 949, brand: 'AMD',   vram: 24, vramType: 'GDDR6',  bus: 384, boost: 2500, tdp: 355, length: 287, psu_min: 800, power_conn: '2× 8-pin',            perf: 78,  legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/BP4YS2503080JGQRHDC.jpg', spec: '4K · 24GB RDNA 3 raster monster' },
    { id: 'gpu-rx7800xt',  name: 'AMD Radeon RX 7800 XT 16GB', price: 519, brand: 'AMD',    vram: 16, vramType: 'GDDR6',  bus: 256, boost: 2430, tdp: 263, length: 267, psu_min: 700, power_conn: '2× 8-pin',            perf: 50,  legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/14-930-104-05.jpg', spec: '1440p ultra · 16GB' },
    { id: 'gpu-rx7600',    name: 'AMD Radeon RX 7600 8GB',     price: 269, brand: 'AMD',    vram: 8,  vramType: 'GDDR6',  bus: 128, boost: 2655, tdp: 165, length: 204, psu_min: 450, power_conn: '1× 8-pin',            perf: 27,  legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/14-150-879-04.jpg', spec: '1080p value · RDNA 3' },
    { id: 'gpu-rx6800xt',  name: 'AMD Radeon RX 6800 XT 16GB', price: 439, brand: 'AMD',    vram: 16, vramType: 'GDDR6',  bus: 256, boost: 2250, tdp: 300, length: 267, psu_min: 750, power_conn: '2× 8-pin',            perf: 45,  legacy: true, img: 'https://c1.neweggimages.com/productimage/nb640/14-131-767-01.jpg', spec: '1440p/4K · RDNA 2 · 16GB' },
  ],

  /* -------------------------------------------------------- Storage ---- */
  storage: [
    { id: 'ssd-1tb-g4',  name: 'Samsung 990 EVO 1TB NVMe',     price: 149,  iface: 'M.2', form: 'M.2 2280', tech: 'NVMe SSD', pcie: 'PCIe 4.0 ×4', size: 1000, read: 5000,  write: 4200,  img: 'https://c1.neweggimages.com/productimage/nb640/20-147-861-02.jpg', spec: 'PCIe 4.0 · ~5000MB/s' },
    { id: 'ssd-2tb-g4',  name: 'WD Black SN770 2TB NVMe',      price: 259, iface: 'M.2', form: 'M.2 2280', tech: 'NVMe SSD', pcie: 'PCIe 4.0 ×4', size: 2000, read: 5150,  write: 4850,  img: 'https://c1.neweggimages.com/productimage/nb640/20-250-247-02.jpg', spec: 'PCIe 4.0 · 2TB' },
    { id: 'ssd-2tb-g5',  name: 'Crucial T705 2TB PCIe 5.0',   price: 399, iface: 'M.2', form: 'M.2 2280', tech: 'NVMe SSD', pcie: 'PCIe 5.0 ×4', size: 2000, read: 14100, write: 12600, img: 'https://c1.neweggimages.com/productimage/nb640/20-156-401-01.png', spec: 'PCIe 5.0 · ~14000MB/s' },
    { id: 'ssd-4tb-g4',  name: 'Samsung 990 Pro 4TB',         price: 649, iface: 'M.2', form: 'M.2 2280', tech: 'NVMe SSD', pcie: 'PCIe 4.0 ×4', size: 4000, read: 7450,  write: 6900,  img: 'https://c1.neweggimages.com/productimage/nb640/20-147-861-02.jpg', spec: 'PCIe 4.0 · 4TB workhorse' },
    { id: 'ssd-2tb-kc3000',name: 'Kingston KC3000 2TB NVMe',      price: 279, iface: 'M.2', form: 'M.2 2280', tech: 'NVMe SSD', pcie: 'PCIe 4.0 ×4', size: 2000, read: 7000, write: 7000, img: 'https://c1.neweggimages.com/productimage/nb640/20-242-660-S01.jpg', spec: 'PCIe 4.0 · ~7000MB/s · 2TB' },
    { id: 'ssd-sata-1tb',name: 'Crucial MX500 1TB SATA',      price: 109,  iface: 'SATA', form: '2.5-inch', tech: 'SATA SSD', pcie: 'SATA III 6Gb/s', size: 1000, read: 560, write: 510, img: 'https://c1.neweggimages.com/productimage/nb640/20-156-175-V02.jpg', spec: '2.5" SATA · universal' },
    { id: 'hdd-4tb',     name: 'Seagate BarraCuda 4TB HDD',   price: 105,  iface: 'SATA', form: '3.5-inch', tech: 'Hard drive · 5400 RPM', pcie: 'SATA III 6Gb/s', size: 4000, read: 190, write: 190, img: 'https://c1.neweggimages.com/productimage/nb640/22-179-299-V01.jpg', spec: '3.5" HDD · bulk storage' },
  ],

  /* --------------------------------------------------- Power supply ---- */
  psu: [
    { id: 'psu-550',  name: 'Corsair RM550e 550W',        price: 79,  watt: 550,  rating: 'Gold',   form: 'ATX', modular: 'Fully modular', fan: '120mm', atx3: true,  power_conn: '2× PCIe 8-pin', img: 'https://c1.neweggimages.com/productimage/nb640/17-139-141-02.jpg', spec: '550W · 80+ Gold · fully modular' },
    { id: 'psu-650',  name: 'be quiet! Pure Power 12 M 650W', price: 89, watt: 650, rating: 'Gold', form: 'ATX', modular: 'Fully modular', fan: '120mm', atx3: true,  power_conn: '1× 12V-2×6 (600W)', img: 'https://c1.neweggimages.com/productimage/nb640/A68VS23012718I6GQ22.jpg', spec: '650W · 80+ Gold' },
    { id: 'psu-750',  name: 'Corsair RM750e 750W',        price: 109, watt: 750,  rating: 'Gold',   form: 'ATX', modular: 'Fully modular', fan: '120mm', atx3: true,  power_conn: '1× 12VHPWR (16-pin)', img: 'https://c1.neweggimages.com/productimage/nb640/17-139-141-02.jpg', spec: '750W · 80+ Gold · PCIe 5.0' },
    { id: 'psu-850',  name: 'Seasonic Focus GX 850W',     price: 139, watt: 850,  rating: 'Gold',   form: 'ATX', modular: 'Fully modular', fan: '120mm', atx3: true,  power_conn: '1× 12VHPWR (16-pin)', img: 'https://c1.neweggimages.com/productimage/nb640/17-151-187-V24.jpg', spec: '850W · 80+ Gold · 12VHPWR' },
    { id: 'psu-1000', name: 'Corsair RM1000x 1000W',      price: 189, watt: 1000, rating: 'Gold',   form: 'ATX', modular: 'Fully modular', fan: '135mm', atx3: true,  power_conn: '1× 12VHPWR (16-pin)', img: 'https://c1.neweggimages.com/productimage/nb640/17-139-141-02.jpg', spec: '1000W · 80+ Gold · big GPU ready' },
    { id: 'psu-1200', name: 'be quiet! Dark Power 13 1200W', price: 269, watt: 1200, rating: 'Platinum', form: 'ATX', modular: 'Fully modular', fan: '135mm', atx3: true, power_conn: '1× 12VHPWR (16-pin)', img: 'https://c1.neweggimages.com/productimage/nb640/A68VS2305100XB4ALC9.jpg', spec: '1200W · 80+ Platinum · headroom' },
    { id: 'psu-evga-850', name: 'EVGA SuperNOVA 850 G6',      price: 149, watt: 850,  rating: 'Gold',   form: 'ATX', modular: 'Fully modular', fan: '135mm', atx3: false, power_conn: '3× PCIe 8-pin', img: 'https://c1.neweggimages.com/productimage/nb640/A73MS2109160FD50.jpg', spec: '850W · 80+ Gold · quiet & compact' },
    { id: 'psu-sfx-750',name:'Corsair SF750 SFX 750W',    price: 159, watt: 750,  rating: 'Platinum',form: 'SFX', modular: 'Fully modular', fan: '92mm',  atx3: true,  power_conn: '1× 12VHPWR (16-pin)', img: 'https://c1.neweggimages.com/productimage/nb640/17-139-080-Z01.jpg', spec: '750W · SFX · for Mini-ITX' },
  ],

  /* ---------------------------------------------------------- Cases ---- */
  case: [
    { id: 'case-o11',    name: 'Lian Li O11 Dynamic EVO',  price: 159, form: 'ATX',      gpu_max: 422, cooler_max: 167, psu_form: 'ATX', radiator: 'Up to 360mm (top/side/bottom)', img: 'https://c1.neweggimages.com/productimage/nb640/AFSTS211210EFjho.jpg', spec: 'ATX · dual-chamber · glass showcase' },
    { id: 'case-4000d',  name: 'Corsair 4000D Airflow',    price: 99,  form: 'ATX',      gpu_max: 360, cooler_max: 170, psu_form: 'ATX', radiator: 'Up to 360mm (front)', img: 'https://c1.neweggimages.com/productimage/nb640/11-139-230-23.png', spec: 'ATX · superb airflow · value' },
    { id: 'case-pop',    name: 'Fractal Pop Air',          price: 89,  form: 'ATX',      gpu_max: 405, cooler_max: 170, psu_form: 'ATX', radiator: 'Up to 360mm (front)', img: 'https://c1.neweggimages.com/productimage/nb640/11-352-168-V01.jpg', spec: 'ATX · mesh front · colourful' },
    { id: 'case-north',  name: 'Fractal North',            price: 139, form: 'ATX',      gpu_max: 355, cooler_max: 170, psu_form: 'ATX', radiator: 'Up to 360mm (front)', img: 'https://c1.neweggimages.com/productimage/nb640/11-352-203-V01.jpg', spec: 'ATX · walnut + mesh · gorgeous' },
    { id: 'case-meshify',name: 'Fractal Meshify 2 Compact',price: 119, form: 'ATX',      gpu_max: 360, cooler_max: 169, psu_form: 'ATX', radiator: 'Up to 360mm (front)', img: 'https://c1.neweggimages.com/productimage/nb640/11-352-131-07.jpg', spec: 'ATX · compact tower' },
    { id: 'case-m+atx',  name: 'NZXT H510 Flow (mATX)',    price: 79,  form: 'Micro-ATX', gpu_max: 360, cooler_max: 165, psu_form: 'ATX', radiator: 'Up to 280mm (front)', img: 'https://c1.neweggimages.com/productimage/nb640/2AM-000T-001M2-15.jpg', spec: 'Micro-ATX · clean build' },
    { id: 'case-a4h2o',  name: 'Lian Li A4-H2O (ITX)',     price: 129, form: 'Mini-ITX',  gpu_max: 322, cooler_max: 70,  psu_form: 'SFX', radiator: 'Up to 240mm (side)', img: 'https://c1.neweggimages.com/productimage/nb640/AFSTS2601160IL7HO75.jpg', spec: 'Mini-ITX · tiny · SFX PSU only' },
    { id: 'case-ncore',  name: 'NR200P MAX (ITX)',         price: 149, form: 'Mini-ITX',  gpu_max: 336, cooler_max: 67,  psu_form: 'SFX', radiator: '280mm AIO included', img: 'https://www.bhphotovideo.com/images/images500x500/cooler_master_nr200p_mcnn85_slo_masterbox_nr200p_max_mini_itx_1672132226_1689128.jpg', spec: 'Mini-ITX · AIO included class' },
    { id: 'case-h210i',  name: 'NZXT H210i (ITX)',          price: 109, form: 'Mini-ITX',  gpu_max: 325, cooler_max: 165, psu_form: 'ATX', radiator: 'Up to 240mm (front)', img: 'https://c1.neweggimages.com/productimage/nb640/11-146-314-V80.jpg', spec: 'Mini-ITX · takes an ATX PSU · clean' },

    /* ---- ATX mid-towers ---- */
    { id: 'case-5000d',      name: 'Corsair 5000D Airflow',        price: 149, form: 'ATX', gpu_max: 400, cooler_max: 170, psu_form: 'ATX', radiator: 'Up to 360mm (front/top)',        img: 'https://www.bhphotovideo.com/images/fb/corsair_cc_9011210_ww_5000d_airflow_tempered_glass_1723203.jpg', spec: 'ATX · high airflow · very roomy' },
    { id: 'case-4000x',      name: 'Corsair iCUE 4000X RGB',       price: 119, form: 'ATX', gpu_max: 360, cooler_max: 170, psu_form: 'ATX', radiator: 'Up to 360mm (front)',            img: 'https://c1.neweggimages.com/productimage/nb640/A1K6S2410190K1NG832.jpg', spec: 'ATX · RGB · tempered glass' },
    { id: 'case-lancool216', name: 'Lian Li Lancool 216',          price: 109, form: 'ATX', gpu_max: 392, cooler_max: 176, psu_form: 'ATX', radiator: 'Up to 360mm (front/top)',        img: 'https://c1.neweggimages.com/productimage/nb640/AFSTS2211290K0K668D.jpg', spec: 'ATX · dual 160mm intake · airflow' },
    { id: 'case-lancool3',   name: 'Lian Li Lancool III',          price: 159, form: 'ATX', gpu_max: 435, cooler_max: 187, psu_form: 'ATX', radiator: 'Up to 420mm (front/top)',        img: 'https://c1.neweggimages.com/productimage/nb640/AFSTS220706fXCst.jpg', spec: 'ATX · huge · dual 420mm radiator' },
    { id: 'case-o11vision',  name: 'Lian Li O11 Vision',           price: 179, form: 'ATX', gpu_max: 452, cooler_max: 167, psu_form: 'ATX', radiator: 'Up to 360mm (top/side/bottom)',   img: 'https://c1.neweggimages.com/productimage/nb640/mh2h_1136019b-a90b-4892-ad08-87cb368e1f2c.jpg', spec: 'ATX · three-sided seamless glass' },
    { id: 'case-o11mini',    name: 'Lian Li O11 Dynamic Mini',     price: 129, form: 'ATX', gpu_max: 362, cooler_max: 170, psu_form: 'ATX', radiator: 'Up to 360mm (side/top)',         img: 'https://c1.neweggimages.com/productimage/nb640/AFSTS2508070L1NER7F.jpg', spec: 'ATX · compact dual-chamber' },
    { id: 'case-h7flow',     name: 'NZXT H7 Flow',                 price: 129, form: 'ATX', gpu_max: 400, cooler_max: 185, psu_form: 'ATX', radiator: 'Up to 360mm (front/top)',        img: 'https://c1.neweggimages.com/productimage/nb640/11-146-361-04.jpg', spec: 'ATX · perforated panels · airflow' },
    { id: 'case-h9flow',     name: 'NZXT H9 Flow',                 price: 159, form: 'ATX', gpu_max: 435, cooler_max: 165, psu_form: 'ATX', radiator: 'Up to 360mm (top/side)',         img: 'https://c1.neweggimages.com/productimage/nb640/11-146-370-11.jpg', spec: 'ATX · dual-chamber · panoramic glass' },
    { id: 'case-torrent',    name: 'Fractal Torrent',              price: 199, form: 'ATX', gpu_max: 461, cooler_max: 188, psu_form: 'ATX', radiator: 'Up to 420mm (front/bottom)',     img: 'https://c1.neweggimages.com/productimage/nb640/11-352-143-01.jpg', spec: 'ATX · max airflow · dual 180mm' },
    { id: 'case-pb500dx',    name: 'be quiet! Pure Base 500DX',    price: 99,  form: 'ATX', gpu_max: 369, cooler_max: 190, psu_form: 'ATX', radiator: 'Up to 360mm (front)',            img: 'https://c1.neweggimages.com/productimage/nb640/2AM-0037-00071-01.jpg', spec: 'ATX · quiet · tall cooler clearance' },
    { id: 'case-g360a',      name: 'Phanteks Eclipse G360A',       price: 99,  form: 'ATX', gpu_max: 400, cooler_max: 162, psu_form: 'ATX', radiator: 'Up to 360mm (front/top)',        img: 'https://www.gigaparts.com/media/catalog/product/cache/5a6165e5f2c5c330866b923e356bed71/g/3/g360a_black_01.jpg', spec: 'ATX · mesh · 3 ARGB fans' },
    { id: 'case-td500',      name: 'Cooler Master TD500 Mesh V2',  price: 99,  form: 'ATX', gpu_max: 410, cooler_max: 165, psu_form: 'ATX', radiator: 'Up to 360mm (front)',            img: 'https://c1.neweggimages.com/productimage/nb640/11-119-442-01.png', spec: 'ATX · mesh · crystalline front' },
    { id: 'case-y60',        name: 'HYTE Y60',                     price: 199, form: 'ATX', gpu_max: 375, cooler_max: 165, psu_form: 'ATX', radiator: 'Up to 360mm (side/top)',         img: 'https://c1.neweggimages.com/productimage/nb640/11-737-002-16.jpg', spec: 'ATX · panoramic · vertical GPU' },
    { id: 'case-gt502',      name: 'ASUS TUF Gaming GT502',        price: 159, form: 'ATX', gpu_max: 400, cooler_max: 162, psu_form: 'ATX', radiator: 'Up to 360mm (side/top)',         img: 'https://www.bhphotovideo.com/images/fb/asus_gt502_blk_tg_tuf_gaming_gt502_atx_1743293.jpg', spec: 'ATX · dual-chamber showcase' },
    { id: 'case-skytwo',     name: 'Montech Sky Two',              price: 89,  form: 'ATX', gpu_max: 380, cooler_max: 175, psu_form: 'ATX', radiator: 'Up to 360mm (front/top)',        img: 'https://c1.neweggimages.com/productimage/nb640/AK91S23062908J5FI5B.jpg', spec: 'ATX · value · 4 fans included' },

    /* ---- Full towers ---- */
    { id: 'case-define7',    name: 'Fractal Define 7',             price: 179, form: 'ATX', gpu_max: 467, cooler_max: 185, psu_form: 'ATX', radiator: 'Up to 420mm (front)',            img: 'https://c1.neweggimages.com/productimage/nb640/11-352-111-V21.jpg', spec: 'Full tower · silent · sound-damped' },
    { id: 'case-haf700',     name: 'Cooler Master HAF 700',        price: 269, form: 'ATX', gpu_max: 490, cooler_max: 166, psu_form: 'ATX', radiator: 'Up to 420mm (front)',            img: 'https://c1.neweggimages.com/productimage/nb640/11-119-437-V01.jpg', spec: 'Full tower · monster airflow' },
    { id: 'case-nv7',        name: 'Phanteks NV7',                 price: 209, form: 'ATX', gpu_max: 503, cooler_max: 185, psu_form: 'ATX', radiator: 'Up to 480mm',                    img: 'https://c1.neweggimages.com/productimage/nb640/11-854-122-01.jpg', spec: 'Full tower · showcase · massive' },

    /* ---- Micro-ATX ---- */
    { id: 'case-ap201',      name: 'ASUS Prime AP201',             price: 89,  form: 'Micro-ATX', gpu_max: 338, cooler_max: 170, psu_form: 'ATX', radiator: 'Up to 360mm (side)',       img: 'https://c1.neweggimages.com/productimage/nb640/A4RES22061007RXFU34.jpg', spec: 'Micro-ATX · compact mesh' },
    { id: 'case-q300l',      name: 'Cooler Master Q300L',          price: 49,  form: 'Micro-ATX', gpu_max: 360, cooler_max: 159, psu_form: 'ATX', radiator: 'Up to 240mm (top)',        img: 'https://c1.neweggimages.com/productimage/nb640/11-119-444-01.png', spec: 'Micro-ATX · budget · tiny' },

    /* ---- Mini-ITX / SFF ---- */
    { id: 'case-nr200p',     name: 'Cooler Master NR200P',         price: 99,  form: 'Mini-ITX', gpu_max: 330, cooler_max: 155, psu_form: 'SFX', radiator: 'Up to 280mm (side)',        img: 'https://c1.neweggimages.com/productimage/nb640/11-119-450-24.png', spec: 'Mini-ITX · SFF classic · air or AIO' },
    { id: 'case-q58',        name: 'Lian Li Q58',                  price: 139, form: 'Mini-ITX', gpu_max: 320, cooler_max: 67,  psu_form: 'SFX', radiator: 'Up to 280mm (side)',        img: 'https://c1.neweggimages.com/productimage/nb640/AFSTS210831xpfgx.jpg', spec: 'Mini-ITX · 14.6L · PCIe riser' },
    { id: 'case-meshlicious',name: 'SSUPD Meshlicious',            price: 129, form: 'Mini-ITX', gpu_max: 336, cooler_max: 73,  psu_form: 'SFX', radiator: 'Up to 280mm (side)',        img: 'https://ssupd.co/cdn/shop/products/oe759_B_Black.285.png', spec: 'Mini-ITX · full-mesh SFF' },
    { id: 'case-terra',      name: 'Fractal Terra',                price: 169, form: 'Mini-ITX', gpu_max: 322, cooler_max: 77,  psu_form: 'SFX', radiator: 'Air-cooled (10.4L)',         img: 'https://c1.neweggimages.com/productimage/nb640/11-352-212-21.jpg', spec: 'Mini-ITX · wood front · pocket SFF' },
  ],

  /* -------------------------------------------------------- Coolers ---- */
  cooler: [
    { id: 'cool-stock',   name: 'Stock air cooler',           price: 0,   type: 'air', height: 70,  rad: 0,   fans: '1× 92mm',  sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 105, spec: 'Bundled with some CPUs · quiet enough' },
    { id: 'cool-ak620',   name: 'DeepCool AK620 (air)',       price: 59,  type: 'air', height: 160, rad: 0,   fans: '2× 120mm', sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 260, img: 'https://c1.neweggimages.com/productimage/nb640/A4RES2308100G4PPN92.jpg', spec: 'Dual-tower air · handles anything' },
    { id: 'cool-pa120',   name: 'Thermalright Peerless 120',  price: 39,  type: 'air', height: 155, rad: 0,   fans: '2× 120mm', sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 245, img: 'https://c1.neweggimages.com/ProductImage/BVHXS24052407KAKNB6.jpg', spec: 'Air · legendary value' },
    { id: 'cool-nh-l9',   name: 'Noctua NH-L9 (low profile)', price: 49,  type: 'air', height: 37,  rad: 0,   fans: '1× 92mm',  sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 95,  img: 'https://c1.neweggimages.com/productimage/nb640/AADYS2201278BTh8.jpg', spec: 'Low profile · fits tiny cases' },
    { id: 'cool-aio240',  name: 'Arctic Liquid Freezer 240',  price: 79,  type: 'aio', height: 0,   rad: 240, fans: '2× 120mm', sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 280, img: 'https://c1.neweggimages.com/productimage/nb640/AKDZD210430REOOG.jpg', spec: '240mm AIO · cool & quiet' },
    { id: 'cool-aio360',  name: 'Arctic Liquid Freezer 360',  price: 99,  type: 'aio', height: 0,   rad: 360, fans: '3× 120mm', sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 350, img: 'https://c1.neweggimages.com/productimage/nb640/B11ND2206220ITVNM86.jpg', spec: '360mm AIO · best-in-class' },
    { id: 'cool-aio280',  name: 'NZXT Kraken 280 RGB',        price: 149, type: 'aio', height: 0,   rad: 280, fans: '2× 140mm', sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 300, img: 'https://c1.neweggimages.com/productimage/nb640/35-146-124-01.jpg', spec: '280mm AIO · LCD pump' },
    { id: 'cool-nhd15',   name: 'Noctua NH-D15 (air)',         price: 109, type: 'air', height: 165, rad: 0,   fans: '2× 140mm', sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 320, img: 'https://c1.neweggimages.com/productimage/nb640/35-608-045-V03.jpg', spec: 'Dual-tower air · flagship performance' },
    { id: 'cool-h212',    name: 'Cooler Master Hyper 212 Black', price: 42, type: 'air', height: 159, rad: 0,   fans: '1× 120mm', sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 150, img: 'https://c1.neweggimages.com/productimage/nb640/35-103-364-12.png', spec: 'Single-tower air · budget staple' },
    { id: 'cool-h150i',   name: 'Corsair iCUE H150i Elite',     price: 189, type: 'aio', height: 0,   rad: 360, fans: '3× 120mm', sockets: ['AM5','AM4','LGA1700','LGA1851'], tdp_max: 320, img: 'https://c1.neweggimages.com/productimage/nb640/35-181-203-V24.jpg', spec: '360mm AIO · RGB pump' },
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

/* Multi-angle image galleries for the store-style case detail page (keyed by case id). */
const CASE_GALLERIES = {
  'case-meshify': [
    'https://c1.neweggimages.com/productimage/nb640/11-352-140-V07.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-352-140-V03.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-352-140-V11.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-352-140-V80.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-352-140-V12.jpg',
  ],
  'case-5000d': [
    'https://www.bhphotovideo.com/images/fb/corsair_cc_9011210_ww_5000d_airflow_tempered_glass_1723203.jpg',
    'https://assets.corsair.com/image/upload/c_scale%2Cq_auto/products/Cases/base-5000d-airflow/Gallery/5000D_AF_BLACK_001.webp',
  ],
  'case-4000x': [
    'https://c1.neweggimages.com/productimage/nb640/A1K6S2410190K1NG832.jpg',
    'https://c1.neweggimages.com/productimage/nb640/A1K6S2410190K1N0799.jpg',
    'https://c1.neweggimages.com/productimage/nb640/A1K6S2410190K1MY79A.jpg',
  ],
  'case-lancool216': [
    'https://c1.neweggimages.com/productimage/nb640/AFSTS2211290K0K668D.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS2406282bu4T.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS240628QTtCR.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS240628S1Ppr.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS2406281NmWa.jpg',
  ],
  'case-lancool3': [
    'https://c1.neweggimages.com/productimage/nb640/AFSTS220706fXCst.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS220706D62Ke.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS2207063Lh4v.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS220706mmodM.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS220706UYA9e.jpg',
  ],
  'case-o11vision': [
    'https://c1.neweggimages.com/productimage/nb640/mh2h_1136019b-a90b-4892-ad08-87cb368e1f2c.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS231105dvTmF.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS231105jhcAQ.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS231105GqS8x.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS231105thUVM.jpg',
  ],
  'case-o11mini': [
    'https://c1.neweggimages.com/productimage/nb640/AFSTS2508070L1NER7F.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS2508070KZC76EC.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS2507140L7GAN92.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS2507140L7IOCBA.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS2507140L7KJZB0.jpg',
  ],
  'case-h7flow': [
    'https://c1.neweggimages.com/productimage/nb640/11-146-361-04.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-146-361-01.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-146-361-06.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-146-361-11.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-146-361-03.jpg',
  ],
  'case-h9flow': [
    'https://c1.neweggimages.com/productimage/nb640/11-146-370-11.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-146-370-01.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-146-370-10.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-146-370-03.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-146-370-04.jpg',
  ],
  'case-torrent': [
    'https://c1.neweggimages.com/productimage/nb640/11-352-143-01.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-352-143-V80.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-352-143-02.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-352-143-19.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-352-143-V82.jpg',
  ],
  'case-pb500dx': [
    'https://c1.neweggimages.com/productimage/nb640/2AM-0037-00071-01.jpg',
    'https://c1.neweggimages.com/productimage/nb640/A68VS200420D3smt.jpg',
    'https://c1.neweggimages.com/productimage/nb640/A68VS2004205UJID.jpg',
    'https://c1.neweggimages.com/productimage/nb640/A68VS200420gtEAt.jpg',
    'https://c1.neweggimages.com/productimage/nb640/A68VS200420sRES6.jpg',
  ],
  'case-g360a': [
    'https://www.gigaparts.com/media/catalog/product/cache/5a6165e5f2c5c330866b923e356bed71/g/3/g360a_black_01.jpg',
  ],
  'case-td500': [
    'https://c1.neweggimages.com/productimage/nb640/11-119-442-01.png',
    'https://c1.neweggimages.com/productimage/nb640/11-119-442-02.png',
    'https://c1.neweggimages.com/productimage/nb640/11-119-442-03.png',
    'https://c1.neweggimages.com/productimage/nb640/11-119-442-04.png',
    'https://c1.neweggimages.com/productimage/nb640/11-119-442-05.png',
  ],
  'case-y60': [
    'https://c1.neweggimages.com/productimage/nb640/11-737-002-16.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-737-002-17.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-737-002-13.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-737-002-14.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-737-002-11.jpg',
  ],
  'case-gt502': [
    'https://www.bhphotovideo.com/images/fb/asus_gt502_blk_tg_tuf_gaming_gt502_atx_1743293.jpg',
    'https://productimages.microcenter.com/0662252_532390.jpg',
  ],
  'case-skytwo': [
    'https://c1.neweggimages.com/productimage/nb640/AK91S23062908J5FI5B.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AK91S230222087AZJB7.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AK91S230222086X0VCA.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AK91S230222086T9531.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AK91S23022305JXQ67E.jpg',
  ],
  'case-define7': [
    'https://c1.neweggimages.com/productimage/nb640/11-352-111-V21.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-352-111-V18.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-352-111-V83.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-352-111-V29.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-352-111-V24.jpg',
  ],
  'case-haf700': [
    'https://c1.neweggimages.com/productimage/nb640/11-119-437-V01.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-119-437-V02.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-119-437-V03.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-119-437-V04.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-119-437-V05.jpg',
  ],
  'case-nv7': [
    'https://c1.neweggimages.com/productimage/nb640/11-854-122-01.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-854-122-02.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-854-122-03.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-854-122-04.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-854-122-05.jpg',
  ],
  'case-ap201': [
    'https://c1.neweggimages.com/productimage/nb640/A4RES22061007RXFU34.jpg',
    'https://c1.neweggimages.com/productimage/nb640/A4RES22061007RX3F03.jpg',
    'https://c1.neweggimages.com/productimage/nb640/A4RES22061007RXB3B4.jpg',
    'https://c1.neweggimages.com/productimage/nb640/A4RES22061007RV0C04.jpg',
    'https://c1.neweggimages.com/productimage/nb640/A4RES22061007RXAF3B.jpg',
  ],
  'case-q300l': [
    'https://c1.neweggimages.com/productimage/nb640/11-119-444-01.png',
    'https://c1.neweggimages.com/productimage/nb640/11-119-444-02.png',
    'https://c1.neweggimages.com/productimage/nb640/11-119-444-03.png',
    'https://c1.neweggimages.com/productimage/nb640/11-119-444-04.png',
    'https://c1.neweggimages.com/productimage/nb640/11-119-444-05.png',
  ],
  'case-nr200p': [
    'https://c1.neweggimages.com/productimage/nb640/11-119-450-24.png',
    'https://c1.neweggimages.com/productimage/nb640/11-119-450-33.png',
    'https://c1.neweggimages.com/productimage/nb640/11-119-450-34.png',
    'https://c1.neweggimages.com/productimage/nb640/11-119-450-35.png',
    'https://c1.neweggimages.com/productimage/nb640/11-119-450-36.png',
  ],
  'case-q58': [
    'https://c1.neweggimages.com/productimage/nb640/AFSTS210831xpfgx.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS210831i7HGi.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS210831XQih6.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS210831RSLPX.jpg',
    'https://c1.neweggimages.com/productimage/nb640/AFSTS210831oDO00.jpg',
  ],
  'case-meshlicious': [
    'https://ssupd.co/cdn/shop/products/oe759_B_Black.285.png',
    'https://ssupd.co/cdn/shop/products/SSU-MESHLI-BK-FM-PCIE4-14-90D-6.png',
    'https://ssupd.co/cdn/shop/products/SSU-MESHLI-BK-FM-PCIE4-14-90D-1.png',
    'https://ssupd.co/cdn/shop/products/SSU-MESHLI-BK-FM-PCIE4-14-90D-2.png',
    'https://ssupd.co/cdn/shop/products/SSU-MESHLI-BK-FM-PCIE4-14-90D-4.png',
  ],
  'case-terra': [
    'https://c1.neweggimages.com/productimage/nb640/11-352-212-21.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-352-212-22.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-352-212-23.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-352-212-24.jpg',
    'https://c1.neweggimages.com/productimage/nb640/11-352-212-25.jpg',
  ],
};

if (typeof module !== 'undefined') module.exports = { CATEGORIES, PARTS, PRESETS, SOCKET_MEM, CASE_GALLERIES };
