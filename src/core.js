/* =========================================================================
 * BLACKTOP: POLICE CHASE (offline clone) - núcleo
 * Constantes, utilidades, idiomas y guardado local.
 * Todos los módulos cuelgan del namespace global BTP (sin imports, sin red).
 * ========================================================================= */
(function () {
  'use strict';
  var BTP = window.BTP = window.BTP || {};

  /* ----------------------------- Constantes ----------------------------- */
  BTP.C = {
    GRID: 96,            // distancia entre calles
    HALF: 6,             // calles por eje: -6..6
    ROAD_W: 22,          // ancho del asfalto
    SIDEWALK: 5,         // acera a cada lado
    WORLD: 6 * 96 + 48,  // límite jugable (624)
    WATER_X: 5.5 * 96,   // zona de muelles al este
    MAX_WANTED: 6,       // seis niveles de persecución
    COIN_VALUE: 25,
    CASH_REWARD: 600,
    SPLIT_PRICE: 2500,
    REPAIR_PRICE: 250,
    SAVE_KEY: 'btp-offline-save-v1',
    KMH: 4.5             // factor de conversión de velocidad a km/h visuales
  };

  /* ------------------------------ Utilidades ---------------------------- */
  var U = BTP.U = {
    clamp: function (v, a, b) { return v < a ? a : (v > b ? b : v); },
    lerp: function (a, b, t) { return a + (b - a) * t; },
    damp: function (a, b, lambda, dt) { return U.lerp(a, b, 1 - Math.exp(-lambda * dt)); },
    dist2: function (ax, az, bx, bz) { var dx = ax - bx, dz = az - bz; return dx * dx + dz * dz; },
    dist: function (ax, az, bx, bz) { return Math.sqrt(U.dist2(ax, az, bx, bz)); },
    wrapAngle: function (a) { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; },
    angleLerp: function (a, b, t) { return a + U.wrapAngle(b - a) * t; },
    rand: function (a, b) { return a + Math.random() * (b - a); },
    randInt: function (a, b) { return Math.floor(U.rand(a, b + 1)); },
    choice: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    chance: function (p) { return Math.random() < p; },
    mulberry32: function (seed) {
      return function () {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    },
    fmt: function (n) { return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); },
    money: function (n) { return '$' + U.fmt(n); },
    time: function (s) {
      s = Math.max(0, s);
      var m = Math.floor(s / 60), r = Math.floor(s % 60);
      return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
    },
    hexToRgb: function (hex) {
      var h = hex.replace('#', '');
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      var n = parseInt(h, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    },
    // Distancia de un punto a un rectángulo AABB en XZ + normal de salida.
    circleAABB: function (px, pz, r, cx, cz, hw, hd) {
      var qx = U.clamp(px, cx - hw, cx + hw);
      var qz = U.clamp(pz, cz - hd, cz + hd);
      var dx = px - qx, dz = pz - qz;
      var d2 = dx * dx + dz * dz;
      if (d2 >= r * r) return null;
      var d = Math.sqrt(d2), nx, nz;
      if (d > 0.0001) { nx = dx / d; nz = dz / d; }
      else {
        // Centro dentro del rectángulo: empujar por el lado más cercano.
        var left = px - (cx - hw), right = (cx + hw) - px;
        var up = pz - (cz - hd), down = (cz + hd) - pz;
        var m = Math.min(left, right, up, down);
        if (m === left) { nx = -1; nz = 0; d = -left; }
        else if (m === right) { nx = 1; nz = 0; d = -right; }
        else if (m === up) { nx = 0; nz = -1; d = -up; }
        else { nx = 0; nz = 1; d = -down; }
      }
      return { nx: nx, nz: nz, depth: r - d };
    }
  };

  /* -------------------------------- Idiomas ------------------------------ */
  var ES = {
    'app.title': 'BLACKTOP', 'app.sub': 'POLICE CHASE', 'app.tag': 'OUTRUN THE LAW · MEJORA TU COCHE · EL CRIMEN PAGA',
    'menu.play': 'JUGAR', 'menu.garage': 'GARAJE', 'menu.settings': 'AJUSTES', 'menu.help': 'CÓMO JUGAR',
    'menu.best': 'MEJOR PUNTUACIÓN', 'menu.cash': 'DINERO', 'menu.tip': 'Recoge al ladrón, esquiva a la policía y llega al escondite.',
    'menu.offline': '100% OFFLINE · sin wifi · sin anuncios · sin descargas',
    'modes.title': 'ELIGE MODO', 'modes.mission': 'MISIONES', 'modes.missionDesc': 'Atraco tras atraco. La policía se vuelve más dura.',
    'modes.endless': 'HUIDA INFINITA', 'modes.endlessDesc': 'Sobrevive todo lo que puedas y bate tu récord.',
    'modes.trial': 'CONTRARRELOJ', 'modes.trialDesc': 'Encadena los puntos de control antes del tiempo límite.',
    'modes.challenge': 'DESAFÍOS', 'modes.challengeDesc': 'Sin daños, derrapes y adelantamientos peligrosos.',
    'modes.split': '2 JUGADORES · PANTALLA DIVIDIDA', 'modes.splitDesc': 'Dos coches, una ciudad, la misma persecución.',
    'modes.locked': 'DESBLOQUEA EN EL GARAJE',
    'garage.title': 'GARAJE', 'garage.cars': 'COCHES', 'garage.colors': 'PINTURA', 'garage.upgrades': 'MEJORAS',
    'garage.buy': 'COMPRAR', 'garage.select': 'USAR', 'garage.selected': 'EN USO', 'garage.owned': 'TUYO',
    'garage.price': 'PRECIO', 'garage.stats': 'VELOCIDAD / AGARRE / PESO / SALUD', 'garage.stat.speed': 'VELOCIDAD',
    'garage.stat.grip': 'AGARRE', 'garage.stat.weight': 'PESO', 'garage.stat.health': 'SALUD',
    'garage.level': 'NIVEL', 'garage.max': 'MÁXIMO', 'garage.repair': 'REPARAR COCHE',
    'garage.split': 'DESBLOQUEAR 2 JUGADORES', 'garage.splitDesc': 'Pantalla dividida local con teclado.',
    'garage.tabHint': 'TAB / Q-E para cambiar de pestaña',
    'hud.damage': 'DAÑO', 'hud.police': 'POLICÍA', 'hud.money': 'DINERO', 'hud.score': 'PUNTOS',
    'hud.wanted': 'BUSCADO', 'hud.speed': 'KM/H', 'hud.nitro': 'NITRO', 'hud.time': 'TIEMPO',
    'hud.mult': 'MULTI', 'hud.follow': 'Sigue la flecha verde', 'hud.pickup': 'Recoge al ladrón',
    'hud.bank': 'Ve al banco', 'hud.robbing': 'ATRACANDO...', 'hud.hideout': 'Lleva el botín al escondite',
    'hud.checkpoint': 'Punto de control', 'hud.coins': 'MONEDAS', 'hud.nearMiss': '¡ADELANTA MISS!',
    'hud.drift': 'DERRAPE', 'hud.heat': 'NIVEL DE PERSECUCIÓN', 'hud.escape': 'ESCAPA',
    'hud.p1': 'JUGADOR 1', 'hud.p2': 'JUGADOR 2',
    'pause.title': 'PAUSA', 'pause.resume': 'CONTINUAR', 'pause.restart': 'REINICIAR PARTIDA',
    'pause.garage': 'GARAJE', 'pause.settings': 'AJUSTES', 'pause.menu': 'MENÚ PRINCIPAL',
    'settings.title': 'AJUSTES', 'settings.master': 'VOLUMEN GENERAL', 'settings.music': 'MÚSICA',
    'settings.sfx': 'EFECTOS', 'settings.quality': 'CALIDAD GRÁFICA', 'settings.shadows': 'SOMBRAS',
    'settings.lang': 'IDIOMA', 'settings.fps': 'MOSTRAR FPS', 'settings.reset': 'BORRAR PROGRESO',
    'settings.mute': 'SILENCIAR',
    'settings.classic': 'MODO ORIGINAL (POKI)', 'menu.classic': 'MODO ORIGINAL ACTIVADO',
    'settings.resetAsk': '¿Seguro? Se borrará todo el dinero y los coches.', 'settings.on': 'SÍ', 'settings.off': 'NO',
    'settings.high': 'ALTA', 'settings.low': 'BAJA', 'settings.cam': 'CÁMARA', 'settings.camNear': 'CERCANA',
    'settings.camFar': 'LEJANA', 'settings.camHood': 'CAPÓ',
    'results.title': 'RESULTADO', 'results.arrested': '¡DETENIDO!', 'results.destroyed': 'COCHE DESTRUIDO',
    'results.escaped': '¡HUIDA LOGRADA!', 'results.timeup': '¡TIEMPO AGOTADO!', 'results.winner': 'GANADOR',
    'results.cash': 'DINERO GANADO', 'results.score': 'PUNTUACIÓN', 'results.missions': 'MISIONES',
    'results.coins': 'MONEDAS', 'results.best': 'NUEVO RÉCORD', 'results.again': 'OTRA PARTIDA',
    'results.menu': 'MENÚ', 'results.time': 'TIEMPO',
    'help.title': 'CÓMO JUGAR', 'help.controls': 'CONTROLES',
    'help.drive': 'WASD / FLECHAS: acelerar, frenar y girar', 'help.brake': 'ESPACIO: freno de mano / derrape',
    'help.nitro': 'N o F: nitro  ·  B: mirar atrás  ·  C: cámara  ·  M: mapa',
    'help.reset': 'SHIFT (o R): reiniciar coche  ·  ESC / P: pausa',
    'help.p2': '2 JUGADORES: J1 = WASD + N · J2 = FLECHAS + CTRL DERECHO',
    'help.objective': 'OBJETIVO',
    'help.objText': 'Sigue la flecha verde: recoge al ladrón, atraca el banco, recoge monedas y lleva el botín al escondite antes de que el coche quede destruido o te detengan.',
    'help.tips': 'CONSEJOS',
    'help.tipsText': 'La persecución sube por 6 niveles: aparecen bloqueos, pinchos y helicóptero. Derrapa en las curvas, usa los callejones y el monorraíl para cortar camino. Gasta el dinero en 12 coches, 12 pinturas y mejoras.',
    'help.offline': 'OFFLINE',
    'help.offText': 'Todo (Three.js, modelos 3D, texturas, sonidos y música) está dentro de esta carpeta. Abre index.html directamente o ejecuta npm start. Tras la primera visita el Service Worker mantiene la copia en caché.',
    'common.back': 'VOLVER', 'common.level': 'NIVEL', 'common.free': 'GRATIS', 'common.ok': 'ACEPTAR',
    'common.cancel': 'CANCELAR', 'common.paused': 'EN PAUSA', 'common.coins': 'MONEDAS',
    'toast.coin': '+{v} MONEDA', 'toast.cash': '+{v} BOTÍN', 'toast.nitro': 'NITRO RECARGADO',
    'toast.shield': 'ESCUDO ACTIVO', 'toast.repair': 'COCHE REPARADO', 'toast.level': 'NIVEL DE PERSECUCIÓN {v}',
    'toast.buy': 'COMPRADO: {v}', 'toast.nomoney': 'DINERO INSUFICIENTE', 'toast.unlock': 'DESBLOQUEADO: {v}',
    'toast.nearmiss': 'ADELANTAMIENTO +{v}', 'toast.combo': 'COMBO x{v}', 'toast.spike': '¡PINCHAZO!',
    'toast.block': 'BLOQUEO POLICIAL DELANTE', 'toast.heli': '¡HELICÓPTERO EN EL AIRE!',
    'toast.pickup': 'LADRÓN A BORDO', 'toast.heist': 'BOTÍN RECOGIDO: {v}',
    'toast.delivered': 'ENTREGADO · +{v}', 'toast.mission': 'MISIÓN {v}', 'toast.checkpoint': 'PUNTO DE CONTROL {v}',
    'toast.arrest': 'LA POLICÍA TE RODEA', 'toast.nodamage': 'DESAFÍO SIN DAÑOS',
    'toast.challenge': 'DESAFÍO COMPLETADO', 'toast.p2': 'JUGADOR {v} GANA'
  };
  var EN = {
    'app.title': 'BLACKTOP', 'app.sub': 'POLICE CHASE', 'app.tag': 'OUTRUN THE LAW · UPGRADE YOUR RIDE · CRIME PAYS',
    'menu.play': 'PLAY', 'menu.garage': 'GARAGE', 'menu.settings': 'SETTINGS', 'menu.help': 'HOW TO PLAY',
    'menu.best': 'HIGH SCORE', 'menu.cash': 'MONEY', 'menu.tip': 'Pick up the robber, shake the cops and reach the hideout.',
    'menu.offline': '100% OFFLINE · no wifi · no ads · no downloads',
    'modes.title': 'SELECT MODE', 'modes.mission': 'MISSIONS', 'modes.missionDesc': 'Heist after heist. The cops get tougher.',
    'modes.endless': 'ENDLESS GETAWAY', 'modes.endlessDesc': 'Survive as long as you can and beat your record.',
    'modes.trial': 'TIME TRIAL', 'modes.trialDesc': 'Chain checkpoints before the clock runs out.',
    'modes.challenge': 'CHALLENGES', 'modes.challengeDesc': 'No-damage runs, drifts and near misses.',
    'modes.split': '2 PLAYERS · SPLITSCREEN', 'modes.splitDesc': 'Two cars, one city, the same chase.',
    'modes.locked': 'UNLOCK IN THE GARAGE',
    'garage.title': 'GARAGE', 'garage.cars': 'CARS', 'garage.colors': 'PAINT', 'garage.upgrades': 'UPGRADES',
    'garage.buy': 'BUY', 'garage.select': 'USE', 'garage.selected': 'IN USE', 'garage.owned': 'OWNED',
    'garage.price': 'PRICE', 'garage.stats': 'SPEED / GRIP / WEIGHT / HEALTH', 'garage.stat.speed': 'SPEED',
    'garage.stat.grip': 'GRIP', 'garage.stat.weight': 'WEIGHT', 'garage.stat.health': 'HEALTH',
    'garage.level': 'LEVEL', 'garage.max': 'MAX', 'garage.repair': 'REPAIR CAR',
    'garage.split': 'UNLOCK 2 PLAYERS', 'garage.splitDesc': 'Local splitscreen with keyboard.',
    'garage.tabHint': 'TAB / Q-E to change tabs',
    'hud.damage': 'DAMAGE', 'hud.police': 'POLICE', 'hud.money': 'MONEY', 'hud.score': 'SCORE',
    'hud.wanted': 'WANTED', 'hud.speed': 'KM/H', 'hud.nitro': 'NITRO', 'hud.time': 'TIME',
    'hud.mult': 'MULTI', 'hud.follow': 'Follow the green arrow', 'hud.pickup': 'Pick up the robber',
    'hud.bank': 'Drive to the bank', 'hud.robbing': 'ROBBING...', 'hud.hideout': 'Take the loot to the hideout',
    'hud.checkpoint': 'Checkpoint', 'hud.coins': 'COINS', 'hud.nearMiss': 'NEAR MISS!',
    'hud.drift': 'DRIFT', 'hud.heat': 'PURSUIT LEVEL', 'hud.escape': 'ESCAPE',
    'hud.p1': 'PLAYER 1', 'hud.p2': 'PLAYER 2',
    'pause.title': 'PAUSE', 'pause.resume': 'RESUME', 'pause.restart': 'RESTART RUN',
    'pause.garage': 'GARAGE', 'pause.settings': 'SETTINGS', 'pause.menu': 'MAIN MENU',
    'settings.title': 'SETTINGS', 'settings.master': 'MASTER VOLUME', 'settings.music': 'MUSIC',
    'settings.sfx': 'EFFECTS', 'settings.quality': 'GRAPHICS QUALITY', 'settings.shadows': 'SHADOWS',
    'settings.lang': 'LANGUAGE', 'settings.fps': 'SHOW FPS', 'settings.reset': 'RESET PROGRESS',
    'settings.mute': 'MUTE',
    'settings.classic': 'ORIGINAL (POKI) MODE', 'menu.classic': 'ORIGINAL MODE ON',
    'settings.resetAsk': 'Are you sure? All money and cars will be erased.', 'settings.on': 'ON', 'settings.off': 'OFF',
    'settings.high': 'HIGH', 'settings.low': 'LOW', 'settings.cam': 'CAMERA', 'settings.camNear': 'CLOSE',
    'settings.camFar': 'FAR', 'settings.camHood': 'HOOD',
    'results.title': 'RESULTS', 'results.arrested': 'BUSTED!', 'results.destroyed': 'CAR DESTROYED',
    'results.escaped': 'CLEAN GETAWAY!', 'results.timeup': 'TIME UP!', 'results.winner': 'WINNER',
    'results.cash': 'CASH EARNED', 'results.score': 'SCORE', 'results.missions': 'MISSIONS',
    'results.coins': 'COINS', 'results.best': 'NEW RECORD', 'results.again': 'PLAY AGAIN',
    'results.menu': 'MENU', 'results.time': 'TIME',
    'help.title': 'HOW TO PLAY', 'help.controls': 'CONTROLS',
    'help.drive': 'WASD / ARROWS: accelerate, brake and steer', 'help.brake': 'SPACE: handbrake / drift',
    'help.nitro': 'N or F: nitro  ·  B: look back  ·  C: camera  ·  M: map',
    'help.reset': 'SHIFT (or R): reset car  ·  ESC / P: pause',
    'help.p2': '2 PLAYERS: P1 = WASD + N · P2 = ARROWS + RIGHT CTRL',
    'help.objective': 'OBJECTIVE',
    'help.objText': 'Follow the green arrow: pick up the robber, rob the bank, grab coins and deliver the loot to the hideout before your car is destroyed or you get busted.',
    'help.tips': 'TIPS',
    'help.tipsText': 'Pursuit escalates through 6 levels: roadblocks, spike strips and a helicopter. Drift through corners, cut through alleys and use the monorail. Spend cash on 12 cars, 12 paint colors and upgrades.',
    'help.offline': 'OFFLINE',
    'help.offText': 'Everything (Three.js, 3D models, textures, sounds and music) lives inside this folder. Open index.html directly or run npm start. After the first visit the Service Worker keeps a cached copy.',
    'common.back': 'BACK', 'common.level': 'LEVEL', 'common.free': 'FREE', 'common.ok': 'OK',
    'common.cancel': 'CANCEL', 'common.paused': 'PAUSED', 'common.coins': 'COINS',
    'toast.coin': '+{v} COIN', 'toast.cash': '+{v} LOOT', 'toast.nitro': 'NITRO REFILLED',
    'toast.shield': 'SHIELD ACTIVE', 'toast.repair': 'CAR REPAIRED', 'toast.level': 'PURSUIT LEVEL {v}',
    'toast.buy': 'BOUGHT: {v}', 'toast.nomoney': 'NOT ENOUGH MONEY', 'toast.unlock': 'UNLOCKED: {v}',
    'toast.nearmiss': 'NEAR MISS +{v}', 'toast.combo': 'COMBO x{v}', 'toast.spike': 'SPIKED!',
    'toast.block': 'POLICE ROADBLOCK AHEAD', 'toast.heli': 'HELICOPTER INBOUND!',
    'toast.pickup': 'ROBBER ON BOARD', 'toast.heist': 'LOOT GRABBED: {v}',
    'toast.delivered': 'DELIVERED · +{v}', 'toast.mission': 'MISSION {v}', 'toast.checkpoint': 'CHECKPOINT {v}',
    'toast.arrest': 'THE COPS ARE CLOSING IN', 'toast.nodamage': 'NO-DAMAGE CHALLENGE',
    'toast.challenge': 'CHALLENGE COMPLETE', 'toast.p2': 'PLAYER {v} WINS'
  };

  BTP.I18n = {
    dict: { es: ES, en: EN },
    get lang() { return BTP.Save.data.settings.lang || 'es'; },
    set: function (lang) { BTP.Save.data.settings.lang = (lang === 'en' ? 'en' : 'es'); BTP.Save.flush(); },
    t: function (key, vars) {
      var d = this.dict[this.lang] || ES;
      var s = d[key] !== undefined ? d[key] : (ES[key] !== undefined ? ES[key] : key);
      if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
      return s;
    }
  };
  BTP.t = function (k, v) { return BTP.I18n.t(k, v); };

  /* --------------------------- Guardado local --------------------------- */
  // El original deja elegir todos los coches y jugar en pantalla dividida
  // desde el principio: sin grind ni paywalls para acceder al contenido.
  var ALL_CARS = ['muscle', 'compact', 'sedan', 'taxi', 'van', 'pickup', 'sport',
    'interceptor', 'supergt', 'armored', 'hyper', 'musclepro'];
  var ALL_COLORS = ['#f57c1f', '#e8412f', '#f5c518', '#ff7fb0', '#8b46e8', '#2e6ee8',
    '#25c9e8', '#2fae67', '#a6e34b', '#f2f2f2', '#22252c', '#c0c6cf'];
  function defaults() {
    return {
      v: 2, cash: 0, totalEarned: 0, scoreBest: 0, missionsDone: 0, bestEndless: 0, bestTrial: 0,
      selected: 'muscle', colors: { muscle: '#f57c1f' }, unlocked: ALL_CARS.slice(), upgrades: {},
      colorsUnlocked: ALL_COLORS.slice(), splitscreen: true,
      settings: {
        master: 0.8, music: 0.45, sfx: 0.85, muted: false, quality: 'high', shadows: true,
        lang: 'es', fps: false, cam: 'far', mapZoom: 1, classic: true
      },
      stats: { crashes: 0, coins: 0, arrests: 0, escapes: 0, drift: 0, nearmiss: 0 }
    };
  }
  function merge(base, extra) {
    if (!extra || typeof extra !== 'object') return base;
    Object.keys(extra).forEach(function (k) {
      if (extra[k] && typeof extra[k] === 'object' && !Array.isArray(extra[k]) &&
          base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) merge(base[k], extra[k]);
      else if (extra[k] !== undefined) base[k] = extra[k];
    });
    return base;
  }
  BTP.Save = {
    data: defaults(),
    available: true,
    load: function () {
      try {
        var raw = window.localStorage.getItem(BTP.C.SAVE_KEY);
        this.data = merge(defaults(), raw ? JSON.parse(raw) : {});
      } catch (e) { this.available = false; this.data = defaults(); }
      // Migración: partidas guardadas antes de la v2 tenían coches y 2P
      // bloqueados por dinero. Se conceden siempre para que el garaje y la
      // pantalla dividida estén disponibles desde el primer arranque.
      this.data.v = 2;
      this.data.splitscreen = true;
      this.data.unlocked = ALL_CARS.slice();
      this.data.colorsUnlocked = ALL_COLORS.slice();
      return this.data;
    },
    flush: function () {
      try { window.localStorage.setItem(BTP.C.SAVE_KEY, JSON.stringify(this.data)); }
      catch (e) { this.available = false; }
    },
    reset: function () { this.data = defaults(); this.flush(); },
    addCash: function (n) {
      this.data.cash += n;
      if (n > 0) this.data.totalEarned += n;
      this.flush();
      return this.data.cash;
    },
    spend: function (n) {
      if (this.data.cash < n) return false;
      this.data.cash -= n; this.flush(); return true;
    },
    upgradesFor: function (id) {
      if (!this.data.upgrades[id]) this.data.upgrades[id] = { speed: 0, grip: 0, armor: 0, nitro: 0 };
      return this.data.upgrades[id];
    },
    colorFor: function (id, fallback) { return this.data.colors[id] || fallback || '#f57c1f'; }
  };
  BTP.Save.load();

  /* --------------------------------- Bus --------------------------------- */
  var listeners = {};
  BTP.Bus = {
    on: function (name, fn) { (listeners[name] = listeners[name] || []).push(fn); },
    emit: function (name, payload) {
      (listeners[name] || []).forEach(function (fn) { try { fn(payload); } catch (e) { console.error(e); } });
    }
  };
})();
