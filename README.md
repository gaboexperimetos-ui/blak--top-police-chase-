# BLACKTOP: POLICE CHASE — clon jugable 100% OFFLINE

Recreación jugable **sin wifi** del juego de Poki *Blacktop: Police Chase* (Steelpan Interactive): ciudad 3D low-poly, atracos, persecución policial de 6 niveles, **los modelos 3D originales del juego** (357 `.obj` extraídos del bundle real), garaje con 21 coches y 12 pinturas (todo disponible desde el inicio), monedas, mejoras, minimapa, modos de juego, sonido procedural y pantalla dividida para 2 jugadores.

> Todo el código, los modelos 3D, las texturas, los sonidos y la música están **dentro de esta carpeta**. No hay CDN, ni `npm install`, ni peticiones de red: `npm test` verifica que `index.html` no contiene ni una sola URL externa.

---

## ▶️ Cómo jugar (sin internet)

**Opción A — la más simple:** abre `index.html` con doble clic en Chrome, Edge, Firefox o Safari. Funciona directamente desde `file://`.

**Opción B — servidor local (recomendada, activa el Service Worker):**

```bash
npm start            # http://localhost:3000  (solo Node.js, cero dependencias)
```

Después de la primera carga, el Service Worker (`sw.js`) guarda todos los archivos en caché: puedes apagar el wifi (o hasta el servidor) y seguir jugando.

**Opción C — móvil/tablet:** sirve la carpeta con `npm start` en tu PC y abre `http://IP-de-tu-PC:3000` desde el móvil en la misma red local (sigue siendo offline respecto a internet). Controles táctiles en pantalla.

Requisitos: un navegador con **WebGL** y JavaScript. No requiere cuenta, ni login, ni descargas.

---

## 🎯 Modo Original (activado por defecto)

Para parecerse **lo más posible al juego de Poki**, el *Modo Original* replica:

- **HUD exacto:** `Damage` y `Police` arriba-izquierda, banner negro con flecha verde y texto **"Follow the green arrow"**, `Money: $` arriba-derecha con moneda y botón rojo **Pause**, y `Score:` abajo-centro con el velocímetro tipo `000 KM/H`. Se ocultan los extras (minimapa, estrellas, nitro, temporizador).
- **Bucle exacto:** recoger al ladrón → **la policía sale al instante** → seguir la flecha verde hasta el escondite → cobrar → siguiente atraco. Sin la fase intermedia de atraco al banco de las versiones extendidas.
- **Coche naranja `01`** con defensas negras, faros amarillos y número en el maletero; **patrullas negras/blancas con capó amarillo, escudo y luces rojo/azul**.
- **Flechas verdes brillantes** pegadas a la calzada, edificios de tonos piedra/arenisca, ciudad low-poly con el mismo encuadre de cámara, **`GO!`** de salida, resultados/`Pause` en inglés y sin avisos flotantes durante la conducción (el original no los tiene).

Se puede desactivar en **Ajustes → MODO ORIGINAL (POKI)**: al desactivarlo vuelven el HUD español completo, el minimapa, las barras de nitro/nivel de persecución, el atraco al banco de 3 fases y todos los indicadores. Todos los modos, coches, mejoras y el 2 jugadores siguen disponibles en ambos casos.

---

## 🎮 Controles

| Acción | Teclado |
|---|---|
| Acelerar / girar | `WASD` o `Flechas` |
| Freno de mano / derrape | `Espacio` |
| Nitro | `N` o `F` |
| Mirar atrás | `B` |
| Reiniciar coche si te atascas | `Shift` derecho o `R` |
| Cambiar cámara (cerca / lejos / capó) | `C` |
| Ampliar minimapa | `M` (o botón ▣) |
| Pausa | `Esc` o `P` (o botón Ⅱ) |
| Bocina | `H` |
| Menús | `Flechas/WASD` + `Enter`, `Esc` para volver |

