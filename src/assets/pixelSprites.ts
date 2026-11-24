import { EnemyArchetype, HeroClassId } from '../types/game';

export type HeroFrame = 'idle1' | 'idle2' | 'walk1' | 'walk2' | 'jump' | 'hurt' | 'cast';

export type SpritePalette = Record<string, string>;

export interface PixelSpriteMatrix {
  grid: string[];
  palette: SpritePalette;
}

const spriteCache = new Map<string, HTMLCanvasElement>();

/**
 * Renders a 2D character matrix onto a cached offscreen HTMLCanvasElement.
 * Each character maps to a hex color in `palette`; '.' or ' ' is transparent.
 */
export function getSpriteCanvas(
  cacheKey: string,
  matrix: PixelSpriteMatrix,
  pixelScale = 1,
  flipX = false,
  flashWhite = false
): HTMLCanvasElement {
  const fullKey = `${cacheKey}_${pixelScale}_${flipX ? 'L' : 'R'}_${flashWhite ? 'W' : 'N'}`;
  const cached = spriteCache.get(fullKey);
  if (cached) return cached;

  const rows = matrix.grid.length;
  const cols = matrix.grid[0]?.length ?? 16;
  const canvas = document.createElement('canvas');
  canvas.width = cols * pixelScale;
  canvas.height = rows * pixelScale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < rows; y++) {
    const row = matrix.grid[y];
    for (let x = 0; x < cols; x++) {
      const ch = row[x];
      if (!ch || ch === '.' || ch === ' ') continue;
      const color = flashWhite ? '#ffffff' : matrix.palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      const drawX = flipX ? (cols - 1 - x) * pixelScale : x * pixelScale;
      ctx.fillRect(drawX, y * pixelScale, pixelScale, pixelScale);
    }
  }

  spriteCache.set(fullKey, canvas);
  return canvas;
}

// ============================================================================
// 6 HERO CLASSES (16x16 matrices with class headgear, gear, cloak & palettes)
// ============================================================================

const HERO_PALETTES: Record<HeroClassId, SpritePalette> = {
  mage: {
    o: '#120e1c', // outline
    h: '#3b4cca', // hat / robe primary
    H: '#6378ff', // hat highlight
    g: '#f5c542', // gold trim / magic orb
    s: '#f4c7a1', // skin
    e: '#181425', // eyes
    c: '#252a6b', // dark cloak
    b: '#4a3525', // boots / staff wood
    w: '#56e0ff', // arcane glow
    r: '#e04f5f', // hurt accent
  },
  warrior: {
    o: '#141013',
    h: '#9aa4b2', // steel helm & armor
    H: '#d4dce6', // steel highlight
    g: '#d9483b', // crimson plume & cape
    s: '#efc29b',
    e: '#181425',
    c: '#565f6e', // dark iron
    b: '#4c3222', // boots & hilt
    w: '#f5b942', // gold buckle / blade edge
    r: '#ff6b6b',
  },
  archer: {
    o: '#101612',
    h: '#2d6e4e', // ranger hood & tunic
    H: '#4da374', // highlight
    g: '#d4a359', // leather / bow
    s: '#f2c59d',
    e: '#181425',
    c: '#1e4734', // dark cloak
    b: '#5c3c24', // boots / quiver
    w: '#9be564', // arrow fletching / magic tip
    r: '#ff6b6b',
  },
  bard: {
    o: '#1a1019',
    h: '#9d346a', // plum feathered cap & doublet
    H: '#d95b96', // highlight
    g: '#f6d06b', // lute / gold trim
    s: '#f6cca7',
    e: '#181425',
    c: '#5b1e42', // dark cape
    b: '#4d3026', // boots
    w: '#6ee7d8', // musical aura
    r: '#ff6b6b',
  },
  paladin: {
    o: '#16130e',
    h: '#e2c979', // golden plate & crown helm
    H: '#fff3c4', // radiant highlight
    g: '#3b82f6', // royal sapphire tabard
    s: '#f2c7a2',
    e: '#181425',
    c: '#998042', // shaded gold
    b: '#4e5968', // steel greaves
    w: '#93c5fd', // holy shield aura
    r: '#ff6b6b',
  },
  rogue: {
    o: '#0c0c12',
    h: '#38364a', // shadow cowl & vest
    H: '#656082', // highlight
    g: '#c83e4d', // crimson scarf
    s: '#e8bc96',
    e: '#f5d76e', // sharp amber eyes
    c: '#22202e', // deep shadow cloak
    b: '#2b2533', // stealth boots
    w: '#a78bfa', // venom / dagger glint
    r: '#ff6b6b',
  },
};

