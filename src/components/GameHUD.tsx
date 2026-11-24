import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Coins,
  Gamepad2,
  Map,
  Pause,
  Shield,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { getCastleById, getRoomByCastleAndIndex } from '../data/castlesCurriculum';
import { getHeroClass } from '../data/classesData';
import { useGameStore } from '../store/useGameStore';
import { SpritePreview } from './SpritePreview';

interface GameHUDProps {
  onOpenGrimoire: () => void;
  onTogglePause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  onOpenGrimoire,
  onTogglePause,
}) => {
  const {
    save,
    setScreen,
    useQuickItem,
    toggleMute,
    toggleTouchControls,
  } = useGameStore();

  const heroClass = getHeroClass(save.classId);
  const castle = getCastleById(save.currentCastleId);
  const room = getRoomByCastleAndIndex(save.currentCastleId, save.currentRoomIndex);
  const isMana = heroClass.resourceType === 'mana';

  // Delayed trailing ghost HP bar for tactile RPG feedback
  const [ghostHp, setGhostHp] = useState(save.hp);
  useEffect(() => {
    if (save.hp >= ghostHp) {
      setGhostHp(save.hp);
      return;
    }
    const timer = window.setTimeout(() => setGhostHp(save.hp), 320);
    return () => window.clearTimeout(timer);
  }, [save.hp, ghostHp]);

  const hpPct = Math.max(0, Math.min(100, (save.hp / Math.max(1, save.maxHp)) * 100));
  const ghostPct = Math.max(0, Math.min(100, (ghostHp / Math.max(1, save.maxHp)) * 100));
  const resPct = Math.max(
    0,
    Math.min(100, (save.resource / Math.max(1, save.maxResource)) * 100)
  );
  const xpPct = Math.max(0, Math.min(100, (save.xp / Math.max(1, save.xpToNext)) * 100));

  const solvedInRoom = room.altars.filter((a) => save.solvedAltars.includes(a.id)).length;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3">
      {/* Top-Left Cluster: Hero Portrait, HP, Resource & Gold */}
      <div className="pointer-events-auto flex items-center gap-3 border-2 border-[#594b78] bg-[#141020]/95 px-3 py-2 shadow-[0_4px_0_#09070f]">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center border-2 border-[#463a61] bg-[#0e0b16]">
          <SpritePreview kind="hero" heroClass={save.classId} scale={2} />
          <span className="absolute -bottom-1 -right-1 bg-[#251d3a] border border-amber-400 px-1 font-code text-[10px] font-bold text-amber-200 tabular-nums">
            Nv.{save.level}
          </span>
        </div>

        <div className="w-44 space-y-1.5">
          {/* HP Bar with trailing damage ghost bar */}
          <div>
            <div className="flex justify-between font-code text-[11px] tabular-nums leading-none mb-0.5">
              <span className="font-bold text-rose-300">HP</span>
              <span className="text-stone-100">
                {Math.round(save.hp)}/{Math.round(save.maxHp)}
              </span>
            </div>
            <div className="relative h-3 w-full border border-[#3c202a] bg-[#241017] overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-amber-300/80 transition-all duration-300"
                style={{ width: `${ghostPct}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 bg-[#dc2626] transition-all duration-150"
                style={{ width: `${hpPct}%` }}
              />
            </div>
          </div>

          {/* Mana (Blue) or Energy (Amber) Bar */}
          <div>
            <div className="flex justify-between font-code text-[11px] tabular-nums leading-none mb-0.5">
              <span className={`font-bold ${isMana ? 'text-sky-300' : 'text-amber-300'}`}>
                {heroClass.resourceLabel.toUpperCase()}
              </span>
              <span className="text-stone-100">
                {Math.round(save.resource)}/{Math.round(save.maxResource)}
              </span>
            </div>
            <div className="relative h-2.5 w-full border border-[#24304a] bg-[#101626] overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-150 ${
                  isMana ? 'bg-[#2563eb]' : 'bg-[#d97706]'
                }`}
                style={{ width: `${resPct}%` }}
              />
            </div>
          </div>

          {/* XP & Gold micro row */}
          <div className="flex items-center justify-between gap-2 pt-0.5 font-code text-[11px] tabular-nums">
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-violet-300">XP</span>
              <div className="h-1.5 flex-1 bg-[#221a36]">
                <div className="h-full bg-violet-400" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
            <span className="flex items-center gap-1 text-amber-300 font-semibold">
              <Coins className="h-3 w-3" />
              {save.gold}
            </span>
            {save.syntaxShieldActive && (
              <span
                title="Amuleto de Sintaxis activo (50% menos daño por error de código)"
                className="flex items-center gap-0.5 text-cyan-300"
              >
                <Shield className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Top-Center Compact Location & Objective */}
      <div className="hidden md:flex flex-col items-center border-2 border-[#463a61] bg-[#141020]/90 px-4 py-1.5 text-center shadow-[0_4px_0_#09070f]">
        <div className="font-code text-xs font-bold text-amber-200 whitespace-nowrap">
          Castillo {castle.id}: {castle.name} · Sala {save.currentRoomIndex + 1}/4
        </div>
        <div className="font-code text-[11px] text-stone-300 tabular-nums">
          {room.boss ? `Jefe: ${room.boss.name}` : room.subtitle} · Altares {solvedInRoom}/
          {room.altars.length}
        </div>
      </div>

      {/* Top-Right Cluster: Quick Potions (1/2/3), Grimoire (G), Map, Mute, Pause */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5">
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            useQuickItem('dragon_potion');
          }}
          title="Poción de Sangre de Dragón (+50 HP) [Tecla 1]"
          aria-label={`Usar Poción HP, disponibles ${save.inventory.dragon_potion}`}
          className="pixel-btn flex items-center gap-1.5 bg-[#2a151c] border-rose-500/70 px-2.5 py-1.5 font-code text-xs text-rose-200 tabular-nums whitespace-nowrap"
        >
          <span className="text-[10px] text-stone-400">[1]</span>
          <span>HP</span>
          <span className="font-bold text-white">x{save.inventory.dragon_potion}</span>
        </button>

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            useQuickItem('ether_elixir');
          }}
          title={`Restaurar +50 ${heroClass.resourceLabel} [Tecla 2]`}
          aria-label={`Usar Elixir de ${heroClass.resourceLabel}, disponibles ${save.inventory.ether_elixir}`}
          className={`pixel-btn flex items-center gap-1.5 px-2.5 py-1.5 font-code text-xs tabular-nums whitespace-nowrap ${
            isMana
              ? 'bg-[#142038] border-sky-500/70 text-sky-200'
              : 'bg-[#332210] border-amber-500/70 text-amber-200'
          }`}
        >
          <span className="text-[10px] text-stone-400">[2]</span>
          <span>{isMana ? 'MP' : 'EP'}</span>
          <span className="font-bold text-white">x{save.inventory.ether_elixir}</span>
        </button>

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            useQuickItem('syntax_amulet');
          }}
          title="Activar Amuleto de Sintaxis (reduce daño de código 50%) [Tecla 3]"
          aria-label={`Activar Amuleto de Sintaxis, disponibles ${save.inventory.syntax_amulet}`}
          className="pixel-btn flex items-center gap-1.5 bg-[#142a30] border-cyan-500/70 px-2.5 py-1.5 font-code text-xs text-cyan-200 tabular-nums whitespace-nowrap"
        >
          <span className="text-[10px] text-stone-400">[3]</span>
          <Shield className="h-3.5 w-3.5" />
          <span className="font-bold text-white">x{save.inventory.syntax_amulet}</span>
        </button>

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            onOpenGrimoire();
          }}
          title="Abrir Grimorio del Desarrollador [G]"
          aria-label="Abrir Grimorio"
          className="pixel-btn flex items-center gap-1.5 bg-[#231b3d] border-violet-400/70 px-2.5 py-1.5 font-code text-xs text-violet-100 whitespace-nowrap"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Grimorio [G]</span>
        </button>

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            setScreen('world_map');
          }}
          title="Volver al Mapa del Reino"
          aria-label="Mapa del Reino"
          className="pixel-btn flex h-8 w-8 items-center justify-center bg-[#1c162b] text-amber-200"
        >
          <Map className="h-4 w-4" />
        </button>

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            toggleTouchControls();
          }}
          title="Mostrar/ocultar controles en pantalla"
          aria-label="Controles en pantalla"
          className={`pixel-btn flex h-8 w-8 items-center justify-center ${
            save.showTouchControls
              ? 'bg-[#2a3b2e] border-emerald-400 text-emerald-200'
              : 'bg-[#1c162b] text-stone-300'
          }`}
        >
          <Gamepad2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            toggleMute();
          }}
          title="Silenciar audio [M]"
          aria-label={save.muted ? 'Activar audio' : 'Silenciar audio'}
          className="pixel-btn flex h-8 w-8 items-center justify-center bg-[#1c162b] text-stone-200"
        >
          {save.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            onTogglePause();
          }}
          title="Pausar juego [Esc / P]"
          aria-label="Pausar"
          className="pixel-btn flex h-8 w-8 items-center justify-center bg-[#1c162b] text-stone-200"
        >
          <Pause className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
