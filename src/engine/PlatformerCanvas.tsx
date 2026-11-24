import React, { useEffect, useRef, useState } from 'react';
import {
  getBossSprite,
  getEnemySprite,
  getHeroSprite,
  getPropSprite,
  HeroFrame,
} from '../assets/pixelSprites';
import { soundEngine } from '../assets/soundEngine';
import { getHeroClass } from '../data/classesData';
import { rectsOverlap } from './gameRules';
import {
  AltarPlacement,
  CastleTheme,
  HeroClassId,
  RoomDef,
} from '../types/game';

interface PlatformerCanvasProps {
  room: RoomDef;
  theme: CastleTheme;
  classId: HeroClassId;
  solvedAltars: string[];
  openedChests: string[];
  isPaused: boolean;
  hp: number;
  showTouchControls: boolean;
  onOpenAltar: (altar: AltarPlacement) => void;
  onRestBonfire: () => void;
  onOpenChest: (chestId: string, gold: number, xp: number) => void;
  onTakeDamage: (amount: number, reason: string) => void;
  onEnterExitPortal: () => void;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface FloatingText {
  active: boolean;
  x: number;
  y: number;
  vy: number;
  life: number;
  text: string;
  color: string;
}

interface Projectile {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  damage: number;
  color: string;
  life: number;
}

interface LiveEnemy {
  id: string;
  archetype: 'patrol' | 'orbiter' | 'turret' | 'charger';
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  patrolRange: number;
  speed: number;
  damage: number;
  dir: number;
  timer: number;
  telegraph: number; // > 0 when telegraphing attack
  cooldown: number;
}

const GRAVITY = 1320;
const PARTICLE_POOL_SIZE = 128;
const PROJ_POOL_SIZE = 24;
const TEXT_POOL_SIZE = 16;

export const PlatformerCanvas: React.FC<PlatformerCanvasProps> = ({
  room,
  theme,
  classId,
  solvedAltars,
  openedChests,
  isPaused,
  hp,
  showTouchControls,
  onOpenAltar,
  onRestBonfire,
  onOpenChest,
  onTakeDamage,
  onEnterExitPortal,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Store latest React props/callbacks in ref so the 60Hz Canvas never tears down on HUD updates
  const propsRef = useRef({
    room,
    theme,
    classId,
    solvedAltars,
    openedChests,
    isPaused,
    hp,
    onOpenAltar,
    onRestBonfire,
    onOpenChest,
    onTakeDamage,
    onEnterExitPortal,
  });
  propsRef.current = {
    room,
    theme,
    classId,
    solvedAltars,
    openedChests,
    isPaused,
    hp,
    onOpenAltar,
    onRestBonfire,
    onOpenChest,
    onTakeDamage,
    onEnterExitPortal,
  };

  // Virtual touch controls input bridge
  const touchKeysRef = useRef<Set<string>>(new Set());
  const [contextHint, setContextHint] = useState<{
    label: string;
    action: () => void;
  } | null>(null);

  // Reset checkpoint / room entities whenever room.id changes
  const roomStateRef = useRef<{
    roomId: string;
    checkpoint: { x: number; y: number };
    player: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      w: number;
      h: number;
      facing: 1 | -1;
      grounded: boolean;
      coyoteTimer: number;
      jumpBuffer: number;
      jumpsLeft: number;
      dashTimer: number;
      dashCooldown: number;
      invulnTimer: number;
      hurtTimer: number;
      dropThroughTimer: number;
      walkDist: number;
      scaleX: number;
      scaleY: number;
      wasGrounded: boolean;
      stepAccum: number;
    };
    enemies: LiveEnemy[];
    bossState: {
      timer: number;
      telegraph: number;
      bobPhase: number;
      defeatedTime: number;
      lastSolvedCount: number;
      hitFlash: number;
    };
    camX: number;
    camY: number;
    trauma: number;
    hitstop: number;
    time: number;
    particles: Particle[];
    particleCursor: number;
    projectiles: Projectile[];
    texts: FloatingText[];
  } | null>(null);

  const initRoomState = (r: RoomDef, cId: HeroClassId) => {
    const cls = getHeroClass(cId);
    const particles: Particle[] = Array.from({ length: PARTICLE_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      size: 4,
      color: '#ffffff',
    }));
    const projectiles: Projectile[] = Array.from({ length: PROJ_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: 7,
      damage: 12,
      color: '#f97316',
      life: 0,
    }));
    const texts: FloatingText[] = Array.from({ length: TEXT_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      vy: -35,
      life: 0,
      text: '',
      color: '#ffffff',
    }));

    const enemies: LiveEnemy[] = r.enemies.map((e) => ({
      id: e.id,
      archetype: e.archetype,
      x: e.x,
      y: e.y,
      originX: e.x,
      originY: e.y,
      vx: 0,
      vy: 0,
      w: 38,
      h: 38,
      patrolRange: e.patrolRange ?? 100,
      speed: e.speed,
      damage: e.damage,
      dir: 1,
      timer: Math.random() * 2,
      telegraph: 0,
      cooldown: 1.5,
    }));

    roomStateRef.current = {
      roomId: r.id,
      checkpoint: { x: r.spawn.x, y: r.spawn.y },
      player: {
        x: r.spawn.x,
        y: r.spawn.y,
        vx: 0,
        vy: 0,
        w: 32,
        h: 44,
        facing: 1,
        grounded: false,
        coyoteTimer: 0,
        jumpBuffer: 0,
        jumpsLeft: cls.canDoubleJump ? 2 : 1,
        dashTimer: 0,
        dashCooldown: 0,
        invulnTimer: 0.6,
        hurtTimer: 0,
        dropThroughTimer: 0,
        walkDist: 0,
        scaleX: 1,
        scaleY: 1,
        wasGrounded: false,
        stepAccum: 0,
      },
      enemies,
      bossState: {
        timer: 1.8,
        telegraph: 0,
        bobPhase: 0,
        defeatedTime: 0,
        lastSolvedCount: 0,
        hitFlash: 0,
      },
      camX: 0,
      camY: 0,
      trauma: 0,
      hitstop: 0,
      time: 0,
      particles,
      particleCursor: 0,
      projectiles,
      texts,
    };
  };

  // Re-initialize when room changes
  useEffect(() => {
    initRoomState(room, classId);
  }, [room.id, classId]);

  // Respawn player at checkpoint when HP drops to 0 and gets restored
  const prevHpRef = useRef(hp);
  useEffect(() => {
    if (prevHpRef.current <= 0 && hp > 0 && roomStateRef.current) {
      const st = roomStateRef.current;
      st.player.x = st.checkpoint.x;
      st.player.y = st.checkpoint.y;
      st.player.vx = 0;
      st.player.vy = 0;
      st.player.invulnTimer = 1.4;
    }
    prevHpRef.current = hp;
  }, [hp]);

  // Main 60Hz loop & unified input listeners mounted ONCE
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const heldKeys = new Set<string>();
    const justPressed = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (propsRef.current.isPaused) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const code = e.code;
      if (
        [
          'Space',
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'KeyW',
          'KeyA',
          'KeyS',
          'KeyD',
          'KeyE',
        ].includes(code)
      ) {
        e.preventDefault();
      }
      if (!heldKeys.has(code)) {
        justPressed.add(code);
      }
      heldKeys.add(code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      heldKeys.delete(e.code);
    };

    const clearInputs = () => {
      heldKeys.clear();
      justPressed.clear();
      touchKeysRef.current.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', clearInputs);
    document.addEventListener('visibilitychange', clearInputs);

    // ResizeObserver for crisp viewport fitting
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(320, Math.floor(rect.width));
      const h = Math.max(300, Math.floor(rect.height));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    const spawnParticles = (
      x: number,
      y: number,
      count: number,
      color: string,
      speed = 130,
      size = 4
    ) => {
      const st = roomStateRef.current;
      if (!st) return;
      for (let i = 0; i < count; i++) {
        const p = st.particles[st.particleCursor % PARTICLE_POOL_SIZE];
        st.particleCursor = (st.particleCursor + 1) % PARTICLE_POOL_SIZE;
        const ang = Math.random() * Math.PI * 2;
        const spd = (0.35 + Math.random() * 0.85) * speed;
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = Math.cos(ang) * spd;
        p.vy = Math.sin(ang) * spd - 45;
        p.maxLife = 0.25 + Math.random() * 0.35;
        p.life = p.maxLife;
        p.size = size;
        p.color = color;
      }
    };

    const spawnFloatingText = (x: number, y: number, text: string, color: string) => {
      const st = roomStateRef.current;
      if (!st) return;
      const slot = st.texts.find((t) => !t.active) ?? st.texts[0];
      slot.active = true;
      slot.x = x;
      slot.y = y;
      slot.vy = -42;
      slot.life = 0.95;
      slot.text = text;
      slot.color = color;
    };

    const spawnProjectile = (
      x: number,
      y: number,
      vx: number,
      vy: number,
      damage: number,
      color: string
    ) => {
      const st = roomStateRef.current;
      if (!st) return;
      const slot = st.projectiles.find((p) => !p.active);
      if (!slot) return;
      slot.active = true;
      slot.x = x;
      slot.y = y;
      slot.vx = vx;
      slot.vy = vy;
      slot.r = 8;
      slot.damage = damage;
      slot.color = color;
      slot.life = 3.6;
    };

    let lastTime = performance.now();
    let lastContextId = '';
    let lastPausedRenderSig = '';
    let rafId = 0;

    const frame = (now: number) => {
      rafId = requestAnimationFrame(frame);
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      const props = propsRef.current;
      if (!roomStateRef.current || roomStateRef.current.roomId !== props.room.id) {
        initRoomState(props.room, props.classId);
        lastPausedRenderSig = '';
      }
      const st = roomStateRef.current!;
      const cls = getHeroClass(props.classId);

      // Pause freezes simulation cleanly and skips redundant 60Hz full-canvas redraws while modals are open
      if (props.isPaused) {
        const sig = `${props.room.id}_${props.solvedAltars.length}_${props.openedChests.length}_${canvas.width}x${canvas.height}_${props.hp}`;
        if (sig === lastPausedRenderSig) {
          justPressed.clear();
          return;
        }
        lastPausedRenderSig = sig;
      } else {
        lastPausedRenderSig = '';
      }

      if (!props.isPaused && props.hp > 0) {
        st.time += dt;
        st.trauma = Math.max(0, st.trauma - dt * 1.9);

        if (st.hitstop > 0) {
          st.hitstop = Math.max(0, st.hitstop - dt);
        } else {
          const p = st.player;
          const isHeld = (code: string) =>
            heldKeys.has(code) || touchKeysRef.current.has(code);
          const isJust = (code: string) => justPressed.has(code);

          // Active platforms (bridges appear when solved, gates open when solved)
          const activePlatforms = props.room.platforms
            .filter((plat) => {
              if (plat.kind === 'bridge') {
                return Boolean(
                  plat.linkedAltarId && props.solvedAltars.includes(plat.linkedAltarId)
                );
              }
              if (plat.kind === 'gate') {
                return !(
                  plat.linkedAltarId && props.solvedAltars.includes(plat.linkedAltarId)
                );
              }
              return true;
            })
            .map((plat) => {
              if (plat.kind === 'moving' && plat.moveRange) {
                const offset =
                  Math.sin(st.time * (plat.moveSpeed ?? 1.5)) * plat.moveRange;
                return {
                  ...plat,
                  x: plat.moveAxis === 'x' ? plat.x + offset : plat.x,
                  y: plat.moveAxis === 'y' ? plat.y + offset : plat.y,
                };
              }
              return plat;
            });

          // Horizontal input
          const moveLeft = isHeld('KeyA') || isHeld('ArrowLeft');
          const moveRight = isHeld('KeyD') || isHeld('ArrowRight');
          const moveDown = isHeld('KeyS') || isHeld('ArrowDown');
          const jumpJust =
            isJust('Space') || isJust('KeyW') || isJust('ArrowUp');
          const jumpHeld =
            isHeld('Space') || isHeld('KeyW') || isHeld('ArrowUp');
          const dashJust = isJust('ShiftLeft') || isJust('ShiftRight') || isJust('KeyK');
          const interactJust = isJust('KeyE') || isJust('Enter');

          // Timers
          if (p.invulnTimer > 0) p.invulnTimer -= dt;
          if (p.hurtTimer > 0) p.hurtTimer -= dt;
          if (p.dashCooldown > 0) p.dashCooldown -= dt;
          if (p.dropThroughTimer > 0) p.dropThroughTimer -= dt;
          if (p.coyoteTimer > 0) p.coyoteTimer -= dt;
          if (p.jumpBuffer > 0) p.jumpBuffer -= dt;

          if (jumpJust) {
            p.jumpBuffer = 0.12;
          }

          if (moveDown && p.grounded) {
            p.dropThroughTimer = 0.22;
          }

          // Rogue Dash
          if (cls.canDash && dashJust && p.dashCooldown <= 0) {
            p.dashTimer = 0.15;
            p.dashCooldown = 0.85;
            p.vx = p.facing * 560;
            p.vy = 0;
            p.scaleX = 1.25;
            p.scaleY = 0.82;
            soundEngine.play('dash');
            spawnParticles(p.x + p.w / 2, p.y + p.h / 2, 8, '#a78bfa', 140, 4);
          }

          if (p.dashTimer > 0) {
            p.dashTimer -= dt;
          } else {
            const targetVx =
              (moveRight ? 1 : 0) * cls.moveSpeed - (moveLeft ? 1 : 0) * cls.moveSpeed;
            if (targetVx !== 0) {
              p.facing = targetVx > 0 ? 1 : -1;
            }
            const accel = p.grounded ? 18 : 11;
            p.vx += (targetVx - p.vx) * Math.min(1, accel * dt);
            if (Math.abs(p.vx) < 4 && targetVx === 0) p.vx = 0;
          }

          // Execute Jump (coyote or double jump)
          if (p.jumpBuffer > 0) {
            if (p.coyoteTimer > 0) {
              p.vy = cls.jumpVelocity;
              p.grounded = false;
              p.coyoteTimer = 0;
              p.jumpBuffer = 0;
              p.jumpsLeft = cls.canDoubleJump ? 1 : 0;
              p.scaleX = 0.84;
              p.scaleY = 1.2;
              soundEngine.play('jump');
              spawnParticles(p.x + p.w / 2, p.y + p.h, 5, '#e2e8f0', 90, 3);
            } else if (p.jumpsLeft > 0) {
              p.vy = cls.jumpVelocity * 0.92;
              p.jumpsLeft -= 1;
              p.jumpBuffer = 0;
              p.scaleX = 0.86;
              p.scaleY = 1.18;
              soundEngine.play('jump');
              spawnParticles(p.x + p.w / 2, p.y + p.h, 7, cls.accentColor, 110, 4);
            }
          }

          // Variable jump height cut
          if (!jumpHeld && p.vy < -180) {
            p.vy *= 0.65;
          }

          // Gravity
          if (p.dashTimer <= 0) {
            p.vy = Math.min(820, p.vy + GRAVITY * dt);
          }

          // Horizontal move + solid collision
          p.x += p.vx * dt;
          for (const plat of activePlatforms) {
            if (plat.kind === 'semisolid') continue;
            if (rectsOverlap(p, plat)) {
              if (p.vx > 0) p.x = plat.x - p.w;
              else if (p.vx < 0) p.x = plat.x + plat.w;
              p.vx = 0;
            }
          }

          // Vertical move + collision
          const prevBottom = p.y + p.h;
          p.y += p.vy * dt;
          p.wasGrounded = p.grounded;
          p.grounded = false;

          for (const plat of activePlatforms) {
            if (plat.kind === 'semisolid') {
              if (
                p.vy >= 0 &&
                p.dropThroughTimer <= 0 &&
                prevBottom <= plat.y + 8 &&
                p.y + p.h >= plat.y &&
                p.x + p.w > plat.x + 2 &&
                p.x < plat.x + plat.w - 2
              ) {
                p.y = plat.y - p.h;
                p.vy = 0;
                p.grounded = true;
              }
            } else if (rectsOverlap(p, plat)) {
              if (p.vy >= 0) {
                p.y = plat.y - p.h;
                p.vy = 0;
                p.grounded = true;
              } else if (p.vy < 0) {
                p.y = plat.y + plat.h;
                p.vy = 0;
              }
            }
          }

          if (p.grounded) {
            p.coyoteTimer = 0.11;
            p.jumpsLeft = cls.canDoubleJump ? 2 : 1;
            if (!p.wasGrounded) {
              p.scaleX = 1.22;
              p.scaleY = 0.78;
              soundEngine.play('land');
              spawnParticles(p.x + p.w / 2, p.y + p.h, 4, '#cbd5e1', 75, 3);
            }
            if (Math.abs(p.vx) > 25) {
              const stepDelta = Math.abs(p.vx) * dt;
              p.walkDist += stepDelta;
              p.stepAccum += stepDelta;
              if (p.stepAccum > 58) {
                p.stepAccum = 0;
                soundEngine.play('step');
              }
            }
          }

          // Exponentially damp squash-and-stretch back to 1
          p.scaleX += (1 - p.scaleX) * Math.min(1, 14 * dt);
          p.scaleY += (1 - p.scaleY) * Math.min(1, 14 * dt);

          // Fall below world pit
          if (p.y > props.room.height + 60) {
            st.trauma = Math.min(1, st.trauma + 0.55);
            soundEngine.play('damage');
            props.onTakeDamage(18, 'Caíste al abismo y perdiste 18 HP.');
            p.x = st.checkpoint.x;
            p.y = st.checkpoint.y;
            p.vx = 0;
            p.vy = 0;
            p.invulnTimer = 1.2;
          }

          const hurtHero = (dmg: number, knockDir: number, reason: string) => {
            if (p.invulnTimer > 0) return;
            p.invulnTimer = 1.15;
            p.hurtTimer = 0.28;
            p.vx = knockDir * 240;
            p.vy = -260;
            st.hitstop = 0.045;
            st.trauma = Math.min(1, st.trauma + 0.6);
            soundEngine.play('damage');
            spawnParticles(p.x + p.w / 2, p.y + p.h / 2, 14, '#ef4444', 180, 4);
            spawnFloatingText(p.x + p.w / 2, p.y - 10, `-${dmg} HP`, '#f87171');
            props.onTakeDamage(dmg, reason);
          };

          // Hazards collision
          for (const hz of props.room.hazards) {
            if (
              hz.disabledByAltarId &&
              props.solvedAltars.includes(hz.disabledByAltarId)
            ) {
              continue;
            }
            if (rectsOverlap(p, hz)) {
              const dir = p.x < hz.x + hz.w / 2 ? -1 : 1;
              hurtHero(
                hz.damage,
                dir,
                hz.kind === 'lava'
                  ? `¡Lava ardiente! -${hz.damage} HP.`
                  : `¡Trampa de pinchos! -${hz.damage} HP.`
              );
            }
          }

          // Update 4 distinct Enemy archetypes
          for (const en of st.enemies) {
            en.timer += dt;
            if (en.archetype === 'patrol') {
              en.x += en.dir * en.speed * dt;
              if (en.x > en.originX + en.patrolRange) en.dir = -1;
              if (en.x < en.originX - en.patrolRange) en.dir = 1;
            } else if (en.archetype === 'orbiter') {
              en.x = en.originX + Math.cos(en.timer * 2.1) * en.patrolRange;
              en.y = en.originY + Math.sin(en.timer * 3.2) * 32;
              en.dir = Math.sin(en.timer * 2.1) > 0 ? -1 : 1;
            } else if (en.archetype === 'turret') {
              en.cooldown -= dt;
              const dist = Math.hypot(p.x - en.x, p.y - en.y);
              if (dist < 460) {
                if (en.cooldown <= 0.55 && en.cooldown > 0) {
                  en.telegraph = 0.55 - en.cooldown;
                }
                if (en.cooldown <= 0) {
                  en.cooldown = 2.4;
                  en.telegraph = 0;
                  const dx = p.x + p.w / 2 - (en.x + en.w / 2);
                  const dy = p.y + p.h / 2 - (en.y + en.h / 2);
                  const mag = Math.max(1, Math.hypot(dx, dy));
                  spawnProjectile(
                    en.x + en.w / 2,
                    en.y + 12,
                    (dx / mag) * 240,
                    (dy / mag) * 240,
                    en.damage,
                    '#f97316'
                  );
                }
              } else {
                en.telegraph = 0;
              }
            } else if (en.archetype === 'charger') {
              const distX = p.x - en.x;
              const sameFloor = Math.abs(p.y - en.y) < 70;
              if (en.telegraph > 0) {
                en.telegraph -= dt;
                if (en.telegraph <= 0) {
                  en.vx = Math.sign(distX || 1) * (en.speed * 2.1);
                  en.cooldown = 1.6;
                }
              } else if (en.cooldown > 0) {
                en.cooldown -= dt;
                en.x += en.vx * dt;
                en.vx *= Math.pow(0.15, dt);
              } else if (sameFloor && Math.abs(distX) < 260) {
                en.dir = Math.sign(distX || 1);
                en.telegraph = 0.45; // Visible charge windup
              } else {
                en.x += en.dir * (en.speed * 0.55) * dt;
                if (en.x > en.originX + en.patrolRange) en.dir = -1;
                if (en.x < en.originX - en.patrolRange) en.dir = 1;
              }
              en.x = Math.max(
                en.originX - en.patrolRange - 80,
                Math.min(en.originX + en.patrolRange + 80, en.x)
              );
            }

            if (rectsOverlap(p, en)) {
              const knock = p.x + p.w / 2 < en.x + en.w / 2 ? -1 : 1;
              hurtHero(en.damage, knock, `¡Impacto enemigo! -${en.damage} HP.`);
            }
          }

          // Boss multi-phase AI
          if (props.room.boss) {
            const boss = props.room.boss;
            const solvedBossPhases = props.room.altars.filter((a) =>
              props.solvedAltars.includes(a.id)
            ).length;
            const bossDefeated = solvedBossPhases >= props.room.altars.length;
            const bs = st.bossState;

            if (solvedBossPhases > bs.lastSolvedCount) {
              bs.lastSolvedCount = solvedBossPhases;
              bs.hitFlash = 0.35;
              st.trauma = 0.8;
              soundEngine.play('bossHit');
              spawnParticles(boss.x + 40, boss.y + 40, 26, '#facc15', 220, 5);
              spawnFloatingText(
                boss.x + 40,
                boss.y - 16,
                bossDefeated ? '¡JEFE DERROTADO!' : '¡ESCUDO ROTO!',
                '#fde047'
              );
            }
            if (bs.hitFlash > 0) bs.hitFlash -= dt;
            bs.bobPhase += dt * 2.4;

            if (bossDefeated) {
              bs.defeatedTime += dt;
            } else {
              bs.timer -= dt;
              if (bs.timer <= 0.6 && bs.timer > 0) {
                bs.telegraph = 0.6 - bs.timer;
              }
              if (bs.timer <= 0) {
                bs.timer = Math.max(1.4, boss.attackInterval - solvedBossPhases * 0.25);
                bs.telegraph = 0;
                const bx = boss.x + 30;
                const by = boss.y + 40 + Math.sin(bs.bobPhase) * 14;
                const dx = p.x + p.w / 2 - bx;
                const dy = p.y + p.h / 2 - by;
                const mag = Math.max(1, Math.hypot(dx, dy));
                spawnProjectile(
                  bx,
                  by,
                  (dx / mag) * 265,
                  (dy / mag) * 265,
                  boss.damage,
                  props.theme.accent
                );
              }
            }
          }

          // Projectiles update
          for (const proj of st.projectiles) {
            if (!proj.active) continue;
            proj.x += proj.vx * dt;
            proj.y += proj.vy * dt;
            proj.life -= dt;
            if (proj.life <= 0) {
              proj.active = false;
              continue;
            }
            const projBox = {
              x: proj.x - proj.r,
              y: proj.y - proj.r,
              w: proj.r * 2,
              h: proj.r * 2,
            };
            if (rectsOverlap(p, projBox)) {
              proj.active = false;
              hurtHero(
                proj.damage,
                Math.sign(proj.vx || -1),
                `¡Proyectil arcano! -${proj.damage} HP.`
              );
            }
          }

          // Contextual interaction checks (Altars, Bonfires, Chests, Exit Portal)
          let nearbyId = '';
          let nearbyLabel = '';
          let nearbyAction: (() => void) | null = null;

          for (const altar of props.room.altars) {
            const dist = Math.hypot(p.x + p.w / 2 - (altar.x + 24), p.y + p.h / 2 - (altar.y + 24));
            if (dist < 64) {
              nearbyId = `altar_${altar.id}`;
              const solved = props.solvedAltars.includes(altar.id);
              nearbyLabel = solved
                ? `[E] Revisar Altar: ${altar.label}`
                : `[E] Abrir Altar: ${altar.label}`;
              nearbyAction = () => {
                soundEngine.play('openAltar');
                props.onOpenAltar(altar);
              };
              break;
            }
          }

          if (!nearbyAction) {
            for (const bf of props.room.bonfires) {
              const dist = Math.hypot(p.x + p.w / 2 - (bf.x + 24), p.y + p.h / 2 - (bf.y + 24));
              if (dist < 60) {
                nearbyId = `bf_${bf.id}`;
                nearbyLabel = '[E] Descansar en Hoguera (Checkpoint)';
                nearbyAction = () => {
                  st.checkpoint = { x: bf.x, y: bf.y - 10 };
                  spawnParticles(bf.x + 24, bf.y + 12, 16, '#fb923c', 110, 4);
                  spawnFloatingText(bf.x + 24, bf.y - 16, 'CHECKPOINT', '#fde047');
                  props.onRestBonfire();
                };
                break;
              }
            }
          }

          if (!nearbyAction) {
            for (const ch of props.room.chests) {
              if (props.openedChests.includes(ch.id)) continue;
              const dist = Math.hypot(p.x + p.w / 2 - (ch.x + 24), p.y + p.h / 2 - (ch.y + 24));
              if (dist < 58) {
                nearbyId = `ch_${ch.id}`;
                nearbyLabel = `[E] Abrir Cofre (+${ch.gold} Oro)`;
                nearbyAction = () => {
                  spawnParticles(ch.x + 24, ch.y + 12, 18, '#facc15', 140, 4);
                  spawnFloatingText(ch.x + 24, ch.y - 14, `+${ch.gold} ORO`, '#fde047');
                  props.onOpenChest(ch.id, ch.gold, ch.xp);
                };
                break;
              }
            }
          }

          if (!nearbyAction) {
            const portal = props.room.exitPortal;
            const dist = Math.hypot(
              p.x + p.w / 2 - (portal.x + 32),
              p.y + p.h / 2 - (portal.y + 32)
            );
            if (dist < 70) {
              const unlocked = portal.requiresAltarIds.every((id) =>
                props.solvedAltars.includes(id)
              );
              nearbyId = `portal_${unlocked ? 'open' : 'lock'}`;
              nearbyLabel = unlocked
                ? '[E] Cruzar Portal a la Siguiente Sala'
                : 'Portal sellado: resuelve todos los Altares de esta sala';
              nearbyAction = unlocked
                ? () => {
                    props.onEnterExitPortal();
                  }
                : () => {
                    soundEngine.play('codeError');
                    spawnFloatingText(portal.x + 24, portal.y - 14, 'SELLADO', '#f87171');
                  };
            }
          }

          if (nearbyId !== lastContextId) {
            lastContextId = nearbyId;
            setContextHint(
              nearbyAction ? { label: nearbyLabel, action: nearbyAction } : null
            );
          }

          if (interactJust && nearbyAction) {
            nearbyAction();
          }

          // Particles & floating texts update
          for (const pt of st.particles) {
            if (!pt.active) continue;
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.vy += 260 * dt;
            pt.life -= dt;
            if (pt.life <= 0) pt.active = false;
          }

          for (const ft of st.texts) {
            if (!ft.active) continue;
            ft.y += ft.vy * dt;
            ft.life -= dt;
            if (ft.life <= 0) ft.active = false;
          }

          // Smooth camera tracking
          const targetCamX = Math.max(
            0,
            Math.min(
              Math.max(0, props.room.width - canvas.width),
              p.x + p.w / 2 - canvas.width * 0.42
            )
          );
          const targetCamY = Math.max(
            0,
            Math.min(
              Math.max(0, props.room.height - canvas.height),
              p.y + p.h / 2 - canvas.height * 0.56
            )
          );
          st.camX += (targetCamX - st.camX) * Math.min(1, 7 * dt);
          st.camY += (targetCamY - st.camY) * Math.min(1, 7 * dt);
        }
      }

      justPressed.clear();

      // ==================== RENDER CANVAS 2D ====================
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;

      const W = canvas.width;
      const H = canvas.height;
      const th = props.theme;

      // Anchor the dungeon floor cleanly to the bottom of the viewport
      const offsetY = H > props.room.height ? H - props.room.height : 0;
      const floorScreenY = offsetY + 460;
      const shakeMag = st.trauma * st.trauma * 12;
      const shakeX = shakeMag > 0.2 ? (Math.random() * 2 - 1) * shakeMag : 0;
      const shakeY = shakeMag > 0.2 ? (Math.random() * 2 - 1) * shakeMag : 0;

      // Sky backdrop
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, th.skyTop);
      skyGrad.addColorStop(1, th.skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Pixel stars in upper sky
      ctx.fillStyle = 'rgba(255, 248, 220, 0.45)';
      for (let i = 0; i < 42; i++) {
        const sx = ((i * 173 - st.camX * 0.08) % W + W) % W;
        const sy = (i * 67) % Math.max(120, Math.floor(floorScreenY * 0.6));
        const tw = Math.sin(st.time * 2 + i) > 0.4 ? 3 : 2;
        ctx.fillRect(Math.floor(sx), Math.floor(sy), tw, tw);
      }

      // Parallax far castle towers & battlements rising above floorScreenY
      ctx.fillStyle = th.mountainFar;
      for (let i = -1; i < Math.ceil(W / 260) + 2; i++) {
        const bx = Math.floor(i * 260 - ((st.camX * 0.16) % 260));
        ctx.fillRect(bx + 18, floorScreenY - 260, 96, 260);
        ctx.fillRect(bx + 36, floorScreenY - 320, 56, 60);
        ctx.fillRect(bx + 140, floorScreenY - 210, 92, 210);
        // Distant lit tower windows
        ctx.fillStyle = th.torchColor;
        ctx.fillRect(bx + 58, floorScreenY - 295, 10, 16);
        ctx.fillRect(bx + 180, floorScreenY - 175, 10, 16);
        ctx.fillStyle = th.mountainFar;
      }

      // Parallax midground castle arcade & gothic stone columns
      ctx.fillStyle = th.mountainNear;
      ctx.fillRect(0, floorScreenY - 180, W, 180);
      for (let i = -1; i < Math.ceil(W / 200) + 2; i++) {
        const px = Math.floor(i * 200 - ((st.camX * 0.34) % 200));
        // Dark gothic arched alcove cutout
        ctx.fillStyle = th.skyBottom;
        ctx.fillRect(px + 54, floorScreenY - 148, 92, 148);
        ctx.fillRect(px + 68, floorScreenY - 166, 64, 20);
        // Stone pillar ribs & lintel
        ctx.fillStyle = th.tileDark;
        ctx.fillRect(px + 48, floorScreenY - 168, 8, 168);
        ctx.fillRect(px + 144, floorScreenY - 168, 8, 168);
        ctx.fillRect(px, floorScreenY - 186, 200, 10);
      }

      ctx.save();
      ctx.translate(
        Math.floor(-st.camX + shakeX),
        Math.floor(-st.camY + offsetY + shakeY)
      );

      // Wall torches with warm ambient glow halo
      for (let tx = 140; tx < props.room.width - 100; tx += 280) {
        const flick = Math.sin(st.time * 12 + tx) * 3;
        ctx.fillStyle = 'rgba(251, 146, 60, 0.14)';
        ctx.fillRect(tx - 24, 306, 56, 56);
        ctx.fillStyle = '#3b2d26';
        ctx.fillRect(tx, 342, 8, 28);
        ctx.fillStyle = th.torchColor;
        ctx.fillRect(tx - 3, 330 + flick * 0.4, 14, 14);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(tx, 334, 8, 8);
      }

      // Draw Platforms, Bridges & Gates
      for (const plat of props.room.platforms) {
        if (plat.x < 0 || plat.x >= props.room.width) continue;
        let px = plat.x;
        let py = plat.y;
        if (plat.kind === 'moving' && plat.moveRange) {
          const offset = Math.sin(st.time * (plat.moveSpeed ?? 1.5)) * plat.moveRange;
          if (plat.moveAxis === 'x') px += offset;
          if (plat.moveAxis === 'y') py += offset;
        }

        if (plat.kind === 'bridge') {
          const solved = Boolean(
            plat.linkedAltarId && props.solvedAltars.includes(plat.linkedAltarId)
          );
          if (!solved) {
            // Dashed ghostly blueprint showing where the bridge will extend
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.strokeRect(px + 2, py + 2, plat.w - 4, plat.h - 4);
            ctx.setLineDash([]);
            continue;
          }
          ctx.fillStyle = '#b45309';
          ctx.fillRect(px, py, plat.w, plat.h);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(px, py, plat.w, 6);
          ctx.fillStyle = '#fef08a';
          for (let bx = px + 12; bx < px + plat.w - 12; bx += 26) {
            ctx.fillRect(bx, py + 10, 12, 4);
          }
          continue;
        }

        if (plat.kind === 'gate') {
          const solved = Boolean(
            plat.linkedAltarId && props.solvedAltars.includes(plat.linkedAltarId)
          );
          if (solved) continue;
          ctx.fillStyle = '#3f2e4f';
          ctx.fillRect(px, py, plat.w, plat.h);
          ctx.fillStyle = '#ef4444';
          for (let gy = py + 10; gy < py + plat.h - 10; gy += 22) {
            ctx.fillRect(px + 6, gy, plat.w - 12, 6);
          }
          ctx.strokeStyle = '#120d1a';
          ctx.lineWidth = 2;
          ctx.strokeRect(px, py, plat.w, plat.h);
          continue;
        }

        // Solid / semisolid / moving stone pixel blocks
        ctx.fillStyle = th.tileBody;
        ctx.fillRect(px, py, plat.w, plat.h);
        ctx.fillStyle = th.tileTop;
        ctx.fillRect(px, py, plat.w, plat.kind === 'semisolid' ? 6 : 10);
        ctx.fillStyle = th.tileDark;
        ctx.fillRect(px, py + plat.h - 4, plat.w, 4);

        // Brick mortar lines
        ctx.fillStyle = th.tileDark;
        for (let bx = px + 32; bx < px + plat.w; bx += 32) {
          ctx.fillRect(bx, py + 8, 2, Math.min(plat.h - 10, 26));
        }
      }

      // Draw Hazards (Spikes / Lava)
      for (const hz of props.room.hazards) {
        if (hz.disabledByAltarId && props.solvedAltars.includes(hz.disabledByAltarId)) {
          continue;
        }
        if (hz.kind === 'lava') {
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(hz.x, hz.y, hz.w, hz.h + 40);
          ctx.fillStyle = '#f97316';
          const wave = Math.sin(st.time * 6) * 3;
          ctx.fillRect(hz.x, hz.y + wave * 0.4, hz.w, 8);
          ctx.fillStyle = '#fde047';
          for (let lx = hz.x + 8; lx < hz.x + hz.w - 16; lx += 34) {
            ctx.fillRect(lx, hz.y + 4, 14, 3);
          }
        } else {
          ctx.fillStyle = '#cbd5e1';
          for (let sx = hz.x; sx < hz.x + hz.w - 8; sx += 16) {
            ctx.beginPath();
            ctx.moveTo(sx, hz.y + hz.h);
            ctx.lineTo(sx + 8, hz.y);
            ctx.lineTo(sx + 16, hz.y + hz.h);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      // Draw Bonfires
      for (const bf of props.room.bonfires) {
        const spr = getPropSprite(
          Math.floor(st.time * 5) % 2 === 0 ? 'bonfire1' : 'bonfire2',
          3
        );
        ctx.drawImage(spr, bf.x, bf.y);
      }

      // Draw Chests
      for (const ch of props.room.chests) {
        const opened = props.openedChests.includes(ch.id);
        const spr = getPropSprite(opened ? 'chest_open' : 'chest_closed', 3);
        ctx.drawImage(spr, ch.x, ch.y);
      }

      // Draw Rune Altars
      for (const altar of props.room.altars) {
        const solved = props.solvedAltars.includes(altar.id);
        const floatY = Math.sin(st.time * 3.5 + altar.x) * 3;
        const spr = getPropSprite(solved ? 'altar_solved' : 'altar_locked', 3);
        ctx.drawImage(spr, altar.x, altar.y);

        // Diegetic floating rune crystal indicator above altar
        ctx.fillStyle = solved ? '#34d399' : '#facc15';
        ctx.fillRect(altar.x + 20, altar.y - 12 + floatY, 8, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(altar.x + 22, altar.y - 10 + floatY, 3, 3);
      }

      // Draw Exit Portal
      const portal = props.room.exitPortal;
      const portalUnlocked = portal.requiresAltarIds.every((id) =>
        props.solvedAltars.includes(id)
      );
      const portalSpr = getPropSprite(portalUnlocked ? 'portal_open' : 'portal_locked', 4);
      ctx.drawImage(portalSpr, portal.x, portal.y);

      // Draw Enemies + Telegraph cues
      for (const en of st.enemies) {
        const frameIdx: 0 | 1 = Math.floor(en.timer * 4.5) % 2 === 0 ? 0 : 1;
        const spr = getEnemySprite(
          en.archetype,
          frameIdx,
          3,
          en.dir < 0,
          en.telegraph > 0.25 && Math.floor(st.time * 24) % 2 === 0
        );
        ctx.drawImage(spr, Math.floor(en.x - 4), Math.floor(en.y - 8));

        if (en.telegraph > 0) {
          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 14px "Press Start 2P", monospace';
          ctx.fillText('!', Math.floor(en.x + 14), Math.floor(en.y - 12));
        }
      }

      // Draw Castle Boss
      if (props.room.boss) {
        const boss = props.room.boss;
        const solvedPhases = props.room.altars.filter((a) =>
          props.solvedAltars.includes(a.id)
        ).length;
        const totalPhases = props.room.altars.length;
        const defeated = solvedPhases >= totalPhases;
        const bs = st.bossState;

        if (!defeated || bs.defeatedTime < 0.7) {
          const alpha = defeated ? Math.max(0, 1 - bs.defeatedTime / 0.7) : 1;
          ctx.save();
          ctx.globalAlpha = alpha;
          const by = boss.y + Math.sin(bs.bobPhase) * 10;
          const flash =
            bs.hitFlash > 0 || (bs.telegraph > 0.3 && Math.floor(st.time * 20) % 2 === 0);
          const spr = getBossSprite(boss.spriteKey, 5, flash);
          ctx.drawImage(spr, boss.x - 10, Math.floor(by));

          // Boss Shield Rings & Nameplate
          if (!defeated) {
            const shieldsLeft = totalPhases - solvedPhases;
            ctx.strokeStyle = th.accent;
            ctx.lineWidth = 2;
            for (let s = 0; s < shieldsLeft; s++) {
              ctx.beginPath();
              ctx.arc(boss.x + 40, by + 48, 52 + s * 8, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Boss HP bar above boss
            const barW = 130;
            const bx = boss.x - 24;
            const barY = by - 24;
            ctx.fillStyle = '#120d1a';
            ctx.fillRect(bx - 2, barY - 2, barW + 4, 14);
            ctx.fillStyle = '#451a24';
            ctx.fillRect(bx, barY, barW, 10);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(bx, barY, Math.floor(barW * (shieldsLeft / totalPhases)), 10);

            ctx.fillStyle = '#fef3c7';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(boss.name, boss.x + 40, barY - 8);
            ctx.textAlign = 'left';
          }
          ctx.restore();
        }
      }

      // Draw Projectiles
      for (const proj of st.projectiles) {
        if (!proj.active) continue;
        ctx.fillStyle = proj.color;
        ctx.fillRect(
          Math.floor(proj.x - proj.r),
          Math.floor(proj.y - proj.r),
          proj.r * 2,
          proj.r * 2
        );
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.floor(proj.x - 3), Math.floor(proj.y - 3), 6, 6);
      }

      // Draw Player Sprite with squash-and-stretch and gait-synced walk cycle
      const p = st.player;
      let heroFrame: HeroFrame = 'idle1';
      if (p.hurtTimer > 0) heroFrame = 'hurt';
      else if (!p.grounded) heroFrame = 'jump';
      else if (Math.abs(p.vx) > 25) {
        heroFrame = Math.floor(p.walkDist / 26) % 2 === 0 ? 'walk1' : 'walk2';
      } else {
        heroFrame = Math.floor(st.time * 2.5) % 2 === 0 ? 'idle1' : 'idle2';
      }

      const blinkSkip = p.invulnTimer > 0 && Math.floor(st.time * 18) % 2 === 0;
      if (!blinkSkip) {
        const hSpr = getHeroSprite(
          props.classId,
          heroFrame,
          3,
          p.facing < 0,
          p.hurtTimer > 0.14
        );
        const drawW = hSpr.width * p.scaleX;
        const drawH = hSpr.height * p.scaleY;
        const drawX = Math.floor(p.x + p.w / 2 - drawW / 2);
        const drawY = Math.floor(p.y + p.h - drawH + 2);
        ctx.drawImage(hSpr, drawX, drawY, drawW, drawH);
      }

      // Draw Particles
      for (const pt of st.particles) {
        if (!pt.active) continue;
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.fillRect(Math.floor(pt.x), Math.floor(pt.y), pt.size, pt.size);
      }
      ctx.globalAlpha = 1;

      // Draw Floating Combat Texts
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      for (const ft of st.texts) {
        if (!ft.active) continue;
        ctx.globalAlpha = Math.min(1, ft.life * 1.4);
        ctx.fillStyle = '#09070f';
        ctx.fillText(ft.text, Math.floor(ft.x) + 2, Math.floor(ft.y) + 2);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, Math.floor(ft.x), Math.floor(ft.y));
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';

      ctx.restore();

      // Critical low HP subtle peripheral vignette
      if (props.hp > 0 && props.hp <= 25) {
        const pulse = 0.16 + Math.sin(st.time * 6) * 0.08;
        ctx.strokeStyle = `rgba(220, 38, 38, ${pulse})`;
        ctx.lineWidth = 18;
        ctx.strokeRect(0, 0, W, H);
      }
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearInputs);
      document.removeEventListener('visibilitychange', clearInputs);
    };
  }, []);

  const bindTouchKey = (code: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      touchKeysRef.current.add(code);
      if (code === 'Space' || code === 'KeyE') {
        window.dispatchEvent(new KeyboardEvent('keydown', { code }));
      }
    },
    onPointerUp: () => {
      touchKeysRef.current.delete(code);
      window.dispatchEvent(new KeyboardEvent('keyup', { code }));
    },
    onPointerLeave: () => {
      touchKeysRef.current.delete(code);
    },
  });

  return (
    <div
      ref={containerRef}
      data-testid="platformer-stage"
      className="relative h-full w-full overflow-hidden select-none bg-[#0d0b14]"
    >
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        className="block h-full w-full pixelated"
      />

      {/* Contextual interaction prompt button (also triggers with E) */}
      {contextHint && !isPaused && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-20 -translate-x-1/2">
          <button
            type="button"
            onClick={contextHint.action}
            className="pointer-events-auto pixel-btn bg-[#241b35] px-5 py-2.5 text-sm font-code font-semibold text-amber-200 border-amber-500/80 whitespace-nowrap"
          >
            {contextHint.label}
          </button>
        </div>
      )}

      {/* Optional On-Screen Touch/Mouse Controls */}
      {showTouchControls && !isPaused && (
        <div className="pointer-events-none fixed inset-x-4 bottom-4 z-20 flex items-end justify-between">
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Mover izquierda"
              {...bindTouchKey('ArrowLeft')}
              className="pixel-btn h-12 w-12 bg-[#1c172b] font-pixel text-sm text-stone-100"
            >
              ◀
            </button>
            <button
              type="button"
              aria-label="Mover derecha"
              {...bindTouchKey('ArrowRight')}
              className="pixel-btn h-12 w-12 bg-[#1c172b] font-pixel text-sm text-stone-100"
            >
              ▶
            </button>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Interactuar"
              {...bindTouchKey('KeyE')}
              className="pixel-btn h-12 px-4 bg-[#2e2047] font-pixel text-xs text-amber-200"
            >
              E
            </button>
            <button
              type="button"
              aria-label="Saltar"
              {...bindTouchKey('Space')}
              className="pixel-btn h-12 px-4 bg-[#243b2f] font-pixel text-xs text-emerald-200"
            >
              SALTAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