function getHeroGrid(classId: HeroClassId, frame: HeroFrame): string[] {
  // Distinctive top 6 rows (headgear / hair / silhouette) per class
  const headByClass: Record<HeroClassId, string[]> = {
    mage: [
      '......ooo.......',
      '.....oHHho......',
      '....ohhhHho.....',
      '...ooggggoo.....',
      '..oohhhhhhoo....',
      '....osessso.....',
    ],
    warrior: [
      '.....ogggo......',
      '....oohHhoo.....',
      '...oHhhhhHho....',
      '...oHhooohHo....',
      '...oHseeshHo....',
      '....oHcccHo.....',
    ],
    archer: [
      '.....ooooo......',
      '....ohHHhho.....',
      '...ohhhhHggo....',
      '...ohsesso......',
      '...ohsssshho....',
      '....ocggcco.....',
    ],
    bard: [
      '.......oow......',
      '....ooooggo.....',
      '...ohHHhhho.....',
      '...ohsesso......',
      '...ohssssho.....',
      '....oHggHho.....',
    ],
    paladin: [
      '....ogogogo.....',
      '....oHHHHHo.....',
      '...oHhhhhHho....',
      '...oHseeshHo....',
      '...oHhhhhHho....',
      '....oHgggHo.....',
    ],
    rogue: [
      '.....ooooo......',
      '....ohHHhho.....',
      '...ohcccccho....',
      '...ohceecho.....',
      '...ooggggoo.....',
      '....ogggcco.....',
    ],
  };

  const bob = frame === 'idle2' ? 1 : 0;
  const head = headByClass[classId];

  // Weapon / torso + legs by frame
  const bodyByFrame: Record<HeroFrame, string[]> = {
    idle1: [
      '...ohhhghhho..w.',
      '..ochhggghhco.g.',
      '..ochhhhhhcco.b.',
      '...occhhhcco..b.',
      '...occhhhcco..b.',
      '....occcco....b.',
      '....ob..bo......',
      '....ob..bo......',
      '...oob..boo.....',
      '................',
    ],
    idle2: [
      '...ohhhghhho..w.',
      '..ochhggghhco.g.',
      '..ochhhhhhcco.b.',
      '...occhhhcco..b.',
      '...occhhhcco..b.',
      '....occcco......',
      '....ob..bo......',
      '...oob..boo.....',
      '................',
      '................',
    ],
    walk1: [
      '...ohhhghhho.w..',
      '..ochhggghhco.g.',
      '..ochhhhhhcco.b.',
      '...occhhhcco..b.',
      '....occhcco...b.',
      '...obbo..obo....',
      '..obbo....obo...',
      '..ooo......oo...',
      '................',
      '................',
    ],
    walk2: [
      '...ohhhghhho..w.',
      '..ochhggghhco.g.',
      '..ochhhhhhcco.b.',
      '...occhhhcco..b.',
      '....occhcco...b.',
      '....ob..bo......',
      '....ob..bo......',
      '....oo..oo......',
      '................',
      '................',
    ],
    jump: [
      '..oohhhghhhoo.w.',
      '.ochhhggghhhc.g.',
      '..ochhhhhhcco.b.',
      '...occhhhcco....',
      '..oobbo.obboo...',
      '..ooo.....ooo...',
      '................',
      '................',
      '................',
      '................',
    ],
    hurt: [
      '...orrrgrrro....',
      '..orhhggghhro...',
      '..orhhhhhhcro...',
      '...occhhhcco....',
      '...obbo.obbo....',
      '..ooo.....ooo...',
      '................',
      '................',
      '................',
      '................',
    ],
    cast: [
      '...ohhhghhhoo.ww',
      '..ochhggghhhgwww',
      '..ochhhhhhcco.ww',
      '...occhhhcco..g.',
      '...occhhhcco....',
      '....occcco......',
      '....ob..bo......',
      '...oob..boo.....',
      '................',
      '................',
    ],
  };

  const body = bodyByFrame[frame];
  const combined = bob === 1 ? ['................', ...head, ...body.slice(0, 9)] : [...head, ...body];
  return combined.slice(0, 16);
}

