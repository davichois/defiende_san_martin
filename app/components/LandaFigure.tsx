// Retrato vectorial de David Landa hecho con formas geométricas, en el lienzo de 1200 x 866.
// Rasgos: corte al ras canoso, lentes rectangulares negros, bigote ancho entrecano.
// Viste un polo blanco con el cuello ribeteado en naranja.

const SKIN = "#c98d68";
const SKIN_LIGHT = "#d9a07a";
const SKIN_SHADE = "#b0764f";
const SKIN_DEEP = "#9a6443";
const POLO = "#fbfbf9";
const POLO_LINE = "#d6d6d2";

// Bigote ancho y tupido, simétrico respecto a x = 575.
const STACHE =
  "M575 398 C560 385 530 385 507 395 C484 406 472 430 475 456 C488 465 507 462 522 453 C542 444 560 447 575 454 C590 447 608 444 628 453 C643 462 662 465 675 456 C678 430 666 406 643 395 C620 385 590 385 575 398 Z";

// Mismo contorno de hombros que el diseño original.
const BODY =
  "M30 866 C50 760 100 660 210 610 C290 572 380 548 450 505 L700 505 C770 545 845 575 880 620 C905 680 915 770 920 866 Z";

export default function LandaFigure({ name }: { name: string }) {
  return (
    <svg className="figure" viewBox="0 0 1200 866" role="img" aria-label={name}>
      <defs>
        <linearGradient id="polo" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#dcdcd7" />
          <stop offset="0.3" stopColor={POLO} />
          <stop offset="0.7" stopColor={POLO} />
          <stop offset="1" stopColor="#d9d9d4" />
        </linearGradient>
        <linearGradient id="face" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={SKIN_LIGHT} />
          <stop offset="0.6" stopColor={SKIN} />
          <stop offset="1" stopColor={SKIN_SHADE} />
        </linearGradient>
        <pattern id="buzz" width="7" height="6" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.3" fill="#8b857e" />
          <circle cx="5.5" cy="5" r="1" fill="#cfcac4" />
        </pattern>
        <linearGradient id="stacheTone" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#6b625b" />
          <stop offset="0.55" stopColor="#3d3530" />
          <stop offset="1" stopColor="#26201c" />
        </linearGradient>
        <pattern
          id="stache"
          width="9"
          height="40"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(8)"
        >
          <rect x="1" width="2" height="40" fill="#8f8781" />
          <rect x="5" width="1.5" height="40" fill="#2f2823" />
        </pattern>
      </defs>

      {/* Polo blanco */}
      <path d={BODY} fill="url(#polo)" stroke={POLO_LINE} strokeWidth="3" />
      <path
        d="M250 600 C215 680 200 760 205 866"
        stroke={POLO_LINE}
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M860 610 C895 680 905 770 908 866"
        stroke={POLO_LINE}
        strokeWidth="3"
        fill="none"
      />

      <path
        d="M420 700 Q470 730 500 800 M730 700 Q680 730 650 800"
        stroke={POLO_LINE}
        strokeWidth="2.5"
        fill="none"
        opacity="0.7"
      />

      {/* Cuello y abertura de la tapeta */}
      <path d="M515 430 L635 430 L648 535 L502 535 Z" fill={SKIN_SHADE} />
      <path d="M552 505 L575 572 L598 505 Z" fill={SKIN} />

      {/* Tapeta con botones */}
      <path
        d="M558 540 L592 540 L592 668 Q575 676 558 668 Z"
        fill={POLO}
        stroke={POLO_LINE}
        strokeWidth="2.5"
      />
      <circle cx="575" cy="590" r="5" fill={POLO_LINE} />
      <circle cx="575" cy="630" r="5" fill={POLO_LINE} />

      {/* Cuello de polo, con ribete naranja */}
      <g
        fill="#ffffff"
        stroke={POLO_LINE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      >
        <path d="M508 466 L446 512 L486 574 L554 552 L566 520 Z" />
        <path d="M642 466 L704 512 L664 574 L596 552 L584 520 Z" />
      </g>
      <path
        d="M452 516 L489 568 L550 548 M698 516 L661 568 L600 548"
        stroke="var(--brand)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Orejas */}
      <ellipse cx="450" cy="338" rx="24" ry="44" fill={SKIN_LIGHT} />
      <ellipse cx="453" cy="338" rx="11" ry="26" fill={SKIN_SHADE} />
      <ellipse cx="700" cy="338" rx="24" ry="44" fill={SKIN} />
      <ellipse cx="697" cy="338" rx="11" ry="26" fill={SKIN_DEEP} />

      {/* Cara: ancha, frente alta y mandíbula redondeada */}
      <path
        d="M460 250 Q460 150 575 144 Q690 150 690 250 L690 365 Q686 440 640 472 Q575 505 510 472 Q464 440 460 365 Z"
        fill="url(#face)"
      />
      <ellipse
        cx="575"
        cy="484"
        rx="52"
        ry="9"
        fill={SKIN_DEEP}
        opacity="0.3"
      />

      {/* Corte al ras, parte superior plana */}
      <path
        d="M456 296 L452 205 Q456 136 575 128 Q694 136 698 205 L694 296 L684 296 Q684 244 666 232 Q650 212 620 200 Q575 188 530 200 Q500 212 484 232 Q466 244 466 296 Z"
        fill="#aaa49d"
      />
      <path
        d="M456 296 L452 205 Q456 136 575 128 Q694 136 698 205 L694 296 L684 296 Q684 244 666 232 Q650 212 620 200 Q575 188 530 200 Q500 212 484 232 Q466 244 466 296 Z"
        fill="url(#buzz)"
        opacity="0.35"
      />

      {/* Cejas gruesas */}
      <g className="brows">
        <path d="M484 270 L558 260 L562 278 L488 288 Z" fill="#3a332e" />
        <path d="M592 260 L666 270 L662 288 L588 278 Z" fill="#3a332e" />
      </g>

      {/* Lentes: vidrio con brillo arriba y el reflejo "FUERZA | POPULAR", recortado a cada luna */}
      <defs>
        <clipPath id="lunas">
          <rect x="476" y="284" width="92" height="54" rx="8" />
          <rect x="582" y="284" width="92" height="54" rx="8" />
        </clipPath>
        <linearGradient id="vidrio" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="reflejo" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#ffd2b3" />
        </linearGradient>
      </defs>
      <g clipPath="url(#lunas)">
        <rect x="470" y="280" width="210" height="62" fill="url(#vidrio)" />
        <g
          fill="url(#reflejo)"
          opacity="0.9"
          fontFamily="var(--font-display), sans-serif"
          fontWeight="700"
          fontSize="15"
          letterSpacing="1.5"
          textAnchor="middle"
        >
          <text
            x="522"
            y="317"
            textLength="66"
            lengthAdjust="spacingAndGlyphs"
            transform="skewX(-10) translate(55 0)"
          >
            FUERZA
          </text>
          <text
            x="628"
            y="317"
            textLength="68"
            lengthAdjust="spacingAndGlyphs"
            transform="skewX(-10) translate(55 0)"
          >
            POPULAR
          </text>
        </g>
        {/* Destello que cruza las lunas cada tanto */}
        <path
          className="glint"
          d="M470 344 L500 280 L516 280 L486 344 Z"
          fill="#fff"
          opacity="0.5"
        />
      </g>
      <rect
        x="476"
        y="284"
        width="92"
        height="54"
        rx="8"
        fill="none"
        stroke="#121212"
        strokeWidth="10"
        strokeLinejoin="round"
      />
      <rect
        x="582"
        y="284"
        width="92"
        height="54"
        rx="8"
        fill="none"
        stroke="#121212"
        strokeWidth="10"
        strokeLinejoin="round"
      />
      <path
        d="M568 298 Q575 292 582 298"
        stroke="#121212"
        strokeWidth="8"
        fill="none"
      />
      <path
        d="M476 294 L452 302 M674 294 L700 302"
        stroke="#121212"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Nariz */}
      <path
        d="M575 336 L550 394 Q575 406 600 394 Z"
        fill={SKIN_SHADE}
        opacity="0.8"
      />

      {/* Labio inferior sutil */}
      <path
        d="M552 470 Q575 480 598 470"
        stroke="#a45c4a"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Bigote: el protagonista */}
      <g className="mustache">
        <path d={STACHE} fill="url(#stacheTone)" />
        <path d={STACHE} fill="url(#stache)" opacity="0.28" />
        <path
          d="M510 408 Q540 396 566 406 M640 408 Q610 396 584 406"
          stroke="#b9b2ab"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
      </g>
    </svg>
  );
}
