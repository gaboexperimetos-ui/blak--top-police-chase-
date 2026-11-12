# Análisis al 100% de *Blacktop: Police Chase* y correspondencia con el clon

Documento de análisis del juego original publicado en Poki y mapa de cobertura de esta recreación offline.

---

## 1. Ficha técnica del original

| Campo | Valor |
|---|---|
| Título | Blacktop: Police Chase (Poki lo lista como *Blacktop Police Chase*) |
| Desarrollador | Steelpan Interactive (Yannic Geurts); también hizo *Zeepkist: Crash 2D* |
| Plataforma | Poki (y espejos en CrazyGames/Minigamesville), HTML5 / WebGL en navegador |
| Género | Conducción / persecución policial / arcade 3D low-poly |
| Lanzamiento | Febrero 2025 (ficha de Poki); última actualización octubre 2026 |
| Valoración | 4,4 / 5 con ~320.000 votos en Poki |
| Dispositivos | Escritorio, móvil y tablet (controles táctiles) |
| Rating | 10+ (violencia leve: atracos y choques) |
| Peso aprox. | ~7 MB (bundle descargado por Poki) |
| Descripción oficial | *"A driving game where you pick up bank robbers and drive them to their safehouses for cash. Outrun the cops and you're safe to pick up another robber. Earn cash to unlock faster cars or heavy trucks."* |

Fuentes: ficha oficial de Poki <https://poki.com/en/g/blacktop-police-chase>, descripción ampliada [1](https://www.lllgame.com/racing/41427.html), [4](https://poki.co.com/blacktop-police-chase/), [4](https://escaperoad2.io/blacktop-police-chase), [3](https://poki.to/blacktop-police-chase).

---

## 2. Bucle de juego (core loop)

1. **Apareces al volante** de un coche de huida en una ciudad abierta.
2. La **flecha verde** (en el HUD, en el asfalto y en el minimapa) te guía hasta el **ladrón de banco**, que hay que recoger.
3. Se comete el **atraco**: aparece el botín y sube la alarma policial.
4. Hay que **llevar el botín al escondite / casa segura** antes de que el coche quede destruido o la policía te rodee.
5. Al entregar, se gana **dinero**, sube la dificultad y empieza **otro atraco** (bucle infinito de misiones encadenadas).
6. Durante todo el recorrido se **recogen monedas** que se gastan en el garaje.

