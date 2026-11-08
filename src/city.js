/* =========================================================================
 * CIUDAD ABIERTA: calles, manzanas, rascacielos, parques, muelles, puente,
 * monorraíl, callejones, tráfico, colisiones, monedas y minimapa.
 * Todo se genera con un seed fijo para que la ciudad sea siempre la misma.
 * ========================================================================= */
(function () {
  'use strict';
  var BTP = window.BTP, U = BTP.U, C = BTP.C, M = BTP.Models;
  var EXT = 900;               // extensión del terreno dibujado
  var MAP_SIZE = 2048;
  var HALF = C.HALF, G = C.GRID, RW = C.ROAD_W, SW = C.SIDEWALK;

  // Paleta cálida tipo piedra/arenisca, como los edificios del original,
  // con algunos bloques de cristal moderno para dar variedad a la ciudad.
  var BUILD_COLORS = ['#d3c7ae', '#ddd0b8', '#c8bba3', '#cbb49c', '#d8c9ae', '#b9b2a2',
    '#e0d3bb', '#b7c0c8', '#d6c6ac', '#aebcc6', '#cdbfae', '#c9c4b6'];
  var CONTAINER_COLORS = ['#c0563c', '#3f7fb0', '#d09a34', '#4a9b6c', '#8b5ea8'];

  function toPx(v) { return (v + EXT) / (2 * EXT) * MAP_SIZE; }
  function toUnits(px) { return px / MAP_SIZE * (2 * EXT); }

  function setupCanvas() {
    var cv = document.createElement('canvas'); cv.width = cv.height = MAP_SIZE;
    var g = cv.getContext('2d');
    // Suelo base
    g.fillStyle = '#6fbb4a'; g.fillRect(0, 0, MAP_SIZE, MAP_SIZE);
    // Zonas de manzanas (acera / hierba)
    for (var i = -HALF; i < HALF; i++) for (var j = -HALF; j < HALF; j++) {
      var x0 = i * G + RW / 2, x1 = (i + 1) * G - RW / 2;
      var z0 = j * G + RW / 2, z1 = (j + 1) * G - RW / 2;
      var park = isPark(i, j);
      var water = (i + 0.5) * G > C.WATER_X;
      if (water) continue;
      var grass = !park && ((i * 3 + j * 7 + 500) % 5 < 2);
      g.fillStyle = park ? '#5d9a4e' : (grass ? '#6cbb48' : '#9a9ea3');
      g.fillRect(toPx(x0), toPx(z0), toUnits(1) * (x1 - x0), toUnits(1) * (z1 - z0));
      if (grass) {
        // Hierba a damero pixelado, como la franja verde del original.
        var step = toUnits(1) * 9;
        var gx0 = toPx(x0), gz0 = toPx(z0);
        var gw = toUnits(1) * (x1 - x0), gh = toUnits(1) * (z1 - z0);
        g.save(); g.beginPath(); g.rect(gx0, gz0, gw, gh); g.clip();
        for (var gy = gz0; gy < gz0 + gh; gy += step) for (var gx = gx0; gx < gx0 + gw; gx += step) {
          g.fillStyle = ((Math.floor(gx / step) + Math.floor(gy / step)) % 2)
            ? 'rgba(255,255,255,.11)' : 'rgba(0,0,0,.09)';
          g.fillRect(gx, gy, step, step);
        }
        g.restore();
      }
      if (park) {
        g.strokeStyle = '#d9d2b4'; g.lineWidth = toUnits(1) * 3;
        g.beginPath(); g.moveTo(toPx(x0), toPx((z0 + z1) / 2)); g.lineTo(toPx(x1), toPx((z0 + z1) / 2)); g.stroke();
        g.beginPath(); g.moveTo(toPx((x0 + x1) / 2), toPx(z0)); g.lineTo(toPx((x0 + x1) / 2), toPx(z1)); g.stroke();
        g.fillStyle = '#3f86b5';
        g.beginPath(); g.ellipse(toPx((x0 + x1) / 2 + 10), toPx((z0 + z1) / 2 - 8),
          toUnits(1) * 10, toUnits(1) * 6, 0, 0, Math.PI * 2); g.fill();
      }
    }
    // Agua (muelles al este) + puente
    g.fillStyle = '#2d7fb4';
    g.fillRect(toPx(C.WATER_X), 0, toPx(EXT) - toPx(C.WATER_X), MAP_SIZE);
    g.strokeStyle = 'rgba(255,255,255,0.16)'; g.lineWidth = 1.2;
    for (var wy = -EXT; wy < EXT; wy += 26) {
      g.beginPath(); g.moveTo(toPx(C.WATER_X + 8), toPx(wy));
      g.bezierCurveTo(toPx(C.WATER_X + 60), toPx(wy - 10), toPx(C.WATER_X + 120), toPx(wy + 10), toPx(EXT), toPx(wy));
      g.stroke();
    }
    // Calles
    var roadHalf = RW / 2;
    function drawRoad(axis, pos) {
      var a = toPx(pos - roadHalf - SW), b = toPx(pos + roadHalf + SW);
      var len = toUnits(1) * (2 * (HALF * G + G * 0.5));
      g.fillStyle = '#9a9ea3'; // aceras
      if (axis === 'x') g.fillRect(a, toPx(-HALF * G - G * 0.5), b - a, len);
      else g.fillRect(toPx(-HALF * G - G * 0.5), a, len, b - a);
      g.fillStyle = '#313438'; // asfalto
      var pa = toPx(pos - roadHalf), pb = toPx(pos + roadHalf);
      if (axis === 'x') g.fillRect(pa, toPx(-HALF * G - G * 0.5), pb - pa, len);
      else g.fillRect(toPx(-HALF * G - G * 0.5), pa, len, pb - pa);
      // líneas
      g.strokeStyle = '#e8e5d8'; g.lineWidth = toUnits(1) * 0.6;
      [-roadHalf + 1.5, roadHalf - 1.5].forEach(function (off) {
        g.beginPath();
        if (axis === 'x') { g.moveTo(toPx(pos + off), toPx(-HALF * G - G * 0.5)); g.lineTo(toPx(pos + off), toPx(HALF * G + G * 0.5)); }
        else { g.moveTo(toPx(-HALF * G - G * 0.5), toPx(pos + off)); g.lineTo(toPx(HALF * G + G * 0.5), toPx(pos + off)); }
        g.stroke();
      });
      // El original usa lineas BLANCAS discontinuas, no amarillas.
      g.strokeStyle = '#f4f4ee'; g.lineWidth = toUnits(1) * 0.85;
      g.setLineDash([toUnits(1) * 4.5, toUnits(1) * 9]);
      [-RW / 4, RW / 4].forEach(function (off) {
        g.beginPath();
        if (axis === 'x') { g.moveTo(toPx(pos + off), toPx(-HALF * G - G * 0.5)); g.lineTo(toPx(pos + off), toPx(HALF * G + G * 0.5)); }
        else { g.moveTo(toPx(-HALF * G - G * 0.5), toPx(pos + off)); g.lineTo(toPx(HALF * G + G * 0.5), toPx(pos + off)); }
        g.stroke();
      });
      g.setLineDash([]);
      // Pasos de cebra
      g.fillStyle = 'rgba(248,247,240,0.92)';
      for (var k = -HALF; k <= HALF; k++) {
        var cross = k * G;
        for (var s = 0; s < 5; s++) {
          var o = -roadHalf + 3 + s * 4.0;
          if (axis === 'x') g.fillRect(toPx(cross - 5), toPx(pos + o) - toUnits(1) * 0.6, toUnits(1) * 4.0, toUnits(1) * 3.1);
          else g.fillRect(toPx(pos + o) - toUnits(1) * 0.6, toPx(cross - 5), toUnits(1) * 3.1, toUnits(1) * 4.0);
        }
      }
    }
    for (var n = -HALF; n <= HALF; n++) { drawRoad('x', n * G); drawRoad('z', n * G); }
    // El agua tapa las calles que caen dentro de la bahía; solo queda el puente.
    g.fillStyle = '#2d7fb4';
    g.fillRect(toPx(C.WATER_X), 0, toPx(EXT) - toPx(C.WATER_X), toPx(-RW / 2 - 7));
    g.fillRect(toPx(C.WATER_X), toPx(RW / 2 + 7), toPx(EXT) - toPx(C.WATER_X), MAP_SIZE - toPx(RW / 2 + 7));
    g.fillStyle = '#454b52'; // tablero del puente
    g.fillRect(toPx(C.WATER_X), toPx(-RW / 2 - 3), toPx(EXT) - toPx(C.WATER_X), toUnits(1) * (RW + 6));
    g.fillStyle = '#f4f4ee';
    g.fillRect(toPx(C.WATER_X), toPx(-0.5), toPx(EXT) - toPx(C.WATER_X), toUnits(1) * 1);
    // Huellas de edificios en el mapa (las dibuja buildBlocks)
    return { canvas: cv, ctx: g };
  }

  function isPark(i, j) { return ((i * 7 + j * 13 + 500) % 19 === 3) || ((i * 3 - j * 5 + 500) % 23 === 7); }
  function isAlley(i, j) { return ((i * 11 + j * 5 + 500) % 13 === 4); }

  function blockRect(i, j) {
    return {
      x0: i * G + RW / 2 + SW, x1: (i + 1) * G - RW / 2 - SW,
      z0: j * G + RW / 2 + SW, z1: (j + 1) * G - RW / 2 - SW
    };
  }

  /* --------------------------- Constructor ------------------------------ */
  BTP.City = {
    EXT: EXT, MAP_SIZE: MAP_SIZE,
    build: function (scene) {
      var self = Object.create(BTP.City);
      self.scene = scene;
      self.group = new THREE.Group(); scene.add(self.group);
      self.rng = U.mulberry32(20250213);
      self.obstacles = [];
      self.hash = {};
      self.banks = []; self.hideouts = []; self.pickups = []; self.checkpoints = [];
      self.coinSpots = []; self.coins = []; self.powerups = [];
      self.trafficNodes = [];
      self.time = 0;

      var map = setupCanvas();
      self.mapCanvas = map.canvas;
      var ctx = map.ctx;

      // Terreno 3D
      var tex = new THREE.CanvasTexture(map.canvas);
      if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = 8;
      var ground = new THREE.Mesh(new THREE.PlaneGeometry(2 * EXT, 2 * EXT),
        new THREE.MeshLambertMaterial({ map: tex }));
      ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; ground.receiveShadow = true;
      self.group.add(ground);
      self.ground = ground;
      // Agua 3D (plano translúcido sobre el este)
      var water = new THREE.Mesh(new THREE.PlaneGeometry(EXT - C.WATER_X, 2 * EXT),
        new THREE.MeshLambertMaterial({ color: '#2d7fb4', transparent: true, opacity: 0.65 }));
      water.rotation.x = -Math.PI / 2; water.position.set((EXT + C.WATER_X) / 2, 0.01, 0);
      self.group.add(water);

      self.buildBlocks(ctx);
      self.buildSpecials();
      self.buildWaterAndBridge();
      self.buildMonorail();
      self.buildRoadProps();
      self.buildCoinSpots();
      self.buildTrafficNodes();
      tex.needsUpdate = true;

      // Bordes invisibles
      self.limit = C.WORLD;
      return self;
    },

    /* ----------------------------- Manzanas ------------------------------ */
    buildBlocks: function (ctx) {
      var rng = this.rng, bodies = [], facades = [], roofs = [], trees = [], lamps = [];
      var palette = BUILD_COLORS;
      for (var i = -HALF; i < HALF; i++) for (var j = -HALF; j < HALF; j++) {
        if ((i + 0.5) * G > C.WATER_X - 40) continue; // muelles
        var r = blockRect(i, j);
        var cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
        var bw = r.x1 - r.x0, bd = r.z1 - r.z0;
        if (isPark(i, j)) {
          for (var t = 0; t < 5; t++) {
            var tx = cx + U.rand(-bw * 0.38, bw * 0.38), tz = cz + U.rand(-bd * 0.38, bd * 0.38);
            trees.push({ x: tx, z: tz, c: (i + j + t) % 4, s: U.rand(0.8, 1.25) });
            this.addObstacle({ x: tx, z: tz, r: 1.2 * 1, type: 'tree' });
          }
          // bancos y farolas de parque
          lamps.push({ x: cx - bw * 0.3, z: cz - bd * 0.3, s: 0.7 });
          lamps.push({ x: cx + bw * 0.3, z: cz + bd * 0.3, s: 0.7 });
          continue;
        }
        var alley = isAlley(i, j);
        var count = alley ? 2 : (rng() < 0.45 ? 1 : 2);
        if (rng() < 0.18 && !alley) count = 3;
        var specs = [];
        if (alley) {
          // Callejón estrecho entre dos edificios (atajo visual)
          specs = [
            { x: cx, z: r.z0 + bd * 0.22, w: bw * 0.92, d: bd * 0.4 },
            { x: cx, z: r.z1 - bd * 0.22, w: bw * 0.92, d: bd * 0.4 }
          ];
          ctx.fillStyle = '#3a3d40';
          ctx.fillRect(toPx(r.x0), toPx(cz - 3.2), toUnits(1) * bw, toUnits(1) * 6.4);
        } else if (count === 1) {
          specs = [{ x: cx, z: cz, w: bw * U.rand(0.72, 0.92), d: bd * U.rand(0.72, 0.92) }];
        } else if (count === 2) {
          var splitX = rng() < 0.5;
          if (splitX) specs = [
            { x: cx - bw * 0.24, z: cz, w: bw * 0.44, d: bd * U.rand(0.8, 0.94) },
            { x: cx + bw * 0.24, z: cz, w: bw * 0.44, d: bd * U.rand(0.8, 0.94) }
          ];
          else specs = [
            { x: cx, z: cz - bd * 0.24, w: bw * U.rand(0.8, 0.94), d: bd * 0.44 },
            { x: cx, z: cz + bd * 0.24, w: bw * U.rand(0.8, 0.94), d: bd * 0.44 }
          ];
        } else {
          specs = [
            { x: cx - bw * 0.25, z: cz - bd * 0.25, w: bw * 0.4, d: bd * 0.4 },
            { x: cx + bw * 0.25, z: cz - bd * 0.25, w: bw * 0.4, d: bd * 0.4 },
            { x: cx, z: cz + bd * 0.27, w: bw * 0.86, d: bd * 0.38 }
          ];
        }
        specs.forEach(function (sp, idx) {
          var h = 9 + Math.pow(rng(), 1.5) * 42 + ((i === 0 || j === 0) ? 8 : 0);
          var glass = rng() < .18;
          var style = glass ? 2 : (rng() < .45 ? 1 : 0);
          var color = glass ? '#8fb6cf' : palette[Math.floor(rng() * palette.length)];
          bodies.push({ x: sp.x, z: sp.z, w: sp.w, d: sp.d, h: h, color: color, glass: glass });
          facades.push({ x: sp.x, z: sp.z, w: sp.w, d: sp.d, h: h, glass: glass, style: style });
          roofs.push({ x: sp.x, z: sp.z, w: sp.w, d: sp.d, h: h, color: color });
          selfAddBuilding.call(this, sp.x, sp.z, sp.w, sp.d, h);
          ctx.fillStyle = 'rgba(40,44,52,0.85)';
          ctx.fillRect(toPx(sp.x - sp.w / 2), toPx(sp.z - sp.d / 2), toUnits(1) * sp.w, toUnits(1) * sp.d);
        }, this);
      }
      // Instancias: cuerpos, fachadas, cornisas
      var bodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      var bodyMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), bodyMat, bodies.length);
      var facadeGroups = [[], [], []];
      facades.forEach(function (b) { facadeGroups[b.style].push(b); });
      var roofMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshLambertMaterial({ color: 0xffffff }), roofs.length);
      var mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
      var col = new THREE.Color();
      bodies.forEach(function (b, k) {
        p.set(b.x, b.h / 2, b.z); s.set(b.w, b.h, b.d); mtx.compose(p, q, s);
        bodyMesh.setMatrixAt(k, mtx); col.set(b.color); bodyMesh.setColorAt(k, col);
        p.set(b.x, b.h + 0.2, b.z); s.set(b.w + 0.7, 0.4, b.d + 0.7); mtx.compose(p, q, s);
        roofMesh.setMatrixAt(k, mtx); col.set(b.color).multiplyScalar(0.72); roofMesh.setColorAt(k, col);
      });
      var facadeMeshes = [];
      facadeGroups.forEach(function (list, style) {
        if (!list.length) return;
        var fm = new THREE.MeshBasicMaterial({ map: M.facadeTexture(style),
          transparent: true, alphaTest: 0.25, side: THREE.DoubleSide });
        var im = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), fm, list.length * 4);
        var idx = 0, tint = new THREE.Color('#ffffff');
        list.forEach(function (b) {
          var sides = [
            { dx: 0, dz: b.d / 2 + 0.04, ry: 0, sx: b.w * 0.94 },
            { dx: 0, dz: -b.d / 2 - 0.04, ry: Math.PI, sx: b.w * 0.94 },
            { dx: -b.w / 2 - 0.04, dz: 0, ry: -Math.PI / 2, sx: b.d * 0.94 },
            { dx: b.w / 2 + 0.04, dz: 0, ry: Math.PI / 2, sx: b.d * 0.94 }
          ];
          sides.forEach(function (sd) {
            q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), sd.ry);
            p.set(b.x + sd.dx, b.h / 2, b.z + sd.dz); s.set(sd.sx, b.h * 0.94, 1);
            mtx.compose(p, q, s); im.setMatrixAt(idx++, mtx);
          });
        });
        im.count = idx; im.instanceMatrix.needsUpdate = true;
        facadeMeshes.push(im);
      });
      bodyMesh.instanceMatrix.needsUpdate = true;
      roofMesh.instanceMatrix.needsUpdate = true;
      if (bodyMesh.instanceColor) bodyMesh.instanceColor.needsUpdate = true;
      if (roofMesh.instanceColor) roofMesh.instanceColor.needsUpdate = true;
      bodyMesh.castShadow = true; bodyMesh.receiveShadow = true;
      this.group.add(bodyMesh, roofMesh);
      var cityGroup = this.group;
      facadeMeshes.forEach(function (m) { cityGroup.add(m); });

      /* Azoteas con maquinaria y marquesinas de planta baja: dos mallas
         instanciadas para toda la ciudad (solo 2 draw calls extra) que
         rompen la monotonia de los bloques y dan vida a la calle. */
      var units = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshLambertMaterial({ color: 0xffffff }), Math.max(1, bodies.length * 2));
      var units = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshLambertMaterial({ color: 0xffffff }), Math.max(1, bodies.length * 2));
      var ui = 0, uc = new THREE.Color();
      bodies.forEach(function (bd, k) {
        q.identity();
        p.set(bd.x - bd.w * .18, bd.h + .75, bd.z - bd.d * .16); s.set(2.4, 1.1, 2.0);
        mtx.compose(p, q, s); units.setMatrixAt(ui, mtx); uc.set('#8e8b80'); units.setColorAt(ui, uc); ui++;
        p.set(bd.x + bd.w * .22, bd.h + .55, bd.z + bd.d * .18); s.set(1.6, .7, 1.5);
        mtx.compose(p, q, s); units.setMatrixAt(ui, mtx); uc.set('#a9a398'); units.setColorAt(ui, uc); ui++;
      });
      units.count = ui;
      units.instanceMatrix.needsUpdate = true;
      if (units.instanceColor) units.instanceColor.needsUpdate = true;
      // Portales oscuros a pie de calle para dar profundidad a las fachadas.
      var doors = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshLambertMaterial({ color: 0xffffff }), Math.max(1, bodies.length));
      var di = 0, dc = new THREE.Color();
      bodies.forEach(function (bd) {
        q.identity();
        p.set(bd.x, 1.45, bd.z + bd.d / 2 + .07);
        s.set(Math.min(3.2, bd.w * .22), 2.9, .12);
        mtx.compose(p, q, s); doors.setMatrixAt(di, mtx);
        dc.set(bd.glass ? '#2b4a63' : '#58493c'); doors.setColorAt(di, dc); di++;
      });
      doors.count = di; doors.instanceMatrix.needsUpdate = true;
      if (doors.instanceColor) doors.instanceColor.needsUpdate = true;
      units.castShadow = true;
      this.group.add(units, doors);

      // Árboles y farolas instanciados
      this.addInstancedProps(trees, lamps);
      // Semáforos en algunas intersecciones
      for (var si = -HALF; si <= HALF; si += 2) for (var sj = -HALF; sj <= HALF; sj += 2) {
        if ((si + sj) % 4 !== 0) continue;
        var light = M.makeTrafficLight();
        light.position.set(si * G + RW / 2 + 2, 0, sj * G + RW / 2 + 2);
        this.group.add(light);
      }

      function selfAddBuilding(x, z, w, d, h) {
        this.addObstacle({ x: x, z: z, hw: w / 2, hd: d / 2, type: 'building', h: h });
      }
    },

    addInstancedProps: function (trees, lamps) {
      var mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
      function make(geo, matFn, list, place, count) {
        count = count || 1;
        var mesh = new THREE.InstancedMesh(geo, matFn(), Math.max(1, list.length * count));
        var idx = 0;
        list.forEach(function (it) { place(it, function (pos, rot, scale, color) {
          q.copy(rot || q.identity()); p.copy(pos); s.copy(scale);
          mtx.compose(p, q, s); mesh.setMatrixAt(idx, mtx);
          if (color) mesh.setColorAt(idx, new THREE.Color(color));
          idx++;
        }); });
        mesh.count = idx;
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        return mesh;
      }
      var treeColors = ['#3f8f46', '#4fa451', '#357a3d', '#5caa4a'];
      var trunk = make(new THREE.CylinderGeometry(0.22, 0.3, 1.7, 6),
        function () { return new THREE.MeshLambertMaterial({ color: '#6b4b2f' }); }, trees,
        function (it, put) { put(new THREE.Vector3(it.x, 0.85 * it.s, it.z), null, new THREE.Vector3(it.s, it.s, it.s)); });
      var foliage = make(new THREE.ConeGeometry(1.25, 2.3, 6),
        function () { return new THREE.MeshLambertMaterial({ color: 0xffffff }); }, trees,
        function (it, put) {
          put(new THREE.Vector3(it.x, 2.5 * it.s, it.z), null, new THREE.Vector3(it.s, it.s, it.s), treeColors[it.c % 4]);
          put(new THREE.Vector3(it.x, 3.5 * it.s, it.z), null, new THREE.Vector3(it.s * 0.75, it.s * 0.75, it.s * 0.75), treeColors[(it.c + 1) % 4]);
        }, 2);
      var pole = make(new THREE.CylinderGeometry(0.1, 0.14, 6.5, 6),
        function () { return new THREE.MeshLambertMaterial({ color: '#55606b' }); }, lamps,
        function (it, put) { put(new THREE.Vector3(it.x, 3.25, it.z), null, new THREE.Vector3(1, 1, 1)); });
      var head = make(new THREE.BoxGeometry(0.7, 0.14, 0.35),
        function () { return new THREE.MeshBasicMaterial({ color: '#ffe9a8' }); }, lamps,
        function (it, put) { put(new THREE.Vector3(it.x + 1.2, 6.42, it.z), null, new THREE.Vector3(1, 1, 1)); });
      trunk.receiveShadow = true; foliage.castShadow = true;
      this.group.add(trunk, foliage, pole, head);
    },

    /* -------------------- Edificios especiales / puntos ------------------- */
    buildSpecials: function () {
      var bankBlocks = [[2, -1], [-2, 2], [4, 3], [-4, -3]];
      var hideBlocks = [[-3, 3], [3, -3], [1, 4], [-4, 1]];
      var self = this;
      bankBlocks.forEach(function (b) {
        var r = blockRect(b[0], b[1]);
        var cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
        var g = M.makeSpecialBuilding('bank', 30, 22, 26);
        g.position.set(cx, 0, cz); self.group.add(g);
        self.addObstacle({ x: cx, z: cz, hw: 15, hd: 13, type: 'building', h: 22 });
        self.banks.push({ x: cx, z: b[1] * G, bx: cx, bz: cz });
      });
      hideBlocks.forEach(function (b) {
        var r = blockRect(b[0], b[1]);
        var cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
        var g = M.makeSpecialBuilding('hideout', 26, 16, 24);
        g.position.set(cx, 0, cz); self.group.add(g);
        self.addObstacle({ x: cx, z: cz, hw: 13, hd: 12, type: 'building', h: 16 });
        self.hideouts.push({ x: cx, z: b[1] * G, bx: cx, bz: cz });
      });
      // Puntos de recogida del ladrón
      [[-1, -2], [2, 3], [-3, -1], [3, 1], [0, 4], [-4, 2]].forEach(function (b) {
        self.pickups.push({ x: (b[0] + 0.5) * G, z: b[1] * G });
      });
      // Puntos de control (contrarreloj)
      [[-5, -5], [-2, -4], [1, -5], [5, -3], [4, 0], [5, 4], [1, 5], [-3, 4], [-5, 1], [-1, 1]].forEach(function (b) {
        self.checkpoints.push({ x: b[0] * G, z: b[1] * G });
      });
    },

    /* ------------------------- Muelles y puente --------------------------- */
    buildWaterAndBridge: function () {
      var self = this, rng = U.mulberry32(77);
      // Puente sobre el agua por la calle z=0
      var bridge = new THREE.Mesh(new THREE.BoxGeometry(EXT - C.WATER_X + 40, 1.2, RW + 6),
        new THREE.MeshLambertMaterial({ color: '#4a5058' }));
      bridge.position.set((EXT + C.WATER_X) / 2 - 20, 0.6, 0);
      bridge.receiveShadow = true; this.group.add(bridge);
      for (var bz = -1; bz <= 1; bz += 2) {
        var rail = new THREE.Mesh(new THREE.BoxGeometry(EXT - C.WATER_X + 40, 1.4, 0.5),
          new THREE.MeshLambertMaterial({ color: '#d8dde2' }));
        rail.position.set((EXT + C.WATER_X) / 2 - 20, 1.9, bz * (RW / 2 + 2.5));
        this.group.add(rail);
      }
      // Pilares
      for (var px = C.WATER_X + 30; px < EXT; px += 60) {
        var pier = new THREE.Mesh(new THREE.BoxGeometry(3, 9, 6), new THREE.MeshLambertMaterial({ color: '#7d848c' }));
        pier.position.set(px, -3, 0); this.group.add(pier);
      }
      // Contenedores y barcos en los muelles
      for (var k = 0; k < 14; k++) {
        var cx = C.WATER_X + 22 + (k % 3) * 12;
        var cz = -HALF * G + k * (G * 0.9);
        if (Math.abs(cz) < 22) continue;
        var cont = M.makeContainer(CONTAINER_COLORS[k % CONTAINER_COLORS.length]);
        cont.position.set(cx, 0, cz); cont.rotation.y = (k % 2) * Math.PI / 2;
        this.group.add(cont);
        this.addObstacle({ x: cx, z: cz, hw: 3, hd: 5.5, type: 'building', h: 4 });
      }
      for (var b = 0; b < 4; b++) {
        var boat = M.makeBoat();
        boat.position.set(C.WATER_X + 90 + b * 90, 0.1, -350 + b * 210);
        boat.rotation.y = Math.PI / 2;
        this.group.add(boat);
      }
      // Muelles de madera
      for (var d = 0; d < 5; d++) {
        var dock = new THREE.Mesh(new THREE.BoxGeometry(30, 0.6, 10), new THREE.MeshLambertMaterial({ color: '#a58154' }));
        dock.position.set(C.WATER_X + 15, 0.4, -420 + d * 200); this.group.add(dock);
      }
      this.waterProps = true;
    },

    /* ---------------------------- Monorraíl ------------------------------ */
    buildMonorail: function () {
      var railMat = new THREE.MeshLambertMaterial({ color: '#b7bec6' });
      var rail = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 2 * HALF * G + G), railMat);
      rail.position.set(0, 16.5, 0); this.group.add(rail);
      for (var z = -HALF * G + G / 2; z <= HALF * G; z += G) {
        var pillar = new THREE.Mesh(new THREE.BoxGeometry(1.0, 16, 1.0), new THREE.MeshLambertMaterial({ color: '#8e959d' }));
        pillar.position.set(RW / 2 + 7, 8, z); this.group.add(pillar);
      }
      var train = M.makeMonorailTrain();
      train.position.set(0, 17.6, -HALF * G);
      this.group.add(train);
      this.monorail = train;
    },

    /* ------------------------- Farolas de calle --------------------------- */
    buildRoadProps: function () {
      // Farolas y árboles al borde de las calles (instancias ligeras)
      var lamps = [], trees = [];
      for (var i = -HALF; i <= HALF; i += 2) for (var j = -HALF; j < HALF; j++) {
        lamps.push({ x: i * G + RW / 2 + 1.5, z: (j + 0.5) * G, s: 1 });
        lamps.push({ x: (j + 0.5) * G, z: i * G + RW / 2 + 1.5, s: 1 });
      }
      for (var n = -HALF; n < HALF; n += 3) {
        trees.push({ x: (n + 0.5) * G, z: -HALF * G - RW / 2 - 6, c: n % 4, s: 1.1 });
      }
      // Arboles en las aceras: la ciudad del original es muy verde.
      for (var a = -HALF; a < HALF; a += 2) for (var bb = -HALF; bb < HALF; bb += 3) {
        trees.push({ x: a * G + RW / 2 + 3.2, z: (bb + .5) * G, c: (a + bb + 20) % 4, s: .9 });
        trees.push({ x: (bb + .5) * G, z: a * G + RW / 2 + 3.2, c: (a + bb + 21) % 4, s: .9 });
      }
      this.addInstancedProps(trees, lamps);
    },

    /* ------------------------------ Monedas ------------------------------- */
    buildCoinSpots: function () {
      var rng = U.mulberry32(9182);
      for (var i = -HALF; i <= HALF; i++) for (var j = -HALF; j < HALF; j++) {
        if (rng() < 0.42) {
          this.coinSpots.push({ x: (i + 0.5) * G + U.rand(-8, 8), z: j * G + U.rand(-4, 4) });
        }
        if (rng() < 0.42) {
          this.coinSpots.push({ x: i * G + U.rand(-4, 4), z: (j + 0.5) * G + U.rand(-8, 8) });
        }
      }
    },
    spawnCoin: function (x, z, kind) {
      var kind2 = kind || 'coin';
      var obj = kind2 === 'coin' ? M.makeCoin() : M.makePowerup(kind2);
      obj.position.set(x, 0, z);
      this.group.add(obj);
      var c = { obj: obj, x: x, z: z, kind: kind2, age: 0, alive: true, respawn: 0 };
      this.coins.push(c);
      return c;
    },
    collect: function (x, z, radius) {
      var got = [];
      for (var i = 0; i < this.coins.length; i++) {
        var c = this.coins[i];
        if (!c.alive) continue;
        if (U.dist2(x, z, c.x, c.z) < radius * radius) {
          c.alive = false; c.obj.visible = false; c.respawn = 18;
          got.push(c);
        }
      }
      return got;
    },

    /* ------------------------- Nodos de tráfico --------------------------- */
    buildTrafficNodes: function () {
      for (var i = -HALF; i <= HALF; i++) for (var j = -HALF; j <= HALF; j++) {
        if (i * G > C.WATER_X && j !== 0) continue;
        this.trafficNodes.push({ i: i, j: j, x: i * G, z: j * G });
      }
    },

    /* --------------------------- Colisiones ------------------------------- */
    addObstacle: function (o) {
      o.r = o.r || Math.max(o.hw || 0, o.hd || 0);
      this.obstacles.push(o);
      var cells = 32;
      var minX = Math.floor((o.x - (o.hw || o.r) - 2) / cells), maxX = Math.floor((o.x + (o.hw || o.r) + 2) / cells);
      var minZ = Math.floor((o.z - (o.hd || o.r) - 2) / cells), maxZ = Math.floor((o.z + (o.hd || o.r) + 2) / cells);
      for (var a = minX; a <= maxX; a++) for (var b = minZ; b <= maxZ; b++) {
        var key = a + ',' + b;
        (this.hash[key] = this.hash[key] || []).push(o);
      }
    },
    removeObstacle: function (o) {
      var k = this.obstacles.indexOf(o);
      if (k >= 0) this.obstacles.splice(k, 1);
      Object.keys(this.hash).forEach(function (key) {
        var list = this.hash[key], idx = list.indexOf(o);
        if (idx >= 0) list.splice(idx, 1);
      }, this);
    },
    query: function (x, z, radius) {
      var cells = 32, out = [], seen = new Set();
      var minX = Math.floor((x - radius) / cells), maxX = Math.floor((x + radius) / cells);
      var minZ = Math.floor((z - radius) / cells), maxZ = Math.floor((z + radius) / cells);
      for (var a = minX; a <= maxX; a++) for (var b = minZ; b <= maxZ; b++) {
        var list = this.hash[a + ',' + b];
        if (!list) continue;
        for (var k = 0; k < list.length; k++) {
          var o = list[k];
          if (seen.has(o)) continue;
          seen.add(o); out.push(o);
        }
      }
      return out;
    },

    /* ------------------------------ Consultas ----------------------------- */
    isRoad: function (x, z) {
      var limit = HALF * G + RW / 2;
      if (Math.abs(z) > limit || Math.abs(x) > limit) return false;
      var dx = Math.abs(x / G - Math.round(x / G)) * G;
      var dz = Math.abs(z / G - Math.round(z / G)) * G;
      return dx < RW / 2 + 1 || dz < RW / 2 + 1;
    },
    isWater: function (x, z) {
      return x > C.WATER_X + 4 && !(Math.abs(z) < RW / 2 + 4);
    },
    isDrivable: function (x, z) { return this.isRoad(x, z) || (x > C.WATER_X && Math.abs(z) < RW / 2 + 3); },
    nearestRoadPoint: function (x, z) {
      var ix = Math.round(x / G) * G, iz = Math.round(z / G) * G;
      var dx = Math.abs(x - ix), dz = Math.abs(z - iz);
      if (dx < dz) return { x: ix, z: z, axis: 'x', dir: x < ix ? 1 : -1 };
      return { x: x, z: iz, axis: 'z', dir: z < iz ? 1 : -1 };
    },
    nearestIntersection: function (x, z) {
      var i = U.clamp(Math.round(x / G), -HALF, HALF), j = U.clamp(Math.round(z / G), -HALF, HALF);
      return { i: i, j: j, x: i * G, z: j * G };
    },
    node: function (i, j) {
      i = U.clamp(i, -HALF, HALF); j = U.clamp(j, -HALF, HALF);
      return { i: i, j: j, x: i * G, z: j * G };
    },
    randomRoadPoint: function (rng, nearX, nearZ, minD, maxD) {
      rng = rng || Math.random;
      for (var tries = 0; tries < 40; tries++) {
        var i = Math.floor(rng() * (2 * HALF + 1)) - HALF;
        var j = Math.floor(rng() * (2 * HALF + 1)) - HALF;
        var alongZ = rng() < 0.5;
        var p = alongZ
          ? { x: i * G, z: (j + rng()) * G }
          : { x: (i + rng()) * G, z: j * G };
        if (this.isWater(p.x, p.z)) continue;
        if (nearX !== undefined) {
          var d = U.dist(p.x, p.z, nearX, nearZ);
          if (minD && d < minD) continue;
          if (maxD && d > maxD) continue;
        }
        return p;
      }
      return { x: 0, z: 0 };
    },
    /* Punto de calzada DELANTE del jugador, dentro de su cono de visión.
       Evita que tráfico, patrullas y objetos aparezcan detrás o de golpe
       en medio de la pantalla. */
    roadPointAhead: function (pl, minD, maxD) {
      if (!pl) return this.randomRoadPoint(Math.random, 0, 0, minD, maxD);
      var fx = -Math.sin(pl.heading || 0), fz = -Math.cos(pl.heading || 0);
      var best = null;
      for (var t = 0; t < 48; t++) {
        var p = this.randomRoadPoint(Math.random, pl.x, pl.z, minD, maxD);
        var dx = p.x - pl.x, dz = p.z - pl.z, d = Math.hypot(dx, dz) || 1;
        var dot = (dx * fx + dz * fz) / d;
        if (dot > 0.35) return p;
        if (!best || dot > best.dot) best = { p: p, dot: dot };
      }
      return best ? best.p : this.randomRoadPoint(Math.random, pl.x, pl.z, minD, maxD);
    },
    // BFS sobre la retícula: devuelve el primer paso desde (i,j) hacia (ti,tj).
    pathStep: function (i, j, ti, tj) {
      i = U.clamp(i, -HALF, HALF); j = U.clamp(j, -HALF, HALF);
      ti = U.clamp(ti, -HALF, HALF); tj = U.clamp(tj, -HALF, HALF);
      if (i === ti && j === tj) return null;
      var key = function (a, b) { return a + ',' + b; };
      var queue = [[i, j]], prev = {}, head = 0;
      prev[key(i, j)] = null;
      var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      while (head < queue.length) {
        var cur = queue[head++];
        if (cur[0] === ti && cur[1] === tj) {
          var node = cur, last = null;
          while (prev[key(node[0], node[1])]) {
            last = node;
            node = prev[key(node[0], node[1])];
          }
          return last ? { i: last[0], j: last[1], x: last[0] * G, z: last[1] * G } : null;
        }
        for (var d = 0; d < 4; d++) {
          var ni = cur[0] + dirs[d][0], nj = cur[1] + dirs[d][1];
          if (ni < -HALF || ni > HALF || nj < -HALF || nj > HALF) continue;
          if (ni * G > C.WATER_X && nj !== 0) continue;
          if (prev[key(ni, nj)] !== undefined) continue;
          prev[key(ni, nj)] = cur;
          queue.push([ni, nj]);
        }
      }
      return null;
    },

    /* ------------------------------ Animación ----------------------------- */
    update: function (dt) {
      this.time += dt;
      var t = this.time;
      if (this.monorail) {
        this.monorail.position.z += dt * 28;
        if (this.monorail.position.z > HALF * G + 60) this.monorail.position.z = -HALF * G - 60;
      }
      for (var i = 0; i < this.coins.length; i++) {
        var c = this.coins[i];
        if (!c.alive) {
          c.respawn -= dt;
          if (c.respawn <= 0) { c.alive = true; c.obj.visible = true; }
          continue;
        }
        c.age += dt;
        if (c.kind === 'coin') {
          c.obj.position.y = 1.6 + Math.sin(t * 3 + c.age * 0.2 + i) * 0.28;
          c.obj.material.rotation = Math.sin(t * 1.2 + i) * 0.35;
        } else {
          c.obj.position.y = Math.sin(t * 2 + i) * 0.3;
          c.obj.rotation.y += dt * 1.6;
        }
      }
    },
    clearPickups: function () {
      this.coins.forEach(function (c) { c.obj.parent && c.obj.parent.remove(c.obj); });
      this.coins = [];
    }
  };
})();
