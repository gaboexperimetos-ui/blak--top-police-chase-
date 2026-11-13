# Blacktop Police Chase — Extracción completa del bundle original

> Documento maestro generado por extracción directa del `Build.data`
> (Unity WebGL, cabecera `UnityFS` en el offset 274) del juego real.
> Motor **Unity 2023.2.20f1**, resolución **960×600**, producto *Blacktop Mobile*,
> compañía **Steelpan Interactive**.
> Todo lo de abajo está extraído de los archivos del juego, no de documentación externa.

---

## 1. Arquitectura del juego (98 clases propias)

Clases C# del juego recuperadas del bundle (`MonoScript`). Cada una es una pieza
de la lógica original:

### Mundo y mapa

- `ChunkGenerator`
- `Roadpiece`
- `RegisterRaycastSurface`
- `StaticRaycastSurfaceManager`
- `StaticDistancesManager`
- `MonorailDriver`
- `ScrollWaterTexture`
- `LowQualityMesh`
- `LowQualityMaterials`
- `TestFindClosestWaypoint`
- `TestDaTriangles`
- `RendererHelper`

### Vehículos y conductive

- `CarSetup`
- `CarSetup_PlayerPolice`
- `CarSetup_Visuals`
- `Class_WeightedCarSetup`
- `ListOfCars`
- `LiveCarDatabase`
- `SetupCar`
- `CarSpawner`
- `CarBrain`
- `CarDamage`
- `CarWheel`
- `CarInput`
- `CarAudio`
- `CarDisplayBobber`
- `CameraHolderFollowCar`
- `BobAndRotate`
- `VehicleHolder`

### Policía y persecución

- `DamageAndPolice`
- `PoliceCarDistanceAnimation`
- `PolicePalette`
- `EnemyIndicator`
- `OtherPlayerPoliceTargetArrow`
- `BotInput`
- `Caffeinate`

### Economía, guardado y progresión

- `EconomyManager`
- `SaveSystem`
- `SaveableData`
- `DebugSaveData`
- `GarageManager`
- `GarageCanvasPanel`
- `GarageCamposSwitcher`
- `MoneyButton`
- `MoneyGainedAnimation`
- `DrawMoney`
- `DrawSpeedometer`

### Objetivos, ladrones y escondites

- `BankRobberGameplay`
- `RobberWaveArm`
- `TargetTag_Hideout`
- `TargetTag_Robber`
- `CurrentObjectiveUI`
- `NextTargetIndicator`
- `SingleIndicator`
- `CoinCollectible`

### Interfaz, cámara y multijugador

- `GameGUIManager`
- `GameOverUIManager`
- `GameOverTutorial`
- `CanvasSwitcher`
- `SplitscreenGUIManager`
- `SplitscreenGarage`
- `SplitscreenCarSelector`
- `StartTwoPlayer`
- `PausePanel`
- `CrappyControlsMenu`
- `DisplayNewText`
- `StaticUIDatabase`
- `RainbowImages`
- `RainbowText`
- `ExamplePlayerController`

### Plataforma y ajustes

- `PokiSDKManager`
- `PokiUnitySDK`
- `Settings`
- `LoadSettingsStartup`
- `CheckIfMobile`
- `SimpleInput`
- `SimpleInputHelper`
- `DisableSingleplayerSound`
- `DisableRenderer`
- `FPSCalculator`
- `FpsCounter`
- `Editor`
- `DebugInput`
- `OpenInFileBrowser`

### Correcciones de bugs (el original lleva parches propios)

- `EdgeBug2021`
- `EdgeBug2024`
- `EdgeBugDatabase`
- `FixEdgeBug2021`
- `RegisterFixEdgeBug`
- `TestTargetGameplay`
- `TestAllTranslations`

---

## 2. Los 21 coches del garaje

El bundle tiene **19 familias de coche reales**; las variantes son *liveries*
del mismo chasis (policía, taxi, gendarmerie, dos tonos, etc.).
Los 21 coches del garaje del clon usan 21 mallas distintas del original.