**2 jugadores (pantalla dividida):** disponible desde el primer arranque en el menú de modos, sin pagar ni desbloquear nada. J1 con `WASD`, J2 con flechas + `Ctrl`/`Shift` derecho.
`J1` = `WASD` + `N` (nitro) + `Espacio` (freno) · `J2` = `Flechas` + `Ctrl derecho` (nitro) + `Shift derecho` (freno).

---

## 🕹️ Qué incluye

- **Bucle de misión completo:** en Modo Original, recoger al ladrón → esconderlo con la policía detrás → siguiente atraco; con el modo extendido se añade atracar el banco (barra de progreso) y recoger el botín.
- **Flecha verde:** banner en el HUD, estela de flechas sobre el asfalto, haz luminoso y anillo en el objetivo, y flecha de dirección en el minimapa.
- **Persecución con 6 niveles:** más patrullas, embestidas, bloqueos de carretera, pinchos, radares de velocidad y helicóptero con foco. Barra `POLICÍA` + estrellas de `BUSCADO` + medidor de detención.
- **Daño acumulado:** cada choque resta salud; humo, chispas, destello rojo y destrucción del coche = fin de partida. Reparación de pago en el garaje.
- **Ciudad abierta:** 13×13 calles, 310+ edificios con fachadas, callejones, parques con árboles y estanques, semáforos, farolas, muelles con contenedores y barcos, puente sobre el agua, monorraíl elevado con tren en movimiento, tráfico civil con IA y atajos por la retícula de calles.
- **Física arcade:** aceleración, freno, marcha atrás, derrape con freno de mano, nitro, peso, agarre, colisiones con edificios, tráfico y policía, pinchos, escudo, humo, marcas de derrape y chispas.
- **Garaje:** 21 coches con estadísticas de velocidad / agarre / peso / salud y **11 siluetas 3D propias** (muscle, sedán, compacto, deportivo, super, hyper, patrulla, furgoneta, pickup, blindado y autobús de tráfico), 12 pinturas, 4 líneas de mejoras × 5 niveles y reparación. Todo el catálogo y el modo 2 jugadores están accesibles desde el inicio; el progreso se guarda en `localStorage`.
- **Modos:** Misiones, Huida infinita, Contrarreloj (10 puntos de control), Desafíos (adelantamientos, monedas, derrape) y 2 jugadores.
- **Economía y puntuación:** monedas `$` por la ciudad, botín, multiplicadores por combo, adelantamientos peligrosos, derrapes y récords persistentes.
- **HUD completo:** daño, policía, nivel de persecución, dinero, puntos, velocímetro, nitro, temporizador, distancia al objetivo, minimapa a pantalla completa, avisos y FPS opcional.
- **Audio 100% sintetizado:** motor, sirenas, helicóptero, monedas, choques, nitro, atraco, música y efectos de menú (WebAudio).
- **Extras:** pausa, pantalla completa, ajustes (volumen, calidad, sombras, cámara, idioma ES/EN, FPS), ayuda integrada, controles táctiles, guardado automático y pantalla de resultados.

---

---

## Policia y tráfico con las mallas originales

Además de los 21 coches del garaje, `src/ai.js` ya usa las mallas reales del
bundle para el resto de la circulación:

- **Tráfico civil:** 22 chasis reales con sus liberias (taxis incluidos).
- **Patrullas por nivel de persecución** (1→6), con las liberias que trae el
  bundle: `McCall Manchester Police`, `McCall Monaco State Police`,
  `McCall Montpellier Gendarmerie`, `Chevalier Bonheur Gendarmerie`,
  `Jerry Navigator Police`, `Merkur 668 Polizei`, `Merkur 668 Rijkspolitie`,
  `Nakazato Cricket State Trooper`, `Acheron Redhawk Police`.
- **Unidades blindadas** desde el nivel 4: `Bulldozer Police`.
- **Pintura real:** cada librea usa su textura `CarsPaletteV2` (campo
  `paintTexture`), no color plano.

### ⚠️ Orientación de los ejes (bug corregido)

Unity exporta estas mallas con **Y = largo** y **Z = alto** (X = ancho). El
motor del clon trabaja con **X = ancho, Y = alto, Z = largo**, así que
`src/objmesh.js` intercambia Y y Z al cargar: `(x, y, z) -> (x, z, y)`.
Sin ese cambio un coche medía **4.95 de alto y 0.99 de largo**.

