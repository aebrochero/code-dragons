import React from 'react';
import { Award, Crown, Map, Swords, Trophy } from 'lucide-react';
import { getCastleById } from '../data/castlesCurriculum';
import { getHeroClass } from '../data/classesData';
import { useGameStore } from '../store/useGameStore';
import { SpritePreview } from './SpritePreview';

interface CastleVictoryModalProps {
  castleId: number;
  onContinueNextCastle: () => void;
  onReturnMap: () => void;
}

export const CastleVictoryModal: React.FC<CastleVictoryModalProps> = ({
  castleId,
  onContinueNextCastle,
  onReturnMap,
}) => {
  const { save } = useGameStore();
  const castle = getCastleById(castleId);
  const heroClass = getHeroClass(save.classId);
  const isFinalGraduation = castleId === 6;
  const accuracy =
    save.totalAttempts > 0
      ? Math.round((save.totalSuccesses / save.totalAttempts) * 100)
      : 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        isFinalGraduation
          ? 'Certificado de Graduación Frontend'
          : `Castillo ${castleId} Conquistado`
      }
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
    >
      <div className="pixel-panel-warm w-full max-w-2xl p-6 text-center text-stone-100">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center border-2 border-amber-400 bg-[#2e2010] text-amber-300">
          {isFinalGraduation ? (
            <Crown className="h-9 w-9" />
          ) : (
            <Trophy className="h-9 w-9" />
          )}
        </div>

        <div className="font-pixel text-xs text-amber-300">
          {isFinalGraduation
            ? 'GRADUACIÓN DE ARQUITECTO FRONTEND'
            : `CASTILLO ${castleId} CONQUISTADO`}
        </div>

        <h2 className="mt-2 font-display text-3xl font-bold text-amber-100">
          {isFinalGraduation
            ? `¡Honor Eterno, ${save.heroName}!`
            : `¡${castle.bossName} ha caído!`}
        </h2>

        <p className="mt-2 text-lg text-stone-300">
          {isFinalGraduation
            ? 'Has superado los 6 Castillos de Code & Dragons, dominando JavaScript moderno, DOM, Asincronía y Arquitectura Frontend.'
            : `Has conquistado ${castle.name} y dominado ${castle.topic}.`}
        </p>

        {/* Mastery Metrics */}
        <div className="my-5 grid grid-cols-3 gap-3 border-y border-[#4a3925] py-4 font-code tabular-nums">
          <div>
            <div className="text-xs text-stone-400">Nivel</div>
            <div className="text-xl font-bold text-amber-300">{save.level}</div>
          </div>
          <div>
            <div className="text-xs text-stone-400">Castillos</div>
            <div className="text-xl font-bold text-emerald-300">
              {save.conqueredCastles.length}/6
            </div>
          </div>
          <div>
            <div className="text-xs text-stone-400">Precisión</div>
            <div className="text-xl font-bold text-sky-300">{accuracy}%</div>
          </div>
        </div>

        {/* Final Graduation Certificate Plaque */}
        {isFinalGraduation && (
          <div className="mb-5 border-2 border-amber-400/80 bg-[#140e1f] p-4 text-left">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-amber-400 bg-[#0d0914]">
                <SpritePreview kind="hero" heroClass={save.classId} scale={3} animate />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-code text-xs text-amber-300">
                  <Award className="h-4 w-4" />
                  <span>CERTIFICADO DEL REINO DEL FRONTEND</span>
                </div>
                <div className="font-display text-xl font-bold text-amber-100">
                  {save.heroName} — {heroClass.name} ({heroClass.title})
                </div>
                <div className="font-code text-xs text-stone-400">
                  Especialidad: {heroClass.specialtyTitle} · Altares resueltos:{' '}
                  {save.solvedAltars.length}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {!isFinalGraduation && (
            <button
              type="button"
              data-start="true"
              onClick={onContinueNextCastle}
              className="pixel-btn flex items-center gap-2 bg-[#d97706] border-amber-300 px-5 py-3 font-pixel text-xs text-[#190f04] whitespace-nowrap"
            >
              <Swords className="h-4 w-4" />
              <span>Ir al Castillo {castleId + 1}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onReturnMap}
            className="pixel-btn flex items-center gap-2 bg-[#231b38] px-5 py-3 font-pixel text-xs text-stone-100 whitespace-nowrap"
          >
            <Map className="h-4 w-4" />
            <span>Mapa del Reino</span>
          </button>
        </div>
      </div>
    </div>
  );
};
