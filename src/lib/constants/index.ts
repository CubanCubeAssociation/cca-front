import type { CATEGORY, PROVINCE, PuzzleOptions, ROLE } from "../interfaces";

export const CCA_ICON = "/cca_logo.svg";

export const ICONS: Partial<CATEGORY>[] = [
  {
    name: "2x2x2",
    scrambler: "222so",
  },
  {
    name: "3x3x3",
    scrambler: "333",
  },
  {
    name: "3x3x3 FMC",
    scrambler: "333fm",
  },
  {
    name: "3x3x3 BLD",
    scrambler: "333ni",
  },
  {
    name: "3x3x3 MBLD",
    scrambler: "333mbf",
  },
  {
    name: "3x3x3 OH",
    scrambler: "333oh",
  },
  {
    name: "4x4x4 BLD",
    scrambler: "444bld",
  },
  {
    name: "4x4x4",
    scrambler: "444wca",
  },
  {
    name: "5x5x5",
    scrambler: "555wca",
  },
  {
    name: "5x5x5 BLD",
    scrambler: "555bld",
  },
  {
    name: "6x6x6",
    scrambler: "666wca",
  },
  {
    name: "7x7x7",
    scrambler: "777wca",
  },
  {
    name: "Clock",
    scrambler: "clkwca",
  },
  {
    name: "Megaminx",
    scrambler: "mgmp",
  },
  {
    name: "Pyraminx",
    scrambler: "pyrso",
  },
  {
    name: "Skewb",
    scrambler: "skbso",
  },
  {
    name: "Square-1",
    scrambler: "sqrs",
  },
];