| # | Coche | Malla `.obj` original | Vértices |
|---|-------|------------------------|----------|
| 1 | ACHERON REDHAWK | `Acheron Redhawk Base` | 744 |
| 2 | NAKAZATO CRICKET | `Nakazato Cricket Base` | 859 |
| 3 | CHEVALIER XIV | `Chevalier XIV` | 733 |
| 4 | MERKUR 668 | `Merkur 668 Convertible` | 1280 |
| 5 | JERRY NAVIGATOR SUV | `Jerry Navigator SUV` | ? |
| 6 | PILGRIM | `Carolina Pilgrim Base Simple Paletted` | 862 |
| 7 | AUTOMOBILI MANGIONE 4000 | `Automobili Mangione 4000 Base` | 1234 |
| 8 | MCCALL MANCHESTER POLICE | `McCall Manchester Police` | 932 |
| 9 | BALD EAGLE RACECAR | `McCall Monaco Bald Eagle Racecar` | 703 |
| 10 | BULLDOZER | `Bulldozer` | 940 |
| 11 | MCCALL MONACO | `McCall Monaco` | 550 |
| 12 | MONACO BALD EAGLE | `McCall Monaco Bald Eagle` | 691 |
| 13 | CAROLINA CORSAIR | `Carolina Corsair Cargo` | 684 |
| 14 | CHEVALIER BONHEUR | `Chevalier Bonheur` | 1138 |
| 15 | DEACON MAYFLOWER | `Deacon Mayflower Base Simple Paletted` | 616 |
| 16 | DEACON GROMMIT | `Deacon Grommit` | 613 |
| 17 | MCCALL MONTPELLIER | `McCall Montpellier Gendarmerie` | 936 |
| 18 | MONACO DRIV | `McCall Monaco Driving School` | 608 |
| 19 | STATION WAGON | `Station Wagon Base Simple Paletted` | 808 |
| 20 | MCCALL MIAMI | `McCall Miami` | 686 |
| 21 | VERHOEVEN PIRANHA V8 | `Verhoeven Piranha V8` | 1275 |

---

## 3. Vehículos de la policía (enemigos)

La policía usa **mallas propias**, no las del jugador. Estas son todas las
variantes Police del bundle:

- `Acheron Redhawk Mischief _A` — 705 vértices
- `Acheron Redhawk Mischief _B` — 39 vértices
- `Acheron Redhawk Police` — 901 vértices
- `Bulldozer Police` — 950 vértices
- `Carolina Pilgrim State Police` — 897 vértices
- `Chevalier Bonheur Gendarmerie` — 1290 vértices
- `Chevalier XIV Gendarmerie` — 737 vértices
- `Gibson Step-Up Police` — 1047 vértices
- `McCall Manchester Police` — 932 vértices
- `McCall Manchester State Trooper` — 962 vértices
- `McCall Monaco State Police` — 760 vértices
- `McCall Montpellier Gendarmerie` — 936 vértices
- `McCall Montpellier Police Simple Base Paletted` — 656 vértices
- `Merkur 668 Police` — 1268 vértices
- `Merkur 668 Polizei` — 1262 vértices
- `Merkur 668 Rijkspolitie` — 1252 vértices
- `Nakazato Cricket State Trooper` — 902 vértices
- `Perry Navigator Police` — 774 vértices
- `Perry Navigator SUV Chief` — 694 vértices
- `Perry Navigator SUV Police` — 686 vértices
- `Police Car Antenna` — 116 vértices
- `Police Car Lightbar 4000` — 196 vértices
- `Police Car Lightbar 4000 Inverted` — 196 vértices
- `Police Car Lightbar Bulbs` — 590 vértices
- `Police Car Lightbar Centerpole` — 124 vértices
- `Police Car Lightbar Centerpole Inverted` — 124 vértices
- `Police Car Lightbar Inverted` — 590 vértices
- `Police Car Lightbar Paletted` — 292 vértices
- `Police Car Lightbar Paletted Inverted` — 292 vértices
- `Police Car Lightbulb Paletted` — 112 vértices
- `Police Car Lightbulb Paletted Inverted` — 112 vértices
- `Police Rijkspolitie Bulb` — 196 vértices
- `Police Rijkspolitie Bulb Inverted` — 196 vértices

Accesorios de patrulla (luces, barras, antenas):

- `Taxi Sign`

---

## 4. El mapa: la ciudad

### Calles, callejones y muelles

