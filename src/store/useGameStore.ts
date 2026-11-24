import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { soundEngine } from '../assets/soundEngine';
import { getCastleById, getRoomByCastleAndIndex } from '../data/castlesCurriculum';
import { getHeroClass } from '../data/classesData';
import { SHOP_ITEMS } from '../data/shopItems';
import { applyXpGain } from '../engine/gameRules';
import { HeroClassId, SaveData, ScreenView, ShopItemId } from '../types/game';

const STORAGE_KEY = 'code_and_dragons_save_v1';

export function createInitialSave(heroName: string, classId: HeroClassId): SaveData {
  const cls = getHeroClass(classId);
  return {
    version: 1,
    heroName: heroName.trim() || 'Aventurero',
    classId,
    level: 1,
    xp: 0,
    xpToNext: 100,
    hp: cls.baseHp,
    maxHp: cls.baseHp,
    resource: cls.baseResource,
    maxResource: cls.baseResource,
    gold: 60,
    syntaxShieldActive: false,
    inventory: {
      dragon_potion: 2,
      ether_elixir: 2,
      oracle_scroll: 1,
      syntax_amulet: 1,
    },
    unlockedCastles: [1],
    conqueredCastles: [],
    solvedAltars: [],
    openedChests: [],
    unlockedGrimoire: ['c1_r1'],
    savedCode: {},
    unlockedHints: {},
    currentCastleId: 1,
    currentRoomIndex: 0,
    freeExploreMode: false,
    muted: false,
    showTouchControls: false,
    totalAttempts: 0,
    totalSuccesses: 0,
  };
}

function loadSaveFromStorage(): SaveData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    if (!parsed || typeof parsed !== 'object' || !parsed.classId) return null;
    const base = createInitialSave(parsed.heroName ?? 'Aventurero', parsed.classId);
    return {
      ...base,
      ...parsed,
      inventory: { ...base.inventory, ...(parsed.inventory ?? {}) },
      unlockedCastles: Array.isArray(parsed.unlockedCastles) ? parsed.unlockedCastles : [1],
      conqueredCastles: Array.isArray(parsed.conqueredCastles) ? parsed.conqueredCastles : [],
      solvedAltars: Array.isArray(parsed.solvedAltars) ? parsed.solvedAltars : [],
      openedChests: Array.isArray(parsed.openedChests) ? parsed.openedChests : [],
      unlockedGrimoire: Array.isArray(parsed.unlockedGrimoire) ? parsed.unlockedGrimoire : ['c1_r1'],
      savedCode: parsed.savedCode ?? {},
      unlockedHints: parsed.unlockedHints ?? {},
    };
  } catch {
    return null;
  }
}

export interface ToastNotice {
  id: number;
  text: string;
  tone: 'gold' | 'arcane' | 'danger' | 'success';
}