export const PROVINCIAS: PROVINCE[] = [
  {
    id: "1",
    nombre: "Pinar del Río",
    municipios: [
      "Consolación del Sur",
      "Guane",
      "La Palma",
      "Los Palacios",
      "Mantua",
      "Minas de Matahambre",
      "Pinar del Río",
      "San Juan y Martínez",
      "San Luis",
      "Sandino",
      "Viñales",
    ],
  },
  {
    id: "2",
    nombre: "Artemisa",
    municipios: [
      "Alquízar",
      "Artemisa",
      "Bauta",
      "Caimito",
      "Guanajay",
      "Güira de Melena",
      "Mariel",
      "San Antonio de los Baños",
      "Bahía Honda",
      "San Cristóbal",
      "Candelaria",
    ],
  },
  {
    id: "3",
    nombre: "Mayabeque",
    municipios: [
      "Batabanó",
      "Bejucal",
      "Güines",
      "Jaruco",
      "Madruga",
      "Melena del Sur",
      "Nueva Paz",
      "Quivicán",
      "San José de las Lajas",
      "San Nicolás de Bari",
      "Santa Cruz del Norte",
    ],
  },
  {
    id: "4",
    nombre: "La Habana",
    municipios: [
      "Arroyo Naranjo",
      "Boyeros",
      "Centro Habana",
      "Cerro",
      "Cotorro",
      "Diez de Octubre",
      "Guanabacoa",
      "Habana del Este",
      "Habana Vieja",
      "La Lisa",
      "Marianao",
      "Playa",
      "Plaza",
      "Regla",
      "San Miguel del Padrón",
    ],
  },
  {
    id: "5",
    nombre: "Matanzas",
    municipios: [
      "Calimete",
      "Cárdenas",
      "Ciénaga de Zapata",
      "Colón",
      "Jagüey Grande",
      "Jovellanos",
      "Limonar",
      "Los Arabos",
      "Martí",
      "Matanzas",
      "Pedro Betancourt",
      "Perico",
      "Unión de Reyes",
    ],
  },
  {
    id: "6",
    nombre: "Cienfuegos",
    municipios: [
      "Abreus",
      "Aguada de Pasajeros",
      "Cienfuegos",
      "Cruces",
      "Cumanayagua",
      "Palmira",
      "Rodas",
      "Santa Isabel de las Lajas",
    ],
  },
  {
    id: "7",
    nombre: "Villa Clara",
    municipios: [
      "Caibarién",
      "Camajuaní",
      "Cifuentes",
      "Corralillo",
      "Encrucijada",
      "Manicaragua",
      "Placetas",
      "Quemado de Güines",
      "Ranchuelo",
      "Remedios",
      "Sagua la Grande",
      "Santa Clara",
      "Santo Domingo",
    ],
  },
  {
    id: "8",
    nombre: "Sancti Spíritus",
    municipios: [
      "Cabaigúan",
      "Fomento",
      "Jatibonico",
      "La Sierpe",
      "Sancti Spíritus",
      "Taguasco",
      "Trinidad",
      "Yaguajay",
    ],
  },
  {
    id: "9",
    nombre: "Ciego de Ávila",
    municipios: [
      "Ciro Redondo",
      "Baraguá",
      "Bolivia",
      "Chambas",
      "Ciego de Ávila",
      "Florencia",
      "Majagua",
      "Morón",
      "Primero de Enero",
      "Venezuela",
    ],
  },
  {
    id: "10",
    nombre: "Camagüey",
    municipios: [
      "Camagüey",
      "Carlos Manuel de Céspedes",
      "Esmeralda",
      "Florida",
      "Guaimaro",
      "Jimagüayú",
      "Minas",
      "Najasa",
      "Nuevitas",
      "Santa Cruz del Sur",
      "Sibanicú",
      "Sierra de Cubitas",
      "Vertientes",
    ],
  },
  {
    id: "11",
    nombre: "Las Tunas",
    municipios: [
      "Amancio Rodríguez",
      "Colombia",
      "Jesús Menéndez",
      "Jobabo",
      "Las Tunas",
      "Majibacoa",
      "Manatí",
      "Puerto Padre",
    ],
  },
  {
    id: "12",
    nombre: "Holguín",
    municipios: [
      "Antilla",
      "Báguanos",
      "Banes",
      "Cacocum",
      "Calixto García",
      "Cueto",
      "Frank País",
      "Gibara",
      "Holguín",
      "Mayarí",
      "Moa",
      "Rafael Freyre",
      "Sagua de Tánamo",
      "Urbano Noris",
    ],
  },
  {
    id: "13",
    nombre: "Santiago de Cuba",
    municipios: [
      "Contramaestre",
      "Guamá",
      "Julio Antonio Mella",
      "Palma Soriano",
      "San Luis",
      "Santiago de Cuba",
      "Segundo Frente",
      "Songo la Maya",
      "Tercer Frente",
    ],
  },
  {
    id: "14",
    nombre: "Guantánamo",
    municipios: [
      "Baracoa",
      "Caimanera",
      "El Salvador",
      "Guantánamo",
      "Imías",
      "Maisí",
      "Manuel Tames",
      "Niceto Pérez",
      "San Antonio del Sur",
      "Yateras",
    ],
  },
  {
    id: "15",
    nombre: "Isla de la Juventud",
    municipios: [],
  },
  {
    id: "16",
    nombre: "Granma",
    municipios: [
      "Bartolomé Masó",
      "Bayamo",
      "Buey Arriba",
      "Campechuela",
      "Cauto Cristo",
      "Guisa",
      "Jiguaní",
      "Manzanillo",
      "Media Luna",
      "Niquero",
      "Pilón",
      "Río Cauto",
      "Yara",
    ],
  },
];

export const ROLES: { name: string; value: ROLE }[] = [
  { name: "Root", value: "root" },
  { name: "Administrador", value: "admin" },
  { name: "Delegado", value: "delegate" },
  { name: "Usuario", value: "user" },
];

const COLORS: Record<string, string> = {
  green: "rgb(0,157,84)",
  red: "rgb(220,66,47)",
  blue: "rgb(61,129,246)",
  orange: "rgb(232,112,0)",
  yellow: "rgb(255,235,59)",
  white: "rgb(230,230,230)",
  black: "rgb(0,0,0)",
  // "gray": "rgb(80,80,80)",
  gray: "rgb(75,81,90)",
  darkGray: "rgb(50,50,50)",
  lightGray: "rgb(211,211,211)",
  violet: "rgb(138,27,255)",
  pink: "rgb(237,150,161)",
  lgreen: "rgb(74,217,49)",
  lyellow: "rgb(220,211,165)",
  lblue: "rgb(83,177,243)",

  /// Printable
  pgreen: "rgb(16,162,4)",
  pred: "rgb(213,0,0)",
  pblue: "rgb(43,43,255)",
  porange: "rgb(255,108,11)",
  pyellow: "rgb(255,242,0)",
  pwhite: "rgb(255,255,255)",
  pblack: "rgb(0,0,0)",
  pgray: "rgb(200,200,200)",
  pviolet: "rgb(185,104,251)",
  ppink: "rgb(249,187,204)",
  plgreen: "rgb(74,217,49)",
  plyellow: "rgb(255,255,183)",
  plblue: "rgb(83,177,243)",
};