Los `.obj` del repo se conservan **byte a byte** como los exporta Unity; la
corrección de ejes vive en el cargador.

Medidas reales con Three.js r150 tras la corrección:

| Modelo | Ancho | Alto | Largo |
|--------|-------|------|-------|
| Acheron Redhawk Base | 1.80 | 0.93 | 4.70 |
| McCall Manchester Police | 1.95 | 1.15 | 5.26 |
| Bulldozer Police (blindada) | 2.34 | 1.85 | 5.26 |
| Nakazato Cricket Taxi | 2.08 | 1.09 | 4.93 |

---

## Documento maestro de la extracción

Toda la información extraída del bundle —arquitectura con las **98 clases C#
propias del juego**, los 21 coches, la policía, las 100+ piezas de mapa, las 12
pinturas, los 77 materiales, el sistema de progresión y los controles— está en
**[`blacktop-police-chase-assets/BLACKTOP-POLICE-CHASE-MAESTRO.md`](blacktop-police-chase-assets/BLACKTOP-POLICE-CHASE-MAESTRO.md)**.

Ahí también se documenta **cómo integrar el mapa original** (las 100+ piezas de
calle, callejón, muelle, suelo, edificio y monorraíl están extraídas y
listadas; falta montarlas por chunks como hace el original con
`ChunkGenerator` + `Roadpiece`).

---

## 📁 Estructura

```
index.html            entrada (scripts clásicos locales, sin módulos ESM)
styles.css            HUD, menús, garaje y responsive
server.js             servidor estático sin dependencias (npm start)
sw.js                 Service Worker: cachea todo para jugar sin conexión
vendor/three.min.js   Three.js r150 (UMD, MIT) + THREE-LICENSE.txt
src/core.js           constantes, utilidades, idiomas ES/EN y guardado
src/audio.js          motor, sirenas, música y SFX procedurales (WebAudio)
src/models.js         modelos 3D procedurales de respaldo + texturas canvas + partículas
src/objmesh.js        cargador de los .obj originales (sin red) y normalización a escala
src/original-assets.js GENERADO: los 357 .obj y 78 .png originales embebidos
src/city.js           generación de la ciudad, colisiones, retícula y minimapa
src/physics.js        física del coche, daño, derrape y colisiones dinámicas
src/ai.js             tráfico civil + policía, bloqueos, pinchos y helicóptero
src/garage.js         21 coches, 12 pinturas, mejoras y desbloqueos
src/missions.js       misiones, modos, monedas, combos y resultados
src/ui.js             HUD, minimapa, menús, garaje y controles táctiles
blacktop-police-chase-assets/
  models/            357 .obj originales (con geometría real)
  textures/          78 .png originales (pinturas, UI, paletas)
  materials/         77 .json de materiales
  metadata/          inventario por archivo
  ASSET-MANIFEST.json  estado exacto de lo recibido y lo que falta
  BLACKTOP-POLICE-CHASE-MAESTRO.md  informe maestro de la extracción
tools/import-assets.js  genera src/original-assets.js desde models/ y textures/
src/game.js           bucle principal, cámaras y pantalla dividida
tests/smoke.js        127 comprobaciones sin navegador (npm test)
ANALISIS.md           análisis del original + tabla de cobertura de funciones
```

---

## ✅ Verificación

```bash
npm test    # 127 comprobaciones: sintaxis, módulos, lógica, garaje, vehículos, assets, spawns y offline
```

También se probó en Chromium headless real con WebGL: arranque del menú, partida, conducción, ciclo completo del bucle **Modo Original** y del extendido, 60 s de persecución al máximo nivel (bloqueos, pinchos y helicóptero), garaje con los 21 coches, los 4 modos, **pantalla dividida de 2 jugadores**, spawns de policía delante del jugador, resultados, apertura desde `file://` y caché del Service Worker v10 — **0 errores de consola, 0 peticiones fallidas y 0 peticiones a internet**.