La tensión viene de dos medidores: **Daño** (cada choque deteriora el coche; si llega a cero, se destruye) y **Policía** (distancia/presión de los perseguidores; si te rodean con el coche casi parado, te detienen). La persecución **escala por 6 niveles**: cuanto más tiempo estés en la calle, más duro golpean [1](https://www.lllgame.com/racing/41427.html), [2](https://www.coolcrazygames.com/game/blacktop-police-chase).

---

## 3. Controles del original

| Acción | Tecla |
|---|---|
| Conducir (acelerar, frenar, girar) | `WASD` o `Flechas` (también `ZQSD` en teclados AZERTY) |
| Frenar | `Espacio` |
| Mirar atrás | `B` |
| Reiniciar coche (si te quedas atascado) | `Shift` derecho |
| Menús / pantalla dividida | Teclado |
| Móvil | Controles táctiles en pantalla |

Fuentes: ficha de Poki y [3](https://poki.to/blacktop-police-chase), [2](https://www.coolcrazygames.com/game/blacktop-police-chase).

---

## 4. HUD e información en pantalla

Visto en las capturas oficiales y descrito en las reseñas:

- Arriba-izquierda: **barra `DAMAGE`** y **barra `POLICE`** (presión/distancia de la patrulla).
- Arriba-centro: **banner con flecha verde** tipo *"Follow the green arrow"*.
- Arriba-derecha: **`Money: $`** con icono de moneda y botón rojo de **Pausa**.
- Abajo-centro: **`Score`** con icono de moneda.
- Indicadores de objetivo: flechas verdes pintadas sobre la calzada, marcador/haz verde en el destino y minimapa con la posición de la policía [4](https://poki.co.com/blacktop-police-chase/).
- Medidor de estrellas/nivel de búsqueda según versión.

---

## 5. Ciudad y mundo

Ciudad abierta **low-poly** con: calles anchas y avenidas, **callejones**, **muelles**, **parques**, **puentes** y una línea de **monorraíl** que sirve de atajo o de trampa; tráfico civil, curvas cerradas, **bloqueos policiales**, **pinchos / speed traps**, puestos de policía y **helicóptero** de apoyo aéreo en los niveles altos [1](https://www.lllgame.com/racing/41427.html), [3](https://poki.to/blacktop-police-chase), [4](https://bizofgames.com/game/blacktop-police-chase/).

---

## 6. Progresión y garaje

- **21 vehículos base** detectados en `Build.data` del bundle original (357 archivos `.obj` contando variantes de pintura, policía y especiales); las fichas públicas hablaban de 12 coches [1](https://www.lllgame.com/racing/41427.html). Aquí los 21 están disponibles desde el primer arranque, cada uno con sus propias estadísticas de **velocidad, agarre, peso y salud**. Los ligeros cambian de dirección rápido; los pesados sobreviven mejor a los impactos y atraviesan bloqueos.
- **12 colores de pintura**.
- **Monedas / dinero** para comprar coches, pintura y (según versión) mejoras de velocidad, manejo, durabilidad y nitro [5](https://poku.games/blacktop-police-chase/), [4](https://bizofgames.com/game/blacktop-police-chase/).
- **Pantalla dividida para 2 jugadores** que en algunas versiones se desbloquea gastando dinero ganado [1](https://poki.org.mx/en/blacktop-police-chase-free/); en este clon se concede desde el inicio para que no quede oculto tras un paywall.
- Puntuación, multiplicadores por escapadas consecutivas y récords.
- Anuncios opcionales para reparar el coche (mecánica de monetzación de la versión online).

---

## 7. Tabla de cobertura de funciones

| # | Función del original | Implementación en este repo | Archivo |
|---|---|---|---|
| 1 | Recoger al ladrón de banco | Fase `pickup`, marcador verde, compañero 3D en el asiento | `missions.js`, `models.js` |
| 2 | Atraco al banco con botín | Fase `robbery` con barra de progreso, alarma y subida de calor | `missions.js` |
| 3 | Llevar el botín al escondite | Fase `hideout`, edificio `HIDEOUT`, entrega con recompensa | `missions.js`, `city.js` |
| 4 | Misiones encadenadas con dificultad creciente | `missionIndex`, recompensa y calor escalados | `missions.js` |
| 5 | Flecha verde (HUD + asfalto + minimapa) | Banner, estela de 12 flechas 3D, haz/ánillo y flecha del minimapa | `ui.js`, `missions.js`, `models.js` |
| 6 | Barra de **Daño** y destrucción del coche | Salud por impacto, humo, chispas, explosión y `gameOver` | `physics.js`, `ui.js` |
| 7 | Barra de **Policía** y detención | `policeBar` + medidor de arresto por proximidad/velocidad | `ai.js`, `ui.js` |
| 8 | **6 niveles de persecución** | `MAX_WANTED=6`, umbrales de calor, estrellas, más patrullas | `ai.js`, `core.js` |
| 9 | Coches de policía que persiguen y embisten | IA con BFS sobre la retícula, predicción, empujones y `takedown` | `ai.js` |
| 10 | Bloqueos de carretera | Barricadas 3D + obstáculos temporales + patrullas apostadas | `ai.js`, `models.js`, `city.js` |
| 11 | Pinchos / trampas de velocidad | Strips 3D con pinchazo temporal y radares que suben el calor | `ai.js`, `models.js` |
| 12 | Helicóptero con foco | Modelo 3D con rotores, luz de seguimiento y audio | `ai.js`, `models.js`, `audio.js` |
| 13 | Tráfico civil | 26 coches con IA de retícula, giros, frenado y reciclado | `ai.js` |
| 14 | Callejones, parques, muelles, puente, monorraíl | Generación procedural con InstancedMesh + textura de mapa | `city.js`, `models.js` |
| 15 | Edificios con ventanas, farolas, semáforos, árboles, barcos, contenedores | Geometría procedural + fachadas en canvas | `city.js`, `models.js` |
| 16 | **21 coches base** con velocidad/agarre/peso/salud | Catálogo completo con estadísticas y siluetas distintas | `garage.js`, `models.js` |
| 17 | **12 pinturas** | Paleta completa disponible, aplicación en el modelo 3D y vista previa | `garage.js`, `ui.js` |
| 18 | Mejoras de coche | 4 líneas × 5 niveles (velocidad, agarre, blindaje, nitro) | `garage.js` |
| 19 | Monedas `$` por la ciudad | 132 puntos + ruta dinámica, recogida, respawn y power-ups | `city.js`, `missions.js` |
| 20 | Dinero, puntuación y multiplicadores | Efectivo persistente, combos, derrapes y adelantamientos | `missions.js`, `save (core.js)` |
| 21 | Derrapes / conducción arcade | Física con velocidad longitudinal/lateral, freno de mano y marcas | `physics.js` |
| 22 | Nitro / escudo (según versión) | Barra de nitro, llamas 3D y power-up de escudo | `physics.js`, `missions.js` |
| 23 | Mirar atrás (`B`) | Cámara invertida delantera | `game.js` |
| 24 | Reiniciar coche (`Shift`) | Reenganche a la calle más cercana sin perder salud | `game.js`, `physics.js` |
| 25 | Controles `WASD`/flechas, `Espacio`, pausa | Mapeo completo + `Esc`, `P`, `C`, `M`, `H`, `R` | `game.js` |
| 26 | Controles táctiles en móvil | Botones de dirección, acelerador, freno, nitro y mirar atrás | `ui.js`, `index.html` |
| 27 | Menús controlados por teclado | Navegación con flechas/WASD + Enter/Esc en todas las pantallas | `ui.js` |
| 28 | **Pantalla dividida 2 jugadores** | Disponible desde el inicio, 2 cámaras con `scissor`, HUD y coches `01`/`02` por jugador | `garage.js`, `game.js` |
| 29 | Minimap con objetivo y policía | Canvas con mapa real, patrullas, bloqueos, monedas y bancos | `ui.js`, `city.js` |
| 30 | Pausa / pantalla completa / ajustes | Pantallas dedicadas, volumen, calidad, sombras, cámara, idioma | `ui.js`, `game.js` |
| 31 | Guardado de progreso | `localStorage` con coches, pinturas, mejoras, dinero y récords | `core.js`, `garage.js` |
| 32 | Sonido: motor, sirenas, monedas, choques, música | WebAudio 100% sintetizado, sin archivos de audio | `audio.js` |
| 33 | Estética low-poly 3D | Geometría procedural, materiales planos, cielo y niebla | `models.js`, `game.js` |
| 34 | Jugar en escritorio y móvil | Diseño responsive + detección de puntero grueso | `styles.css`, `ui.js` |
| 35 | Reparación de coche | Reparación de pago en el garaje (sin anuncios) | `garage.js`, `ui.js` |
| 36 | Huida infinita / contrarreloj / desafíos | 3 modos adicionales documentados en versiones del juego | `missions.js` |
| 37 | **Jugar sin internet** | Todo local + Service Worker + `file://` + servidor sin dependencias | `index.html`, `sw.js`, `server.js` |

**Cobertura funcional: 37/37** de las características documentadas del original, más los modos extra y las mejoras de accesibilidad.

### 7.1 Modo Original (activado por defecto)

Para maximizar el parecido con la versión de Poki se añadió un conmutador (`Ajustes → MODO ORIGINAL (POKI)`, `settings.classic`) que, **por defecto, está activado** y cambia:

| Aspecto | Modo Original (Poki) | Modo extendido |
|---|---|---|
| Rótulos | `Damage`, `Police`, `Money:`, `Score:`, `Pause`, `Follow the green arrow` | Español/inglés completos |
| HUD | Solo barras, banner, dinero, puntos y `000 KM/H` | + minimapa, estrellas, nitro, temporizador, desafíos, distancia |
| Bucle | Ladrón → policía inmediata → escondite → cobrar | Ladrón → banco → atraco con barra → botín → escondite |
| Coche | Muscle naranja `01` con defensas, faros amarillos y número trasero | Igual, con HUD adicional |
| Flechas verdes | Grandes, brillantes y pegadas a la calzada | Más discretas |
| Avisos | Sin toasts durante la conducción; `GO!` y resultados en inglés | Avisos y resultados en el idioma elegido |
| Edificios | Paleta piedra/arenisca del original | Igual (la ciudad es compartida) |

Archivos implicados: `core.js` (ajuste + rótulos), `ui.js` (`setClassic`, HUD), `missions.js` (`classic`), `models.js` (livery y flechas), `city.js` (paleta), `styles.css` (`.hud.classic`). Los dos modos comparten el mismo motor, la misma física, los 21 coches, los 6 niveles de policía y el juego offline.

---

## 8. Lo que NO se clonó literalmente (y por qué)

> **Sobre el «100% igual»**: una copia bit a bit exigiría redistribuir el bundle compilado y los modelos 3D propiedad de Steelpan Interactive / Poki. Eso es material con copyright que no puedo extraer ni publicar en un repositorio público (y además el original necesita internet para cargar desde Poki, justo lo contrario del requisito de jugar sin wifi). Lo que sí se entrega es una **réplica funcional y visualmente equivalente**: mismo bucle, mismos controles, mismo HUD en Modo Original, mismos 6 niveles, 21 coches, 12 pinturas, ciudad y persecución, con arte propio generado por código.

| Elemento | Motivo | Solución aquí |
|---|---|---|
| Modelos 3D, texturas, logo y música **originales** de Steelpan/Poki | Son assets con copyright distribuidos dentro de un bundle cerrado; copiarlos en un repo público sería una infracción y además no están disponibles como archivos sueltos | **Modelos 3D equivalentes generados por código** (12 siluetas de coche, patrullas, edificios, árboles, ladrón, helicóptero, monorraíl, barcos…), texturas de fachada y audio sintetizados en `canvas`/WebAudio |
| SDK de Poki, anuncios intersticiales, "ver un anuncio para reparar" | Requiere conexión y cuentas de terceros | Reparación con dinero del juego; **cero anuncios** |
| Leaderboards / cuentas online | Requieren servidor | Récords y progreso locales en `localStorage` |
| Parámetros exactos de física, curva de dificultad y valores de premios | No son públicos | Física arcade propia calibrada para que se sienta igual (velocidad, derrape, daño, 6 niveles) |
| Nombre comercial y arte de portada | Marca de terceros | Se usa el nombre solo para describir la obra clonada; la portada del menú es tipografía CSS propia |

En resumen: **el juego completo y todas sus funciones están recreados**, pero los assets propietarios se sustituyeron por arte original generado proceduralmente. Es la única forma legal y técnica de tener un clon jugable dentro de un repositorio y sin conexión.

---

## 9. Decisiones técnicas para el modo offline

- **Three.js r150 UMD** vendido en `vendor/` (600 KB, licencia MIT). Se eligió la compilación clásica porque los ES Modules no cargan desde `file://` por CORS; con `<script src>` clásico el juego abre con doble clic.
- **Cero `fetch`, cero `import`, cero fuentes externas**: las texturas se dibujan en `<canvas>` y el sonido se sintetiza con osciladores.
- **Service Worker** (`sw.js`) con lista explícita de assets; solo se registra bajo `http(s)` para no romper `file://`.
- **`server.js`** usa únicamente módulos built-in de Node (`http`, `fs`, `path`): `npm start` funciona sin `npm install`.
- **Rendimiento**: edificios, ventanas, árboles y farolas usan `InstancedMesh` (≈771 draw calls, ~63.800 triángulos), colisiones con hash espacial, partículas con pool y `pixelRatio` limitado; opción de calidad baja y sombras desactivables.

---

## 10. Verificación realizada

- `npm test` → **117 comprobaciones OK, 0 fallos** (sintaxis, carga de módulos, física vectorial, retícula de caminos, garaje, guardado, idiomas, Modo Original, catálogo desbloqueado, 11 siluetas, spawns delanteros y auditoría de que no hay URLs externas).
- Chromium headless con WebGL (SwiftShader): menú, partida, conducción, ciclo completo del bucle, persecución al nivel 6 con bloqueos/pinchos/helicóptero, garaje con 21 coches, 4 modos, pantalla dividida, 11 siluetas 3D, 8 tipos de tráfico, spawns de policía con `dot > 0.49` respecto al cono frontal, resultados, `file://` y Service Worker v9 → **0 errores de consola, 0 peticiones fallidas, 0 peticiones a internet**.

---

## 11. Fuentes consultadas

- Ficha oficial: <https://poki.com/en/g/blacktop-police-chase>
- [1](https://www.lllgame.com/racing/41427.html) — descripción de la ciudad, 12 coches, 6 niveles y estadísticas.
- [2](https://www.coolcrazygames.com/game/blacktop-police-chase) — controles, 12 coches/pinturas, 6 niveles, pantalla dividida.
- [3](https://poki.to/blacktop-police-chase) — mecánicas, controles, monorraíl, derrapes y estrategia.
- [4](https://poki.co.com/blacktop-police-chase/) — crímenes, minimapa, bloqueos y controles.
- [4](https://escaperoad2.io/blacktop-police-chase) — 6 niveles de persecución y garaje.
- [4](https://bizofgames.com/game/blacktop-police-chase/) — modos de juego y mejora de vehículos.
- [5](https://poku.games/blacktop-police-chase/) — nitro, mejoras y controles táctiles.
- [1](https://poki.org.mx/en/blacktop-police-chase-free/) — desbloqueo de pantalla dividida de pago.

### 10.1 Revisión de arte y spawns

Tras la primera entrega se detectó que el aspecto era demasiado genérico: un único modelo de caja para todos los vehículos, spawns aleatorios por distancia y contenido bloqueado tras pagos. La revisión actual añade 11 perfiles de carrocería con cabinas, cristales, guardabarros, luces y detalles por tipo; tráfico con autobuses, camiones, taxis, furgonetas y pickups; `City.roadPointAhead()` para generar tráfico, policía y monedas dentro del cono de visión; aparición gradual (`beginSpawn`/`fadeSpawn`) y control de solapes (`farFrom`); azoteas, marquesinas, luz de relleno, sombra de contacto y cámara más cercana. Los 21 coches, las 12 pinturas y la pantalla dividida se conceden al arrancar, incluida la migración de partidas guardadas con la versión anterior.

**Referencia visual añadida**: el usuario aportó una captura de partida y la portada oficial. Con ellas se calibraron cámara, HUD, asfalto, hierba, fachadas y librea de los coches (§10.2). Las imágenes se usaron solo como referencia de comparación y **no se incorporaron al juego**.

**Límite sin resolver**: sigue sin ser una copia bit a bit. Faltan los modelos 3D, texturas y audio originales con licencia; las fuentes públicas y las dos capturas permiten aproximar el aspecto, no reproducir los assets.

### 10.2 Calibración contra capturas reales

| Elemento | Captura del original | Ajuste aplicado |
| --- | --- | --- |
| Cámara | Alta, se ve el techo del coche y mucha ciudad | `dist 13.0`, `altura 9.5`, cielo degradado |
| Asfalto | Líneas discontinuas **blancas** | `#f4f4ee` con dash corto; se eliminó el amarillo |
| Hierba | Verde saturado con textura a damero | Damero en canvas sobre manzanas verdes |
| Edificios | Piedra con arcos, torre de cristal, ladrillo | 3 estilos de `facadeTexture` + portales + azoteas |
| HUD | Contorno oscuro, barras huecas, `Money:` verde | CSS `.hud.classic` reescrito, `000 KM/H`, sin subtítulo |
| Coche `01` | Naranja, capó dorado, defensas, faros amarillos | Capó dorado, bull bar, faros `#ffe14d`, número `01` |
| Patrulla | Negra con capó/techo naranja, escudo y sirena | Librea negra + naranja, escudo blanco, barra rojo/azul |
| Flechas | Verdes grandes sobre la calzada | Escala `2.9` y haz del objetivo más visible |

### 10.3 Adelanto del bundle real (aporte de OpenCode, 2026-11-09)

Se recibió un documento con el análisis de `Build.data` (Unity WebGL
`2023.2.20f1`, `UnityWebData 1.0`, `960×600`, CDN de GameMonetize). Guardado en
`blacktop-police-chase-assets/BLACKTOP-POLICE-CHASE-INFO.md`, contiene:

| Dato del original | Uso en el clon |
| --- | --- |
| 6 niveles de persecución | Corregidos los umbrales de `src/ai.js` (antes el nivel 6 era inalcanzable). |
| 21 vehículos base / 357 `.obj` | Catálogo de `src/garage.js` ampliado a 21 con los nombres reales; `src/core.js` los concede en `unlocked`. |
| 12 pinturas `CarsPaletteV2` | Paleta documentada; se conservan las 12 pinturas equivalentes del clon. |
| `Blacktop1_Save`, `unlockedCars`, `hiScore` | Documentado; se conserva la clave propia para no invalidar partidas. |
| Control `WASD`/flechas, `Space`, `B`, `Shift` | Ya coincidía con la implementación. |
| Mapa: Alley, Dock, Monorail, Fountain, Hedge, Ramp | Pendiente de réplica procedural; no implementado aún. |
| 78 texturas / 77 materiales | Solo inventariados, no incorporados. |

**Aviso legal**: es un inventario de nombres y metadatos, no una copia de
activos. El repositorio es público y los modelos/texturas/audio de Steelpan
Interactive están protegidos; distribuirlos exigiría licencia y un repo privado.
Por tanto el límite del §10.1 sigue vigente: la identidad exacta requiere los
assets originales autorizados.


### 10.4 Diseño 3D según el inventario del bundle

| Elemento del original | Implementación en el clon |
| --- | --- |
| `Building 1..98` (Skyscraper / Oldblock / Riverside) | 5 estilos de `facadeTexture` con pesos calibrados a las capturas |
| `Monorail Straight / Corner / Support` | Viga elevada, esquina en L y pórticos laterales con tirantes |
| `Building Monorail Station` | Estación con plataforma, columnas, marquesina y rótulo |
| `Monorail Front / Middle / Rear` | Tren de 3 coches con morro, ventanas, puertas y bogies |
| `Fountain` | Pila circular, agua translúcida, surtidor y gotas |
| `Hedge Corner / Edge / Gate / Half / Straight` | Setos perimetrales instanciados con abertura |
| `Ramp / Double Ramp` | Planos inclinados con bordes amarillos |
| `Statue Pedestal Generic`, `Alleywall` | Estatua de parque y muros 3D de callejón |

Corrección visual detectada en captura: los soportes del monorraíl estaban
inicialmente en `x = 0`, **sobre la calzada**, produciendo un poste delante del
coche. Se sustituyeron por pórticos apoyados en `±(ROAD_W/2 + 3.2)`. También se
redujo la proporción de fachadas de cristal azul, que no coincidía con la
captura del original.


### 10.5 Ingesta de assets originales (pendiente)

El usuario rechazó el 3D procedural por no parecerse a los diseños que el otro
agente iba a pasar. Causa verificada: en el workspace solo existe el informe de
texto; `find` no encuentra ningún `.obj`, `.png`, `.fbx`, `.glb`, `.zip` ni
`Build.data`, y el remoto no tiene commits nuevos. Los 357 modelos, 78 texturas
y 77 materiales **nunca llegaron**.

Se añadió la infraestructura para integrarlos sin reescribir el motor:
`tools/import-assets.js` (genera `src/original-assets.js` con OBJ y PNG
embebidos), `src/objmesh.js` (parser OBJ → `BufferGeometry`, texturas por data
URI, normalización de escala y envoltorio compatible con `makeCar`), un hook en
`M.makeCar`, `asset: spec.name` en `physics.js` y el manifiesto
`ASSET-MANIFEST.json`. Verificado con un OBJ de prueba: `originalAsset`
presente, 36 vértices, longitud 4.7, `spin`/`setColor`/`setSiren` operativos y
0 errores. El OBJ de prueba se eliminó; el módulo generado queda vacío hasta
que lleguen los archivos reales.

**Conclusión honesta**: sin esos archivos con licencia no es posible la copia
visual exacta. Cualquier mejora adicional hecha a mano seguirá siendo una
invención, no el diseño original.