export declare type ColorName = keyof typeof COLORS;

export function getColorByName(colorName: ColorName | (string & {})) {
  return COLORS[colorName] || (colorName as string);
}

export const EPS = 1e-6;

export const STANDARD_PALETTE = {
  y: getColorByName("yellow"),
  r: getColorByName("red"),
  o: getColorByName("orange"),
  b: getColorByName("blue"),
  g: getColorByName("green"),
  w: getColorByName("white"),
  x: getColorByName("gray"),
  d: getColorByName("black"),
  v: getColorByName("violet"),
  k: getColorByName("yellow"),

  yellow: getColorByName("yellow"),
  red: getColorByName("red"),
  orange: getColorByName("orange"),
  blue: getColorByName("blue"),
  green: getColorByName("green"),
  white: getColorByName("white"),
  gray: getColorByName("gray"),
  darkGray: getColorByName("darkGray"),
  lightGray: getColorByName("lightGray"),
  black: getColorByName("black"),
  violet: getColorByName("violet"),
  pink: getColorByName("pink"),
  lblue: getColorByName("lblue"),
  lyellow: getColorByName("lyellow"),
  lgreen: getColorByName("lgreen"),
} as const;

export enum CubeMode {
  NORMAL = 0,
  OLL,
  PLL,
  CMLL,
  F2L,
  COLL,
  WV,
  ELL,
  VLS,
  ZBLL,
  OLLCP,
  GRAY,
  CENTERS,
  CROSS,
  FL,
  YCROSS,
  CS,
  EO,
  CO,
  F3E,
  EDGERF,
  DPLL,
  L4E,
  CYCROSS,
  EOLS,
}

export function strToHex(color: string): number {
  const nums = color.split("(")[1].split(")")[0].split(",").map(Number);
  return (nums[0] << 16) | (nums[1] << 8) | nums[2];
}

// SCRAMBLER OPTIONS
export const R222 = [
  "222so",
  "222o",
  "2223",
  "2226",
  "222eg",
  "222eg0",
  "222eg1",
  "222eg2",
  "222nb",
  "222tcp",
  "222tcn",
  "222lsall",
];
export const R333 = [
  "333",
  "333ni",
  "333fm",
  "333oh",
  "333o",
  "edges",
  "corners",
  "ll",
  "zbll",
  "cll",
  "ell",
  "lse",
  "lsemu",
  "cmll",
  "f2l",
  "lsll2",
  "2gll",
  "zbls",
  "zzll",
  "oll",
  "pll",
  "eoline",
  "easyc",
  "333ft",
  "333custom",
  "2gen",
  "2genl",
  "roux",
  "3gen_F",
  "3gen_L",
  "RrU",
  "half",
  "lsll",
  "coll",
  "eols",
  "wvls",
  "vls",
  "easyxc",
  "sbrx",
  "mt3qb",
  "mteole",
  "mttdr",
  "mt6cp",
  "mtcdrll",
  "mtl5ep",
  "ttll",
];
export const R444 = ["444wca", "444bld", "444m", "444", "444yj", "4edge", "RrUu"];
export const R555 = ["555wca", "555bld", "555", "5edge"];
export const R666 = ["666wca", "666si", "666p", "666s", "6edge"];
export const R777 = ["777wca", "777si", "777p", "777s", "7edge"];
export const PYRA = ["pyrso", "pyro", "pyrm", "pyrl4e", "pyr4c", "pyrnb"];
export const SKWB = ["skbso", "skbo", "skb", "skbnb"];
export const SQR1 = ["sqrs", "sqrcsp", "sq1h", "sq1t"];
export const CLCK = ["clkwca", "clk", "clkwca", "clko", "clkc", "clke"];
export const MEGA = ["mgmp", "mgmc", "mgmo", "minx2g", "mlsll", "mgmll", "mgmpll"];
export const KILO = ["klmso", "klmp"];
export const GIGA = ["giga"];
export const MISC = [
  ["r3", "r3ni"],
  "r234w",
  "r2345w",
  "r23456w",
  "r234567w",
  "r234",
  "r2345",
  "r23456",
  "r234567",
  "sq2",
  "bic",
  ["gearso", "gearo", "gear"],
  ["redim", "redi"],
  ["ivy", "ivyo", "ivyso"],
  ["prcp", "prco"],
  ["heli"],
  ["888"],
  ["999"],
  ["101010"],
  ["111111"],
  ["mpyr"],
  ["223"],
  ["233"],
  ["334"],
  ["336"],
  ["ssq1t"],
  ["fto"],
  ["133"],
  ["sfl"],
];

