# DESIGN.md — Huella Gráfica y Sistema de Estilos

Documentación visual y técnica del sistema de diseño de **Code & Dragons: Crónicas del Frontend**.

---

## 1. Dirección Estética

- **Concepto:** *Dark Fantasy* medieval en **Pixel Art (8-bit / 16-bit)** combinado con una interfaz de editor de código de alto contraste.
- **Principios visuales:**
  - Fondos nocturnos profundos (`#0d0b14`) que maximizan la legibilidad de textos en pergamino claro (`#ede7d9`) y resaltado de sintaxis.
  - Bordes rígidos de `2px` con biselado interior (`inset`) y sombras sólidas sin desenfoque (`0 4px 0 #09070f`) para simular paneles retro de RPG.
  - Renderizado estricto sin suavizado (`image-rendering: pixelated; crisp-edges`) en sprites y canvas.

---

## 2. Tipografía

Cargada desde Google Fonts en `index.html` y declarada en `:root` dentro de `src/index.css`:

| Variable CSS | Clase | Familia | Uso Principal |
| --- | --- | --- | --- |
| `--font-pixel` | `.font-pixel` | `'Press Start 2P', monospace` | Botones de acción principales, etiquetas retro y badges |
| `--font-retro` | `.font-retro` | `'VT323', monospace` | Tipografía base del documento (`body`) y narrativa RPG |
| `--font-display` | `.font-display` | `'Cinzel', Georgia, serif` | Títulos épicos, encabezados de castillos y modales |
| `--font-code` | `.font-code` | `'JetBrains Mono', ui-monospace, SFMono-Regular, monospace` | Editor de código, consola, pruebas unitarias y contadores (`tabular-nums`) |

---

## 3. Paleta de Colores Global

### Superficies y Bordes
| Token / Valor | Uso |
| --- | --- |
| `#0d0b14` | Fondo principal de la aplicación (`html`, `body`, `#root`) |
| `#0f0c18` | Fondo del Mapa del Reino (`WorldMap`) |
| `#141020` | Fondo de contenedores del HUD |
| `#161321` | Fondo de `.pixel-panel` |
| `#1b1623` | Fondo de `.pixel-panel-warm` |
| `#483d5e` | Borde estándar de `.pixel-panel` |
| `#8a6b3e` | Borde dorado cálido de `.pixel-panel-warm` |
| `#6b5882` | Borde base de `.pixel-btn` |
| `#09070f` | Sombra sólida de botones, paneles y texto HUD |
| `#ede7d9` | Color de texto base (pergamino claro) |
| `#f5b942` | Color de anillo de foco accesible (`:focus-visible`) |

### Estados, HUD y Notificaciones
| Elemento | Color | Detalle |
| --- | --- | --- |
| **Barra de HP** | `#dc2626` | Con barra fantasma retardada (`amber-300/80`) sobre `#241017` |
| **Barra de Maná** | `#2563eb` | Sobre fondo `#101626` y borde `#24304a` |
| **Barra de Energía** | `#d97706` | Sobre fondo `#101626` y borde `#24304a` |
| **Barra de XP** | `violet-400` | Sobre fondo `#221a36` |
| **Oro / Recompensas** | `amber-300` | Acentos y botones primarios (`#d97706` con texto `#190f04`) |
| **Toast `danger`** | `border-rose-400` / `bg-[#331018]` | Texto `text-rose-100` |
| **Toast `success`** | `border-emerald-400` / `bg-[#102b20]` | Texto `text-emerald-100` |
| **Toast `gold`** | `border-amber-400` / `bg-[#2d1f0d]` | Texto `text-amber-100` |
| **Toast `arcane`** | `border-violet-400` / `bg-[#1d1633]` | Texto `text-violet-100` |

### Resaltado de Sintaxis (`CodeAltarModal.tsx`)
| Token | Clase Tailwind |
| --- | --- |
| Comentarios (`// ...`) | `text-stone-500 italic` |
| Cadenas (`"..."`, `'...'`, `` `...` ``) | `text-emerald-300` |
| Números | `text-amber-300` |
| APIs / Globales (`document`, `console`, `fetch`, `Promise`, `localStorage`, `JSON`, `Math`, etc.) | `text-sky-300` |
| Palabras clave JS (`const`, `let`, `function`, `async`, `await`, etc.) | `text-violet-300 font-semibold` |
| Identificadores y operadores | `text-stone-100` |

---

## 4. Temas Cromáticos por Castillo (`CastleTheme`)

Cada castillo define su propia atmósfera en el Canvas 2D (cielo degradado, montañas parallax en 2 planos, plataformas y antorchas):

| Castillo | `skyTop` | `skyBottom` | `mountainFar` | `mountainNear` | `tileTop` | `tileBody` | `tileDark` | `accent` | `torchColor` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **1. Bastión de los Orígenes** | `#17132b` | `#2d2347` | `#221c38` | `#33294d` | `#7a6f99` | `#484061` | `#2c263d` | `#f59e0b` | `#fb923c` |
| **2. Fortaleza de los Ciclos** | `#0d1f1a` | `#1c3b31` | `#142b24` | `#214539` | `#4e8a74` | `#2d5446` | `#1b362d` | `#34d399` | `#4ade80` |
| **3. Ciudadela de las Estructuras** | `#161029` | `#2d1c52` | `#1f153b` | `#32225e` | `#8b6fd6` | `#4d3a80` | `#2c204d` | `#a78bfa` | `#c084fc` |
| **4. Torre del DOM y Eventos** | `#1b1024` | `#3c194a` | `#261433` | `#401e52` | `#b064d6` | `#5d3175` | `#331942` | `#e879f9` | `#f472b6` |
| **5. Santuario Asíncrono** | `#081826` | `#103552` | `#0c2338` | `#153b5c` | `#38bdf8` | `#1e547a` | `#0f2d45` | `#38bdf8` | `#7dd3fc` |
| **6. Trono del Arquitecto** | `#160d14` | `#331724` | `#211019` | `#3d1c2b` | `#eab308` | `#572838` | `#2b121b` | `#facc15` | `#fbbf24` |

