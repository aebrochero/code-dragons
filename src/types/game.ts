export type HeroClassId =
  | 'mage'
  | 'warrior'
  | 'archer'
  | 'bard'
  | 'paladin'
  | 'rogue';

export type ResourceType = 'mana' | 'energy';

export type ScreenView =
  | 'title'
  | 'class_select'
  | 'world_map'
  | 'playing';

export interface HeroClassConfig {
  id: HeroClassId;
  name: string;
  title: string;
  resourceType: ResourceType;
  resourceLabel: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  difficultyLabel: string;
  baseHp: number;
  baseResource: number;
  moveSpeed: number; // px/s
  jumpVelocity: number; // px/s (negative = up)
  canDoubleJump: boolean;
  canDash: boolean;
  castCost: number;
  hintCostMultiplier: number;
  accentColor: string;
  specialtyTitle: string;
  specialtySummary: string;
  adaptationNote: string;
}

export type AltarMode = 'console' | 'dom';

export interface TestCaseSpec {
  id: string;
  name: string;
  /** Expression or assertion runner source evaluated in sandbox */
  validateSource: string;
  expectedDesc: string;
  isPaladinEdgeCase?: boolean;
}

export interface ClassChallengeOverride {
  missionSuffix?: string;
  starterCode?: string;
  extraTests?: TestCaseSpec[];
  extraHint?: string;
  codeCheckPattern?: {
    forbidRegex?: string;
    forbidReason?: string;
    requireRegex?: string;
    requireReason?: string;
  };
}

export interface CodeChallenge {
  id: string;
  title: string;
  lore: string;
  technicalSpec: string;
  mode: AltarMode;
  starterCode: string;
  solutionCode: string;
  /** HTML markup for Espejo Arcano DOM (Castles 4-6) */
  initialHtml?: string;
  /** Scoped CSS for Espejo Arcano DOM (Castles 4-6) */
  initialCss?: string;
  /** Hints unlocked progressively via Oracle */
  hints: [string, string, string];
  testCases: TestCaseSpec[];
  xpReward: number;
  goldReward: number;
  /** Optional class-specific overrides */
  classOverrides?: Partial<Record<HeroClassId, ClassChallengeOverride>>;
  /** Whether this altar is a Boss combat phase */
  bossPhase?: number;
}

export interface PlatformDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'solid' | 'semisolid' | 'moving' | 'bridge' | 'gate';
  /** For moving platforms */
  moveAxis?: 'x' | 'y';
  moveRange?: number;
  moveSpeed?: number;
  /** For bridges/gates unlocked by solving an altar */
  linkedAltarId?: string;
}

export interface HazardDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'spikes' | 'lava';
  damage: number;
  /** Optional altar that disables this trap */
  disabledByAltarId?: string;
}

export type EnemyArchetype = 'patrol' | 'orbiter' | 'turret' | 'charger';

export interface EnemyDef {
  id: string;
  archetype: EnemyArchetype;
  x: number;
  y: number;
  patrolRange?: number;
  speed: number;
  damage: number;
  name: string;
}

export interface AltarPlacement {
  id: string;
  x: number;
  y: number;
  label: string;
  challenge: CodeChallenge;
  unlocksText: string;
}

export interface BonfireDef {
  id: string;
  x: number;
  y: number;
}

export interface ChestDef {
  id: string;
  x: number;
  y: number;
  gold: number;
  xp: number;
}

export interface BossDef {
  id: string;
  name: string;
  title: string;
  spriteKey:
    | 'boss_ignis'
    | 'boss_ouroboros'
    | 'boss_malakor'
    | 'boss_aracne'
    | 'boss_chronos'
    | 'boss_lich';
  x: number;
  y: number;
  maxPhases: number;
  attackInterval: number;
  damage: number;
  taunt: string;
  defeatQuote: string;
}

export interface RoomDef {
  id: string;
  castleId: number;
  roomIndex: number; // 0..3 (3 = Boss Throne Room)
  name: string;
  subtitle: string;
  width: number;
  height: number;
  spawn: { x: number; y: number };
  exitPortal: { x: number; y: number; requiresAltarIds: string[] };
  platforms: PlatformDef[];
  hazards: HazardDef[];
  enemies: EnemyDef[];
  altars: AltarPlacement[];
  bonfires: BonfireDef[];
  chests: ChestDef[];
  boss?: BossDef;
  grimoirePageId: string;
}

export interface CastleTheme {
  skyTop: string;
  skyBottom: string;
  mountainFar: string;
  mountainNear: string;
  tileTop: string;
  tileBody: string;
  tileDark: string;
  accent: string;
  torchColor: string;
}

export interface CastleDef {
  id: number; // 1..6
  name: string;
  topic: string;
  shortTopic: string;
  description: string;
  bossName: string;
  mapPos: { x: number; y: number }; // Percentage 0..100 on World Map
  mode: AltarMode;
  theme: CastleTheme;
  rooms: RoomDef[];
}

export type ShopItemId =
  | 'dragon_potion'
  | 'ether_elixir'
  | 'oracle_scroll'
  | 'syntax_amulet';

export interface ShopItemDef {
  id: ShopItemId;
  name: string;
  altNameEnergy?: string;
  description: string;
  altDescriptionEnergy?: string;
  price: number;
  quickKey?: '1' | '2' | '3';
}

export interface GrimoirePage {
  id: string;
  castleId: number;
  roomIndex: number;
  title: string;
  summary: string;
  syntaxCode: string;
  keyPoints: string[];
  classTips: Record<HeroClassId, string>;
}

export interface InventoryState {
  dragon_potion: number;
  ether_elixir: number;
  oracle_scroll: number;
  syntax_amulet: number;
}

export interface SaveData {
  version: number;
  heroName: string;
  classId: HeroClassId;
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  resource: number;
  maxResource: number;
  gold: number;
  syntaxShieldActive: boolean;
  inventory: InventoryState;
  unlockedCastles: number[];
  conqueredCastles: number[];
  solvedAltars: string[];
  openedChests: string[];
  unlockedGrimoire: string[];
  savedCode: Record<string, string>;
  unlockedHints: Record<string, number>;
  currentCastleId: number;
  currentRoomIndex: number;
  freeExploreMode: boolean;
  muted: boolean;
  showTouchControls: boolean;
  totalAttempts: number;
  totalSuccesses: number;
}

export interface TestRunResult {
  id: string;
  name: string;
  passed: boolean;
  message: string;
  isEdgeCase?: boolean;
}

export interface SandboxExecutionResult {
  success: boolean;
  logs: string[];
  results: TestRunResult[];
  error?: {
    type: string;
    technicalMessage: string;
    rpgNarrative: string;
    debugTip: string;
  };
  finalDomHtml?: string;
}
