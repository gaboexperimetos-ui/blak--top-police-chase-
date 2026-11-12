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

  /* Tres estilos de fachada: rejilla, piedra con arcos y torre de cristal.
     El original mezcla los tres tipos en la misma calle. */
  M.facadeTexture = function (variant) {
    var key = 'facade' + variant;
    if (cache[key]) return cache[key];
    /* 5 estilos de fachada según el inventario del bundle original:
       0 rejilla de oficinas, 1 piedra con arcos, 2 torre de cristal,
       3 ladrillo Oldblock, 4 rascacielos con franjas verticales. */
    var style = variant % 5;
    var palettes = [
      ['#20304a', '#8fd8ff'], ['#2b2a33', '#ffd98c'], ['#26343a', '#b9f0e0'],
      ['#3a3040', '#ffb4c8'], ['#2d3b33', '#e8ffb0']
    ];
    var p = palettes[variant % palettes.length];
    var t = M.canvasTexture(128, 256, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      var rnd = U.mulberry32(100 + variant * 37);
      if (style === 2) {
        g.fillStyle = '#2a5f8c'; g.fillRect(0, 0, w, h);
        for (var y = 0; y < h; y += 16) {
          g.fillStyle = rnd() > .5 ? '#6fb6e8' : '#8fd0f2';
          g.fillRect(2, y + 2, w - 4, 10);
          g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(2, y + 2, w - 4, 2);
        }
      } else if (style === 1) {
        g.fillStyle = '#d8cdb6'; g.fillRect(0, 0, w, h);
        for (var r2 = 0; r2 < 6; r2++) for (var c2 = 0; c2 < 4; c2++) {
          var x = 8 + c2 * 31, yy = 12 + r2 * 40;
          g.fillStyle = rnd() > .55 ? '#3a4a5a' : '#243746';
          g.fillRect(x, yy, 18, 26);
          g.beginPath(); g.arc(x + 9, yy, 9, Math.PI, 0); g.fill();
          g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2;
          g.strokeRect(x, yy, 18, 26);
        }
      } else if (style === 3) {
        // Oldblock: ladrillo visto con ventanas pequeñas y dintel claro.
        g.fillStyle = '#a9684c'; g.fillRect(0, 0, w, h);
        for (var by = 0; by < h; by += 16) {
          g.fillStyle = (by / 16) % 2 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.09)';
          g.fillRect(0, by, w, 8);
          g.strokeStyle = 'rgba(90,45,30,.35)'; g.lineWidth = 1;
          g.beginPath(); g.moveTo(0, by + 8); g.lineTo(w, by + 8); g.stroke();
          for (var bx = (by / 16) % 2 ? 0 : 16; bx < w; bx += 32) {
            g.beginPath(); g.moveTo(bx, by); g.lineTo(bx, by + 8); g.stroke();
            g.beginPath(); g.moveTo(bx + 16, by + 8); g.lineTo(bx + 16, by + 16); g.stroke();
          }
        }
        for (var r3 = 0; r3 < 5; r3++) for (var c3 = 0; c3 < 4; c3++) {
          var wx = 9 + c3 * 31, wy = 14 + r3 * 48;
          g.fillStyle = rnd() > .5 ? '#31404a' : '#22333c'; g.fillRect(wx, wy, 19, 26);
          g.fillStyle = '#d9c9ac'; g.fillRect(wx - 2, wy + 26, 23, 3);
          g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(wx + 2, wy + 2, 4, 22);
        }
      } else if (style === 4) {
        // Skyscraper: franjas verticales de cristal con montantes.
        g.fillStyle = '#274a63'; g.fillRect(0, 0, w, h);
        for (var fx = 0; fx < w; fx += 20) {
          g.fillStyle = rnd() > .5 ? '#69a9cf' : '#4d8bb4';
          g.fillRect(fx + 3, 0, 14, h);
          g.fillStyle = 'rgba(255,255,255,.30)'; g.fillRect(fx + 3, 0, 2, h);
          g.fillStyle = 'rgba(10,30,45,.45)'; g.fillRect(fx + 16, 0, 4, h);
        }
        for (var fy = 0; fy < h; fy += 22) {
          g.fillStyle = 'rgba(230,240,250,.35)'; g.fillRect(0, fy, w, 2);
        }
      } else {
        var cols = 4, rows = 8, pad = 10;
        var cw = (w - pad * (cols + 1)) / cols, ch = (h - pad * (rows + 1)) / rows;
        for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
          var lit = rnd() > 0.55;
          g.fillStyle = lit ? p[1] : p[0];
          g.globalAlpha = lit ? 0.85 : 0.95;
          g.fillRect(pad + c * (cw + pad), pad + r * (ch + pad), cw, ch);
          g.globalAlpha = 1;
          g.fillStyle = 'rgba(255,255,255,0.14)';
          g.fillRect(pad + c * (cw + pad), pad + r * (ch + pad), cw, 2);
        }
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

  M.shadowTexture = function () {
    if (cache.shadow) return cache.shadow;
    cache.shadow = M.canvasTexture(128, 128, function (g, w, h) {
      var grad = g.createRadialGradient(64, 64, 8, 64, 64, 62);
      grad.addColorStop(0, 'rgba(0,0,0,0.55)');
      grad.addColorStop(0.55, 'rgba(0,0,0,0.28)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad; g.fillRect(0, 0, w, h);
    });
    return cache.shadow;
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
    van:    [[-2.6, .42], [-2.6, 1.95], [1.85, 1.95], [2.45, 1.52], [2.6, 1.05], [2.6, .42]],
    pickup: [[-2.6, .42], [-2.6, 1.08], [.15, 1.08], [.15, 1.78], [1.35, 1.78],
             [1.75, 1.05], [2.6, 1.0], [2.6, .42]],
    truck:  [[-2.9, .48], [-2.9, 2.15], [-1.05, 2.15], [-.55, 1.38], [1.0, 1.38],
             [1.35, 1.05], [2.9, 1.02], [2.9, .48]],
    bus:    [[-4.2, .42], [-4.2, 2.35], [3.9, 2.35], [4.2, 1.95], [4.2, .42]]
  };
  var WIDTHS = { muscle: 1.95, sedan: 1.9, hatch: 1.85, sport: 2.0, super: 2.05, hyper: 2.05,
    police: 1.95, van: 2.1, pickup: 2.1, truck: 2.6, bus: 2.35 };
  var WB = { muscle: 1.45, sedan: 1.42, hatch: 1.25, sport: 1.5, super: 1.55, hyper: 1.55,
    police: 1.45, van: 1.62, pickup: 1.7, truck: 1.9, bus: 2.9 };
  var WHEEL_R = { muscle: .56, sedan: .55, hatch: .54, sport: .55, super: .56, hyper: .56,
    police: .56, van: .60, pickup: .62, truck: .68, bus: .68 };
  // Dónde va la cabina de cada silueta (Z negativo = morro).
  var CAB = {
    muscle: { wf: -.82, wr: 1.02, gy: 1.30, gh: .70, lampY: .82, sideLen: 1.85 },
    sedan:  { wf: -.78, wr: 1.05, gy: 1.30, gh: .70, lampY: .84, sideLen: 1.95 },
    hatch:  { wf: -.95, wr: .92,  gy: 1.27, gh: .66, lampY: .84, sideLen: 1.80 },
    sport:  { wf: -.62, wr: .72,  gy: 1.10, gh: .52, lampY: .66, sideLen: 1.35 },
    super:  { wf: -.55, wr: .65,  gy: 1.05, gh: .50, lampY: .62, sideLen: 1.30 },
    hyper:  { wf: -.52, wr: .62,  gy: 1.03, gh: .50, lampY: .60, sideLen: 1.25 },
    police: { wf: -.82, wr: 1.02, gy: 1.30, gh: .70, lampY: .84, sideLen: 1.85 },
    van:    { wf: -2.02, wr: -.85, gy: 1.50, gh: .82, lampY: .88, sideLen: 1.20 },
    pickup: { wf: -1.30, wr: -.18, gy: 1.42, gh: .72, lampY: .86, sideLen: 1.15 },
    truck:  { wf: -2.45, wr: .40, gy: 1.30, gh: .74, lampY: .92, sideLen: 2.35 },
    bus:    { wf: -3.75, wr: 3.75, gy: 1.55, gh: 1.05, lampY: .90, sideLen: 6.6 }
  };

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
  /* Materiales compartidos (los que nunca se modifican por coche). */
  var MATS = {};
  function shared(key, color, opts) {
    if (!MATS[key]) MATS[key] = mat(color, opts);
    return MATS[key];
  }
  function profileBounds(shape) {
    var pts = PROFILES[shape], uMin = 1e9, uMax = -1e9, vMax = 0;
    pts.forEach(function (q) {
      if (q[0] < uMin) uMin = q[0];
      if (q[0] > uMax) uMax = q[0];
      if (q[1] > vMax) vMax = q[1];
    });
    return { nose: -uMax, tail: -uMin, roof: vMax };
  }

  /**
   * spec: {shape, color, police, traffic, taxi, number, scale}
   * Cada silueta tiene su propia cabina, luces, guardabarros y detalles:
   * muscle, sedán, compacto, deportivo, super, hyper, patrulla, furgoneta,
   * pickup, camión blindado y autobús (tráfico).
   */
  M.makeCar = function (spec) {
    spec = spec || {};
    /* Si hay un .obj original importado, se usa TAL CUAL y no se dibuja
       ninguna caja procedural. Sin assets reales esto devuelve null. */
    if (BTP.ObjMesh) {
      var original = BTP.ObjMesh.car(spec);
      if (original) return original;
    }
    var shape = PROFILES[spec.shape] ? spec.shape : 'muscle';
    var police = !!spec.police, traffic = !!spec.traffic, taxi = !!spec.taxi;
    var scale = spec.scale || 1;
    var color = spec.color || (police ? '#22262e' : taxi ? '#f5c518' : '#f57c1f');
    var detail = !traffic;
    var b = profileBounds(shape);
    var w = WIDTHS[shape] || 1.95, wb = WB[shape] || 1.45;
    var wr = WHEEL_R[shape] || .56, wy = wr;
    var cab = CAB[shape] || CAB.muscle;
    var nose = b.nose, tail = b.tail, roofY = b.roof, len = tail - nose;
    var accentColor = U.hexToRgb(color) ? shade(color, .76) : '#d06010';

    var g = new THREE.Group();
    g.scale.setScalar(scale);
    var paintMat = mat(color);
    var accentMat = mat(police ? '#f2a71b' : accentColor);
    var paint = [];
    var dark = shared('dark', '#1b1e24');
    var black = shared('black', '#101216');
    var glass = shared('glass', '#22303f', { transparent: true, opacity: .92 });
    var chrome = shared('chrome', '#c9ced6');
    var rubber = shared('rubber', '#17191c');

    /* Carrocería extrusionada con la silueta propia del modelo. */
    var body = new THREE.Mesh(bodyGeometry(shape), paintMat);
    body.castShadow = true; body.receiveShadow = true;
    g.add(body); paint.push(body);

    /* Bajos, faldones laterales y parachoques. */
    box(w + .06, .16, len - .3, black, 0, .40, (nose + tail) / 2, g);
    [-1, 1].forEach(function (s) {
      box(.12, .20, len * .78, dark, s * (w / 2 + .01), .46, 0, g);
    });
    box(w * .98, .24, .26, chrome, 0, .54, nose - .08, g);
    box(w * .98, .24, .26, chrome, 0, .54, tail + .08, g);
    if (detail) {
      box(w * .80, .14, .14, dark, 0, .74, nose - .11, g);   // parrilla
      box(w * 1.02, .14, .16, dark, 0, .42, nose - .20, g);  // defensa baja
      box(w * 1.08, .17, .18, dark, 0, .60, nose - .24, g);  // bull bar
      box(.12, .52, .12, dark, 0, .62, nose - .28, g);
    }

    /* Cristales: parabrisas, luneta y ventanillas (posición por silueta). */
    var windshield = box(w * .80, cab.gh, .09, glass, 0, cab.gy, cab.wf, g);
    windshield.rotation.x = -.5;
    var rearGlass = box(w * .80, cab.gh * .86, .09, glass, 0, cab.gy, cab.wr, g);
    rearGlass.rotation.x = .5;
    var sideCount = shape === 'bus' ? 7 : 1;
    for (var si = 0; si < sideCount; si++) {
      var zz = shape === 'bus' ? (-3.05 + si * 1.02) : (cab.wf + cab.wr) / 2;
      var sl = shape === 'bus' ? .80 : cab.sideLen;
      [-1, 1].forEach(function (s) {
        box(.07, cab.gh * .76, sl, glass, s * (w / 2 + .012), cab.gy + .01, zz, g);
        if (detail) box(.09, .06, sl + .08, dark, s * (w / 2 + .02), cab.gy - cab.gh * .41, zz, g);
      });
    }
    /* Techo en contraste para dar volumen a la cabina. */
    if (shape !== 'truck' && shape !== 'van' && shape !== 'bus') {
      var roof = box(w * .72, .05, Math.max(.5, cab.wr - cab.wf), accentMat,
        0, roofY + .015, (cab.wf + cab.wr) / 2, g);
      paint.push(roof);
    }

    /* Faros y pilotos (materiales propios: cambian al frenar). */
    var headlights = [], brakeLights = [];
    [-1, 1].forEach(function (s) {
      headlights.push(box(.42, .17, .11, basic('#ffe14d'), s * w * .32, cab.lampY, nose - .10, g));
      brakeLights.push(box(.42, .15, .11, basic('#7a1414'), s * w * .32, cab.lampY + .06, tail + .10, g));
      brakeLights.push(box(.28, .09, .07, basic('#ff2b1d'), s * w * .32, cab.lampY - .10, tail + .14, g));
    });

    /* Guardabarros, ruedas con buje y eje direccional delantero. */
    var wheels = [], steer = [];
    [-1, 1].forEach(function (front) {
      [-1, 1].forEach(function (side) {
        box(.10, wr * 1.8, wr * 2.1, black, side * (w / 2 + .012), wy, front * wb, g);
        var arch = new THREE.Mesh(new THREE.TorusGeometry(wr * 1.10, .10, 5, 12, Math.PI), dark);
        arch.rotation.y = Math.PI / 2;
        arch.position.set(side * (w / 2 + .02), wy, front * wb);
        g.add(arch);
        var pivot = new THREE.Group();
        pivot.position.set(side * (w / 2 + .06), wy, front * wb);
        g.add(pivot);
        var spin = new THREE.Group(); pivot.add(spin);
        var tire = cyl(wr, wr, .32, 12, rubber, 0, 0, 0, spin); tire.rotation.z = Math.PI / 2;
        var hub = cyl(wr * .54, wr * .54, .34, 12, chrome, 0, 0, 0, spin); hub.rotation.z = Math.PI / 2;
        var cap = cyl(wr * .24, wr * .24, .36, 8, dark, 0, 0, 0, spin); cap.rotation.z = Math.PI / 2;
        wheels.push(spin);
        if (front === -1) steer.push(pivot);
      });
    });

    /* ---------------- Detalles exclusivos de cada vehículo ---------------- */
    if (shape === 'muscle') {
      box(w * .44, .05, 1.05, shared('goldHood', '#ffb52e'), 0, 1.10, -1.72, g); // capó dorado
      box(.72, .18, .62, dark, 0, 1.16, -1.72, g);                 // toma de aire
      [-.32, .32].forEach(function (x) { box(.18, .03, 1.25, basic('#ffffff'), x, 1.04, -1.68, g); });
      box(w * .78, .08, .30, dark, 0, 1.08, tail - .22, g);        // alerón trasero
      if (detail) [-1, 1].forEach(function (s) {
        cyl(.09, .09, .22, 8, chrome, s * w * .34, .48, tail + .02, g).rotation.x = Math.PI / 2;
      });
    }
    if (shape === 'sport' || shape === 'super' || shape === 'hyper') {
      box(w * .92, .09, .40, dark, 0, 1.12, tail - .18, g);        // alerón
      [-1, 1].forEach(function (s) {
        box(.10, .34, .10, dark, s * w * .36, .94, tail - .18, g);
        box(.12, .18, 1.30, dark, s * (w / 2 + .02), .40, 0, g);   // faldón
        box(.26, .12, .5, dark, s * w * .40, .72, -1.6, g);         // toma lateral
      });
      box(w * 1.02, .08, .30, black, 0, .38, nose - .05, g);        // splitter
    }
    if (shape === 'van') {
      [-1, 1].forEach(function (s) {
        box(.08, .10, len * .72, chrome, s * w * .32, roofY + .08, 0, g);  // baca
        box(.06, 1.15, .05, dark, s * (w / 2 + .02), 1.20, -.35, g);      // puerta corredera
      });
      box(w * .88, .05, .06, dark, 0, 1.28, tail + .02, g);                // portones
      box(.05, 1.6, .06, dark, 0, 1.25, tail + .02, g);
    }
    if (shape === 'pickup') {
      var bedZ = (tail + cab.wr) / 2, bedLen = tail - cab.wr;
      [-1, 1].forEach(function (s) {
        box(.10, .46, bedLen, paintMat, s * (w / 2 - .04), 1.30, bedZ, g);
      });
      box(w * .94, .46, .10, paintMat, 0, 1.30, tail - .05, g);            // portón
      box(w * .92, .05, bedLen, dark, 0, 1.10, bedZ, g);                    // batea
      box(w * .86, .10, .10, chrome, 0, 1.88, cab.wr - .05, g);             // barra
    }
    if (shape === 'truck') {
      for (var r = 0; r < 5; r++) {
        var rz = -2.35 + r * .58;
        [-1, 1].forEach(function (s) { box(.08, 1.45, .10, chrome, s * (w / 2 + .01), 1.52, rz, g); });
      }
      box(w * 1.06, .30, .18, chrome, 0, .74, nose - .18, g);              // defensa
      box(w * .98, .10, .30, dark, 0, roofY + .05, -2.1, g);
    }
    if (shape === 'bus') {
      box(w * .96, .20, len - .5, accentMat, 0, .96, 0, g);                 // franja
      box(w * .55, .30, .09, black, 0, roofY - .30, nose - .06, g);         // letrero
      [-1, 1].forEach(function (s) { box(.08, 1.8, .08, chrome, s * (w / 2 + .01), 1.55, tail - .25, g); });
    }
    if (taxi) {
      box(.95, .22, .42, shared('taxiSign', '#ffe14d'), 0, roofY + .15, (cab.wf + cab.wr) / 2, g);
      [-1, 1].forEach(function (s) {
        for (var q = 0; q < 6; q++) box(.08, .12, .26, black, s * (w / 2 + .02), .95, (q - 2.5) * .62, g);
      });
    }
    if (police) {
      // Portada oficial: carrocería negra, capó y techo naranja, escudo
      // circular blanco en la puerta y parachoques claro.
      var white = shared('policeWhite', '#f4f5f7');
      var orange = shared('policeOrange', '#f5931f');
      box(w * .86, .06, 1.6, orange, 0, 1.04, -1.62, g);
      box(w * .76, .06, 2.0, orange, 0, roofY + .05, .02, g);
      [-1, 1].forEach(function (s) {
        box(.06, .10, 1.6, white, s * (w / 2 + .008), .96, .05, g);
        var badge = new THREE.Mesh(new THREE.CircleGeometry(.34, 12), basic('#e9eef5'));
        badge.position.set(s * (w / 2 + .045), 1.12, .05);
        badge.rotation.y = s * Math.PI / 2; g.add(badge);
        var dot = new THREE.Mesh(new THREE.CircleGeometry(.16, 10), basic('#2f6fd0'));
        dot.position.set(s * (w / 2 + .05), 1.12, .05);
        dot.rotation.y = s * Math.PI / 2; g.add(dot);
      });
      box(w * 1.04, .24, .18, white, 0, .64, nose - .16, g);               // parachoques claro
      [-1, 1].forEach(function (s) { box(.12, .38, .12, dark, s * w * .40, .84, nose - .12, g); });
      box(.16, .16, 1.0, dark, 0, roofY + .06, .02, g);
      var red = box(.22, .18, .44, basic('#ff2020'), -.32, roofY + .16, .02, g);
      var blue = box(.22, .18, .44, basic('#2050ff'), .32, roofY + .16, .02, g);
      var siren = [red, blue];
    } else { var siren = []; }

    /* Número de competición (solo coches del jugador). */
    if (spec.number !== undefined && !traffic) {
      [-1, 1].forEach(function (s) {
        var n = new THREE.Mesh(new THREE.PlaneGeometry(.72, .72),
          basic('#ffffff', { map: M.numberTexture(spec.number), transparent: true, alphaTest: .2, side: THREE.DoubleSide }));
        n.position.set(s * (w / 2 + .025), 1.02, -.15);
        n.rotation.y = s * Math.PI / 2; g.add(n);
      });
      var rn = new THREE.Mesh(new THREE.PlaneGeometry(.70, .70),
        basic('#ffffff', { map: M.numberTexture(spec.number), transparent: true, alphaTest: .2, side: THREE.DoubleSide }));
      rn.position.set(0, .84, tail + .12); g.add(rn);
    }

    /* Sombra suave de contacto: el coche deja de flotar sobre el asfalto. */
    var shadow = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.75, len * 1.18),
      basic('#000000', { map: M.shadowTexture(), transparent: true, opacity: .62, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = .028;
    g.add(shadow);

    /* Trasera: marcos de pilotos, matrícula y pilares C (rompe el rectángulo). */
    if (shape !== 'bus' && shape !== 'truck' && shape !== 'van' && shape !== 'pickup') {
      [-1, 1].forEach(function (s) {
        box(.50, .26, .10, dark, s * w * .32, cab.lampY + .06, tail + .05, g);
        var cp = box(w * .13, cab.gh * .86, .12, paintMat, s * w * .355, cab.gy, cab.wr + .05, g);
        cp.rotation.z = s * .16;
      });
      box(.56, .17, .05, shared('plate', '#e9eef5'), 0, .70, tail + .16, g);
      box(w * .88, .05, .42, accentMat, 0, 1.03, tail - .34, g);  // tapa del maletero
    }

    /* Retrovisores y tiradores (solo coches principales, para no saturar). */
    if (detail && shape !== 'bus' && shape !== 'truck') {
      [-1, 1].forEach(function (s) {
        box(.18, .12, .26, dark, s * (w / 2 + .16), cab.gy + .04, cab.wf + .18, g);
        box(.06, .05, .28, chrome, s * (w / 2 + .02), 1.00, .48, g);
      });
    }

    /* Conductor en los coches del jugador. */
    var driver = null;
    if (!traffic && !police && shape !== 'truck' && shape !== 'bus') {
      driver = new THREE.Group();
      cyl(.26, .30, .50, 8, mat('#2a3548'), 0, .25, 0, driver);
      var head = new THREE.Mesh(new THREE.SphereGeometry(.19, 8, 6), mat('#e8bd94'));
      head.position.y = .60; driver.add(head);
      driver.position.set(0, .82, .15);
      g.add(driver);
    }

    return {
      group: g, wheels: wheels, steer: steer, paint: paint, body: body,
      brakeLights: brakeLights, headlights: headlights, siren: siren, driver: driver,
      length: len, width: w, shape: shape, baseScale: scale,
      paintMaterial: paintMat, accentMaterial: accentMat,
      setColor: function (hex) {
        paintMat.color.set(hex);
        accentMat.color.set(U.hexToRgb(hex) ? shade(hex, .76) : '#d06010');
      },
      setBrake: function (on) {
        brakeLights.forEach(function (m, i) {
          m.material.color.set(on ? (i % 2 ? '#ff5a3c' : '#ff2b1d') : (i % 2 ? '#a01c14' : '#7a1414'));
        });
      },
      setSiren: function (time) {
        if (!siren.length) return;
        var a = Math.floor(time * 6) % 2;
        siren[0].material.color.set(a ? '#ff2020' : '#551010');
        siren[1].material.color.set(a ? '#101050' : '#2050ff');
      },
      spin: function (v, dt, steerAngle) {
        wheels.forEach(function (wg) { wg.rotation.x -= v * dt / .56; });
        steer.forEach(function (p) { p.rotation.y = steerAngle || 0; });
      }
    };
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

  /* Monorraíl del bundle: Monorail Front / Middle / Rear / Straight Support.
     Tres coches con morro, ventanas corridas, puertas, franja y bogies. */
  M.makeMonorailTrain = function () {
    var g = new THREE.Group();
    var shell = mat('#eef2f5'), glass = mat('#2a6fa8'), trim = mat('#ffce2b');
    for (var i = 0; i < 3; i++) {
      var z = i * 8.4, grp = new THREE.Group(); grp.position.z = z; g.add(grp);
      box(3.2, 2.5, 8, shell, 0, 0, 0, grp);
      box(3.3, 0.28, 8.1, trim, 0, -0.85, 0, grp);
      box(3.24, 0.26, 8.05, mat('#d8dee3'), 0, 1.28, 0, grp);
      // Ventanas corridas en ambos lados
      [-1, 1].forEach(function (sd) {
        box(0.06, 0.95, 6.2, glass, sd * 1.63, 0.28, 0, grp);
        for (var w = -2; w <= 2; w++) {
          box(0.08, 0.99, 0.09, mat('#cfd8de'), sd * 1.67, 0.28, w * 1.25, grp);
        }
        box(0.10, 2.0, 0.75, mat('#c3ccd3'), sd * 1.65, -0.05, 3.1, grp); // puerta
      });
      // Bogies bajo el coche
      [-2.5, 2.5].forEach(function (bz) {
        box(1.5, 0.55, 1.1, mat('#4a545d'), 0, -1.55, bz, grp);
        [-1, 1].forEach(function (sd) {
          var wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.22, 10), mat('#252c33'));
          wheel.rotation.z = Math.PI / 2; wheel.position.set(sd * 0.85, -1.55, bz); grp.add(wheel);
        });
      });
      if (i === 0) {
        // Morro Front: cuña redondeada y faros
        var nose = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.5, 12, 1, false, 0, Math.PI), shell);
        nose.rotation.x = Math.PI / 2; nose.rotation.z = Math.PI / 2;
        nose.position.set(0, 0, -4.65); grp.add(nose);
        box(2.6, 0.8, 0.08, glass, 0, 0.45, -4.72, grp);
        [-1, 1].forEach(function (sd) {
          box(0.34, 0.22, 0.1, basic('#ffe9a8'), sd * 0.95, -0.55, -4.76, grp);
        });
      }
      if (i === 2) {
        box(2.9, 2.2, 0.28, mat('#d7dde2'), 0, 0, 4.08, grp); // Rear
        [-1, 1].forEach(function (sd) {
          box(0.3, 0.24, 0.1, basic('#e0483c'), sd * 1.0, -0.45, 4.24, grp);
        });
      }
    }
    return g;
  };

  /* Building Monorail Station: plataforma elevada sobre pilares. */
  M.makeMonorailStation = function () {
    var g = new THREE.Group();
    var deck = box(13, 0.8, 20, mat('#cfd4d9'), 0, 16.0, 0, g);
    deck.receiveShadow = true;
    box(14, 0.35, 21, mat('#8b959e'), 0, 16.55, 0, g);
    // Tejado y marquesina
    box(13, 0.35, 20, mat('#f0f2f4'), 0, 22.6, 0, g);
    [-1, 1].forEach(function (sd) {
      [-7, 0, 7].forEach(function (pz) {
        cyl(0.32, 0.32, 6.4, 8, mat('#9aa3ab'), sd * 6.1, 19.4, pz, g);
      });
      box(0.16, 1.1, 19, basic('#2f6fb0', { side: THREE.DoubleSide }), sd * 6.5, 17.4, 0, g);
    });
    [-1, 1].forEach(function (sd) {
      for (var px = -5; px <= 5; px += 5) {
        cyl(0.55, 0.65, 15.5, 8, mat('#8e959d'), px, 7.75, sd * 8.5, g);
      }
    });
    box(9, 1.1, 0.12, basic('#ffffff', { map: M.signTexture('MONORAIL', '#1d4f8b', '#ffffff'), side: THREE.DoubleSide }), 0, 21.4, 10.1, g);
    return g;
  };

  /* Fountain: pilas circulares, pedestal y surtidor de agua. */
  M.makeFountain = function () {
    var g = new THREE.Group();
    var stone = mat('#d8cfba');
    var basin = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 5.8, 1.0, 20), stone);
    basin.position.y = 0.5; basin.receiveShadow = true; g.add(basin);
    var water = new THREE.Mesh(new THREE.CylinderGeometry(4.9, 4.9, 0.12, 20),
      basic('#5fc4ef', { transparent: true, opacity: 0.82, side: THREE.DoubleSide }));
    water.position.y = 1.02; g.add(water);
    var inner = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.9, 1.6, 12), stone);
    inner.position.y = 1.7; g.add(inner);
    var jet = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.55, 3.6, 10),
      basic('#a8e4ff', { transparent: true, opacity: 0.55, depthWrite: false }));
    jet.position.y = 3.6; g.add(jet);
    var crown = new THREE.Mesh(new THREE.SphereGeometry(0.65, 10, 8),
      basic('#d8f4ff', { transparent: true, opacity: 0.7 }));
    crown.position.y = 5.4; g.add(crown);
    for (var k = 0; k < 8; k++) {
      var a = k / 8 * Math.PI * 2;
      var drop = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 5), basic('#bfeaff'));
      drop.position.set(Math.cos(a) * 3.1, 2.4, Math.sin(a) * 3.1); g.add(drop);
    }
    g.userData.jet = jet;
    return g;
  };

  /* Ramp / Double Ramp: plano inclinado con bordes laterales. */
  M.makeRamp = function (doubleRamp) {
    var g = new THREE.Group();
    var dark = mat('#4a5058'), edge = mat('#e6c34a');
    var width = doubleRamp ? 11 : 5.5, len = 12, h = 3.2;
    var slope = new THREE.Mesh(new THREE.BoxGeometry(width, 0.5, len), dark);
    slope.rotation.x = -Math.atan2(h, len); slope.position.y = h / 2 + 0.3; g.add(slope);
    [-1, 1].forEach(function (sd) {
      var rail = box(0.3, 0.7, len, edge, sd * (width / 2 + 0.15), h / 2 + 0.6, 0, g);
      rail.rotation.x = -Math.atan2(h, len);
    });
    box(width, h, 0.6, mat('#5a626b'), 0, h / 2, len / 2, g);
    return g;
  };

  /* Statue Pedestal Generic para los parques. */
  M.makeStatue = function () {
    var g = new THREE.Group();
    box(3, 0.55, 3, mat('#c9c2ae'), 0, 0.28, 0, g);
    box(2.2, 2.6, 2.2, mat('#d8d0bb'), 0, 1.85, 0, g);
    var fig = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.2, 6), mat('#8d9284'));
    fig.position.y = 4.25; g.add(fig);
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), mat('#8d9284'));
    head.position.y = 5.6; g.add(head);
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
    var m = basic('#4bff50', { side: THREE.DoubleSide, transparent: true, opacity: 0.98, depthWrite: false });
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
      basic(color, { transparent: true, opacity: 0.24, side: THREE.DoubleSide, depthWrite: false }));
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
