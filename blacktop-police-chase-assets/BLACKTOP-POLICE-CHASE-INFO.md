# Blacktop Police Chase — Información completa del juego (adelanto documental)

> **Estado del archivo**: este documento contiene **solo metadatos, nombres y
> análisis** del juego original, aportados por el agente OpenCode el 2026-11-09.
> **NO contiene ningún modelo 3D, textura, material ni audio** del juego.
> Es el «pequeño adelanto» previo a la entrega de los archivos reales.
>
> ⚠️ **Aviso legal**: Blacktop Police Chase es propiedad de **Steelpan
> Interactive** y se distribuye en Poki a través de GameMonetize. Los assets
> (`.obj`, `.png`, `.json` de materiales, sonidos) están protegidos por derechos
> de autor. Este repositorio es **público**, por lo que **no se deben subir aquí
> los activos extraídos sin permiso expreso del desarrollador**. La documentación
> sí puede estar: describe hechos y nombres, no copia contenido protegido.

## 1. Descripción del juego

Juego de conducción gratuito en navegador donde el jugador es el *wheelman*
(conductor) de un banco robado. Debe recoger a los ladrones, llevarlos al
escondite esquivando a una policía cada vez más agresiva, ganar dinero y
desbloquear mejores autos y camiones.

| Dato | Valor |
| --- | --- |
| Desarrollador | Steelpan Interactive |
| Plataforma | Poki (HTML5, navegador web) |
| Género | Conducción / persecución policial / *getaway* |
| Versión analizada | Noviembre 2026 |
| Motor | **Unity WebGL 2023.2.20f1** |
| Resolución | **960 × 600** |
| Plataformas | Computadora, celular y tableta |
| Fuente del análisis | Archivos del juego en CDN de GameMonetize (distribuidor de Poki) |
| Estado | Extracción completa de modelos 3D, texturas y materiales (en la máquina de origen) |

**Controles oficiales**

| Acción | Tecla |
| --- | --- |
| Conducir | `WASD` o flechas |
| Frenar | `Espacio` |
| Mirar atrás | `B` |
| Reiniciar coche | `Shift` |

**Progreso**

- Se gana dinero entregando ladrones de banco en el escondite.
- La policía se vuelve más agresiva cuanto más tiempo se sobrevive: **6 niveles de persecución**.
- Con el dinero se compran nuevos autos y camiones en el garaje.
- Cada vehículo tiene stats únicos: velocidad, tracción/peso, durabilidad/salud.
- Hay **12 opciones de pintura** por vehículo.
- Guardado: **`Blacktop1_Save`** (dinero, vehículos desbloqueados, puntuación máxima).

## 2. Los 21 vehículos base desbloqueables

Total de modelos 3D de vehículos: **357 archivos `.obj`** (incluyendo variantes
de pintura, policía y especiales).

| # | Vehículo base | Variantes encontradas |
| --- | --- | --- |
| 1 | Carolina Corsair | Cargo, Medivac, Taxi, Two-Tone, Two-Tone Cool-Team |
| 2 | Automobili Mangione 4000 | Base, Polizia, Taxi, Driving School, Inverted, Park Ranger |
| 3 | Bald Eagle | Racecar |
| 4 | Chevalier Bonheur | Taxi |
| 5 | Chevalier XIV | Primary, Secondary, Taxi |
| 6 | Deacon Mayflower | — |
| 7 | DeaconM | — |
| 8 | Jerry Navigator | Construction, Police, SUV, SUV Chief, SUV Police, SUV Taxi, Two-Tone |
| 9 | Merkur 668 | Convertible, Convertible Primary, Convertible Secondary, Police, Polizei, Rijkspolitie, Taxi |
| 10 | McCall Monaco | Bald Eagle, Bald Eagle Racecar, Driving School, General Jacques, State Police |
| 11 | McCall Manchester | Hardtop, Police, State Trooper |
| 12 | McCall Montpellier | Gendarmerie, Police Simple Base Paletted |
| 13 | Monaco Bald Eagle | Racecar |
| 14 | Monaco Driv | — |
| 15 | Nakazato Cricket | Base, State Trooper, Taxi, Twotone, Twotone Inverted |
| 16 | Pilgrim | Base Simple Paletted, State Police |
| 17 | Station Wagon | Base Simple Paletted, Hearse |
| 18 | Acheron Redhawk | Base, Mischief *A, Mischief* B, Primary, Primary Secondary |
| 19 | Lowpoly Basic | Paletted |
| 20 | Lowpoly SuperBasic | Paletted, Thick, Thin |
| 21 | Bulldozer | Bulldozer, Bulldozer Police |