- `Alley - Corner 1x1`
- `Alley - Crossroads`
- `Alley - Straight`
- `Alley - T-Piece`
- `Alleywall 3 Long 7`
- `Alleywall 4 Long 1`
- `Alleywall 4 Long 2`
- `Alleywall 4 Long 3`
- `Alleywall 4 Long 4`
- `Alleywall 4 Long 5`
- `Alleywall 4 Long 6`
- `Alleywall 4 Long 7`
- `Alleywall 4 Long 9`
- `Alleywall 6 Long 11`
- `Alleywall 6 Long 2`
- `Alleywall 6 Long 4`
- `Alleywall 6 Long 5`
- `Alleywall 6 Long 6`
- `Alleywall 6 Long 7`
- `Alleywall 6 Long 8`
- `Alleywall 6 Long 9`
- `City Road - Bump`
- `City Road - Bump Bridge`
- `City Road - Bump Collider`
- `City Road - Corner 1x1`
- `City Road - Corner 2x2`
- `City Road - Corner 2x2 Grass Inside`
- `City Road - Corner 2x2 Grass Outside`
- `City Road - Corner Grass 1x1`
- `City Road - Corner Grass 2x2`
- `City Road - Crossroads Small`
- `City Road - Crossroads Small 1 Grass`
- `City Road - Crossroads Small w Grass`
- `City Road - Crossroads With Alley`
- `City Road - Dock Corner Inside 2x2`
- `City Road - Dock Corner Outside 2x2`
- `City Road - Straight`
- `City Road - Straight Grass Full`
- `City Road - Straight Grass Half`
- `City Road - Straight To Alley Crossroad`
- `City Road - Straight To Alley T-Piece`
- `City Road - Straight To Straight w Grass`
- `City Road - Straight With Grass`
- `City Road - T-Piece Small`
- `City Road - T-Piece w Grass`
- `Dock Block`
- `Dock Block - Collider`
- `Dock Corner Inside`
- `Dock Corner Inside - Collider`
- `Dock Corner Inside Wall Half 1`
- `Dock Corner Outside`
- `Dock Corner Outside - Collider`
- `Dock Corner Outside 2x2 Wall Full`
- `Dock Corner Outside 2x2 Wall Half`
- `Dock Corner Outside Wall`
- `Dock Straight`
- `Dock Straight - Collider`
- `Dock Straight 3L`
- `Dock Straight 3L - Collider`
- `Dock Straight Wall Full`
- `Dock Straight Wall Half 1`
- `Dock Straight Wall Half 2`
- `Grass Tile - Dock Corner Outside 2x2`
- `Grass Tile - Dock Corner Outside 2x2 Collider`
- `Ground Tile - 1x1`
- `Ground Tile - 1x1 Grass`
- `Ground Tile - 1x1 Parkpath`
- `Ground Tile - 1x1 Parkpath 2`
- `Ground Tile - 1x2`
- `Ground Tile - 1x2 Grass`
- `Ground Tile - 1x2 Grass and Pavement`
- `Ground Tile - 1x2 Mixed 1`
- `Ground Tile - 1x2 Parkpath 1`
- `Ground Tile - 1x2 Parkpath 2`
- `Ground Tile - 1x2 Parkpath 3`
- `Ground Tile - 2x2`
- `Ground Tile - 2x2 Grass`
- `Ground Tile - 2x2 Mixed 1`
- `Ground Tile - 2x2 Parkpath 1`
- `Ground Tile - 2x2 Parkpath 2`
- `Ground Tile - 2x3`
- `Ground Tile - 3x3`
- `Ground Tile - Raised Grass 1x1`
- `Ground Tile - Raised Grass 1x2`
- `Ground Tile - Raised Grass 1x3`
- `Ground Tile - Raised Park 2x2`
- `Ground Tile - Raised Park 2x3`
- `Tile Collider - Dock Corner Inside 2x2`
- `Tile Collider - Dock Corner Outside 2x2`
- `Tile Collider 1x1`
- `Tile Collider 1x2`
- `Tile Collider 1x3`
- `Tile Collider 2x2`
- `Tile Collider 2x3`
- `Tile Collider 3x3`
- `Tile Collider Raised Park 1x1 - Part A`
- `Tile Collider Raised Park 1x1 - Part B`
- `Tile Collider Raised Park 1x2 - Part A`
- `Tile Collider Raised Park 1x2 - Part B`
- `Tile Collider Raised Park 1x3 - Part A`
- `Tile Collider Raised Park 1x3 - Part B`
- `Tile Collider Raised Park 2x2`
- `Tile Collider Raised Park 2x3 - Part A`
- `Tile Collider Raised Park 2x3 - Part B`
- `Tile Collider Raised Park 2x3 - Part B.001`