---

## ⚖️ Nota sobre los assets y la licencia

**Los assets originales ya están integrados**: los **357 modelos `.obj`**, las
**78 texturas `.png`** y los **77 materiales `.json`** extraídos del `Build.data`
de Unity WebGL del juego real están en `blacktop-police-chase-assets/` y
embebidos en `src/original-assets.js`. El garaje usa ahora los diseños reales
del original en lugar de siluetas inventadas.

Lo que **sigue sin ser copia bit a bit**: el logo, la música, los sonidos y el
SDK con anuncios y leaderboards de Poki / Steelpan Interactive no se han
extraído (los `AudioClip` del bundle no son exportables y el audio del clon
sigue siendo sintetizado en `src/audio.js`). El código fuente del juego
(`Build.wasm`) tampoco se ha decompilado.

⚠️ **Aviso importante**: estos assets son propiedad de **Steelpan Interactive /
Poki** y están protegidos por copyright. Se han integrado aquí para **estudio
personal y offline**. Si este repo va aStaying público, considera mover los
assets a un repositorio **privado** o eliminarlos antes de publicarlo: en ese
caso `node tools/import-assets.js` regenera el módulo vacío y el clon vuelve a
las siluetas procedurales.

Three.js se distribuye bajo licencia MIT (`vendor/THREE-LICENSE.txt`). El resto del código de este repo es propio; úsalo, modifícalo y compártelo libremente para jugar sin conexión.

Para el análisis detallado y la tabla de correspondencia de funciones, ver [ANALISIS.md](ANALISIS.md).

---

## Revisión de arte y jugabilidad

Esta pasada rehízo el apartado visual y corrigió los problemas señalados:

- **Vehículos con silueta propia**: cada coche tiene perfil de carrocería, cabina, cristales, faros, guardabarros con arco, ruedas con buje y detalles exclusivos (toma de aire y franjas del muscle, alerón de los deportivos, baca y portones de la furgoneta, batea del pickup, caja del blindado, ventanales del autobús, letrero del taxi, barras y escudo de la patrulla). El tráfico mezcla **8 tipos distintos** en lugar de repetir un único modelo.
- **Spawns corregidos**: tráfico, patrullas, monedas y power-ups aparecen **delante del jugador**, dentro de su cono de visión, a distancia controlada, sin amontonarse y con aparición gradual (sin *pop-in*).
- **2 jugadores y catálogo completos desde el inicio**: se eliminó el paywall de `$2.500` y la compra de coches/pinturas para acceder; las mejoras y la reparación siguen costando dinero ganado en la partida.
- **Ciudad y luz**: azoteas con maquinaria, marquesinas de colores en planta baja, pasos de cebra definidos, luz de relleno fría, sombra de contacto bajo cada coche, cámara más cercana y arranque en tramo de calle (no sobre un cruce).
- **Cero red**: los modelos, texturas y sonidos siguen siendo 100% procedurales; no se copió ningún asset de Poki/Steelpan.

### Para acercarlo al original de verdad

Lo que aquí hay es una reconstrucción hecha a partir de **texto**, no una copia literal. Si quieres que calque el juego real, adjunta al chat **capturas del original** (partida con el coche visto desde atrás, HUD en persecución, garaje y portada) o los assets originales con licencia. Con imágenes de referencia puedo comparar y ajustar coche, cámara, colores y HUD uno por uno.

---

## Referencia visual (aportada por el usuario)

Se usaron **dos imágenes reales del juego** como referencia de calibración (no se copiaron dentro del juego ni se incluyen en el repo):

- Captura de partida de `gogamego.io` → HUD, cámara, ciudad y flecha verde.
- Portada de `minigamesville.com` → coche naranja `01` con defensas y faros amarillos, y patrulla negra con techo/capó naranja y sirena rojo/azul.

