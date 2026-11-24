import { HeroClassId, SandboxExecutionResult, TestRunResult } from '../types/game';
import { AdaptedChallenge } from './gameRules';

const MAX_LOOP_STEPS = 25000;

/**
 * Injects an execution step guard into JS loops (for / while / do)
 * to protect the browser against infinite loops without freezing the UI thread.
 */
export function instrumentInfiniteLoopGuard(source: string): string {
  const guardCall = 'if(++__steps > ' + MAX_LOOP_STEPS + ') throw new Error("INFINITE_LOOP");';
  // Inject after `for (...) {`, `while (...) {`, `do {`
  return source
    .replace(/(for\s*\([^)]*\)\s*\{)/g, `$1 ${guardCall}`)
    .replace(/(while\s*\([^)]*\)\s*\{)/g, `$1 ${guardCall}`)
    .replace(/(do\s*\{)/g, `$1 ${guardCall}`);
}

/**
 * Translates JS runtime / syntax errors into both D&D narrative flavor
 * and clear technical debugging guidance.
 */
export function diagnoseJsError(err: unknown): {
  type: string;
  technicalMessage: string;
  rpgNarrative: string;
  debugTip: string;
} {
  const rawMessage = err instanceof Error ? err.message : String(err);
  const name = err instanceof Error ? err.name : 'Error';

  if (rawMessage.includes('INFINITE_LOOP')) {
    return {
      type: 'Bucle Infinito',
      technicalMessage: `Se superaron ${MAX_LOOP_STEPS} iteraciones sin condición de salida.`,
      rpgNarrative:
        '¡Ouroboros despertó en tu pergamino! El bucle jamás terminó y el altar disipó el conjuro para salvarte.',
      debugTip:
        'Revisa que tu contador (ej. i++) avance hacia la condición de parada en tus ciclos for/while.',
    };
  }

  if (name === 'SyntaxError') {
    return {
      type: 'SyntaxError',
      technicalMessage: rawMessage,
      rpgNarrative:
        'Las runas están mal trazadas: la gramática del hechizo colapsó antes de manifestarse.',
      debugTip:
        'Verifica llaves {}, paréntesis (), comillas sin cerrar o palabras clave mal escritas.',
    };
  }

  if (name === 'ReferenceError') {
    return {
      type: 'ReferenceError',
      technicalMessage: rawMessage,
      rpgNarrative:
        'Invocaste un nombre inexistente en el plano arcano; el altar rechazó el vínculo.',
      debugTip:
        'Asegúrate de haber declarado la variable o función con el nombre exacto (respeta mayúsculas y minúsculas).',
    };
  }

  if (name === 'TypeError') {
    return {
      type: 'TypeError',
      technicalMessage: rawMessage,
      rpgNarrative:
        'Intentaste forzar una esencia incompatible sobre un objeto o un valor nulo.',
      debugTip:
        'Comprueba que el valor no sea undefined o null antes de leer propiedades o llamar métodos.',
    };
  }

  return {
    type: name || 'Error',
    technicalMessage: rawMessage,
    rpgNarrative:
      'Una distorsión inesperada fracturó la energía del altar y el guardián contraatacó.',
    debugTip:
      'Usa console.log() para inspeccionar valores intermedios y verifica el tipo de retorno esperado.',
  };
}

/**
 * Mock Kingdom API interceptor for Castle 5 (El Santuario Asíncrono) & Castle 6.
 */
export function createKingdomMockFetch() {
  const endpoints: Record<string, { ok: boolean; status: number; data: unknown }> = {
    'https://api.reino.dev/hechizos': {
      ok: true,
      status: 200,
      data: [
        { id: 1, nombre: 'Bola de Fuego', elemento: 'fuego', costo: 15, poder: 45 },
        { id: 2, nombre: 'Escudo de Hielo', elemento: 'hielo', costo: 10, poder: 30 },
        { id: 3, nombre: 'Rayo Arcano', elemento: 'rayo', costo: 25, poder: 70 },
        { id: 4, nombre: 'Llama Fénix', elemento: 'fuego', costo: 30, poder: 90 },
      ],
    },
    'https://api.reino.dev/bestiario': {
      ok: true,
      status: 200,
      data: [
        { id: 'b1', nombre: 'Golem Ignis', peligro: 3, debilidad: 'hielo' },
        { id: 'b2', nombre: 'Serpiente Ouroboros', peligro: 4, debilidad: 'rayo' },
        { id: 'b3', nombre: 'Espectro Chronos', peligro: 5, debilidad: 'fuego' },
      ],
    },
    'https://api.reino.dev/pociones': {
      ok: true,
      status: 200,
      data: [
        { id: 'p1', nombre: 'Sangre de Dragón', curacion: 50, precio: 35 },
        { id: 'p2', nombre: 'Elixir de Éter', curacion: 50, precio: 30 },
      ],
    },
    'https://api.reino.dev/error': {
      ok: false,
      status: 503,
      data: { error: 'Portal sobrecargado por Chronos' },
    },
  };

  return async function mockFetch(url: string): Promise<{
    ok: boolean;
    status: number;
    json: () => Promise<unknown>;
    text: () => Promise<string>;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 25));
    const entry = endpoints[url];
    if (!entry) {
      return {
        ok: false,
        status: 404,
        json: async () => ({ error: `Endpoint no encontrado: ${url}` }),
        text: async () => `Not Found: ${url}`,
      };
    }
    return {
      ok: entry.ok,
      status: entry.status,
      json: async () => JSON.parse(JSON.stringify(entry.data)),
      text: async () => JSON.stringify(entry.data),
    };
  };
}

