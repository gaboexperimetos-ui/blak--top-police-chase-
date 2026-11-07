/* =========================================================================
 * MISIONES Y MODOS: atracos encadenados, huida infinita, contrarreloj,
 * desafíos, monedas, power-ups, multiplicadores y flecha verde.
 * ========================================================================= */
(function () {
  'use strict';
  var BTP = window.BTP, U = BTP.U, C = BTP.C, M = BTP.Models;

  var MS = BTP.Missions = {
    ctx: null, mode: 'mission', running: false, finished: false,
    listenersBound: false, hud: {},

    init: function (ctx) {
      this.ctx = ctx;
      if (!this.listenersBound) {
        BTP.Bus.on('nearMiss', function (e) { MS.onNearMiss(e); });
        BTP.Bus.on('crash', function (e) { if (MS.running) { MS.combo = 0; MS.crashes++; } });
        BTP.Bus.on('takedown', function () { if (MS.running) { MS.score += 600; MS.addCombo(2); } });
        BTP.Bus.on('carDestroyed', function () { if (MS.running) MS.crashes++; });
        this.listenersBound = true;
      }
    },

    start: function (mode, split) {
      var city = this.ctx.city;
      this.mode = mode || 'mission';
      this.split = !!split;
      this.running = true; this.finished = false;
      // Modo Original: bucle exacto del juego de Poki (ladrón -> escondite),
      // sin la fase intermedia de atraco al banco de las versiones extendidas.
      this.classic = !!BTP.Save.data.settings.classic && this.mode === 'mission';
      this.phase = 'pickup';
      this.elapsed = 0;
      this.score = 0; this.runCash = 0; this.coins = 0; this.deliveries = 0;
      this.missionIndex = 0; this.multiplier = 1; this.combo = 0; this.comboTimer = 0;
      this.crashes = 0; this.nearMisses = 0; this.driftTotal = 0; this.takedowns = 0;
      this.hasRobber = false; this.hasLoot = false; this.robberyTimer = 0;
      this.cooldown = 0; this.timeLeft = this.mode === 'trial' ? 120 : (this.mode === 'challenge' ? 100 : 0);
      this.cpIndex = 0; this.objectiveTimer = 0;
      this.goals = { nearmiss: 6, coins: 12, drift: 260 };
      this.goalDone = { nearmiss: false, coins: false, drift: false };
      this.winner = null;
      this.hud = { banner: '', sub: '', progress: 0, timer: this.timeLeft, score: 0, cash: 0, challenge: '' };

      // Marcador verde + estela de flechas
      this.marker = M.makeObjectiveMarker(this.mode === 'trial' ? '#37e0ff' : '#42f55a');
      city.group.add(this.marker);
      this.trail = [];
      for (var i = 0; i < 12; i++) {
        var a = M.makeArrow(true);
        a.scale.setScalar(this.classic ? 1.35 : 0.85);
        city.group.add(a);
        this.trail.push(a);
      }
      this.companion = null;
      this.spawnCoinField();
      this.nextObjective(true);
      this.ctx.police.heatRate = this.mode === 'endless' ? 1.25 : (this.mode === 'trial' ? 0.5 : 0.9);
      BTP.UI.toast(BTP.t('toast.mission', { v: 1 }), 'good');
    },

    stop: function () {
      this.running = false;
      var city = this.ctx.city;
      if (this.marker) { city.group.remove(this.marker); this.marker = null; }
      if (this.trail) { this.trail.forEach(function (a) { city.group.remove(a); }); this.trail = []; }
      if (this.companion) { this.companion.parent && this.companion.parent.remove(this.companion); this.companion = null; }
      city.clearPickups();
    },

    /* --------------------------- Monedas / powerups ---------------------- */
    spawnCoinField: function () {
      var city = this.ctx.city, pl = this.ctx.players[0];
      city.clearPickups();
      var spots = city.coinSpots.slice().sort(function () { return Math.random() - 0.5; });
      var count = 0;
      for (var i = 0; i < spots.length && count < 60; i++) {
        var s = spots[i];
        if (U.dist(s.x, s.z, pl.x, pl.z) < 330) { city.spawnCoin(s.x, s.z); count++; }
      }
      for (var k = 0; k < 14; k++) {
        var p = city.randomRoadPoint(Math.random, pl.x, pl.z, 40, 260);
        var kind = k % 7 === 0 ? 'nitro' : (k % 11 === 0 ? 'shield' : 'coin');
        city.spawnCoin(p.x, p.z, kind);
      }
    },
    spawnRouteCoins: function () {
      var city = this.ctx.city, pl = this.ctx.players[0], o = this.objective;
      if (!o) return;
      var dx = o.x - pl.x, dz = o.z - pl.z, d = Math.hypot(dx, dz);
      var n = Math.min(10, Math.floor(d / 28));
      for (var i = 1; i <= n; i++) {
        var t = i / (n + 1);
        var rp = city.nearestRoadPoint(pl.x + dx * t, pl.z + dz * t);
        city.spawnCoin(rp.x + U.rand(-3, 3), rp.z + U.rand(-3, 3));
      }
    },

    /* ----------------------------- Objetivos ----------------------------- */
    nextObjective: function (first) {
      var city = this.ctx.city, pl = this.ctx.players[0];
      var o = null, banner = '', sub = '';
      if (this.mode === 'mission') {
        if (this.phase === 'pickup') {
          o = U.choice(city.pickups);
          banner = BTP.t('hud.pickup'); sub = BTP.t('hud.follow');
        } else if (this.phase === 'bank') {
          o = U.choice(city.banks);
          banner = BTP.t('hud.bank'); sub = BTP.t('hud.follow');
        } else if (this.phase === 'hideout') {
          o = U.choice(city.hideouts);
          banner = BTP.t('hud.hideout'); sub = BTP.t('hud.follow');
        }
      } else if (this.mode === 'trial') {
        o = city.checkpoints[this.cpIndex % city.checkpoints.length];
        banner = BTP.t('hud.checkpoint') + ' ' + (this.cpIndex + 1) + '/' + city.checkpoints.length;
        sub = BTP.t('hud.follow');
      } else {
        o = city.randomRoadPoint(Math.random, pl.x, pl.z, 90, 320);
        banner = this.mode === 'endless' ? BTP.t('hud.escape') : BTP.t('hud.checkpoint');
        sub = BTP.t('hud.follow');
      }
      if (!o) o = { x: 0, z: 0 };
      this.objective = { x: o.x, z: o.z, radius: this.mode === 'trial' ? 11 : 12 };
      this.hud.banner = banner; this.hud.sub = sub;
      if (this.marker) {
        this.marker.position.set(o.x, 0, o.z);
        this.marker.visible = true;
      }
      if (!first) this.spawnRouteCoins();
      this.objectiveTimer = this.mode === 'trial' ? 0 : (this.mode === 'mission' ? 0 : 26);
      BTP.Bus.emit('objectiveChanged', { objective: this.objective, mode: this.mode, phase: this.phase });
    },

    reachedObjective: function (pl) {
      var city = this.ctx.city;
      if (this.mode === 'mission') {
        if (this.phase === 'pickup') {
          this.hasRobber = true;
          BTP.UI.toast(BTP.t('toast.pickup'), 'good');
          BTP.Audio.sfx('pickup');
          this.score += 250;
          // Compañero visible en el asiento
          if (!this.companion) {
            this.companion = M.makeRobber();
            this.companion.scale.setScalar(0.62);
            city.group.add(this.companion);
          }
          if (this.classic) {
            // En el original, recoger al ladrón YA desata la persecución:
            // solo queda seguir la flecha verde hasta el escondite.
            this.hasLoot = true;
            this.phase = 'hideout';
            this.ctx.police.addHeat(40);   // por encima del umbral del nivel 2
            this.ctx.police.setLevel(Math.max(2, this.ctx.police.level));
            BTP.Audio.sfx('alarm');
            BTP.UI.toast('ROBBER ON BOARD · GO!', 'good');
          } else this.phase = 'bank';
          this.nextObjective();
        } else if (this.phase === 'bank') {
          this.phase = 'robbery';
          this.robberyTimer = 3.6;
          this.ctx.police.addHeat(40);
          this.ctx.police.setLevel(Math.max(2, this.ctx.police.level));
          BTP.Audio.sfx('alarm');
          if (this.marker) this.marker.visible = false;
          this.hud.banner = BTP.t('hud.robbing');
          this.hud.sub = BTP.t('hud.police');
        } else if (this.phase === 'hideout') {
          this.deliver(pl);
        }
      } else if (this.mode === 'trial') {
        this.cpIndex++;
        this.score += 500 + this.cpIndex * 100;
        this.timeLeft += 11;
        BTP.Audio.sfx('checkpoint');
        BTP.UI.toast(BTP.t('toast.checkpoint', { v: this.cpIndex }), 'good');
        this.addCombo(1);
        if (this.cpIndex >= city.checkpoints.length) { this.finish('escaped'); return; }
        this.nextObjective();
      } else {
        // Endless / challenge: punto de escape
        var reward = 180 + Math.floor(this.ctx.police.level * 45);
        this.earn(reward, 300);
        this.ctx.police.addHeat(-14);
        BTP.Audio.sfx('checkpoint');
        BTP.UI.toast(BTP.t('toast.delivered', { v: U.money(reward) }), 'good');
        this.addCombo(1);
        this.nextObjective();
      }
    },

    deliver: function (pl) {
      var reward = Math.round(C.CASH_REWARD * (1 + this.missionIndex * 0.35) * this.multiplier);
      this.hasLoot = false; this.hasRobber = false;
      this.deliveries++; this.missionIndex++;
      BTP.Save.data.missionsDone++;
      BTP.Save.data.stats.escapes++;
      this.earn(reward, 1200 * this.multiplier);
      this.addCombo(3);
      this.ctx.police.addHeat(-30);
      // Pequeña reparación de cortesía
      this.ctx.players.forEach(function (p) { p.health = Math.min(p.maxHealth, p.health + 18); });
      if (this.companion) { this.companion.parent && this.companion.parent.remove(this.companion); this.companion = null; }
      BTP.Audio.sfx('win');
      BTP.UI.toast(BTP.t('toast.delivered', { v: U.money(reward) }), 'good');
      if (this.split) { this.winner = pl; this.finish('escaped'); return; }
      BTP.UI.toast(BTP.t('toast.mission', { v: this.missionIndex + 1 }), 'info');
      this.phase = 'pickup';
      this.cooldown = 0.8;
      this.nextObjective();
    },

    /* --------------------------- Economía / puntos ----------------------- */
    earn: function (cash, points) {
      cash = Math.round(cash);
      this.runCash += cash;
      BTP.Save.addCash(cash);
      if (points) this.score += Math.round(points);
      BTP.Bus.emit('cashChanged', { cash: BTP.Save.data.cash });
    },
    addCombo: function (n) {
      this.combo += n;
      this.comboTimer = 4.5;
      this.multiplier = U.clamp(1 + Math.floor(this.combo / 3), 1, 6);
      if (this.combo > 2) BTP.UI.toast(BTP.t('toast.combo', { v: this.multiplier }), 'info');
    },
    onNearMiss: function (e) {
      if (!this.running) return;
      this.nearMisses++;
      this.score += 150 * this.multiplier;
      this.addCombo(1);
      BTP.Save.data.stats.nearmiss++;
      if (this.nearMisses % 3 === 0) BTP.UI.toast(BTP.t('toast.nearmiss', { v: 150 * this.multiplier }), 'info');
      BTP.Audio.sfx('ui');
    },

    /* ------------------------------- Bucle -------------------------------- */
    update: function (dt) {
      if (!this.running || this.finished) return;
      var ctx = this.ctx, players = ctx.players, city = ctx.city;
      this.elapsed += dt;
      if (this.cooldown > 0) this.cooldown -= dt;

      // Tiempo límite
      if (this.mode === 'trial' || this.mode === 'challenge') {
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) { this.finish('timeup'); return; }
      }
      // Objetivo caduca en modos libres
      if (this.mode === 'endless' || this.mode === 'challenge') {
        this.objectiveTimer -= dt;
        if (this.objectiveTimer <= 0) { ctx.police.addHeat(8); this.nextObjective(); }
      }
      // Atraco en curso
      if (this.phase === 'robbery') {
        this.robberyTimer -= dt;
        this.hud.progress = 1 - U.clamp(this.robberyTimer / 3.6, 0, 1);
        if (this.robberyTimer <= 0) {
          this.phase = 'hideout'; this.hasLoot = true;
          this.hud.progress = 0;
          var loot = Math.round(300 * (1 + this.missionIndex * 0.3));
          this.earn(loot, 400);
          ctx.police.addHeat(18);
          ctx.police.setLevel(Math.min(C.MAX_WANTED, ctx.police.level + 1));
          BTP.Audio.sfx('cash');
          BTP.UI.toast(BTP.t('toast.heist', { v: U.money(loot) }), 'good');
          if (this.marker) this.marker.visible = true;
          this.nextObjective();
        }
      } else {
        this.hud.progress = 0;
        // Comprobar llegada al objetivo
        players.forEach(function (pl) {
          if (pl.destroyed || MS.cooldown > 0) return;
          if (U.dist2(pl.x, pl.z, MS.objective.x, MS.objective.z) < MS.objective.radius * MS.objective.radius) {
            MS.reachedObjective(pl);
          }
        });
      }

      // Recogida de monedas y power-ups
      players.forEach(function (pl) {
        var got = city.collect(pl.x, pl.z, 3.6);
        got.forEach(function (c) {
          if (c.kind === 'coin') {
            var v = Math.round(C.COIN_VALUE * MS.multiplier);
            MS.earn(v, 50); MS.coins++;
            BTP.Save.data.stats.coins++;
            BTP.Audio.sfx('coin');
            MS.addCombo(0.34);
          } else if (c.kind === 'nitro') {
            pl.addNitro(70); BTP.UI.toast(BTP.t('toast.nitro'), 'info'); BTP.Audio.sfx('nitro');
          } else if (c.kind === 'shield') {
            pl.addShield(10); BTP.UI.toast(BTP.t('toast.shield'), 'good'); BTP.Audio.sfx('pickup');
          }
        });
      });

      // Puntuación por conducción / derrape
      players.forEach(function (pl) {
        var spd = Math.abs(pl.vLong);
        MS.score += dt * spd * 1.4 * MS.multiplier;
        if (pl.drift > 0.3 && spd > 12) {
          MS.driftTotal += dt * pl.drift * 32;
          MS.score += dt * pl.drift * 45 * MS.multiplier;
          BTP.Save.data.stats.drift += dt * pl.drift;
        }
      });
      if (this.comboTimer > 0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) { this.combo = 0; this.multiplier = 1; }
      }

      // Desafíos
      if (this.mode === 'challenge') {
        this.goalDone.nearmiss = this.nearMisses >= this.goals.nearmiss;
        this.goalDone.coins = this.coins >= this.goals.coins;
        this.goalDone.drift = this.driftTotal >= this.goals.drift;
        if (this.goalDone.nearmiss && this.goalDone.coins && this.goalDone.drift) {
          this.earn(1200, 3000);
          BTP.UI.toast(BTP.t('toast.challenge'), 'good');
          this.finish('escaped');
          return;
        }
      }

      // Animación del marcador y estela verde
      if (this.marker) {
        var t = this.elapsed;
        this.marker.userData.ring.rotation.z = t * 1.2;
        this.marker.userData.arrow.position.y = 6 + Math.sin(t * 3) * 0.6;
        this.marker.userData.arrow.rotation.y = t * 1.5;
      }
      if (this.companion && players[0]) {
        var p0 = players[0];
        this.companion.position.set(p0.x + 0.55, 1.4, p0.z + 0.2);
        this.companion.rotation.y = p0.heading;
      }
      this.updateTrail();

      // HUD
      this.hud.timer = this.timeLeft;
      this.hud.score = Math.floor(this.score);
      this.hud.cash = this.runCash;
      this.hud.coins = this.coins;
      this.hud.multiplier = this.multiplier;
      this.hud.wanted = ctx.police.level;
      this.hud.challenge = this.mode === 'challenge'
        ? 'NM ' + Math.min(this.nearMisses, this.goals.nearmiss) + '/' + this.goals.nearmiss +
          '  ·  $ ' + Math.min(this.coins, this.goals.coins) + '/' + this.goals.coins +
          '  ·  DRIFT ' + Math.min(Math.floor(this.driftTotal), this.goals.drift) + '/' + this.goals.drift
        : '';
    },

    updateTrail: function () {
      if (!this.trail || !this.objective) return;
      var pl = this.ctx.players[0];
      var dx = this.objective.x - pl.x, dz = this.objective.z - pl.z;
      var d = Math.hypot(dx, dz) || 1;
      var city = this.ctx.city;
      // Las flechas se pegan a la calzada (como las del original) en vez de
      // atravesar manzanas, para que siempre sean visibles desde el coche.
      var pts = [];
      for (var k = 0; k < this.trail.length; k++) {
        var t = (k + 1) / (this.trail.length + 1);
        var f = Math.min(1, t * 2.2);
        var rp = city.nearestRoadPoint(pl.x + dx * f, pl.z + dz * f);
        pts.push({ x: rp.x, z: rp.z, f: f });
      }
      for (var i = 0; i < this.trail.length; i++) {
        var a = this.trail[i], p = pts[i], nxt = pts[Math.min(i + 1, pts.length - 1)];
        a.position.set(p.x, 0.09, p.z);
        a.rotation.y = BTP.Physics.headingTo(nxt.x - p.x, nxt.z - p.z);
        a.visible = this.phase !== 'robbery' && d > (this.classic ? 10 : 18) && p.f < 0.97;
        a.userData.arrow.material.opacity = this.classic
          ? 0.82 + 0.18 * Math.sin(this.elapsed * 4 - i * 0.5)
          : 0.45 + 0.35 * Math.sin(this.elapsed * 4 - i * 0.5);
      }
    },

    angleToObjective: function (pl) {
      if (!this.objective) return 0;
      var desired = BTP.Physics.headingTo(this.objective.x - pl.x, this.objective.z - pl.z);
      return U.wrapAngle(desired - pl.heading);
    },
    distanceToObjective: function (pl) {
      return this.objective ? U.dist(pl.x, pl.z, this.objective.x, this.objective.z) : 0;
    },

    /* ------------------------------ Resultado ---------------------------- */
    finish: function (reason) {
      if (this.finished) return;
      this.finished = true; this.running = false;
      var titleKey = {
        arrested: 'results.arrested', destroyed: 'results.destroyed',
        escaped: 'results.escaped', timeup: 'results.timeup'
      }[reason] || 'results.title';
      if (reason === 'arrested') { BTP.Save.data.stats.arrests++; BTP.Audio.sfx('arrest'); }
      if (reason === 'escaped' || reason === 'destroyed' || reason === 'timeup') BTP.Audio.sfx(reason === 'escaped' ? 'win' : 'arrest');
      var score = Math.floor(this.score);
      var best = false;
      if (score > BTP.Save.data.scoreBest) { BTP.Save.data.scoreBest = score; best = true; }
      if (this.mode === 'endless' && this.elapsed > BTP.Save.data.bestEndless) BTP.Save.data.bestEndless = this.elapsed;
      if (this.mode === 'trial' && this.cpIndex > BTP.Save.data.bestTrial) BTP.Save.data.bestTrial = this.cpIndex;
      BTP.Save.flush();
      var payload = {
        reason: reason, title: BTP.t(titleKey), score: score, best: best,
        cash: this.runCash, coins: this.coins, missions: this.deliveries,
        time: this.elapsed, nearMisses: this.nearMisses, winner: this.winner,
        mode: this.mode
      };
      BTP.Bus.emit('gameOver', payload);
    }
  };
})();