## 3. Los 12 colores de pintura (CarsPaletteV2)

Total de texturas de pintura: **78 archivos `.png`**. El índice del bundle
mezcla la paleta de jugador con libreas policiales/especiales; los colores
jugables son Rojo, Amarillo, Azul, Verde, Blanco, Beige, Marrón, Dorado,
Morado, Rosa, Turquesa y las combinaciones Marrón-Beige / Negro-Amarillo.

| # | Nombre de la pintura |
| --- | --- |
| 0 | Template |
| 1 | Police Blue White / Red |
| 2 | Police Black White / Yellow |
| 3 | Blue |
| 4 | Green / Park Ranger |
| 5 | Police France / White |
| 6 | Beige / Medivac |
| 7 | Brown / Chief |
| 8 | Dutch and German Police / Gold |
| 9 | Purple |
| 10 | Driving School / Pink |
| 11 | Taxi / Turquoise |
| 12 | Hearse |
| 13 | General Jacques |
| 14 | Bald Eagle Racecar |
| 100 | Brown Beige |
| 101 | Black Yellow |

## 4. Listado de modelos 3D detectados en `Build.data`

> Nota: a continuación están los **nombres detectados** tal cual se recibieron.
> El total declarado es 357 `.obj`; este listado es el subconjunto nombrado en
> el informe.

### 4.1 Vehículos del jugador (desbloqueables)

**Acheron Redhawk**: Base, Mischief _A, Mischief _B, Police, Primary,
Primary Secondary.

**Automobili Mangione 4000**: Base, Driving School, Inverted, Park Ranger,
Polizia, Taxi.

**Bald Eagle**: Racecar.

**Chevalier Bonheur**: Base, Gendarmerie, Taxi.

**Chevalier XIV**: Base, Gendarmerie, Primary, Racing Stripes, Racing Stripes
Inverted, Secondary, Taxi.

**Deacon Mayflower**: Deacon Grommit, Base Simple Paletted.

**Jerry Navigator**: Construction, Police, SUV, SUV Chief, SUV Police, SUV Taxi,
Two-Tone.

**Merkur 668**: Convertible, Convertible Primary, Convertible Secondary, Police,
Polizei, Rijkspolitie, Taxi.

**McCall Monaco**: Base, Bald Eagle, Bald Eagle Racecar, Driving School,
General Jacques, State Police.

**McCall Manchester**: Hardtop, Police, State Trooper.

**McCall Montpellier**: Gendarmerie, Police Simple Base Paletted, Taxi.

**Monaco Bald Eagle**: Base, Racecar. **Monaco Driv**: —.

**Nakazato Cricket**: Base, State Trooper, Taxi, Twotone, Twotone Inverted.

**Pilgrim**: Base Simple Paletted, State Police.

**Station Wagon**: Base Simple Paletted, Hearse.

**Lowpoly Basic**: Paletted. **Lowpoly SuperBasic**: Paletted, Paletted Thick,
Paletted Thin.

### 4.2 Vehículos policiales (enemigos, no desbloqueables)

