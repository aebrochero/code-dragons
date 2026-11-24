import React from 'react';
import { Coins, Store, X } from 'lucide-react';
import { getHeroClass } from '../data/classesData';
import { SHOP_ITEMS } from '../data/shopItems';
import { useGameStore } from '../store/useGameStore';
import { SpritePreview } from './SpritePreview';

interface TavernModalProps {
  onClose: () => void;
}

export const TavernModal: React.FC<TavernModalProps> = ({ onClose }) => {
  const { save, buyShopItem } = useGameStore();
  const heroClass = getHeroClass(save.classId);
  const isEnergy = heroClass.resourceType === 'energy';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="La Taberna del Camino"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <div className="pixel-panel-warm flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#59422b] bg-[#24160e] px-5 py-4">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-amber-400" />
            <div>
              <h2 className="font-display text-2xl font-bold text-amber-100">
                La Taberna del Camino
              </h2>
              <p className="text-base text-amber-200/80">
                Abastécete de pociones, pergaminos del Oráculo y amuletos de sintaxis.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 border border-amber-500/60 bg-[#140c08] px-3 py-1.5 font-code text-sm font-bold text-amber-300 tabular-nums">
              <Coins className="h-4 w-4" />
              <span>{save.gold} Oro</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar Taberna"
              className="pixel-btn flex h-9 w-9 items-center justify-center bg-[#332015] text-stone-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Shop Items */}
        <div className="grid grid-cols-1 gap-4 overflow-y-auto p-5 sm:grid-cols-2">
          {SHOP_ITEMS.map((item) => {
            const displayName =
              isEnergy && item.altNameEnergy ? item.altNameEnergy : item.name;
            const displayDesc =
              isEnergy && item.altDescriptionEnergy
                ? item.altDescriptionEnergy
                : item.description;
            const owned = save.inventory[item.id] ?? 0;
            const canAfford = save.gold >= item.price;

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between border-2 border-[#4d3927] bg-[#1b120d] p-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-[#5c4430] bg-[#120b08]">
                    <SpritePreview kind="prop" propKey={item.id} scale={3} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-amber-100">
                      {displayName}
                    </h3>
                    <div className="font-code text-xs text-stone-400 tabular-nums">
                      En mochila: <span className="text-amber-300 font-bold">{owned}</span>
                      {item.quickKey && ` · Acceso rápido [${item.quickKey}]`}
                    </div>
                    <p className="mt-2 text-base leading-snug text-stone-300">
                      {displayDesc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#38291d] pt-3">
                  <span className="flex items-center gap-1 font-code text-sm font-bold text-amber-300 tabular-nums">
                    <Coins className="h-4 w-4" />
                    {item.price} Oro
                  </span>
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => buyShopItem(item.id)}
                    className="pixel-btn bg-[#b45309] border-amber-300 px-4 py-1.5 font-code text-xs font-bold text-amber-50 disabled:opacity-40 whitespace-nowrap"
                  >
                    Comprar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
