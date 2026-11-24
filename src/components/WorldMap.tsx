import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Coins,
  Compass,
  Lock,
  Play,
  Store,
  Swords,
  Trophy,
  Home,
} from 'lucide-react';
import { soundEngine } from '../assets/soundEngine';
import { CASTLES } from '../data/castlesCurriculum';
import { getHeroClass } from '../data/classesData';
import { useGameStore } from '../store/useGameStore';
import { SpritePreview } from './SpritePreview';

interface WorldMapProps {
  onOpenTavern: () => void;
  onOpenGrimoire: () => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  onOpenTavern,
  onOpenGrimoire,
}) => {
  const { save, setScreen, enterRoom, toggleFreeExplore } = useGameStore();
  const [selectedCastleId, setSelectedCastleId] = useState<number>(save.currentCastleId);

  const heroClass = getHeroClass(save.classId);
  const selectedCastle =
    CASTLES.find((c) => c.id === selectedCastleId) ?? CASTLES[0];
  const isSelectedUnlocked =
    save.freeExploreMode || save.unlockedCastles.includes(selectedCastle.id);

  return (
    <main className="min-h-full w-full overflow-y-auto bg-[#0f0c18] px-6 py-5 text-stone-100">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Compact Hero & Kingdom Toolbar */}
        <div className="pixel-panel flex flex-wrap items-center justify-between gap-4 px-5 py-3.5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center border-2 border-[#594978] bg-[#110e1c]">
              <SpritePreview kind="hero" heroClass={save.classId} scale={2} animate />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-amber-100">
                  {save.heroName}
                </h1>
                <span className="font-code text-xs text-stone-400">
                  · {heroClass.name} · Nivel {save.level}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-code text-xs tabular-nums text-stone-300">
                <span className="text-rose-400">
                  HP {save.hp}/{save.maxHp}
                </span>
                <span aria-hidden="true">·</span>
                <span
                  className={
                    heroClass.resourceType === 'mana' ? 'text-sky-400' : 'text-amber-400'
                  }
                >
                  {heroClass.resourceLabel} {save.resource}/{save.maxResource}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-amber-300">
                  <Coins className="h-3.5 w-3.5" />
                  {save.gold} Oro
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-300">
                  {save.conqueredCastles.length}/6 Castillos
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={toggleFreeExplore}
              aria-pressed={save.freeExploreMode}
              className={`pixel-btn flex items-center gap-2 px-3.5 py-2 text-xs font-code whitespace-nowrap ${
                save.freeExploreMode
                  ? 'bg-[#1d3a2f] border-emerald-400 text-emerald-100'
                  : 'bg-[#1c162b] text-stone-300'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>
                Exploración Libre: {save.freeExploreMode ? 'ON' : 'OFF'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.play('click');
                onOpenTavern();
              }}
              className="pixel-btn flex items-center gap-2 bg-[#4a2b17] border-amber-500/80 px-3.5 py-2 text-xs font-code text-amber-100 whitespace-nowrap"
            >
              <Store className="h-4 w-4" />
              <span>Taberna</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.play('click');
                onOpenGrimoire();
              }}
              className="pixel-btn flex items-center gap-2 bg-[#231b3d] border-violet-400/70 px-3.5 py-2 text-xs font-code text-violet-100 whitespace-nowrap"
            >
              <BookOpen className="h-4 w-4" />
              <span>Grimorio ({save.unlockedGrimoire.length}/24)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.play('click');
                setScreen('title');
              }}
              aria-label="Volver al título"
              className="pixel-btn flex items-center gap-1.5 bg-[#1b1628] px-3 py-2 text-xs font-code text-stone-300 whitespace-nowrap"
            >
              <Home className="h-4 w-4" />
              <span>Título</span>
            </button>
          </div>
        </div>

        {/* Main 2-column World Map + Selected Castle Inspection Panel */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Interactive Overworld Pixel Map */}
          <section
            aria-label="Mapa del Reino"
            className="pixel-panel relative overflow-hidden lg:col-span-7 min-h-[430px] bg-[#161b26]"
          >
            {/* Procedural SVG Kingdom Terrain & Winding Road */}
            <svg
              viewBox="0 0 700 440"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <rect width="700" height="440" fill="#151b26" />
              {/* Pixel-styled biome regions */}
              <polygon points="0,260 220,210 340,440 0,440" fill="#1c2b24" />
              <polygon points="220,210 470,120 620,270 340,440" fill="#211d36" />
              <polygon points="440,0 700,0 700,250 470,120" fill="#2a1624" />
              {/* Distant water & mountain ridges */}
              <path
                d="M0 110 L75 65 L145 110 L215 50 L295 115 L360 80 L430 120"
                fill="none"
                stroke="#2d384d"
                strokeWidth="4"
              />
              {/* Winding dashed medieval trail linking the 6 Castles */}
              <path
                d="M91 325 C 145 270, 165 250, 203 228 C 250 200, 275 155, 322 136 C 375 140, 395 250, 434 277 C 495 265, 515 205, 539 176 C 575 135, 600 105, 623 80"
                fill="none"
                stroke="#a17f47"
                strokeWidth="5"
                strokeDasharray="10 8"
              />
            </svg>

            <div className="relative z-10 flex items-center justify-between px-4 py-3">
              <h2 className="font-display text-lg font-bold text-amber-100 hud-text-shadow">
                Mapa del Reino del Frontend
              </h2>
              <span className="font-code text-xs text-stone-300 hud-text-shadow">
                Selecciona un castillo para explorar
              </span>
            </div>

            {/* 6 Interactive Castle Nodes */}
            {CASTLES.map((castle) => {
              const conquered = save.conqueredCastles.includes(castle.id);
              const unlocked =
                save.freeExploreMode || save.unlockedCastles.includes(castle.id);
              const isSelected = castle.id === selectedCastleId;
              const solvedCount = castle.rooms
                .flatMap((r) => r.altars)
                .filter((a) => save.solvedAltars.includes(a.id)).length;
              const totalCount = castle.rooms.flatMap((r) => r.altars).length;

              return (
                <button
                  key={castle.id}
                  type="button"
                  onClick={() => {
                    soundEngine.play('click');
                    setSelectedCastleId(castle.id);
                  }}
                  style={{
                    left: `${castle.mapPos.x}%`,
                    top: `${castle.mapPos.y}%`,
                  }}
                  aria-label={`Castillo ${castle.id}: ${castle.name} (${
                    conquered
                      ? 'Conquistado'
                      : unlocked
                        ? 'Desbloqueado'
                        : 'Bloqueado'
                  })`}
                  className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-transform ${
                    isSelected ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center border-2 shadow-[0_4px_0_#09070f] ${
                      conquered
                        ? 'bg-[#173d2c] border-emerald-400 text-emerald-200'
                        : unlocked
                          ? isSelected
                            ? 'bg-[#4b2f16] border-amber-300 text-amber-200'
                            : 'bg-[#2a2042] border-amber-500/80 text-amber-200'
                          : 'bg-[#1a1824] border-stone-600 text-stone-500'
                    }`}
                  >
                    {conquered ? (
                      <Trophy className="h-5 w-5" />
                    ) : unlocked ? (
                      <Swords className="h-5 w-5" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>
                  <div
                    className={`mt-1 px-2 py-0.5 font-code text-[11px] font-bold whitespace-nowrap border ${
                      isSelected
                        ? 'bg-[#2b1f3b] border-amber-400 text-amber-100'
                        : 'bg-[#120e1c]/95 border-[#3f3554] text-stone-200'
                    }`}
                  >
                    C{castle.id} · {solvedCount}/{totalCount}
                  </div>
                  <div className="mt-0.5 font-code text-[10px] text-stone-300/90 hud-text-shadow whitespace-nowrap">
                    {castle.id === 1
                      ? 'Fundamentos'
                      : castle.id === 2
                        ? 'Ciclos'
                        : castle.id === 3
                          ? 'Estructuras'
                          : castle.id === 4
                            ? 'DOM'
                            : castle.id === 5
                              ? 'Async/API'
                              : 'Arquitectura'}
                  </div>
                </button>
              );
            })}

            {/* Tavern Waypoint on the Map */}
            <button
              type="button"
              onClick={() => {
                soundEngine.play('click');
                onOpenTavern();
              }}
              style={{ left: '24%', top: '86%' }}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pixel-btn flex items-center gap-1.5 bg-[#472915] border-amber-500 px-2.5 py-1 font-code text-xs text-amber-100 whitespace-nowrap"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Taberna del Camino</span>
            </button>
          </section>

          {/* Selected Castle Details & 4-Room Launcher */}
          <section className="pixel-panel-warm flex flex-col justify-between p-5 lg:col-span-5">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-code text-xs text-amber-300">
                    Castillo {selectedCastle.id} de 6 ·{' '}
                    {selectedCastle.mode === 'dom'
                      ? 'Espejo Arcano DOM'
                      : 'Consola Lógica'}
                  </div>
                  <h2 className="mt-1 font-display text-2xl font-bold text-amber-100">
                    {selectedCastle.name}
                  </h2>
                  <p className="text-lg text-amber-200/90">{selectedCastle.topic}</p>
                </div>
                {selectedCastle.rooms[3]?.boss && (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-[#59446e] bg-[#120d1c]">
                    <SpritePreview
                      kind="boss"
                      bossKey={selectedCastle.rooms[3].boss.spriteKey}
                      scale={3}
                    />
                  </div>
                )}
              </div>

              <p className="mt-3 text-lg leading-snug text-stone-300">
                {selectedCastle.description}
              </p>

              <div className="mt-3 border-t border-[#3b2f4d] pt-3 font-code text-xs text-stone-300">
                <span className="text-stone-400">Jefe del Castillo: </span>
                <span className="text-rose-300 font-semibold">
                  {selectedCastle.bossName}
                </span>
              </div>

              {/* 4 Playable Rooms List */}
              <div className="mt-4 space-y-2">
                <div className="font-code text-xs text-stone-400">
                  Salas del Castillo (4 fases 2D jugables)
                </div>
                {selectedCastle.rooms.map((room, idx) => {
                  const roomSolved = room.altars.every((a) =>
                    save.solvedAltars.includes(a.id)
                  );
                  const prevRoomSolved =
                    idx === 0 ||
                    selectedCastle.rooms[idx - 1].altars.every((a) =>
                      save.solvedAltars.includes(a.id)
                    );
                  const roomAccessible =
                    isSelectedUnlocked && (save.freeExploreMode || prevRoomSolved);

                  return (
                    <button
                      key={room.id}
                      type="button"
                      disabled={!roomAccessible}
                      onClick={() => enterRoom(selectedCastle.id, idx)}
                      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left border-2 transition-colors ${
                        roomAccessible
                          ? 'border-[#4a3e66] bg-[#181326] hover:border-amber-400 hover:bg-[#231b38]'
                          : 'border-[#292238] bg-[#120f1c] text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-code text-xs font-semibold text-stone-100">
                          {roomSolved ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                          ) : roomAccessible ? (
                            <Play className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                          ) : (
                            <Lock className="h-3.5 w-3.5 shrink-0 text-stone-500" />
                          )}
                          <span className="truncate">{room.name}</span>
                        </div>
                        <div className="mt-0.5 pl-6 text-sm text-stone-400 truncate">
                          {room.subtitle}
                        </div>
                      </div>
                      <span className="font-code text-[11px] text-amber-300 whitespace-nowrap">
                        {room.altars.filter((a) => save.solvedAltars.includes(a.id)).length}/
                        {room.altars.length} altares
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              {isSelectedUnlocked ? (
                <button
                  type="button"
                  onClick={() => enterRoom(selectedCastle.id, 0)}
                  className="pixel-btn w-full flex items-center justify-center gap-2 bg-[#d97706] border-amber-300 py-3 font-pixel text-xs text-[#180f04]"
                >
                  <Swords className="h-4 w-4" />
                  <span>Entrar al Castillo {selectedCastle.id}</span>
                </button>
              ) : (
                <div className="border-2 border-[#3b2f4d] bg-[#141020] p-3 text-center font-code text-xs text-stone-300">
                  Conquista el Castillo {selectedCastle.id - 1} para desbloquearlo, o activa{' '}
                  <button
                    type="button"
                    onClick={toggleFreeExplore}
                    className="underline text-amber-300 hover:text-amber-200"
                  >
                    Exploración Libre
                  </button>
                  .
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};