Bulldozer, Bulldozer Police; Carolina Corsair Cargo / Medivac / Taxi; Carolina
Pilgrim Base Simple Paletted / State Police / Taxi; Chevalier Bonheur
Gendarmerie; Chevalier XIV Gendarmerie; Jerry Navigator Police / SUV / SUV Chief
/ SUV Police / SUV Taxi / Two-Tone; McCall Monaco Bald Eagle Racecar / General
Jacques / State Police; McCall Manchester Police / State Trooper; McCall
Montpellier Gendarmerie / Police Simple Base Paletted / Taxi; Merkur 668 Police
/ Polizei / Rijkspolitie; Nakazato Cricket State Trooper / Taxi; Perry Navigator
Police / SUV / SUV Chief / SUV Police / SUV Taxi / Two-Tone; Police Car Antenna;
Police Car Lightbar 4000 (+ Inverted), Bulbs, Centerpole (+ Inverted), Lightbar
(+ Inverted), Lightbar Paletted (+ Inverted); Police Car Lightbulb Paletted
(+ Inverted); Police Rijkspolitie Bulb (+ Inverted).

### 4.3 Elementos del mapa

**City Road**: Bump, Bump Bridge, Bump Collider, Corner 1x1, Corner 2x2, Corner
Grass 1x1, Corner Grass 2x2, Crossroads Small, Crossroads Small 1 Grass,
Crossroads Small w Grass, Crossroads With Alley, Dock Corner Inside 2x2, Dock
Corner Outside 2x2, Straight, Straight Grass Full, Straight Grass Half, Straight
To Alley Crossroad, Straight To Alley T-Piece, Straight To Straight w Grass,
Straight With Grass, T-Piece Small, T-Piece w Grass.

**Alley**: Corner 1x1, Crossroads, Straight, T-Piece; `Alleywall 3 Long 7`;
`Alleywall 4 Long 1..7`; `Alleywall 6 Long 2,4,5,6,7,8,9`.

**Docks**: Block, Corner Inside, Corner Outside, Straight, Corner Inside Wall
Half 1, Corner Outside 2x2 Wall Full / Wall Half, Corner Outside Wall, Straight
3L (+ Collider), Straight Wall Full / Wall Half 1 / Wall Half 2.

**Ground Tiles**: 1x1, 1x1 Grass, 1x1 Parkpath, 1x1 Parkpath 2, 1x2, 1x2 Grass,
1x2 Grass and Pavement, 1x2 Mixed 1, 1x2 Parkpath 1, 1x2 Parkpath 2, 2x2, 2x2
Grass, 2x2 Mixed 1, 2x2 Parkpath 1, 2x2 Parkpath 2, 2x3, 3x3, Raised Grass
1x1 / 1x2 / 1x3, Raised Park 2x2 / 2x3.

**Tile Collider**: Dock Corner Inside 2x2, Dock Corner Outside 2x2, 1x1, 1x2,
1x3, 2x2, 2x3, 3x3, Raised Park 1x1 Part A / Part B, 1x2 Part A / Part B, 1x3
Part A / Part B, 2x2, 2x3 Part A / Part B / Part B.001.

**Edificios**: `Building 1` … `Building 98` (incluye variantes Skyscraper,
Riverside, Oldblock, Half); `Building Filler 1..6`; `Building Monorail Station`.

**Otros elementos urbanos**: Wall 2, Wall 3, Wall 3 A, Wall 6 Thick, Wall 6
Thick Center; Ramp, Double Ramp; Fountain; Tree Pine 2, Tree Regular; Hedge
Corner / Edge / Gate / Half / Straight; Guy Arm, Guy Missing Arm Arm Down; House
Icon; Learner Sign; Mayflower Chassis (Car Placeholder); Monorail Corner 1x1 /
Corner 2x2 / Front / Middle / Rear / Straight / Straight 3x Support / Straight
Support; Statue Pedestal Generic; Target Cylinder / Target Cylinder Opaque.

### 4.4 Varios y UI

Car Exclamation Mark, Coin, Flag, Gibson Step-Up (+ Police), Perry Navigator
variants (Construction, Police, SUV, SUV Chief, SUV Police, SUV Taxi, Two-Tone),
Verhoeven Piranha V8.

