# BLACKTOP: POLICE CHASE — clon jugable 100% OFFLINE

Recreación completa y **original** del juego de Poki *Blacktop: Police Chase* (Steelpan Interactive), hecha para jugar **sin wifi**: ciudad 3D low-poly, atracos, persecución policial de 6 niveles, **11 siluetas de vehículo distintas** y arte calibrado con capturas reales, garaje con 12 coches y 12 pinturas (todo disponible desde el inicio), monedas, mejoras, minimapa, modos de juego, sonido procedural y pantalla dividida para 2 jugadores.

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
- **Garaje:** 12 coches con estadísticas de velocidad / agarre / peso / salud y **11 siluetas 3D propias** (muscle, sedán, compacto, deportivo, super, hyper, patrulla, furgoneta, pickup, blindado y autobús de tráfico), 12 pinturas, 4 líneas de mejoras × 5 niveles y reparación. Todo el catálogo y el modo 2 jugadores están accesibles desde el inicio; el progreso se guarda en `localStorage`.
- **Modos:** Misiones, Huida infinita, Contrarreloj (10 puntos de control), Desafíos (adelantamientos, monedas, derrape) y 2 jugadores.
- **Economía y puntuación:** monedas `$` por la ciudad, botín, multiplicadores por combo, adelantamientos peligrosos, derrapes y récords persistentes.
- **HUD completo:** daño, policía, nivel de persecución, dinero, puntos, velocímetro, nitro, temporizador, distancia al objetivo, minimapa a pantalla completa, avisos y FPS opcional.
- **Audio 100% sintetizado:** motor, sirenas, helicóptero, monedas, choques, nitro, atraco, música y efectos de menú (WebAudio).
- **Extras:** pausa, pantalla completa, ajustes (volumen, calidad, sombras, cámara, idioma ES/EN, FPS), ayuda integrada, controles táctiles, guardado automático y pantalla de resultados.

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
src/models.js         TODOS los modelos 3D low-poly + texturas canvas + partículas
src/city.js           generación de la ciudad, colisiones, retícula y minimapa
src/physics.js        física del coche, daño, derrape y colisiones dinámicas
src/ai.js             tráfico civil + policía, bloqueos, pinchos y helicóptero
src/garage.js         12 coches, 12 pinturas, mejoras y desbloqueos
src/missions.js       misiones, modos, monedas, combos y resultados
src/ui.js             HUD, minimapa, menús, garaje y controles táctiles
src/game.js           bucle principal, cámaras y pantalla dividida
tests/smoke.js        99 comprobaciones sin navegador (npm test)
ANALISIS.md           análisis del original + tabla de cobertura de funciones
```

---

## ✅ Verificación

```bash
npm test    # 99 comprobaciones: sintaxis, módulos, lógica, garaje, vehículos, spawns y offline
```

También se probó en Chromium headless real con WebGL: arranque del menú, partida, conducción, ciclo completo del bucle **Modo Original** y del extendido, 60 s de persecución al máximo nivel (bloqueos, pinchos y helicóptero), garaje con los 12 coches, los 4 modos, **pantalla dividida de 2 jugadores**, spawns de policía delante del jugador, resultados, apertura desde `file://` y caché del Service Worker v6 — **0 errores de consola, 0 peticiones fallidas y 0 peticiones a internet**.

---

## ⚖️ Nota sobre los assets y la licencia

**No es una copia bit a bit**: los **archivos originales** de Poki / Steelpan Interactive (su bundle compilado, sus modelos `.glb`/texturas, su logo, su música y su SDK con anuncios/leaderboards) son propietarios, están protegidos por copyright y **no se pueden extraer ni publicar en un repositorio**. Tampoco están disponibles como archivos sueltos: Poki sirve un bundle cerrado. Este repositorio contiene una **recreación original**: cada coche, edificio, personaje, textura, efecto y sonido se genera por código con geometría procedural, con una estética low-poly equivalente. El nombre del juego se usa solo para describir la obra clonada.

Si tú dispones de los assets originales **con derechos/licencia para usarlos**, pásalos al repo y los integro tal cual (modelos, texturas y audio) para alcanzar una identidad visual literal; lo que no puedo hacer es descargarlos de Poki ni redistribuirlos por mi cuenta.

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
