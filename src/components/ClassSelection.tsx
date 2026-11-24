import React, { useState } from 'react';
import { ArrowLeft, Shield, Sparkles, Star, Zap } from 'lucide-react';
import { soundEngine } from '../assets/soundEngine';
import { HERO_CLASSES } from '../data/classesData';
import { useGameStore } from '../store/useGameStore';
import { HeroClassId } from '../types/game';
import { SpritePreview } from './SpritePreview';

export const ClassSelection: React.FC = () => {
  const { setScreen, startNewHero } = useGameStore();
  const [selectedId, setSelectedId] = useState<HeroClassId>('mage');
  const [heroName, setHeroName] = useState('Lyra');
  const [freeExplore, setFreeExplore] = useState(false);

  const activeClass = HERO_CLASSES.find((c) => c.id === selectedId) ?? HERO_CLASSES[0];

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    startNewHero(heroName.trim() || 'Lyra', selectedId, freeExplore);
  };

  return (
    <main className="min-h-full w-full overflow-y-auto bg-[#0f0c18] px-6 py-6 text-stone-100">
      <div className="mx-auto max-w-6xl">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#342b4a] pb-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                soundEngine.play('click');
                setScreen('title');
              }}
              className="pixel-btn flex items-center gap-2 bg-[#1c162b] px-3 py-2 text-sm font-code text-stone-200 whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </button>
            <div>
              <h1 className="font-display text-2xl font-bold text-amber-100 sm:text-3xl">
                Forja de Héroes — Elige tu Clase
              </h1>
              <p className="text-lg text-stone-400">
                Cada clase altera tus estadísticas 2D, tu recurso (Maná o Energía) y los retos de código en cada altar.
              </p>
            </div>
          </div>
        </div>

        {/* 6 Class Cards Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {HERO_CLASSES.map((cls) => {
            const isSelected = cls.id === selectedId;
            const isMana = cls.resourceType === 'mana';
            return (
              <button
                key={cls.id}
                type="button"
                onClick={() => {
                  soundEngine.play('click');
                  setSelectedId(cls.id);
                }}
                aria-pressed={isSelected}
                className={`text-left p-4 transition-transform ${
                  isSelected
                    ? 'pixel-panel-warm -translate-y-0.5 ring-2 ring-amber-400'
                    : 'pixel-panel hover:border-[#6a5b8a]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center border-2 border-[#3d3354] bg-[#110e1c]">
                    <SpritePreview
                      kind="hero"
                      heroClass={cls.id}
                      scale={4}
                      animate={isSelected}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-display text-xl font-bold text-amber-100 truncate">
                        {cls.name}
                      </h2>
                      <span
                        className={`text-xs font-code font-semibold whitespace-nowrap ${
                          isMana ? 'text-sky-300' : 'text-amber-300'
                        }`}
                      >
                        {isMana ? 'Maná' : 'Energía'}
                      </span>
                    </div>
                    <p className="text-base text-stone-400">{cls.title}</p>

                    {/* Difficulty Stars */}
                    <div className="mt-1.5 flex items-center gap-1 text-xs font-code text-amber-300">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < cls.difficulty
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-600'
                          }`}
                        />
                      ))}
                      <span className="ml-1.5 text-stone-300">{cls.difficultyLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Compact Numeric Stats */}
                <div className="mt-3 grid grid-cols-3 gap-2 border-y border-[#2d2540] py-2 text-center font-code text-xs tabular-nums">
                  <div>
                    <div className="text-stone-400">HP</div>
                    <div className="font-bold text-rose-400">{cls.baseHp}</div>
                  </div>
                  <div>
                    <div className="text-stone-400">{cls.resourceLabel}</div>
                    <div className={`font-bold ${isMana ? 'text-sky-400' : 'text-amber-400'}`}>
                      {cls.baseResource}
                    </div>
                  </div>
                  <div>
                    <div className="text-stone-400">Movilidad</div>
                    <div className="font-bold text-emerald-300">
                      {cls.canDash
                        ? 'Dash'
                        : cls.canDoubleJump
                          ? '2x Salto'
                          : cls.moveSpeed >= 260
                            ? 'Rápida'
                            : 'Firme'}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-sm font-code font-semibold text-amber-200">
                    {cls.specialtyTitle}
                  </div>
                  <p className="mt-1 text-base leading-snug text-stone-300">
                    {cls.specialtySummary}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Hero Confirmation Bar */}
        <form
          onSubmit={handleConfirm}
          className="mt-6 pixel-panel-warm p-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end flex-1">
            <div className="flex-1 max-w-xs">
              <label
                htmlFor="hero-name-input"
                className="block font-code text-xs text-amber-200 mb-1.5"
              >
                Nombre del Héroe
              </label>
              <input
                id="hero-name-input"
                type="text"
                maxLength={20}
                required
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                placeholder="Ej. Lyra, Kael..."
                className="w-full border-2 border-[#594b78] bg-[#110e1c] px-3 py-2 font-code text-sm text-stone-100"
              />
            </div>

            <div className="flex-1 text-base text-stone-300">
              <div className="flex items-center gap-2 font-code text-xs text-amber-300 mb-1">
                {activeClass.resourceType === 'mana' ? (
                  <Sparkles className="h-4 w-4 text-sky-400" />
                ) : (
                  <Zap className="h-4 w-4 text-amber-400" />
                )}
                <span>Efecto en Altares ({activeClass.name})</span>
              </div>
              <p className="leading-snug">{activeClass.adaptationNote}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer font-code text-xs text-stone-300">
              <input
                type="checkbox"
                checked={freeExplore}
                onChange={(e) => setFreeExplore(e.target.checked)}
                className="h-4 w-4 accent-amber-500"
              />
              <span>Desbloquear los 6 castillos (Exploración libre)</span>
            </label>

            <button
              type="submit"
              className="pixel-btn flex items-center gap-2 bg-[#d97706] border-amber-300 px-6 py-3 font-pixel text-xs text-[#170e04] whitespace-nowrap"
            >
              <Shield className="h-4 w-4" />
              <span>Comenzar Aventura</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