## 5. Lista de texturas (78 archivos `.png`)

| # | Nombre | Dimensiones |
| --- | --- | --- |
| 0 | 0 - CarsPalette - Template | 32×32 |
| 1 | 1 - CarsPaletteV2 - Police Blue White | 128×128 |
| 2 | 1 - CarsPaletteV2 - Red | 128×128 |
| 3 | 2 - CarsPaletteV2 - Police Black White | 128×128 |
| 4 | 2 - CarsPaletteV2 - Yellow | 128×128 |
| 5 | 3 - CarsPaletteV2 - Blue | 128×128 |
| 6 | 4 - CarsPaletteV2 - Green | 128×128 |
| 7 | 4 - CarsPaletteV2 - Park Ranger | 128×128 |
| 8 | 5 - CarsPaletteV2 - Police France | 128×128 |
| 9 | 5 - CarsPaletteV2 - White | 128×128 |
| 10 | 6 - CarsPaletteV2 - Beige | 128×128 |
| 11 | 6 - CarsPaletteV2 - Medivac | 128×128 |
| 12 | 7 - CarsPaletteV2 - Brown | 128×128 |
| 13 | 7 - CarsPaletteV2 - Chief | 128×128 |
| 14 | 8 - CarsPaletteV2 - Dutch and German Police | 128×128 |
| 15 | 8 - CarsPaletteV2 - Gold | 128×128 |
| 16 | 9 - CarsPaletteV2 - Purple | 128×128 |
| 17 | 10 - CarsPaletteV2 - Driving School | 128×128 |
| 18 | 10 - CarsPaletteV2 - Pink | 128×128 |
| 19 | 11 - CarsPaletteV2 - Taxi | 128×128 |
| 20 | 11 - CarsPaletteV2 - Turquoise | 128×128 |
| 21 | 12 - CarsPaletteV2 - Hearse | 128×128 |
| 22 | 13 - CarsPaletteV2 - General Jacques | 128×128 |
| 23 | 14 - CarsPaletteV2 - Bald Eagle Racecar | 128×128 |
| 24 | 100 - CarsPaletteV2 - Brown Beige | 128×128 |
| 25 | 101 - CarsPaletteV2 - Black Yellow | 128×128 |
| 26 | Arrow Icon | 64×64 |
| 27 | Background | 32×32 |
| 28 | BankRobber | 64×64 |
| 29 | Brake | 64×64 |
| 30 | BuildingPalette1 | 256×256 |
| 31 | Coin / 32 CoinGreen / 33 CoinRed | 64×64 |
| 34 | ControlsPSD | 1024×256 |
| 35 | Cops | 64×64 |
| 36 | EmojiOne | 32×32 |
| 37 | Empty Icon | 64×64 |
| 38 | Fill Bar | 128×64 |
| 39 | Filled Icon | 64×64 |
| 40 | Forward | 32×32 |
| 41 | Garage | 32×32 |
| 42 | GreenArrow | 64×64 |
| 43 | Guy_Robber | 128×128 |
| 44 | House | 64×64 |
| 45 | Logo v1 Cropped | 256×64 |
| 46 | Logo v2 Cropped | 512×128 |
| 47 | Mischief Hood Details | 128×128 |
| 48 | MochiyPopOne-Regular SDF Atlas | 512×512 |
| 49 | MuteOff / 50 MuteOn | 32×32 |
| 51 | OnePeople | 16×32 |
| 52 | Return | 32×32 |
| 53 | Settings | 32×32 |
| 54 | SmokeParticle | 32×32 |
| 55 | Splash Screen Unity Logo | 2048×1024 |
| 56 | Subway-Black SDF Atlas | 512×512 |
| 57 | TargetParticle | 32×32 |
| 58 | TimerClock | 128×128 |
| 59 | ToggleOff / 60 ToggleOn | 32×32 |
| 61 | TwoPeople | 32×32 |
| 62 | WatchAd | 64×64 |
| 63 | Water PSD | 64×64 |
| 64 | YRDZST Semibold SDF Atlas | 512×512 |
| 65 | _RoadPalette - Desert | 256×256 |
| 66 | _RoadPalette - Template | 256×256 |
| 67 | _RoofDecoPalette - Learner | 64×32 |
| 68 | _TreesPalette | 128×128 |
| 69 | _WheelsPalette | 128×128 |
| 70 | button_square_gloss | 64×64 |
| 71 | keyboard arrows | 128×128 |
| 72 | keyboard arrows shadow | 128×128 |
| 73 | keyboard wasd shadow | 128×128 |