### Entorno urbano

- `Arrow`
- `ArrowShort`
- `Building 1`
- `Building 10`
- `Building 10 Half`
- `Building 102`
- `Building 103A`
- `Building 103B`
- `Building 103C`
- `Building 103D`
- `Building 103E`
- `Building 103F`
- `Building 11`
- `Building 12`
- `Building 13`
- `Building 14`
- `Building 15`
- `Building 16`
- `Building 17`
- `Building 18`
- `Building 19`
- `Building 2`
- `Building 20`
- `Building 21`
- `Building 22`
- `Building 23`
- `Building 24`
- `Building 25`
- `Building 26`
- `Building 27`
- `Building 28`
- `Building 28 A`
- `Building 29`
- `Building 3`
- `Building 30`
- `Building 31`
- `Building 31 Half`
- `Building 32`
- `Building 32 Half`
- `Building 33`
- `Building 34`
- `Building 35`
- `Building 36`
- `Building 37`
- `Building 38`
- `Building 39`
- `Building 4`
- `Building 40`
- `Building 41`
- `Building 42`
- `Building 43`
- `Building 44`
- `Building 44 A`
- `Building 44 B`
- `Building 44 C`
- `Building 44 D`
- `Building 44 G`
- `Building 45`
- `Building 46`
- `Building 47`
- `Building 48`
- `Building 49`
- `Building 5`
- `Building 50`
- `Building 51`
- `Building 52`
- `Building 53`
- `Building 53A`
- `Building 54`
- `Building 55`
- `Building 56`
- `Building 57`
- `Building 58`
- `Building 59`
- `Building 6`
- `Building 61`
- `Building 63`
- `Building 64`
- `Building 65`
- `Building 66`
- `Building 68`
- `Building 69`
- `Building 7`
- `Building 70`
- `Building 71 - Skyscraper`
- `Building 72 - Skyscraper`
- `Building 73 - Skyscraper`
- `Building 73B`
- `Building 73C`
- `Building 73D`
- `Building 73E`
- `Building 73F`
- `Building 74 - Skyscraper`
- `Building 74B - Skyscraper`
- `Building 74C`
- `Building 75 - Skyscraper`
- `Building 76 - Oldblock`
- `Building 77 - Oldblock`
- `Building 78 - Oldblock`
- `Building 79 - Riverside`
- `Building 8`
- `Building 80 - Riverside`
- `Building 80A - Riverside`
- `Building 81 - Riverside`
- `Building 82 - Riverside`
- `Building 83`
- `Building 84`
- `Building 85`
- `Building 86`
- `Building 87`
- `Building 88`
- `Building 89`
- `Building 9`
- `Building 90`
- `Building 92`
- `Building 94`
- `Building 95`
- `Building 97`
- `Building 98`
- `Building Filler`
- `Building Filler 2`
- `Building Filler 3`
- `Building Filler 4`
- `Building Filler 5`
- `Building Filler 6`
- `Building Monorail Station`
- `Double Ramp`
- `Flag`
- `Fountain`
- `Hedge Corner`
- `Hedge Edge`
- `Hedge Gate`
- `Hedge Half`
- `Hedge Straight`
- `Monorail Corner 1x1`
- `Monorail Corner 2x2`
- `Monorail Front`
- `Monorail Middle`
- `Monorail Rear`
- `Monorail Straight`
- `Monorail Straight 3x Support`
- `Monorail Straight Support`
- `Ramp`
- `Station Wagon Base Simple Paletted`
- `Statue Pedestal Generic`
- `Tree - Pine 2`
- `Tree - Regular`
- `Wall 2`
- `Wall 3`
- `Wall 3 A`
- `Wall 6 - Thick`
- `Wall 6 - Thick Center`

---

## 5. Objetos y especiales

### Especiales

- `Carolina Corsair Cargo` — 684 vértices
- `Carolina Corsair Medivac` — 946 vértices
- `Medivac Lightbar Inverted` — 472 vértices
- `Medivac Lightbar Paletted` — 472 vértices

### Objetos

- `Coin` — 72 vértices
- `FakeSmoke` — 540 vértices
- `Target Cylinder` — 34 vértices
- `Target Cylinder Opaque` — 351 vértices

### Ruedas