/**
 * Isolated in-memory localStorage mock so Castle 6 storage exercises never pollute the game's save.
 */
function createIsolatedStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => {
      map.set(String(k), String(v));
    },
    removeItem: (k: string) => {
      map.delete(String(k));
    },
    clear: () => {
      map.clear();
    },
    get length() {
      return map.size;
    },
    key: (i: number) => Array.from(map.keys())[i] ?? null,
  };
}

/**
 * Executes user JavaScript code safely inside an isolated sandbox with:
 * - Infinite loop instrumentation
 * - Console capture
 * - Optional Espejo Arcano DOM container (Castles 4-6)
 * - Mock fetch() API & isolated localStorage
 * - Class-specific code quality validation (e.g. Rogue refactor check)
 */
export async function executeChallengeCode(params: {
  userCode: string;
  adapted: AdaptedChallenge;
  classId: HeroClassId;
  domContainer?: HTMLElement | null;
}): Promise<SandboxExecutionResult> {
  const { userCode, adapted, domContainer } = params;
  const logs: string[] = [];

  const capturedConsole = {
    log: (...args: unknown[]) => {
      logs.push(
        args
          .map((a) =>
            typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)
          )
          .join(' ')
      );
    },
    warn: (...args: unknown[]) => {
      logs.push('[WARN] ' + args.map(String).join(' '));
    },
    error: (...args: unknown[]) => {
      logs.push('[ERROR] ' + args.map(String).join(' '));
    },
  };

  // Class-specific static code rule check (e.g., Pícaro refactor discipline)
  if (adapted.codeCheckPattern) {
    if (adapted.codeCheckPattern.forbidRegex) {
      const rx = new RegExp(adapted.codeCheckPattern.forbidRegex);
      if (rx.test(userCode)) {
        return {
          success: false,
          logs,
          results: [
            {
              id: 'class_rule',
              name: 'Disciplina de Clase (Código Limpio)',
              passed: false,
              message:
                adapted.codeCheckPattern.forbidReason ??
                'Tu código contiene un patrón prohibido para tu clase.',
            },
          ],
          error: {
            type: 'Regla de Clase',
            technicalMessage:
              adapted.codeCheckPattern.forbidReason ?? 'Patrón no permitido.',
            rpgNarrative:
              'Tu código funcionaría, pero viola el código de honor de tu clase.',
            debugTip:
              adapted.codeCheckPattern.forbidReason ?? 'Refactoriza el código antes de reintentar.',
          },
        };
      }
    }
    if (adapted.codeCheckPattern.requireRegex) {
      const rx = new RegExp(adapted.codeCheckPattern.requireRegex);
      if (!rx.test(userCode)) {
        return {
          success: false,
          logs,
          results: [
            {
              id: 'class_rule_req',
              name: 'Disciplina de Clase (Técnica Requerida)',
              passed: false,
              message:
                adapted.codeCheckPattern.requireReason ??
                'Debes emplear la técnica requerida por tu clase.',
            },
          ],
          error: {
            type: 'Regla de Clase',
            technicalMessage:
              adapted.codeCheckPattern.requireReason ?? 'Técnica requerida no detectada.',
            rpgNarrative:
              'El altar exige que demuestres la técnica característica de tu especialidad.',
            debugTip:
              adapted.codeCheckPattern.requireReason ?? 'Revisa las instrucciones de tu clase.',
          },
        };
      }
    }
  }

  // Prepare DOM sandbox if mode === 'dom'
  let sandboxRoot: HTMLElement | null = null;
  if (adapted.challenge.mode === 'dom') {
    if (domContainer) {
      domContainer.innerHTML = adapted.challenge.initialHtml ?? '';
      sandboxRoot = domContainer;
    } else if (typeof document !== 'undefined') {
      sandboxRoot = document.createElement('div');
      sandboxRoot.innerHTML = adapted.challenge.initialHtml ?? '';
    }
  }

  // Scoped document facade so user code calling document.querySelector targets the Espejo Arcano safely
  const scopedDocument = sandboxRoot
    ? {
        querySelector: (sel: string) => sandboxRoot!.querySelector(sel),
        querySelectorAll: (sel: string) => sandboxRoot!.querySelectorAll(sel),
        getElementById: (id: string) => sandboxRoot!.querySelector(`#${CSS.escape(id)}`),
        createElement: (tag: string) => document.createElement(tag),
        createDocumentFragment: () => document.createDocumentFragment(),
        body: sandboxRoot,
      }
    : typeof document !== 'undefined'
      ? document
      : undefined;

  const mockFetch = createKingdomMockFetch();
  const isolatedStorage = createIsolatedStorage();
  const guardedUserCode = instrumentInfiniteLoopGuard(userCode);

  const testDescriptors = adapted.testCases.map((tc) => ({
    id: tc.id,
    name: tc.name,
    validateSource: tc.validateSource,
    expectedDesc: tc.expectedDesc,
    isEdgeCase: Boolean(tc.isPaladinEdgeCase),
  }));

  // Build async runner that defines user code at top-level scope so const/let/function/class are all visible to tests
  const runnerBody = `
    let __steps = 0;
    const __results = [];
    ${guardedUserCode}
    for (const __tc of __tests) {
      try {
        const __passed = await (async () => {
          return eval(__tc.validateSource);
        })();
        __results.push({
          id: __tc.id,
          name: __tc.name,
          passed: Boolean(__passed),
          message: __passed ? 'Prueba superada' : 'Falló: ' + __tc.expectedDesc,
          isEdgeCase: __tc.isEdgeCase,
        });
      } catch (err) {
        __results.push({
          id: __tc.id,
          name: __tc.name,
          passed: false,
          message: 'Error en prueba: ' + (err && err.message ? err.message : String(err)),
          isEdgeCase: __tc.isEdgeCase,
        });
      }
    }
    return { __results };
  `;

  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
      ...args: string[]
    ) => (
      console: typeof capturedConsole,
      document: typeof scopedDocument,
      fetch: typeof mockFetch,
      localStorage: typeof isolatedStorage,
      __tests: typeof testDescriptors
    ) => Promise<{ __results?: TestRunResult[]; __compileOrRuntimeError?: unknown }>;

    const runner = new AsyncFunction(
      'console',
      'document',
      'fetch',
      'localStorage',
      '__tests',
      runnerBody
    );

    const execPromise = runner(
      capturedConsole,
      scopedDocument,
      mockFetch,
      isolatedStorage,
      testDescriptors
    );

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('INFINITE_LOOP')), 3000);
    });

    const outcome = await Promise.race([execPromise, timeoutPromise]);

    if (outcome.__compileOrRuntimeError) {
      const diagnosed = diagnoseJsError(outcome.__compileOrRuntimeError);
      return {
        success: false,
        logs,
        results: [],
        error: diagnosed,
        finalDomHtml: sandboxRoot?.innerHTML,
      };
    }

    const results = outcome.__results ?? [];
    const allPassed = results.length > 0 && results.every((r) => r.passed);

    if (!allPassed) {
      const firstFailed = results.find((r) => !r.passed);
      return {
        success: false,
        logs,
        results,
        error: {
          type: 'Test Fallido',
          technicalMessage: firstFailed?.message ?? 'Uno o más tests no pasaron.',
          rpgNarrative:
            'El hechizo se ejecutó, pero su efecto no cumplió las runas del altar. El guardián aprovecha la brecha para contraatacar.',
          debugTip:
            'Revisa cada test en rojo a la derecha y usa console.log() para comparar tu resultado con lo esperado.',
        },
        finalDomHtml: sandboxRoot?.innerHTML,
      };
    }

    return {
      success: true,
      logs,
      results,
      finalDomHtml: sandboxRoot?.innerHTML,
    };
  } catch (err) {
    const diagnosed = diagnoseJsError(err);
    return {
      success: false,
      logs,
      results: [],
      error: diagnosed,
      finalDomHtml: sandboxRoot?.innerHTML,
    };
  }
}