## 6. Materiales (77 archivos `.json`)

`2_Midday_2`, `Bank Robber Cylinder`, `Blue`, `Car - Palette - General Jacques`,
`Car - Palette - Racecar`, `Car - Palette Beige`, `Car - Palette Black Yellow`,
`Car - Palette Blue`, `Car - Palette Brown`, `Car - Palette Brown Beige`,
`Car - Palette Chief`, `Car - Palette Dark Red Black`, `Car - Palette Driving
School`, `Car - Palette Gold`, `Car - Palette Green`, `Car - Palette Hearse`,
`Car - Palette Medivac`, `Car - Palette Park Ranger`, `Car - Palette Pink`,
`Car - Palette Police - Black White`, `- Blue White`, `- DutchGer`, `-
Gendarmerie`, `- State`, `Car - Palette Purple`, `Car - Palette Red`, `Car -
Palette Taxi`, `Car - Palette Turquoise`, `Car - Palette White`, `Car - Palette
White Light Blue`, `Car - Palette Yellow`, `Car - Palette Yellow Orange`,
`Debug_HitPlane`, `Default-Material`, `Gradients2`, `Green`, `Green Bright`,
`GreenScreen`, `Guy_Robber`, `Hideout Cylinder`, `Hideout Cylinder House`,
`Indicator_Enemy`, `Indicator_House`, `Indicator_Robber`, `Indicator_Target`,
`Light Blue`, `Mischief - Hood Eagle / Flamingo / Phoenix / Scorpion`,
`MochiyPopOne-Regular SDF Material`, `Orange`, `Red`, `Smoke Particle`,
`Sprites-Default`, `Subway-Black Clean / DarkShadow / Outline / Outline2 /
SDF Material / SmallShadow`, `TextMeshPro/Sprite`, `Warm Yellow`, `White`,
`YRDZST Semibold SDF Material`, `_BodyMedivac`, `_Building`, `_Car - Palette
Template`, `_Coin`, `_CoinGreen`, `_CoinRed`, `_Road - Desert`, `_Road - Palette
Template`, `_Roof Deco - Learner`, `_Trees`, `_Water`, `_Wheel`.

## 7. Mapa / escenarios

**Niveles detectados**: `alevel0` (inicial), `Level 3P`, `AppendLevel5`,
`CategoryLevel1Index`, `CategoryLevel2Index`, `CategoryLevel3Index`.

**Entorno**: City + variantes de City Road, Alley, Dock, Ground Tiles,
`Building 1..98` (Skyscraper, Riverside, Oldblock), Monorail (Corner, Front,
Middle, Rear, Straight, Support), Tree, Hedge, Wall, Ramp, Fountain.

## 8. Sistema de garaje y progreso

- **Objetivo**: recoger ladrones de banco, llevarlos al escondite, ganar dinero.
- **Moneda**: `money` (guardada en `Blacktop1_Save`).
- **Vehículos desbloqueables**: `unlockedCars` (grilla de vehículos).
- **Puntuación máxima**: `hiScore`.
- **Mecánica de compra**: `BuyCurrentCar`, `clickToBuyCar`, `clickToUnlockCar`.
- **Garaje UI**: `GarageCanvasPanel`, `buyCarPanel`, `carNameText`, `carCost`,
  `carHealth`, `carLabel`, `carInfo`, `colorLabel`, `statSpeedText`,
  `statHealthBar`.
