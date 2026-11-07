/* =========================================================================
 * MODELOS 3D 100% procedurales. No se usa ningún asset externo con copyright:
 * cada coche, edificio, textura, personaje y efecto se construye aquí en código.
 * Estética low-poly inspirada en el original (Three.js r150, empaquetado local).
 * ========================================================================= */
(function () {
  'use strict';
  var BTP = window.BTP, U = BTP.U, C = BTP.C;
  var M = BTP.Models = {};
  var cache = {};

  function mat(color, opts) {
    return new THREE.MeshLambertMaterial(Object.assign({ color: color }, opts || {}));
  }
  function basic(color, opts) {
    return new THREE.MeshBasicMaterial(Object.assign({ color: color }, opts || {}));
  }
  function box(w, h, d, material, x, y, z, parent) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(x || 0, y || 0, z || 0);
    if (parent) parent.add(m);
    return m;
  }
  function cyl(rt, rb, h, seg, material, x, y, z, parent) {
    var m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
    m.position.set(x || 0, y || 0, z || 0);
    if (parent) parent.add(m);
    return m;
  }
  M.mat = mat; M.basic = basic; M.box = box; M.cyl = cyl;

  /* ------------------------- Texturas de canvas -------------------------- */
  M.canvasTexture = function (w, h, draw) {
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    draw(cv.getContext('2d'), w, h);
    var t = new THREE.CanvasTexture(cv);
    if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return t;
  };

  M.facadeTexture = function (variant) {
    var key = 'facade' + variant;
    if (cache[key]) return cache[key];
    var palettes = [
      ['#20304a', '#8fd8ff'], ['#2b2a33', '#ffd98c'], ['#26343a', '#b9f0e0'],
      ['#3a3040', '#ffb4c8'], ['#2d3b33', '#e8ffb0']
    ];
    var p = palettes[variant % palettes.length];
    var t = M.canvasTexture(128, 256, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      var cols = 4, rows = 8, pad = 10;
      var cw = (w - pad * (cols + 1)) / cols, ch = (h - pad * (rows + 1)) / rows;
      var rnd = U.mulberry32(100 + variant * 37);
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
        var lit = rnd() > 0.55;
        g.fillStyle = lit ? p[1] : p[0];
        g.globalAlpha = lit ? 0.85 : 0.95;
        g.fillRect(pad + c * (cw + pad), pad + r * (ch + pad), cw, ch);
        g.globalAlpha = 1;
        g.fillStyle = 'rgba(255,255,255,0.14)';
        g.fillRect(pad + c * (cw + pad), pad + r * (ch + pad), cw, 2);
      }
    });
    cache[key] = t; return t;
  };

  M.coinTexture = function () {
    if (cache.coin) return cache.coin;
    cache.coin = M.canvasTexture(128, 128, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      g.beginPath(); g.arc(64, 64, 58, 0, Math.PI * 2);
      g.fillStyle = '#ffcf2e'; g.fill();
      g.lineWidth = 7; g.strokeStyle = '#e8940b'; g.stroke();
      g.beginPath(); g.arc(64, 64, 45, 0, Math.PI * 2);
      g.lineWidth = 3; g.strokeStyle = '#fff0a0'; g.stroke();
      g.fillStyle = '#9a5c00'; g.font = 'bold 76px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('$', 64, 68);
    });
    return cache.coin;
  };

  M.signTexture = function (text, bg, fg) {
    return M.canvasTexture(256, 128, function (g, w, h) {
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
      g.fillStyle = fg; g.font = 'bold 58px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(text, w / 2, h / 2 + 4);
    });
  };

  M.numberTexture = function (num) {
    var key = 'num' + num;
    if (cache[key]) return cache[key];
    cache[key] = M.canvasTexture(128, 128, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      g.fillStyle = '#ffffff'; g.font = 'bold 88px Arial Black, Arial';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(num, 64, 68);
    });
    return cache[key];
  };

  /* ----------------------------- Perfiles -------------------------------- */
  // Silueta lateral: u = eje longitudinal (positivo = morro), v = altura.
  var PROFILES = {
    muscle: [[-2.35, .42], [-2.35, .95], [-1.55, 1.02], [-.85, 1.60], [.55, 1.62],
             [1.0, 1.06], [2.1, .98], [2.35, .86], [2.35, .42]],
    sedan:  [[-2.3, .42], [-2.3, .98], [-1.35, 1.05], [-.75, 1.62], [.85, 1.62],
             [1.55, 1.04], [2.25, .98], [2.3, .88], [2.3, .42]],
    hatch:  [[-2.0, .42], [-2.0, 1.05], [-1.2, 1.55], [.9, 1.55], [1.75, 1.05],
             [2.0, .92], [2.0, .42]],
    sport:  [[-2.45, .34], [-2.45, .78], [-1.5, .86], [-.65, 1.36], [.45, 1.38],
             [1.25, .84], [2.35, .78], [2.45, .64], [2.45, .34]],
    super:  [[-2.5, .30], [-2.5, .70], [-1.35, .78], [-.55, 1.30], [.35, 1.32],
             [1.5, .76], [2.4, .70], [2.5, .56], [2.5, .30]],
    hyper:  [[-2.5, .28], [-2.5, .72], [-1.4, .80], [-.5, 1.28], [.4, 1.30],
             [1.3, .78], [2.45, .68], [2.5, .54], [2.5, .28]],
    police: [[-2.35, .42], [-2.35, .98], [-1.5, 1.04], [-.8, 1.62], [.6, 1.64],
             [1.05, 1.08], [2.15, 1.0], [2.35, .88], [2.35, .42]],
    van:    [[-2.5, .42], [-2.5, 1.95], [1.95, 1.95], [2.5, 1.55], [2.5, .42]],
    pickup: [[-2.5, .42], [-2.5, 1.02], [-1.6, 1.05], [-1.0, 1.75], [.25, 1.75],
             [.75, 1.05], [2.5, 1.02], [2.5, .42]],
    truck:  [[-2.9, .48], [-2.9, 2.15], [-1.05, 2.15], [-.55, 1.15], [2.9, 1.12], [2.9, .48]]
  };
  var WIDTHS = { muscle: 1.95, sedan: 1.9, hatch: 1.85, sport: 2.0, super: 2.05, hyper: 2.05,
    police: 1.95, van: 2.1, pickup: 2.1, truck: 2.6 };
  var WB = { muscle: 1.45, sedan: 1.42, hatch: 1.25, sport: 1.5, super: 1.55, hyper: 1.55,
    police: 1.45, van: 1.6, pickup: 1.6, truck: 1.7 };

  function bodyGeometry(shape) {
    var key = 'body_' + shape;
    if (cache[key]) return cache[key];
    var pts = PROFILES[shape] || PROFILES.muscle;
    var s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    var w = WIDTHS[shape] || 1.95;
    var g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false, steps: 1, curveSegments: 1 });
    g.rotateY(Math.PI / 2);
    g.translate(-w / 2, 0, 0);
    // Después de rotateY: x'=profundidad, z'=-u  =>  el morro (+u) queda en -Z. Correcto.
    g.computeVertexNormals();
    cache[key] = g;
    return g;
  }

  /* -------------------------------- Coche -------------------------------- */
  /**
   * spec: {shape, color, police, traffic, number, scale, siren, spikes}
   * Devuelve {group, wheels[], steer[], paint[], brakeLights[], headlights[],
   *           siren[], setColor(), setSiren(), setBrake(), spin(), length, width}
   */
  M.makeCar = function (spec) {
    spec = spec || {};
    var shape = PROFILES[spec.shape] ? spec.shape : 'muscle';
    var police = !!spec.police;
    var traffic = !!spec.traffic;
    var scale = spec.scale || 1;
    var color = spec.color || (police ? '#22262e' : '#f57c1f');
    var g = new THREE.Group();
    g.scale.setScalar(scale);
    var w = WIDTHS[shape], wb = WB[shape];
    var paintMat = mat(color);
    var paint = [];
    var accentMat = mat(police ? '#f2a71b' : U.hexToRgb(color) ? shade(color, 0.78) : '#d06010');
    var dark = mat('#1b1e24'), glass = mat('#22303f', { transparent: true, opacity: 0.92 });
    var chrome = mat('#c9ced6'), rubber = mat('#17191c');

    // Carrocería
    var body = new THREE.Mesh(bodyGeometry(shape), paintMat);
    body.castShadow = true; body.receiveShadow = true;
    g.add(body); paint.push(body);
    // Banda inferior / parachoques
    var bumperF = box(w * 0.96, 0.22, 0.25, chrome, 0, 0.52, -2.42, g);
    var bumperR = box(w * 0.96, 0.22, 0.25, chrome, 0, 0.52, 2.42, g);
    if (!traffic) {
      box(w * 0.98, 0.12, 0.14, dark, 0, 0.38, -2.5, g);
      box(w * 0.98, 0.12, 0.14, dark, 0, 0.38, 2.5, g);
    }
    // Capó / techo en contraste (detalle low-poly)
    var hood = box(w * 0.82, 0.06, 1.15, accentMat, 0, 1.0, -1.72, g);
    hood.rotation.x = -0.045;
    g.add(hood); paint.push(hood);
    if (police) {
      // Capó naranja, puertas blancas y banda negra, como en el original
      var white = mat('#f4f5f7');
      box(0.06, 0.92, 1.5, white, -w / 2 - 0.005, 1.02, 0.05, g);
      box(0.06, 0.92, 1.5, white, w / 2 + 0.005, 1.02, 0.05, g);
      box(w + 0.02, 0.22, 0.9, dark, 0, 0.72, 0.05, g);
      // escudo circular en las puertas
      [-1, 1].forEach(function (s) {
        var badge = new THREE.Mesh(new THREE.CircleGeometry(0.34, 12), basic('#e9eef5'));
        badge.position.set(s * (w / 2 + 0.045), 1.12, 0.05);
        badge.rotation.y = s * Math.PI / 2; g.add(badge);
        var dot = new THREE.Mesh(new THREE.CircleGeometry(0.16, 10), basic('#2f6fd0'));
        dot.position.set(s * (w / 2 + 0.05), 1.12, 0.05);
        dot.rotation.y = s * Math.PI / 2; g.add(dot);
      });
    }
    // Cristales: parabrisas, luneta y ventanillas laterales
    var windshield = box(w * 0.78, 0.72, 0.08, glass, 0, 1.32, -0.78, g);
    windshield.rotation.x = -0.55;
    var rearGlass = box(w * 0.78, 0.62, 0.08, glass, 0, 1.32, 1.02, g);
    rearGlass.rotation.x = 0.55;
    [-1, 1].forEach(function (s) {
      var win = box(0.06, 0.52, 1.25, glass, s * (w / 2 + 0.01), 1.34, 0.06, g);
      win.rotation.z = s * 0.02;
    });
    // Faros y pilotos
    var hm = basic('#ffe14d'), tm = basic('#7a1414'), bm = basic('#ff2b1d');
    var headlights = [], brakeLights = [];
    [-1, 1].forEach(function (s) {
      var h = box(0.44, 0.18, 0.1, hm.clone(), s * w * 0.32, 0.82, -2.44, g);
      headlights.push(h);
      var t = box(0.44, 0.16, 0.1, tm.clone(), s * w * 0.32, 0.9, 2.45, g);
      brakeLights.push(t);
      var b = box(0.3, 0.1, 0.06, bm.clone(), s * w * 0.32, 0.72, 2.5, g);
      brakeLights.push(b);
    });
    // Ruedas
    var wheels = [], steer = [];
    [-1, 1].forEach(function (front) {
      [-1, 1].forEach(function (side) {
        var pivot = new THREE.Group();
        pivot.position.set(side * (w / 2 + 0.06), 0.56, front * wb);
        g.add(pivot);
        var spin = new THREE.Group(); pivot.add(spin);
        var tire = cyl(0.56, 0.56, 0.32, 10, rubber, 0, 0, 0, spin);
        tire.rotation.z = Math.PI / 2;
        var hub = cyl(0.3, 0.3, 0.34, 10, chrome, 0, 0, 0, spin);
        hub.rotation.z = Math.PI / 2;
        var cap = cyl(0.14, 0.14, 0.36, 8, dark, 0, 0, 0, spin);
        cap.rotation.z = Math.PI / 2;
        wheels.push(spin);
        if (front === -1) steer.push(pivot); // eje delantero en -Z
      });
    });
    // Detalles según tipo
    if (shape === 'sport' || shape === 'super' || shape === 'hyper') {
      box(w * 0.9, 0.1, 0.42, dark, 0, 1.12, 2.05, g); // alerón
      box(0.1, 0.35, 0.1, dark, -w * 0.36, 0.95, 2.05, g);
      box(0.1, 0.35, 0.1, dark, w * 0.36, 0.95, 2.05, g);
    }
    if (shape === 'truck' || shape === 'van' || shape === 'pickup') {
      box(w * 0.9, 0.1, 1.0, dark, 0, 1.05, 1.55, g); // caja / batea
    }
    if (spec.number !== undefined && !traffic) {
      [-1, 1].forEach(function (s) {
        var n = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.72),
          basic('#ffffff', { map: M.numberTexture(spec.number), transparent: true, alphaTest: 0.2, side: THREE.DoubleSide }));
        n.position.set(s * (w / 2 + 0.02), 1.02, -0.15);
        n.rotation.y = s * Math.PI / 2; g.add(n);
      });
      // Número también en el maletero (visible desde la cámara de persecución)
      var rn = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7),
        basic('#ffffff', { map: M.numberTexture(spec.number), transparent: true, alphaTest: 0.2, side: THREE.DoubleSide }));
      rn.position.set(0, 0.84, 2.46); g.add(rn);
      // franjas de competición
      [-0.32, 0.32].forEach(function (x) { box(0.18, 0.03, 1.2, basic('#ffffff'), x, 1.04, -1.7, g); });
      // Parrilla negra y defensas delanteras del muscle car clásico
      box(w * 0.72, 0.16, 0.12, dark, 0, 0.74, -2.5, g);
      box(w * 1.02, 0.14, 0.16, dark, 0, 0.42, -2.62, g);
      [-1, 1].forEach(function (s) {
        box(0.13, 0.55, 0.13, dark, s * w * 0.34, 0.62, -2.56, g);
      });
    }
    // Luces de policía y parachoques reforzado
    var siren = [];
    if (police) {
      var bar = box(0.16, 0.16, 1.0, dark, 0, 1.7, 0.02, g);
      var red = box(0.22, 0.18, 0.44, basic('#ff2020'), -0.32, 1.72, 0.02, g);
      var blue = box(0.22, 0.18, 0.44, basic('#2050ff'), 0.32, 1.72, 0.02, g);
      siren = [red, blue];
      box(w * 1.0, 0.22, 0.16, chrome, 0, 0.62, -2.6, g); // defensa
      box(0.1, 0.35, 0.1, dark, -w * 0.4, 0.82, -2.55, g);
      box(0.1, 0.35, 0.1, dark, w * 0.4, 0.82, -2.55, g);
    }
    // Conductor (simple) para coches del jugador
    var driver = null;
    if (!traffic && !police && shape !== 'truck') {
      driver = new THREE.Group();
      cyl(0.26, 0.3, 0.5, 8, mat('#2a3548'), 0, 0.25, 0, driver);
      var head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 6), mat('#e8bd94'));
      head.position.y = 0.6; driver.add(head);
      driver.position.set(0, 0.82, 0.15);
      g.add(driver);
    }

    var obj = {
      group: g, wheels: wheels, steer: steer, paint: paint, body: body,
      brakeLights: brakeLights, headlights: headlights, siren: siren, driver: driver,
      length: 4.9, width: w, shape: shape,
      paintMaterial: paintMat, accentMaterial: accentMat,
      setColor: function (hex) {
        paintMat.color.set(hex);
        accentMat.color.set(shade(hex, 0.78));
      },
      setBrake: function (on) {
        brakeLights.forEach(function (m, i) { m.material.color.set(on ? (i % 2 ? '#ff5a3c' : '#ff2b1d') : (i % 2 ? '#a01c14' : '#7a1414')); });
      },
      setSiren: function (time) {
        if (!siren.length) return;
        var a = Math.floor(time * 6) % 2;
        siren[0].material.color.set(a ? '#ff2020' : '#551010');
        siren[1].material.color.set(a ? '#101050' : '#2050ff');
      },
      spin: function (v, dt, steerAngle) {
        wheels.forEach(function (wgrp) { wgrp.rotation.x -= v * dt / 0.56; });
        steer.forEach(function (p) { p.rotation.y = steerAngle || 0; });
      }
    };
    return obj;
  };

  function shade(hex, f) {
    var rgb = U.hexToRgb(hex);
    return '#' + rgb.map(function (c) { return ('0' + Math.round(c * f).toString(16)).slice(-2); }).join('');
  }

  /* --------------------------- Objetos de ciudad ------------------------- */
  M.makeTree = function (colorIndex) {
    var g = new THREE.Group();
    cyl(0.22, 0.3, 1.7, 6, mat('#6b4b2f'), 0, 0.85, 0, g);
    var cols = ['#3f8f46', '#4fa451', '#357a3d', '#5caa4a'];
    var c1 = new THREE.Mesh(new THREE.ConeGeometry(1.25, 2.3, 6), mat(cols[colorIndex % cols.length]));
    c1.position.y = 2.5; c1.castShadow = true; g.add(c1);
    var c2 = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.8, 6), mat(cols[(colorIndex + 1) % cols.length]));
    c2.position.y = 3.5; g.add(c2);
    return g;
  };

  M.makeLamp = function () {
    var g = new THREE.Group();
    cyl(0.1, 0.14, 6.5, 6, mat('#55606b'), 0, 3.25, 0, g);
    box(1.7, 0.12, 0.12, mat('#55606b'), 0.85, 6.5, 0, g);
    box(0.7, 0.14, 0.35, basic('#ffe9a8'), 1.5, 6.42, 0, g);
    return g;
  };

  M.makeTrafficLight = function () {
    var g = new THREE.Group();
    cyl(0.09, 0.12, 5.2, 6, mat('#4a525c'), 0, 2.6, 0, g);
    box(0.5, 1.25, 0.4, mat('#2b3138'), 0, 5.3, 0, g);
    ['#ff322b', '#ffc42b', '#39d95a'].forEach(function (c, i) {
      var l = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), basic(c));
      l.position.set(0, 5.75 - i * 0.38, 0.21); g.add(l);
    });
    return g;
  };

  M.makeCone = function () {
    var g = new THREE.Group();
    box(0.75, 0.08, 0.75, mat('#2a2a2a'), 0, 0.04, 0, g);
    var c = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.9, 8), mat('#ff6a1a'));
    c.position.y = 0.5; g.add(c);
    box(0.44, 0.12, 0.44, basic('#f4f4f4'), 0, 0.55, 0, g);
    return g;
  };

  M.makeBarricade = function () {
    var g = new THREE.Group();
    box(3.4, 0.22, 0.22, mat('#e8412f'), 0, 0.9, 0, g);
    box(3.4, 0.22, 0.22, basic('#ffffff'), 0, 0.9, 0.13, g);
    box(3.4, 0.22, 0.22, mat('#e8412f'), 0, 0.9, 0.26, g);
    [-1.5, 1.5].forEach(function (x) { box(0.18, 0.9, 0.18, mat('#4a5058'), x, 0.45, 0.1, g); });
    box(0.8, 0.5, 0.4, basic('#2258cc'), 0, 1.3, 0, g);
    box(0.25, 0.12, 0.42, basic('#ff3030'), 0, 1.32, 0, g);
    box(0.25, 0.12, 0.42, basic('#305cff'), 0, 1.20, 0, g);
    return g;
  };

  M.makeSpikeStrip = function () {
    var g = new THREE.Group();
    box(4.2, 0.08, 1.0, mat('#2c3138'), 0, 0.04, 0, g);
    for (var i = -4; i <= 4; i++) {
      var s = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.5, 4), mat('#c8ced6'));
      s.position.set(i * 0.48, 0.28, U.chance(0.5) ? -0.22 : 0.22); g.add(s);
    }
    return g;
  };

  M.makeCoin = function () {
    var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: M.coinTexture(), transparent: true, depthWrite: false }));
    s.scale.set(1.7, 1.7, 1);
    s.userData.spin = Math.random() * 6;
    return s;
  };

  M.makeMoneyBag = function () {
    var g = new THREE.Group();
    var b = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 6), mat('#c9a34a'));
    b.scale.set(1, 0.8, 0.8); b.position.y = 0.5; g.add(b);
    cyl(0.18, 0.22, 0.3, 8, mat('#a17f34'), 0, 1.05, 0, g);
    box(0.55, 0.3, 0.05, basic('#2e7d32'), 0, 0.5, 0.43, g);
    return g;
  };

  M.makePowerup = function (kind) {
    var g = new THREE.Group();
    var col = kind === 'nitro' ? '#28d7ff' : (kind === 'shield' ? '#7dffb2' : '#ffd23f');
    var core = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 0), basic(col, { transparent: true, opacity: 0.9 }));
    core.position.y = 1.4; g.add(core);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.09, 6, 16), basic(col));
    ring.position.y = 1.4; ring.rotation.x = Math.PI / 2; g.add(ring);
    g.userData.core = core; g.userData.ring = ring;
    return g;
  };

  M.makeRobber = function () {
    var g = new THREE.Group();
    var suit = mat('#2d3340');
    cyl(0.34, 0.42, 1.1, 8, suit, 0, 0.75, 0, g);
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), mat('#e5b58c'));
    head.position.y = 1.55; g.add(head);
    box(0.7, 0.22, 0.7, mat('#191d24'), 0, 1.72, 0, g); // gorra
    box(0.6, 0.2, 0.1, mat('#191d24'), 0, 1.55, 0.31, g); // antifaz
    [-1, 1].forEach(function (s) {
      box(0.2, 0.7, 0.2, suit, s * 0.22, 0.35, 0, g);
      box(0.22, 0.7, 0.22, suit, s * 0.46, 1.0, 0, g);
    });
    var bag = M.makeMoneyBag(); bag.scale.setScalar(0.7); bag.position.set(0.5, 0.95, 0.1); g.add(bag);
    return g;
  };

  M.makeBuilding = function (w, h, d, color, variant) {
    var g = new THREE.Group();
    var body = box(w, h, d, mat(color), 0, h / 2, 0, g);
    body.castShadow = true; body.receiveShadow = true;
    var tex = M.facadeTexture(variant);
    var fm = basic('#ffffff', { map: tex, transparent: true, alphaTest: 0.25, side: THREE.DoubleSide });
    var fw = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.94), fm);
    fw.position.set(0, h / 2, d / 2 + 0.02); g.add(fw);
    var bk = fw.clone(); bk.position.z = -d / 2 - 0.02; bk.rotation.y = Math.PI; g.add(bk);
    var lf = new THREE.Mesh(new THREE.PlaneGeometry(d * 0.94, h * 0.94), fm);
    lf.position.set(-w / 2 - 0.02, h / 2, 0); lf.rotation.y = -Math.PI / 2; g.add(lf);
    var rt = lf.clone(); rt.position.x = w / 2 + 0.02; rt.rotation.y = Math.PI / 2; g.add(rt);
    box(w + 0.6, 0.35, d + 0.6, mat(shade(color, 0.72)), 0, h + 0.15, 0, g); // cornisa
    if (h > 20) {
      box(2.2, 1.6, 2.2, mat('#8c939c'), w * 0.2, h + 1.1, -d * 0.2, g);
      cyl(0.07, 0.07, 3.5, 5, mat('#a7adb5'), -w * 0.25, h + 2, d * 0.2, g);
    }
    return g;
  };

  M.makeSpecialBuilding = function (kind, w, h, d) {
    var isBank = kind === 'bank';
    var g = M.makeBuilding(w, h, d, isBank ? '#d9cfb4' : '#7c8a99', isBank ? 1 : 0);
    var tex = M.signTexture(isBank ? 'BANK' : 'HIDEOUT', isBank ? '#1d4f8b' : '#1f6b46', '#ffffff');
    var sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w * 0.8, 8), 2.2),
      basic('#ffffff', { map: tex, side: THREE.DoubleSide }));
    sign.position.set(0, h * 0.72, d / 2 + 0.05); g.add(sign);
    if (isBank) {
      [-1, 1].forEach(function (s) {
        cyl(0.55, 0.55, h * 0.7, 8, mat('#efe6cd'), s * w * 0.36, h * 0.35, d / 2 + 1.0, g);
      });
      box(w + 1.5, 0.7, 2.2, mat('#efe6cd'), 0, h * 0.72, d / 2 + 0.6, g);
    } else {
      box(w * 0.3, h * 0.34, 0.2, mat('#20303a'), -w * 0.2, h * 0.24, d / 2 + 0.1, g);
    }
    return g;
  };

  M.makeHelicopter = function () {
    var g = new THREE.Group();
    var body = new THREE.Mesh(new THREE.SphereGeometry(1.7, 8, 6), mat('#1e2732'));
    body.scale.set(1, 0.75, 1.5); body.position.y = 0.4; g.add(body);
    box(0.8, 0.7, 3.0, mat('#26313e'), 0, 0.2, 3.0, g);
    cyl(0.1, 0.1, 0.5, 6, mat('#88919b'), 0, 1.3, 0, g);
    var rotor = new THREE.Group(); rotor.position.y = 1.6; g.add(rotor);
    box(11, 0.08, 0.35, mat('#3c4652'), 0, 0, 0, rotor);
    box(0.35, 0.08, 11, mat('#3c4652'), 0, 0, 0, rotor);
    var tailRotor = new THREE.Group(); tailRotor.position.set(0.45, 0.4, 4.4); g.add(tailRotor);
    box(0.08, 2.4, 0.2, mat('#88919b'), 0, 0, 0, tailRotor);
    var light = new THREE.Mesh(new THREE.CircleGeometry(2.0, 16), basic('#ffffff', { transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }));
    light.rotation.x = -Math.PI / 2; light.position.y = -14; g.add(light);
    g.userData.rotor = rotor; g.userData.tailRotor = tailRotor; g.userData.light = light;
    return g;
  };

  M.makeMonorailTrain = function () {
    var g = new THREE.Group();
    for (var i = 0; i < 3; i++) {
      var car = box(3.2, 2.5, 8, mat(i === 0 ? '#ffce2b' : '#e9edf2'), 0, 0, i * 8.4, g);
      box(2.6, 0.9, 6, mat('#2a6fa8'), 0, 0.4, i * 8.4, g);
    }
    return g;
  };

  M.makeBoat = function () {
    var g = new THREE.Group();
    box(4, 1.2, 12, mat('#e8ecef'), 0, 0.6, 0, g);
    box(3, 1.6, 5, mat('#d64545'), 0, 2, -2, g);
    box(2.4, 0.8, 4, mat('#2a587f'), 0, 2.9, -2, g);
    return g;
  };

  M.makeContainer = function (color) {
    var g = new THREE.Group();
    box(5, 4.2, 10, mat(color || '#c0563c'), 0, 2.1, 0, g);
    for (var i = -4; i <= 4; i++) box(0.1, 3.8, 0.12, mat(shade(color || '#c0563c', 0.8)), 2.52, 2.1, i, g);
    return g;
  };

  /* ------------------- Marcadores verdes / flecha / anillo --------------- */
  function arrowShape() {
    var s = new THREE.Shape();
    s.moveTo(0, 1.8); s.lineTo(-1.2, 0.2); s.lineTo(-0.5, 0.2); s.lineTo(-0.5, -1.8);
    s.lineTo(0.5, -1.8); s.lineTo(0.5, 0.2); s.lineTo(1.2, 0.2); s.closePath();
    return s;
  }
  M.makeArrow = function (flat) {
    var g = new THREE.Group();
    var geo = new THREE.ShapeGeometry(arrowShape());
    var m = basic('#38ff46', { side: THREE.DoubleSide, transparent: true, opacity: 0.98, depthWrite: false });
    var a = new THREE.Mesh(geo, m);
    if (flat) { a.rotation.x = -Math.PI / 2; a.position.y = 0.12; }
    else a.position.y = 2.2;
    g.add(a);
    g.userData.arrow = a;
    return g;
  };

  M.makeObjectiveMarker = function (color) {
    color = color || '#42f55a';
    var g = new THREE.Group();
    var beam = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 26, 16, 1, true),
      basic(color, { transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }));
    beam.position.y = 13; g.add(beam);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.28, 6, 24), basic(color, { transparent: true, opacity: 0.9 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.25; g.add(ring);
    var arrow = M.makeArrow(false); arrow.scale.setScalar(1.3); arrow.position.y = 6; g.add(arrow);
    g.userData.ring = ring; g.userData.arrow = arrow; g.userData.beam = beam;
    return g;
  };

  M.makeCheckpointFlag = function () {
    var g = new THREE.Group();
    [-3, 3].forEach(function (x) { cyl(0.12, 0.12, 6, 6, mat('#e8edf2'), x, 3, 0, g); });
    box(6.2, 1.2, 0.1, basic('#37e06a', { transparent: true, opacity: 0.65, side: THREE.DoubleSide }), 0, 5.4, 0, g);
    return g;
  };

  /* ============================== PARTÍCULAS ============================= */
  var FX = BTP.FX = {
    items: [], skids: [], scene: null, smokeTex: null, sparkTex: null, flameTex: null,
    init: function (scene) {
      FX.scene = scene;
      FX.smokeTex = M.canvasTexture(64, 64, function (g) {
        var grad = g.createRadialGradient(32, 32, 2, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255,255,255,0.85)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
      });
      FX.sparkTex = M.canvasTexture(32, 32, function (g) {
        var grad = g.createRadialGradient(16, 16, 1, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255,240,150,1)'); grad.addColorStop(1, 'rgba(255,140,0,0)');
        g.fillStyle = grad; g.fillRect(0, 0, 32, 32);
      });
      FX.flameTex = M.canvasTexture(64, 64, function (g) {
        var grad = g.createRadialGradient(32, 32, 2, 32, 32, 32);
        grad.addColorStop(0, 'rgba(180,240,255,1)'); grad.addColorStop(0.4, 'rgba(60,150,255,0.8)');
        grad.addColorStop(1, 'rgba(20,60,255,0)');
        g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
      });
    },
    sprite: function (tex, color, size) {
      var s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tex, color: color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
      }));
      s.scale.setScalar(size); return s;
    },
    puff: function (x, y, z, opts) {
      if (!FX.scene || FX.items.length > 240) return;
      opts = opts || {};
      var s = FX.sprite(opts.tex || FX.smokeTex, opts.color || '#c9c9c9', opts.size || 1.4);
      s.position.set(x, y, z);
      FX.scene.add(s);
      FX.items.push({ s: s, life: opts.life || 0.7, age: 0, vx: opts.vx || U.rand(-1, 1),
        vy: opts.vy || U.rand(0.8, 2), vz: opts.vz || U.rand(-1, 1), grow: opts.grow || 2.2, size: opts.size || 1.4 });
    },
    smoke: function (x, y, z, color) { FX.puff(x, y, z, { color: color || '#a8a8a8', size: 1.6, life: 0.9 }); },
    spark: function (x, y, z, n) {
      for (var i = 0; i < (n || 6); i++) FX.puff(x, y, z, {
        tex: FX.sparkTex, color: '#ffcc55', size: 0.7, life: 0.35,
        vx: U.rand(-6, 6), vy: U.rand(1, 5), vz: U.rand(-6, 6), grow: -0.4
      });
    },
    nitro: function (x, y, z) {
      FX.puff(x, y, z, { tex: FX.flameTex, color: '#7fdcff', size: 1.1, life: 0.3, grow: 1.2, vy: 0.4 });
    },
    explosion: function (x, y, z) {
      for (var i = 0; i < 18; i++) FX.puff(x, y, z, {
        tex: FX.sparkTex, color: i % 2 ? '#ff8a2b' : '#ffd95a', size: U.rand(1, 2.4), life: U.rand(0.4, 0.9),
        vx: U.rand(-8, 8), vy: U.rand(1, 7), vz: U.rand(-8, 8), grow: 3
      });
      for (var j = 0; j < 10; j++) FX.puff(x, y, z, { color: '#3b3b3b', size: 2, life: 1.4, grow: 5 });
    },
    skid: function (x, z, angle, color) {
      if (!FX.scene || FX.skids.length > 220) return;
      var m = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 1.5),
        new THREE.MeshBasicMaterial({ color: color || '#202022', transparent: true, opacity: 0.45, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.rotation.z = -angle;
      m.position.set(x, 0.035, z); FX.scene.add(m);
      FX.skids.push({ m: m, age: 0, life: 8 });
    },
    update: function (dt) {
      for (var i = FX.items.length - 1; i >= 0; i--) {
        var p = FX.items[i]; p.age += dt;
        if (p.age >= p.life) { FX.scene.remove(p.s); p.s.material.dispose(); FX.items.splice(i, 1); continue; }
        p.s.position.x += p.vx * dt; p.s.position.y += p.vy * dt; p.s.position.z += p.vz * dt;
        var k = p.age / p.life;
        p.s.material.opacity = 1 - k;
        var sc = Math.max(0.1, p.size + p.grow * k);
        p.s.scale.setScalar(sc);
      }
      for (var j = FX.skids.length - 1; j >= 0; j--) {
        var s = FX.skids[j]; s.age += dt;
        if (s.age >= s.life) { FX.scene.remove(s.m); s.m.geometry.dispose(); s.m.material.dispose(); FX.skids.splice(j, 1); continue; }
        s.m.material.opacity = 0.45 * (1 - s.age / s.life);
      }
    },
    clear: function () {
      if (!FX.scene) return;
      FX.items.forEach(function (p) { FX.scene.remove(p.s); p.s.material.dispose(); });
      FX.skids.forEach(function (s) { FX.scene.remove(s.m); s.m.geometry.dispose(); s.m.material.dispose(); });
      FX.items = []; FX.skids = [];
    }
  };
})();
