/* =========================================================================
 * IA: tráfico civil, persecución policial con 6 niveles, bloqueos, pinchos,
 * radares, helicóptero, empujones, detención y nivel de "calor".
 * ========================================================================= */
(function () {
  'use strict';
  var BTP = window.BTP, U = BTP.U, C = BTP.C, M = BTP.Models, P = BTP.Physics;

  var TRAFFIC_SHAPES = ['hatch', 'sedan', 'muscle', 'van', 'pickup', 'sport'];
  var TRAFFIC_COLORS = ['#e7e9ec', '#3d6fb4', '#c34a4a', '#4a9b6c', '#d8c14a', '#7b5ba6', '#2f343c', '#d98a3a', '#e3c07a', '#5d7f9c'];
  var DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  /* =======================================================================
   * ASSETS ORIGINALES DEL BUNDLE (nombres exactos de los .obj extraidos)
   *
   * El juego original define el tráfico y las patrullas con CarSetup /
   * CarSetup_Visuals / CarSetup_PlayerPolice y Class_WeightedCarSetup: un
   * catalogo de chassis con sus libreas. Estas son esas mallas, tal cual.
   * ======================================================================= */

  /* Libreas de policia disponibles por nivel de persecucion (nivel 1..6). */
  var POLICE_LIVERIES = [
    ['McCall Manchester Police'],
    ['McCall Manchester Police', 'McCall Monaco State Police'],
    ['McCall Manchester Police', 'McCall Monaco State Police', 'McCall Montpellier Gendarmerie'],
    ['McCall Manchester Police', 'McCall Monaco State Police', 'McCall Montpellier Gendarmerie',
     'Chevalier Bonheur Gendarmerie', 'Jerry Navigator Police'],
    ['McCall Manchester Police', 'McCall Monaco State Police', 'McCall Montpellier Gendarmerie',
     'Chevalier Bonheur Gendarmerie', 'Jerry Navigator Police',
     'Merkur 668 Polizei', 'Merkur 668 Rijkspolitie'],
    ['McCall Manchester Police', 'McCall Monaco State Police', 'McCall Montpellier Gendarmerie',
     'Chevalier Bonheur Gendarmerie', 'Jerry Navigator Police',
     'Merkur 668 Polizei', 'Merkur 668 Rijkspolitie',
     'Nakazato Cricket State Trooper', 'Acheron Redhawk Police']
  ];
  /* Furgon blindado de las unidades especiales (nivel 4+): el mas grande del bundle. */
  var SWAT_ASSET = 'Bulldozer Police';

  /* Trafico civil: chassis reales del bundle con la silueta que usan. */
  var TRAFFIC_ASSETS = [
    { asset: 'Deacon Grommit',                        shape: 'hatch'  },
    { asset: 'Nakazato Cricket Base',                 shape: 'hatch'  },
    { asset: 'Chevalier Bonheur',                     shape: 'hatch'  },
    { asset: 'Chevalier XIV',                         shape: 'sedan'  },
    { asset: 'Merkur 668 Convertible',                shape: 'sedan'  },
    { asset: 'Deacon Mayflower Base Simple Paletted', shape: 'sedan'  },
    { asset: 'McCall Miami',                          shape: 'sedan'  },
    { asset: 'McCall Manchester Hardtop',             shape: 'sedan'  },
    { asset: 'Jerry Navigator SUV',                   shape: 'van'    },
    { asset: 'Jerry Navigator Construction',          shape: 'van'    },
    { asset: 'Carolina Corsair Cargo',                shape: 'van'    },
    { asset: 'Station Wagon Base Simple Paletted',    shape: 'van'    },
    { asset: 'Carolina Pilgrim Base Simple Paletted', shape: 'pickup' },
    { asset: 'Automobili Mangione 4000 Base',         shape: 'sport'  },
    { asset: 'McCall Monaco',                         shape: 'hyper'  },
    { asset: 'McCall Monaco Bald Eagle',                   shape: 'muscle' },
    { asset: 'Acheron Redhawk Base',                  shape: 'muscle' },
    { asset: 'Verhoeven Piranha V8',                  shape: 'muscle' },
    { asset: 'Automobili Mangione 4000 Taxi',         shape: 'sedan',  taxi: true },
    { asset: 'Nakazato Cricket Taxi',                 shape: 'hatch',  taxi: true },
    { asset: 'Merkur 668 Taxi',                       shape: 'sedan',  taxi: true },
    { asset: 'Jerry Navigator SUV Taxi',              shape: 'van',    taxi: true }
  ];

  /* Pintura (paleta CarsPaletteV2) que corresponde a cada librea del bundle.
     El orden importa: primero los mas especificos. */
  var PAINT_BY_KEYWORD = [
    ['Rijkspolitie',   '8 - CarsPaletteV2 - Dutch and German Police'],
    ['State Trooper',  '3 - CarsPaletteV2 - Police State Trooper'],
    ['Gendarmerie',    '5 - CarsPaletteV2 - Police France'],
    ['Polizei',        '2 - CarsPaletteV2 - Police Black White'],
    ['Medivac',        '6 - CarsPaletteV2 - Medivac'],
    ['Hearse',         '12 - CarsPaletteV2 - Hearse'],
    ['Chief',          '7 - CarsPaletteV2 - Chief'],
    ['Park Ranger',    '4 - CarsPaletteV2 - Park Ranger'],
    ['Driving School', '10 - CarsPaletteV2 - Driving School'],
    ['General Jacques','13 - CarsPaletteV2 - General Jacques'],
    ['Bald Eagle',     '14 - CarsPaletteV2 - Bald Eagle Racecar'],
    ['Taxi',           '11 - CarsPaletteV2 - Taxi'],
    ['Police',         '2 - CarsPaletteV2 - Police Black White']
  ];
  var DEFAULT_PAINT = '5 - CarsPaletteV2 - White';

  function paintFor(asset) {
    for (var i = 0; i < PAINT_BY_KEYWORD.length; i++) {
      if (String(asset).indexOf(PAINT_BY_KEYWORD[i][0]) >= 0) return PAINT_BY_KEYWORD[i][1];
    }
    return DEFAULT_PAINT;
  }

  function laneOffset(dx, dz) { return { x: -dz * 4.6, z: dx * 4.6 }; }

  /* Variedad real de vehículos: compactos, berlinas, muscle, furgonetas,
     pickups, deportivos, taxis, autobuses y camiones de reparto. */
  function trafficSpec() {
    var r = Math.random();
    /* Autobuses y camiones de reparto no existen como chassis en el bundle:
       esos siguen siendo procedurales. */
    if (r < .07) return { shape: 'bus', color: U.choice(['#d8c14a', '#4a9b6c', '#3f7fb0']), traffic: true, scale: 1 };
    if (r < .13) return { shape: 'truck', color: U.choice(['#e6e9ec', '#5b636d', '#c0563c']), traffic: true, scale: 1 };
    /* El resto del trafico usa las mallas originales del bundle. */
    var t = U.choice(TRAFFIC_ASSETS);
    return {
      shape: t.shape, asset: t.asset, paintTexture: paintFor(t.asset),
      color: t.taxi ? '#f5c518' : U.choice(TRAFFIC_COLORS),
      taxi: !!t.taxi, traffic: true, scale: 1.05
    };
  }
  function farFrom(list, x, z, min) {
    var m2 = min * min;
    for (var i = 0; i < list.length; i++) {
      if (U.dist2(list[i].x, list[i].z, x, z) < m2) return false;
    }
    return true;
  }
  /* Aparición gradual en vez de pop-in. */
  function beginSpawn(car) {
    car.spawnT = 0;
    car.baseScale = car.mesh.scale.x || 1;
    car.mesh.scale.setScalar(car.baseScale * .35);
  }
  function fadeSpawn(car, dt) {
    if (car.spawnT === undefined) return;
    car.spawnT = Math.min(1, car.spawnT + dt * 3.2);
    car.mesh.scale.setScalar(car.baseScale * (.35 + .65 * car.spawnT));
    if (car.spawnT >= 1) delete car.spawnT;
  }

  /* ============================== TRÁFICO ================================ */
  function Traffic(city, count) {
    this.city = city;
    this.cars = [];
    this.nearMissCooldown = {};
    this.time = 0;
    for (var i = 0; i < (count || 26); i++) this.cars.push(this.create());
  }
  Traffic.prototype.create = function () {
    var city = this.city;
    var p = city.randomRoadPoint(Math.random);
    var node = city.nearestIntersection(p.x, p.z);
    var dir = U.choice(DIRS);
    var model = M.makeCar(trafficSpec());
    city.group.add(model.group);
    var dir2 = { dx: dir[0], dz: dir[1] };
    var off = laneOffset(dir2.dx, dir2.dz);
    return {
      model: model, mesh: model.group, x: node.x + off.x, z: node.z + off.z,
      heading: P.headingTo(dir2.dx, dir2.dz), speed: U.rand(8, 15), targetSpeed: U.rand(9, 16),
      vx: 0, vz: 0, radius: 2.3, weight: 1.3, moveable: false,
      from: node, to: city.node(node.i + dir2.dx, node.j + dir2.dz), dir: dir2, off: off,
      changeAt: 0, isTraffic: true, id: 't' + Math.random().toString(36).slice(2, 7)
    };
  };
  Traffic.prototype.pickNext = function (car) {
    var city = this.city, options = [];
    DIRS.forEach(function (d) {
      if (d[0] === -car.dir.dx && d[1] === -car.dir.dz) return; // no dar la vuelta
      var n = city.node(car.to.i + d[0], car.to.j + d[1]);
      if (n.i === car.to.i && n.j === car.to.j) return; // borde de la ciudad
      if (n.x > C.WATER_X && n.j !== 0) return;
      options.push({ d: d, n: n });
    });
    var straight = options.filter(function (o) { return o.d[0] === car.dir.dx && o.d[1] === car.dir.dz; });
    var pick = (straight.length && Math.random() < 0.62) ? straight[0] : U.choice(options.length ? options : [{ d: car.dir, n: car.to }]);
    car.from = car.to;
    car.to = pick.n;
    car.dir = { dx: pick.d[0], dz: pick.d[1] };
    car.off = laneOffset(car.dir.dx, car.dir.dz);
    car.targetSpeed = U.rand(8, 16);
  };
  Traffic.prototype.recycle = function (car, players) {
    var city = this.city, pl = players[0] || { x: 0, z: 0, heading: 0 };
    var p = null, self = this;
    for (var t = 0; t < 10; t++) {
      var cand = city.roadPointAhead(pl, 115, 270);
      if (farFrom(self.cars.filter(function (c) { return c !== car; }), cand.x, cand.z, 17)) { p = cand; break; }
      if (!p) p = cand;
    }
    var node = city.nearestIntersection(p.x, p.z);
    var d = U.choice(DIRS);
    car.from = node; car.to = city.node(node.i + d[0], node.j + d[1]);
    car.dir = { dx: d[0], dz: d[1] }; car.off = laneOffset(d[0], d[1]);
    car.x = node.x + car.off.x; car.z = node.z + car.off.z;
    car.heading = P.headingTo(d[0], d[1]);
    car.speed = car.targetSpeed = U.rand(8, 16);
    car.mesh.position.set(car.x, 0, car.z);
    beginSpawn(car);
  };
  Traffic.prototype.update = function (dt, players) {
    this.time += dt;
    var city = this.city, self = this;
    this.cars.forEach(function (car) {
      fadeSpawn(car, dt);
      var tx = car.to.x + car.off.x, tz = car.to.z + car.off.z;
      var dx = tx - car.x, dz = tz - car.z, d = Math.hypot(dx, dz);
      if (d < 9) self.pickNext(car);
      var desired = P.headingTo(tx - car.x, tz - car.z);
      var diff = Math.abs(U.wrapAngle(desired - car.heading));
      car.heading = U.angleLerp(car.heading, desired, U.clamp(dt * 3.2, 0, 1));
      // Frenar si hay otro coche delante o un jugador muy cerca
      var brake = diff > 0.6 ? 0.5 : 1;
      for (var i = 0; i < players.length; i++) {
        var pl = players[i];
        if (U.dist2(car.x, car.z, pl.x, pl.z) < 100) brake = Math.min(brake, 0.55);
      }
      car.speed = U.damp(car.speed, car.targetSpeed * brake, 1.6, dt);
      car.vx = -Math.sin(car.heading) * car.speed;
      car.vz = -Math.cos(car.heading) * car.speed;
      car.x += car.vx * dt; car.z += car.vz * dt;
      car.mesh.position.set(car.x, 0, car.z);
      car.mesh.rotation.y = car.heading;
      car.model.spin(car.speed, dt, 0);
      // Reciclar coches lejanos
      var far = Math.min.apply(null, players.map(function (p) { return U.dist(car.x, car.z, p.x, p.z); }));
      if (far > 440) self.recycle(car, players);
      // Adelantamientos peligrosos
      players.forEach(function (pl, pi) {
        var dd = U.dist(car.x, car.z, pl.x, pl.z);
        var key = car.id + ':' + pi, cool = self.nearMissCooldown[key] || 0;
        if (dd > 3.5 && dd < 8.5 && Math.abs(pl.vLong) > 19 && self.time > cool) {
          self.nearMissCooldown[key] = self.time + 1.4;
          BTP.Bus.emit('nearMiss', { car: car, player: pl });
        }
      });
    });
  };
  Traffic.prototype.clear = function () {
    this.cars.forEach(function (c) { c.mesh.parent && c.mesh.parent.remove(c.mesh); });
    this.cars = [];
  };

  /* ============================== POLICÍA ================================ */
  /* El original tiene 6 niveles de persecución (Build.data / análisis del
   * bundle). El índice 0 es "sin policía"; los índices 1..6 son los seis
   * niveles, por eso hacen falta 7 umbrales para que C.MAX_WANTED = 6 sea
   * alcanzable de verdad (antes sólo se llegaba al nivel 5). */
  var LEVEL_THRESHOLDS = [0, 12, 28, 50, 78, 112, 155];

  function Police(city) {
    this.city = city;
    this.cars = [];
    this.roadblocks = [];
    this.spikes = [];
    this.speedTraps = [];
    this.heli = null;
    this.level = 0;
    this.heat = 0;
    this.heatRate = 0.85;
    this.time = 0;
    this.blockTimer = 12;
    this.spikeTimer = 16;
    this.arrest = {};
    this.policeBar = 0;
    this.nearestDist = 999;
    this.buildSpeedTraps();
  }

  Police.prototype.buildSpeedTraps = function () {
    var self = this, positions = [[-4, -2], [2, 2], [-1, 4], [4, -4], [0, -3]];
    positions.forEach(function (p) {
      var x = p[0] * C.GRID, z = p[1] * C.GRID;
      var pole = M.box(0.16, 3.2, 0.16, M.mat('#4c5560'), x + C.ROAD_W / 2 + 2, 1.6, z, self.city.group);
      var sign = M.box(1.5, 1.0, 0.14, M.basic('#2b61c9'), x + C.ROAD_W / 2 + 2, 3.3, z, self.city.group);
      M.box(1.1, 0.16, 0.16, M.basic('#ffffff'), x + C.ROAD_W / 2 + 2, 3.4, z + 0.09, self.city.group);
      self.speedTraps.push({ x: x, z: z, cooldown: 0 });
    });
  };

  Police.prototype.setLevel = function (n) {
    n = U.clamp(Math.floor(n), 0, C.MAX_WANTED);
    if (n === this.level) return;
    var up = n > this.level;
    this.level = n;
    if (up && n > 0) {
      BTP.Audio.sfx('level');
      BTP.UI.toast(BTP.t('toast.level', { v: n }), 'warn');
      if (n === 3) BTP.Audio.sfx('alarm');
      if (n >= 5) BTP.UI.toast(BTP.t('toast.heli'), 'warn');
    }
    BTP.Bus.emit('wantedChanged', { level: n });
  };
  Police.prototype.addHeat = function (v) { this.heat = Math.max(0, this.heat + v); };
  Police.prototype.heatToLevel = function () {
    var lv = 0;
    for (var i = 0; i < LEVEL_THRESHOLDS.length; i++) if (this.heat >= LEVEL_THRESHOLDS[i]) lv = i;
    this.setLevel(lv);
  };

  Police.prototype.spawnCar = function (players) {
    var city = this.city;
    var pl = U.choice(players);
    var p = null;
    for (var tries = 0; tries < 8; tries++) {
      var cand = city.roadPointAhead(pl, 78, 175);
      if (farFrom(this.cars, cand.x, cand.z, 16)) { p = cand; break; }
      if (!p) p = cand;
    }
    /* Patrulla real del bundle: la librea se elige segun el nivel de
       persecucion y a partir del 4 aparecen las unidades blindadas. */
    var lvl = Math.min(Math.max(this.level, 1), POLICE_LIVERIES.length);
    var pool = POLICE_LIVERIES[lvl - 1];
    var isSwat = this.level >= 4 && Math.random() < 0.35;
    var asset = isSwat ? SWAT_ASSET : U.choice(pool);
    var model = M.makeCar({
      shape: isSwat ? 'truck' : 'police', asset: asset,
      paintTexture: paintFor(asset), police: true, scale: 1.12
    });
    city.group.add(model.group);
    var node = city.nearestIntersection(p.x, p.z);
    var car = {
      model: model, mesh: model.group, x: p.x, z: p.z,
      heading: P.headingTo(pl.x - p.x, pl.z - p.z), speed: 8,
      vx: 0, vz: 0, radius: 2.35, weight: 1.7, isPolice: true,
      health: 100, disabled: 0, repath: 0, targetNode: null, id: 'p' + this.cars.length + '_' + Math.floor(Math.random() * 9999),
      node: node, spin: 0
    };
    car.applyDamage = function (n) {
      car.health -= n;
      if (car.health <= 0) car.takedown();
    };
    car.takedown = function () {
      if (car.disabled > 0) return;
      car.disabled = 7; car.health = 100; car.spin = U.rand(-1, 1);
      BTP.FX.smoke(car.x, 1.2, car.z, '#555');
      BTP.Bus.emit('takedown', { car: car });
    };
    beginSpawn(car);
    this.cars.push(car);
    return car;
  };

  Police.prototype.spawnRoadblock = function (players) {
    var city = this.city, pl = players[0];
    // Intersección por delante del jugador
    var node = city.nearestIntersection(pl.x + pl.vx * 6, pl.z + pl.vz * 6);
    var step = city.pathStep(node.i, node.j, node.i + Math.round(pl.vx / 40), node.j + Math.round(pl.vz / 40));
    var target = step || city.node(node.i + 1, node.j);
    var horizontal = Math.abs(pl.vx) > Math.abs(pl.vz);
    var group = new THREE.Group();
    var obstacles = [];
    var positions = [];
    for (var k = -1; k <= 1; k++) {
      var bx = horizontal ? target.x + k * 6 : target.x + 0;
      var bz = horizontal ? target.z + 0 : target.z + k * 6;
      var b = M.makeBarricade();
      b.position.set(bx, 0, bz);
      if (!horizontal) b.rotation.y = Math.PI / 2;
      group.add(b);
      positions.push({ x: bx, z: bz });
      var obs = { x: bx, z: bz, hw: horizontal ? 1.8 : 0.5, hd: horizontal ? 0.5 : 1.8, type: 'barricade' };
      city.addObstacle(obs); obstacles.push(obs);
    }
    city.group.add(group);
    var rb = { group: group, obstacles: obstacles, positions: positions, x: target.x, z: target.z, life: 40 };
    this.roadblocks.push(rb);
    // Un par de coches patrulla aparcados (con límite para no saturar la ciudad)
    for (var n = 0; n < Math.min(2, this.level - 1) && this.cars.length < 12; n++) {
      var pc = this.spawnCar(players);
      pc.x = target.x + (horizontal ? 0 : 14) + n * 4;
      pc.z = target.z + (horizontal ? 14 : 0) + n * 4;
    }
    BTP.UI.toast(BTP.t('toast.block'), 'warn');
    return rb;
  };

  Police.prototype.spawnSpikes = function (players) {
    var city = this.city, pl = players[0];
    var ahead = { x: pl.x + pl.vx * 3.5, z: pl.z + pl.vz * 3.5 };
    var rp = city.nearestRoadPoint(ahead.x, ahead.z);
    var strip = M.makeSpikeStrip();
    strip.position.set(rp.x, 0, rp.z);
    if (rp.axis === 'x') strip.rotation.y = 0;
    else strip.rotation.y = Math.PI / 2;
    city.group.add(strip);
    this.spikes.push({ mesh: strip, x: rp.x, z: rp.z, life: 35, cooldown: 0 });
  };

  Police.prototype.spawnHeli = function () {
    if (this.heli) return;
    var h = M.makeHelicopter();
    h.position.set(0, 32, 0);
    this.city.group.add(h);
    this.heli = h;
    BTP.Audio.sfx('alarm');
  };

  Police.prototype.removeHeli = function () {
    if (!this.heli) return;
    this.heli.parent && this.heli.parent.remove(this.heli);
    this.heli = null;
    BTP.Audio.heliUpdate(false, 0);
  };

  Police.prototype.clear = function () {
    var self = this;
    this.cars.forEach(function (c) { c.mesh.parent && c.mesh.parent.remove(c.mesh); });
    this.cars = [];
    this.roadblocks.forEach(function (rb) {
      rb.group.parent && rb.group.parent.remove(rb.group);
      rb.obstacles.forEach(function (o) { self.city.removeObstacle(o); });
    });
    this.roadblocks = [];
    this.spikes.forEach(function (s) { s.mesh.parent && s.mesh.parent.remove(s.mesh); });
    this.spikes = [];
    this.removeHeli();
    this.level = 0; this.heat = 0; this.arrest = {}; this.policeBar = 0;
    this.blockTimer = 12; this.spikeTimer = 16;
  };

  Police.prototype.update = function (dt, players) {
    this.time += dt;
    var self = this, city = this.city;
    if (!players.length) return;
    this.heat += dt * this.heatRate * (1 + this.level * 0.06);
    this.heatToLevel();

    // Número de patrullas según nivel
    var want = this.level === 0 ? 0 : Math.min(9, 1 + Math.ceil(this.level * 1.4));
    while (this.cars.length < want) this.spawnCar(players);
    for (var i = this.cars.length - 1; i >= 0; i--) {
      var car = this.cars[i];
      var minD = Math.min.apply(null, players.map(function (p) { return U.dist(car.x, car.z, p.x, p.z); }));
      if (minD > 520 && this.cars.length > want) {
        car.mesh.parent && car.mesh.parent.remove(car.mesh);
        this.cars.splice(i, 1);
      }
    }

    // Persecución
    var nearest = 999;
    this.cars.forEach(function (car) {
      if (car.disabled > 0) {
        car.disabled -= dt;
        car.speed = U.damp(car.speed, 0, 2, dt);
        car.heading += car.spin * dt * 4;
        car.mesh.position.set(car.x, 0, car.z);
        car.mesh.rotation.y = car.heading;
        car.model.setSiren(self.time);
        if (Math.random() < dt * 4) BTP.FX.smoke(car.x, 1, car.z, '#444');
        return;
      }
      // Jugador más cercano
      var target = players[0], td = Infinity;
      players.forEach(function (p) {
        var d = U.dist2(car.x, car.z, p.x, p.z);
        if (d < td) { td = d; target = p; }
      });
      nearest = Math.min(nearest, Math.sqrt(td));
      car.repath -= dt;
      var aimX, aimZ;
      var directD = Math.sqrt(td);
      if (directD < 65 || car.repath <= 0) {
        car.repath = 0.7;
        var cn = city.nearestIntersection(car.x, car.z);
        var tn = city.nearestIntersection(target.x + target.vx * 1.2, target.z + target.vz * 1.2);
        var step = city.pathStep(cn.i, cn.j, tn.i, tn.j);
        car.targetNode = step || { x: target.x, z: target.z };
      }
      if (directD < 55) {
        // Embestida directa con predicción
        aimX = target.x + target.vx * 0.45;
        aimZ = target.z + target.vz * 0.45;
      } else if (car.targetNode) {
        aimX = car.targetNode.x; aimZ = car.targetNode.z;
      } else { aimX = target.x; aimZ = target.z; }

      var desired = P.headingTo(aimX - car.x, aimZ - car.z);
      var diff = U.wrapAngle(desired - car.heading);
      var turn = U.clamp(2.6 + self.level * 0.18, 0, 4.2) * dt;
      car.heading += U.clamp(diff, -turn, turn);
      var maxSpeed = 23 + self.level * 2.4 + (target.stats ? target.stats.speed * 0.22 : 4);
      var slow = 1 - U.clamp(Math.abs(diff) * 0.35, 0, 0.55);
      car.speed = U.damp(car.speed, maxSpeed * slow, 1.3, dt);
      car.vx = -Math.sin(car.heading) * car.speed;
      car.vz = -Math.cos(car.heading) * car.speed;
      car.x += car.vx * dt; car.z += car.vz * dt;
      // Evitar edificios (empuje simple)
      var obs = city.query(car.x, car.z, car.radius + 1);
      obs.forEach(function (o) {
        var hit = o.hw !== undefined
          ? U.circleAABB(car.x, car.z, car.radius, o.x, o.z, o.hw, o.hd)
          : (function () { var dx = car.x - o.x, dz = car.z - o.z, d = Math.hypot(dx, dz); return d < car.radius + o.r ? { nx: dx / (d || 1), nz: dz / (d || 1), depth: car.radius + o.r - d } : null; })();
        if (hit) {
          car.x += hit.nx * (hit.depth + 0.05); car.z += hit.nz * (hit.depth + 0.05);
          car.speed *= 0.75;
          car.heading += (hit.nx > 0 ? 1 : -1) * dt;
        }
      });
      fadeSpawn(car, dt);
      car.mesh.position.set(car.x, 0, car.z);
      car.mesh.rotation.y = car.heading;
      car.model.spin(car.speed, dt, 0);
      car.model.setSiren(self.time + (car.id.length % 3) * 0.2);
      // Colisión con jugadores
      players.forEach(function (p) { P.collideCars(p, car); });
    });
    this.nearestDist = nearest;
    this.policeBar = U.clamp(1 - nearest / 110, 0, 1) * 0.75 + this.level / C.MAX_WANTED * 0.25;

    // Bloqueos y pinchos según nivel
    if (this.level >= 3) {
      this.blockTimer -= dt;
      if (this.blockTimer <= 0) { this.spawnRoadblock(players); this.blockTimer = 16 - this.level; }
    }
    if (this.level >= 4) {
      this.spikeTimer -= dt;
      if (this.spikeTimer <= 0) { this.spawnSpikes(players); this.spikeTimer = 13 - this.level * 0.5; }
      if (Math.random() < dt * 0.06) this.spawnSpikes(players);
    }
    for (var r = this.roadblocks.length - 1; r >= 0; r--) {
      var rb = this.roadblocks[r]; rb.life -= dt;
      if (rb.life <= 0) {
        rb.group.parent && rb.group.parent.remove(rb.group);
        rb.obstacles.forEach(function (o) { self.city.removeObstacle(o); });
        this.roadblocks.splice(r, 1);
      }
    }
    // Pinchazos
    for (var s = this.spikes.length - 1; s >= 0; s--) {
      var sp = this.spikes[s]; sp.life -= dt; sp.cooldown -= dt;
      players.forEach(function (pl) {
        if (sp.cooldown <= 0 && U.dist2(pl.x, pl.z, sp.x, sp.z) < 30) {
          sp.cooldown = 3;
          if (pl.puncture) { pl.puncture(5.5); pl.applyDamage(6, 'spike'); }
          BTP.UI.toast(BTP.t('toast.spike'), 'bad');
          BTP.Audio.sfx('spike');
        }
      });
      if (sp.life <= 0) { sp.mesh.parent && sp.mesh.parent.remove(sp.mesh); this.spikes.splice(s, 1); }
    }
    // Radares / trampas de velocidad
    this.speedTraps.forEach(function (tr) {
      tr.cooldown -= dt;
      players.forEach(function (pl) {
        if (tr.cooldown <= 0 && Math.abs(pl.vLong) > 27 && U.dist2(pl.x, pl.z, tr.x, tr.z) < 100) {
          tr.cooldown = 12;
          self.addHeat(7);
          BTP.UI.toast(BTP.t('toast.level', { v: self.level }), 'warn');
        }
      });
    });
    // Helicóptero
    if (this.level >= 5 && !this.heli) this.spawnHeli();
    if (this.level < 5 && this.heli) this.removeHeli();
    if (this.heli) {
      var pl0 = players[0];
      var ang = this.time * 0.35;
      this.heli.position.x = U.damp(this.heli.position.x, pl0.x + Math.cos(ang) * 28, 1.2, dt);
      this.heli.position.z = U.damp(this.heli.position.z, pl0.z + Math.sin(ang) * 28, 1.2, dt);
      this.heli.position.y = 30 + Math.sin(this.time) * 1.5;
      this.heli.rotation.y = -ang;
      this.heli.userData.rotor.rotation.y += dt * 22;
      this.heli.userData.tailRotor.rotation.x += dt * 18;
      var beam = this.heli.userData.light;
      beam.position.set(pl0.x - this.heli.position.x, -this.heli.position.y + 0.1, pl0.z - this.heli.position.z);
      BTP.Audio.heliUpdate(true, U.clamp(1 - nearest / 100, 0, 1));
      // El foco acelera la "calor"
      this.heat += dt * 0.35;
    }

    // Medidor de detención: policía cerca + coche casi parado
    players.forEach(function (pl, idx) {
      var key = pl.id || ('p' + idx);
      var a = self.arrest[key] || 0;
      var slow = Math.abs(pl.vLong) < 5.5;
      var close = nearest < 16;
      if (slow && close && self.level > 0) a += dt * 0.32;
      else a -= dt * 0.28;
      a = U.clamp(a, 0, 1);
      self.arrest[key] = a;
      pl.arrest = a;
      if (a >= 1) {
        self.arrest[key] = 0;
        BTP.Bus.emit('arrested', { player: pl });
      }
    });

    BTP.Audio.sirenUpdate(this.level, U.clamp(1 - nearest / 90, 0, 1));
  };

  BTP.Traffic = Traffic;
  BTP.Police = Police;
})();