Con ellas se ajustó: **cámara más alta y alejada** (se ve el techo del coche y más ciudad), **líneas de calle blancas** en vez de amarillas, **hierba verde a damero**, **cielo degradado**, **tres estilos de fachada** (rejilla, piedra con arcos y torre de cristal), portales y azoteas, **HUD con contorno** (`Damage`/`Police` en serif itálica, barras huecas de borde blanco, `Money:` verde, botón rojo de rejilla sobre `Pause`, velocímetro `000`), **subtítulo del cartel oculto**, **flechas verdes más grandes**, **patrulla negra con capó/techo naranja** y **capó dorado del muscle**.

Todo sigue siendo geometría y texturas generadas por código: las imágenes solo sirvieron para comparar, no son assets del juego. Para una copia literal harían falta los modelos 3D y texturas originales con licencia.

---

## Assets originales del bundle (integrados)

El 2026-11-09 se recibió un **adelanto documental** con el análisis del
`Build.data` de Unity WebGL del juego real: motor `Unity 2023.2.20f1`,
resolución `960×600`, **21 vehículos base** (357 `.obj` con variantes), 78
texturas `.png`, 77 materiales `.json`, guardado `Blacktop1_Save`, 6 niveles de
persecución y el desglose del mapa (City Road, Alley, Dock, Ground Tiles,
`Building 1..98`, monorraíl, rampas, setos, fuente).

El 2026-11-12 se completaron los archivos: se extrajeron del `Build.data`
(cabecera `UnityFS` en el offset 274) los **357 modelos `.obj` con geometría
real** (121 682 vértices y 77 846 caras en total, ninguno vacío), las **78
texturas `.png`** y los **77 materiales `.json`**, con UnityPy 1.25.4.

El inventario exacto está en
[`blacktop-police-chase-assets/ASSET-MANIFEST.json`](blacktop-police-chase-assets/ASSET-MANIFEST.json)
y los metadatos por archivo en `blacktop-police-chase-assets/metadata/`.

Con ese dato se corrigieron dos cosas reales del clon:

- **Los 6 niveles de persecución ahora se alcanzan.** Antes `LEVEL_THRESHOLDS`
  tenía 6 entradas y el nivel máximo real era 5 pese a `MAX_WANTED = 6`. Ahora
  son 7 umbrales: estado 0 sin policía + niveles 1…6.
- **El garaje pasó de 12 a 21 coches**, con los nombres reales del bundle
  (Acheron Redhawk, Carolina Corsair, Nakazato Cricket, McCall Monaco,
  Bulldozer…), todos desbloqueados desde el inicio como antes. Al verificar
  los meshes uno a uno se corrigieron tres entradas: *DEACONM* → **DEACON
  GROMMIT** (ese es el nombre real), y *LOWPOLY BASIC* / *LOWPOLY SUPERBASIC* →
  **MCCALL MIAMI** / **VERHOEVEN PIRANHA V8**, porque en el bundle no hay
  coches "Lowpoly" sino solo las cuatro ruedas `Wheel Lowpoly *`.

Ahora además **las carrocerías son los modelos originales**: `BTP.ObjMesh`
sustituye las siluetas procedurales por los `.obj` reales, y los **21 coches del
garaje resuelven** a su malla correspondiente (verificado en `npm test`).

Detalle de nombres: en el bundle original el SUV se llama **Perry Navigator**;
el clon lo llama *Jerry Navigator*, así que los `.obj` se renombraron en disco a
`Jerry Navigator *` para que el buscador los resuelva. El nombre original de
cada archivo queda conservado en `metadata/meshes.json`.

⚠️ **Límite legal y técnico**: el repo es **público** y los assets de Steelpan
Interactive / Poki tienen derechos de autor. Se han integrado para estudio
personal; si el repo se publica, mueve los assets a un repo **privado** o
elimínalos (el clon sigue funcionando con las siluetas procedurales).


---

## Diseño 3D según el inventario del bundle

Con los nombres de `Build.data` se amplió la ciudad (siempre con geometría
propia generada por código, sin copiar assets):

- **5 estilos de fachada**: rejilla de oficinas, piedra con arcos, torre de
  cristal, ladrillo *Oldblock* y rascacielos con franjas verticales. Se ajustó
  el peso para que domine la piedra beige de las capturas reales.
