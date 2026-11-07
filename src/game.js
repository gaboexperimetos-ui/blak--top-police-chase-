/* =========================================================================
 * MOTOR DEL JUEGO: arranque, bucle, estados, cámaras (incluida pantalla
 * dividida para 2 jugadores), entrada de teclado/táctil y render.
 * Cero peticiones de red: todos los recursos son locales.
 * ========================================================================= */
(function () {
  'use strict';
  var BTP = window.BTP, U = BTP.U, C = BTP.C, G = BTP.Garage, M = BTP.Models, P = BTP.Physics;
  var $ = function (id) { return document.getElementById(id); };

  var Game = BTP.Game = {
    state: 'boot', mode: 'mission', split: false,
    keys: {}, players: [], cameras: [], camState: [],
    fps: 60, _last: 0, _frame: 0, menuAngle: 0, busy: false,

    /* ============================== ARRANQUE =========================== */
    boot: function () {
      if (this.state !== 'boot') return;
      var canvas = $('game');
      if (!window.THREE) throw new Error('No se pudo cargar vendor/three.min.js');
      var renderer = this.renderer = new THREE.WebGLRenderer({
        canvas: canvas, antialias: true, powerPreference: 'high-performance', alpha: false
      });
      renderer.setClearColor(0x8ec8ea, 1);
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

      var scene = this.scene = new THREE.Scene();
      scene.background = new THREE.Color('#8ec8ea');
      scene.fog = new THREE.Fog('#8ec8ea', 210, 690);

      var hemi = new THREE.HemisphereLight(0xd9ecff, 0x60745c, 0.95); scene.add(hemi);
      var sun = this.sun = new THREE.DirectionalLight(0xfff3dd, 1.05);
      sun.position.set(160, 260, 110);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -260; sun.shadow.camera.right = 260;
      sun.shadow.camera.top = 260; sun.shadow.camera.bottom = -260;
      sun.shadow.camera.near = 1; sun.shadow.camera.far = 700;
      sun.shadow.bias = -0.0007;
      scene.add(sun); scene.add(sun.target);
      // Cielo: cúpula degradada low-poly
      var sky = new THREE.Mesh(new THREE.SphereGeometry(900, 16, 10),
        new THREE.MeshBasicMaterial({ color: '#8ec8ea', side: THREE.BackSide, fog: false }));
      scene.add(sky);
      this.sky = sky;

      var aspect = window.innerWidth / Math.max(1, window.innerHeight);
      this.camera = new THREE.PerspectiveCamera(64, aspect, 0.5, 1400);
      this.camera.position.set(0, 40, 60);
      this.camera2 = new THREE.PerspectiveCamera(64, aspect, 0.5, 1400);
      this.cameras = [this.camera, this.camera2];
      this.camState = [{}, {}];

      this.city = BTP.City.build(scene);
      BTP.FX.init(scene);
      this.traffic = new BTP.Traffic(this.city, 26);
      this.police = new BTP.Police(this.city);

      this.missions = BTP.Missions;
      this.missions.init(this);
      this.bindEvents();
      BTP.UI.init(this);
      this.applySettings();
      this.resize();
      this.state = 'menu';
      BTP.UI.showScreen('menu');
      this._last = performance.now();
      requestAnimationFrame(function (t) { Game.loop(t); });
    },

    /* ============================== EVENTOS ============================ */
    bindEvents: function () {
      var self = this;
      window.addEventListener('resize', function () { self.resize(); });
      window.addEventListener('keydown', function (e) { self.onKeyDown(e); });
      window.addEventListener('keyup', function (e) { self.onKeyUp(e); });
      window.addEventListener('blur', function () { self.keys = {}; });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden && self.state === 'playing') self.pause();
        BTP.Audio[document.hidden ? 'suspend' : 'resume']();
      });
      window.addEventListener('beforeunload', function () { BTP.Save.flush(); });

      BTP.Bus.on('crash', function (e) {
        if (e.impact > 9) BTP.UI.damageFlash();
      });
      BTP.Bus.on('carCrash', function (e) {
        if (e.impact > 11) BTP.UI.damageFlash();
      });
      BTP.Bus.on('carDestroyed', function (e) {
        if (self.state === 'playing' && self.players.indexOf(e.car) >= 0) self.endRun('destroyed');
      });
      BTP.Bus.on('arrested', function () {
        if (self.state === 'playing') self.endRun('arrested');
      });
      BTP.Bus.on('takedown', function () {
        BTP.UI.toast('PATRULLA FUERA DE COMBATE +600', 'good');
      });
      BTP.Bus.on('gameOver', function (d) { self.showResults(d); });
      BTP.Bus.on('objectiveChanged', function () { /* la flecha verde se actualiza sola */ });
    },

    onKeyDown: function (e) {
      var k = e.code || e.key;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab', 'ShiftRight'].indexOf(k) >= 0) e.preventDefault();
      if (BTP.UI.current !== 'none') { if (BTP.UI.handleKey(e)) e.preventDefault(); return; }
      if (e.repeat) { this.keys[k] = true; return; }
      this.keys[k] = true;
      BTP.Audio.init();
      if (k === 'Escape' || k === 'KeyP') { if (this.state === 'playing') this.pause(); else if (this.state === 'paused') this.resume(); return; }
      if (this.state !== 'playing') return;
      if (k === 'KeyC') {
        var order = ['far', 'near', 'hood'], cur = BTP.Save.data.settings.cam;
        BTP.Save.data.settings.cam = order[(order.indexOf(cur) + 1) % 3]; BTP.Save.flush();
        var camKeys = { near: 'settings.camNear', far: 'settings.camFar', hood: 'settings.camHood' };
        BTP.UI.toast(BTP.t('settings.cam') + ': ' + BTP.t(camKeys[BTP.Save.data.settings.cam]), 'info');
        BTP.Audio.sfx('ui');
      }
      if (k === 'KeyM') {
        BTP.Save.data.settings.mapZoom = BTP.Save.data.settings.mapZoom > 1 ? 1 : 2;
        BTP.Save.flush(); BTP.Audio.sfx('ui');
      }
      if (k === 'KeyH') BTP.Audio.sfx('horn');
      if (k === 'ShiftRight' || k === 'KeyR') {
        this.players.forEach(function (p) { p.reset(p.x, p.z); });
        BTP.UI.toast(BTP.t('toast.repair'), 'info');
      }
    },
    onKeyUp: function (e) { this.keys[e.code || e.key] = false; },

    /* ============================== AJUSTES ============================ */
    applySettings: function () {
      var s = BTP.Save.data.settings;
      if (!this.renderer) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.renderer.setPixelRatio(s.quality === 'low' ? Math.min(1, dpr) : dpr);
      this.renderer.shadowMap.enabled = !!s.shadows && s.quality !== 'low';
      this.sun.castShadow = this.renderer.shadowMap.enabled;
      this.scene.fog.near = s.quality === 'low' ? 130 : 210;
      this.scene.fog.far = s.quality === 'low' ? 400 : 690;
      var fov = s.cam === 'hood' ? 76 : (s.cam === 'near' ? 68 : 64);
      this.camera.fov = fov; this.camera2.fov = fov;
      this.camera.updateProjectionMatrix(); this.camera2.updateProjectionMatrix();
      BTP.Audio.applySettings();
      BTP.UI.setClassic(!!s.classic);
      this.resize();
    },
    resize: function () {
      if (!this.renderer) return;
      var w = window.innerWidth, h = Math.max(1, window.innerHeight);
      this.size = { w: w, h: h };
      this.renderer.setSize(w, h, false);
      var horizontal = w >= h;
      var a = this.split ? (horizontal ? (w / 2) / h : w / (h / 2)) : w / h;
      this.camera.aspect = a; this.camera2.aspect = a;
      this.camera.updateProjectionMatrix(); this.camera2.updateProjectionMatrix();
    },

    /* ============================== PARTIDA ============================ */
    carSpec: function (second) {
      var c = G.selected();
      return {
        id: second ? c.id + '_p2' : c.id, shape: c.shape,
        color: second ? '#27d6ff' : G.getColor(c.id),
        number: second ? '02' : c.number,
        stats: G.stats(c.id)
      };
    },
    makePlayers: function (split) {
      var self = this;
      this.players.forEach(function (p) { if (p.mesh && p.mesh.parent) p.mesh.parent.remove(p.mesh); });
      this.players.length = 0;
      var specs = [this.carSpec(false)];
      if (split) specs.push(this.carSpec(true));
      specs.forEach(function (spec, i) {
        var car = new P.Car(spec, self.city, {
          id: i === 0 ? 'p1' : 'p2', label: i === 0 ? 'J1' : 'J2',
          x: 0, z: i === 0 ? 0 : 18, heading: 0,
          number: spec.number
        });
        car.arrest = 0;
        self.players.push(car);
      });
    },
    refreshPlayerCar: function () {
      if (!this.players.length) return;
      var self = this, old = this.players.slice(), split = this.split;
      this.players.length = 0;
      old.forEach(function (p, i) {
        p.mesh.parent && p.mesh.parent.remove(p.mesh);
        var spec = self.carSpec(i > 0);
        var car = new P.Car(spec, self.city, {
          id: i === 0 ? 'p1' : 'p2', label: i === 0 ? 'J1' : 'J2',
          x: p.x, z: p.z, heading: p.heading, number: spec.number
        });
        car.health = Math.max(1, p.health / p.maxHealth * car.maxHealth);
        car.nitro = p.nitro; car.arrest = p.arrest || 0;
        car.vx = p.vx; car.vz = p.vz; car.vLong = p.vLong;
        self.players.push(car);
      });
      this.split = split;
    },

    startRun: function (mode, split) {
      var self = this;
      this.mode = mode || 'mission';
      this.split = !!split && G.isSplit();
      this.missions.stop();       // limpia marcador, estela y monedas de la partida anterior
      BTP.Audio.init();
      BTP.UI.hideScreen();
      $('hud').classList.remove('hidden');
      $('split-labels').classList.toggle('hidden', !this.split);
      BTP.UI.setTouchActive(true);
      BTP.FX.clear();
      this.police.clear();
      this.city.clearPickups();
      this.makePlayers(this.split);
      this.resize();
      this.missions.start(this.mode, this.split);
      this.state = 'playing';
      this.camState = [{}, {}];
      this.players.forEach(function (p, i) { self.updateCamera(i, 0, true); });
      BTP.UI.centerMsg(BTP.Save.data.settings.classic
        ? (this.split ? '2 PLAYERS · GO!' : 'GO!')
        : (this.split ? '2 JUGADORES · ¡YA!' : '¡VAMOS!'), 1.5);
      BTP.Audio.musicStart();
      BTP.Save.flush();
    },

    pause: function () {
      if (this.state !== 'playing') return;
      this.state = 'paused';
      BTP.Audio.silence();
      BTP.UI.returnTo = 'pause';
      BTP.UI.showScreen('pause');
    },
    resume: function () {
      if (this.state !== 'paused') return;
      this.state = 'playing';
      BTP.UI.hideScreen();
      BTP.Audio.resume();
      this._last = performance.now();
    },
    toMenu: function () {
      this.state = 'menu';
      this.missions.stop();
      this.police.clear();
      this.city.clearPickups();
      BTP.FX.clear();
      this.players.forEach(function (p) { if (p.mesh && p.mesh.parent) p.mesh.parent.remove(p.mesh); });
      this.players.length = 0;
      this.split = false;
      this.resize();
      $('hud').classList.add('hidden');
      $('split-labels').classList.add('hidden');
      BTP.UI.setTouchActive(false);
      BTP.Audio.silence();
      BTP.UI.returnTo = 'menu';
      BTP.UI.showScreen('menu');
    },
    endRun: function (reason) {
      if (this.state !== 'playing') return;
      this.missions.finish(reason);
    },
    showResults: function (d) {
      this.state = 'results';
      BTP.Audio.silence();
      $('hud').classList.add('hidden');
      $('split-labels').classList.add('hidden');
      BTP.UI.setTouchActive(false);
      BTP.UI.showScreen('results', d);
    },

    /* ============================== CONTROLES ========================== */
    down: function () {
      for (var i = 0; i < arguments.length; i++) if (this.keys[arguments[i]]) return true;
      return false;
    },
    readControls: function (index) {
      var t = BTP.UI.touch, split = this.split, k = this.keys;
      var both = !split || index === 0;
      var c = { throttle: 0, steer: 0, brake: false, nitro: false, reset: false, look: false };
      if (index === 0) {
        var up = k.KeyW || (!split && k.ArrowUp) || t.throttle;
        var dn = k.KeyS || (!split && k.ArrowDown) || t.reverse;
        var lf = k.KeyA || (!split && k.ArrowLeft) || t.left;
        var rt = k.KeyD || (!split && k.ArrowRight) || t.right;
        c.throttle = (up ? 1 : 0) - (dn ? 1 : 0);
        c.steer = (rt ? 1 : 0) - (lf ? 1 : 0);
        c.brake = !!k.Space || !!t.brake;
        c.nitro = !!k.KeyN || !!k.KeyF || !!t.nitro;
        c.look = !!k.KeyB || !!t.look;
      } else {
        c.throttle = (k.ArrowUp ? 1 : 0) - (k.ArrowDown ? 1 : 0);
        c.steer = (k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0);
        c.brake = !!k.ShiftRight;
        c.nitro = !!k.ControlRight;
        c.look = false;
      }
      return c;
    },

    /* =============================== CÁMARAS =========================== */
    updateCamera: function (i, dt, instant) {
      var p = this.players[i]; if (!p) return;
      var cam = this.cameras[i], st = this.camState[i] || (this.camState[i] = {});
      var s = BTP.Save.data.settings, mode = s.cam;
      var fx = -Math.sin(p.heading), fz = -Math.cos(p.heading);
      var ctrl = this._controls && this._controls[i];
      var look = !!(ctrl && ctrl.look);
      var dist = mode === 'hood' ? 1.2 : (mode === 'near' ? 8.0 : 11.5);
      var height = mode === 'hood' ? 2.3 : (mode === 'near' ? 4.2 : 5.9);
      var speedZoom = U.clamp(Math.abs(p.vLong) / 45, 0, 1) * 3.2;
      var tx, ty, tz, lx, ly, lz;
      if (look) {
        tx = p.x + fx * 7; ty = height * 0.55; tz = p.z + fz * 7;
        lx = p.x - fx * 9; ly = 1.5; lz = p.z - fz * 9;
      } else if (mode === 'hood') {
        tx = p.x + fx * 1.2; ty = 2.35; tz = p.z + fz * 1.2;
        lx = p.x + fx * 22; ly = 1.7; lz = p.z + fz * 22;
      } else {
        tx = p.x - fx * (dist + speedZoom); ty = height + speedZoom * 0.25; tz = p.z - fz * (dist + speedZoom);
        lx = p.x + fx * 8; ly = 1.5; lz = p.z + fz * 8;
      }
      if (instant || !st.x) { st.x = tx; st.y = ty; st.z = tz; st.lx = lx; st.ly = ly; st.lz = lz; }
      else {
        var l = look ? 14 : 6;
        st.x = U.damp(st.x, tx, l, dt); st.y = U.damp(st.y, ty, l, dt); st.z = U.damp(st.z, tz, l, dt);
        st.lx = U.damp(st.lx, lx, l + 2, dt); st.ly = U.damp(st.ly, ly, l + 2, dt); st.lz = U.damp(st.lz, lz, l + 2, dt);
      }
      cam.position.set(st.x, Math.max(1.1, st.y), st.z);
      cam.lookAt(st.lx, st.ly, st.lz);
      var fov = mode === 'hood' ? 76 : (mode === 'near' ? 68 : 64);
      var targetFov = fov + U.clamp(Math.abs(p.vLong) / 55, 0, 1) * 8;
      cam.fov = instant ? targetFov : U.damp(cam.fov, targetFov, 3, dt);
      cam.updateProjectionMatrix();
    },

    /* =============================== BUCLE ============================= */
    loop: function (t) {
      var self = Game;
      requestAnimationFrame(function (n) { self.loop(n); });
      var dt = Math.min(0.05, Math.max(0.001, (t - self._last) / 1000));
      self._last = t;
      self.fps = U.damp(self.fps, 1 / dt, 3, dt);
      self._frame++;

      if (self.state === 'playing') self.update(dt);
      else if (self.state === 'menu') self.updateMenu(dt);
      else if (self.state === 'paused' || self.state === 'results') {
        self.city.update(dt * 0.25);
        BTP.FX.update(dt * 0.25);
      }
      self.render();
    },

    updateMenu: function (dt) {
      this.menuAngle += dt * 0.09;
      var r = 220;
      this.camera.position.set(Math.cos(this.menuAngle) * r, 95 + Math.sin(this.menuAngle * 0.7) * 22, Math.sin(this.menuAngle) * r);
      this.camera.lookAt(0, 18, 0);
      this.camera.fov = 62; this.camera.updateProjectionMatrix();
      this.city.update(dt);
      this.traffic.update(dt, [{ x: 0, z: 0, vLong: 0, vx: 0, vz: 0 }]);
      BTP.FX.update(dt);
      BTP.Audio.sirenUpdate(0, 0);
    },

    update: function (dt) {
      var players = this.players, self = this;
      // Controles y física de los jugadores
      this._controls = [];
      players.forEach(function (p, i) {
        var c = self.readControls(i);
        self._controls[i] = c;
        p.update(dt, c, self);
        if (p.destroyed) return;
        // Colisión con el tráfico civil
        for (var k = 0; k < self.traffic.cars.length; k++) {
          var tc = self.traffic.cars[k];
          if (U.dist2(p.x, p.z, tc.x, tc.z) < 100) P.collideCars(p, tc);
        }
      });
      // Colisión entre los dos jugadores
      if (players.length > 1) P.collideCars(players[0], players[1]);
      this.traffic.update(dt, players);
      this.police.update(dt, players);
      this.missions.update(dt);
      this.city.update(dt);
      BTP.FX.update(dt);
      this.sun.position.set(players[0].x + 160, 260, players[0].z + 110);
      this.sun.target.position.set(players[0].x, 0, players[0].z);
      this.sun.target.updateMatrixWorld();
      players.forEach(function (p, i) { self.updateCamera(i, dt, false); });
      BTP.Audio.engineUpdate(players[0].speedRatio(), !!this._controls[0].throttle || !!this._controls[0].nitro, !players[0].destroyed);
      BTP.UI.updateHUD({
        players: players, missions: this.missions, police: this.police,
        traffic: this.traffic, city: this.city, fps: this.fps, dt: dt, split: this.split
      });
    },

    render: function () {
      var r = this.renderer, w = this.size.w, h = this.size.h;
      if (this.state === 'playing' && this.split) {
        var horizontal = w >= h;
        r.setScissorTest(true);
        for (var i = 0; i < 2; i++) {
          var vx = horizontal ? i * w / 2 : 0;
          var vy = horizontal ? 0 : (1 - i) * h / 2;
          var vw = horizontal ? w / 2 : w;
          var vh = horizontal ? h : h / 2;
          r.setViewport(vx, vy, vw, vh);
          r.setScissor(vx, vy, vw, vh);
          r.render(this.scene, this.cameras[i]);
        }
        r.setScissorTest(false);
        r.setViewport(0, 0, w, h);
      } else {
        r.setViewport(0, 0, w, h);
        r.render(this.scene, this.camera);
      }
    }
  };
})();
