import React, { useMemo, useState } from 'react';
import { BookOpen, Lock, Search, Sparkles, X } from 'lucide-react';
import { CASTLES } from '../data/castlesCurriculum';
import { getHeroClass } from '../data/classesData';
import { GRIMOIRE_PAGES } from '../data/grimoireData';
import { useGameStore } from '../store/useGameStore';

interface GrimoireModalProps {
  onClose: () => void;
}

export const GrimoireModal: React.FC<GrimoireModalProps> = ({ onClose }) => {
  const { save } = useGameStore();
  const [selectedCastle, setSelectedCastle] = useState<number>(save.currentCastleId);
  const [query, setQuery] = useState('');
  const heroClass = getHeroClass(save.classId);

  const visiblePages = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GRIMOIRE_PAGES.filter((page) => {
      if (q) {
        return (
          page.title.toLowerCase().includes(q) ||
          page.summary.toLowerCase().includes(q) ||
          page.syntaxCode.toLowerCase().includes(q)
        );
      }
      return page.castleId === selectedCastle;
    });
  }, [query, selectedCastle]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="El Grimorio del Desarrollador"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <div className="pixel-panel flex h-[86vh] w-full max-w-5xl flex-col overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#463866] bg-[#19132a] px-5 py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-violet-300" />
            <div>
              <h2 className="font-display text-2xl font-bold text-amber-100">
                El Grimorio del Desarrollador
              </h2>
              <p className="text-base text-stone-300">
                Compendio interactivo de JavaScript y Frontend · Consejos adaptados para{' '}
                <strong className="text-amber-300">{heroClass.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="search"
                aria-label="Buscar en el Grimorio"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar tema (fetch, map, DOM...)"
                className="border-2 border-[#4d3f6e] bg-[#100c1c] py-1.5 pl-8 pr-3 font-code text-xs text-stone-100 w-60"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar Grimorio"
              className="pixel-btn flex h-9 w-9 items-center justify-center bg-[#261e3d] text-stone-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Castle Tabs */}
        {!query.trim() && (
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[#342a4d] bg-[#130f20] px-4 py-2.5">
            {CASTLES.map((c) => {
              const active = c.id === selectedCastle;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCastle(c.id)}
                  className={`px-3 py-1.5 font-code text-xs whitespace-nowrap border transition-colors ${
                    active
                      ? 'bg-[#2a2042] border-amber-400 text-amber-100 font-bold'
                      : 'border-transparent text-stone-400 hover:text-stone-100'
                  }`}
                >
                  C{c.id}: {c.shortTopic}
                </button>
              );
            })}
          </div>
        )}

        {/* Pages List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {visiblePages.length === 0 ? (
            <div className="py-12 text-center font-code text-sm text-stone-400">
              No se encontraron páginas del Grimorio para "{query}".
            </div>
          ) : (
            visiblePages.map((page) => {
              const unlocked =
                save.freeExploreMode || save.unlockedGrimoire.includes(page.id);
              return (
                <article
                  key={page.id}
                  className={`border-2 p-4 ${
                    unlocked
                      ? 'border-[#433661] bg-[#181326]'
                      : 'border-[#2b243d] bg-[#120e1c] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-xl font-bold text-amber-100">
                      Castillo {page.castleId} · Sala {page.roomIndex + 1} — {page.title}
                    </h3>
                    {!unlocked && (
                      <span className="flex items-center gap-1 font-code text-xs text-stone-400 whitespace-nowrap">
                        <Lock className="h-3.5 w-3.5" />
                        Entra a la sala para desbloquear
                      </span>
                    )}
                  </div>

                  {unlocked && (
                    <div className="mt-3 space-y-3">
                      <p className="text-lg leading-snug text-stone-200">{page.summary}</p>

                      <pre className="overflow-x-auto border border-[#342a4d] bg-[#0b0812] p-3 font-code text-xs leading-relaxed text-emerald-200">
                        {page.syntaxCode}
                      </pre>

                      <ul className="space-y-1 font-code text-xs text-stone-300">
                        {page.keyPoints.map((kp, i) => (
                          <li key={i}>• {kp}</li>
                        ))}
                      </ul>

                      <div className="flex items-start gap-2 border border-amber-500/40 bg-[#231910] p-3 font-code text-xs text-amber-200">
                        <Sparkles className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                        <span>
                          <strong>Buena práctica ({heroClass.name}):</strong>{' '}
                          {page.classTips[save.classId]}
                        </span>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
