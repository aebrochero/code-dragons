import React, { useEffect, useRef } from 'react';
import {
  BossSpriteKey,
  getBossSprite,
  getHeroSprite,
  getPropSprite,
  HeroFrame,
  PropSpriteKey,
} from '../assets/pixelSprites';
import { HeroClassId } from '../types/game';

interface SpritePreviewProps {
  kind: 'hero' | 'prop' | 'boss';
  heroClass?: HeroClassId;
  propKey?: PropSpriteKey;
  bossKey?: BossSpriteKey;
  scale?: number;
  animate?: boolean;
  className?: string;
}

/**
 * Renders procedural pixel art sprites crisply inside UI cards, HUD, Tavern, and Class Selection.
 */
export const SpritePreview: React.FC<SpritePreviewProps> = ({
  kind,
  heroClass = 'mage',
  propKey = 'dragon_potion',
  bossKey = 'boss_ignis',
  scale = 4,
  animate = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseSize = kind === 'boss' ? 20 : 16;
    canvas.width = baseSize * scale;
    canvas.height = baseSize * scale;

    let frameIdx = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;
      if (kind === 'hero') {
        const frames: HeroFrame[] = animate
          ? ['idle1', 'idle2', 'walk1', 'walk2']
          : ['idle1'];
        const spr = getHeroSprite(heroClass, frames[frameIdx % frames.length], scale);
        ctx.drawImage(spr, 0, 0);
      } else if (kind === 'prop') {
        const key: PropSpriteKey =
          animate && propKey === 'bonfire1'
            ? frameIdx % 2 === 0
              ? 'bonfire1'
              : 'bonfire2'
            : propKey;
        const spr = getPropSprite(key, scale);
        ctx.drawImage(spr, 0, 0);
      } else {
        const spr = getBossSprite(bossKey, scale);
        ctx.drawImage(spr, 0, 0);
      }
    };

    draw();
    if (!animate) return;
    const id = window.setInterval(() => {
      frameIdx++;
      draw();
    }, 360);
    return () => window.clearInterval(id);
  }, [kind, heroClass, propKey, bossKey, scale, animate]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pixelated block shrink-0 ${className}`}
    />
  );
};
