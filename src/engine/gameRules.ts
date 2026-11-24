import { getHeroClass } from '../data/classesData';
import { CodeChallenge, HeroClassId, SaveData, TestCaseSpec } from '../types/game';

export interface ResourceCostOutcome {
  resourceSpent: number;
  hpSacrificed: number;
  usedBloodPact: boolean;
  canAffordWithoutSacrifice: boolean;
  wouldSurvive: boolean;
}

/**
 * Computes exact cost for running code or asking the Oracle for a hint.
 * Implements the Mana/Energy + voluntary Blood Pact (HP sacrifice when resource is 0 or insufficient).
 */
export function calculateActionCost(
  currentResource: number,
  currentHp: number,
  baseCost: number
): ResourceCostOutcome {
  const cost = Math.max(0, Math.round(baseCost));
  if (currentResource >= cost) {
    return {
      resourceSpent: cost,
      hpSacrificed: 0,
      usedBloodPact: false,
      canAffordWithoutSacrifice: true,
      wouldSurvive: currentHp > 0,
    };
  }

  // Not enough Mana/Energy -> remaining shortfall is paid directly in HP (Blood Pact)
  const resourceSpent = Math.max(0, currentResource);
  const shortfall = cost - resourceSpent;
  // Minimum 8 HP sacrifice when triggering Blood Pact so the risk is meaningful and transparent
  const hpSacrificed = Math.max(8, shortfall);

  return {
    resourceSpent,
    hpSacrificed,
    usedBloodPact: true,
    canAffordWithoutSacrifice: false,
    wouldSurvive: currentHp - hpSacrificed > 0,
  };
}

/**
 * Hint base costs for tiers 1, 2, 3 adjusted by class multiplier (Mago gets 40% discount).
 */
export function getHintCost(classId: HeroClassId, hintTierIndex: number): number {
  const cls = getHeroClass(classId);
  const baseByTier = [15, 25, 35];
  const raw = baseByTier[Math.min(2, Math.max(0, hintTierIndex))] ?? 20;
  return Math.max(5, Math.round(raw * cls.hintCostMultiplier));
}

/**
 * Calculates counterattack damage taken when code fails in an altar.
 * If Syntax Amulet shield is active, halves damage and consumes shield.
 */
export function calculateCounterattackDamage(
  castleId: number,
  isBossRoom: boolean,
  syntaxShieldActive: boolean
): { damage: number; shieldConsumed: boolean } {
  const base = 10 + castleId * 2 + (isBossRoom ? 6 : 0);
  if (syntaxShieldActive) {
    return {
      damage: Math.max(4, Math.floor(base / 2)),
      shieldConsumed: true,
    };
  }
  return { damage: base, shieldConsumed: false };
}

/**
 * Applies XP gain and handles multi-level ups, raising max HP & max Resource.
 */
export function applyXpGain(
  state: Pick<SaveData, 'level' | 'xp' | 'xpToNext' | 'hp' | 'maxHp' | 'resource' | 'maxResource'>,
  gainedXp: number
): {
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  resource: number;
  maxResource: number;
  leveledUp: boolean;
  levelsGained: number;
} {
  let { level, xp, xpToNext, hp, maxHp, resource, maxResource } = state;
  xp += Math.max(0, Math.round(gainedXp));
  let levelsGained = 0;

  while (xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    levelsGained += 1;
    xpToNext = Math.round(xpToNext * 1.35 + 40);
    maxHp += 12;
    maxResource += 10;
    hp = maxHp;
    resource = maxResource;
  }

  return {
    level,
    xp,
    xpToNext,
    hp,
    maxHp,
    resource,
    maxResource,
    leveledUp: levelsGained > 0,
    levelsGained,
  };
}

export interface AABB {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rectsOverlap(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export interface AdaptedChallenge {
  challenge: CodeChallenge;
  starterCode: string;
  missionSpec: string;
  classDirective: string;
  testCases: TestCaseSpec[];
  hints: [string, string, string];
  codeCheckPattern?: {
    forbidRegex?: string;
    forbidReason?: string;
    requireRegex?: string;
    requireReason?: string;
  };
}

/**
 * Adapts a base CodeChallenge tangibly according to the active D&D Frontend class.
 */
export function adaptChallengeForClass(
  challenge: CodeChallenge,
  classId: HeroClassId
): AdaptedChallenge {
  const override = challenge.classOverrides?.[classId];
  let starterCode = override?.starterCode ?? challenge.starterCode;
  let missionSpec = challenge.technicalSpec;
  const testCases: TestCaseSpec[] = [...challenge.testCases];
  const hints: [string, string, string] = [...challenge.hints];
  let codeCheckPattern = override?.codeCheckPattern;

  let classDirective = '';

  switch (classId) {
    case 'mage':
      classDirective =
        'Ventaja de Mago: plantilla guiada con pasos comentados y pistas 40% más económicas.';
      if (!override?.starterCode) {
        starterCode =
          `// [Guía del Mago]\n// Paso 1: Revisa los parámetros y la especificación técnica.\n// Paso 2: Implementa la lógica paso a paso y retorna el valor exacto.\n` +
          starterCode;
      }
      break;
    case 'warrior':
      classDirective =
        'Disciplina del Guerrero: enfócate en control imperativo claro, bucles directos y lógica firme.';
      break;
    case 'archer':
      classDirective =
        'Precisión del Arquero: apunta con exactitud a selectores, filtros, propiedades y retornos.';
      break;
    case 'bard':
      classDirective =
        'Armonía del Bardo: cuida la claridad de salida, mensajes de interfaz y respuesta a eventos.';
      break;
    case 'paladin':
      classDirective =
        'Juramento del Paladín: código defensivo obligatorio. Se activaron pruebas extra de casos borde.';
      break;
    case 'rogue':
      classDirective =
        'Senda del Pícaro: refactoriza el código heredado eliminando malas prácticas (ej. var) y redundancias.';
      if (!codeCheckPattern) {
        codeCheckPattern = {
          forbidRegex: '\\bvar\\s+',
          forbidReason:
            'El Pícaro exige código ES6+ limpio: reemplaza cualquier declaración "var" por "const" o "let".',
        };
      }
      break;
  }

  if (override?.missionSuffix) {
    missionSpec = `${missionSpec} ${override.missionSuffix}`;
  }
  if (override?.extraTests && override.extraTests.length > 0) {
    testCases.push(...override.extraTests);
  }
  if (override?.extraHint) {
    hints[0] = override.extraHint;
  }

  return {
    challenge,
    starterCode,
    missionSpec,
    classDirective,
    testCases,
    hints,
    codeCheckPattern,
  };
}
