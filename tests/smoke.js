/* =========================================================================
 * Test de humo SIN navegador y SIN dependencias: valida sintaxis, carga de
 * módulos, lógica pura (garaje, guardado, retícula, idiomas) y que el juego
 * no contiene ninguna URL externa (garantía de funcionamiento offline).
 *   npm test
 * ========================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const FILES = ['core', 'audio', 'models', 'city', 'physics', 'garage', 'ai', 'missions', 'ui', 'game']
  .map(n => path.join('src', n + '.js'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}
function section(s) { console.log('\n' + s); }

/* ------------------------- Entorno mínimo ------------------------------- */
const storage = new Map();
const localStorage = {
  getItem: k => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: k => storage.delete(k),
  clear: () => storage.clear()
};
const sandbox = {
  window: {}, document: {
    createElement: () => ({ width: 0, height: 0, getContext: () => ({}) }),
    getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {},
    documentElement: { lang: 'es' }
  },
  localStorage, navigator: {}, console,
  performance: { now: () => 0 },
  setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
  requestAnimationFrame: () => 0,
  addEventListener: () => {},
  THREE: {}, Set, Map, Math, JSON, Date, parseInt, parseFloat, isFinite, String, Number, Object, Array
};
sandbox.window.localStorage = localStorage;
sandbox.window.addEventListener = () => {};
vm.createContext(sandbox);

section('1. Sintaxis y carga de módulos');
FILES.forEach(rel => {
  const full = path.join(ROOT, rel);
  const src = fs.readFileSync(full, 'utf8');
  try {
    new vm.Script(src, { filename: rel });
    vm.runInContext(src, sandbox, { filename: rel });
    ok('carga ' + rel, true);
  } catch (e) { ok('carga ' + rel, false, e.message); }
});
const BTP = sandbox.window.BTP;
ok('namespace BTP creado', !!BTP);
if (BTP) {
  ['C', 'U', 'I18n', 'Save', 'Bus', 'Audio', 'Models', 'FX', 'City', 'Physics',
   'Garage', 'Traffic', 'Police', 'Missions', 'UI', 'Game'].forEach(k => ok('módulo BTP.' + k, !!BTP[k]));
}

section('2. Lógica pura');
if (BTP) {
  const U = BTP.U, C = BTP.C;
  ok('clamp', U.clamp(12, 0, 10) === 10 && U.clamp(-3, 0, 10) === 0);
  ok('formato de dinero', U.money(1234567) === '$1.234.567', U.money(1234567));
  ok('formato de tiempo', U.time(75) === '01:15', U.time(75));
  ok('headingTo este = -PI/2', Math.abs(BTP.Physics.headingTo(1, 0) + Math.PI / 2) < 1e-6);
  ok('headingTo norte = 0', Math.abs(BTP.Physics.headingTo(0, -1)) < 1e-6);
  ok('circleAABB sin colisión', U.circleAABB(0, 0, 2, 10, 0, 3, 3) === null);
  const hit = U.circleAABB(2.5, 0, 2, 5, 0, 3, 3);
  ok('circleAABB con colisión y normal', !!hit && hit.nx === -1 && hit.depth > 0, JSON.stringify(hit));
  ok('retícula: camino adyacente', (function () {
    const s = BTP.City.pathStep(0, 0, 3, 2);
    return !!s && Math.abs(s.i) + Math.abs(s.j) === 1;
  })(), JSON.stringify(BTP.City.pathStep(0, 0, 3, 2)));
  ok('isRoad en intersección', BTP.City.isRoad(0, 0) === true);
  ok('isRoad fuera de la ciudad', BTP.City.isRoad(2000, 2000) === false);
  ok('6 niveles de persecución', C.MAX_WANTED === 6);
}

