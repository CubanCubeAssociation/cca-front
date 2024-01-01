import type { CATEGORY, PROVINCE, ROLE } from "../interfaces";

export const API = 'http://localhost:3000/v1';
// export const API = 'http://192.168.180.93:3000/v1';

export const ICONS: CATEGORY[] = [
  {
    name: '2x2x2',
    scrambler: '222so'
  },
  {
    name: '3x3x3',
    scrambler: '333'
  },
  {
    name: '3x3x3 FM',
    scrambler: '333fm'
  },
  {
    name: '3x3x3 BF',
    scrambler: '333ni'
  },
  {
    name: '3x3x3 MBF',
    scrambler: '333mbf'
  },
  {
    name: '3x3x3 OH',
    scrambler: '333oh'
  },
  {
    name: '4x4x4 BLD',
    scrambler: '444bld'
  },
  {
    name: '4x4x4',
    scrambler: '444wca'
  },
  {
    name: '5x5x5',
    scrambler: '555wca'
  },
  {
    name: '5x5x5 BLD',
    scrambler: '555bld'
  },
  {
    name: '6x6x6',
    scrambler: '666wca'
  },
  {
    name: '7x7x7',
    scrambler: '777wca'
  },
  {
    name: 'Clock',
    scrambler: 'clkwca'
  },
  {
    name: 'Megaminx',
    scrambler: 'mgmp'
  },
  {
    name: 'Pyraminx',
    scrambler: 'pyrso'
  },
  {
    name: 'Skewb',
    scrambler: 'skbso'
  },
  {
    name: 'Square-1',
    scrambler: 'sqrs'
  },
];

export const PROVINCIAS: PROVINCE[] = [
  {
    "id": "1",
    "nombre": 'Pinar del Río',
    "municipios": [
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
      "Viñales"
    ]
  },
  {
    "id": "2",
    "nombre": 'Artemisa',
    "municipios": [
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
      "Candelaria"
    ]
  },
  {
    "id": "3",
    "nombre": 'Mayabeque',
    "municipios": [
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
      "Santa Cruz del Norte"
    ]
  },
  {
    "id": "4",
    "nombre": 'La Habana',
    "municipios": [
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
      "San Miguel del Padrón"
    ]
  },
  {
    "id": "5",
    "nombre": 'Matanzas',
    "municipios": [
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
      "Unión de Reyes"
    ]
  },
  {
    "id": "6",
    "nombre": 'Cienfuegos',
    "municipios": [
      "Abreus",
      "Aguada de Pasajeros",
      "Cienfuegos",
      "Cruces",
      "Cumanayagua",
      "Palmira",
      "Rodas",
      "Santa Isabel de las Lajas"
    ]
  },
  {
    "id": "7",
    "nombre": 'Villa Clara',
    "municipios": [
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
      "Santo Domingo"
    ]
  },
  {
    "id": "8",
    "nombre": 'Sancti Spíritus',
    "municipios": [
      "Cabaigúan",
      "Fomento",
      "Jatibonico",
      "La Sierpe",
      "Sancti Spíritus",
      "Taguasco",
      "Trinidad",
      "Yaguajay"
    ]
  },
  {
    "id": "9",
    "nombre": 'Ciego de Ávila',
    "municipios": [
      "Ciro Redondo",
      "Baraguá",
      "Bolivia",
      "Chambas",
      "Ciego de Ávila",
      "Florencia",
      "Majagua",
      "Morón",
      "Primero de Enero",
      "Venezuela"
    ]
  },
  {
    "id": "10",
    "nombre": 'Camagüey',
    "municipios": [
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
      "Vertientes"
    ]
  },
  {
    "id": "11",
    "nombre": 'Las Tunas',
    "municipios": [
      "Amancio Rodríguez",
      "Colombia",
      "Jesús Menéndez",
      "Jobabo",
      "Las Tunas",
      "Majibacoa",
      "Manatí",
      "Puerto Padre"
    ]
  },
  {
    "id": "12",
    "nombre": 'Holguín',
    "municipios": [
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
      "Urbano Noris"
    ]
  },
  {
    "id": "13",
    "nombre": 'Santiago de Cuba',
    "municipios": [
      "Contramaestre",
      "Guamá",
      "Julio Antonio Mella",
      "Palma Soriano",
      "San Luis",
      "Santiago de Cuba",
      "Segundo Frente",
      "Songo la Maya",
      "Tercer Frente"
    ]
  },
  {
    "id": "14",
    "nombre": 'Guantánamo',
    "municipios": [
      "Baracoa",
      "Caimanera",
      "El Salvador",
      "Guantánamo",
      "Imías",
      "Maisí",
      "Manuel Tames",
      "Niceto Pérez",
      "San Antonio del Sur",
      "Yateras"
    ]
  },
  {
    "id": "15",
    "nombre": 'Isla de la Juventud',
    "municipios": [],
  },
  {
    "id": "16",
    "nombre": "Granma",
    "municipios": [
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
      "Yara"
    ]
  }
];

export const ROLES: {name: string, value: ROLE}[] = [
  { name: "Administrador", value: "admin" },
  { name: "Delegado", value: "delegate" },
  { name: "Usuario", value: "user" },
];