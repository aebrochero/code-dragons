import test from 'node:test';
import assert from 'node:assert/strict';
import { CASTLES } from '../data/castlesCurriculum';
import { GRIMOIRE_PAGES } from '../data/grimoireData';
import { HERO_CLASSES } from '../data/classesData';
import { executeChallengeCode } from './codeSandbox';
import {
  adaptChallengeForClass,
  applyXpGain,
  calculateActionCost,
  calculateCounterattackDamage,
  getHintCost,
  rectsOverlap,
} from './gameRules';

test('curriculum has all 6 castles, 24 rooms, 6 bosses, 6 classes and 24 grimoire pages', () => {
  assert.equal(HERO_CLASSES.length, 6);
  assert.equal(CASTLES.length, 6);
  assert.equal(GRIMOIRE_PAGES.length, 24);
  let totalRooms = 0;
  for (const castle of CASTLES) {
    assert.equal(castle.rooms.length, 4, `Castle ${castle.id} must have 4 rooms`);
    assert.ok(castle.rooms[3].boss, `Castle ${castle.id} room 4 must have a boss`);
    totalRooms += castle.rooms.length;
    for (const room of castle.rooms) {
      assert.ok(room.altars.length >= 1, `Room ${room.id} must have at least 1 altar`);
    }
  }
  assert.equal(totalRooms, 24);
});

test('resource cost & Blood Pact HP sacrifice math is exact', () => {
  const normal = calculateActionCost(50, 80, 10);
  assert.equal(normal.resourceSpent, 10);
  assert.equal(normal.hpSacrificed, 0);
  assert.equal(normal.usedBloodPact, false);

  const zeroResource = calculateActionCost(0, 80, 10);
  assert.equal(zeroResource.resourceSpent, 0);
  assert.equal(zeroResource.hpSacrificed, 10);
  assert.equal(zeroResource.usedBloodPact, true);
  assert.equal(zeroResource.wouldSurvive, true);

  const partialResource = calculateActionCost(4, 15, 10);
  assert.equal(partialResource.resourceSpent, 4);
  assert.equal(partialResource.hpSacrificed, 8); // minimum meaningful blood pact cost
  assert.equal(partialResource.usedBloodPact, true);
});

test('Mago receives 40% cheaper Oracle hints than standard classes', () => {
  const mageTier1 = getHintCost('mage', 0);
  const warriorTier1 = getHintCost('warrior', 0);
  assert.ok(mageTier1 < warriorTier1, 'Mago hint should cost less than Guerrero');
  assert.equal(mageTier1, 9);
  assert.equal(warriorTier1, 15);
});

test('counterattack damage is halved when Syntax Amulet shield is active', () => {
  const raw = calculateCounterattackDamage(2, false, false);
  const shielded = calculateCounterattackDamage(2, false, true);
  assert.equal(raw.shieldConsumed, false);
  assert.equal(shielded.shieldConsumed, true);
  assert.equal(shielded.damage, Math.floor(raw.damage / 2));
});

test('XP gain triggers level-up and boosts max HP and max Resource', () => {
  const res = applyXpGain(
    {
      level: 1,
      xp: 80,
      xpToNext: 100,
      hp: 40,
      maxHp: 80,
      resource: 30,
      maxResource: 120,
    },
    50
  );
  assert.equal(res.leveledUp, true);
  assert.equal(res.level, 2);
  assert.equal(res.xp, 30);
  assert.equal(res.maxHp, 92);
  assert.equal(res.maxResource, 130);
  assert.equal(res.hp, 92);
  assert.equal(res.resource, 130);
});

test('AABB overlap helper detects intersections accurately', () => {
  assert.equal(
    rectsOverlap({ x: 0, y: 0, w: 32, h: 32 }, { x: 20, y: 20, w: 32, h: 32 }),
    true
  );
  assert.equal(
    rectsOverlap({ x: 0, y: 0, w: 32, h: 32 }, { x: 40, y: 0, w: 32, h: 32 }),
    false
  );
});

test('class challenge adapter customizes starter code, Paladin edge cases, and Rogue clean-code rule', async () => {
  const altar1 = CASTLES[0].rooms[0].altars[0].challenge;
  const mageAdapted = adaptChallengeForClass(altar1, 'mage');
  const paladinAdapted = adaptChallengeForClass(altar1, 'paladin');
  const rogueAdapted = adaptChallengeForClass(altar1, 'rogue');

  assert.ok(mageAdapted.starterCode.includes('[Guía del Mago]'));
  assert.ok(paladinAdapted.testCases.length > altar1.testCases.length);
  assert.ok(rogueAdapted.starterCode.includes('var texto'));

  // Rogue running legacy `var` code must be rejected by class rule
  const rogueFail = await executeChallengeCode({
    userCode: rogueAdapted.starterCode,
    adapted: rogueAdapted,
    classId: 'rogue',
  });
  assert.equal(rogueFail.success, false);
  assert.equal(rogueFail.error?.type, 'Regla de Clase');
});

test('sandbox catches infinite loops safely without hanging', async () => {
  const altar1 = CASTLES[0].rooms[0].altars[0].challenge;
  const adapted = adaptChallengeForClass(altar1, 'warrior');
  const res = await executeChallengeCode({
    userCode: `function presentarHeroe() { while (true) {} }`,
    adapted,
    classId: 'warrior',
  });
  assert.equal(res.success, false);
  assert.equal(res.results[0]?.passed, false);
  assert.ok(res.results[0]?.message.includes('INFINITE_LOOP'));
});

test('all Castles 1-3 console challenges pass with their solutionCode (including Paladin edge cases)', async () => {
  for (const castle of CASTLES.slice(0, 3)) {
    for (const room of castle.rooms) {
      for (const altar of room.altars) {
        const adapted = adaptChallengeForClass(altar.challenge, 'paladin');
        const res = await executeChallengeCode({
          userCode: altar.challenge.solutionCode,
          adapted,
          classId: 'paladin',
        });
        assert.equal(
          res.success,
          true,
          `Altar ${altar.id} failed solutionCode: ${JSON.stringify(res.results)} ${JSON.stringify(res.error)}`
        );
      }
    }
  }
});
