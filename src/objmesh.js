/* =========================================================================
 * CARGADOR DE MODELOS .OBJ ORIGINALES (local, sin red).
 *
 * src/original-assets.js es generado por tools/import-assets.js a partir de
 * blacktop-police-chase-assets/models/*.obj y textures/*.png. Si hay modelos
 * reales, BTP.ObjMesh.car() devuelve un envoltorio con la MISMA interfaz que
 * BTP.Models.makeCar() y el juego los usa en lugar de las cajas procedurales.
 * Si no hay modelos, devuelve null y todo sigue como antes.
 *
 * No hay fetch, imports ESM ni URLs externas: los datos van embebidos en un
 * script clásico, por eso funciona abriendo index.html con file://.
 * ========================================================================= */
(function () {
  'use strict';
  var BTP = window.BTP;
  var DATA = window.BTP_ORIGINAL_ASSETS || { models: {}, textures: {} };
  var MODELS = DATA.models || {}, TEXTURES = DATA.textures || {};
  var geoCache = {}, texCache = {};

  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }

  /* --- Parser OBJ mínimo: v, vt, vn y caras f (triángulos o polígonos) --- */
  function parse(text) {
    var positions = [], uvs = [], normals = [];
    var pos = [], uv = [], nor = [], indices = [];
    var lines = String(text).split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var t = lines[i].trim();
      if (!t || t.charAt(0) === '#') continue;
      var parts = t.split(/\s+/), tag = parts[0];
      if (tag === 'v') positions.push([+parts[1], +parts[2], +parts[3]]);
      else if (tag === 'vt') uvs.push([+parts[1], +parts[2]]);
      else if (tag === 'vn') normals.push([+parts[1], +parts[2], +parts[3]]);
      else if (tag === 'f') {
        var face = [];
        for (var k = 1; k < parts.length; k++) {
          var f = parts[k].split('/');
          face.push({ p: (+f[0] - 1), t: f[1] ? (+f[1] - 1) : -1, n: f[2] ? (+f[2] - 1) : -1 });
        }
        for (var q = 1; q < face.length - 1; q++) {
          [face[0], face[q], face[q + 1]].forEach(function (v) {
            var a = positions[v.p] || [0, 0, 0];
            pos.push(a[0], a[1], a[2]);
            var tx = uvs[v.t] || [0, 0];
            uv.push(tx[0], 1 - tx[1]);
            var nn = normals[v.n];
            if (nn) nor.push(nn[0], nn[1], nn[2]);
            indices.push(indices.length);
          });
        }
      }
    }
    if (!pos.length) return null;
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    if (nor.length === pos.length) geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    else geo.computeVertexNormals();
    geo.setIndex(indices);
    geo.computeBoundingBox();
    return geo;
  }

  function geometry(name) {
    if (geoCache[name]) return geoCache[name];
    if (!MODELS[name]) return null;
    var g = parse(MODELS[name]);
    if (!g) return null;
    geoCache[name] = g;
    return g;
  }

  function textureFor(name) {
    var key = norm(name), keys = Object.keys(TEXTURES);
    for (var i = 0; i < keys.length; i++) {
      var k = norm(keys[i]);
      if (k === key || k.indexOf(key) >= 0 || key.indexOf(k) >= 0) {
        if (!texCache[keys[i]]) {
          texCache[keys[i]] = new THREE.TextureLoader().load(TEXTURES[keys[i]]);
        }
        return texCache[keys[i]];
      }
    }
    return null;
  }

  function find(query) {
    if (!query) return null;
    var q = norm(query), keys = Object.keys(MODELS);
    var exact = null, partial = null;
    for (var i = 0; i < keys.length; i++) {
      var k = norm(keys[i]);
      if (k === q) { exact = keys[i]; break; }
      if (!partial && (k.indexOf(q) >= 0 || q.indexOf(k) >= 0)) partial = keys[i];
    }
    return exact || partial;
  }

  /* Normaliza el modelo al tamaño que espera la física (≈4.7 de largo),
     lo apoya sobre el suelo y lo centra en X/Z. */
  function fit(group, targetLength) {
    var box = new THREE.Box3().setFromObject(group);
    var size = new THREE.Vector3(); box.getSize(size);
    var center = new THREE.Vector3(); box.getCenter(center);
    var longest = Math.max(size.x, size.z) || 1;
    var s = (targetLength || 4.7) / longest;
    group.scale.setScalar(s);
    group.position.set(-center.x * s, -box.min.y * s, -center.z * s);
    return { width: size.x * s, length: size.z * s, scale: s };
  }

  var O = BTP.ObjMesh = {
    count: function () { return Object.keys(MODELS).length; },
    textureCount: function () { return Object.keys(TEXTURES).length; },
    names: function () { return Object.keys(MODELS); },
    find: find,
    geometry: geometry,

    /* Devuelve un envoltorio compatible con makeCar, o null si no hay .obj. */
    car: function (spec) {
      spec = spec || {};
      var name = find(spec.asset || spec.name);
      if (!name) return null;
      var geo = geometry(name);
      if (!geo) return null;
      var map = textureFor(spec.asset || spec.name);
      var material = new THREE.MeshLambertMaterial({
        color: map ? 0xffffff : (spec.color || '#f57c1f'),
        map: map || null, side: THREE.DoubleSide
      });
      var g = new THREE.Group();
      var holder = new THREE.Group();
      var mesh = new THREE.Mesh(geo, material);
      mesh.castShadow = true; mesh.receiveShadow = true;
      holder.add(mesh);
      var fitted = fit(holder, 4.7);
      g.add(holder);
      g.scale.setScalar(spec.scale || 1);
      var paintMaterial = new THREE.MeshLambertMaterial({ color: spec.color || '#f57c1f' });
      return {
        group: g, wheels: [], steer: [], paint: [], body: mesh,
        brakeLights: [], headlights: [], siren: [], driver: null,
        length: Math.abs(fitted.length) || 4.7,
        width: Math.abs(fitted.width) || 1.95,
        shape: spec.shape || 'muscle', baseScale: spec.scale || 1,
        originalAsset: name,
        paintMaterial: paintMaterial, accentMaterial: material,
        setColor: function (hex) { if (!map) material.color.set(hex); paintMaterial.color.set(hex); },
        setBrake: function () {},
        setSiren: function () {},
        spin: function () {}
      };
    }
  };

  BTP.OriginalAssets = {
    models: O.count(), textures: O.textureCount(),
    active: O.count() > 0,
    status: function () { return O.count() ? O.count() + ' modelos originales' : 'sin assets (procedural)'; }
  };
})();
