import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Eye,
  Flame,
  HelpCircle,
  Play,
  RotateCcw,
  ScrollText,
  Shield,
  Terminal,
  X,
  XCircle,
} from 'lucide-react';
import { soundEngine } from '../assets/soundEngine';
import { getHeroClass } from '../data/classesData';
import { executeChallengeCode } from '../engine/codeSandbox';
import {
  adaptChallengeForClass,
  calculateActionCost,
  calculateCounterattackDamage,
  getHintCost,
} from '../engine/gameRules';
import { useGameStore } from '../store/useGameStore';
import { AltarPlacement, SandboxExecutionResult } from '../types/game';

interface CodeAltarModalProps {
  altar: AltarPlacement;
  castleId: number;
  isBossRoom: boolean;
  onClose: () => void;
  onOpenGrimoire: () => void;
}

const JS_AUTOCOMPLETE = [
  'function',
  'const',
  'let',
  'return',
  'if',
  'else',
  'for',
  'while',
  'switch',
  'async',
  'await',
  'try',
  'catch',
  'document.querySelector',
  'document.querySelectorAll',
  'document.createElement',
  'addEventListener',
  'classList.add',
  'classList.remove',
  'classList.toggle',
  'textContent',
  'appendChild',
  'preventDefault',
  'fetch',
  'Promise.all',
  'localStorage.getItem',
  'localStorage.setItem',
  'JSON.stringify',
  'JSON.parse',
  'filter',
  'map',
  'reduce',
  'find',
  'every',
  'some',
  'console.log',
];

/**
 * Lightweight JS syntax highlighter producing React spans (no raw HTML injection).
 */
function highlightJsLine(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const regex =
    /(\/\/.*$|`[^`]*`|"[^"]*"|'[^']*'|\b(?:const|let|var|function|return|if|else|for|while|switch|case|default|break|continue|async|await|try|catch|finally|new|throw|typeof|of|in|true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b|\b(?:document|console|fetch|Promise|localStorage|JSON|Math|Array|Set|Map|Number|String)\b)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let k = 0;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(
        <span key={k++} className="text-stone-100">
          {line.slice(lastIndex, match.index)}
        </span>
      );
    }
    const text = match[0];
    let cls = 'text-stone-100';
    if (text.startsWith('//')) cls = 'text-stone-500 italic';
    else if (text.startsWith('"') || text.startsWith("'") || text.startsWith('`'))
      cls = 'text-emerald-300';
    else if (/^\d/.test(text)) cls = 'text-amber-300';
    else if (
      /^(document|console|fetch|Promise|localStorage|JSON|Math|Array|Set|Map|Number|String)$/.test(
        text
      )
    )
      cls = 'text-sky-300';
    else cls = 'text-violet-300 font-semibold';

    tokens.push(
      <span key={k++} className={cls}>
        {text}
      </span>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push(
      <span key={k++} className="text-stone-100">
        {line.slice(lastIndex)}
      </span>
    );
  }
  return tokens.length > 0 ? tokens : [<span key={0}>&nbsp;</span>];
}