- **Monorraíl completo**: viga elevada con **pórticos de soporte en las aceras**
  (nunca un pilar sobre la calzada), `Monorail Corner`, tramo perpendicular,
  `Straight 3x Support`, **`Building Monorail Station`** y un tren con morro
  *Front*, coche *Rear*, ventanas corridas, puertas, franja y bogies con ruedas.
- **Parques**: `Fountain` con pilas, surtidor y gotas, `Statue Pedestal Generic`,
  `Ramp` / `Double Ramp`, y setos `Hedge Straight / Corner / Edge / Half / Gate`
  instanciados en el perímetro (720 tramos) con abertura de acceso.
- **Callejones**: `Alleywall` en 3D a ambos lados del paso estrecho.
- Se eliminó una declaración duplicada de `InstancedMesh` en `buildBlocks`.

Verificado en Chromium real: **771 draw calls / ~63.800 triángulos**, 20 mallas
instanciadas, **0 errores de consola y 0 peticiones a internet**.


---

## Integración de los diseños originales (COMPLETADA)

Los modelos, texturas y materiales del juego real **ya están integrados**:

- `blacktop-police-chase-assets/models/` — **357 `.obj`** con geometría real
  (121 682 vértices, 77 846 caras; ninguno vacío)
- `blacktop-police-chase-assets/textures/` — **78 `.png`** (las 12 pinturas
  `CarsPaletteV2` más UI, logotipos y paletas del mapa)
- `blacktop-police-chase-assets/materials/` — **77 `.json`**
- `blacktop-police-chase-assets/metadata/` — inventario por archivo
  (`meshes.json`, `textures.json`, `materials.json`)

Procedimiento aplicado:

1. Descargar el bundle del juego (`Build.data`, cabecera `UnityFS` en el offset
   274) del CDN del distribuidor.
2. Extraer los assets con **UnityPy 1.25.4** (`Mesh.export()` genera `.obj` con
   la geometría real, ya que el bundle va sin compresión).
3. Renombrar `Perry Navigator *` → `Jerry Navigator *` para que coincidan con
   los nombres del garaje del clon.
4. `node tools/import-assets.js` → genera `src/original-assets.js` (14 MB) con
   los `.obj` como texto y los `.png` como data URI.
5. `npm test` → **127 comprobaciones OK, 0 fallos**, incluidos los 21 vehículos
   resolviendo a su malla real (y de forma **exacta y única**, con un campo
   `asset` explícito por coche).

El importador embebe los datos en `src/original-assets.js` (sin `fetch`, sin
CDN, sin imports ESM), así que sigue funcionando **sin wifi y con `file://`**.
Los coches devuelven el modelo real normalizado a 4.7 de largo, con la misma
interfaz (`spin`, `setColor`, `setSiren`). Sin `.obj`, el fallback procedural
sigue activo y el juego no se rompe.

Lo que **sigue faltando**: audio (los `AudioClip` del bundle no son
exportables; el sonido continúa sintetizado en `src/audio.js`) y el código
fuente del juego (`Build.wasm` sin decompilar).

⚠️ Los assets son de Steelpan Interactive / Poki y este repo es **público**:
para uso personal y offline. Si se publica comercialmente, mueve los assets a
un repo **privado** o elimínalos.


---

## Acceso SSH (para tu propia computadora)

**Aquí no hay claves privadas ni se entregan por chat**: una clave que pasa por
un mensaje queda comprometida. Ejecuta en tu máquina:

```bash
bash tools/setup-ssh.sh
```

El script genera el par ed25519 localmente, **imprime solo la clave pública**
y te indica dónde pegarla (Settings → SSH and SSH keys, o Deploy keys de este
repo con *Allow write access*). Guía completa en `tools/ACCESO-SSH.md`.

SSH: `git@github.com:gaboexperimetos-ui/blak--top-police-chase-.git` ·
Rama: `arena/8143a957-blak-top-police-chase`.

Si lo que buscas es que **otro agente suba archivos**, no necesita SSH: que te
pase un único `.tar.gz` y adjúntalo al chat; Arena ya tiene permisos de push.