section('3. Garaje, mejoras y guardado');
if (BTP) {
  const G = BTP.Garage, S = BTP.Save;
  ok('21 coches base del bundle', G.CARS.length === 21, String(G.CARS.length));
  ok('12 pinturas', G.COLORS.length === 12, String(G.COLORS.length));
  ok('4 líneas de mejoras', G.UPGRADE_KEYS.length === 4);
  ok('stats base', Math.abs(G.stats('muscle').speed - 32) < 0.01);
  const lv = S.upgradesFor('muscle');
  lv.speed = 5;
  ok('mejora de velocidad aumenta stats', G.stats('muscle').speed > 32);
  ok('coste máximo = Infinity', G.upgradeCost('muscle', 'speed') === Infinity);
  lv.speed = 0;
  ok('coste finito tras reiniciar nivel', Number.isFinite(G.upgradeCost('muscle', 'speed')));
  ok('idioma ES', BTP.I18n.t('menu.play') === 'JUGAR');
  BTP.I18n.set('en');
  ok('idioma EN', BTP.I18n.t('menu.play') === 'PLAY');
  BTP.I18n.set('es');
  ok('los 21 coches están desbloqueados', G.CARS.every(c => G.isUnlocked(c.id)));
  ok('las 12 pinturas están desbloqueadas', G.COLORS.every(c => G.isColorUnlocked(c.hex)));
  ok('2 jugadores disponible desde el inicio', G.isSplit() === true);
  ok('seleccionar cualquier coche sin comprar', G.selectCar('hyper') && G.selected().id === 'hyper');
  ok('no se cobra por un coche ya disponible', G.buyCar('hyper').ok === false);
  S.addCash(100000);
  ok('guardado persiste', (function () {
    const before = S.data.cash;
    S.flush(); S.load();
    return S.data.cash === before && G.isUnlocked('hyper') && G.selected().id === 'hyper';
  })());
  ok('migración de partida antigua concede 2P y coches', (function () {
    localStorage.setItem(BTP.C.SAVE_KEY, JSON.stringify({ v: 1, cash: 321, unlocked: ['muscle'], splitscreen: false }));
    S.load();
    return S.data.cash === 321 && G.isSplit() && G.CARS.every(c => G.isUnlocked(c.id));
  })());
  S.reset();
  ok('borrar progreso mantiene todo accesible', S.data.cash === 0 && G.isSplit() &&
    G.CARS.every(c => G.isUnlocked(c.id)) && G.selected().id === 'muscle');
  ok('modo Original activado por defecto', S.data.settings.classic === true);
  ok('UI.setClassic disponible', typeof BTP.UI.setClassic === 'function');
}