interface GameContextValue {
  screen: ScreenView;
  setScreen: (s: ScreenView) => void;
  hasExistingSave: boolean;
  save: SaveData;
  toast: ToastNotice | null;
  notify: (text: string, tone?: ToastNotice['tone']) => void;
  startNewHero: (heroName: string, classId: HeroClassId, freeExplore?: boolean) => void;
  continueAdventure: () => void;
  enterPracticeMode: () => void;
  enterRoom: (castleId: number, roomIndex: number) => void;
  toggleFreeExplore: () => void;
  toggleMute: () => void;
  toggleTouchControls: () => void;
  damagePlayer: (amount: number, reason?: string) => { died: boolean; newHp: number };
  spendResourceOrBlood: (resourceSpent: number, hpSacrificed: number) => { died: boolean };
  restAtCheckpoint: () => void;
  respawnAtCheckpoint: () => void;
  useQuickItem: (itemId: ShopItemId) => boolean;
  consumeOracleScroll: () => boolean;
  buyShopItem: (itemId: ShopItemId) => boolean;
  consumeSyntaxShield: () => void;
  recordAttempt: (passed: boolean) => void;
  saveAltarCode: (altarId: string, code: string) => void;
  unlockHintTier: (altarId: string, tierCount: number) => void;
  markAltarSolved: (altarId: string, xpReward: number, goldReward: number) => {
    leveledUp: boolean;
    castleConquered: boolean;
  };
  openChest: (chestId: string, gold: number, xp: number) => void;
  unlockGrimoirePage: (pageId: string) => void;
  victoryCastleId: number | null;
  clearVictoryModal: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialStored = useMemo(() => loadSaveFromStorage(), []);
  const isAutostart = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('autostart') === '1';
  }, []);

  const [hasExistingSave, setHasExistingSave] = useState<boolean>(Boolean(initialStored));
  const [save, setSave] = useState<SaveData>(
    () => initialStored ?? createInitialSave('Lyra', 'mage')
  );
  const [screen, setScreen] = useState<ScreenView>(() => (isAutostart ? 'playing' : 'title'));
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const [victoryCastleId, setVictoryCastleId] = useState<number | null>(null);

  // Sync mute state
  useEffect(() => {
    soundEngine.setMuted(save.muted);
  }, [save.muted]);

  // Persist save automatically whenever hero has started or loaded
  useEffect(() => {
    if (hasExistingSave || screen !== 'title') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
      } catch {
        // Ignore storage quota issues
      }
    }
  }, [save, hasExistingSave, screen]);

  const notify = useCallback((text: string, tone: ToastNotice['tone'] = 'arcane') => {
    const id = Date.now() + Math.random();
    setToast({ id, text, tone });
    window.setTimeout(() => {
      setToast((prev) => (prev && prev.id === id ? null : prev));
    }, 3200);
  }, []);

  const startNewHero = useCallback(
    (heroName: string, classId: HeroClassId, freeExplore = false) => {
      const fresh = createInitialSave(heroName, classId);
      fresh.freeExploreMode = freeExplore;
      setSave(fresh);
      setHasExistingSave(true);
      setVictoryCastleId(null);
      setScreen('world_map');
      soundEngine.play('levelUp');
      notify(`¡${fresh.heroName} (${getHeroClass(classId).name}) inicia su crónica!`, 'gold');
    },
    [notify]
  );

  const continueAdventure = useCallback(() => {
    soundEngine.play('click');
    setScreen('world_map');
  }, []);

  const enterPracticeMode = useCallback(() => {
    soundEngine.play('click');
    setSave((prev) => ({ ...prev, freeExploreMode: true }));
    setHasExistingSave(true);
    setScreen('world_map');
    notify('Modo Exploración Libre activado: todos los castillos están accesibles.', 'arcane');
  }, [notify]);

  const unlockGrimoirePage = useCallback((pageId: string) => {
    setSave((prev) => {
      if (prev.unlockedGrimoire.includes(pageId)) return prev;
      return {
        ...prev,
        unlockedGrimoire: [...prev.unlockedGrimoire, pageId],
      };
    });
  }, []);

  const enterRoom = useCallback(
    (castleId: number, roomIndex: number) => {
      const room = getRoomByCastleAndIndex(castleId, roomIndex);
      setSave((prev) => {
        const unlockedGrimoire = prev.unlockedGrimoire.includes(room.grimoirePageId)
          ? prev.unlockedGrimoire
          : [...prev.unlockedGrimoire, room.grimoirePageId];
        return {
          ...prev,
          currentCastleId: castleId,
          currentRoomIndex: roomIndex,
          hp: Math.max(prev.hp, Math.ceil(prev.maxHp * 0.5)),
          unlockedGrimoire,
        };
      });
      setScreen('playing');
      soundEngine.play('openAltar');
    },
    []
  );

  const toggleFreeExplore = useCallback(() => {
    soundEngine.play('click');
    setSave((prev) => ({ ...prev, freeExploreMode: !prev.freeExploreMode }));
  }, []);

  const toggleMute = useCallback(() => {
    setSave((prev) => {
      const next = !prev.muted;
      soundEngine.setMuted(next);
      return { ...prev, muted: next };
    });
  }, []);

  const toggleTouchControls = useCallback(() => {
    soundEngine.play('click');
    setSave((prev) => ({ ...prev, showTouchControls: !prev.showTouchControls }));
  }, []);

  const damagePlayer = useCallback((amount: number, reason?: string) => {
    let result = { died: false, newHp: 1 };
    setSave((prev) => {
      const nextHp = Math.max(0, prev.hp - Math.max(0, Math.round(amount)));
      result = { died: nextHp <= 0, newHp: nextHp };
      return { ...prev, hp: nextHp };
    });
    if (reason) {
      notify(reason, 'danger');
    }
    return result;
  }, [notify]);

  const spendResourceOrBlood = useCallback((resourceSpent: number, hpSacrificed: number) => {
    let died = false;
    setSave((prev) => {
      const nextRes = Math.max(0, prev.resource - resourceSpent);
      const nextHp = Math.max(0, prev.hp - hpSacrificed);
      died = nextHp <= 0;
      return {
        ...prev,
        resource: nextRes,
        hp: nextHp,
      };
    });
    return { died };
  }, []);

  const restAtCheckpoint = useCallback(() => {
    soundEngine.play('checkpoint');
    setSave((prev) => ({
      ...prev,
      hp: prev.maxHp,
      resource: prev.maxResource,
    }));
    notify('Hoguera encendida: HP y recurso restaurados al máximo.', 'success');
  }, [notify]);

  const respawnAtCheckpoint = useCallback(() => {
    soundEngine.play('checkpoint');
    setSave((prev) => ({
      ...prev,
      hp: prev.maxHp,
      resource: prev.maxResource,
    }));
    notify('Renaces junto a la última Hoguera con tus fuerzas restauradas.', 'arcane');
  }, [notify]);

  const useQuickItem = useCallback(
    (itemId: ShopItemId): boolean => {
      let used = false;
      setSave((prev) => {
        const count = prev.inventory[itemId] ?? 0;
        if (count <= 0) return prev;

        if (itemId === 'dragon_potion') {
          if (prev.hp >= prev.maxHp) return prev;
          used = true;
          return {
            ...prev,
            hp: Math.min(prev.maxHp, prev.hp + 50),
            inventory: { ...prev.inventory, dragon_potion: count - 1 },
          };
        }

        if (itemId === 'ether_elixir') {
          if (prev.resource >= prev.maxResource) return prev;
          used = true;
          return {
            ...prev,
            resource: Math.min(prev.maxResource, prev.resource + 50),
            inventory: { ...prev.inventory, ether_elixir: count - 1 },
          };
        }

        if (itemId === 'syntax_amulet') {
          if (prev.syntaxShieldActive) return prev;
          used = true;
          return {
            ...prev,
            syntaxShieldActive: true,
            inventory: { ...prev.inventory, syntax_amulet: count - 1 },
          };
        }

        return prev;
      });

      if (used) {
        soundEngine.play('potion');
        if (itemId === 'dragon_potion') notify('+50 HP restaurados con Sangre de Dragón.', 'success');
        if (itemId === 'ether_elixir') notify('+50 de recurso restaurados.', 'arcane');
        if (itemId === 'syntax_amulet')
          notify('Amuleto de Sintaxis activo: próximo contraataque reducido al 50%.', 'gold');
      }
      return used;
    },
    [notify]
  );

  const consumeOracleScroll = useCallback((): boolean => {
    let ok = false;
    setSave((prev) => {
      if (prev.inventory.oracle_scroll <= 0) return prev;
      ok = true;
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          oracle_scroll: prev.inventory.oracle_scroll - 1,
        },
      };
    });
    if (ok) {
      soundEngine.play('openAltar');
      notify('Pergamino de Sabiduría usado: pista gratuita revelada.', 'gold');
    }
    return ok;
  }, [notify]);

  const buyShopItem = useCallback(
    (itemId: ShopItemId): boolean => {
      const def = SHOP_ITEMS.find((i) => i.id === itemId);
      if (!def) return false;
      let bought = false;
      setSave((prev) => {
        if (prev.gold < def.price) return prev;
        bought = true;
        return {
          ...prev,
          gold: prev.gold - def.price,
          inventory: {
            ...prev.inventory,
            [itemId]: (prev.inventory[itemId] ?? 0) + 1,
          },
        };
      });
      if (bought) {
        soundEngine.play('buy');
        notify(`Compraste ${def.name} por ${def.price} de oro.`, 'gold');
      } else {
        soundEngine.play('codeError');
        notify('No tienes suficiente oro para este objeto.', 'danger');
      }
      return bought;
    },
    [notify]
  );

  const consumeSyntaxShield = useCallback(() => {
    setSave((prev) => (prev.syntaxShieldActive ? { ...prev, syntaxShieldActive: false } : prev));
  }, []);

  const recordAttempt = useCallback((passed: boolean) => {
    setSave((prev) => ({
      ...prev,
      totalAttempts: prev.totalAttempts + 1,
      totalSuccesses: prev.totalSuccesses + (passed ? 1 : 0),
    }));
  }, []);

  const saveAltarCode = useCallback((altarId: string, code: string) => {
    setSave((prev) => ({
      ...prev,
      savedCode: { ...prev.savedCode, [altarId]: code },
    }));
  }, []);

  const unlockHintTier = useCallback((altarId: string, tierCount: number) => {
    setSave((prev) => ({
      ...prev,
      unlockedHints: {
        ...prev.unlockedHints,
        [altarId]: Math.max(prev.unlockedHints[altarId] ?? 0, tierCount),
      },
    }));
  }, []);

  const markAltarSolved = useCallback(
    (altarId: string, xpReward: number, goldReward: number) => {
      let leveledUp = false;
      let castleConquered = false;
      let conqueredId: number | null = null;

      setSave((prev) => {
        const alreadySolved = prev.solvedAltars.includes(altarId);
        const solvedAltars = alreadySolved ? prev.solvedAltars : [...prev.solvedAltars, altarId];

        const xpResult = alreadySolved
          ? {
              level: prev.level,
              xp: prev.xp,
              xpToNext: prev.xpToNext,
              hp: prev.hp,
              maxHp: prev.maxHp,
              resource: prev.resource,
              maxResource: prev.maxResource,
              leveledUp: false,
            }
          : applyXpGain(prev, xpReward);

        leveledUp = xpResult.leveledUp;

        // Check if current castle's boss room is now completely solved
        const castle = getCastleById(prev.currentCastleId);
        const bossRoom = castle.rooms[3];
        const bossCleared =
          bossRoom &&
          bossRoom.altars.every((a) => solvedAltars.includes(a.id));

        let conqueredCastles = prev.conqueredCastles;
        let unlockedCastles = prev.unlockedCastles;

        if (bossCleared && !conqueredCastles.includes(castle.id)) {
          castleConquered = true;
          conqueredId = castle.id;
          conqueredCastles = [...conqueredCastles, castle.id];
          if (castle.id < 6 && !unlockedCastles.includes(castle.id + 1)) {
            unlockedCastles = [...unlockedCastles, castle.id + 1];
          }
        }

        // Small resource recovery on solving an altar
        const restoredRes = Math.min(
          xpResult.maxResource,
          xpResult.resource + (alreadySolved ? 0 : 20)
        );

        return {
          ...prev,
          level: xpResult.level,
          xp: xpResult.xp,
          xpToNext: xpResult.xpToNext,
          hp: xpResult.hp,
          maxHp: xpResult.maxHp,
          resource: restoredRes,
          maxResource: xpResult.maxResource,
          gold: prev.gold + (alreadySolved ? 0 : goldReward),
          solvedAltars,
          conqueredCastles,
          unlockedCastles,
        };
      });

      if (castleConquered && conqueredId !== null) {
        soundEngine.play('bossVictory');
        setVictoryCastleId(conqueredId);
      } else if (leveledUp) {
        soundEngine.play('levelUp');
        notify('¡SUBISTE DE NIVEL! HP y recurso máximos aumentados y restaurados.', 'gold');
      } else {
        soundEngine.play('codeSuccess');
      }

      return { leveledUp, castleConquered };
    },
    [notify]
  );

  const openChest = useCallback(
    (chestId: string, gold: number, xp: number) => {
      let opened = false;
      setSave((prev) => {
        if (prev.openedChests.includes(chestId)) return prev;
        opened = true;
        const xpRes = applyXpGain(prev, xp);
        return {
          ...prev,
          level: xpRes.level,
          xp: xpRes.xp,
          xpToNext: xpRes.xpToNext,
          hp: xpRes.hp,
          maxHp: xpRes.maxHp,
          resource: xpRes.resource,
          maxResource: xpRes.maxResource,
          gold: prev.gold + gold,
          openedChests: [...prev.openedChests, chestId],
        };
      });
      if (opened) {
        soundEngine.play('buy');
        notify(`¡Cofre abierto! +${gold} Oro y +${xp} XP.`, 'gold');
      }
    },
    [notify]
  );

  const clearVictoryModal = useCallback(() => {
    setVictoryCastleId(null);
  }, []);

  const value: GameContextValue = {
    screen,
    setScreen,
    hasExistingSave,
    save,
    toast,
    notify,
    startNewHero,
    continueAdventure,
    enterPracticeMode,
    enterRoom,
    toggleFreeExplore,
    toggleMute,
    toggleTouchControls,
    damagePlayer,
    spendResourceOrBlood,
    restAtCheckpoint,
    respawnAtCheckpoint,
    useQuickItem,
    consumeOracleScroll,
    buyShopItem,
    consumeSyntaxShield,
    recordAttempt,
    saveAltarCode,
    unlockHintTier,
    markAltarSolved,
    openChest,
    unlockGrimoirePage,
    victoryCastleId,
    clearVictoryModal,
  };

  return React.createElement(GameContext.Provider, { value }, children);
};

export function useGameStore(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameStore debe usarse dentro de GameProvider');
  return ctx;
}
