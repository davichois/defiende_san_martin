// Todo el contenido de la infografía vive aquí. Cambia textos y rutas de fotos sin tocar el diseño.
// Las coordenadas están en el lienzo original de 1200 x 866 px; la página las escala sola.

export type Point = [number, number];

export type Annotation = {
  id: string;
  title: string;
  body: string;
  /** Posición del bloque de texto (esquina superior del título). */
  x: number;
  y: number;
  width: number;
  align: "left" | "right";
  /** Línea guía: empieza en el subrayado del título y termina en el punto que señala. */
  line: Point[];
  /** En pantallas anchas los textos se abren hacia los costados; false lo deja fijo junto a la figura. */
  spread?: boolean;
  /** Grupo de propuestas: se muestra con píldora y al abrirlo lista sus propuestas. */
  compact?: boolean;
  /** Números (1–10) de las propuestas del grupo, en `proposals`. */
  items?: number[];
  /** Logros que se despliegan hacia arriba al tocar "Ver más". */
  more?: string[];
  /** Pantallas altas (tablet vertical): posición alternativa en una fila sobre el círculo. */
  tall?: { x: number; y: number; width: number; line: Point[] };
};

export type Proposal = { n: number; title: string; body: string };

export const campaign = {
  name: "DAVID LANDA TUCTO",
  years: "2027–2030",
  cta: { label: "Unirse", href: "/unirse" },
  // Redes sociales: pega aquí los enlaces oficiales. Las que queden vacías no se muestran.
  social: {
    facebook: "https://www.facebook.com/profile.php?id=100063565512125",
    instagram: "",
    tiktok: "https://www.tiktok.com/@davidlanda76?lang=es",
  },
  // Elecciones Regionales y Municipales 2026: apertura de mesas en Perú (UTC-5).
  election: {
    date: "2026-10-04T07:00:00-05:00",
    place: "San Martín",
    label: "4 de octubre",
  },
};

// Fotos del círculo de fondo (recortadas sin la franja del afiche, desde los PNG de /public).
// Orden de la cuadrícula: alto izquierda, dos arriba al centro, alto derecha, dos abajo al centro.
// Las del centro quedan casi tapadas por la cabeza, así que a los costados van las que más se leen.
// `pos` encuadra cada foto en su casilla para que se vean las caras.
export const circlePhotos = [
  { src: "/fotos/circulo-2.jpg", pos: "24% 0%" },
  { src: "/fotos/circulo-1.jpg", pos: "50% 20%" },
  { src: "/fotos/circulo-4.jpg", pos: "45% 12%" },
  { src: "/fotos/circulo-3.jpg", pos: "74% 0%" },
  { src: "/fotos/circulo-5.jpg", pos: "50% 25%" },
  { src: "/fotos/circulo-6.jpg", pos: "70% 30%" },
];

// Las 10 propuestas de gobierno, en el orden oficial.
export const proposals: Proposal[] = [
  {
    n: 1,
    title: "Titulación de tierras agrícolas",
    body: "Seguridad jurídica para nuestros agricultores.",
  },
  {
    n: 2,
    title: "Programa Agua Sana",
    body: "Pozos tubulares y sistemas de abastecimiento para nuestras familias.",
  },
  {
    n: 3,
    title: "San Martín, región productora de energía",
    body: "Hidroeléctricas y energías alternativas para impulsar la agroindustria.",
  },
  {
    n: 4,
    title: "Agricultura regional de alta tecnología",
    body: "Más productividad para arroz, café, cacao, madera y otros productos.",
  },
  {
    n: 5,
    title: "Zona bioeconómica especial de desarrollo",
    body: "Incentivos tributarios para impulsar la agroindustria y generar empleo.",
  },
  {
    n: 6,
    title: "Jubilación con reforestación",
    body: "Un programa que convierta la reforestación en una oportunidad de ahorro y jubilación para nuestros agricultores.",
  },
  {
    n: 7,
    title: "Puesta en valor del Gran Pajatén",
    body: "Identidad, patrimonio, turismo y desarrollo para San Martín.",
  },
  {
    n: 8,
    title: "Tren Juanjuí–Salaverry",
    body: "Una conexión estratégica para el comercio y la integración regional.",
  },
  {
    n: 9,
    title: "Carretera Tocache–Pataz",
    body: "Conectividad y nuevas oportunidades para San Martín.",
  },
  {
    n: 10,
    title: "Conectividad y turismo para San Martín",
    body: "Activación de los aeropuertos de Rioja, Juanjuí y Tocache, y teleféricos turísticos en Morro de Calzada, Ahuashiyacu y Sauce.",
  },
];