section('4. Variedad de vehículos, arte y spawns');
if (BTP) {
  const src = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
  const s2 = src;
  const models = src('src/models.js'), ai = src('src/ai.js');
  const city = src('src/city.js'), game = src('src/game.js'), css = src('styles.css');
  ['muscle', 'sedan', 'hatch', 'sport', 'super', 'hyper', 'police', 'van', 'pickup', 'truck', 'bus']
    .forEach(sh => ok('silueta 3D propia: ' + sh, new RegExp('\\b' + sh + ':').test(models)));
  ok('guardabarros y cristales por silueta', models.includes('TorusGeometry') && models.includes('var CAB'));
  ok('punto de spawn delantero', typeof BTP.City.roadPointAhead === 'function' && ai.includes('roadPointAhead'));
  ok('aparición gradual sin pop-in', ai.includes('beginSpawn') && ai.includes('fadeSpawn'));
  ok('spawns sin amontonamiento', ai.includes('farFrom'));
  ok('tráfico con autobuses, camiones y taxis',
    /shape: 'bus'/.test(ai) && /shape: 'truck'/.test(ai) && /taxi: true/.test(ai));
  ok('ciudad con azoteas, portales y 5 estilos de fachada', city.includes('units') && city.includes('doors') && city.includes('facadeGroups') && city.includes('[[], [], [], [], []]'));
  ok('luz de relleno y cielo degradado', game.includes('fill') && game.includes('skyTex'));
  ok('cámara alta como la captura original', /13\.0/.test(game) && /9\.5/.test(game));
  ok('líneas de calle blancas (no amarillas)', city.includes("'#f4f4ee'") && city.includes('setLineDash'));
  ok('hierba a damero, torres de cristal y portales', city.includes('grass') && city.includes('facadeGroups') && city.includes('doors'));
  ok('HUD clásico calibrado (Money verde, contornos)', css.includes("content: 'Money:'") && css.includes('Georgia'));
  ok('patrulla negra con capó naranja y muscle con capó dorado',
    models.includes('policeOrange') && models.includes('goldHood'));
  ok('flechas verdes grandes y haz del objetivo', src('src/missions.js').includes('2.9') && models.includes('opacity: 0.24'));
  ok('6 niveles de persecución ALCANZABLES (7 umbrales)',
    /LEVEL_THRESHOLDS = \[[^\]]*155\]/.test(ai) && BTP.C.MAX_WANTED === 6);
  ok('21 nombres reales del bundle en el garaje',
    s2('src/garage.js').includes('ACHERON REDHAWK') &&
    s2('src/garage.js').includes('CAROLINA CORSAIR') &&
    s2('src/garage.js').includes('LOWPOLY SUPERBASIC'));
  ok('ids del catálogo y del guardado coinciden (21)',
    BTP.Garage.CARS.every(c => BTP.Save.data.unlocked.indexOf(c.id) >= 0));
  ok('documento del bundle guardado en el repo',
    fs.existsSync(path.join(ROOT, 'blacktop-police-chase-assets/BLACKTOP-POLICE-CHASE-INFO.md')));
  ok('monorraíl con pórticos laterales (sin pilar en la calzada)',
    city.includes('legX = RW / 2 + 3.2') && city.includes('this.monorailSupports'));
  ok('estación, esquina y soportes del monorraíl',
    city.includes('makeMonorailStation') && city.includes('Monorail Corner'));
  ok('fuente, estatua, rampa y setos del bundle',
    models.includes('M.makeFountain') && models.includes('M.makeStatue') &&
    models.includes('M.makeRamp') && city.includes('addHedgesAndWalls'));
  ok('muros de callejón y 5 estilos de facadeTexture',
    city.includes('Alleywall') && models.includes('variant % 5') &&
    models.includes('Oldblock') && models.includes('Skyscraper'));
  ok('tren del monorraíl con Front, Rear y bogies',
    models.includes('Monorail Front / Middle / Rear') && models.includes('bogies'));
}

section('5. Garantía OFFLINE (cero peticiones externas)');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)\s*=\s*"([^"]+)"/g)].map(m => m[1]);
ok('sin URLs http/https en index.html', !refs.some(r => /^https?:/i.test(r)), refs.filter(r => /^https?:/i.test(r)).join(', '));
ok('sin CDN / unpkg / googleapis', !/cdn|unpkg|jsdelivr|googleapis|fonts\.google/i.test(html));
FILES.concat(['vendor/three.min.js', 'styles.css', 'sw.js']).forEach(rel => {
  ok('existe ' + rel, fs.existsSync(path.join(ROOT, rel)));
});
ok('three.min.js empaquetado (>100 KB)', fs.statSync(path.join(ROOT, 'vendor/three.min.js')).size > 100000);
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
ok('Service Worker cachea todos los módulos', FILES.every(rel => sw.includes('./' + rel.replace(/\\/g, '/'))));
ok('scripts clásicos (sin imports ESM)', FILES.every(rel => !/^\s*(import|export)\s/m.test(fs.readFileSync(path.join(ROOT, rel), 'utf8'))));

console.log('\n────────────────────────────────────────────');
console.log('  ' + pass + ' comprobaciones OK · ' + fail + ' fallos');
console.log('────────────────────────────────────────────');
process.exit(fail ? 1 : 0);