export const CodeAltarModal: React.FC<CodeAltarModalProps> = ({
  altar,
  castleId,
  isBossRoom,
  onClose,
  onOpenGrimoire,
}) => {
  const {
    save,
    saveAltarCode,
    unlockHintTier,
    spendResourceOrBlood,
    damagePlayer,
    consumeSyntaxShield,
    consumeOracleScroll,
    useQuickItem,
    recordAttempt,
    markAltarSolved,
    notify,
  } = useGameStore();

  const heroClass = getHeroClass(save.classId);
  const isMana = heroClass.resourceType === 'mana';
  const alreadySolved = save.solvedAltars.includes(altar.id);

  const adapted = useMemo(
    () => adaptChallengeForClass(altar.challenge, save.classId),
    [altar.challenge, save.classId]
  );

  const [code, setCode] = useState<string>(
    () => save.savedCode[altar.id] ?? adapted.starterCode
  );
  const [running, setRunning] = useState(false);
  const [execResult, setExecResult] = useState<SandboxExecutionResult | null>(null);
  const [counterattackBanner, setCounterattackBanner] = useState<string | null>(null);
  const [pendingBloodPact, setPendingBloodPact] = useState<{
    kind: 'run' | 'hint';
    hpCost: number;
    resourceCost: number;
  } | null>(null);
  const [rightTab, setRightTab] = useState<'tests' | 'mirror'>(
    altar.challenge.mode === 'dom' ? 'mirror' : 'tests'
  );
  const [showInitialHtml, setShowInitialHtml] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const domPreviewRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const highlightRef = useRef<HTMLPreElement | null>(null);

  const unlockedHintCount = save.unlockedHints[altar.id] ?? 0;

  // Initialize Espejo Arcano HTML preview when modal opens
  useEffect(() => {
    if (altar.challenge.mode === 'dom' && domPreviewRef.current) {
      domPreviewRef.current.innerHTML = altar.challenge.initialHtml ?? '';
    }
  }, [altar.id, altar.challenge.mode, altar.challenge.initialHtml]);

  // Persist user code changes smoothly
  useEffect(() => {
    const t = window.setTimeout(() => {
      saveAltarCode(altar.id, code);
    }, 280);
    return () => window.clearTimeout(t);
  }, [altar.id, code, saveAltarCode]);

  const handleCodeChange = (val: string) => {
    setCode(val);
    const el = textareaRef.current;
    if (!el) return;
    const cursor = el.selectionStart;
    const prefix = val.slice(0, cursor);
    const wordMatch = prefix.match(/([a-zA-Z0-9_.]{2,})$/);
    if (wordMatch) {
      const term = wordMatch[1].toLowerCase();
      const hits = JS_AUTOCOMPLETE.filter(
        (s) => s.toLowerCase().startsWith(term) && s.toLowerCase() !== term
      ).slice(0, 5);
      setSuggestions(hits);
    } else {
      setSuggestions([]);
    }
  };

  const applySuggestion = (sugg: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const cursor = el.selectionStart;
    const before = code.slice(0, cursor);
    const after = code.slice(cursor);
    const replaced = before.replace(/([a-zA-Z0-9_.]{2,})$/, sugg);
    setCode(replaced + after);
    setSuggestions([]);
    window.requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(replaced.length, replaced.length);
    });
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = code.slice(0, start) + '  ' + code.slice(end);
      setCode(next);
      window.requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      requestRunCode();
    } else if (e.key === 'Escape') {
      setSuggestions([]);
    }
  };

  const executeCodeNow = async (resourceSpent: number, hpSacrificed: number) => {
    setPendingBloodPact(null);
    setCounterattackBanner(null);

    if (hpSacrificed > 0) {
      soundEngine.play('bloodPact');
    }
    const spendRes = spendResourceOrBlood(resourceSpent, hpSacrificed);
    if (spendRes.died) {
      soundEngine.play('damage');
      onClose();
      return;
    }

    setRunning(true);
    const result = await executeChallengeCode({
      userCode: code,
      adapted,
      classId: save.classId,
      domContainer: altar.challenge.mode === 'dom' ? domPreviewRef.current : null,
    });
    setRunning(false);
    setExecResult(result);
    recordAttempt(result.success);

    if (result.success) {
      markAltarSolved(altar.id, altar.challenge.xpReward, altar.challenge.goldReward);
      notify(
        alreadySolved
          ? '¡Altar verificado nuevamente con éxito!'
          : `¡Altar superado! +${altar.challenge.xpReward} XP · +${altar.challenge.goldReward} Oro`,
        'success'
      );
    } else {
      soundEngine.play('codeError');
      const { damage, shieldConsumed } = calculateCounterattackDamage(
        castleId,
        isBossRoom,
        save.syntaxShieldActive
      );
      if (shieldConsumed) consumeSyntaxShield();
      const dmgRes = damagePlayer(damage);
      setCounterattackBanner(
        shieldConsumed
          ? `¡Contraataque mitigado por Amuleto de Sintaxis! Perdiste solo ${damage} HP.`
          : `¡Contraataque del guardián! Tu error abrió una brecha y perdiste ${damage} HP.`
      );
      if (dmgRes.died) {
        window.setTimeout(() => onClose(), 750);
      }
    }
  };

  const requestRunCode = () => {
    if (running) return;
    const outcome = calculateActionCost(save.resource, save.hp, heroClass.castCost);
    if (outcome.usedBloodPact) {
      setPendingBloodPact({
        kind: 'run',
        hpCost: outcome.hpSacrificed,
        resourceCost: outcome.resourceSpent,
      });
      return;
    }
    executeCodeNow(outcome.resourceSpent, 0);
  };

  const unlockNextHintNow = (resourceSpent: number, hpSacrificed: number) => {
    setPendingBloodPact(null);
    if (hpSacrificed > 0) {
      soundEngine.play('bloodPact');
    } else {
      soundEngine.play('openAltar');
    }
    const spendRes = spendResourceOrBlood(resourceSpent, hpSacrificed);
    if (spendRes.died) {
      onClose();
      return;
    }
    unlockHintTier(altar.id, unlockedHintCount + 1);
  };

  const requestOracleHint = () => {
    if (unlockedHintCount >= 3) return;
    // Free Oracle Scroll priority
    if (save.inventory.oracle_scroll > 0) {
      const ok = consumeOracleScroll();
      if (ok) {
        unlockHintTier(altar.id, unlockedHintCount + 1);
        return;
      }
    }
    const cost = getHintCost(save.classId, unlockedHintCount);
    const outcome = calculateActionCost(save.resource, save.hp, cost);
    if (outcome.usedBloodPact) {
      setPendingBloodPact({
        kind: 'hint',
        hpCost: outcome.hpSacrificed,
        resourceCost: outcome.resourceSpent,
      });
      return;
    }
    unlockNextHintNow(outcome.resourceSpent, 0);
  };

  const handleResetCode = () => {
    soundEngine.play('click');
    setCode(adapted.starterCode);
    setExecResult(null);
    setCounterattackBanner(null);
    if (altar.challenge.mode === 'dom' && domPreviewRef.current) {
      domPreviewRef.current.innerHTML = altar.challenge.initialHtml ?? '';
    }
  };

  const lines = code.split('\n');
  const nextHintCost = getHintCost(save.classId, unlockedHintCount);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Altar de Código: ${altar.challenge.title}`}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-3 sm:p-5"
    >
      <div className="pixel-panel-warm flex h-full max-h-[880px] w-full max-w-[1380px] flex-col overflow-hidden text-stone-100">
        {/* Top Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#4d3d66] bg-[#161124] px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-amber-500/80 bg-[#2b1f3b] text-amber-300">
              <Terminal className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-code text-xs text-amber-300">
                <span>
                  {altar.challenge.mode === 'dom'
                    ? 'Altar Dual · Espejo Arcano DOM'
                    : 'Altar Rúnico · Consola Lógica'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{heroClass.name}</span>
                {alreadySolved && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-300 font-bold">COMPLETADO</span>
                  </>
                )}
              </div>
              <h2 className="font-display text-lg font-bold text-amber-100 truncate">
                {altar.challenge.title}
              </h2>
            </div>
          </div>

          {/* Live HP / Resource + Quick Potions + Close */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-3 border border-[#3e3254] bg-[#100d1a] px-3 py-1.5 font-code text-xs tabular-nums">
              <span className="text-rose-400 font-bold">
                HP {Math.round(save.hp)}/{Math.round(save.maxHp)}
              </span>
              <span aria-hidden="true" className="text-stone-600">
                |
              </span>
              <span
                className={`font-bold ${isMana ? 'text-sky-400' : 'text-amber-400'}`}
              >
                {heroClass.resourceLabel} {Math.round(save.resource)}/
                {Math.round(save.maxResource)}
              </span>
              {save.syntaxShieldActive && (
                <span className="flex items-center gap-1 text-cyan-300">
                  <Shield className="h-3.5 w-3.5" />
                  Escudo
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => useQuickItem('dragon_potion')}
              disabled={save.inventory.dragon_potion <= 0 || save.hp >= save.maxHp}
              className="pixel-btn bg-[#2a151c] border-rose-500/70 px-2.5 py-1.5 font-code text-xs text-rose-200 disabled:opacity-40 whitespace-nowrap"
            >
              +HP ({save.inventory.dragon_potion})
            </button>
            <button
              type="button"
              onClick={() => useQuickItem('ether_elixir')}
              disabled={
                save.inventory.ether_elixir <= 0 || save.resource >= save.maxResource
              }
              className="pixel-btn bg-[#142038] border-sky-500/70 px-2.5 py-1.5 font-code text-xs text-sky-200 disabled:opacity-40 whitespace-nowrap"
            >
              +{isMana ? 'MP' : 'EP'} ({save.inventory.ether_elixir})
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.play('click');
                onOpenGrimoire();
              }}
              className="pixel-btn flex items-center gap-1.5 bg-[#231b3d] border-violet-400/70 px-3 py-1.5 font-code text-xs text-violet-100 whitespace-nowrap"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Grimorio</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar Altar de Código"
              className="pixel-btn flex h-8 w-8 items-center justify-center bg-[#281d33] text-stone-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Blood Pact Voluntary HP Sacrifice Confirmation Banner */}
        {pendingBloodPact && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-rose-500 bg-[#36111a] px-4 py-3 font-code text-xs text-rose-100"
          >
            <div className="flex items-center gap-2.5">
              <Flame className="h-5 w-5 shrink-0 text-rose-400" />
              <span>
                <strong>¡Sin {heroClass.resourceLabel} suficiente!</strong> Pacto de Sangre:
                ¿Forzar{' '}
                {pendingBloodPact.kind === 'run'
                  ? 'la ejecución del código'
                  : 'la consulta al Oráculo'}{' '}
                sacrificando <strong className="text-amber-300">{pendingBloodPact.hpCost} HP</strong>?
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (pendingBloodPact.kind === 'run') {
                    executeCodeNow(pendingBloodPact.resourceCost, pendingBloodPact.hpCost);
                  } else {
                    unlockNextHintNow(pendingBloodPact.resourceCost, pendingBloodPact.hpCost);
                  }
                }}
                className="pixel-btn bg-rose-700 border-rose-300 px-3.5 py-1.5 font-bold text-white whitespace-nowrap"
              >
                Sacrificar {pendingBloodPact.hpCost} HP
              </button>
              <button
                type="button"
                onClick={() => setPendingBloodPact(null)}
                className="pixel-btn bg-[#241c30] px-3 py-1.5 text-stone-200 whitespace-nowrap"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* 3-Panel Altar Workspace */}
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
          {/* LEFT PANEL: Mission, Class Directive & Oracle Hints */}
          <aside className="flex flex-col gap-4 overflow-y-auto border-b-2 lg:border-b-0 lg:border-r-2 border-[#3b3052] bg-[#141020] p-4 lg:col-span-3">
            <div>
              <h3 className="font-code text-xs font-bold text-amber-300">
                Crónica del Obstáculo
              </h3>
              <p className="mt-1.5 text-lg leading-snug text-stone-300">
                {altar.challenge.lore}
              </p>
            </div>

            <div className="border-t border-[#2e2542] pt-3">
              <h3 className="font-code text-xs font-bold text-sky-300">
                Especificación Técnica
              </h3>
              <p className="mt-1.5 font-code text-xs leading-relaxed text-stone-100">
                {adapted.missionSpec}
              </p>
            </div>

            <div className="border border-[#43365e] bg-[#1a152b] p-3 font-code text-[11px] text-amber-200 leading-relaxed">
              <strong>Adaptación de Clase ({heroClass.name}):</strong>{' '}
              {adapted.classDirective}
            </div>

            <div className="border-t border-[#2e2542] pt-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="flex items-center gap-1.5 font-code text-xs font-bold text-violet-300">
                  <HelpCircle className="h-4 w-4" />
                  <span>Oráculo ({unlockedHintCount}/3)</span>
                </h3>
                {save.inventory.oracle_scroll > 0 && (
                  <span className="flex items-center gap-1 font-code text-[11px] text-amber-300">
                    <ScrollText className="h-3.5 w-3.5" />
                    {save.inventory.oracle_scroll} Pergamino(s)
                  </span>
                )}
              </div>

              {unlockedHintCount > 0 ? (
                <div className="space-y-2 mb-3">
                  {adapted.hints.slice(0, unlockedHintCount).map((h, i) => (
                    <div
                      key={i}
                      className="border border-violet-500/40 bg-[#1c1530] p-2.5 font-code text-[11px] leading-relaxed text-violet-100"
                    >
                      <span className="font-bold text-amber-300">Pista {i + 1}:</span> {h}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mb-3 text-base text-stone-400">
                  ¿Atascado? Consulta al Oráculo para revelar pistas progresivas hasta la solución guiada.
                </p>
              )}

              {unlockedHintCount < 3 && (
                <button
                  type="button"
                  onClick={requestOracleHint}
                  className="pixel-btn w-full bg-[#2b1e45] border-violet-400/70 px-3 py-2 font-code text-xs text-violet-100"
                >
                  {save.inventory.oracle_scroll > 0
                    ? `Revelar Pista ${unlockedHintCount + 1} (Gratis · Pergamino)`
                    : `Consultar Pista ${unlockedHintCount + 1} (-${nextHintCost} ${heroClass.resourceLabel})`}
                </button>
              )}
            </div>

            <div className="mt-auto border-t border-[#2e2542] pt-3 font-code text-[11px] text-stone-400">
              Recompensa: <span className="text-violet-300">+{altar.challenge.xpReward} XP</span> ·{' '}
              <span className="text-amber-300">+{altar.challenge.goldReward} Oro</span>
              <div className="mt-1 text-emerald-300/90">Efecto: {altar.unlocksText}</div>
            </div>
          </aside>

          {/* CENTER PANEL: Syntax-Highlighted Code Editor */}
          <section className="flex min-h-[340px] flex-col border-b-2 lg:border-b-0 lg:border-r-2 border-[#3b3052] bg-[#0e0b16] lg:col-span-5">
            <div className="flex items-center justify-between border-b border-[#2c2440] bg-[#151124] px-3 py-2 font-code text-xs text-stone-300">
              <span>pergamino.js (Ctrl+Enter para ejecutar)</span>
              <button
                type="button"
                onClick={handleResetCode}
                className="flex items-center gap-1 text-stone-400 hover:text-amber-200 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reiniciar Pergamino</span>
              </button>
            </div>

            {/* Editor viewport with line numbers & synchronized syntax overlay */}
            <div className="relative flex min-h-0 flex-1 overflow-hidden">
              {/* Line Numbers Gutter */}
              <div
                aria-hidden="true"
                className="w-10 shrink-0 select-none border-r border-[#272038] bg-[#110d1c] py-3 pr-2 text-right font-code text-xs leading-6 text-stone-500 tabular-nums"
              >
                {lines.map((_, idx) => (
                  <div key={idx}>{idx + 1}</div>
                ))}
              </div>

              {/* Synchronized Highlight Layer + Editable Textarea */}
              <div className="relative flex-1 overflow-hidden">
                <pre
                  ref={highlightRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre-wrap break-words p-3 font-code text-xs leading-6"
                >
                  {lines.map((line, i) => (
                    <div key={i}>{highlightJsLine(line)}</div>
                  ))}
                </pre>
                <textarea
                  ref={textareaRef}
                  aria-label="Editor de código JavaScript"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyDown={handleEditorKeyDown}
                  onScroll={(e) => {
                    if (highlightRef.current) {
                      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
                      highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
                    }
                  }}
                  className="relative h-full w-full resize-none bg-transparent p-3 font-code text-xs leading-6 text-transparent caret-amber-300 focus:outline-none whitespace-pre-wrap break-words overflow-y-auto"
                />

                {/* Lightweight Autocomplete Bar */}
                {suggestions.length > 0 && (
                  <div className="absolute bottom-2 left-2 right-2 z-10 flex flex-wrap gap-1 border border-[#4c3e6b] bg-[#181329] p-1.5">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => applySuggestion(s)}
                        className="border border-[#3b3054] bg-[#241c3b] px-2 py-0.5 font-code text-[11px] text-sky-200 hover:border-amber-400"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Editor Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#2c2440] bg-[#151124] px-3 py-2.5">
              <button
                type="button"
                disabled={running}
                onClick={requestRunCode}
                className="pixel-btn flex items-center gap-2 bg-[#d97706] border-amber-300 px-4 py-2 font-code text-xs font-bold text-[#190f03] whitespace-nowrap disabled:opacity-50"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>
                  {running
                    ? 'Evaluando...'
                    : `Ejecutar Código (-${heroClass.castCost} ${heroClass.resourceLabel})`}
                </span>
              </button>

              {execResult?.success && (
                <button
                  type="button"
                  onClick={onClose}
                  className="pixel-btn flex items-center gap-1.5 bg-emerald-600 border-emerald-300 px-4 py-2 font-code text-xs font-bold text-white whitespace-nowrap"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Continuar en el Castillo</span>
                </button>
              )}
            </div>
          </section>

          {/* RIGHT PANEL: Dual Console + Espejo Arcano DOM */}
          <section className="flex min-h-[280px] flex-col overflow-hidden bg-[#120e1c] lg:col-span-4">
            {/* Mode Tabs when Espejo Arcano DOM is active */}
            <div className="flex items-center justify-between border-b border-[#2c2440] bg-[#171226] px-3 py-2">
              <div className="flex items-center gap-1.5">
                {altar.challenge.mode === 'dom' && (
                  <button
                    type="button"
                    onClick={() => setRightTab('mirror')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 font-code text-xs border ${
                      rightTab === 'mirror'
                        ? 'bg-[#2a2042] border-amber-400 text-amber-100'
                        : 'border-transparent text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Espejo Arcano DOM</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setRightTab('tests')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 font-code text-xs border ${
                    rightTab === 'tests'
                      ? 'bg-[#2a2042] border-amber-400 text-amber-100'
                      : 'border-transparent text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Pruebas y Consola</span>
                </button>
              </div>
              {altar.challenge.mode === 'dom' && rightTab === 'mirror' && (
                <button
                  type="button"
                  onClick={() => setShowInitialHtml((v) => !v)}
                  className="font-code text-[11px] text-sky-300 underline"
                >
                  {showInitialHtml ? 'Ocultar HTML' : 'Ver HTML'}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {/* Espejo Arcano Live DOM Preview (Castles 4-6) */}
              {altar.challenge.mode === 'dom' && (
                <div className={rightTab === 'mirror' ? 'block space-y-2.5' : 'hidden'}>
                  <div className="font-code text-[11px] text-stone-400">
                    Vista en vivo del DOM que manipula tu código JavaScript:
                  </div>
                  {altar.challenge.initialCss && (
                    <style>{`.espejo-arcano-scope { all: initial; display: block; font-family: 'JetBrains Mono', monospace; color: #f1f5f9; } .espejo-arcano-scope * { box-sizing: border-box; } ${altar.challenge.initialCss}`}</style>
                  )}
                  <div
                    ref={domPreviewRef}
                    data-testid="espejo-arcano-dom"
                    className="espejo-arcano-scope border-2 border-[#4f3f73] bg-[#0c0914] p-3 min-h-[120px]"
                  />
                  {showInitialHtml && altar.challenge.initialHtml && (
                    <pre className="overflow-x-auto border border-[#342a4d] bg-[#0b0812] p-2.5 font-code text-[11px] text-emerald-200">
                      {altar.challenge.initialHtml}
                    </pre>
                  )}
                </div>
              )}

              {/* Counterattack Banner */}
              {counterattackBanner && (
                <div className="flex items-start gap-2 border-2 border-rose-500/80 bg-[#30111a] p-2.5 font-code text-xs text-rose-100">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{counterattackBanner}</span>
                </div>
              )}

              {/* Success Celebration */}
              {execResult?.success && (
                <div className="border-2 border-emerald-500/80 bg-[#102b20] p-3 font-code text-xs text-emerald-100">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>¡Conjuro verificado! Runas del altar activadas.</span>
                  </div>
                  <p className="mt-1 text-stone-200">{altar.unlocksText}</p>
                </div>
              )}

              {/* Error Diagnostics (D&D Narrative + Technical Debug Tip) */}
              {execResult?.error && (
                <div className="space-y-2 border-2 border-rose-500/60 bg-[#241019] p-3 font-code text-xs">
                  <div className="font-bold text-rose-300">
                    {execResult.error.type}: {execResult.error.technicalMessage}
                  </div>
                  <p className="text-amber-200/90 italic">{execResult.error.rpgNarrative}</p>
                  <p className="text-stone-300">
                    <strong className="text-sky-300">Depuración:</strong>{' '}
                    {execResult.error.debugTip}
                  </p>
                </div>
              )}

              {/* Unit Tests Breakdown */}
              <div className="space-y-2">
                <div className="font-code text-xs font-bold text-stone-300">
                  Pruebas Unitarias ({adapted.testCases.length})
                </div>
                {execResult && execResult.results.length > 0 ? (
                  execResult.results.map((r) => (
                    <div
                      key={r.id}
                      className={`flex items-start gap-2 border p-2.5 font-code text-xs ${
                        r.passed
                          ? 'border-emerald-600/60 bg-[#11261d] text-emerald-100'
                          : 'border-rose-600/60 bg-[#29121a] text-rose-100'
                      }`}
                    >
                      {r.passed ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-[11px] opacity-85 mt-0.5">{r.message}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-1.5">
                    {adapted.testCases.map((tc) => (
                      <div
                        key={tc.id}
                        className="border border-[#2e2642] bg-[#171224] px-2.5 py-2 font-code text-[11px] text-stone-300"
                      >
                        • {tc.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Captured console.log output */}
              <div className="border-t border-[#2c2440] pt-2.5">
                <div className="font-code text-xs font-bold text-stone-400 mb-1.5">
                  Salida de consola (console.log)
                </div>
                <div className="min-h-[60px] border border-[#2a223d] bg-[#0a0811] p-2.5 font-code text-[11px] text-stone-300 space-y-1">
                  {execResult && execResult.logs.length > 0 ? (
                    execResult.logs.map((line, idx) => (
                      <div key={idx} className="text-sky-200">
                        &gt; {line}
                      </div>
                    ))
                  ) : (
                    <span className="text-stone-500">
                      Usa console.log() para depurar valores aquí.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
