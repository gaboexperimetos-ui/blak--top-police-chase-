/* =========================================================================
 * GARAJE: 21 coches base del bundle original (velocidad, agarre, peso, salud), 12 pinturas,
 * 4 líneas de mejoras, reparaciones y desbloqueo del modo 2 jugadores.
 * Progreso persistente en localStorage.
 * ========================================================================= */
(function () {
  'use strict';
  var BTP = window.BTP, U = BTP.U, C = BTP.C, Save = BTP.Save;

  var CARS = [
    { id: 'muscle',  name: 'ACHERON REDHAWK',       shape: 'muscle', asset: 'Acheron Redhawk Base', price: 0,     color: '#f57c1f', number: '01',
      stats: { speed: 32, grip: 5.2, weight: 1.30, health: 100, nitro: 1.0 }, tag: 'El clásico naranja' },
    { id: 'compact', name: 'NAKAZATO CRICKET',        shape: 'hatch', asset: 'Nakazato Cricket Base',  price: 900,   color: '#4fc3e8',
      stats: { speed: 31, grip: 7.2, weight: 0.85, health: 85, nitro: 1.0 }, tag: 'Ágil en callejones' },
    { id: 'sedan',   name: 'CHEVALIER XIV',           shape: 'sedan', asset: 'Chevalier XIV',  price: 1800,  color: '#8d9db3',
      stats: { speed: 35, grip: 6.0, weight: 1.15, health: 110, nitro: 1.1 }, tag: 'Equilibrado' },
    { id: 'taxi',    name: 'MERKUR 668',            shape: 'sedan', asset: 'Merkur 668 Convertible',  price: 2900,  color: '#f5c518', number: '24',
      stats: { speed: 37, grip: 6.4, weight: 1.20, health: 115, nitro: 1.2 }, tag: 'Pasa desapercibido' },
    { id: 'van',     name: 'JERRY NAVIGATOR SUV',        shape: 'van', asset: 'Jerry Navigator SUV',    price: 4600,  color: '#e6e9ec',
      stats: { speed: 33, grip: 5.0, weight: 1.75, health: 150, nitro: 1.1 }, tag: 'Mucho espacio para el botín' },
    { id: 'pickup',  name: 'PILGRIM',          shape: 'pickup', asset: 'Carolina Pilgrim Base Simple Paletted', price: 6800,  color: '#3f8f5a',
      stats: { speed: 38, grip: 5.6, weight: 1.65, health: 140, nitro: 1.3 }, tag: 'Resistente' },
    { id: 'sport',   name: 'AUTOMOBILI MANGIONE 4000',        shape: 'sport', asset: 'Automobili Mangione 4000 Base',  price: 9500,  color: '#e8412f',
      stats: { speed: 43, grip: 7.6, weight: 1.00, health: 100, nitro: 1.5 }, tag: 'Derrapes perfectos' },
    { id: 'interceptor', name: 'MCCALL MANCHESTER POLICE',  shape: 'police', asset: 'McCall Manchester Police', price: 13500, color: '#20262f',
      stats: { speed: 44, grip: 6.8, weight: 1.55, health: 155, nitro: 1.5 }, tag: 'Coche patrulla confiscado' },
    { id: 'supergt', name: 'BALD EAGLE RACECAR',         shape: 'super', asset: 'McCall Monaco Bald Eagle Racecar',  price: 19000, color: '#7e4fe0',
      stats: { speed: 48, grip: 8.0, weight: 1.05, health: 110, nitro: 1.8 }, tag: 'Velocidad pura' },
    { id: 'armored', name: 'BULLDOZER',         shape: 'truck', asset: 'Bulldozer',  price: 26000, color: '#5b636d',
      stats: { speed: 36, grip: 4.6, weight: 2.40, health: 220, nitro: 1.2 }, tag: 'Atraviesa bloqueos' },
    { id: 'hyper',   name: 'MCCALL MONACO',            shape: 'hyper', asset: 'McCall Monaco',  price: 36000, color: '#19d3c5',
      stats: { speed: 53, grip: 8.6, weight: 0.95, health: 115, nitro: 2.1 }, tag: 'El más rápido' },
    { id: 'musclepro', name: 'MONACO BALD EAGLE',     shape: 'muscle', asset: 'McCall Monaco Bald Eagle', price: 48000, color: '#ff3b6b', number: '07',
      stats: { speed: 55, grip: 8.2, weight: 1.35, health: 165, nitro: 2.4 }, tag: 'Rey de la huida' },
    { id: 'corsair',      name: 'CAROLINA CORSAIR',      shape: 'van', asset: 'Carolina Corsair Cargo',    price: 52000,  color: '#c9a227',
      stats: { speed: 34, grip: 5.1, weight: 1.80, health: 165, nitro: 1.2 }, tag: 'Furgón de carga' },
    { id: 'bonheur',      name: 'CHEVALIER BONHEUR',     shape: 'sedan', asset: 'Chevalier Bonheur',  price: 58000,  color: '#9fb3c8',
      stats: { speed: 39, grip: 6.6, weight: 1.22, health: 125, nitro: 1.3 }, tag: 'Berlina francesa' },
    { id: 'mayflower',    name: 'DEACON MAYFLOWER',      shape: 'sedan', asset: 'Deacon Mayflower Base Simple Paletted',  price: 64000,  color: '#7d6b58',
      stats: { speed: 36, grip: 6.2, weight: 1.35, health: 140, nitro: 1.1 }, tag: 'Clásico robusto' },
    { id: 'deaconm',      name: 'DEACON GROMMIT',               shape: 'hatch', asset: 'Deacon Grommit',  price: 70000,  color: '#d7d2c6',
      stats: { speed: 33, grip: 7.4, weight: 0.88, health: 95,  nitro: 1.2 }, tag: 'Urbano ligero' },
    { id: 'montpellier',  name: 'MCCALL MONTPELLIER',    shape: 'police', asset: 'McCall Montpellier Gendarmerie', price: 78000,  color: '#243b6b',
      stats: { speed: 42, grip: 6.9, weight: 1.45, health: 155, nitro: 1.5 }, tag: 'Gendarmería' },
    { id: 'monacodriv',   name: 'MONACO DRIV',           shape: 'sport', asset: 'McCall Monaco Driving School',  price: 86000,  color: '#e0e4ea',
      stats: { speed: 46, grip: 7.8, weight: 1.02, health: 108, nitro: 1.7 }, tag: 'Autoescuela' },
    { id: 'wagon',        name: 'STATION WAGON',         shape: 'van', asset: 'Station Wagon Base Simple Paletted',    price: 95000,  color: '#8a5a3c',
      stats: { speed: 35, grip: 5.4, weight: 1.70, health: 175, nitro: 1.2 }, tag: 'Ranchera familiar' },
    { id: 'lowpoly',      name: 'MCCALL MIAMI',         shape: 'sedan', asset: 'McCall Miami',  price: 105000, color: '#5fa8d3',
      stats: { speed: 32, grip: 7.0, weight: 0.90, health: 90,  nitro: 1.1 }, tag: 'Sedán de Miami' },
    { id: 'lowpolysuper', name: 'VERHOEVEN PIRANHA V8',    shape: 'muscle', asset: 'Verhoeven Piranha V8',  price: 120000, color: '#b0b7bf',
      stats: { speed: 30, grip: 4.8, weight: 2.10, health: 200, nitro: 1.0 }, tag: 'V8 de muscle' }
  ];

  var COLORS = [
    { hex: '#f57c1f', name: 'NARANJA',  price: 0 },
    { hex: '#e8412f', name: 'ROJO',     price: 0 },
    { hex: '#f5c518', name: 'AMARILLO', price: 0 },
    { hex: '#ff7fb0', name: 'ROSA',     price: 120 },
    { hex: '#8b46e8', name: 'MORADO',   price: 150 },
    { hex: '#2e6ee8', name: 'AZUL',     price: 150 },
    { hex: '#25c9e8', name: 'CIAN',     price: 200 },
    { hex: '#2fae67', name: 'VERDE',    price: 200 },
    { hex: '#a6e34b', name: 'LIMA',     price: 250 },
    { hex: '#f2f2f2', name: 'BLANCO',   price: 300 },
    { hex: '#22252c', name: 'NEGRO',    price: 350 },
    { hex: '#c0c6cf', name: 'PLATA',    price: 450 }
  ];

  var UPGRADE_KEYS = [
    { key: 'speed', label: 'garage.stat.speed', base: 350 },
    { key: 'grip',  label: 'garage.stat.grip',  base: 320 },
    { key: 'armor', label: 'garage.stat.health', base: 400 },
    { key: 'nitro', label: 'hud.nitro',         base: 300 }
  ];
  var MAX_LEVEL = 5;

  var G = BTP.Garage = {
    CARS: CARS, COLORS: COLORS, UPGRADE_KEYS: UPGRADE_KEYS, MAX_LEVEL: MAX_LEVEL,
    get: function (id) {
      for (var i = 0; i < CARS.length; i++) if (CARS[i].id === id) return CARS[i];
      return CARS[0];
    },
    selected: function () { return G.get(Save.data.selected); },
    isUnlocked: function (id) { return Save.data.unlocked.indexOf(id) >= 0; },
    isSplit: function () { return !!Save.data.splitscreen; },
    isColorUnlocked: function (hex) {
      var list = Save.data.colorsUnlocked || COLORS.slice(0, 3).map(function (c) { return c.hex; });
      return list.indexOf(hex) >= 0 || COLORS.filter(function (c) { return c.price === 0; }).some(function (c) { return c.hex === hex; });
    },
    colorDef: function (hex) {
      for (var i = 0; i < COLORS.length; i++) if (COLORS[i].hex === hex) return COLORS[i];
      return COLORS[0];
    },
    getColor: function (id) { return Save.colorFor(id, G.get(id).color); },

    /* Estadísticas efectivas (coche + mejoras). */
    stats: function (id) {
      var car = G.get(id), lv = Save.upgradesFor(id), s = {};
      s.speed = car.stats.speed * (1 + lv.speed * 0.055);
      s.grip = car.stats.grip * (1 + lv.grip * 0.10);
      s.weight = car.stats.weight;
      s.health = car.stats.health + lv.armor * 26;
      s.nitro = car.stats.nitro * (1 + lv.nitro * 0.18);
      s.level = lv;
      return s;
    },
    statBars: function (id) {
      var s = G.stats(id);
      return {
        speed: U.clamp(s.speed / 60, 0.05, 1),
        grip: U.clamp(s.grip / 10, 0.05, 1),
        weight: U.clamp(s.weight / 2.6, 0.05, 1),
        health: U.clamp(s.health / 250, 0.05, 1)
      };
    },
    upgradeCost: function (id, key) {
      var lv = Save.upgradesFor(id)[key] || 0;
      var def = UPGRADE_KEYS.filter(function (u) { return u.key === key; })[0];
      if (!def || lv >= MAX_LEVEL) return Infinity;
      return Math.round(def.base * Math.pow(1.75, lv));
    },

    /* ------------------------------ Acciones ----------------------------- */
    buyCar: function (id) {
      var car = G.get(id);
      if (G.isUnlocked(id)) return { ok: false, reason: 'owned' };
      if (!Save.spend(car.price)) return { ok: false, reason: 'money' };
      Save.data.unlocked.push(id);
      Save.data.selected = id;
      Save.data.colors[id] = car.color;
      Save.flush();
      BTP.Audio.sfx('buy');
      return { ok: true, car: car };
    },
    selectCar: function (id) {
      if (!G.isUnlocked(id)) return false;
      Save.data.selected = id; Save.flush(); BTP.Audio.sfx('ui'); return true;
    },
    buyColor: function (hex) {
      var def = G.colorDef(hex);
      if (G.isColorUnlocked(hex)) return { ok: false, reason: 'owned' };
      if (!Save.spend(def.price)) return { ok: false, reason: 'money' };
      if (!Save.data.colorsUnlocked) Save.data.colorsUnlocked = COLORS.slice(0, 3).map(function (c) { return c.hex; });
      Save.data.colorsUnlocked.push(hex);
      Save.flush(); BTP.Audio.sfx('buy');
      return { ok: true, color: def };
    },
    setColor: function (hex) {
      if (!G.isColorUnlocked(hex)) return false;
      Save.data.colors[Save.data.selected] = hex; Save.flush(); BTP.Audio.sfx('ui'); return true;
    },
    buyUpgrade: function (id, key) {
      var cost = G.upgradeCost(id, key);
      if (!isFinite(cost)) return { ok: false, reason: 'max' };
      if (!Save.spend(cost)) return { ok: false, reason: 'money' };
      Save.upgradesFor(id)[key]++;
      Save.flush(); BTP.Audio.sfx('buy');
      return { ok: true, cost: cost };
    },
    unlockSplit: function () {
      if (G.isSplit()) return { ok: false, reason: 'owned' };
      if (!Save.spend(C.SPLIT_PRICE)) return { ok: false, reason: 'money' };
      Save.data.splitscreen = true; Save.flush(); BTP.Audio.sfx('win');
      return { ok: true };
    },
    repair: function (car) {
      if (!car) return { ok: false, reason: 'noCar' };
      var missing = car.maxHealth - car.health;
      if (missing <= 0) return { ok: false, reason: 'full' };
      var cost = Math.max(50, Math.ceil(missing / car.maxHealth * C.REPAIR_PRICE));
      if (!Save.spend(cost)) return { ok: false, reason: 'money' };
      car.repair(); BTP.Audio.sfx('repair');
      return { ok: true, cost: cost };
    }
  };
})();