- `Wheel Lowpoly Basic Paletted` — 362 vértices
- `Wheel Lowpoly SuperBasic Paletted` — 52 vértices
- `Wheel Lowpoly SuperBasic Paletted Thick` — 52 vértices
- `Wheel Lowpoly SuperBasic Paletted Thin` — 52 vértices

---

## 6. Las 12 pinturas de coches (`CarsPaletteV2`)

Las 25 texturas de paleta, con su número de versión en el nombre:

| Textura | Tamaño |
|----------|--------|
| `0 - CarsPalette - Template` | 32×32 |
| `1 - CarsPaletteV2 - Police Blue White` | 128×128 |
| `1 - CarsPaletteV2 - Red` | 128×128 |
| `10 - CarsPaletteV2 - Driving School` | 128×128 |
| `10 - CarsPaletteV2 - Pink` | 128×128 |
| `100 - CarsPaletteV2 - Brown Beige` | 128×128 |
| `101 - CarsPaletteV2 - Black Yellow` | 128×128 |
| `102 - CarsPaletteV2 - White Blue` | 128×128 |
| `103 - CarsPaletteV2 - Yellow Orange` | 128×128 |
| `104 - CarsPaletteV2 - Dark Red Black` | 128×128 |
| `11 - CarsPaletteV2 - Taxi` | 128×128 |
| `11 - CarsPaletteV2 - Turquoise` | 128×128 |
| `12 - CarsPaletteV2 - Hearse` | 128×128 |
| `13 - CarsPaletteV2 - General Jacques` | 128×128 |
| `14 - CarsPaletteV2 - Bald Eagle Racecar` | 128×128 |
| `2 - CarsPaletteV2 - Police Black White` | 128×128 |
| `2 - CarsPaletteV2 - Yellow` | 128×128 |
| `3 - CarsPaletteV2 - Blue` | 128×128 |
| `3 - CarsPaletteV2 - Police State Trooper` | 128×128 |
| `4 - CarsPaletteV2 - Green` | 128×128 |
| `4 - CarsPaletteV2 - Park Ranger` | 128×128 |
| `5 - CarsPaletteV2 - Police France` | 128×128 |
| `5 - CarsPaletteV2 - White` | 128×128 |
| `6 - CarsPaletteV2 - Beige` | 128×128 |
| `6 - CarsPaletteV2 - Medivac` | 128×128 |
| `7 - CarsPaletteV2 - Brown` | 128×128 |
| `7 - CarsPaletteV2 - Chief` | 128×128 |
| `8 - CarsPaletteV2 - Dutch and German Police` | 128×128 |
| `8 - CarsPaletteV2 - Gold` | 128×128 |
| `9 - CarsPaletteV2 - Purple` | 128×128 |

Los 77 materiales .json (con sus shaders y propiedades) están en
`blacktop-police-chase-assets/materials/`.

Materiales de paleta de coche:

- `Car - Palette - General Jacques`
- `Car - Palette - Racecar`
- `Car - Palette Beige`
- `Car - Palette Black Yellow`
- `Car - Palette Blue`
- `Car - Palette Brown`
- `Car - Palette Brown Beige`
- `Car - Palette Chief`
- `Car - Palette Dark Red Black`
- `Car - Palette Driving School`
- `Car - Palette Gold`
- `Car - Palette Green`
- `Car - Palette Hearse`
- `Car - Palette Medivac`
- `Car - Palette Park Ranger`
- `Car - Palette Pink`
- `Car - Palette Police - Black White`
- `Car - Palette Police - Blue White`
- `Car - Palette Police - DutchGer`
- `Car - Palette Police - Gendarmerie`
- `Car - Palette Police - State`
- `Car - Palette Purple`
- `Car - Palette Red`
- `Car - Palette Taxi`
- `Car - Palette Turquoise`
- `Car - Palette White`
- `Car - Palette White Light Blue`
- `Car - Palette Yellow`
- `Car - Palette Yellow Orange`
- `_Car - Palette Template`
- `_Road - Palette Template`

---

## 7. Otras texturas

