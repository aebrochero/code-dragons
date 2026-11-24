import {
  AltarPlacement,
  BossDef,
  CastleDef,
  CodeChallenge,
  EnemyDef,
  HazardDef,
  PlatformDef,
  RoomDef,
} from '../types/game';

/**
 * Helper to generate playable, well-proportioned 2D room layouts
 * guaranteeing every jump is comfortably reachable (vertical step <= 70px, gap <= 115px).
 */
function buildRoomLayout(
  variant: 'intro' | 'corridor' | 'sanctuary' | 'boss',
  castleId: number,
  altars: CodeChallenge[],
  boss?: BossDef
): Pick<
  RoomDef,
  | 'width'
  | 'height'
  | 'spawn'
  | 'exitPortal'
  | 'platforms'
  | 'hazards'
  | 'enemies'
  | 'altars'
  | 'bonfires'
  | 'chests'
  | 'boss'
> {
  const groundY = 460;
  const dmgBase = 10 + castleId * 2;
  const speedBase = 62 + castleId * 8;

  if (variant === 'intro') {
    const a1 = altars[0];
    const a2 = altars[1];
    const platforms: PlatformDef[] = [
      { id: 'g1', x: 0, y: groundY, w: 460, h: 100, kind: 'solid' },
      { id: 'p1', x: 250, y: 395, w: 150, h: 20, kind: 'semisolid' },
      // Bridge extended by Altar 1 over pit
      {
        id: 'b1',
        x: 460,
        y: groundY,
        w: 170,
        h: 24,
        kind: 'bridge',
        linkedAltarId: a1.id,
      },
      { id: 'g2', x: 630, y: groundY, w: 420, h: 100, kind: 'solid' },
      { id: 'p2', x: 730, y: 392, w: 180, h: 20, kind: 'semisolid' },
      // Gate blocking final stretch if there's a 2nd altar
      ...(a2
        ? [
            {
              id: 'gate1',
              x: 1010,
              y: 340,
              w: 28,
              h: 120,
              kind: 'gate' as const,
              linkedAltarId: a2.id,
            },
          ]
        : []),
      { id: 'g3', x: 1050, y: groundY, w: 370, h: 100, kind: 'solid' },
      { id: 'wall_l', x: -24, y: 0, w: 24, h: 560, kind: 'solid' },
      { id: 'wall_r', x: 1420, y: 0, w: 24, h: 560, kind: 'solid' },
    ];

    const hazards: HazardDef[] = [
      {
        id: 'hz1',
        x: 470,
        y: groundY + 46,
        w: 150,
        h: 26,
        kind: castleId % 2 === 1 ? 'lava' : 'spikes',
        damage: dmgBase,
      },
    ];

    const enemies: EnemyDef[] = [
      {
        id: `e_${castleId}_1_1`,
        archetype: 'patrol',
        x: 780,
        y: groundY - 40,
        patrolRange: 110,
        speed: speedBase,
        damage: dmgBase,
        name: 'Slime de Sintaxis',
      },
    ];

    const placedAltars: AltarPlacement[] = [
      {
        id: a1.id,
        x: 365,
        y: groundY - 48,
        label: a1.title,
        challenge: a1,
        unlocksText: 'Extiende el Puente Rúnico sobre el foso',
      },
      ...(a2
        ? [
            {
              id: a2.id,
              x: 920,
              y: groundY - 48,
              label: a2.title,
              challenge: a2,
              unlocksText: 'Abre la Compuerta del Portal',
            },
          ]
        : []),
    ];

    return {
      width: 1420,
      height: 560,
      spawn: { x: 85, y: groundY - 56 },
      exitPortal: {
        x: 1300,
        y: groundY - 64,
        requiresAltarIds: altars.map((a) => a.id),
      },
      platforms,
      hazards,
      enemies,
      altars: placedAltars,
      bonfires: [{ id: `bf_${castleId}_1`, x: 165, y: groundY - 48 }],
      chests: [
        {
          id: `ch_${castleId}_1`,
          x: 790,
          y: 392 - 42,
          gold: 25 + castleId * 8,
          xp: 35,
        },
      ],
    };
  }

  if (variant === 'corridor') {
    const a1 = altars[0];
    const a2 = altars[1];
    const platforms: PlatformDef[] = [
      { id: 'g1', x: 0, y: groundY, w: 320, h: 100, kind: 'solid' },
      {
        id: 'm1',
        x: 360,
        y: 425,
        w: 115,
        h: 20,
        kind: 'moving',
        moveAxis: 'x',
        moveRange: 85,
        moveSpeed: 1.5,
      },
      { id: 'g2', x: 580, y: groundY, w: 340, h: 100, kind: 'solid' },
      { id: 'p_high', x: 640, y: 392, w: 160, h: 20, kind: 'semisolid' },
      {
        id: 'b2',
        x: 920,
        y: groundY,
        w: 180,
        h: 24,
        kind: 'bridge',
        linkedAltarId: a1.id,
      },
      { id: 'g3', x: 1100, y: groundY, w: 460, h: 100, kind: 'solid' },
      { id: 'p_up', x: 1180, y: 395, w: 140, h: 20, kind: 'semisolid' },
      ...(a2
        ? [
            {
              id: 'gate2',
              x: 1410,
              y: 340,
              w: 28,
              h: 120,
              kind: 'gate' as const,
              linkedAltarId: a2.id,
            },
          ]
        : []),
      { id: 'g4', x: 1560, y: groundY, w: 240, h: 100, kind: 'solid' },
      { id: 'wall_l', x: -24, y: 0, w: 24, h: 560, kind: 'solid' },
      { id: 'wall_r', x: 1800, y: 0, w: 24, h: 560, kind: 'solid' },
    ];

    const hazards: HazardDef[] = [
      {
        id: 'hz_cor1',
        x: 325,
        y: groundY + 46,
        w: 250,
        h: 26,
        kind: 'lava',
        damage: dmgBase + 4,
      },
      {
        id: 'hz_cor2',
        x: 925,
        y: groundY + 46,
        w: 170,
        h: 26,
        kind: 'spikes',
        damage: dmgBase,
        disabledByAltarId: a1.id,
      },
    ];

    const enemies: EnemyDef[] = [
      {
        id: `e_${castleId}_2_1`,
        archetype: 'orbiter',
        x: 720,
        y: 335,
        patrolRange: 75,
        speed: speedBase + 12,
        damage: dmgBase,
        name: 'Murciélago de Latencia',
      },
      {
        id: `e_${castleId}_2_2`,
        archetype: 'turret',
        x: 1290,
        y: groundY - 46,
        speed: 0,
        damage: dmgBase + 2,
        name: 'Torreta Rúnica',
      },
    ];

    const placedAltars: AltarPlacement[] = [
      {
        id: a1.id,
        x: 845,
        y: groundY - 48,
        label: a1.title,
        challenge: a1,
        unlocksText: 'Desactiva los pinchos y despliega el puente',
      },
      ...(a2
        ? [
            {
              id: a2.id,
              x: 1335,
              y: groundY - 48,
              label: a2.title,
              challenge: a2,
              unlocksText: 'Destruye la barrera del portal',
            },
          ]
        : []),
    ];

    return {
      width: 1800,
      height: 560,
      spawn: { x: 80, y: groundY - 56 },
      exitPortal: {
        x: 1680,
        y: groundY - 64,
        requiresAltarIds: altars.map((a) => a.id),
      },
      platforms,
      hazards,
      enemies,
      altars: placedAltars,
      bonfires: [
        { id: `bf_${castleId}_2a`, x: 160, y: groundY - 48 },
        { id: `bf_${castleId}_2b`, x: 1135, y: groundY - 48 },
      ],
      chests: [
        {
          id: `ch_${castleId}_2`,
          x: 695,
          y: 392 - 42,
          gold: 35 + castleId * 10,
          xp: 45,
        },
      ],
    };
  }

  if (variant === 'sanctuary') {
    const a1 = altars[0];
    const platforms: PlatformDef[] = [
      { id: 'g1', x: 0, y: groundY, w: 360, h: 100, kind: 'solid' },
      { id: 'step1', x: 400, y: 408, w: 150, h: 20, kind: 'semisolid' },
      { id: 'step2', x: 600, y: 362, w: 210, h: 22, kind: 'semisolid' },
      { id: 'g2', x: 560, y: groundY, w: 500, h: 100, kind: 'solid' },
      {
        id: 'gate_s',
        x: 1020,
        y: 340,
        w: 28,
        h: 120,
        kind: 'gate',
        linkedAltarId: a1.id,
      },
      { id: 'g3', x: 1060, y: groundY, w: 380, h: 100, kind: 'solid' },
      { id: 'wall_l', x: -24, y: 0, w: 24, h: 560, kind: 'solid' },
      { id: 'wall_r', x: 1440, y: 0, w: 24, h: 560, kind: 'solid' },
    ];

    const hazards: HazardDef[] = [
      {
        id: 'hz_s1',
        x: 365,
        y: groundY + 46,
        w: 190,
        h: 26,
        kind: 'spikes',
        damage: dmgBase + 3,
      },
    ];

    const enemies: EnemyDef[] = [
      {
        id: `e_${castleId}_3_1`,
        archetype: 'charger',
        x: 820,
        y: groundY - 46,
        patrolRange: 130,
        speed: speedBase + 25,
        damage: dmgBase + 4,
        name: 'Caballero de Excepciones',
      },
      {
        id: `e_${castleId}_3_2`,
        archetype: 'orbiter',
        x: 680,
        y: 295,
        patrolRange: 70,
        speed: speedBase + 10,
        damage: dmgBase,
        name: 'Espectro de Memoria',
      },
    ];

    return {
      width: 1440,
      height: 560,
      spawn: { x: 85, y: groundY - 56 },
      exitPortal: {
        x: 1320,
        y: groundY - 64,
        requiresAltarIds: [a1.id],
      },
      platforms,
      hazards,
      enemies,
      altars: [
        {
          id: a1.id,
          x: 910,
          y: groundY - 48,
          label: a1.title,
          challenge: a1,
          unlocksText: 'Abre la Puerta hacia la Sala del Trono',
        },
      ],
      bonfires: [{ id: `bf_${castleId}_3`, x: 180, y: groundY - 48 }],
      chests: [
        {
          id: `ch_${castleId}_3`,
          x: 690,
          y: 362 - 42,
          gold: 45 + castleId * 12,
          xp: 60,
        },
      ],
    };
  }

  // BOSS THRONE ROOM (multi-phase combat altars!)
  const platforms: PlatformDef[] = [
    { id: 'arena_floor', x: 0, y: groundY, w: 1280, h: 100, kind: 'solid' },
    { id: 'plat_l', x: 220, y: 392, w: 170, h: 20, kind: 'semisolid' },
    { id: 'plat_m', x: 520, y: 345, w: 200, h: 20, kind: 'semisolid' },
    { id: 'plat_r', x: 830, y: 392, w: 170, h: 20, kind: 'semisolid' },
    { id: 'wall_l', x: -24, y: 0, w: 24, h: 560, kind: 'solid' },
    { id: 'wall_r', x: 1280, y: 0, w: 24, h: 560, kind: 'solid' },
  ];

  const altarPositions = [
    { x: 280, y: 392 - 48 },
    { x: 595, y: 345 - 48 },
    { x: 890, y: 392 - 48 },
  ];

  const placedAltars: AltarPlacement[] = altars.map((ch, idx) => ({
    id: ch.id,
    x: altarPositions[idx]?.x ?? 400 + idx * 240,
    y: altarPositions[idx]?.y ?? groundY - 48,
    label: `Fase ${idx + 1}: ${ch.title}`,
    challenge: { ...ch, bossPhase: idx + 1 },
    unlocksText:
      idx === altars.length - 1
        ? '¡Golpe final contra el Jefe del Castillo!'
        : `Rompe el Escudo Fase ${idx + 1} del Jefe`,
  }));

  return {
    width: 1280,
    height: 560,
    spawn: { x: 90, y: groundY - 56 },
    exitPortal: {
      x: 1170,
      y: groundY - 64,
      requiresAltarIds: altars.map((a) => a.id),
    },
    platforms,
    hazards: [],
    enemies: [],
    altars: placedAltars,
    bonfires: [{ id: `bf_${castleId}_boss`, x: 150, y: groundY - 48 }],
    chests: [],
    boss,
  };
}

// ============================================================================
// THE 6 CASTLES — FULL 24-ROOM CURRICULUM
// ============================================================================

