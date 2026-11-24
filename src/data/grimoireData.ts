import { GrimoirePage } from '../types/game';

export const GRIMOIRE_PAGES: GrimoirePage[] = [
  // ===================== CASTILLO 1: FUNDAMENTOS JS =====================
  {
    id: 'c1_r1',
    castleId: 1,
    roomIndex: 0,
    title: 'Variables, Tipos Primitivos y Template Literals',
    summary:
      'En JavaScript moderno usamos const para valores inmutables y let cuando la variable debe reasignarse. Evita var. Los tipos primitivos esenciales son string, number, boolean, null y undefined.',
    syntaxCode: `const heroe = "Lyra";
let nivel = 1;
const esMago = true;
const saludo = \`\${heroe} alcanza el nivel \${nivel}\`;`,
    keyPoints: [
      'Usa const por defecto y let solo si el valor cambiará.',
      'Los template literals con comillas invertidas (`) permiten interpolar con ${expresion}.',
      'typeof permite inspeccionar el tipo de un valor en tiempo de ejecución.',
    ],
    classTips: {
      mage: 'Lee las líneas comentadas paso a paso antes de rellenar los retornos.',
      warrior: 'Declara tus contadores con let para acumular daño en cada golpe.',
      archer: 'Asegúrate de usar nombres exactos y tipos precisos en tus expresiones.',
      bard: 'Los template literals serán tu herramienta clave al construir textos para la UI.',
      paladin: 'Comprueba siempre si un parámetro llega como null o undefined antes de operarlo.',
      rogue: 'Elimina cualquier declaración var obsoleta y prefiere const siempre que no reasignes.',
    },
  },
  {
    id: 'c1_r2',
    castleId: 1,
    roomIndex: 1,
    title: 'Comparación Estricta (===) y Lógica Booleana',
    summary:
      'El operador === compara valor y tipo sin coerción peligrosa (a diferencia de ==). Combina condiciones con && (Y), || (O) y ! (NO).',
    syntaxCode: `const puedeAbrir = tieneLlave === true && mana >= 15;
const estado = hp > 0 ? "Activo" : "Caído";
const nombre = input || "Aventurero";`,
    keyPoints: [
      'Prefiere siempre === y !== frente a == y !=.',
      'El operador ternario (condicion ? a : b) simplifica decisiones binarias.',
      'El cortocircuito lógico (&& y ||) evalúa de izquierda a derecha.',
    ],
    classTips: {
      mage: 'Divide condiciones complejas en variables booleanas con nombres claros.',
      warrior: 'Compara umbrales de HP y armadura con >= y <= para resistir trampas.',
      archer: 'Encadena && con precisión para filtrar solo los objetivos exactos.',
      bard: 'Usa ternarios para elegir entre clases CSS o mensajes de estado.',
      paladin: 'Valida tipos explícitamente (typeof x === "number") para bloquear datos corruptos.',
      rogue: 'Retorna directamente la expresión booleana en lugar de if (cond) return true; else return false;.',
    },
  },
  {
    id: 'c1_r3',
    castleId: 1,
    roomIndex: 2,
    title: 'Condicionales if / else if y switch',
    summary:
      'Controla las ramas de ejecución evaluando rangos con if/else if o múltiples valores discretos con switch y break.',
    syntaxCode: `function evaluarRango(puntos) {
  if (puntos >= 90) return "Legendario";
  if (puntos >= 60) return "Veterano";
  return "Aprendiz";
}`,
    keyPoints: [
      'El patrón de retorno temprano (early return) evita anidación excesiva.',
      'En switch, incluye siempre break (o return) para evitar fall-through.',
      'Incluye una rama default o else para cubrir casos inesperados.',
    ],
    classTips: {
      mage: 'Revisa el orden de las condiciones: evalúa primero los valores más altos.',
      warrior: 'Las guardas directas hacen tu código robusto y fácil de depurar.',
      archer: 'Usa switch para mapear comandos o categorías con precisión quirúrgica.',
      bard: 'Mapea estados de interfaz (idle, loading, error) a mensajes claros para el usuario.',
      paladin: 'Agrega guard clauses al principio de la función para valores nulos o negativos.',
      rogue: 'Sustituye cadenas largas de if/else por mapas de objetos o retornos tempranos.',
    },
  },
  {
    id: 'c1_r4',
    castleId: 1,
    roomIndex: 3,
    title: 'Maestría del Bastión: Diagnóstico de Tipos',
    summary:
      'Para vencer a Ignis, combina validación de tipos primitivos, lógica booleana y retornos exactos sin coerciones accidentales.',
    syntaxCode: `function verificarRuna(valor) {
  if (typeof valor !== "number" || Number.isNaN(valor)) return "Inválido";
  return valor > 0 ? "Fuego" : "Ceniza";
}`,
    keyPoints: [
      'Number.isNaN(x) detecta valores NaN con seguridad.',
      'typeof null devuelve "object" por legado histórico de JS: compruébalo con x === null.',
      'Mantén las funciones puras devolviendo un valor en todas las ramas.',
    ],
    classTips: {
      mage: 'Usa console.log para ver qué recibe cada test del jefe.',
      warrior: 'Verifica paso a paso cada condición antes de lanzar el ataque.',
      archer: 'Cada fase del jefe exige un tipo de retorno exacto; respeta mayúsculas.',
      bard: 'Devuelve siempre etiquetas claras y consistentes.',
      paladin: 'Prueba mentalmente null, undefined, "" y 0 antes de ejecutar.',
      rogue: 'Compacta las comprobaciones en guardas limpias sin código muerto.',
    },
  },

  // ===================== CASTILLO 2: CICLOS Y FUNCIONES =====================
  {
    id: 'c2_r1',
    castleId: 2,
    roomIndex: 0,
    title: 'Bucles for, while y for...of',
    summary:
      'Los bucles repiten bloques de instrucciones. Asegúrate siempre de actualizar la condición de salida para no invocar a Ouroboros (el bucle infinito).',
    syntaxCode: `let suma = 0;
for (let i = 1; i <= 5; i++) {
  suma += i;
}
for (const gema of [10, 20, 30]) {
  suma += gema;
}`,
    keyPoints: [
      'for clásico controla índices exactos (i = 0; i < n; i++).',
      'for...of recorre directamente los valores de cualquier iterable (arrays, strings).',
      'break detiene el bucle inmediatamente; continue salta a la siguiente iteración.',
    ],
    classTips: {
      mage: 'Inicializa el acumulador fuera del bucle y retorna el resultado después de cerrarlo.',
      warrior: 'El bucle for clásico es tu arma natural: domina i++, acumulador += valor.',
      archer: 'Usa break apenas encuentres el primer objetivo que cumpla tu criterio.',
      bard: 'for...of hace muy legible la generación de listas de elementos.',
      paladin: 'Comprueba que el arreglo no esté vacío ni sea nulo antes de iterar.',
      rogue: 'Evita recalcular .length innecesariamente o repetir recorridos sobre el mismo array.',
    },
  },
  {
    id: 'c2_r2',
    castleId: 2,
    roomIndex: 1,
    title: 'Funciones Declarativas, Arrow Functions y Parámetros por Defecto',
    summary:
      'Las funciones encapsulan lógica reutilizable. Las arrow functions (=>) ofrecen sintaxis concisa y retorno implícito en una sola expresión.',
    syntaxCode: `const calcularDano = (base, multiplicador = 1) => base * multiplicador;

function crearTitulo(nombre, rango = "Novato") {
  return \`\${rango} \${nombre}\`;
}`,
    keyPoints: [
      'Los parámetros por defecto se aplican cuando el argumento es undefined.',
      'Sin llaves {}, una arrow function retorna automáticamente la expresión.',
      'Si olvidas return en una función con llaves, devolverá undefined.',
    ],
    classTips: {
      mage: 'Comprueba que tu función tenga exactamente el nombre pedido en la misión.',
      warrior: 'Usa parámetros por defecto para valores base de ataque y defensa.',
      archer: 'Las arrow functions brillan dentro de callbacks de búsqueda y filtrado.',
      bard: 'Mantén tus funciones pequeñas y con una sola responsabilidad.',
      paladin: 'Recuerda que un parámetro por defecto solo cubre undefined, no null.',
      rogue: 'Prefiere arrow functions concisas y evita variables temporales innecesarias.',
    },
  },
  {
    id: 'c2_r3',
    castleId: 2,
    roomIndex: 2,
    title: 'Scope Léxico y Closures (Clausuras)',
    summary:
      'Un closure ocurre cuando una función interna recuerda y mantiene acceso a las variables del ámbito (scope) donde fue creada, incluso después de que la función externa termine.',
    syntaxCode: `function crearContador(inicio = 0) {
  let cuenta = inicio;
  return () => {
    cuenta += 1;
    return cuenta;
  };
}`,
    keyPoints: [
      'Las variables declaradas con let/const tienen alcance de bloque ({}).',
      'Los closures permiten encapsular estado privado sin contaminar el ámbito global.',
      'Cada invocación de la fábrica crea un estado independiente.',
    ],
    classTips: {
      mage: 'La función externa crea la variable; la función retornada la modifica y devuelve.',
      warrior: 'Piensa en un closure como un cofre cerrado cuya llave solo posee la función interna.',
      archer: 'Los closures permiten crear filtros configurables reutilizables.',
      bard: 'Los manejadores de eventos en UI usan closures constantemente para recordar estado.',
      paladin: 'Encapsula el estado privado para impedir mutaciones externas indebidas.',
      rogue: 'Usa closures para memoización, debounce y contadores de rendimiento.',
    },
  },
  {
    id: 'c2_r4',
    castleId: 2,
    roomIndex: 3,
    title: 'Rompiendo el Ciclo de Ouroboros',
    summary:
      'Combina iteración controlada, funciones de orden superior y closures para quebrar las escamas del jefe sin caer en recursión o bucles infinitos.',
    syntaxCode: `function crearAcumulador(limite) {
  let total = 0;
  return (valor) => {
    total = Math.min(limite, total + valor);
    return total;
  };
}`,
    keyPoints: [
      'Define siempre una condición de parada clara.',
      'Prueba tus funciones con 0, 1 y múltiples entradas.',
      'Mantén separada la lógica de iteración del formato de salida.',
    ],
    classTips: {
      mage: 'Avanza fase por fase; cada altar debilita un escudo distinto del jefe.',
      warrior: 'Controla el índice y las condiciones de corte con precisión.',
      archer: 'Valida qué valor exacto espera cada invocación secuencial del closure.',
      bard: 'Diseña funciones componibles que cooperen entre sí.',
      paladin: 'Protege tus closures ante argumentos no numéricos o negativos.',
      rogue: 'Consigue complejidad O(n) evitando bucles anidados innecesarios.',
    },
  },

  // ===================== CASTILLO 3: ESTRUCTURAS Y ES6+ =====================
  {
    id: 'c3_r1',
    castleId: 3,
    roomIndex: 0,
    title: 'Objetos Literales, Destructuring y Spread (...)',
    summary:
      'Desestructura propiedades directamente desde objetos y arrays, y clona o fusiona estructuras de forma inmutable con el operador spread (...).',
    syntaxCode: `const { nombre, nivel = 1 } = heroe;
const actualizado = { ...heroe, nivel: nivel + 1 };
const listaCombinada = [...inventarioA, ...inventarioB];`,
    keyPoints: [
      'El spread (...) crea copias superficiales sin mutar el objeto o array original.',
      'El parámetro rest (...resto) agrupa los argumentos sobrantes en un array.',
      'El acceso dinámico obj[clave] permite leer propiedades cuyo nombre está en una variable.',
    ],
    classTips: {
      mage: 'Usa { prop } = objeto para extraer valores sin repetir objeto.prop.',
      warrior: 'Recuerda que { ...obj, clave: nuevoValor } sobrescribe la propiedad al final.',
      archer: 'La desestructuración anidada te permite extraer el dato exacto en una línea.',
      bard: 'Clonar el estado con spread es esencial para mantener la UI predecible.',
      paladin: 'Jamás mutes el objeto original recibido por parámetro; devuelve siempre una copia.',
      rogue: 'Usa destructuring en la firma del parámetro para código ultra limpio.',
    },
  },
  {
    id: 'c3_r2',
    castleId: 3,
    roomIndex: 1,
    title: 'Transformación Funcional: map, filter y find',
    summary:
      'Los métodos declarativos de array transforman y filtran colecciones devolviendo nuevos arrays sin modificar el original.',
    syntaxCode: `const activos = hechizos
  .filter((h) => h.costo <= 20)
  .map((h) => h.nombre.toUpperCase());
const primero = hechizos.find((h) => h.elemento === "fuego");`,
    keyPoints: [
      'filter conserva los elementos donde el callback devuelve true.',
      'map transforma cada elemento 1 a 1 en un nuevo array de la misma longitud.',
      'find retorna el primer elemento coincidente (o undefined si no existe).',
    ],
    classTips: {
      mage: 'Encadena filter primero para reducir elementos y luego map para formatearlos.',
      warrior: 'Compara cómo filter/map reemplazan bucles for + push con menos errores.',
      archer: 'find y filter son tus flechas de precisión sobre colecciones JSON.',
      bard: 'Transforma datos crudos en listas listas para renderizar en pantalla.',
      paladin: 'Verifica Array.isArray(lista) y contempla el caso en que find devuelva undefined.',
      rogue: 'Evita mutaciones dentro de map y elimina copias intermedias innecesarias.',
    },
  },
  {
    id: 'c3_r3',
    castleId: 3,
    roomIndex: 2,
    title: 'Agregación con reduce, some, every y sort',
    summary:
      'reduce condensa un array en un único valor (número, objeto agrupado o estructura). Recuerda clonar antes de sort porque sort muta el array original.',
    syntaxCode: `const totalOro = botin.reduce((acc, item) => acc + item.oro, 0);
const ordenados = [...botin].sort((a, b) => b.oro - a.oro);`,
    keyPoints: [
      'Pasa siempre el valor inicial en reduce (ej. 0 o {}).',
      'some comprueba si al menos uno cumple; every exige que todos cumplan.',
      'Usa [...arr].sort((a, b) => a - b) para ordenar números sin mutar el original.',
    ],
    classTips: {
      mage: 'El primer parámetro de reduce es el acumulador y el segundo es el elemento actual.',
      warrior: 'Piensa en reduce como un bucle for con acumulador encapsulado.',
      archer: 'Combina reduce para indexar o agrupar registros por categoría.',
      bard: 'Usa some/every para validar si un formulario o inventario está completo.',
      paladin: 'Nunca llames arr.sort() directamente sobre la entrada: clona con [...arr].',
      rogue: 'Resuelve sumas y conteos en una sola pasada O(n) con reduce.',
    },
  },
  {
    id: 'c3_r4',
    castleId: 3,
    roomIndex: 3,
    title: 'Los Archivos del Señor Malakor',
    summary:
      'Domina colecciones anidadas combinando destructuring, filter, map y reduce para desmantelar las reliquias corruptas de Malakor.',
    syntaxCode: `const resumen = registros.reduce((acc, { tipo, poder }) => {
  acc[tipo] = (acc[tipo] || 0) + poder;
  return acc;
}, {});`,
    keyPoints: [
      'Verifica la estructura exacta del objeto o array esperado.',
      'Mantén inmutabilidad en todas las transformaciones.',
      'Utiliza optional chaining (?.) y nullish coalescing (??) ante datos faltantes.',
    ],
    classTips: {
      mage: 'Inspecciona los datos de ejemplo en los comentarios antes de agrupar.',
      warrior: 'Comprueba cada propiedad acumulada paso a paso.',
      archer: 'Extrae solo los campos requeridos con destructuring limpio.',
      bard: 'Ordena y formatea los resultados para una lectura inmediata.',
      paladin: 'Tolera registros incompletos usando ?? 0 y validaciones defensivas.',
      rogue: 'Evita múltiples .filter().filter() consecutivos: fusiónalos en una condición.',
    },
  },

  // ===================== CASTILLO 4: DOM Y EVENTOS =====================
  {
    id: 'c4_r1',
    castleId: 4,
    roomIndex: 0,
    title: 'Selección y Manipulación del DOM (Espejo Arcano)',
    summary:
      'El DOM representa el documento HTML como un árbol de nodos. Usa querySelector para encontrar elementos y textContent/classList para actualizarlos con seguridad.',
    syntaxCode: `const puerta = document.querySelector("#puerta");
puerta.textContent = "Abierta";
puerta.classList.add("activa");
puerta.removeAttribute("disabled");`,
    keyPoints: [
      'querySelector usa selectores CSS (#id, .clase, [data-attr]).',
      'Prefiere textContent sobre innerHTML cuando insertes texto plano (evita XSS).',
      'classList.add / remove / toggle gestionan estilos limpiamente.',
    ],
    classTips: {
      mage: 'Mira el HTML inicial en el Espejo Arcano para copiar los IDs y clases exactos.',
      warrior: 'Modifica cada propiedad del nodo en secuencia directa y clara.',
      archer: 'Domina selectores CSS precisos como [data-rune="sol"] o .item.activo.',
      bard: 'Sincroniza siempre el texto visible y las clases visuales del componente.',
      paladin: 'Verifica si el nodo existe (if (!el) return) antes de leer sus propiedades.',
      rogue: 'Guarda referencias a nodos seleccionados en constantes en vez de consultarlos repetidamente.',
    },
  },
  {
    id: 'c4_r2',
    castleId: 4,
    roomIndex: 1,
    title: 'Creación Dinámica de Nodos (createElement)',
    summary:
      'Construye interfaces dinámicas creando nodos con document.createElement, configurando su contenido y añadiéndolos con append / appendChild.',
    syntaxCode: `const lista = document.querySelector("#inventario");
const li = document.createElement("li");
li.textContent = "Espada Rúnica";
li.classList.add("item");
lista.appendChild(li);`,
    keyPoints: [
      'createElement crea un nodo en memoria antes de insertarlo en el documento.',
      'appendChild o append inserta el nodo dentro del contenedor padre.',
      'Puedes limpiar un contenedor con contenedor.innerHTML = "" antes de re-renderizar.',
    ],
    classTips: {
      mage: 'Crea el elemento, asigna textContent y className, y finalmente llama appendChild.',
      warrior: 'Un bucle for...of con createElement construye listas enteras en segundos.',
      archer: 'Añade atributos data-* para identificar cada elemento renderizado.',
      bard: 'Mantén una estructura semántica limpia (ul > li, button, label).',
      paladin: 'Evita inyectar HTML sin sanear desde strings externos; usa textContent.',
      rogue: 'Usa DocumentFragment o minimiza escrituras al DOM dentro de bucles.',
    },
  },
  {
    id: 'c4_r3',
    castleId: 4,
    roomIndex: 2,
    title: 'Eventos, addEventListener y Formularios',
    summary:
      'Responde a las acciones del usuario escuchando eventos (click, input, submit). En formularios, llama a event.preventDefault() para evitar recargar la página.',
    syntaxCode: `form.addEventListener("submit", (event) => {
  event.preventDefault();
  const valor = input.value.trim();
  if (!valor) return;
  salida.textContent = valor;
});`,
    keyPoints: [
      'event.target señala el elemento que disparó el evento.',
      'En delegación de eventos, escucha en el padre y filtra con event.target.closest(...).',
      'Siempre valida y recorta (.trim()) entradas de usuario en formularios.',
    ],
    classTips: {
      mage: 'Conecta el addEventListener directamente sobre el botón o formulario pedido.',
      warrior: 'Actualiza el contador y el texto del DOM dentro del listener.',
      archer: 'Usa event.target.dataset para identificar qué botón fue pulsado.',
      bard: 'La delegación de eventos y el feedback inmediato son la esencia del Bardo.',
      paladin: 'Valida entradas vacías o cortas y muestra un mensaje de error claro sin romper el flujo.',
      rogue: 'Usa un único listener delegado en el contenedor padre en lugar de N listeners.',
    },
  },
  {
    id: 'c4_r4',
    castleId: 4,
    roomIndex: 3,
    title: 'La Telaraña del DOM de Aracne',
    summary:
      'Aracne teje nodos bloqueados y formularios corrompidos. Selecciona, valida eventos y sincroniza el estado visual en vivo en el Espejo Arcano.',
    syntaxCode: `document.querySelector("#panel").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-sello]");
  if (!btn) return;
  btn.classList.add("roto");
});`,
    keyPoints: [
      'El Espejo Arcano dispara clicks e inputs reales para comprobar tu código.',
      'Asegúrate de registrar tus listeners inmediatamente al ejecutar el script.',
      'Comprueba tanto clases CSS como contenido de texto esperado.',
    ],
    classTips: {
      mage: 'Observa el Espejo Arcano a la derecha: verás los cambios en vivo al ejecutar.',
      warrior: 'Itera sobre todos los nodos coincidentes con querySelectorAll.',
      archer: 'Usa selectores combinados para no alterar nodos inocentes.',
      bard: 'Muestra el conteo en vivo y actualiza clases de estado en cada clic.',
      paladin: 'Previene envíos inválidos y evita errores si el clic cae fuera de un botón.',
      rogue: 'Centraliza el manejo con delegación y estado limpio.',
    },
  },

  // ===================== CASTILLO 5: ASINCRONÍA Y APIS =====================
  {
    id: 'c5_r1',
    castleId: 5,
    roomIndex: 0,
    title: 'Promesas y el Event Loop',
    summary:
      'JavaScript ejecuta tareas asíncronas sin bloquear el hilo principal mediante el Event Loop. Una Promise representa un valor futuro (pending, fulfilled o rejected).',
    syntaxCode: `function invocarConRetraso(mensaje) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(\`Eco: \${mensaje}\`), 50);
  });
}`,
    keyPoints: [
      'new Promise((resolve, reject) => ...) crea una promesa personalizada.',
      '.then() encadena resultados exitosos; .catch() captura rechazos.',
      'Las microtareas (Promises) se ejecutan antes que macrotareas (setTimeout).',
    ],
    classTips: {
      mage: 'Retorna siempre la Promesa desde la función para que los tests puedan esperarla.',
      warrior: 'Llama a resolve(resultado) cuando todo salga bien y reject(error) si falla.',
      archer: 'Encadena transformaciones limpias sobre el valor resuelto.',
      bard: 'Actualiza el indicador de carga antes y después de resolver la promesa.',
      paladin: 'Rechaza explícitamente con new Error(...) ante parámetros inválidos.',
      rogue: 'Evita anidar promesas innecesariamente (callback hell); retorna la promesa directamente.',
    },
  },
  {
    id: 'c5_r2',
    castleId: 5,
    roomIndex: 1,
    title: 'async / await y Manejo de Errores (try / catch)',
    summary:
      'async/await permite escribir código asíncrono con la claridad del código síncrono. Envuelve las llamadas await en try/catch para capturar fallos de red o promesas rechazadas.',
    syntaxCode: `async function cargarHechizo(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error HTTP " + res.status);
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}`,
    keyPoints: [
      'Toda función async devuelve implícitamente una Promesa.',
      'fetch solo rechaza en fallos de red; verifica siempre res.ok para errores 404/500.',
      'Promise.all([...]) ejecuta peticiones independientes en paralelo.',
    ],
    classTips: {
      mage: 'No olvides escribir await tanto en fetch(url) como en res.json().',
      warrior: 'Maneja cada error dentro de catch para que tu aplicación nunca colapse.',
      archer: 'Filtra el JSON recibido justo después de await res.json().',
      bard: 'Muestra estados "Cargando...", datos o mensaje de error en el DOM.',
      paladin: 'Comprueba res.ok y protege el bloque completo con try/catch/finally.',
      rogue: 'Usa Promise.all en lugar de múltiples awaits secuenciales independientes.',
    },
  },
  {
    id: 'c5_r3',
    castleId: 5,
    roomIndex: 2,
    title: 'Consumo de APIs del Reino y Renderizado en DOM',
    summary:
      'En el Santuario Asíncrono dispones de la API real simulada del Reino: https://api.reino.dev/hechizos, /bestiario y /pociones. Obtén JSON y renderízalo en el Espejo Arcano.',
    syntaxCode: `async function mostrarHechizos() {
  const lista = document.querySelector("#lista");
  const res = await fetch("https://api.reino.dev/hechizos");
  const data = await res.json();
  lista.innerHTML = "";
  data.forEach((h) => {
    const li = document.createElement("li");
    li.textContent = h.nombre;
    lista.appendChild(li);
  });
}`,
    keyPoints: [
      'Actualiza el estado de carga antes del fetch y ocúltalo en finally.',
      'Maneja respuestas con error (/error) mostrando feedback claro en el DOM.',
      'Mantén separada la obtención de datos del renderizado visual.',
    ],
    classTips: {
      mage: 'Sigue el orden: 1) fetch, 2) res.json(), 3) crear nodos <li> y añadirlos.',
      warrior: 'Itera sobre los resultados y añade cada tarjeta al contenedor.',
      archer: 'Filtra los datos de la API por elemento o poder antes de renderizar.',
      bard: 'Actualiza el indicador de estado (#estado) durante la carga y al terminar.',
      paladin: 'Si la API devuelve !res.ok, muestra el aviso de error sin vaciar el resto de la UI.',
      rogue: 'Evita peticiones duplicadas y renderiza de forma limpia y eficiente.',
    },
  },
  {
    id: 'c5_r4',
    castleId: 5,
    roomIndex: 3,
    title: 'Dominando la Latencia de Chronos',
    summary:
      'Para sellar a Chronos, combina peticiones paralelas con Promise.all, recuperación elegante ante fallos y renderizado asíncrono completo en el DOM.',
    syntaxCode: `const [hechizos, bestias] = await Promise.all([
  fetch("https://api.reino.dev/hechizos").then((r) => r.json()),
  fetch("https://api.reino.dev/bestiario").then((r) => r.json()),
]);`,
    keyPoints: [
      'Promise.all acelera la carga al paralelizar solicitudes independientes.',
      'finally se ejecuta tanto si la operación tuvo éxito como si falló.',
      'Devuelve siempre la promesa o declara tu función como async.',
    ],
    classTips: {
      mage: 'Verifica el estado final en el Espejo Arcano y la consola de logs.',
      warrior: 'Controla primero el caso de éxito y luego asegura el catch.',
      archer: 'Cruza los datos de ambos endpoints con precisión.',
      bard: 'Asegúrate de reflejar el estado listo/error visible para el usuario.',
      paladin: 'Comprueba la integridad de las respuestas antes de iterar sobre ellas.',
      rogue: 'Paraleliza siempre con Promise.all para derrotar la latencia.',
    },
  },

  // ===================== CASTILLO 6: ARQUITECTURA FRONTEND =====================
  {
    id: 'c6_r1',
    castleId: 6,
    roomIndex: 0,
    title: 'Patrón Store Reactivo (Observer / Pub-Sub)',
    summary:
      'Un Store centraliza el estado de la aplicación y notifica automáticamente a todos los suscriptores cada vez que el estado cambia mediante setState.',
    syntaxCode: `function crearStore(inicial) {
  let state = { ...inicial };
  const listeners = new Set();
  return {
    getState: () => ({ ...state }),
    setState: (parcial) => {
      state = { ...state, ...parcial };
      listeners.forEach((fn) => fn(state));
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}`,
    keyPoints: [
      'El estado fluye en una sola dirección: Acción -> Store -> Suscriptores -> DOM.',
      'subscribe debe devolver una función de desuscripción para evitar fugas de memoria.',
      'getState devuelve una copia para evitar mutaciones directas no notificadas.',
    ],
    classTips: {
      mage: 'Usa un Set o array de listeners y llámalos en bucle dentro de setState.',
      warrior: 'Actualiza el objeto state combinando el anterior con los nuevos cambios.',
      archer: 'Devuelve siempre una función unsubscribe funcional.',
      bard: 'Conecta el render del DOM como un suscriptor del Store.',
      paladin: 'Asegúrate de que mutar el objeto devuelto por getState no corrompa el Store.',
      rogue: 'Usa Set para suscripciones O(1) y evita notificar si nada cambió.',
    },
  },
  {
    id: 'c6_r2',
    castleId: 6,
    roomIndex: 1,
    title: 'Persistencia con localStorage y JSON',
    summary:
      'localStorage guarda pares clave-valor como strings en el navegador. Usa JSON.stringify al guardar y JSON.parse dentro de try/catch al leer.',
    syntaxCode: `function guardarEstado(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos));
}
function cargarEstado(clave, respaldo) {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? JSON.parse(raw) : respaldo;
  } catch {
    return respaldo;
  }
}`,
    keyPoints: [
      'localStorage solo almacena cadenas de texto.',
      'Siempre envuelve JSON.parse en try/catch ante datos corruptos.',
      'Proporciona un valor por defecto cuando la clave no exista.',
    ],
    classTips: {
      mage: 'Recuerda llamar JSON.stringify antes de localStorage.setItem.',
      warrior: 'Comprueba primero si getItem devuelve null antes de parsear.',
      archer: 'Serializa y restaura exactamente la estructura esperada.',
      bard: 'Sincroniza el estado guardado al iniciar la interfaz del Espejo.',
      paladin: 'Tu try/catch debe sobrevivir a JSON malformado sin lanzar excepciones.',
      rogue: 'Crea un adaptador de almacenamiento reutilizable y limpio.',
    },
  },
  {
    id: 'c6_r3',
    castleId: 6,
    roomIndex: 2,
    title: 'Rendimiento Frontend: Debounce y Delegación',
    summary:
      'debounce retrasa la ejecución de una función hasta que pasen N milisegundos sin nuevas llamadas, protegiendo buscadores e inputs intensivos.',
    syntaxCode: `function debounce(fn, espera) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), espera);
  };
}`,
    keyPoints: [
      'clearTimeout cancela la ejecución pendiente cuando llega un nuevo evento.',
      'Reenvía siempre todos los argumentos con (...args).',
      'Combina debounce con delegación de eventos para apps fluidas a 60 FPS.',
    ],
    classTips: {
      mage: 'Guarda el ID de setTimeout en una variable del closure y límpialo cada vez.',
      warrior: 'Asegúrate de retornar la nueva función envuelta desde debounce.',
      archer: 'Preserva los argumentos (...args) exactos al invocar fn.',
      bard: 'Aplica debounce a inputs de búsqueda para evitar parpadeos en la UI.',
      paladin: 'Asegura que espera >= 0 y maneja invocaciones múltiples consecutivas.',
      rogue: 'Esta es tu cumbre: cero fugas de timers y ejecución mínima.',
    },
  },
  {
    id: 'c6_r4',
    castleId: 6,
    roomIndex: 3,
    title: 'El Trono del Arquitecto Frontend',
    summary:
      'Derrota al Rey Exánime del Estado Global construyendo una mini-aplicación reactiva completa en Vanilla JS: Store + Render declarativo + Eventos + Persistencia.',
    syntaxCode: `// Arquitectura limpia: Estado -> Render -> Eventos -> Persistencia
function render(state) {
  lista.innerHTML = "";
  state.tareas.forEach((t) => { /* crear nodo */ });
}`,
    keyPoints: [
      'Unifica Store, persistencia y renderización desacoplada en el Espejo Arcano.',
      'Cada acción del usuario actualiza el estado, guarda en localStorage y vuelve a renderizar.',
      'Conquista este trono para obtener tu Título de Arquitecto Frontend.',
    ],
    classTips: {
      mage: 'Resuelve el estado primero, luego el render y finalmente los eventos.',
      warrior: 'Verifica que añadir y completar tareas actualice el DOM al instante.',
      archer: 'Asegúrate de que el filtro de tareas funcione con precisión exacta.',
      bard: 'Mantén sincronizados el contador de pendientes y la lista visual.',
      paladin: 'Ignora entradas vacías y tolera localStorage vacío o corrupto.',
      rogue: 'Usa delegación de eventos y una arquitectura limpia sin duplicar estado.',
    },
  },
];

export function getGrimoirePagesByCastle(castleId: number): GrimoirePage[] {
  return GRIMOIRE_PAGES.filter((p) => p.castleId === castleId);
}