- `Arrow Icon` — 64×64
- `Background` — 32×32
- `BankRobber` — 64×64
- `Brake` — 64×64
- `BuildingPalette1` — 256×256
- `Coin` — 64×64
- `CoinGreen` — 64×64
- `CoinRed` — 64×64
- `ControlsPSD` — 1024×256
- `Cops` — 64×64
- `EmojiOne` — 32×32
- `Empty Icon` — 64×64
- `Fill Bar` — 128×64
- `Filled Icon` — 64×64
- `Forward` — 32×32
- `Garage` — 32×32
- `GreenArrow` — 64×64
- `Guy_Robber` — 128×128
- `House` — 64×64
- `Logo v1 Cropped` — 256×64
- `Logo v2 Cropped` — 512×128
- `Mischief Hood Details` — 128×128
- `MochiyPopOne-Regular SDF Atlas` — 512×512
- `MuteOff` — 32×32
- `MuteOn` — 32×32
- `OnePeople` — 16×32
- `Return` — 32×32
- `Settings` — 32×32
- `SmokeParticle` — 32×32
- `Splash Screen Unity Logo` — 2048×1024
- `Subway-Black SDF Atlas` — 512×512
- `TargetParticle` — 32×32
- `TimerClock` — 128×128
- `ToggleOff` — 32×32
- `ToggleOn` — 32×32
- `TwoPeople` — 32×32
- `WatchAd` — 64×64
- `Water PSD` — 64×64
- `YRDZST Semibold SDF Atlas` — 512×512
- `_RoadPalette - Desert` — 256×256
- `_RoadPalette - Template` — 256×256
- `_RoofDecoPalette - Learner` — 64×32
- `_TreesPalette` — 128×128
- `_WheelsPalette` — 128×128
- `button_square_gloss` — 64×64
- `keyboard arrows` — 128×128
- `keyboard arrows shadow` — 128×128
- `keyboard wasd shadow` — 128×128

---

## 8. Sistema de progresión (extraído del código y del guardado)

- Guardado en `localStorage` bajo la clave **`Blacktop1_Save`** (`SaveSystem`).
- `EconomyManager` gestiona el dinero; `CoinCollectible` las monedas.
- El dinero se gana **entregando al ladrón en el escondite** (`BankRobberGameplay`,
  `TargetTag_Hideout`, `TargetTag_Robber`) y comprando en el garaje
  (`GarageManager`, `GarageCanvasPanel`).
- `GarageManager` controla desbloqueos, reparaciones y las 4 líneas de mejoras.
- `CarSetup` + `Class_WeightedCarSetup` + `ListOfCars` + `LiveCarDatabase` son el
  catálogo de vehículos con su probabilidad de aparición en la calle.
- `CarSetup_Visuals` define el aspecto de cada coche; `CarSetup_PlayerPolice`
  las variantes de policía.
- `PokiSDKManager` / `PokiUnitySDK` Envuelven los anuncios y el guardado en Poki.

---

## 9. Controles

| Acción | Tecla |
|--------|-------|
| Conducir | `WASD` / flechas / `ZQSD` |
| Frenar | `Espacio` / `S` / flecha abajo |
| Mirar atrás | `B` |
| Resetear | `Shift` derecho |

En móvil: controles táctiles en pantalla (`SimpleInput`).

---

## 10. Como se obtuvo

```bash
# 1. Descargar el bundle
curl -o Build.data https://html5.gamemonetize.co/mhp35jy4xz6nx1fg8cdl4lpkyzlslgyp/Build/Build.data
# 2. Localizar la cabecera UnityFS (offset 274) y recortar
# 3. UnityPy 1.25.4 -> Environment() -> Mesh.export() / Texture2D.image
```

`Mesh.export()` produce OBJ con geometría real porque el bundle va sin
compresión (`m_MeshCompression = 0`).

**Verificado**: los 357 `.obj` y las 78 `.png` de este repo son
**idénticos byte a byte** a los que se extraen del `Build.data` original.

---

## 12. ORIENTACION DE LOS EJES (aviso critico)

Unity exporta estas mallas con **Y = largo** y **Z = alto** (X = ancho):

| malla | X (ancho) | Y (LARGO) | Z (ALTO) |
|-------|-----------|-----------|-----------|
| Acheron Redhawk Base | 1.90 | 4.95 | 0.99 |
| McCall Manchester Police | 1.79 | 4.81 | 1.05 |
| Bulldozer Police | 2.34 | 5.28 | 1.86 |
| Nakazato Cricket Base | 1.80 | 4.28 | 0.94 |

El motor del clon trabaja con **X = ancho, Y = alto, Z = largo**, asi que
`src/objmesh.js` intercambia Y y Z al cargar: `(x, y, z) -> (x, z, y)`.
Sin ese cambio un coche mide 4.95 de **alto** y 0.99 de largo.