- **Estadísticas del coche**: `speed`, `grip`/`traction`, `weight`,
  `health`/`durability`.

## 9. Datos técnicos del archivo

| Dato | Valor |
| --- | --- |
| Formato | Unity WebGL (`UnityWebData 1.0`) |
| Archivo principal | `Build.data` |
| Motor | Unity 2023.2.20f1 |
| CDN de distribución | `html5.gamemonetize.co/mhp35jy4xz6nx1fg8cdl4lpkyzlslgyp/` |
| Offset del header UnityFS | 274 bytes (`0x112`) |
| Archivos internos | `Build.data`, `data.unity3d`, `globalgamemanagers.assets`, `RuntimeInitializeOnLoadManager.js`, `ScriptingAssemblies.metadata`, `resources/unity_builtin_extra` |
| Módulos Unity | CoreModule, PhysicsModule, UIModule, UIElementsModule, AnimationModule, AudioModule… |
| Product Name | Blacktop Police Chase |
| Company Name | Blacktop / Steelpan Interactive |
| Product Version | 1.0 |
| Resolution | 960 × 600 |

## 10. Notas legales

Los activos están protegidos por derechos de autor. Esta información se extrajo
con fines de estudio personal y archivado privado. **No se recomienda
distribuir públicamente los activos sin permiso expreso del desarrollador.**
Si se suben a GitHub, debe hacerse en un repositorio **privado**.

## 11. Cómo usar esta información

1. Guardar este documento como `BLACKTOP-POLICE-CHASE-INFO.md`.
2. Los `.obj` se abren en Blender, Maya o cualquier visor 3D.
3. Los `.png` con cualquier visor de imágenes; los `.json` con un editor de texto.
4. `summary.json` y `names_detailed.json` contienen los metadatos completos.

### Estructura prevista para los archivos (cuando lleguen)

```
blacktop-police-chase-assets/
├── BLACKTOP-POLICE-CHASE-INFO.md   ← este documento
├── models/                         ← 357 archivos .obj
├── textures/                       ← 78 archivos .png
├── materials/                      ← 77 archivos .json
└── metadata/                       ← summary.json, names_detailed.json
```

---

## 12. Qué se ha integrado ya en este clon (2026-11-09)

A partir de este adelanto, y **sin incorporar ningún asset protegido**, se
aplicaron los datos verificables al proyecto:

| Dato del original | Acción en el clon |
| --- | --- |
| **6 niveles de persecución** | `src/ai.js` pasó de 6 umbrales (nivel máximo real 5) a **7 umbrales**: estado 0 sin policía + niveles 1…6, coherente con `C.MAX_WANTED = 6`. |
| **21 vehículos base** | `src/garage.js` amplió el catálogo de 12 a **21 coches** con los nombres reales del bundle; `src/core.js` los concede a todos en `unlocked`. Las siluetas siguen siendo las 11 procedurales de `src/models.js`. |
| **12 pinturas** | Se documenta la paleta real (`CarsPaletteV2`); las 12 pinturas del clon se mantienen como equivalentes aproximados para no romper la calibración visual. |
| **Guardado `Blacktop1_Save`** | Se documenta. El clon conserva su propia clave `btp-offline-save-v1` para no invalidar partidas ya guardadas. |
| **Mapa con monorraíl, muelles, rampas, setos, fuente** | Queda como siguiente paso de réplica procedural; no se ha implementado todavía. |
| **Unity 2023.2.20f1 / 960×600** | Se documenta como referencia técnica; el clon usa Three.js y canvas responsive. |

**Límite sin resolver**: seguir reconstruyendo a partir de nombres y capturas
no produce una copia bit a bit. Para la identidad visual exacta harían falta
los modelos, texturas y audio originales **con licencia**, y el repo tendría que
ser privado. Mientras tanto el juego sigue siendo 100% offline y procedural.
