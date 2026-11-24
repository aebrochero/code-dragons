import React, { useEffect, useState } from 'react';
import { Flame, Home, Map, Play, RotateCcw } from 'lucide-react';
import { soundEngine } from './assets/soundEngine';
import { CastleVictoryModal } from './components/CastleVictoryModal';
import { ClassSelection } from './components/ClassSelection';
import { CodeAltarModal } from './components/CodeAltarModal';
import { GameHUD } from './components/GameHUD';
import { GrimoireModal } from './components/GrimoireModal';
import { TavernModal } from './components/TavernModal';
import { TitleScreen } from './components/TitleScreen';
import { WorldMap } from './components/WorldMap';
import { getCastleById, getRoomByCastleAndIndex } from './data/castlesCurriculum';
import { PlatformerCanvas } from './engine/PlatformerCanvas';
import { GameProvider, useGameStore } from './store/useGameStore';
import { AltarPlacement } from './types/game';

const GameShell: React.FC = () => {
  const {
    screen,
    setScreen,
    save,
    toast,
    enterRoom,
    damagePlayer,
    restAtCheckpoint,
    respawnAtCheckpoint,
    openChest,
    useQuickItem,
    toggleMute,
    victoryCastleId,
    clearVictoryModal,
    notify,
  } = useGameStore();

  const [activeAltar, setActiveAltar] = useState<AltarPlacement | null>(null);
  const [showGrimoire, setShowGrimoire] = useState(false);
  const [showTavern, setShowTavern] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const castle = getCastleById(save.currentCastleId);
  const room = getRoomByCastleAndIndex(save.currentCastleId, save.currentRoomIndex);
  const isDefeated = screen === 'playing' && save.hp <= 0;
  const simulationPaused =
    isPaused ||
    Boolean(activeAltar) ||
    showGrimoire ||
    showTavern ||
    isDefeated ||
    victoryCastleId !== null;

  // Mirror state machine to document.body.dataset.state for predictable transitions
  useEffect(() => {
    if (screen === 'title' || screen === 'class_select' || screen === 'world_map') {
      document.body.dataset.state = screen === 'title' ? 'title' : screen;
    } else if (isDefeated || victoryCastleId !== null) {
      document.body.dataset.state = 'gameover';
    } else if (simulationPaused) {
      document.body.dataset.state = 'paused';
    } else {
      document.body.dataset.state = 'playing';
    }
  }, [screen, isDefeated, victoryCastleId, simulationPaused]);

  // Global gameplay shortcuts (1/2/3 potions, G Grimoire, M Mute, Esc/P Pause)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (e.code === 'Escape') {
        if (showGrimoire) {
          setShowGrimoire(false);
          return;
        }
        if (showTavern) {
          setShowTavern(false);
          return;
        }
        if (activeAltar) {
          setActiveAltar(null);
          return;
        }
        if (screen === 'playing' && !isDefeated && victoryCastleId === null) {
          setIsPaused((prev) => !prev);
        }
        return;
      }

      if (isTyping) return;

      if (e.code === 'KeyG' && (screen === 'playing' || screen === 'world_map')) {
        e.preventDefault();
        setShowGrimoire((prev) => !prev);
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (
        e.code === 'KeyP' &&
        screen === 'playing' &&
        !activeAltar &&
        !showGrimoire &&
        !isDefeated
      ) {
        setIsPaused((prev) => !prev);
      } else if (screen === 'playing' && !activeAltar && !isPaused && !isDefeated) {
        if (e.key === '1') useQuickItem('dragon_potion');
        if (e.key === '2') useQuickItem('ether_elixir');
        if (e.key === '3') useQuickItem('syntax_amulet');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    screen,
    activeAltar,
    showGrimoire,
    showTavern,
    isPaused,
    isDefeated,
    victoryCastleId,
    useQuickItem,
    toggleMute,
  ]);

  const handleEnterExitPortal = () => {
    if (save.currentRoomIndex < 3) {
      const nextIdx = save.currentRoomIndex + 1;
      enterRoom(save.currentCastleId, nextIdx);
      notify(`Avanzas a la Sala ${nextIdx + 1}/4 del Castillo ${save.currentCastleId}.`, 'arcane');
    } else {
      // Boss room exit portal -> back to world map
      soundEngine.play('openAltar');
      setScreen('world_map');
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0d0b14]">
      {screen === 'title' && <TitleScreen />}

      {screen === 'class_select' && <ClassSelection />}

      {screen === 'world_map' && (
        <WorldMap
          onOpenTavern={() => setShowTavern(true)}
          onOpenGrimoire={() => setShowGrimoire(true)}
        />
      )}

      {screen === 'playing' && (
        <div className="relative h-full w-full">
          <PlatformerCanvas
            room={room}
            theme={castle.theme}
            classId={save.classId}
            solvedAltars={save.solvedAltars}
            openedChests={save.openedChests}
            isPaused={simulationPaused}
            hp={save.hp}
            showTouchControls={save.showTouchControls}
            onOpenAltar={(altar) => setActiveAltar(altar)}
            onRestBonfire={restAtCheckpoint}
            onOpenChest={openChest}
            onTakeDamage={(amt, reason) => damagePlayer(amt, reason)}
            onEnterExitPortal={handleEnterExitPortal}
          />

          <GameHUD
            onOpenGrimoire={() => setShowGrimoire(true)}
            onTogglePause={() => setIsPaused((p) => !p)}
          />
        </div>
      )}

      {/* Dual Code Altar Modal */}
      {activeAltar && screen === 'playing' && (
        <CodeAltarModal
          altar={activeAltar}
          castleId={save.currentCastleId}
          isBossRoom={save.currentRoomIndex === 3}
          onClose={() => setActiveAltar(null)}
          onOpenGrimoire={() => setShowGrimoire(true)}
        />
      )}

      {/* Grimoire Compendium Modal */}
      {showGrimoire && <GrimoireModal onClose={() => setShowGrimoire(false)} />}

      {/* Tavern Shop Modal */}
      {showTavern && <TavernModal onClose={() => setShowTavern(false)} />}

      {/* Pause Modal */}
      {isPaused && screen === 'playing' && !activeAltar && !isDefeated && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Juego en Pausa"
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4"
        >
          <div className="pixel-panel w-full max-w-md p-6 text-center text-stone-100">
            <h2 className="font-display text-2xl font-bold text-amber-100">
              Pausa
            </h2>
            <p className="mt-1 font-code text-xs text-stone-400">
              Castillo {castle.id}: {room.name}
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="pixel-btn flex items-center justify-center gap-2 bg-[#d97706] border-amber-300 py-2.5 font-pixel text-xs text-[#190f04]"
              >
                <Play className="h-4 w-4" />
                <span>Reanudar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPaused(false);
                  enterRoom(save.currentCastleId, save.currentRoomIndex);
                }}
                className="pixel-btn flex items-center justify-center gap-2 bg-[#231b38] py-2.5 font-pixel text-xs text-stone-100"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reiniciar Sala</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPaused(false);
                  setScreen('world_map');
                }}
                className="pixel-btn flex items-center justify-center gap-2 bg-[#1c2838] py-2.5 font-pixel text-xs text-sky-100"
              >
                <Map className="h-4 w-4" />
                <span>Mapa del Reino</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPaused(false);
                  setScreen('title');
                }}
                className="pixel-btn flex items-center justify-center gap-2 bg-[#1d1729] py-2.5 font-pixel text-xs text-stone-300"
              >
                <Home className="h-4 w-4" />
                <span>Menú Principal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Defeat / Bonfire Respawn Modal */}
      {isDefeated && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Derrota - Reaparecer en Hoguera"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
        >
          <div className="pixel-panel-warm w-full max-w-md border-rose-500/80 p-6 text-center text-stone-100">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border-2 border-rose-400 bg-[#36111a] text-rose-300">
              <Flame className="h-8 w-8" />
            </div>
            <h2 className="font-display text-3xl font-bold text-rose-200">
              Has Caído en Combate
            </h2>
            <p className="mt-2 text-lg text-stone-300">
              Tu vida llegó a 0 HP. La llama de la última Hoguera te restaurará por completo para intentarlo de nuevo.
            </p>
            <div className="my-4 grid grid-cols-2 gap-3 border-y border-[#4a2b34] py-3 font-code text-xs tabular-nums">
              <div>
                <div className="text-stone-400">Sala actual</div>
                <div className="font-bold text-amber-200">
                  C{castle.id} · Sala {save.currentRoomIndex + 1}/4
                </div>
              </div>
              <div>
                <div className="text-stone-400">Altares resueltos</div>
                <div className="font-bold text-emerald-300">
                  {save.solvedAltars.length}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                data-start="true"
                onClick={() => {
                  setActiveAltar(null);
                  respawnAtCheckpoint();
                }}
                className="pixel-btn bg-[#d97706] border-amber-300 py-3 font-pixel text-xs text-[#190f04]"
              >
                Reaparecer en la Hoguera
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveAltar(null);
                  respawnAtCheckpoint();
                  setScreen('world_map');
                }}
                className="pixel-btn bg-[#231b38] py-2.5 font-pixel text-xs text-stone-200"
              >
                Volver al Mapa del Reino
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Castle Victory & Graduation Modal */}
      {victoryCastleId !== null && (
        <CastleVictoryModal
          castleId={victoryCastleId}
          onContinueNextCastle={() => {
            const nextId = Math.min(6, victoryCastleId + 1);
            clearVictoryModal();
            setActiveAltar(null);
            enterRoom(nextId, 0);
          }}
          onReturnMap={() => {
            clearVictoryModal();
            setActiveAltar(null);
            setScreen('world_map');
          }}
        />
      )}

      {/* Floating RPG Notification Banner */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`pointer-events-none fixed bottom-5 right-5 z-50 max-w-sm border-2 px-4 py-2.5 font-code text-xs shadow-[0_4px_0_#09070f] ${
            toast.tone === 'danger'
              ? 'border-rose-400 bg-[#331018] text-rose-100'
              : toast.tone === 'success'
                ? 'border-emerald-400 bg-[#102b20] text-emerald-100'
                : toast.tone === 'gold'
                  ? 'border-amber-400 bg-[#2d1f0d] text-amber-100'
                  : 'border-violet-400 bg-[#1d1633] text-violet-100'
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  );
}