// Grupos alrededor del círculo: al abrir uno se ven sus propuestas. La línea es un brazo con
// codo: sale recta del borde interior del texto a la altura de la píldora (y + 11), dobla y baja
// o sube en diagonal hasta el anillo (radio 306 alrededor de 571, 300). En horizontal siempre sobran al menos 40 unidades a cada lado, por eso
// las columnas pueden empezar en x negativo o pasar de 1200. Cada grupo tiene debajo espacio libre
// para desplegar su lista sin chocar con el siguiente.
export const annotations: Annotation[] = [
  {
    id: "agua-energia",
    tall: {
      x: 150,
      y: -235,
      width: 210,
      line: [
        [255, -66],
        [255, -30],
        [330, 111],
      ],
    },
    title: "Agua y energía",
    body: "Servicios básicos que mueven a la región.",
    x: -25,
    y: 40,
    width: 255,
    align: "right",
    compact: true,
    items: [2, 3],
    line: [
      [238, 51],
      [275, 51],
      [339, 100],
    ],
  },
  {
    id: "vias",
    tall: {
      x: 378,
      y: -235,
      width: 210,
      line: [
        [483, -66],
        [483, -30],
        [470, 11],
      ],
    },
    title: "Integración vial",
    body: "Rutas que unen a San Martín con el país.",
    x: -25,
    y: 410,
    width: 255,
    align: "right",
    compact: true,
    items: [8, 9],
    line: [
      [238, 421],
      [265, 421],
      [317, 470],
    ],
  },
  {
    id: "campo",
    tall: {
      x: 606,
      y: -235,
      width: 210,
      line: [
        [711, -66],
        [711, -30],
        [672, 11],
      ],
    },
    title: "Campo productivo",
    body: "Más valor para el agricultor sanmartinense.",
    x: 905,
    y: 60,
    width: 300,
    align: "left",
    compact: true,
    items: [1, 4, 5, 6],
    line: [
      [897, 71],
      [860, 71],
      [818, 120],
    ],
  },
  {
    id: "turismo",
    tall: {
      x: 834,
      y: -235,
      width: 210,
      line: [
        [939, -66],
        [939, -30],
        [812, 111],
      ],
    },
    title: "Turismo e identidad",
    body: "San Martín, abierta al mundo.",
    x: 905,
    y: 520,
    width: 300,
    align: "left",
    compact: true,
    items: [7, 10],
    line: [
      [897, 531],
      [870, 531],
      [818, 480],
    ],
  },
  {
    id: "quien-soy",
    title: "¿Quién soy?",
    body: "Ingeniero y emprendedor que ha dedicado su vida a San Martín.",
    more: [
      "Impulsa el desarrollo y la identidad de San Martín.",
      "Promovió la recuperación de las tradicionales pandillas de Moyobamba.",
      "Récord Guinness: presentación de pandillas con 3,170 participantes.",
      "Impulsa iniciativas de turismo, conservación y desarrollo del Alto Mayo.",
      "Lleva el nombre de San Martín más allá de sus fronteras.",
    ],
    x: 290,
    y: 712,
    width: 210,
    align: "left",
    line: [
      [412, 743],
      [289, 743],
      [272, 734],
    ],
    spread: false,
  },
];