Los `.obj` del repositorio se conservan **byte a byte** como los exporta Unity;
la correccion vive en el cargador, no en los archivos.

---

## 13. Como integrar el mapa original (pendiente)

El original no tiene un mapa unico: lo genera por **chunks**
(`ChunkGenerator` + `Roadpiece`) colocando piezas en una cuadricula. Las piezas
son:

- **Calles:** `City Road - Straight`, `Corner 1x1`, `Corner 2x2`, `Corner Grass 1x1`,
  `Corner Grass 2x2`, `Crossroads Small`, `Crossroads Small 1 Grass`,
  `Crossroads Small w Grass`, `Crossroads With Alley`, `T-Piece Small`,
  `T-Piece w Grass`, `Straight Grass Full`, `Straight Grass Half`,
  `Straight To Alley Crossroad`, `Straight To Alley T-Piece`,
  `Straight To Straight w Grass`, `Straight With Grass`, `Bump`, `Bump Bridge`,
  `Bump Collider`, `Dock Corner Inside 2x2`, `Dock Corner Outside 2x2`
- **Callejones:** `Alley - Straight`, `Alley - Crossroads`, `Alley - Corner 1x1`,
  `Alley - T-Piece` + muros `Alleywall 3 Long 7`, `Alleywall 4 Long 1..7`,
  `Alleywall 6 Long 2..9`
- **Muelles:** `Dock Straight`, `Dock Straight 3L`, `Dock Straight Wall Full`,
  `Dock Straight Wall Half 1-2`, `Dock Corner Inside`, `Dock Corner Outside`,
  `Dock Corner Outside 2x2 Wall Full/Half`, `Dock Corner Outside Wall`,
  `Dock Block`
- **Suelo:** `Ground Tile` 1x1 / 1x2 / 2x2 / 2x3 / 3x3 con variantes Grass,
  Parkpath, Mixed, Raised Grass, Raised Park + `Tile Collider` 1x1..3x3
- **Edificios:** `Building 1..98` + `Skyscraper`, `Riverside`, `Oldblock`,
  `Building Filler 1..6`, `Building Monorail Station`
- **Monorrail:** `Monorail Front / Middle / Rear / Straight / Straight 3x Support /
  Straight Support / Corner 1x1 / Corner 2x2`
- **Otros:** `Ramp`, `Double Ramp`, `Fountain`, `Statue Pedestal Generic`,
  `Hedge Straight/Corner/Edge/Half/Gate`, `Tree - Pine 2`, `Tree - Regular`,
  `Flag`, `Arrow`, `ArrowShort`, `Gibson Step-Up`, `House Icon`, `Learner Sign`,
  `Target Cylinder`

Todas estas mallas ya estan en `blacktop-police-chase-assets/models/`. Para
usarlas: cargar la geometria con `BTP.ObjMesh.geometry(nombre)` y colocarla con
`THREE.InstancedMesh` en la cuadricula del chunk, respetando que **X = ancho,
Y = alto, Z = largo** una vez pasaras por el cargador.

---

## 14. Policia: estado de la integracion

**Ya integrado** en `src/ai.js`:

- **Trafico civil:** 22 chassis reales con sus liberias (taxis incluidos).
- **Patrullas por nivel de persecucion** (1 a 6), tomando las liberias que
  aparecen en el bundle: `McCall Manchester Police`, `McCall Monaco State Police`,
  `McCall Montpellier Gendarmerie`, `Chevalier Bonheur Gendarmerie`,
  `Jerry Navigator Police`, `Merkur 668 Polizei`, `Merkur 668 Rijkspolitie`,
  `Nakazato Cricket State Trooper`, `Acheron Redhawk Police`.
- **Unidades blindadas** a partir del nivel 4: `Bulldozer Police`.
- **Pintura:** cada librea se pinta con su textura `CarsPaletteV2`
  correspondiente (`paintTexture`), no con color plano.

**Pendiente:** los bloques de calle (`spawnRoadblock`) siguen usando las
barricadas procedurales; el bundle trae `Bulldozer Police` y las patrullas
aparcadas ya usan las mallas reales.

---

## 15. Aviso legal

Estos assets pertenecen a **Steelpan Interactive / Poki** y están protegidos por
derechos de autor. Se documentan aquí para **estudio personal y offline**; no
redistribuirlos comercialmente.