---

## 5. Paletas de Clases de Héroe (`classesData.ts` & `pixelSprites.ts`)

| Clase | `accentColor` | Paleta de Sprite (Principal / Destello / Capa / Detalle) |
| --- | --- | --- |
| **Mago** | `#6378ff` | Túnica `#3b4cca` / `#6378ff`, capa `#252a6b`, oro `#f5c542`, orbe `#56e0ff` |
| **Guerrero** | `#e05848` | Acero `#9aa4b2` / `#d4dce6`, hierro `#565f6e`, penacho `#d9483b`, filo `#f5b942` |
| **Arquero** | `#4da374` | Capucha `#2d6e4e` / `#4da374`, capa `#1e4734`, arco `#d4a359`, flecha `#9be564` |
| **Bardo** | `#d95b96` | Jubón `#9d346a` / `#d95b96`, capa `#5b1e42`, laúd `#f6d06b`, aura `#6ee7d8` |
| **Paladín** | `#e2c979` | Placa `#e2c979` / `#fff3c4`, tabardo `#3b82f6`, acero `#4e5968`, escudo `#93c5fd` |
| **Pícaro** | `#a78bfa` | Capucha `#38364a` / `#656082`, capa `#22202e`, bufanda `#c83e4d`, daga `#a78bfa` |

---

## 6. Utilidades CSS y Comportamiento (`src/index.css`)

- **`.pixel-panel` / `.pixel-panel-warm`:** Paneles con borde de `2px`, bisel superior translúcido (`inset 0 2px 0`), sombra inferior interna (`inset 0 -2px 0`) y elevación sólida (`0 6px 0`).
- **`.pixel-btn`:** Botón táctil con transición rápida (`90ms`), brillo al `:hover` (`brightness(1.1)`), hundimiento físico al `:active` (`translateY(2px)` reduciendo la sombra inferior de `3px` a `1px`) y foco visible `#f5b942`.
- **`.pixelated`:** Fuerza `image-rendering: pixelated` y `crisp-edges`.
- **`.hud-text-shadow`:** Sombra dura `#09070f` para legibilidad sobre el canvas.
- **Scrollbar:** Barra personalizada de `8px` (`#100d18` track, `#3d3352` thumb, `#5c4d7a` hover).
- **Accesibilidad (`prefers-reduced-motion: reduce`):** Reduce todas las animaciones y transiciones a `0.01ms`.

---

## 7. Motor de Sprites Pixel Art (`src/assets/pixelSprites.ts`)

Todos los gráficos de personajes, enemigos, jefes y objetos se generan programáticamente desde matrices ASCII de `16×16` o `24×24` y se almacenan en caché en memoria (`spriteCache`) mediante `getSpriteCanvas(cacheKey, matrix, pixelScale, flipX, flashWhite)`:

- **Héroes (`getHeroSprite`):** 7 cuadros por clase (`idle1`, `idle2`, `walk1`, `walk2`, `jump`, `hurt`, `cast`), con soporte de espejo horizontal (`flipX`) y destello blanco de impacto (`flashWhite`).
- **Enemigos (`getEnemySprite`):** 2 cuadros animados para `patrol`, `orbiter`, `turret` y `charger`.
- **Jefes (`getBossSprite`):** 6 sprites dedicados (`boss_ignis`, `boss_ouroboros`, `boss_malakor`, `boss_aracne`, `boss_chronos`, `boss_lich`).
- **Props e Ítems (`getPropSprite`):** `altar_locked`, `altar_solved`, `bonfire1`, `bonfire2`, `chest_closed`, `chest_open`, `portal_locked`, `portal_open`, `dragon_potion`, `ether_elixir`, `oracle_scroll`, `syntax_amulet`.

---

## 8. Escena de Título y Audio 8-bit

- **`TitleScreen.tsx`:** Canvas a pantalla completa con cielo nocturno degradado (`#090712` → `#151026` → `#241838`), luna pixelada (`#fef3c7` / `#fde68a`), 60 estrellas parpadeantes, siluetas de castillos en desplazamiento lento, parapeto almenado, hoguera animada central, los 6 héroes flanqueándola y 34 partículas de brasas ascendentes.
- **`soundEngine.ts`:** Síntesis en tiempo real con osciladores (`square`, `triangle`, `sawtooth`, `sine`) y ruido blanco filtrado (`bandpass` a `900 Hz`) para 16 efectos (`jump`, `land`, `step`, `dash`, `openAltar`, `codeSuccess`, `codeError`, `damage`, `bloodPact`, `potion`, `buy`, `checkpoint`, `levelUp`, `bossHit`, `bossVictory`, `click`) más melodía en bucle en modo Dórico de Re (`240 ms` por paso).