const OPTS: PuzzleOptions[] = [
  { type: "rubik", order: [2] },
  { type: "rubik", order: [3] },
  { type: "rubik", order: [4] },
  { type: "rubik", order: [5] },
  { type: "rubik", order: [6] },
  { type: "rubik", order: [7] },
  { type: "pyraminx", order: [3] },
  { type: "skewb" },
  { type: "square1" },
  { type: "clock" },
  { type: "megaminx", order: [3] },
  { type: "megaminx", order: [2] },
  { type: "megaminx", order: [5] },
];

const OPTS_MISC: PuzzleOptions[][] = [
  [{ type: "rubik", order: [3] }],
  [2, 3, 4].map(n => ({ type: "rubik", order: [n] })),
  [2, 3, 4, 5].map(n => ({ type: "rubik", order: [n] })),
  [2, 3, 4, 5, 6].map(n => ({ type: "rubik", order: [n] })),
  [2, 3, 4, 5, 6, 7].map(n => ({ type: "rubik", order: [n] })),
  [2, 3, 4].map(n => ({ type: "rubik", order: [n] })),
  [2, 3, 4, 5].map(n => ({ type: "rubik", order: [n] })),
  [2, 3, 4, 5, 6].map(n => ({ type: "rubik", order: [n] })),
  [2, 3, 4, 5, 6, 7].map(n => ({ type: "rubik", order: [n] })),
  [{ type: "square2" }],
  [{ type: "bicube" }],
  [{ type: "gear" }],
  [{ type: "redi" }],
  [{ type: "ivy" }],
  [{ type: "pyraminxCrystal" }],
  [{ type: "helicopter" }],
  [{ type: "rubik", order: [8] }],
  [{ type: "rubik", order: [9] }],
  [{ type: "rubik", order: [10] }],
  [{ type: "rubik", order: [11] }],
  [{ type: "pyraminx", order: [4] }],
  [{ type: "rubik", order: [2, 2, 3] }],
  [{ type: "rubik", order: [3, 3, 2] }],
  [{ type: "rubik", order: [3, 3, 4] }],
  [{ type: "rubik", order: [3, 3, 6] }],
  [{ type: "supersquare1" }],
  [{ type: "fto" }],
  [{ type: "rubik", order: [3, 3, 1] }],
  [{ type: "rubik", order: [3, 1, 3] }],
];

const MODES = [R222, R333, R444, R555, R666, R777, PYRA, SKWB, SQR1, CLCK, MEGA, KILO, GIGA];

export const options: Map<string, PuzzleOptions | PuzzleOptions[]> = new Map<
  string,
  PuzzleOptions | PuzzleOptions[]
>();

for (let i = 0, maxi = MODES.length; i < maxi; i += 1) {
  OPTS[i].view = "2d";

  for (let j = 0, maxj = MODES[i].length; j < maxj; j += 1) {
    options.set(MODES[i][j], OPTS[i]);
  }
}

for (let i = 0, maxi = MISC.length; i < maxi; i += 1) {
  OPTS_MISC[i].forEach(opt => (opt.view = "2d"));

  if (typeof MISC[i] === "string") {
    options.set(MISC[i] as string, OPTS_MISC[i]);
  } else {
    (MISC[i] as string[]).forEach(m => options.set(m, OPTS_MISC[i]));
  }
}