export function getHeroSprite(
  classId: HeroClassId,
  frame: HeroFrame,
  scale = 3,
  flipX = false,
  flashWhite = false
): HTMLCanvasElement {
  return getSpriteCanvas(
    `hero_${classId}_${frame}`,
    {
      grid: getHeroGrid(classId, frame),
      palette: HERO_PALETTES[classId],
    },
    scale,
    flipX,
    flashWhite
  );
}

// ============================================================================
// 4 DISTINCT ENEMY ARCHETYPES (16x16)
// ============================================================================

const ENEMY_MATRICES: Record<EnemyArchetype, [PixelSpriteMatrix, PixelSpriteMatrix]> = {
  patrol: [
    {
      palette: { o: '#160c1c', g: '#58b847', G: '#95e874', d: '#2f6e2d', e: '#fff8dc', p: '#181425' },
      grid: [
        '................',
        '................',
        '................',
        '.....oooooo.....',
        '...oogGGGggoo...',
        '..ogGGgggggggo..',
        '..ogGggggggggo..',
        '.ogggoeoggoeogo.',
        '.ogggopoggopogo.',
        '.oggggggggggggo.',
        '.odggggggggggdo.',
        '.oddddddddddddo.',
        '..oooooooooooo..',
        '................',
        '................',
        '................',
      ],
    },
    {
      palette: { o: '#160c1c', g: '#58b847', G: '#95e874', d: '#2f6e2d', e: '#fff8dc', p: '#181425' },
      grid: [
        '................',
        '................',
        '................',
        '................',
        '....oooooooo....',
        '..oogGGGggggoo..',
        '.ogGGgggggggggo.',
        '.ogggoeoggoeogo.',
        '.ogggopoggopogo.',
        '.oggggggggggggo.',
        '.odddggggggdddo.',
        '.oddddddddddddo.',
        '..oooooooooooo..',
        '................',
        '................',
        '................',
      ],
    },
  ],
  orbiter: [
    {
      palette: { o: '#120a1c', v: '#7e3af2', V: '#b794f4', d: '#4c1d95', e: '#ff5a5f' },
      grid: [
        '................',
        '................',
        '.oo..........oo.',
        'oVvo..oooo..ovVo',
        'oVvvoovVVvoovvVo',
        '.odvvvVVVVvvvdo.',
        '..odvvveevvvdo..',
        '...oovvvvvvoo...',
        '.....ovddvo.....',
        '......oooo......',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
    {
      palette: { o: '#120a1c', v: '#7e3af2', V: '#b794f4', d: '#4c1d95', e: '#ff5a5f' },
      grid: [
        '................',
        '................',
        '......oooo......',
        '.....ovVVvo.....',
        '....ovVVVVvo....',
        '..oovvveevvvoo..',
        '.oVvvvvvvvvvvVo.',
        'oVvvdoovvoodvvVo',
        'oVdo...oo...odVo',
        '.oo..........oo.',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    },
  ],
  turret: [
    {
      palette: { o: '#12101a', s: '#5c5a72', S: '#9390ad', d: '#353247', c: '#f97316', C: '#fde047' },
      grid: [
        '.....oooooo.....',
        '....osSSSSso....',
        '...osSSccSSso...',
        '...osScCCcSso...',
        '...osSSccSSso...',
        '....osSSSSso....',
        '...oossssssoo...',
        '..osSddddddSso..',
        '..osSddccddSso..',
        '..osSddddddSso..',
        '..osSddddddSso..',
        '.oosSddddddSsoo.',
        '.oddddddddddddo.',
        '.oooooooooooooo.',
        '................',
        '................',
      ],
    },
    {
      palette: { o: '#12101a', s: '#5c5a72', S: '#9390ad', d: '#353247', c: '#ef4444', C: '#ffffff' },
      grid: [
        '.....oooooo.....',
        '....osSSSSso....',
        '...osScCCcSso...',
        '...osSCCCCSso...',
        '...osScCCcSso...',
        '....osSSSSso....',
        '...oossssssoo...',
        '..osSddddddSso..',
        '..osSdcCCcdSso..',
        '..osSddddddSso..',
        '..osSddddddSso..',
        '.oosSddddddSsoo.',
        '.oddddddddddddo.',
        '.oooooooooooooo.',
        '................',
        '................',
      ],
    },
  ],
  charger: [
    {
      palette: { o: '#160c10', a: '#7f1d1d', A: '#dc2626', s: '#9ca3af', S: '#e5e7eb', e: '#fde047' },
      grid: [
        '....oo....oo....',
        '...oSo....oSo...',
        '...oSsoooosSo...',
        '....oSssssSo....',
        '...oSsoeeosSo...',
        '...oSssssssSo...',
        '..ooAAssssAAoo..',
        '.oAAAaAAAAaAAAo.',
        '.oAAaaAAAAaaAAo.',
        '..oaaaAAAAaaao..',
        '...oaaAAAAaao...',
        '...osSo..osSo...',
        '..oosSo..osSoo..',
        '..oooo....oooo..',
        '................',
        '................',
      ],
    },
    {
      palette: { o: '#160c10', a: '#7f1d1d', A: '#ef4444', s: '#9ca3af', S: '#f3f4f6', e: '#fef08a' },
      grid: [
        '................',
        '...oo....oo.....',
        '..oSo....oSo....',
        '..oSsoooosSo....',
        '...oSsoeeosSo...',
        '..oSsssssssSo...',
        '.oAAAAssssAAoo..',
        '.oAAAaAAAAaAAAo.',
        '..oAaaAAAAaaAAo.',
        '...oaaAAAAaao...',
        '..osSo....osSo..',
        '.oosSo....osSoo.',
        '.oooo......oooo.',
        '................',
        '................',
        '................',
      ],
    },
  ],
};

export function getEnemySprite(
  archetype: EnemyArchetype,
  frameIndex: 0 | 1,
  scale = 3,
  flipX = false,
  flashWhite = false
): HTMLCanvasElement {
  return getSpriteCanvas(
    `enemy_${archetype}_${frameIndex}`,
    ENEMY_MATRICES[archetype][frameIndex],
    scale,
    flipX,
    flashWhite
  );
}

// ============================================================================
// 6 CASTLE BOSSES (20x20 procedural pixel art)
// ============================================================================

export type BossSpriteKey =
  | 'boss_ignis'
  | 'boss_ouroboros'
  | 'boss_malakor'
  | 'boss_aracne'
  | 'boss_chronos'
  | 'boss_lich';

const BOSS_MATRICES: Record<BossSpriteKey, PixelSpriteMatrix> = {
  boss_ignis: {
    palette: { o: '#1a0a08', r: '#5c2c24', R: '#8c4536', f: '#f97316', F: '#fde047', c: '#291512' },
    grid: [
      '......oFFooFFo......',
      '.....oFffFFffFo.....',
      '....ooRRRRRRRRoo....',
      '...oRRrrRRRRrrRRo...',
      '..oRRrFFrRRrFFrRRo..',
      '..oRRrffrRRrffrRRo..',
      '..oRRRrrrrrrrrRRRo..',
      '.ooRRRRrFFFFrRRRRoo.',
      'oRRRccRRrrrrRRccRRRo',
      'oRRcFFcRRRRRRcFFcRRo',
      'oRRcFFcRRffRRcFFcRRo',
      'oRRRccRRfFFfRRccRRRo',
      '.ooRRRRRfFFfRRRRRoo.',
      '..oRRRrrRffRrrRRRo..',
      '..oRRr..oRRo..rRRo..',
      '..oRRr..oRRo..rRRo..',
      '.ooRRro.oRRo.orRRoo.',
      '.occcco.oooo.occcco.',
      '.oooooo......oooooo.',
      '....................',
    ],
  },
  boss_ouroboros: {
    palette: { o: '#081812', g: '#15803d', G: '#4ade80', d: '#14532d', e: '#facc15', f: '#ef4444' },
    grid: [
      '......oooooooo......',
      '....ooGGGGGGGGoo....',
      '...oGGggggggggGGo...',
      '..oGGgddddddddgGGo..',
      '.oGGgdoooGGoooodGGo.',
      '.oGgdo.oGggGo.odgGo.',
      '.oGgdo.oGeegGo.odGo.',
      '.oGgd..oGffgGo..dGo.',
      '.oGgdo..oooo...odGo.',
      '.oGGgdo.......odGGo.',
      '..oGGgdooo..oodGGo..',
      '...oGGggGGooGGgGo...',
      '....ooGGGGGGGGoo....',
      '.....oGggggggGo.....',
      '....oGgdGGGGdgGo....',
      '...oGgdo....odgGo...',
      '...oGgo......ogGo...',
      '....oo........oo....',
      '....................',
      '....................',
    ],
  },
  boss_malakor: {
    palette: { o: '#100c1e', p: '#5b21b6', P: '#a78bfa', g: '#f59e0b', G: '#fef08a', s: '#e2e8f0' },
    grid: [
      '.......oGooGo.......',
      '......oGGGGGGoo.....',
      '.....oPppppppPo.....',
      '....oPppooooopPo....',
      '....oPpoGooGopPo....',
      '....oPpoooooopPo....',
      '...ooPPppGGppPPoo...',
      '..oPPppPPggPPppPPo..',
      '.oPPpGGpPPPPpGGpPPo.',
      '.oPppGGpPssPpGGppPo.',
      '..oPppppPssPppppPo..',
      '...oPpppPGGPpppPo...',
      '...oPppppppppppPo...',
      '..oPPppppggppppPPo..',
      '..oPpppppggpppppPo..',
      '..oPpppoooooopppPo..',
      '..oPppo......oppPo..',
      '...ooo........ooo...',
      '....................',
      '....................',
    ],
  },
  boss_aracne: {
    palette: { o: '#120816', b: '#4a1d5e', B: '#9333ea', e: '#f43f5e', w: '#e2e8f0', d: '#240b30' },
    grid: [
      '....oo........oo....',
      '...oBo..oooo..oBo...',
      '..oBo.ooBBBBoo.oBo..',
      '.oBo.oBBbbbbBBo.oBo.',
      'oBo..oBbddddbBo..oBo',
      'oo..oBbdBBBBdbBo..oo',
      '...oBbbBeeeeBbbBo...',
      '..oBbbbBeeeeBbbbBo..',
      '.oBo.oBbbbbbbBo.oBo.',
      'oBo..oBBbwwbBBo..oBo',
      'oo..oBboBBBBobBo..oo',
      '...oBo.obbbbo.oBo...',
      '..oBo..obddbo..oBo..',
      '.oBo...oBddBo...oBo.',
      'oBo....oBbbBo....oBo',
      'oo......oooo......oo',
      '....................',
      '....................',
      '....................',
      '....................',
    ],
  },
  boss_chronos: {
    palette: { o: '#09141f', c: '#0284c7', C: '#7dd3fc', g: '#eab308', G: '#fef08a', w: '#f8fafc' },
    grid: [
      '.....oooooooooo.....',
      '....oGGGGGGGGGGoo...',
      '.....oGccccccGoo....',
      '......oGccccGo......',
      '.......oGwwGo.......',
      '....oooGwwwwGooo....',
      '...oCCcGccccGcCCo...',
      '..oCCccGceecGccCCo..',
      '..oCCccGccccGccCCo..',
      '...oCCcGwwwwGcCCo...',
      '....ooGGwwwwGGoo....',
      '.......oGwwGo.......',
      '......oGccccGo......',
      '.....oGccGGccGo.....',
      '....oGGGGGGGGGGoo...',
      '.....oooooooooo.....',
      '......oCo..oCo......',
      '.......o....o.......',
      '....................',
      '....................',
    ],
  },
  boss_lich: {
    palette: { o: '#0a0812', k: '#312e81', K: '#6366f1', s: '#e2e8f0', e: '#10b981', g: '#f59e0b' },
    grid: [
      '....og..ogg..go.....',
      '....ogggggggggo.....',
      '.....ossssssso......',
      '....ossssoossso.....',
      '....ossoeooeosso....',
      '....ossssoossso.....',
      '.....osooosoos......',
      '...ooKKkkkkkkKKoo...',
      '..oKKkggggggggkKKo..',
      '.oKKkgKKeeeeKKgkKKo.',
      '.oKkkKKkeKKekKKkkKo.',
      '.oKkkKKkeeeeKKkkkKo.',
      '..oKkkkkKKKKkkkkKo..',
      '..oKkkkkkkkkkkkkKo..',
      '.oKKkkkkggggkkkkKKo.',
      '.oKkkkkkggggkkkkkKo.',
      '..oKkkoooooooookKo..',
      '...ooo........ooo...',
      '....................',
      '....................',
    ],
  },
};

export function getBossSprite(
  key: BossSpriteKey,
  scale = 4,
  flashWhite = false
): HTMLCanvasElement {
  return getSpriteCanvas(`boss_${key}`, BOSS_MATRICES[key], scale, false, flashWhite);
}

// ============================================================================
// WORLD PROPS & ITEMS (16x16)
// ============================================================================

export type PropSpriteKey =
  | 'altar_locked'
  | 'altar_solved'
  | 'bonfire1'
  | 'bonfire2'
  | 'chest_closed'
  | 'chest_open'
  | 'portal_locked'
  | 'portal_open'
  | 'dragon_potion'
  | 'ether_elixir'
  | 'oracle_scroll'
  | 'syntax_amulet';

const PROP_MATRICES: Record<PropSpriteKey, PixelSpriteMatrix> = {
  altar_locked: {
    palette: { o: '#120e1c', s: '#524b6b', S: '#857ca3', d: '#312c42', r: '#f59e0b', R: '#fef08a' },
    grid: [
      '......oRRo......',
      '.....oRrrRo.....',
      '....oRrRRrRo....',
      '.....oRrrRo.....',
      '......oooo......',
      '...oooooooooo...',
      '..oSSSSSSSSSSo..',
      '..osssrrrrssso..',
      '...osssssssso...',
      '....osddddso....',
      '....osdrddso....',
      '....osddddso....',
      '...oosddddsoo...',
      '..oSSSSSSSSSSo..',
      '.oddddddddddddo.',
      '.oooooooooooooo.',
    ],
  },
  altar_solved: {
    palette: { o: '#0e1714', s: '#4c6660', S: '#7da399', d: '#2c3d39', r: '#10b981', R: '#a7f3d0' },
    grid: [
      '......oRRo......',
      '.....oRrrRo.....',
      '....oRrRRrRo....',
      '.....oRrrRo.....',
      '......oooo......',
      '...oooooooooo...',
      '..oSSSSSSSSSSo..',
      '..osssrrrrssso..',
      '...osssssssso...',
      '....osddddso....',
      '....osdrddso....',
      '....osddddso....',
      '...oosddddsoo...',
      '..oSSSSSSSSSSo..',
      '.oddddddddddddo.',
      '.oooooooooooooo.',
    ],
  },
  bonfire1: {
    palette: { o: '#1a0e0a', f: '#f97316', F: '#fde047', r: '#dc2626', w: '#6b4226', s: '#9ca3af' },
    grid: [
      '.......oo.......',
      '......oFo.......',
      '.....oFFfo......',
      '....ofFFffo.....',
      '....orfFFro.....',
      '...orrfFFrro....',
      '...orrfFfrro....',
      '....orrffro.....',
      '.....ossso......',
      '......oso.......',
      '....oowwwoo.....',
      '..oowwwwwwwoo...',
      '.owwwoooowwwwo..',
      '..ooo....oooo...',
      '................',
      '................',
    ],
  },
  bonfire2: {
    palette: { o: '#1a0e0a', f: '#f97316', F: '#fef08a', r: '#ef4444', w: '#6b4226', s: '#9ca3af' },
    grid: [
      '......oo........',
      '.....oFFo.......',
      '.....ofFFo......',
      '....offFFfo.....',
      '...orrfFFrro....',
      '...orrfFfrro....',
      '....orffrro.....',
      '.....ossso......',
      '......oso.......',
      '....oowwwoo.....',
      '..oowwwwwwwoo...',
      '.owwwoooowwwwo..',
      '..ooo....oooo...',
      '................',
      '................',
      '................',
    ],
  },
  chest_closed: {
    palette: { o: '#1a100c', w: '#7c4a21', W: '#a86932', g: '#f59e0b', G: '#fde047' },
    grid: [
      '................',
      '................',
      '................',
      '..oooooooooooo..',
      '.oWWWWggggWWWWo.',
      '.oWWggWWWWggWWo.',
      '.oooooooooooooo.',
      '.owwwwgGGgwwwwo.',
      '.owwwwgGGgwwwwo.',
      '.owwwwggggwwwwo.',
      '.owwwwwwwwwwwwo.',
      '.ogwwwwwwwwwwgo.',
      '.oooooooooooooo.',
      '................',
      '................',
      '................',
    ],
  },
  chest_open: {
    palette: { o: '#1a100c', w: '#7c4a21', W: '#a86932', g: '#f59e0b', G: '#fef08a', d: '#26140a' },
    grid: [
      '..oooooooooooo..',
      '.oWWWWggggWWWWo.',
      '.oddddddddddddo.',
      '.odddGGGGGddddo.',
      '.oooooooooooooo.',
      '.owwwwggggwwwwo.',
      '.owwwwwwwwwwwwo.',
      '.owwwwwwwwwwwwo.',
      '.ogwwwwwwwwwwgo.',
      '.oooooooooooooo.',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  portal_locked: {
    palette: { o: '#110e1a', s: '#4b455e', S: '#7c7499', d: '#1c1829', r: '#ef4444' },
    grid: [
      '....oooooooo....',
      '..ooSSSSSSSSoo..',
      '.oSSddddddddSSo.',
      '.oSddddddddddSo.',
      'oSdddddrdddddsSo',
      'oSddddrrrddddsSo',
      'oSdddddrdddddsSo',
      'oSdddddddddddsSo',
      'oSdddddddddddsSo',
      'oSdddddddddddsSo',
      'oSdddddddddddsSo',
      'oSdddddddddddsSo',
      'oSdddddddddddsSo',
      'oSdddddddddddsSo',
      'oSSSSSSSSSSSSSSo',
      'oooooooooooooooo',
    ],
  },
  portal_open: {
    palette: { o: '#0c1618', s: '#4c5e6b', S: '#82a0b5', c: '#06b6d4', C: '#a5f3fc', g: '#fde047' },
    grid: [
      '....oooooooo....',
      '..ooSSSSSSSSoo..',
      '.oSSccccccccSSo.',
      '.oSccCCCCCCccSo.',
      'oSccCCggggCCccSo',
      'oSccCggCCggCccSo',
      'oSccCggCCggCccSo',
      'oSccCCggggCCccSo',
      'oSccCCCCCCCCccSo',
      'oScccCCCCCCcccSo',
      'oSccccCCCCccccSo',
      'oSccccccccccccSo',
      'oSccccccccccccSo',
      'oSccccccccccccSo',
      'oSSSSSSSSSSSSSSo',
      'oooooooooooooooo',
    ],
  },
  dragon_potion: {
    palette: { o: '#1a0c10', g: '#cbd5e1', c: '#92400e', r: '#dc2626', R: '#f87171', w: '#ffffff' },
    grid: [
      '......oooo......',
      '.....occcco.....',
      '......oggo......',
      '......oggo......',
      '.....oggggo.....',
      '....ogrrrrgo....',
      '...ogrrRwrrgo...',
      '...ogrRRRRrgo...',
      '...ogrrrrrrgo...',
      '...ogrrrrrrgo...',
      '....ogrrrrgo....',
      '.....oooooo.....',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  ether_elixir: {
    palette: { o: '#0c121e', g: '#cbd5e1', c: '#92400e', b: '#2563eb', B: '#60a5fa', w: '#ffffff' },
    grid: [
      '......oooo......',
      '.....occcco.....',
      '......oggo......',
      '......oggo......',
      '.....oggggo.....',
      '....ogbbbbgo....',
      '...ogbbBwbbgo...',
      '...ogbBBBBbgo...',
      '...ogbbbbbbgo...',
      '...ogbbbbbbgo...',
      '....ogbbbbgo....',
      '.....oooooo.....',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  oracle_scroll: {
    palette: { o: '#1a120a', p: '#e5d1a3', P: '#f7ebd0', w: '#8b5a2b', r: '#a855f7' },
    grid: [
      '................',
      '....oooooooo....',
      '...owwwwwwwwo...',
      '....oPPPPPPo....',
      '....oPprrpPo....',
      '....oPPPPPPo....',
      '....oPprppPo....',
      '....oPppppPo....',
      '....oPprrpPo....',
      '....oPPPPPPo....',
      '...owwwwwwwwo...',
      '....oooooooo....',
      '................',
      '................',
      '................',
      '................',
    ],
  },
  syntax_amulet: {
    palette: { o: '#14121c', g: '#f59e0b', G: '#fde047', c: '#06b6d4', C: '#a5f3fc' },
    grid: [
      '......oooo......',
      '.....og..go.....',
      '....og....go....',
      '.....oggggo.....',
      '....ogGGGGgo....',
      '...ogGcCCcGgo...',
      '...ogGCCCCGgo...',
      '...ogGcCCcGgo...',
      '....ogGGGGgo....',
      '.....oggggo.....',
      '......oGGo......',
      '.......oo.......',
      '................',
      '................',
      '................',
      '................',
    ],
  },
};

export function getPropSprite(
  key: PropSpriteKey,
  scale = 3,
  flashWhite = false
): HTMLCanvasElement {
  return getSpriteCanvas(`prop_${key}`, PROP_MATRICES[key], scale, false, flashWhite);
}