export const CASTLES: CastleDef[] = [
  // --------------------------------------------------------------------------
  // CASTILLO 1: EL BASTIÓN DE LOS ORÍGENES (Fundamentos de JS)
  // --------------------------------------------------------------------------
  {
    id: 1,
    name: 'El Bastión de los Orígenes',
    topic: 'Fundamentos de JavaScript',
    shortTopic: 'Variables, Tipos y Lógica',
    description:
      'Domina variables modernas (const/let), tipos primitivos, operadores estrictos (===), lógica booleana y condicionales.',
    bossName: 'Ignis, el Golem de los Tipos Primitivos',
    mapPos: { x: 13, y: 74 },
    mode: 'console',
    theme: {
      skyTop: '#17132b',
      skyBottom: '#2d2347',
      mountainFar: '#221c38',
      mountainNear: '#33294d',
      tileTop: '#7a6f99',
      tileBody: '#484061',
      tileDark: '#2c263d',
      accent: '#f59e0b',
      torchColor: '#fb923c',
    },
    rooms: [
      {
        id: 'c1_r1',
        castleId: 1,
        roomIndex: 0,
        name: 'Sala 1: Cámara de Iniciación',
        subtitle: 'Variables, Tipos y Template Literals',
        grimoirePageId: 'c1_r1',
        ...buildRoomLayout('intro', 1, [
          {
            id: 'c1_r1_a1',
            title: 'Altar de las Variables Primordiales',
            lore: 'El puente levadizo está sellado por un acertijo de identidad. Inscribe tu presentación con sintaxis moderna para activarlo.',
            technicalSpec:
              'Crea la función presentarHeroe(nombre, nivel) que retorne exactamente el texto: "Héroe <nombre> - Nivel <nivel>" usando template literals.',
            mode: 'console',
            starterCode: `function presentarHeroe(nombre, nivel) {
  // Devuelve: "Héroe <nombre> - Nivel <nivel>"
  return "";
}`,
            solutionCode: `function presentarHeroe(nombre, nivel) {
  const n = nombre ? String(nombre).trim() : "Desconocido";
  const lvl = typeof nivel === "number" && nivel > 0 ? nivel : 1;
  return \`Héroe \${n} - Nivel \${lvl}\`;
}`,
            hints: [
              'Usa comillas invertidas (`) para interpolar variables con ${nombre} y ${nivel}.',
              'Respeta la tilde en "Héroe", los espacios y el guion: `Héroe ${nombre} - Nivel ${nivel}`.',
              'Solución guiada: return `Héroe ${nombre || "Desconocido"} - Nivel ${nivel || 1}`;',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Formato estándar con Lyra nivel 3',
                validateSource: `presentarHeroe("Lyra", 3) === "Héroe Lyra - Nivel 3"`,
                expectedDesc: 'Se esperaba "Héroe Lyra - Nivel 3"',
              },
              {
                id: 't2',
                name: 'Formato estándar con Kael nivel 10',
                validateSource: `presentarHeroe("Kael", 10) === "Héroe Kael - Nivel 10"`,
                expectedDesc: 'Se esperaba "Héroe Kael - Nivel 10"',
              },
            ],
            xpReward: 45,
            goldReward: 25,
            classOverrides: {
              mage: {
                starterCode: `// [Guía del Mago] Usa template literals con comillas invertidas (\` \`)
function presentarHeroe(nombre, nivel) {
  // Paso 1: Inserta \${nombre} y \${nivel} en el texto pedido
  const mensaje = \`Héroe \${nombre} - Nivel \${nivel}\`;
  // Paso 2: Retorna la constante mensaje
  return "";
}`,
              },
              paladin: {
                missionSuffix:
                  '[Paladín] Si nombre es null/vacío usa "Desconocido"; si nivel no es un número > 0 usa 1.',
                extraTests: [
                  {
                    id: 'pal_1',
                    name: '[Caso Borde Paladín] Nombre null y nivel inválido',
                    validateSource: `presentarHeroe(null, 0) === "Héroe Desconocido - Nivel 1"`,
                    expectedDesc: 'Debe devolver "Héroe Desconocido - Nivel 1" ante null/0',
                    isPaladinEdgeCase: true,
                  },
                ],
              },
              rogue: {
                starterCode: `// [Refactor Pícaro] Elimina var y concatenaciones antiguas con +
function presentarHeroe(nombre, nivel) {
  var texto = "Heroe " + nombre + " Nivel " + nivel;
  return texto;
}`,
              },
            },
          },
          {
            id: 'c1_r1_a2',
            title: 'Compuerta de Tipos Estrictos',
            lore: 'Dos runas bloquean la salida: solo si la llave es estrictamente booleana true y el poder es un número mayor o igual a 10 se abrirán.',
            technicalSpec:
              'Crea la función puedeAbrirCompuerta(tieneLlave, poder) que retorne true solo si tieneLlave === true y typeof poder === "number" && poder >= 10.',
            mode: 'console',
            starterCode: `function puedeAbrirCompuerta(tieneLlave, poder) {
  // Verifica estrictamente (===) ambos requisitos
  return false;
}`,
            solutionCode: `function puedeAbrirCompuerta(tieneLlave, poder) {
  return tieneLlave === true && typeof poder === "number" && poder >= 10;
}`,
            hints: [
              'Usa === para comprobar que tieneLlave sea exactamente el booleano true (no "true" ni 1).',
              'Comprueba typeof poder === "number" && poder >= 10.',
              'Retorna directamente: tieneLlave === true && typeof poder === "number" && poder >= 10.',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Abre con true y poder 15',
                validateSource: `puedeAbrirCompuerta(true, 15) === true`,
                expectedDesc: 'Se esperaba true',
              },
              {
                id: 't2',
                name: 'Rechaza string "true" (comparación estricta)',
                validateSource: `puedeAbrirCompuerta("true", 20) === false`,
                expectedDesc: 'Debe devolver false si tieneLlave es el string "true"',
              },
              {
                id: 't3',
                name: 'Rechaza poder menor a 10 o tipo string "15"',
                validateSource: `puedeAbrirCompuerta(true, 9) === false && puedeAbrirCompuerta(true, "15") === false`,
                expectedDesc: 'Debe validar tipo number y >= 10',
              },
            ],
            xpReward: 50,
            goldReward: 25,
            classOverrides: {
              paladin: {
                missionSuffix: '[Paladín] Rechaza también NaN o valores undefined.',
                extraTests: [
                  {
                    id: 'pal_2',
                    name: '[Caso Borde Paladín] Rechaza NaN y undefined',
                    validateSource: `puedeAbrirCompuerta(true, NaN) === false && puedeAbrirCompuerta(undefined, 20) === false`,
                    expectedDesc: 'Debe devolver false ante NaN/undefined',
                    isPaladinEdgeCase: true,
                  },
                ],
              },
            },
          },
        ]),
      },
      {
        id: 'c1_r2',
        castleId: 1,
        roomIndex: 1,
        name: 'Sala 2: Corredor de las Pruebas',
        subtitle: 'Operadores Lógicos y Condicionales',
        grimoirePageId: 'c1_r2',
        ...buildRoomLayout('corridor', 1, [
          {
            id: 'c1_r2_a1',
            title: 'Puente del Operador Ternario',
            lore: 'Los pinchos bajo el corredor solo se retraen si clasificas el estado de combate del héroe con exactitud.',
            technicalSpec:
              'Crea la función clasificarSalud(hp) que retorne "Crítico" si hp <= 25, "Herido" si hp <= 60, y "Saludable" si hp > 60.',
            mode: 'console',
            starterCode: `function clasificarSalud(hp) {
  // Implementa los rangos de salud
}`,
            solutionCode: `function clasificarSalud(hp) {
  if (typeof hp !== "number" || hp < 0 || Number.isNaN(hp)) return "Inválido";
  if (hp <= 25) return "Crítico";
  if (hp <= 60) return "Herido";
  return "Saludable";
}`,
            hints: [
              'Evalúa primero el umbral más bajo (hp <= 25), luego hp <= 60 y por último retorna "Saludable".',
              'Respeta la tilde en "Crítico".',
              'if (hp <= 25) return "Crítico"; if (hp <= 60) return "Herido"; return "Saludable";',
            ],
            testCases: [
              {
                id: 't1',
                name: 'hp = 20 devuelve "Crítico"',
                validateSource: `clasificarSalud(20) === "Crítico"`,
                expectedDesc: 'Se esperaba "Crítico"',
              },
              {
                id: 't2',
                name: 'hp = 50 devuelve "Herido"',
                validateSource: `clasificarSalud(50) === "Herido"`,
                expectedDesc: 'Se esperaba "Herido"',
              },
              {
                id: 't3',
                name: 'hp = 95 devuelve "Saludable"',
                validateSource: `clasificarSalud(95) === "Saludable"`,
                expectedDesc: 'Se esperaba "Saludable"',
              },
            ],
            xpReward: 55,
            goldReward: 30,
            classOverrides: {
              paladin: {
                missionSuffix:
                  '[Paladín] Si hp es negativo, null o no es número, devuelve "Inválido".',
                extraTests: [
                  {
                    id: 'pal_c1r2',
                    name: '[Caso Borde Paladín] Rechaza negativos y null',
                    validateSource: `clasificarSalud(-5) === "Inválido" && clasificarSalud(null) === "Inválido"`,
                    expectedDesc: 'Debe devolver "Inválido" para -5 o null',
                    isPaladinEdgeCase: true,
                  },
                ],
              },
            },
          },
          {
            id: 'c1_r2_a2',
            title: 'Altar Elemental (switch)',
            lore: 'La barrera final responde al daño elemental multiplicado según la afinidad mágica.',
            technicalSpec:
              'Crea la función danoElemental(base, elemento) usando switch o mapa: "fuego" multiplica x2, "hielo" x1.5, "rayo" x2.5, y cualquier otro devuelve base sin cambios.',
            mode: 'console',
            starterCode: `function danoElemental(base, elemento) {
  // fuego: * 2, hielo: * 1.5, rayo: * 2.5, otro: base
}`,
            solutionCode: `function danoElemental(base, elemento) {
  const b = typeof base === "number" ? base : 0;
  switch (elemento) {
    case "fuego": return b * 2;
    case "hielo": return b * 1.5;
    case "rayo": return b * 2.5;
    default: return b;
  }
}`,
            hints: [
              'Usa switch (elemento) con los casos "fuego", "hielo", "rayo" y default.',
              'Si haces return dentro de cada case no necesitas break.',
              'case "fuego": return base * 2; case "hielo": return base * 1.5; case "rayo": return base * 2.5; default: return base;',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Fuego duplica el daño base',
                validateSource: `danoElemental(10, "fuego") === 20`,
                expectedDesc: 'Se esperaba 20',
              },
              {
                id: 't2',
                name: 'Hielo y Rayo aplican su multiplicador',
                validateSource: `danoElemental(10, "hielo") === 15 && danoElemental(10, "rayo") === 25`,
                expectedDesc: 'Se esperaba 15 y 25',
              },
              {
                id: 't3',
                name: 'Elemento desconocido mantiene el valor base',
                validateSource: `danoElemental(12, "tierra") === 12`,
                expectedDesc: 'Se esperaba 12',
              },
            ],
            xpReward: 60,
            goldReward: 30,
          },
        ]),
      },
      {
        id: 'c1_r3',
        castleId: 1,
        roomIndex: 2,
        name: 'Sala 3: Santuario de Especialidad',
        subtitle: 'Prueba de Clase: Lógica de Descuentos y Guardas',
        grimoirePageId: 'c1_r3',
        ...buildRoomLayout('sanctuary', 1, [
          {
            id: 'c1_r3_a1',
            title: 'Altar de la Balanza del Gremio',
            lore: 'El Santuario evalúa tu dominio de las reglas lógicas adaptadas a tu vocación de clase.',
            technicalSpec:
              'Crea la función precioFinal(precio, esMiembro, cuponActivo): aplica 20% de descuento si esMiembro es true; si además cuponActivo es true, resta 10 monedas extra (nunca menos de 0).',
            mode: 'console',
            starterCode: `function precioFinal(precio, esMiembro, cuponActivo) {
  // Calcula el precio con descuentos y límite mínimo de 0
}`,
            solutionCode: `function precioFinal(precio, esMiembro, cuponActivo) {
  if (typeof precio !== "number" || precio < 0 || Number.isNaN(precio)) return 0;
  let total = esMiembro === true ? precio * 0.8 : precio;
  if (cuponActivo === true) total -= 10;
  return Math.max(0, total);
}`,
            hints: [
              'Primero calcula total = esMiembro ? precio * 0.8 : precio.',
              'Luego, si cuponActivo es true, resta 10.',
              'Usa Math.max(0, total) para asegurar que nunca devuelva un número negativo.',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Miembro sin cupón (100 -> 80)',
                validateSource: `precioFinal(100, true, false) === 80`,
                expectedDesc: 'Se esperaba 80',
              },
              {
                id: 't2',
                name: 'Miembro con cupón (100 -> 70)',
                validateSource: `precioFinal(100, true, true) === 70`,
                expectedDesc: 'Se esperaba 70',
              },
              {
                id: 't3',
                name: 'Nunca baja de 0 (5 con cupón -> 0)',
                validateSource: `precioFinal(5, false, true) === 0`,
                expectedDesc: 'Se esperaba 0',
              },
            ],
            xpReward: 70,
            goldReward: 40,
            classOverrides: {
              paladin: {
                missionSuffix: '[Paladín] Si precio es negativo, null o NaN, devuelve 0 sin fallar.',
                extraTests: [
                  {
                    id: 'pal_c1r3',
                    name: '[Caso Borde Paladín] Precio nulo o negativo retorna 0',
                    validateSource: `precioFinal(-50, true, true) === 0 && precioFinal(null, false, false) === 0`,
                    expectedDesc: 'Debe retornar 0 ante entradas inválidas',
                    isPaladinEdgeCase: true,
                  },
                ],
              },
              rogue: {
                starterCode: `// [Refactor Pícaro] Corrige el bug del orden y elimina var
function precioFinal(precio, esMiembro, cuponActivo) {
  var total = precio;
  if (esMiembro == true) { total = total - 20; }
  if (cuponActivo == true) { total = total - 10; }
  return total;
}`,
              },
            },
          },
        ]),
      },
      {
        id: 'c1_r4',
        castleId: 1,
        roomIndex: 3,
        name: 'Sala 4: Trono de Ignis',
        subtitle: 'Jefe: Ignis, el Golem de los Tipos Primitivos',
        grimoirePageId: 'c1_r4',
        ...buildRoomLayout(
          'boss',
          1,
          [
            {
              id: 'c1_boss_p1',
              title: 'Escudo de Tipos de Ignis',
              lore: 'Ignis ruge envolviendo su coraza en tipos corruptos. Identifica con precisión el tipo real de cada reliquia (incluyendo null).',
              technicalSpec:
                'Crea identificarTipo(valor) que retorne "nulo" si valor === null, "numero" si es number (no NaN), "texto" si es string, "booleano" si es boolean, u "otro" en cualquier otro caso.',
              mode: 'console',
              starterCode: `function identificarTipo(valor) {
  // Distingue null, number válido, string, boolean u otro
}`,
              solutionCode: `function identificarTipo(valor) {
  if (valor === null) return "nulo";
  if (typeof valor === "number" && !Number.isNaN(valor)) return "numero";
  if (typeof valor === "string") return "texto";
  if (typeof valor === "boolean") return "booleano";
  return "otro";
}`,
              hints: [
                'Comprueba primero valor === null porque typeof null en JS es "object".',
                'Para números usa typeof valor === "number" && !Number.isNaN(valor).',
                'Devuelve "nulo", "numero", "texto", "booleano" u "otro".',
              ],
              testCases: [
                {
                  id: 't1',
                  name: 'Detecta null correctamente como "nulo"',
                  validateSource: `identificarTipo(null) === "nulo"`,
                  expectedDesc: 'Se esperaba "nulo"',
                },
                {
                  id: 't2',
                  name: 'Detecta numero, texto y booleano',
                  validateSource: `identificarTipo(42) === "numero" && identificarTipo("hola") === "texto" && identificarTipo(false) === "booleano"`,
                  expectedDesc: 'Debe clasificar 42, "hola" y false',
                },
                {
                  id: 't3',
                  name: 'NaN y undefined devuelven "otro"',
                  validateSource: `identificarTipo(NaN) === "otro" && identificarTipo(undefined) === "otro"`,
                  expectedDesc: 'NaN y undefined deben devolver "otro"',
                },
              ],
              xpReward: 90,
              goldReward: 50,
            },
            {
              id: 'c1_boss_p2',
              title: 'Núcleo de Lava de Ignis (Golpe Final)',
              lore: 'El escudo exterior cayó. Apaga el núcleo ardiente combinando condiciones lógicas estrictas.',
              technicalSpec:
                'Crea golpeFinalIgnis(temperatura, tieneHielo, mana) que retorne "VICTORIA" si (tieneHielo === true && mana >= 20) o si temperatura <= 0; de lo contrario retorna "RESISTE".',
              mode: 'console',
              starterCode: `function golpeFinalIgnis(temperatura, tieneHielo, mana) {
  // Devuelve "VICTORIA" o "RESISTE"
}`,
              solutionCode: `function golpeFinalIgnis(temperatura, tieneHielo, mana) {
  const golpeHielo = tieneHielo === true && typeof mana === "number" && mana >= 20;
  const congelado = typeof temperatura === "number" && temperatura <= 0;
  return golpeHielo || congelado ? "VICTORIA" : "RESISTE";
}`,
              hints: [
                'Usa el operador || entre las dos condiciones de victoria.',
                'Primera condición: tieneHielo === true && mana >= 20. Segunda: temperatura <= 0.',
                'return (tieneHielo === true && mana >= 20) || temperatura <= 0 ? "VICTORIA" : "RESISTE";',
              ],
              testCases: [
                {
                  id: 't1',
                  name: 'Gana con hielo y suficiente maná',
                  validateSource: `golpeFinalIgnis(500, true, 25) === "VICTORIA"`,
                  expectedDesc: 'Se esperaba "VICTORIA"',
                },
                {
                  id: 't2',
                  name: 'Gana si temperatura <= 0',
                  validateSource: `golpeFinalIgnis(0, false, 0) === "VICTORIA"`,
                  expectedDesc: 'Se esperaba "VICTORIA"',
                },
                {
                  id: 't3',
                  name: 'Ignis resiste sin hielo ni frío suficiente',
                  validateSource: `golpeFinalIgnis(100, true, 10) === "RESISTE"`,
                  expectedDesc: 'Se esperaba "RESISTE"',
                },
              ],
              xpReward: 130,
              goldReward: 80,
            },
          ],
          {
            id: 'boss_ignis',
            name: 'Ignis',
            title: 'Golem de los Tipos Primitivos',
            spriteKey: 'boss_ignis',
            x: 1020,
            y: 355,
            maxPhases: 2,
            attackInterval: 2.6,
            damage: 14,
            taunt: '¡Mis runas de coerción derretirán tu lógica!',
            defeatQuote: 'Imposible... ¡tu tipado estricto ha extinguido mi núcleo!',
          }
        ),
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CASTILLO 2: LA FORTALEZA DE LOS CICLOS (Control de Flujo y Funciones)
  // --------------------------------------------------------------------------
  {
    id: 2,
    name: 'La Fortaleza de los Ciclos',
    topic: 'Control de Flujo y Funciones',
    shortTopic: 'Bucles, Arrow Functions y Closures',
    description:
      'Domina bucles for/while/for...of, break y continue, funciones flecha, parámetros por defecto y closures.',
    bossName: 'Ouroboros, la Serpiente del Bucle Infinito',
    mapPos: { x: 29, y: 52 },
    mode: 'console',
    theme: {
      skyTop: '#0d1f1a',
      skyBottom: '#1c3b31',
      mountainFar: '#142b24',
      mountainNear: '#214539',
      tileTop: '#4e8a74',
      tileBody: '#2d5446',
      tileDark: '#1b362d',
      accent: '#34d399',
      torchColor: '#4ade80',
    },
    rooms: [
      {
        id: 'c2_r1',
        castleId: 2,
        roomIndex: 0,
        name: 'Sala 1: Cámara de Iniciación',
        subtitle: 'Bucles for y Acumuladores',
        grimoirePageId: 'c2_r1',
        ...buildRoomLayout('intro', 2, [
          {
            id: 'c2_r1_a1',
            title: 'Altar de la Suma Iterativa',
            lore: 'El puente exige sumar el poder de los primeros N cristales pares sin caer en un bucle infinito.',
            technicalSpec:
              'Crea sumarPares(n) que sume todos los números pares desde 1 hasta n inclusive (ej. sumarPares(6) => 2 + 4 + 6 = 12).',
            mode: 'console',
            starterCode: `function sumarPares(n) {
  let total = 0;
  // Recorre desde 1 hasta n sumando solo los pares
  return total;
}`,
            solutionCode: `function sumarPares(n) {
  if (typeof n !== "number" || n < 2) return 0;
  let total = 0;
  for (let i = 2; i <= n; i += 2) {
    total += i;
  }
  return total;
}`,
            hints: [
              'Usa un bucle for (let i = 1; i <= n; i++) y comprueba if (i % 2 === 0).',
              'También puedes avanzar de 2 en 2: for (let i = 2; i <= n; i += 2) total += i.',
              'Retorna total fuera del bucle. Si n < 2 debe devolver 0.',
            ],
            testCases: [
              {
                id: 't1',
                name: 'sumarPares(6) devuelve 12',
                validateSource: `sumarPares(6) === 12`,
                expectedDesc: 'Se esperaba 12 (2 + 4 + 6)',
              },
              {
                id: 't2',
                name: 'sumarPares(10) devuelve 30',
                validateSource: `sumarPares(10) === 30`,
                expectedDesc: 'Se esperaba 30',
              },
              {
                id: 't3',
                name: 'sumarPares(1) devuelve 0',
                validateSource: `sumarPares(1) === 0`,
                expectedDesc: 'Se esperaba 0',
              },
            ],
            xpReward: 55,
            goldReward: 30,
            classOverrides: {
              paladin: {
                missionSuffix: '[Paladín] Si n es negativo o null, retorna 0.',
                extraTests: [
                  {
                    id: 'pal_c2r1',
                    name: '[Caso Borde Paladín] Negativos y null devuelven 0',
                    validateSource: `sumarPares(-4) === 0 && sumarPares(null) === 0`,
                    expectedDesc: 'Debe devolver 0 para -4 y null',
                    isPaladinEdgeCase: true,
                  },
                ],
              },
              rogue: {
                starterCode: `// [Refactor Pícaro] Elimina var y optimiza el bucle
function sumarPares(n) {
  var suma = 0;
  for (var i = 0; i < n; i++) {
    if (i % 2 == 0) suma = suma + i;
  }
  return suma;
}`,
              },
            },
          },
          {
            id: 'c2_r1_a2',
            title: 'Compuerta de Búsqueda con break',
            lore: 'Encuentra la primera runa corrupta antes de que selle el corredor.',
            technicalSpec:
              'Crea encontrarPrimerNegativo(numeros) que recorra el array y devuelva el primer número menor a 0, o null si no hay ninguno.',
            mode: 'console',
            starterCode: `function encontrarPrimerNegativo(numeros) {
  // Devuelve el primer número < 0 o null
}`,
            solutionCode: `function encontrarPrimerNegativo(numeros) {
  if (!Array.isArray(numeros)) return null;
  for (const num of numeros) {
    if (typeof num === "number" && num < 0) return num;
  }
  return null;
}`,
            hints: [
              'Recorre numeros con for (const num of numeros).',
              'Si num < 0, haz return num inmediatamente.',
              'Después del bucle, retorna null.',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Encuentra -3 en [4, 2, -3, -8]',
                validateSource: `encontrarPrimerNegativo([4, 2, -3, -8]) === -3`,
                expectedDesc: 'Se esperaba -3',
              },
              {
                id: 't2',
                name: 'Devuelve null si todos son positivos',
                validateSource: `encontrarPrimerNegativo([1, 5, 0]) === null`,
                expectedDesc: 'Se esperaba null',
              },
            ],
            xpReward: 60,
            goldReward: 30,
          },
        ]),
      },
      {
        id: 'c2_r2',
        castleId: 2,
        roomIndex: 1,
        name: 'Sala 2: Corredor de las Pruebas',
        subtitle: 'Arrow Functions y Parámetros por Defecto',
        grimoirePageId: 'c2_r2',
        ...buildRoomLayout('corridor', 2, [
          {
            id: 'c2_r2_a1',
            title: 'Puente de la Flecha Certera',
            lore: 'Forja una función flecha con parámetros por defecto para calibrar los cañones del puente.',
            technicalSpec:
              'Define const calcularAtaque = (base, bono = 5, critico = false) => ... que sume base + bono, y si critico es true multiplique el resultado por 2.',
            mode: 'console',
            starterCode: `const calcularAtaque = (base, bono = 5, critico = false) => {
  // Calcula (base + bono) y duplica si critico es true
};`,
            solutionCode: `const calcularAtaque = (base, bono = 5, critico = false) => {
  const b = typeof base === "number" ? base : 0;
  const sum = b + bono;
  return critico === true ? sum * 2 : sum;
};`,
            hints: [
              'Suma primero base + bono.',
              'Si critico === true, multiplica por 2.',
              'const calcularAtaque = (base, bono = 5, critico = false) => critico ? (base + bono) * 2 : base + bono;',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Usa valores por defecto: calcularAtaque(10) === 15',
                validateSource: `calcularAtaque(10) === 15`,
                expectedDesc: 'Se esperaba 15 (10 + 5)',
              },
              {
                id: 't2',
                name: 'Aplica golpe crítico: calcularAtaque(10, 10, true) === 40',
                validateSource: `calcularAtaque(10, 10, true) === 40`,
                expectedDesc: 'Se esperaba 40',
              },
            ],
            xpReward: 65,
            goldReward: 35,
          },
          {
            id: 'c2_r2_a2',
            title: 'Altar de Vocales con continue',
            lore: 'Filtra los susurros mágicos contando cuántas vocales resuenan en el conjuro.',
            technicalSpec:
              'Crea contarVocales(texto) que cuente cuántas vocales (a, e, i, o, u, sin distinguir mayúsculas) hay en texto.',
            mode: 'console',
            starterCode: `function contarVocales(texto) {
  // Cuenta las vocales a, e, i, o, u (mayúsculas o minúsculas)
}`,
            solutionCode: `function contarVocales(texto) {
  if (typeof texto !== "string") return 0;
  let count = 0;
  for (const ch of texto.toLowerCase()) {
    if ("aeiou".includes(ch)) count++;
  }
  return count;
}`,
            hints: [
              'Convierte texto a minúsculas con texto.toLowerCase().',
              'Itera cada carácter con for (const ch of texto.toLowerCase()).',
              'Si "aeiou".includes(ch), incrementa el contador.',
            ],
            testCases: [
              {
                id: 't1',
                name: 'contarVocales("Dragon") === 2',
                validateSource: `contarVocales("Dragon") === 2`,
                expectedDesc: 'Se esperaba 2',
              },
              {
                id: 't2',
                name: 'contarVocales("AEIOU") === 5',
                validateSource: `contarVocales("AEIOU") === 5`,
                expectedDesc: 'Se esperaba 5',
              },
            ],
            xpReward: 65,
            goldReward: 35,
          },
        ]),
      },
      {
        id: 'c2_r3',
        castleId: 2,
        roomIndex: 2,
        name: 'Sala 3: Santuario de Especialidad',
        subtitle: 'Scope Léxico y Closures',
        grimoirePageId: 'c2_r3',
        ...buildRoomLayout('sanctuary', 2, [
          {
            id: 'c2_r3_a1',
            title: 'Altar del Reloj de Clausura',
            lore: 'El Santuario exige encapsular un contador privado que nadie pueda manipular desde el exterior.',
            technicalSpec:
              'Crea crearContadorMana(inicial = 0) que retorne una función. Cada vez que se invoque la función con un paso (por defecto 1), debe sumar ese paso al total privado y devolver el nuevo valor.',
            mode: 'console',
            starterCode: `function crearContadorMana(inicial = 0) {
  // Encapsula el estado con un closure y retorna una función
}`,
            solutionCode: `function crearContadorMana(inicial = 0) {
  let total = typeof inicial === "number" ? inicial : 0;
  return (paso = 1) => {
    const delta = typeof paso === "number" ? paso : 0;
    total += delta;
    return total;
  };
}`,
            hints: [
              'Declara let total = inicial; dentro de crearContadorMana.',
              'Retorna una arrow function: return (paso = 1) => { total += paso; return total; };',
              'Cada llamada a crearContadorMana debe mantener su propia variable total independiente.',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Incrementa secuencialmente manteniendo estado privado',
                validateSource: `(() => { const c = crearContadorMana(10); return c() === 11 && c(5) === 16; })()`,
                expectedDesc: 'Se esperaba 11 y luego 16',
              },
              {
                id: 't2',
                name: 'Dos contadores son independientes entre sí',
                validateSource: `(() => { const a = crearContadorMana(0); const b = crearContadorMana(100); a(3); return b(1) === 101 && a() === 4; })()`,
                expectedDesc: 'Cada closure debe tener su propio ámbito privado',
              },
            ],
            xpReward: 85,
            goldReward: 45,
            classOverrides: {
              paladin: {
                missionSuffix: '[Paladín] Si paso no es número, no alteres el total.',
                extraTests: [
                  {
                    id: 'pal_c2r3',
                    name: '[Caso Borde Paladín] Ignora argumentos no numéricos',
                    validateSource: `(() => { const c = crearContadorMana(5); return c("error") === 5; })()`,
                    expectedDesc: 'Debe mantener 5 si paso no es number',
                    isPaladinEdgeCase: true,
                  },
                ],
              },
            },
          },
        ]),
      },
      {
        id: 'c2_r4',
        castleId: 2,
        roomIndex: 3,
        name: 'Sala 4: Trono de Ouroboros',
        subtitle: 'Jefe: Ouroboros, la Serpiente del Bucle Infinito',
        grimoirePageId: 'c2_r4',
        ...buildRoomLayout(
          'boss',
          2,
          [
            {
              id: 'c2_boss_p1',
              title: 'Escama de Fibonacci',
              lore: 'Ouroboros se enrosca en espirales matemáticas. Genera la secuencia exacta sin recursión infinita.',
              technicalSpec:
                'Crea generarSerie(n) que devuelva un array con los primeros n números de Fibonacci (ej. n=5 => [0, 1, 1, 2, 3]).',
              mode: 'console',
              starterCode: `function generarSerie(n) {
  // Devuelve los primeros n números de Fibonacci en un array
}`,
              solutionCode: `function generarSerie(n) {
  if (typeof n !== "number" || n <= 0) return [];
  if (n === 1) return [0];
  const res = [0, 1];
  for (let i = 2; i < n; i++) {
    res.push(res[i - 1] + res[i - 2]);
  }
  return res;
}`,
              hints: [
                'Si n <= 0 retorna []. Si n === 1 retorna [0].',
                'Inicia const res = [0, 1] y usa for (let i = 2; i < n; i++).',
                'En cada iteración: res.push(res[i - 1] + res[i - 2]);',
              ],
              testCases: [
                {
                  id: 't1',
                  name: 'generarSerie(5) => [0,1,1,2,3]',
                  validateSource: `JSON.stringify(generarSerie(5)) === "[0,1,1,2,3]"`,
                  expectedDesc: 'Se esperaba [0, 1, 1, 2, 3]',
                },
                {
                  id: 't2',
                  name: 'generarSerie(1) => [0] y generarSerie(0) => []',
                  validateSource: `JSON.stringify(generarSerie(1)) === "[0]" && JSON.stringify(generarSerie(0)) === "[]"`,
                  expectedDesc: 'Debe manejar n=1 y n=0 correctamente',
                },
              ],
              xpReward: 100,
              goldReward: 55,
            },
            {
              id: 'c2_boss_p2',
              title: 'Sello de Clausura (Golpe Final)',
              lore: 'Encierra el veneno de Ouroboros creando una fábrica de sellos con límite máximo.',
              technicalSpec:
                'Crea crearSelloLimite(maximo) que retorne una función (dano) que acumule el daño sin superar nunca maximo, devolviendo el total acumulado.',
              mode: 'console',
              starterCode: `function crearSelloLimite(maximo) {
  // Retorna una función que acumula daño con tope en maximo
}`,
              solutionCode: `function crearSelloLimite(maximo) {
  let acumulado = 0;
  return (dano = 0) => {
    const val = typeof dano === "number" && dano > 0 ? dano : 0;
    acumulado = Math.min(maximo, acumulado + val);
    return acumulado;
  };
}`,
              hints: [
                'Declara let acumulado = 0 dentro de crearSelloLimite.',
                'En la función retornada: acumulado = Math.min(maximo, acumulado + dano).',
                'Devuelve acumulado tras cada invocación.',
              ],
              testCases: [
                {
                  id: 't1',
                  name: 'Acumula daño hasta el tope sin excederlo',
                  validateSource: `(() => { const s = crearSelloLimite(50); return s(20) === 20 && s(25) === 45 && s(30) === 50; })()`,
                  expectedDesc: 'Se esperaba 20, luego 45 y finalmente 50',
                },
              ],
              xpReward: 145,
              goldReward: 95,
            },
          ],
          {
            id: 'boss_ouroboros',
            name: 'Ouroboros',
            title: 'Serpiente del Bucle Infinito',
            spriteKey: 'boss_ouroboros',
            x: 1020,
            y: 350,
            maxPhases: 2,
            attackInterval: 2.4,
            damage: 16,
            taunt: '¡Tu código girará eternamente en mis anillos!',
            defeatQuote: '¡Has roto mi ciclo sin fin... mi veneno se detiene!',
          }
        ),
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CASTILLO 3: LA CIUDADELA DE LAS ESTRUCTURAS (Arrays, Objetos y ES6+)
  // --------------------------------------------------------------------------
  {
    id: 3,
    name: 'La Ciudadela de las Estructuras',
    topic: 'Arrays, Objetos y ES6+',
    shortTopic: 'Destructuring, Spread, map/filter/reduce',
    description:
      'Transforma colecciones complejas con destructuring, spread/rest, map, filter, find, reduce y ordenamiento inmutable.',
    bossName: 'Archivista Malakor, Señor de los Objetos Anidados',
    mapPos: { x: 46, y: 31 },
    mode: 'console',
    theme: {
      skyTop: '#161029',
      skyBottom: '#2d1c52',
      mountainFar: '#1f153b',
      mountainNear: '#32225e',
      tileTop: '#8b6fd6',
      tileBody: '#4d3a80',
      tileDark: '#2c204d',
      accent: '#a78bfa',
      torchColor: '#c084fc',
    },
    rooms: [
      {
        id: 'c3_r1',
        castleId: 3,
        roomIndex: 0,
        name: 'Sala 1: Cámara de Iniciación',
        subtitle: 'Destructuring y Spread Inmutable',
        grimoirePageId: 'c3_r1',
        ...buildRoomLayout('intro', 3, [
          {
            id: 'c3_r1_a1',
            title: 'Altar de la Clonación Inmutable',
            lore: 'El puente exige actualizar la ficha de un héroe SIN mutar el pergamino original.',
            technicalSpec:
              'Crea subirNivelHeroe(heroe, bonoHp = 20) que retorne un NUEVO objeto copiando todas las propiedades de heroe, incrementando nivel en +1 y hp en +bonoHp, sin mutar heroe.',
            mode: 'console',
            starterCode: `function subirNivelHeroe(heroe, bonoHp = 20) {
  // Usa spread (...) y destructuring sin mutar el objeto original
}`,
            solutionCode: `function subirNivelHeroe(heroe, bonoHp = 20) {
  if (!heroe || typeof heroe !== "object") return { nivel: 1, hp: bonoHp };
  const { nivel = 1, hp = 0 } = heroe;
  return { ...heroe, nivel: nivel + 1, hp: hp + bonoHp };
}`,
            hints: [
              'Usa { ...heroe, nivel: heroe.nivel + 1, hp: heroe.hp + bonoHp }.',
              'NO hagas heroe.nivel++ porque mutaría el objeto original.',
              'Verifica que el objeto retornado sea una referencia distinta (nuevo !== original).',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Incrementa nivel y hp correctamente',
                validateSource: `(() => { const h = { nombre: "Aria", nivel: 2, hp: 80 }; const n = subirNivelHeroe(h, 15); return n.nivel === 3 && n.hp === 95 && n.nombre === "Aria"; })()`,
                expectedDesc: 'Debe devolver { nombre: "Aria", nivel: 3, hp: 95 }',
              },
              {
                id: 't2',
                name: 'Mantiene inmutable el objeto original',
                validateSource: `(() => { const h = { nombre: "Aria", nivel: 2, hp: 80 }; const n = subirNivelHeroe(h); return h.nivel === 2 && h.hp === 80 && n !== h; })()`,
                expectedDesc: 'El objeto original no debe ser modificado',
              },
            ],
            xpReward: 70,
            goldReward: 35,
            classOverrides: {
              paladin: {
                missionSuffix: '[Paladín] Si heroe es null, devuelve { nivel: 1, hp: bonoHp }.',
                extraTests: [
                  {
                    id: 'pal_c3r1',
                    name: '[Caso Borde Paladín] Sobrevive a heroe null',
                    validateSource: `subirNivelHeroe(null, 20).nivel === 1`,
                    expectedDesc: 'No debe lanzar TypeError ante null',
                    isPaladinEdgeCase: true,
                  },
                ],
              },
            },
          },
          {
            id: 'c3_r1_a2',
            title: 'Compuerta de Fusión de Inventarios',
            lore: 'Combina dos mochilas de reliquias en una sola lista sin duplicar nombres.',
            technicalSpec:
              'Crea fusionarObjetos(listaA, listaB) que combine ambos arrays con spread y retorne un nuevo array sin elementos duplicados.',
            mode: 'console',
            starterCode: `function fusionarObjetos(listaA, listaB) {
  // Combina ambos arrays sin duplicados
}`,
            solutionCode: `function fusionarObjetos(listaA, listaB) {
  const a = Array.isArray(listaA) ? listaA : [];
  const b = Array.isArray(listaB) ? listaB : [];
  return [...new Set([...a, ...b])];
}`,
            hints: [
              'Puedes unir ambos arrays con [...listaA, ...listaB].',
              'Set elimina duplicados automáticamente: [...new Set([...listaA, ...listaB])].',
              'Asegúrate de retornar un array real, no un Set.',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Combina y elimina duplicados',
                validateSource: `JSON.stringify(fusionarObjetos(["espada", "pocion"], ["pocion", "escudo"])) === '["espada","pocion","escudo"]'`,
                expectedDesc: 'Se esperaba ["espada", "pocion", "escudo"]',
              },
            ],
            xpReward: 70,
            goldReward: 35,
          },
        ]),
      },
      {
        id: 'c3_r2',
        castleId: 3,
        roomIndex: 1,
        name: 'Sala 2: Corredor de las Pruebas',
        subtitle: 'Métodos Funcionales: filter, map y find',
        grimoirePageId: 'c3_r2',
        ...buildRoomLayout('corridor', 3, [
          {
            id: 'c3_r2_a1',
            title: 'Puente de los Hechizos Filtrados',
            lore: 'Solo los hechizos accesibles para tu reserva de maná activarán las piedras del puente.',
            technicalSpec:
              'Crea nombresHechizosDisponibles(hechizos, manaMax) que filtre los hechizos con costo <= manaMax y devuelva un array con sus nombres en MAYÚSCULAS.',
            mode: 'console',
            starterCode: `function nombresHechizosDisponibles(hechizos, manaMax) {
  // Usa .filter() y .map()
}`,
            solutionCode: `function nombresHechizosDisponibles(hechizos, manaMax) {
  if (!Array.isArray(hechizos)) return [];
  return hechizos
    .filter((h) => h && h.costo <= manaMax)
    .map((h) => String(h.nombre).toUpperCase());
}`,
            hints: [
              'Aplica primero hechizos.filter(h => h.costo <= manaMax).',
              'Encadena .map(h => h.nombre.toUpperCase()).',
              'Retorna el array resultante.',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Filtra por costo y transforma nombres a mayúsculas',
                validateSource: `JSON.stringify(nombresHechizosDisponibles([{nombre:"Fuego",costo:15},{nombre:"Meteoro",costo:50},{nombre:"Luz",costo:5}], 20)) === '["FUEGO","LUZ"]'`,
                expectedDesc: 'Se esperaba ["FUEGO", "LUZ"]',
              },
            ],
            xpReward: 75,
            goldReward: 40,
            classOverrides: {
              rogue: {
                starterCode: `// [Refactor Pícaro] Reemplaza este código imperativo con .filter() y .map()
function nombresHechizosDisponibles(hechizos, manaMax) {
  var res = [];
  for (var i = 0; i < hechizos.length; i++) {
    if (hechizos[i].costo < manaMax) res.push(hechizos[i].nombre);
  }
  return res;
}`,
              },
            },
          },
          {
            id: 'c3_r2_a2',
            title: 'Altar del Buscador Preciso (find)',
            lore: 'Encuentra la reliquia exacta por su código antes de que la torreta dispare.',
            technicalSpec:
              'Crea buscarReliquia(reliquias, idBuscado) que use .find() para devolver el objeto cuya propiedad id coincida con idBuscado, o null si no existe.',
            mode: 'console',
            starterCode: `function buscarReliquia(reliquias, idBuscado) {
  // Devuelve el objeto encontrado o null
}`,
            solutionCode: `function buscarReliquia(reliquias, idBuscado) {
  if (!Array.isArray(reliquias)) return null;
  return reliquias.find((r) => r && r.id === idBuscado) ?? null;
}`,
            hints: [
              'reliquias.find(r => r.id === idBuscado) retorna el objeto o undefined.',
              'Usa ?? null (o || null) para retornar null cuando no exista.',
              'return reliquias.find(r => r.id === idBuscado) ?? null;',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Encuentra reliquia existente',
                validateSource: `buscarReliquia([{id:"r1",nombre:"Orbe"},{id:"r2",nombre:"Cetro"}], "r2")?.nombre === "Cetro"`,
                expectedDesc: 'Debe retornar el objeto con id "r2"',
              },
              {
                id: 't2',
                name: 'Retorna null si no existe',
                validateSource: `buscarReliquia([{id:"r1",nombre:"Orbe"}], "r9") === null`,
                expectedDesc: 'Se esperaba null',
              },
            ],
            xpReward: 75,
            goldReward: 40,
          },
        ]),
      },
      {
        id: 'c3_r3',
        castleId: 3,
        roomIndex: 2,
        name: 'Sala 3: Santuario de Especialidad',
        subtitle: 'Agregación con reduce y sort Inmutable',
        grimoirePageId: 'c3_r3',
        ...buildRoomLayout('sanctuary', 3, [
          {
            id: 'c3_r3_a1',
            title: 'Altar del Tesoro Ponderado',
            lore: 'El Santuario mide tu precisión al reducir un cofre lleno de gemas a su valor total.',
            technicalSpec:
              'Crea calcularBotin(items) que reciba objetos { oro, cantidad } y use .reduce() para retornar la suma total de (oro * cantidad).',
            mode: 'console',
            starterCode: `function calcularBotin(items) {
  // Suma (item.oro * item.cantidad) usando reduce
}`,
            solutionCode: `function calcularBotin(items) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((acc, item) => {
    const oro = typeof item?.oro === "number" ? item.oro : 0;
    const cant = typeof item?.cantidad === "number" ? item.cantidad : 0;
    return acc + oro * cant;
  }, 0);
}`,
            hints: [
              'Inicia el acumulador de reduce en 0: items.reduce((acc, item) => ..., 0).',
              'En cada paso retorna acc + item.oro * item.cantidad.',
              'Si el array está vacío, el valor inicial 0 asegura que retorne 0.',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Calcula total correcto de múltiples gemas',
                validateSource: `calcularBotin([{oro:10,cantidad:3},{oro:25,cantidad:2}]) === 80`,
                expectedDesc: 'Se esperaba 80 (30 + 50)',
              },
              {
                id: 't2',
                name: 'Array vacío retorna 0',
                validateSource: `calcularBotin([]) === 0`,
                expectedDesc: 'Se esperaba 0',
              },
            ],
            xpReward: 95,
            goldReward: 50,
            classOverrides: {
              paladin: {
                missionSuffix: '[Paladín] Tolera objetos sin cantidad o items null devolviendo 0.',
                extraTests: [
                  {
                    id: 'pal_c3r3',
                    name: '[Caso Borde Paladín] Maneja items null y datos incompletos',
                    validateSource: `calcularBotin(null) === 0 && calcularBotin([{oro:10}]) === 0`,
                    expectedDesc: 'No debe retornar NaN ni lanzar errores',
                    isPaladinEdgeCase: true,
                  },
                ],
              },
            },
          },
        ]),
      },
      {
        id: 'c3_r4',
        castleId: 3,
        roomIndex: 3,
        name: 'Sala 4: Trono de Malakor',
        subtitle: 'Jefe: Archivista Malakor, Señor de los Objetos Anidados',
        grimoirePageId: 'c3_r4',
        ...buildRoomLayout(
          'boss',
          3,
          [
            {
              id: 'c3_boss_p1',
              title: 'Archivo de Agrupación',
              lore: 'Malakor dispersa sus tomos por escuela mágica. Agrúpalos sumando su poder para fracturar su barrera.',
              technicalSpec:
                'Crea agruparPoderPorTipo(tomos) que reciba objetos { tipo, poder } y retorne un objeto con la suma de poder por cada tipo (ej. { fuego: 50, hielo: 20 }).',
              mode: 'console',
              starterCode: `function agruparPoderPorTipo(tomos) {
  // Devuelve un objeto { [tipo]: sumaDePoder }
}`,
              solutionCode: `function agruparPoderPorTipo(tomos) {
  if (!Array.isArray(tomos)) return {};
  return tomos.reduce((acc, t) => {
    if (!t || !t.tipo) return acc;
    acc[t.tipo] = (acc[t.tipo] || 0) + (Number(t.poder) || 0);
    return acc;
  }, {});
}`,
              hints: [
                'Usa reduce con {} como valor inicial.',
                'En cada elemento: acc[t.tipo] = (acc[t.tipo] || 0) + t.poder; return acc;',
                'Asegúrate de retornar acc en cada iteración de reduce.',
              ],
              testCases: [
                {
                  id: 't1',
                  name: 'Agrupa y suma poder correctamente por tipo',
                  validateSource: `(() => { const r = agruparPoderPorTipo([{tipo:"fuego",poder:30},{tipo:"hielo",poder:20},{tipo:"fuego",poder:25}]); return r.fuego === 55 && r.hielo === 20; })()`,
                  expectedDesc: 'Se esperaba { fuego: 55, hielo: 20 }',
                },
              ],
              xpReward: 115,
              goldReward: 65,
            },
            {
              id: 'c3_boss_p2',
              title: 'Índice Inmutable (Golpe Final)',
              lore: 'Ordena los sellos del Archivista de mayor a menor nivel SIN alterar su lista original.',
              technicalSpec:
                'Crea topHeroes(heroes, limite) que ordene de mayor a menor por propiedad poder sin mutar el array original y devuelva los primeros `limite` nombres.',
              mode: 'console',
              starterCode: `function topHeroes(heroes, limite) {
  // Clona, ordena descendentemente por .poder, corta hasta limite y devuelve nombres
}`,
              solutionCode: `function topHeroes(heroes, limite) {
  if (!Array.isArray(heroes) || limite <= 0) return [];
  return [...heroes]
    .sort((a, b) => b.poder - a.poder)
    .slice(0, limite)
    .map((h) => h.nombre);
}`,
              hints: [
                'Clona primero con [...heroes] para no mutar el array de entrada.',
                'Ordena con .sort((a, b) => b.poder - a.poder).',
                'Aplica .slice(0, limite).map(h => h.nombre).',
              ],
              testCases: [
                {
                  id: 't1',
                  name: 'Devuelve el top 2 sin mutar el array original',
                  validateSource: `(() => { const arr = [{nombre:"A",poder:10},{nombre:"B",poder:90},{nombre:"C",poder:50}]; const top = topHeroes(arr, 2); return JSON.stringify(top) === '["B","C"]' && arr[0].nombre === "A"; })()`,
                  expectedDesc: 'Se esperaba ["B", "C"] sin modificar el orden original',
                },
              ],
              xpReward: 160,
              goldReward: 110,
            },
          ],
          {
            id: 'boss_malakor',
            name: 'Malakor',
            title: 'Señor de los Objetos Anidados',
            spriteKey: 'boss_malakor',
            x: 1020,
            y: 350,
            maxPhases: 2,
            attackInterval: 2.3,
            damage: 18,
            taunt: '¡Mutarás tus propias referencias hasta perderte en mis archivos!',
            defeatQuote: '¡Impecable inmutabilidad... mis grimorios te pertenecen!',
          }
        ),
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CASTILLO 4: LA TORRE DEL DOM Y LOS EVENTOS (Espejo Arcano DOM)
  // --------------------------------------------------------------------------
  {
    id: 4,
    name: 'La Torre del DOM y los Eventos',
    topic: 'DOM y Eventos Interactivos',
    shortTopic: 'querySelector, createElement, Events',
    description:
      'Activa el Espejo Arcano DOM: selecciona nodos, manipula clases y estilos en vivo, crea elementos y domina eventos y formularios.',
    bossName: 'Aracne, la Reina de la Telaraña del DOM',
    mapPos: { x: 62, y: 63 },
    mode: 'dom',
    theme: {
      skyTop: '#1b1024',
      skyBottom: '#3c194a',
      mountainFar: '#261433',
      mountainNear: '#401e52',
      tileTop: '#b064d6',
      tileBody: '#5d3175',
      tileDark: '#331942',
      accent: '#e879f9',
      torchColor: '#f472b6',
    },
    rooms: [
      {
        id: 'c4_r1',
        castleId: 4,
        roomIndex: 0,
        name: 'Sala 1: Cámara de Iniciación',
        subtitle: 'Espejo Arcano: Selección y Clases DOM',
        grimoirePageId: 'c4_r1',
        ...buildRoomLayout('intro', 4, [
          {
            id: 'c4_r1_a1',
            title: 'Altar de la Puerta Sellada (DOM)',
            lore: 'El Espejo Arcano muestra una puerta mágica bloqueada. Manipula el nodo real para abrirla.',
            technicalSpec:
              'Selecciona #estado-puerta y cambia su textContent a "ABIERTA". Selecciona #btn-cruzar, quítale el atributo "disabled" y añádele la clase "activa".',
            mode: 'dom',
            initialHtml: `<div class="portal-box">
  <h3 id="estado-puerta">BLOQUEADA</h3>
  <button id="btn-cruzar" disabled>Cruzar Puente</button>
</div>`,
            initialCss: `.portal-box { padding: 14px; background: #1e172e; border: 2px solid #59447a; text-align: center; }
#estado-puerta { color: #f87171; font-weight: bold; margin-bottom: 10px; }
#btn-cruzar { padding: 8px 16px; background: #3f3852; color: #9ca3af; border: 2px solid #524b69; }
#btn-cruzar.activa { background: #10b981; color: #052e16; border-color: #6ee7b7; font-weight: bold; }`,
            starterCode: `// Manipula el DOM del Espejo Arcano
const estado = document.querySelector("#estado-puerta");
const boton = document.querySelector("#btn-cruzar");

// Actualiza el texto, quita disabled y añade la clase "activa"
`,
            solutionCode: `const estado = document.querySelector("#estado-puerta");
const boton = document.querySelector("#btn-cruzar");
if (estado) estado.textContent = "ABIERTA";
if (boton) {
  boton.removeAttribute("disabled");
  boton.classList.add("activa");
}`,
            hints: [
              'Usa estado.textContent = "ABIERTA";',
              'Para habilitar el botón: boton.removeAttribute("disabled");',
              'Para el estilo visual: boton.classList.add("activa");',
            ],
            testCases: [
              {
                id: 't1',
                name: '#estado-puerta muestra "ABIERTA"',
                validateSource: `document.querySelector("#estado-puerta")?.textContent?.trim() === "ABIERTA"`,
                expectedDesc: 'El texto de #estado-puerta debe ser "ABIERTA"',
              },
              {
                id: 't2',
                name: '#btn-cruzar está habilitado y tiene clase "activa"',
                validateSource: `(() => { const b = document.querySelector("#btn-cruzar"); return b && !b.hasAttribute("disabled") && b.classList.contains("activa"); })()`,
                expectedDesc: 'El botón no debe tener disabled y debe incluir la clase "activa"',
              },
            ],
            xpReward: 80,
            goldReward: 40,
          },
          {
            id: 'c4_r1_a2',
            title: 'Compuerta de Runas Múltiples',
            lore: 'Enciende todas las runas apagadas del panel seleccionándolas con querySelectorAll.',
            technicalSpec:
              'Selecciona todos los elementos .runa con document.querySelectorAll(".runa"), añade la clase "encendida" a cada uno y actualiza su textContent a "ON".',
            mode: 'dom',
            initialHtml: `<div class="panel-runas">
  <span class="runa">OFF</span>
  <span class="runa">OFF</span>
  <span class="runa">OFF</span>
</div>`,
            initialCss: `.panel-runas { display: flex; gap: 10px; justify-content: center; padding: 14px; background: #1a1428; }
.runa { padding: 8px 14px; border: 2px solid #4c3b6b; color: #94a3b8; background: #261e38; }
.runa.encendida { border-color: #f59e0b; background: #78350f; color: #fef08a; font-weight: bold; }`,
            starterCode: `const runas = document.querySelectorAll(".runa");
// Recorre todas las runas para encenderlas
`,
            solutionCode: `const runas = document.querySelectorAll(".runa");
runas.forEach((runa) => {
  runa.classList.add("encendida");
  runa.textContent = "ON";
});`,
            hints: [
              'Puedes usar runas.forEach((runa) => { ... }).',
              'Dentro del callback: runa.classList.add("encendida"); y runa.textContent = "ON";',
              'Comprueba que todas las 3 runas cambien en el Espejo Arcano.',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Las 3 runas tienen clase "encendida" y texto "ON"',
                validateSource: `(() => { const rs = [...document.querySelectorAll(".runa")]; return rs.length === 3 && rs.every(r => r.classList.contains("encendida") && r.textContent.trim() === "ON"); })()`,
                expectedDesc: 'Todas las .runa deben tener clase "encendida" y texto "ON"',
              },
            ],
            xpReward: 85,
            goldReward: 45,
          },
        ]),
      },
      {
        id: 'c4_r2',
        castleId: 4,
        roomIndex: 1,
        name: 'Sala 2: Corredor de las Pruebas',
        subtitle: 'Creación Dinámica de Elementos (createElement)',
        grimoirePageId: 'c4_r2',
        ...buildRoomLayout('corridor', 4, [
          {
            id: 'c4_r2_a1',
            title: 'Pergamino del Inventario Dinámico',
            lore: 'El Espejo muestra una mochila vacía. Crea los nodos <li> reales en el DOM desde un array de reliquias.',
            technicalSpec:
              'Crea la función renderizarMochila(items) que limpie #lista-mochila y cree un <li class="item-mochila"> por cada string en items con su textContent. Luego invócala con ["Espada", "Poción", "Antorcha"].',
            mode: 'dom',
            initialHtml: `<div class="mochila-box">
  <h4>Mochila del Héroe</h4>
  <ul id="lista-mochila"></ul>
</div>`,
            initialCss: `.mochila-box { padding: 12px; background: #1a1526; border: 2px solid #524375; }
#lista-mochila { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-direction: column; gap: 6px; }
.item-mochila { padding: 6px 10px; background: #2d2442; border: 1px solid #7c62b3; color: #f8fafc; }`,
            starterCode: `function renderizarMochila(items) {
  const ul = document.querySelector("#lista-mochila");
  // Limpia ul y agrega cada item como <li class="item-mochila">
}

renderizarMochila(["Espada", "Poción", "Antorcha"]);`,
            solutionCode: `function renderizarMochila(items) {
  const ul = document.querySelector("#lista-mochila");
  if (!ul || !Array.isArray(items)) return;
  ul.innerHTML = "";
  for (const nombre of items) {
    const li = document.createElement("li");
    li.className = "item-mochila";
    li.textContent = String(nombre);
    ul.appendChild(li);
  }
}

renderizarMochila(["Espada", "Poción", "Antorcha"]);`,
            hints: [
              'Limpia la lista primero con ul.innerHTML = "";',
              'Crea cada nodo: const li = document.createElement("li"); li.classList.add("item-mochila"); li.textContent = item;',
              'Inserta con ul.appendChild(li);',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Renderiza los 3 elementos iniciales en #lista-mochila',
                validateSource: `(() => { const lis = [...document.querySelectorAll("#lista-mochila li.item-mochila")]; return lis.length === 3 && lis[0].textContent === "Espada" && lis[2].textContent === "Antorcha"; })()`,
                expectedDesc: 'Debe haber 3 <li class="item-mochila"> con Espada, Poción y Antorcha',
              },
              {
                id: 't2',
                name: 'Re-invocar renderizarMochila reemplaza la lista sin duplicar',
                validateSource: `(() => { renderizarMochila(["Llave", "Escudo"]); const lis = [...document.querySelectorAll("#lista-mochila li.item-mochila")]; return lis.length === 2 && lis[1].textContent === "Escudo"; })()`,
                expectedDesc: 'Al volver a llamar la función debe limpiar elementos previos',
              },
            ],
            xpReward: 90,
            goldReward: 45,
          },
          {
            id: 'c4_r2_a2',
            title: 'Interruptor de Antorcha (Evento click)',
            lore: 'Conecta el botón interactivo para que cada clic sume cargas al contador rúnico.',
            technicalSpec:
              'Añade un listener "click" a #btn-cargar para que incremente el número dentro de #contador en +1 cada vez que se haga clic.',
            mode: 'dom',
            initialHtml: `<div class="carga-box">
  <div>Cargas: <strong id="contador">0</strong></div>
  <button id="btn-cargar">Cargar Runa</button>
</div>`,
            initialCss: `.carga-box { display: flex; flex-direction: column; gap: 10px; align-items: center; padding: 14px; background: #181426; border: 2px solid #594a7d; }
#contador { color: #fde047; font-size: 1.4rem; }
#btn-cargar { padding: 8px 14px; background: #6d28d9; color: #fff; border: 2px solid #a78bfa; cursor: pointer; }`,
            starterCode: `let cargas = 0;
const btn = document.querySelector("#btn-cargar");
const contador = document.querySelector("#contador");

// Escucha el evento "click" en btn y actualiza contador.textContent
`,
            solutionCode: `let cargas = 0;
const btn = document.querySelector("#btn-cargar");
const contador = document.querySelector("#contador");
if (btn && contador) {
  btn.addEventListener("click", () => {
    cargas += 1;
    contador.textContent = String(cargas);
  });
}`,
            hints: [
              'Usa btn.addEventListener("click", () => { ... });',
              'Incrementa cargas++ y asigna contador.textContent = String(cargas);',
              'El motor simulará 3 clics reales sobre #btn-cargar para verificar #contador === "3".',
            ],
            testCases: [
              {
                id: 't1',
                name: '3 clics incrementan #contador a "3"',
                validateSource: `(() => { const b = document.querySelector("#btn-cargar"); b.click(); b.click(); b.click(); return document.querySelector("#contador").textContent.trim() === "3"; })()`,
                expectedDesc: 'Tras 3 clics, #contador debe mostrar "3"',
              },
            ],
            xpReward: 95,
            goldReward: 50,
          },
        ]),
      },
      {
        id: 'c4_r3',
        castleId: 4,
        roomIndex: 2,
        name: 'Sala 3: Santuario de Especialidad',
        subtitle: 'Validación de Formularios y preventDefault',
        grimoirePageId: 'c4_r3',
        ...buildRoomLayout('sanctuary', 4, [
          {
            id: 'c4_r3_a1',
            title: 'Altar del Registro de Aventureros',
            lore: 'El formulario del Santuario debe validar nombres antes de aceptarlos sin recargar la página.',
            technicalSpec:
              'Escucha el evento "submit" en #form-registro, llama a e.preventDefault(), lee #input-alias.value.trim(). Si tiene menos de 3 caracteres muestra "Alias muy corto" en #feedback; si es válido muestra "Bienvenido, <alias>" y añade la clase "ok" a #feedback.',
            mode: 'dom',
            initialHtml: `<form id="form-registro" class="reg-form">
  <input id="input-alias" type="text" placeholder="Alias del héroe" />
  <button type="submit">Inscribir</button>
  <p id="feedback"></p>
</form>`,
            initialCss: `.reg-form { display: flex; flex-direction: column; gap: 8px; padding: 14px; background: #191326; border: 2px solid #59447a; }
#input-alias { padding: 6px 10px; background: #0f0b18; color: #fff; border: 1px solid #6b5494; }
.reg-form button { padding: 6px 12px; background: #d97706; color: #1c1104; font-weight: bold; border: 2px solid #fbbf24; }
#feedback { min-height: 20px; color: #f87171; }
#feedback.ok { color: #34d399; font-weight: bold; }`,
            starterCode: `const form = document.querySelector("#form-registro");
const input = document.querySelector("#input-alias");
const feedback = document.querySelector("#feedback");

// Escucha "submit", previene el envío por defecto y valida la longitud >= 3
`,
            solutionCode: `const form = document.querySelector("#form-registro");
const input = document.querySelector("#input-alias");
const feedback = document.querySelector("#feedback");
if (form && input && feedback) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const alias = input.value.trim();
    if (alias.length < 3) {
      feedback.classList.remove("ok");
      feedback.textContent = "Alias muy corto";
      return;
    }
    feedback.classList.add("ok");
    feedback.textContent = \`Bienvenido, \${alias}\`;
  });
}`,
            hints: [
              'Dentro de form.addEventListener("submit", (e) => { e.preventDefault(); ... }).',
              'Recorta espacios con const alias = input.value.trim();',
              'Si alias.length < 3 muestra "Alias muy corto" y quita "ok"; si no, añade "ok" y muestra `Bienvenido, ${alias}`.',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Rechaza alias corto ("Al") mostrando "Alias muy corto"',
                validateSource: `(() => { const f = document.querySelector("#form-registro"); const i = document.querySelector("#input-alias"); i.value = "Al"; f.dispatchEvent(new Event("submit", { cancelable: true })); return document.querySelector("#feedback").textContent.trim() === "Alias muy corto" && !document.querySelector("#feedback").classList.contains("ok"); })()`,
                expectedDesc: 'Debe mostrar "Alias muy corto" sin clase "ok"',
              },
              {
                id: 't2',
                name: 'Acepta alias válido ("Zelda") y añade clase "ok"',
                validateSource: `(() => { const f = document.querySelector("#form-registro"); const i = document.querySelector("#input-alias"); i.value = "  Zelda  "; f.dispatchEvent(new Event("submit", { cancelable: true })); return document.querySelector("#feedback").textContent.trim() === "Bienvenido, Zelda" && document.querySelector("#feedback").classList.contains("ok"); })()`,
                expectedDesc: 'Debe mostrar "Bienvenido, Zelda" con clase "ok"',
              },
            ],
            xpReward: 105,
            goldReward: 55,
          },
        ]),
      },
      {
        id: 'c4_r4',
        castleId: 4,
        roomIndex: 3,
        name: 'Sala 4: Trono de Aracne',
        subtitle: 'Jefe: Aracne, la Reina de la Telaraña del DOM',
        grimoirePageId: 'c4_r4',
        ...buildRoomLayout(
          'boss',
          4,
          [
            {
              id: 'c4_boss_p1',
              title: 'Delegación sobre la Telaraña',
              lore: 'Aracne teje múltiples nodos de seda. Usa delegación de eventos en el contenedor padre para cortarlos al hacer clic.',
              technicalSpec:
                'Escucha "click" en #telarana. Si el clic cae en un botón .hilo (usa e.target.closest(".hilo")), añádele la clase "cortado" y actualiza #restantes con el número de botones .hilo que NO tienen la clase "cortado".',
              mode: 'dom',
              initialHtml: `<div class="boss-web">
  <div>Hilos intactos: <span id="restantes">3</span></div>
  <div id="telarana">
    <button class="hilo">Hilo 1</button>
    <button class="hilo">Hilo 2</button>
    <button class="hilo">Hilo 3</button>
  </div>
</div>`,
              initialCss: `.boss-web { padding: 12px; background: #1d1026; border: 2px solid #9333ea; text-align: center; }
#telarana { display: flex; gap: 8px; justify-content: center; margin-top: 10px; }
.hilo { padding: 6px 12px; background: #4c1d95; color: #f3e8ff; border: 1px solid #c084fc; cursor: pointer; }
.hilo.cortado { background: #1f2937; color: #6b7280; text-decoration: line-through; border-color: #374151; }`,
              starterCode: `const telarana = document.querySelector("#telarana");
const restantes = document.querySelector("#restantes");

// Implementa delegación de eventos en #telarana
`,
              solutionCode: `const telarana = document.querySelector("#telarana");
const restantes = document.querySelector("#restantes");
if (telarana && restantes) {
  telarana.addEventListener("click", (e) => {
    const btn = e.target.closest(".hilo");
    if (!btn) return;
    btn.classList.add("cortado");
    const activos = telarana.querySelectorAll(".hilo:not(.cortado)").length;
    restantes.textContent = String(activos);
  });
}`,
              hints: [
                'Usa e.target.closest(".hilo") para confirmar que se pulsó un botón de hilo.',
                'Añade btn.classList.add("cortado").',
                'Cuenta los restantes con telarana.querySelectorAll(".hilo:not(.cortado)").length.',
              ],
              testCases: [
                {
                  id: 't1',
                  name: 'Cortar 2 hilos actualiza clases y deja #restantes en "1"',
                  validateSource: `(() => { const hs = document.querySelectorAll(".hilo"); hs[0].click(); hs[2].click(); return hs[0].classList.contains("cortado") && hs[2].classList.contains("cortado") && document.querySelector("#restantes").textContent.trim() === "1"; })()`,
                  expectedDesc: 'Tras 2 clics, #restantes debe ser "1"',
                },
              ],
              xpReward: 125,
              goldReward: 70,
            },
            {
              id: 'c4_boss_p2',
              title: 'Filtro de Reliquias en Vivo (Golpe Final)',
              lore: 'Destruye el camuflaje de Aracne filtrando en tiempo real la lista de runas mientras escribes en el buscador.',
              technicalSpec:
                'Escucha el evento "input" en #buscar. Oculta (añade clase "oculto") cada .objetivo cuyo texto en minúsculas NO incluya el valor escrito en minúsculas; quita "oculto" si sí coincide.',
              mode: 'dom',
              initialHtml: `<div class="filtro-box">
  <input id="buscar" type="text" placeholder="Filtrar debilidad..." />
  <ul id="objetivos">
    <li class="objetivo">Colmillo de Seda</li>
    <li class="objetivo">Núcleo de Fuego</li>
    <li class="objetivo">Sello de Luz</li>
  </ul>
</div>`,
              initialCss: `.filtro-box { padding: 12px; background: #1a1224; border: 2px solid #c026d3; }
#buscar { width: 100%; padding: 6px 8px; background: #0d0914; color: #fff; border: 1px solid #a21caf; margin-bottom: 8px; }
#objetivos { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.objetivo { padding: 5px 8px; background: #2e1a42; color: #f5d0fe; }
.objetivo.oculto { display: none; }`,
              starterCode: `const input = document.querySelector("#buscar");
const items = document.querySelectorAll(".objetivo");

// Escucha "input" en #buscar y alterna la clase "oculto" en cada .objetivo
`,
              solutionCode: `const input = document.querySelector("#buscar");
const items = document.querySelectorAll(".objetivo");
if (input) {
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    items.forEach((li) => {
      const match = li.textContent.toLowerCase().includes(q);
      li.classList.toggle("oculto", !match);
    });
  });
}`,
              hints: [
                'Usa const q = input.value.trim().toLowerCase();',
                'Recorre items.forEach(li => { ... }) comparando li.textContent.toLowerCase().includes(q).',
                'li.classList.toggle("oculto", !match); oculta los que no coinciden.',
              ],
              testCases: [
                {
                  id: 't1',
                  name: 'Escribir "fuego" deja visible solo "Núcleo de Fuego"',
                  validateSource: `(() => { const i = document.querySelector("#buscar"); i.value = "fuego"; i.dispatchEvent(new Event("input")); const visibles = [...document.querySelectorAll(".objetivo:not(.oculto)")]; return visibles.length === 1 && visibles[0].textContent.includes("Fuego"); })()`,
                  expectedDesc: 'Solo debe permanecer visible "Núcleo de Fuego"',
                },
              ],
              xpReward: 175,
              goldReward: 120,
            },
          ],
          {
            id: 'boss_aracne',
            name: 'Aracne',
            title: 'Reina de la Telaraña del DOM',
            spriteKey: 'boss_aracne',
            x: 1020,
            y: 345,
            maxPhases: 2,
            attackInterval: 2.2,
            damage: 19,
            taunt: '¡Tus nodos y eventos quedarán atrapados en mi árbol DOM!',
            defeatQuote: '¡Has desenredado cada evento... mi telaraña se desvanece!',
          }
        ),
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CASTILLO 5: EL SANTUARIO ASÍNCRONO (Promesas, Async/Await y APIs)
  // --------------------------------------------------------------------------
  {
    id: 5,
    name: 'El Santuario Asíncrono',
    topic: 'Promesas, Async/Await y APIs',
    shortTopic: 'Promises, fetch() y Estados de Carga',
    description:
      'Domina el Event Loop, Promesas, async/await, try/catch y consume la API real del Reino (api.reino.dev) en el Espejo Arcano.',
    bossName: 'Chronos, el Espectro de la Latencia',
    mapPos: { x: 77, y: 40 },
    mode: 'dom',
    theme: {
      skyTop: '#081826',
      skyBottom: '#103552',
      mountainFar: '#0c2338',
      mountainNear: '#153b5c',
      tileTop: '#38bdf8',
      tileBody: '#1e547a',
      tileDark: '#0f2d45',
      accent: '#38bdf8',
      torchColor: '#7dd3fc',
    },
    rooms: [
      {
        id: 'c5_r1',
        castleId: 5,
        roomIndex: 0,
        name: 'Sala 1: Cámara de Iniciación',
        subtitle: 'Promesas y Resolución Asíncrona',
        grimoirePageId: 'c5_r1',
        ...buildRoomLayout('intro', 5, [
          {
            id: 'c5_r1_a1',
            title: 'Altar de la Promesa Temporal',
            lore: 'El puente existe en otro plano temporal. Devuelve una Promesa que resuelva el mensaje invocado.',
            technicalSpec:
              'Crea invocarEco(palabra) que retorne una Promise que se resuelva con "Eco: <palabra>" usando setTimeout de 15ms. Si palabra está vacía o no es string, rechaza la promesa con un Error.',
            mode: 'dom',
            initialHtml: `<div class="async-panel"><p id="eco-status">Esperando invocación asíncrona...</p></div>`,
            initialCss: `.async-panel { padding: 14px; background: #0c1f33; border: 2px solid #0284c7; color: #bae6fd; text-align: center; }`,
            starterCode: `function invocarEco(palabra) {
  return new Promise((resolve, reject) => {
    // Valida palabra y resuelve con setTimeout
  });
}`,
            solutionCode: `function invocarEco(palabra) {
  return new Promise((resolve, reject) => {
    if (typeof palabra !== "string" || !palabra.trim()) {
      reject(new Error("Palabra inválida"));
      return;
    }
    setTimeout(() => {
      const el = document.querySelector("#eco-status");
      const msg = \`Eco: \${palabra.trim()}\`;
      if (el) el.textContent = msg;
      resolve(msg);
    }, 15);
  });
}`,
            hints: [
              'Comprueba if (!palabra || typeof palabra !== "string") return reject(new Error("Vacío"));',
              'Dentro de setTimeout(() => resolve(`Eco: ${palabra}`), 15);',
              'Retorna siempre la instancia new Promise(...).',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Resuelve con "Eco: Chronos"',
                validateSource: `(await invocarEco("Chronos")) === "Eco: Chronos"`,
                expectedDesc: 'La promesa debe resolverse con "Eco: Chronos"',
              },
              {
                id: 't2',
                name: 'Rechaza correctamente cuando palabra está vacía',
                validateSource: `await invocarEco("").then(() => false).catch(() => true)`,
                expectedDesc: 'Debe llamar a reject() si palabra está vacía',
              },
            ],
            xpReward: 95,
            goldReward: 50,
          },
          {
            id: 'c5_r1_a2',
            title: 'Compuerta de fetch() al Grimorio Remoto',
            lore: 'Consulta la API oficial del Reino (https://api.reino.dev/hechizos) usando async/await.',
            technicalSpec:
              'Crea async function obtenerHechizosDeFuego() que haga fetch("https://api.reino.dev/hechizos"), parsee res.json(), filtre los de elemento === "fuego" y retorne un array con sus nombres.',
            mode: 'dom',
            initialHtml: `<div class="async-panel">Endpoint activo: <code>https://api.reino.dev/hechizos</code></div>`,
            initialCss: `.async-panel { padding: 14px; background: #0c1f33; border: 2px solid #0284c7; color: #bae6fd; text-align: center; }`,
            starterCode: `async function obtenerHechizosDeFuego() {
  // 1. await fetch("https://api.reino.dev/hechizos")
  // 2. await res.json()
  // 3. filtra elemento === "fuego" y devuelve array de nombres
}`,
            solutionCode: `async function obtenerHechizosDeFuego() {
  const res = await fetch("https://api.reino.dev/hechizos");
  if (!res.ok) return [];
  const data = await res.json();
  return data.filter((h) => h.elemento === "fuego").map((h) => h.nombre);
}`,
            hints: [
              'const res = await fetch("https://api.reino.dev/hechizos");',
              'const data = await res.json();',
              'return data.filter(h => h.elemento === "fuego").map(h => h.nombre);',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Obtiene ["Bola de Fuego", "Llama Fénix"] desde la API del Reino',
                validateSource: `JSON.stringify(await obtenerHechizosDeFuego()) === '["Bola de Fuego","Llama Fénix"]'`,
                expectedDesc: 'Se esperaba ["Bola de Fuego", "Llama Fénix"]',
              },
            ],
            xpReward: 100,
            goldReward: 50,
          },
        ]),
      },
      {
        id: 'c5_r2',
        castleId: 5,
        roomIndex: 1,
        name: 'Sala 2: Corredor de las Pruebas',
        subtitle: 'Renderizado Asíncrono en el Espejo Arcano',
        grimoirePageId: 'c5_r2',
        ...buildRoomLayout('corridor', 5, [
          {
            id: 'c5_r2_a1',
            title: 'Tablón del Bestiario Remoto',
            lore: 'Descarga el bestiario desde la API del Reino y dibuja cada criatura en vivo en el Espejo Arcano.',
            technicalSpec:
              'Crea async function cargarBestiario() que consulte "https://api.reino.dev/bestiario", inserte un <li class="bestia"> por cada criatura con su nombre en #lista-bestias y actualice #estado-api a "Listo".',
            mode: 'dom',
            initialHtml: `<div class="api-card">
  <div id="estado-api">Cargando...</div>
  <ul id="lista-bestias"></ul>
</div>`,
            initialCss: `.api-card { padding: 12px; background: #0c1b2e; border: 2px solid #0284c7; }
#estado-api { color: #fde047; margin-bottom: 8px; font-weight: bold; }
#lista-bestias { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.bestia { padding: 6px 10px; background: #14304d; border: 1px solid #38bdf8; color: #e0f2fe; }`,
            starterCode: `async function cargarBestiario() {
  const estado = document.querySelector("#estado-api");
  const lista = document.querySelector("#lista-bestias");
  // Haz fetch a "https://api.reino.dev/bestiario", renderiza <li> y pon estado = "Listo"
}`,
            solutionCode: `async function cargarBestiario() {
  const estado = document.querySelector("#estado-api");
  const lista = document.querySelector("#lista-bestias");
  const res = await fetch("https://api.reino.dev/bestiario");
  const bestias = await res.json();
  lista.innerHTML = "";
  bestias.forEach((b) => {
    const li = document.createElement("li");
    li.className = "bestia";
    li.textContent = b.nombre;
    lista.appendChild(li);
  });
  estado.textContent = "Listo";
}`,
            hints: [
              'Usa await fetch("https://api.reino.dev/bestiario") y const bestias = await res.json();',
              'Limpia lista.innerHTML = "" y crea un <li class="bestia"> con li.textContent = b.nombre.',
              'Al finalizar, actualiza estado.textContent = "Listo".',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Renderiza las 3 bestias y actualiza #estado-api a "Listo"',
                validateSource: `await (async () => { await cargarBestiario(); const lis = document.querySelectorAll("#lista-bestias li.bestia"); return lis.length === 3 && document.querySelector("#estado-api").textContent.trim() === "Listo"; })()`,
                expectedDesc: 'Debe crear 3 <li class="bestia"> y poner #estado-api en "Listo"',
              },
            ],
            xpReward: 110,
            goldReward: 55,
          },
          {
            id: 'c5_r2_a2',
            title: 'Escudo try/catch ante Fallos HTTP',
            lore: 'El endpoint /error devuelve estado 503. Captura el fallo sin romper la interfaz.',
            technicalSpec:
              'Crea async function consultarSeguro(url) que haga fetch(url). Si !res.ok lanza un Error y en el catch devuelve { ok: false, mensaje: "Error de red" } y muestra "Error de red" en #alerta. Si res.ok devuelve { ok: true, datos }.',
            mode: 'dom',
            initialHtml: `<div class="api-card"><p id="alerta">Sin alertas</p></div>`,
            initialCss: `.api-card { padding: 12px; background: #0c1b2e; border: 2px solid #0284c7; color: #fca5a5; text-align: center; }`,
            starterCode: `async function consultarSeguro(url) {
  // Envuelve fetch en try / catch verificando res.ok
}`,
            solutionCode: `async function consultarSeguro(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const datos = await res.json();
    return { ok: true, datos };
  } catch {
    const alerta = document.querySelector("#alerta");
    if (alerta) alerta.textContent = "Error de red";
    return { ok: false, mensaje: "Error de red" };
  }
}`,
            hints: [
              'Dentro de try: const res = await fetch(url); if (!res.ok) throw new Error();',
              'Si todo va bien retorna { ok: true, datos: await res.json() }.',
              'En catch actualiza #alerta a "Error de red" y retorna { ok: false, mensaje: "Error de red" }.',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Maneja https://api.reino.dev/error sin crashear y actualiza #alerta',
                validateSource: `await (async () => { const r = await consultarSeguro("https://api.reino.dev/error"); return r.ok === false && r.mensaje === "Error de red" && document.querySelector("#alerta").textContent.trim() === "Error de red"; })()`,
                expectedDesc: 'Debe retornar { ok: false, mensaje: "Error de red" } y actualizar #alerta',
              },
              {
                id: 't2',
                name: 'Devuelve { ok: true, datos } con endpoint válido',
                validateSource: `await (async () => { const r = await consultarSeguro("https://api.reino.dev/pociones"); return r.ok === true && Array.isArray(r.datos) && r.datos.length === 2; })()`,
                expectedDesc: 'Debe devolver { ok: true, datos: [...] }',
              },
            ],
            xpReward: 115,
            goldReward: 60,
          },
        ]),
      },
      {
        id: 'c5_r3',
        castleId: 5,
        roomIndex: 2,
        name: 'Sala 3: Santuario de Especialidad',
        subtitle: 'Paralelismo con Promise.all',
        grimoirePageId: 'c5_r3',
        ...buildRoomLayout('sanctuary', 5, [
          {
            id: 'c5_r3_a1',
            title: 'Altar de la Convergencia Paralela',
            lore: 'El Santuario exige consultar hechizos y pociones simultáneamente con Promise.all.',
            technicalSpec:
              'Crea async function cargarResumenReino() que use Promise.all para consultar "https://api.reino.dev/hechizos" y "https://api.reino.dev/pociones" en paralelo y retorne { totalHechizos, totalPociones }.',
            mode: 'dom',
            initialHtml: `<div class="api-card"><div id="resumen-reino">Esperando convergencia...</div></div>`,
            initialCss: `.api-card { padding: 14px; background: #0c1b2e; border: 2px solid #38bdf8; color: #e0f2fe; text-align: center; }`,
            starterCode: `async function cargarResumenReino() {
  // Usa Promise.all con ambos endpoints y devuelve { totalHechizos, totalPociones }
}`,
            solutionCode: `async function cargarResumenReino() {
  const [resH, resP] = await Promise.all([
    fetch("https://api.reino.dev/hechizos"),
    fetch("https://api.reino.dev/pociones"),
  ]);
  const [hechizos, pociones] = await Promise.all([resH.json(), resP.json()]);
  const out = document.querySelector("#resumen-reino");
  if (out) out.textContent = \`Hechizos: \${hechizos.length} | Pociones: \${pociones.length}\`;
  return { totalHechizos: hechizos.length, totalPociones: pociones.length };
}`,
            hints: [
              'Usa const [r1, r2] = await Promise.all([fetch(...), fetch(...)]);',
              'Convierte ambos a JSON y retorna { totalHechizos: hechizos.length, totalPociones: pociones.length }.',
              'Los totales esperados de la API del Reino son 4 hechizos y 2 pociones.',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Devuelve { totalHechizos: 4, totalPociones: 2 }',
                validateSource: `await (async () => { const r = await cargarResumenReino(); return r.totalHechizos === 4 && r.totalPociones === 2; })()`,
                expectedDesc: 'Se esperaba { totalHechizos: 4, totalPociones: 2 }',
              },
            ],
            xpReward: 120,
            goldReward: 65,
          },
        ]),
      },
      {
        id: 'c5_r4',
        castleId: 5,
        roomIndex: 3,
        name: 'Sala 4: Trono de Chronos',
        subtitle: 'Jefe: Chronos, el Espectro de la Latencia',
        grimoirePageId: 'c5_r4',
        ...buildRoomLayout(
          'boss',
          5,
          [
            {
              id: 'c5_boss_p1',
              title: 'Reloj de Arena Asíncrono',
              lore: 'Chronos intenta congelar la UI. Busca la debilidad exacta del espectro en /bestiario y muéstrala en el Espejo.',
              technicalSpec:
                'Crea async function revelarDebilidadChronos() que consulte "https://api.reino.dev/bestiario", encuentre el registro cuyo nombre incluya "Chronos", escriba su propiedad debilidad en #debilidad y la retorne.',
              mode: 'dom',
              initialHtml: `<div class="api-card">Debilidad detectada: <strong id="debilidad">???</strong></div>`,
              initialCss: `.api-card { padding: 14px; background: #0c1b2e; border: 2px solid #0ea5e9; color: #e0f2fe; text-align: center; }
#debilidad { color: #facc15; text-transform: uppercase; }`,
              starterCode: `async function revelarDebilidadChronos() {
  // Consulta /bestiario, busca a Chronos, actualiza #debilidad y retorna la debilidad
}`,
              solutionCode: `async function revelarDebilidadChronos() {
  const res = await fetch("https://api.reino.dev/bestiario");
  const lista = await res.json();
  const chronos = lista.find((b) => b.nombre.includes("Chronos"));
  const deb = chronos ? chronos.debilidad : "";
  const el = document.querySelector("#debilidad");
  if (el) el.textContent = deb;
  return deb;
}`,
              hints: [
                'Usa lista.find(b => b.nombre.includes("Chronos")).',
                'Actualiza document.querySelector("#debilidad").textContent = chronos.debilidad.',
                'Retorna chronos.debilidad ("fuego").',
              ],
              testCases: [
                {
                  id: 't1',
                  name: 'Revela "fuego" en #debilidad y lo retorna',
                  validateSource: `await (async () => { const d = await revelarDebilidadChronos(); return d === "fuego" && document.querySelector("#debilidad").textContent.trim() === "fuego"; })()`,
                  expectedDesc: 'Debe retornar "fuego" y mostrarlo en #debilidad',
                },
              ],
              xpReward: 140,
              goldReward: 80,
            },
            {
              id: 'c5_boss_p2',
              title: 'Descarga Final de Poder (Golpe Final)',
              lore: 'Calcula el poder combinado de todos los hechizos de fuego obtenidos desde la API para sellar a Chronos.',
              technicalSpec:
                'Crea async function ataqueFinalChronos() que obtenga "https://api.reino.dev/hechizos", sume el poder de los hechizos con elemento === "fuego", escriba el total en #poder-final y retorne ese número.',
              mode: 'dom',
              initialHtml: `<div class="api-card">Poder de Fuego Acumulado: <strong id="poder-final">0</strong></div>`,
              initialCss: `.api-card { padding: 14px; background: #0c1b2e; border: 2px solid #f59e0b; color: #fef3c7; text-align: center; }
#poder-final { color: #fb923c; font-size: 1.5rem; }`,
              starterCode: `async function ataqueFinalChronos() {
  // Consulta /hechizos, suma poder de elemento === "fuego", actualiza #poder-final y retorna el total
}`,
              solutionCode: `async function ataqueFinalChronos() {
  const res = await fetch("https://api.reino.dev/hechizos");
  const hechizos = await res.json();
  const total = hechizos
    .filter((h) => h.elemento === "fuego")
    .reduce((acc, h) => acc + h.poder, 0);
  const el = document.querySelector("#poder-final");
  if (el) el.textContent = String(total);
  return total;
}`,
              hints: [
                'Filtra los hechizos con h.elemento === "fuego".',
                'Suma su propiedad .poder con .reduce((acc, h) => acc + h.poder, 0).',
                'Actualiza #poder-final y retorna el número total (45 + 90 = 135).',
              ],
              testCases: [
                {
                  id: 't1',
                  name: 'Calcula 135 de poder y lo refleja en #poder-final',
                  validateSource: `await (async () => { const p = await ataqueFinalChronos(); return p === 135 && document.querySelector("#poder-final").textContent.trim() === "135"; })()`,
                  expectedDesc: 'Se esperaba 135 (45 + 90) reflejado en #poder-final',
                },
              ],
              xpReward: 200,
              goldReward: 140,
            },
          ],
          {
            id: 'boss_chronos',
            name: 'Chronos',
            title: 'Espectro de la Latencia',
            spriteKey: 'boss_chronos',
            x: 1020,
            y: 345,
            maxPhases: 2,
            attackInterval: 2.1,
            damage: 21,
            taunt: '¡Tu hilo principal quedará congelado fuera del tiempo!',
            defeatQuote: '¡Has dominado el Event Loop... el tiempo vuelve a fluir!',
          }
        ),
      },
    ],
  },

  // --------------------------------------------------------------------------
  // CASTILLO 6: EL TRONO DEL ARQUITECTO FRONTEND (Estado, Módulos y Arquitectura)
  // --------------------------------------------------------------------------
  {
    id: 6,
    name: 'El Trono del Arquitecto Frontend',
    topic: 'Estado Reactivo y Arquitectura',
    shortTopic: 'Store Pub-Sub, localStorage, Debounce y App',
    description:
      'Construye arquitectura Frontend profesional en Vanilla JS: patrón Store/Observer, persistencia JSON, debounce y una app reactiva completa.',
    bossName: 'El Rey Exánime del Estado Global',
    mapPos: { x: 89, y: 18 },
    mode: 'dom',
    theme: {
      skyTop: '#160d14',
      skyBottom: '#331724',
      mountainFar: '#211019',
      mountainNear: '#3d1c2b',
      tileTop: '#eab308',
      tileBody: '#572838',
      tileDark: '#2b121b',
      accent: '#facc15',
      torchColor: '#fbbf24',
    },
    rooms: [
      {
        id: 'c6_r1',
        castleId: 6,
        roomIndex: 0,
        name: 'Sala 1: Cámara de Iniciación',
        subtitle: 'Patrón Store Reactivo (Observer / Pub-Sub)',
        grimoirePageId: 'c6_r1',
        ...buildRoomLayout('intro', 6, [
          {
            id: 'c6_r1_a1',
            title: 'Altar del Store Inmutable',
            lore: 'El puente final solo responde a un flujo de estado unidireccional libre de mutaciones ocultas.',
            technicalSpec:
              'Crea crearStore(estadoInicial) que devuelva { getState, setState, subscribe }. getState() devuelve copia del estado, setState(parcial) fusiona y notifica a suscriptores, subscribe(fn) registra y retorna función de desuscripción.',
            mode: 'dom',
            initialHtml: `<div class="arch-box">Estado del Store: <code id="store-view">{ listo: true }</code></div>`,
            initialCss: `.arch-box { padding: 14px; background: #211018; border: 2px solid #ca8a04; color: #fef08a; text-align: center; }`,
            starterCode: `function crearStore(estadoInicial) {
  let state = { ...estadoInicial };
  const listeners = new Set();
  // Implementa y retorna { getState, setState, subscribe }
}`,
            solutionCode: `function crearStore(estadoInicial) {
  let state = { ...estadoInicial };
  const listeners = new Set();
  return {
    getState: () => ({ ...state }),
    setState: (parcial) => {
      state = { ...state, ...parcial };
      listeners.forEach((fn) => fn({ ...state }));
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}`,
            hints: [
              'getState: () => ({ ...state }) evita que muten el estado interno desde fuera.',
              'setState: (parcial) => { state = { ...state, ...parcial }; listeners.forEach(fn => fn(state)); }',
              'subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); }',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Notifica suscriptores al actualizar estado y soporta desuscripción',
                validateSource: `(() => { const s = crearStore({ oro: 10 }); let llamadas = 0; let ultimo = 0; const unsub = s.subscribe((st) => { llamadas++; ultimo = st.oro; }); s.setState({ oro: 50 }); unsub(); s.setState({ oro: 99 }); return llamadas === 1 && ultimo === 50 && s.getState().oro === 99; })()`,
                expectedDesc: 'Debe notificar una vez (50), dejar de notificar tras unsub() y guardar 99',
              },
              {
                id: 't2',
                name: 'getState devuelve copia protegida contra mutación externa',
                validateSource: `(() => { const s = crearStore({ nivel: 1 }); const snap = s.getState(); snap.nivel = 999; return s.getState().nivel === 1; })()`,
                expectedDesc: 'Mutar el objeto devuelto por getState no debe alterar el Store',
              },
            ],
            xpReward: 120,
            goldReward: 65,
          },
          {
            id: 'c6_r1_a2',
            title: 'Compuerta de Persistencia Segura',
            lore: 'Guarda y restaura el estado serializado en localStorage resistiendo datos corruptos.',
            technicalSpec:
              'Crea guardarPerfil(clave, datos) y cargarPerfil(clave, defecto). guardarPerfil serializa con JSON.stringify en localStorage; cargarPerfil parsea con try/catch devolviendo defecto si no existe o el JSON es inválido.',
            mode: 'dom',
            initialHtml: `<div class="arch-box">Almacenamiento Aislado del Reino listo.</div>`,
            initialCss: `.arch-box { padding: 14px; background: #211018; border: 2px solid #ca8a04; color: #fef08a; text-align: center; }`,
            starterCode: `function guardarPerfil(clave, datos) {
  // Guarda en localStorage usando JSON.stringify
}

function cargarPerfil(clave, defecto) {
  // Lee de localStorage con try / catch y JSON.parse
}`,
            solutionCode: `function guardarPerfil(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos));
}

function cargarPerfil(clave, defecto) {
  try {
    const raw = localStorage.getItem(clave);
    return raw !== null ? JSON.parse(raw) : defecto;
  } catch {
    return defecto;
  }
}`,
            hints: [
              'localStorage.setItem(clave, JSON.stringify(datos));',
              'En cargarPerfil: const raw = localStorage.getItem(clave); if (raw === null) return defecto;',
              'Envuelve JSON.parse(raw) en try / catch y devuelve defecto en el catch.',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Guarda y recupera objetos correctamente',
                validateSource: `(() => { guardarPerfil("hero", { nivel: 6, oro: 200 }); const d = cargarPerfil("hero", {}); return d.nivel === 6 && d.oro === 200; })()`,
                expectedDesc: 'Debe serializar y recuperar { nivel: 6, oro: 200 }',
              },
              {
                id: 't2',
                name: 'Sobrevive a JSON corrupto devolviendo el valor por defecto',
                validateSource: `(() => { localStorage.setItem("roto", "{bad-json"); const d = cargarPerfil("roto", { safe: true }); return d.safe === true; })()`,
                expectedDesc: 'Debe capturar el SyntaxError y retornar defecto',
              },
            ],
            xpReward: 120,
            goldReward: 65,
          },
        ]),
      },
      {
        id: 'c6_r2',
        castleId: 6,
        roomIndex: 1,
        name: 'Sala 2: Corredor de las Pruebas',
        subtitle: 'Optimización: Debounce de Alto Rendimiento',
        grimoirePageId: 'c6_r2',
        ...buildRoomLayout('corridor', 6, [
          {
            id: 'c6_r2_a1',
            title: 'Puente del Debounce',
            lore: 'Una ráfaga de eventos satura el puente. Implementa debounce para ejecutar solo la última llamada tras la pausa.',
            technicalSpec:
              'Crea debounce(fn, espera) que retorne una función que retrase la ejecución de fn(...args) por `espera` ms, cancelando el temporizador previo si se vuelve a invocar antes de ese tiempo.',
            mode: 'dom',
            initialHtml: `<div class="arch-box">Monitor de Debounce: listo para probar ráfaga de eventos.</div>`,
            initialCss: `.arch-box { padding: 14px; background: #211018; border: 2px solid #eab308; color: #fef08a; text-align: center; }`,
            starterCode: `function debounce(fn, espera) {
  let timerId;
  // Retorna la función envuelta que cancela timerId previo y programa el nuevo
}`,
            solutionCode: `function debounce(fn, espera) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), espera);
  };
}`,
            hints: [
              'Retorna (...args) => { clearTimeout(timerId); timerId = setTimeout(() => fn(...args), espera); };',
              'Es vital pasar (...args) a fn para preservar los parámetros de la última llamada.',
              'clearTimeout(timerId) cancela ejecuciones previas en la ráfaga.',
            ],
            testCases: [
              {
                id: 't1',
                name: 'Ejecuta fn solo una vez con el último argumento tras ráfaga rápida',
                validateSource: `await new Promise((resolve) => { let count = 0; let last = ""; const d = debounce((v) => { count++; last = v; }, 35); d("a"); d("ab"); d("abc"); setTimeout(() => resolve(count === 1 && last === "abc"), 85); })`,
                expectedDesc: 'Tras 3 llamadas seguidas solo debe ejecutarse 1 vez con "abc"',
              },
            ],
            xpReward: 130,
            goldReward: 70,
          },
          {
            id: 'c6_r2_a2',
            title: 'Sincronización Estado -> DOM',
            lore: 'Conecta una función render pura a tu estado para reflejar cambios instantáneos en el Espejo Arcano.',
            technicalSpec:
              'Crea renderBarra(hp, maxHp) que actualice #hp-texto con "<hp>/<maxHp>" y ajuste el ancho inline style.width de #hp-fill al porcentaje redondeado (ej. "50%").',
            mode: 'dom',
            initialHtml: `<div class="arch-box">
  <div id="hp-texto">100/100</div>
  <div class="bar-bg"><div id="hp-fill" style="width: 100%"></div></div>
</div>`,
            initialCss: `.arch-box { padding: 14px; background: #211018; border: 2px solid #eab308; color: #fef08a; }
.bar-bg { height: 14px; background: #3b1723; border: 1px solid #854d0e; margin-top: 8px; }
#hp-fill { height: 100%; background: #ef4444; }`,
            starterCode: `function renderBarra(hp, maxHp) {
  // Actualiza #hp-texto y style.width de #hp-fill
}`,
            solutionCode: `function renderBarra(hp, maxHp) {
  const safeHp = Math.max(0, Math.min(maxHp, hp));
  const pct = maxHp > 0 ? Math.round((safeHp / maxHp) * 100) : 0;
  const txt = document.querySelector("#hp-texto");
  const fill = document.querySelector("#hp-fill");
  if (txt) txt.textContent = \`\${safeHp}/\${maxHp}\`;
  if (fill) fill.style.width = \`\${pct}%\`;
}`,
            hints: [
              'Calcula const pct = Math.round((hp / maxHp) * 100);',
              'Asigna txt.textContent = `${hp}/${maxHp}`;',
              'Asigna fill.style.width = `${pct}%`;',
            ],
            testCases: [
              {
                id: 't1',
                name: 'renderBarra(40, 80) muestra "40/80" y width "50%"',
                validateSource: `(() => { renderBarra(40, 80); return document.querySelector("#hp-texto").textContent.trim() === "40/80" && document.querySelector("#hp-fill").style.width === "50%"; })()`,
                expectedDesc: 'Se esperaba texto "40/80" y width "50%"',
              },
            ],
            xpReward: 130,
            goldReward: 70,
          },
        ]),
      },
      {
        id: 'c6_r3',
        castleId: 6,
        roomIndex: 2,
        name: 'Sala 3: Santuario de Especialidad',
        subtitle: 'Bus de Eventos Desacoplado (Pub-Sub)',
        grimoirePageId: 'c6_r3',
        ...buildRoomLayout('sanctuary', 6, [
          {
            id: 'c6_r3_a1',
            title: 'Altar del EventBus Modular',
            lore: 'Antes del Trono Final, desacopla los módulos del reino creando un EventBus con on, emit y off.',
            technicalSpec:
              'Crea crearEventBus() que retorne { on(evento, fn), emit(evento, payload), off(evento, fn) } permitiendo suscribir múltiples listeners por nombre de evento, emitir datos y desuscribir.',
            mode: 'dom',
            initialHtml: `<div class="arch-box">EventBus Modular listo para pruebas de comunicación.</div>`,
            initialCss: `.arch-box { padding: 14px; background: #211018; border: 2px solid #eab308; color: #fef08a; text-align: center; }`,
            starterCode: `function crearEventBus() {
  const canales = new Map();
  // Retorna { on, emit, off }
}`,
            solutionCode: `function crearEventBus() {
  const canales = new Map();
  return {
    on(evento, fn) {
      if (!canales.has(evento)) canales.set(evento, new Set());
      canales.get(evento).add(fn);
    },
    emit(evento, payload) {
      const subs = canales.get(evento);
      if (subs) subs.forEach((fn) => fn(payload));
    },
    off(evento, fn) {
      canales.get(evento)?.delete(fn);
    },
  };
}`,
            hints: [
              'Guarda un Set de callbacks por cada nombre de evento dentro de canales (Map u objeto).',
              'En emit(evento, payload) recorre los callbacks del evento y llámalos con payload.',
              'En off(evento, fn) elimina fn del Set correspondiente.',
            ],
            testCases: [
              {
                id: 't1',
                name: 'on, emit y off comunican eventos aislados por canal',
                validateSource: `(() => { const bus = crearEventBus(); const log = []; const h = (d) => log.push(d); bus.on("golpe", h); bus.emit("golpe", 10); bus.emit("otro", 99); bus.off("golpe", h); bus.emit("golpe", 20); return JSON.stringify(log) === "[10]"; })()`,
                expectedDesc: 'Solo debe registrar [10] y dejar de escuchar tras off()',
              },
            ],
            xpReward: 145,
            goldReward: 80,
          },
        ]),
      },
      {
        id: 'c6_r4',
        castleId: 6,
        roomIndex: 3,
        name: 'Sala 4: Trono del Rey Exánime',
        subtitle: 'Jefe Final: El Rey Exánime del Estado Global',
        grimoirePageId: 'c6_r4',
        ...buildRoomLayout(
          'boss',
          6,
          [
            {
              id: 'c6_boss_p1',
              title: 'Núcleo de Mini-App Reactiva (Fase 1)',
              lore: 'El Monolito Corrupto colapsa al mezclar estado y DOM. Construye una mini-lista de misiones reactiva con persistencia.',
              technicalSpec:
                'Conecta #form-mision (#input-mision) para añadir nuevas misiones a un array de estado, renderizarlas como <li class="mision"> dentro de #lista-misiones, actualizar #total-misiones con la cantidad y guardar el array en localStorage bajo la clave "misiones".',
              mode: 'dom',
              initialHtml: `<div class="final-app">
  <div class="final-head">Misiones activas: <strong id="total-misiones">0</strong></div>
  <form id="form-mision">
    <input id="input-mision" type="text" placeholder="Nueva misión..." />
    <button type="submit">Agregar</button>
  </form>
  <ul id="lista-misiones"></ul>
</div>`,
              initialCss: `.final-app { padding: 12px; background: #1d1018; border: 2px solid #eab308; }
.final-head { color: #fde047; margin-bottom: 8px; }
#form-mision { display: flex; gap: 6px; margin-bottom: 8px; }
#input-mision { flex: 1; padding: 6px 8px; background: #10080d; color: #fff; border: 1px solid #a16207; }
#form-mision button { padding: 6px 12px; background: #eab308; color: #1c1204; font-weight: bold; border: none; }
#lista-misiones { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.mision { padding: 5px 8px; background: #301925; border: 1px solid #854d0e; color: #fef9c3; }`,
              starterCode: `const state = { misiones: [] };
const form = document.querySelector("#form-mision");
const input = document.querySelector("#input-mision");
const lista = document.querySelector("#lista-misiones");
const total = document.querySelector("#total-misiones");

function render() {
  // Renderiza state.misiones en #lista-misiones y actualiza #total-misiones
}

// Escucha submit, agrega texto no vacío, guarda en localStorage("misiones") y llama render()
`,
              solutionCode: `const state = { misiones: [] };
const form = document.querySelector("#form-mision");
const input = document.querySelector("#input-mision");
const lista = document.querySelector("#lista-misiones");
const total = document.querySelector("#total-misiones");

function render() {
  lista.innerHTML = "";
  state.misiones.forEach((m) => {
    const li = document.createElement("li");
    li.className = "mision";
    li.textContent = m;
    lista.appendChild(li);
  });
  total.textContent = String(state.misiones.length);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const texto = input.value.trim();
  if (!texto) return;
  state.misiones = [...state.misiones, texto];
  localStorage.setItem("misiones", JSON.stringify(state.misiones));
  input.value = "";
  render();
});`,
              hints: [
                'En el submit: e.preventDefault(), const texto = input.value.trim(); if (!texto) return;',
                'Actualiza state.misiones = [...state.misiones, texto] y localStorage.setItem("misiones", JSON.stringify(state.misiones)).',
                'Dentro de render(): limpia lista, crea cada <li class="mision"> y actualiza total.textContent.',
              ],
              testCases: [
                {
                  id: 't1',
                  name: 'Agrega misiones, actualiza DOM, contador y persiste en localStorage',
                  validateSource: `(() => { const f = document.querySelector("#form-mision"); const i = document.querySelector("#input-mision"); i.value = "Sellar Monolito"; f.dispatchEvent(new Event("submit", { cancelable: true })); i.value = "Graduarse"; f.dispatchEvent(new Event("submit", { cancelable: true })); const saved = JSON.parse(localStorage.getItem("misiones") || "[]"); return document.querySelectorAll("#lista-misiones li.mision").length === 2 && document.querySelector("#total-misiones").textContent.trim() === "2" && saved.length === 2; })()`,
                  expectedDesc: 'Debe renderizar 2 .mision, #total-misiones "2" y guardar en localStorage',
                },
              ],
              xpReward: 180,
              goldReward: 110,
            },
            {
              id: 'c6_boss_p2',
              title: 'Sello del Arquitecto Frontend (Golpe Final)',
              lore: 'El Rey Exánime tambalea. Completa el ciclo reactivo combinando Store + Render + Delegación de clic para completar tareas y sellar su corona para siempre.',
              technicalSpec:
                'Implementa delegación de clic en #tablero-final: al hacer clic en un botón .sello-btn, marca ese botón con la clase "completado" y cuando los 3 botones tengan "completado", cambia #corona-estado a "CONQUISTADO".',
              mode: 'dom',
              initialHtml: `<div class="final-app">
  <div id="corona-estado">SELLADO</div>
  <div id="tablero-final">
    <button class="sello-btn">Estado</button>
    <button class="sello-btn">DOM</button>
    <button class="sello-btn">Async</button>
  </div>
</div>`,
              initialCss: `.final-app { padding: 14px; background: #1d1018; border: 2px solid #facc15; text-align: center; }
#corona-estado { color: #f87171; font-weight: bold; margin-bottom: 10px; }
#tablero-final { display: flex; gap: 8px; justify-content: center; }
.sello-btn { padding: 8px 12px; background: #3b1726; color: #fef08a; border: 2px solid #a16207; cursor: pointer; }
.sello-btn.completado { background: #15803d; color: #dcfce7; border-color: #4ade80; }`,
              starterCode: `const tablero = document.querySelector("#tablero-final");
const estado = document.querySelector("#corona-estado");

// Delega "click" en #tablero-final y cuando los 3 .sello-btn estén completados pon estado = "CONQUISTADO"
`,
              solutionCode: `const tablero = document.querySelector("#tablero-final");
const estado = document.querySelector("#corona-estado");
if (tablero && estado) {
  tablero.addEventListener("click", (e) => {
    const btn = e.target.closest(".sello-btn");
    if (!btn) return;
    btn.classList.add("completado");
    const todos = [...tablero.querySelectorAll(".sello-btn")];
    if (todos.every((b) => b.classList.contains("completado"))) {
      estado.textContent = "CONQUISTADO";
    }
  });
}`,
              hints: [
                'Usa e.target.closest(".sello-btn") dentro del listener de #tablero-final.',
                'Añade btn.classList.add("completado").',
                'Comprueba si todos tienen "completado" con .every(b => b.classList.contains("completado")) y actualiza #corona-estado.',
              ],
              testCases: [
                {
                  id: 't1',
                  name: 'Activar los 3 sellos cambia #corona-estado a "CONQUISTADO"',
                  validateSource: `(() => { const bs = document.querySelectorAll(".sello-btn"); bs[0].click(); bs[1].click(); const before = document.querySelector("#corona-estado").textContent.trim(); bs[2].click(); return before !== "CONQUISTADO" && document.querySelector("#corona-estado").textContent.trim() === "CONQUISTADO"; })()`,
                  expectedDesc: 'Debe cambiar a "CONQUISTADO" únicamente al completar los 3 sellos',
                },
              ],
              xpReward: 260,
              goldReward: 200,
            },
          ],
          {
            id: 'boss_lich',
            name: 'Rey Exánime',
            title: 'Monolito Corrupto del Estado Global',
            spriteKey: 'boss_lich',
            x: 1020,
            y: 340,
            maxPhases: 2,
            attackInterval: 2.0,
            damage: 24,
            taunt: '¡Un solo estado global mutable gobernará sobre todo el DOM!',
            defeatQuote:
              '¡Has quebrado mi monolito! El título de Arquitecto Frontend es tuyo...',
          }
        ),
      },
    ],
  },
];

export function getCastleById(castleId: number): CastleDef {
  return CASTLES.find((c) => c.id === castleId) ?? CASTLES[0];
}

export function getRoomByCastleAndIndex(castleId: number, roomIndex: number): RoomDef {
  const castle = getCastleById(castleId);
  return castle.rooms[Math.min(castle.rooms.length - 1, Math.max(0, roomIndex))];
}
