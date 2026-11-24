import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { getHeroSprite, getPropSprite } from '../assets/pixelSprites';
import { soundEngine } from '../assets/soundEngine';
import { useGameStore } from '../store/useGameStore';
import { HeroClassId } from '../types/game';

export const TitleScreen: React.FC = () => {
  const {
    hasExistingSave,
    save,
    setScreen,
    continueAdventure,
    enterPracticeMode,
    toggleMute,
  } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [musicOn, setMusicOn] = useState(soundEngine.isMusicPlaying());

  const handleStartNew = () => {
    soundEngine.play('openAltar');
    setScreen('class_select');
  };

  // Support Enter / Space on Title Screen to trigger primary start CTA
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'BUTTON' || tag === 'INPUT') return;
        e.preventDefault();
        if (hasExistingSave) {
          continueAdventure();
        } else {
          handleStartNew();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasExistingSave, continueAdventure]);

  // Live animated pixel-art parallax world stage behind the title
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const embers = Array.from({ length: 34 }, (_, i) => ({
      x: (i * 97) % 1600,
      y: 200 + ((i * 53) % 500),
      vy: 14 + (i % 5) * 7,
      drift: (i % 3) - 1,
      size: i % 4 === 0 ? 4 : 3,
    }));

    const heroes: HeroClassId[] = ['mage', 'warrior', 'archer', 'bard', 'paladin', 'rogue'];
    let t = 0;
    let last = performance.now();
    let raf = 0;

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;

      const W = canvas.width;
      const H = canvas.height;
      ctx.imageSmoothingEnabled = false;

      // Deep night sky gradient with calm upper-middle negative space
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#090712');
      grad.addColorStop(0.55, '#151026');
      grad.addColorStop(1, '#241838');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Pixel moon in upper right
      const moonX = Math.floor(W * 0.82);
      const moonY = Math.floor(H * 0.17);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(moonX - 24, moonY - 24, 48, 48);
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(moonX - 18, moonY - 18, 36, 36);
      ctx.fillStyle = '#151026';
      ctx.fillRect(moonX + 4, moonY - 14, 16, 22);

      // Twinkling pixel stars
      for (let i = 0; i < 60; i++) {
        const sx = ((i * 197 + t * 4) % W + W) % W;
        const sy = (i * 71) % Math.floor(H * 0.52);
        const bright = Math.sin(t * 2.2 + i) > 0.2;
        ctx.fillStyle = bright ? 'rgba(255,244,214,0.8)' : 'rgba(180,170,220,0.35)';
        ctx.fillRect(Math.floor(sx), Math.floor(sy), bright ? 3 : 2, bright ? 3 : 2);
      }

      // Distant 6 castle silhouettes slowly panning
      const horizonY = Math.floor(H * 0.78);
      ctx.fillStyle = '#1b142c';
      for (let i = -1; i < Math.ceil(W / 260) + 2; i++) {
        const cx = Math.floor(i * 260 - ((t * 14) % 260));
        ctx.fillRect(cx + 30, horizonY - 110, 72, 110);
        ctx.fillRect(cx + 42, horizonY - 155, 22, 45);
        ctx.fillRect(cx + 72, horizonY - 138, 18, 28);
        ctx.fillRect(cx + 140, horizonY - 82, 85, 82);
        ctx.fillRect(cx + 165, horizonY - 115, 32, 33);
        // Tiny warm castle windows
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx + 50, horizonY - 135, 5, 8);
        ctx.fillRect(cx + 178, horizonY - 98, 5, 8);
        ctx.fillStyle = '#1b142c';
      }

      // Foreground stone parapet
      ctx.fillStyle = '#261e38';
      ctx.fillRect(0, horizonY, W, H - horizonY);
      ctx.fillStyle = '#4c3f6b';
      ctx.fillRect(0, horizonY, W, 10);
      // Battlement crenellations
      for (let x = 0; x < W; x += 64) {
        ctx.fillStyle = '#33294a';
        ctx.fillRect(x, horizonY - 14, 34, 14);
        ctx.fillStyle = '#5a4b7d';
        ctx.fillRect(x, horizonY - 14, 34, 4);
      }

      // Animated bonfire centerpiece on the parapet
      const centerX = Math.floor(W / 2);
      const bfSpr = getPropSprite(Math.floor(t * 5) % 2 === 0 ? 'bonfire1' : 'bonfire2', 4);
      ctx.drawImage(bfSpr, centerX - 32, horizonY - 56);

      // Idling party of heroes flanking the bonfire
      const frame = Math.floor(t * 2.4) % 2 === 0 ? 'idle1' : 'idle2';
      const spacing = Math.min(92, Math.max(54, Math.floor(W / 12)));
      heroes.forEach((cls, idx) => {
        const side = idx < 3 ? -1 : 1;
        const slot = idx < 3 ? 3 - idx : idx - 2;
        const hx = centerX + side * (slot * spacing + 28) - 24;
        const hy = horizonY - 58;
        const spr = getHeroSprite(cls, frame, 3, side > 0);
        ctx.drawImage(spr, Math.floor(hx), hy);
      });

      // Rising warm embers
      for (const e of embers) {
        e.y -= e.vy * dt;
        e.x += Math.sin(t * 2 + e.y * 0.02) * 14 * dt + e.drift * 4 * dt;
        if (e.y < 80) {
          e.y = horizonY - 10;
          e.x = Math.random() * W;
        }
        ctx.fillStyle = e.y % 2 === 0 ? '#fb923c' : '#fde047';
        ctx.fillRect(Math.floor(e.x), Math.floor(e.y), e.size, e.size);
      }
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleToggleMusic = () => {
    const active = soundEngine.toggleMusic();
    setMusicOn(active);
  };

  return (
    <main className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-6 py-8">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full pixelated"
      />

      {/* Top-right compact audio controls */}
      <div className="relative z-10 flex w-full max-w-6xl items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleToggleMusic}
          aria-label={musicOn ? 'Detener música chiptune' : 'Activar música chiptune'}
          className="pixel-btn flex items-center gap-2 bg-[#1c162b] px-3 py-2 text-xs font-code text-amber-200 whitespace-nowrap"
        >
          <Music className="h-4 w-4" />
          <span>{musicOn ? 'Música: ON' : 'Música: OFF'}</span>
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={save.muted ? 'Activar sonido' : 'Silenciar sonido'}
          className="pixel-btn flex h-9 w-9 items-center justify-center bg-[#1c162b] text-stone-200"
        >
          {save.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Center Negative-Space Hero Title Lockup + CTAs */}
      <div className="relative z-10 flex max-w-2xl flex-col items-center text-center -mt-12">
        {/* Bespoke inline SVG Medieval Pixel/Crest Emblem */}
        <svg
          viewBox="0 0 640 175"
          className="mb-3 w-full max-w-[580px] drop-shadow-[0_6px_0_rgba(8,6,14,0.92)]"
          role="img"
          aria-label="Code and Dragons: Crónicas del Frontend"
        >
          {/* Decorative medieval shield crest behind emblem */}
          <path
            d="M320 8 L354 22 L348 56 L320 72 L292 56 L286 22 Z"
            fill="#271c3d"
            stroke="#eab308"
            strokeWidth="3"
          />
          {/* Code brackets inside shield */}
          <path
            d="M308 32 L298 40 L308 48 M332 32 L342 40 L332 48 M323 28 L317 52"
            stroke="#fde047"
            strokeWidth="3"
            strokeLinecap="square"
            fill="none"
          />
          {/* Flank pixel-style divider blades */}
          <rect x="64" y="42" width="196" height="4" fill="#926b32" />
          <rect x="380" y="42" width="196" height="4" fill="#926b32" />
          <rect x="52" y="38" width="10" height="12" fill="#eab308" />
          <rect x="578" y="38" width="10" height="12" fill="#eab308" />

          {/* Main Title */}
          <text
            x="320"
            y="118"
            textAnchor="middle"
            fill="#fef3c7"
            stroke="#160f24"
            strokeWidth="8"
            paintOrder="stroke fill"
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              fontWeight: 800,
              fontSize: '48px',
              letterSpacing: '0.06em',
            }}
          >
            CODE &amp; DRAGONS
          </text>
          {/* Subtitle */}
          <text
            x="320"
            y="154"
            textAnchor="middle"
            fill="#f5b942"
            stroke="#120c1d"
            strokeWidth="5"
            paintOrder="stroke fill"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '14px',
              letterSpacing: '0.08em',
            }}
          >
            CRÓNICAS DEL FRONTEND
          </text>
        </svg>

        <p className="mb-7 max-w-lg text-xl leading-snug text-stone-300 hud-text-shadow">
          Domina JavaScript moderno, el DOM, Asincronía y Arquitectura Frontend conquistando 6 castillos en acción 2D y código en vivo.
        </p>

        {/* <= 3 Primary Menu Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {hasExistingSave ? (
            <>
              <button
                type="button"
                data-start="true"
                onClick={continueAdventure}
                className="pixel-btn bg-[#d97706] border-amber-300 px-6 py-3 font-pixel text-xs text-[#180f04] whitespace-nowrap"
              >
                Continuar Partida ({save.heroName} · Nv.{save.level})
              </button>
              <button
                type="button"
                onClick={handleStartNew}
                className="pixel-btn bg-[#241c38] px-5 py-3 font-pixel text-xs text-stone-100 whitespace-nowrap"
              >
                Nueva Aventura
              </button>
            </>
          ) : (
            <button
              type="button"
              data-start="true"
              onClick={handleStartNew}
              className="pixel-btn bg-[#d97706] border-amber-300 px-7 py-3.5 font-pixel text-xs text-[#180f04] whitespace-nowrap"
            >
              Nueva Aventura
            </button>
          )}
          <button
            type="button"
            onClick={enterPracticeMode}
            className="pixel-btn bg-[#1c2b3a] border-sky-400/60 px-5 py-3 font-pixel text-xs text-sky-100 whitespace-nowrap"
          >
            Selector de Castillos
          </button>
        </div>
      </div>

      {/* Single flat, borderless bottom control hint */}
      <footer className="relative z-10 text-center text-sm font-code text-stone-300/90 hud-text-shadow">
        WASD / Flechas Mover · Espacio Saltar · E Interactuar con Altar · G Grimorio · Esc Pausa
      </footer>
    </main>
  );
};
