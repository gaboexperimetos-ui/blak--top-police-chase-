/* =========================================================================
 * FÍSICA ARCADE DEL COCHE: aceleración, freno, marcha atrás, derrape,
 * nitro, daño por choques, pinchos, escudo, reinicio y colisiones dinámicas.
 * ========================================================================= */
(function () {
  'use strict';
  var BTP = window.BTP, U = BTP.U, C = BTP.C, M = BTP.Models;

  function headingTo(dx, dz) { return Math.atan2(-dx, -dz); }

  function Car(spec, city, opts) {
    opts = opts || {};
    this.city = city;
    this.id = opts.id || spec.id || 'player';
    this.label = opts.label || 'P1';
    this.stats = spec.stats || BTP.Garage.stats('muscle');
    this.shape = spec.shape || 'muscle';
    this.color = spec.color || '#f57c1f';
    this.weight = this.stats.weight;
    this.radius = this.shape === 'truck' ? 2.8 : 2.25;
    this.model = M.makeCar({
      shape: this.shape, color: this.color,
      number: opts.number !== undefined ? opts.number : spec.number,
      asset: spec.name || spec.asset,   // nombre del .obj original, si existe
      scale: 1.12
    });
    this.mesh = this.model.group;
    this.mesh.position.set(0, 0, 0);
    if (city && city.group) city.group.add(this.mesh);
    else if (opts.scene) opts.scene.add(this.mesh);
    this.mesh.traverse(function (o) { if (o.isMesh && o.castShadow !== undefined) o.castShadow = true; });

    this.maxHealth = this.stats.health;
    this.health = this.maxHealth;
    this.nitro = 100;
    this.shield = 0;
    this.punctureTimer = 0;
    this.spinTimer = 0;
    this.destroyed = false;
    this.crashCooldown = 0;
    this.skidCooldown = 0;
    this.driftScore = 0;
    this.controls = { throttle: 0, steer: 0, brake: false, nitro: false, reset: false };
    this.reset(opts.x || 0, opts.z || 0, typeof opts.heading === 'number' ? opts.heading : null);
  }

  Car.prototype.reset = function (x, z, heading) {
    x = x || 0; z = z || 0;
    var computed = 0;
    if (this.city) {
      var rp = this.city.nearestRoadPoint(x, z);
      this.x = rp.x; this.z = rp.z;
      if (rp.axis === 'x') computed = (z > rp.z) ? 0 : Math.PI;
      else computed = (x > rp.x) ? Math.PI / 2 : -Math.PI / 2;
    } else { this.x = x; this.z = z; }
    this.heading = (typeof heading === 'number' && isFinite(heading)) ? heading : computed;
    this.vx = 0; this.vz = 0; this.vLong = 0; this.vLat = 0;
    this.steerAngle = 0; this.drift = 0; this.spinTimer = 0;
    this.mesh.position.set(this.x, 0, this.z);
    this.mesh.rotation.set(0, this.heading, 0);
  };

  Car.prototype.setColor = function (hex) { this.color = hex; this.model.setColor(hex); };
  Car.prototype.getSpeedKmh = function () { return Math.abs(this.vLong) * C.KMH; };
  Car.prototype.speedRatio = function () { return U.clamp(Math.abs(this.vLong) / (this.stats.speed * 1.35), 0, 1.4); };
  Car.prototype.repair = function () { this.health = this.maxHealth; this.destroyed = false; };
  Car.prototype.addNitro = function (n) { this.nitro = U.clamp(this.nitro + n, 0, 100); };
  Car.prototype.addShield = function (s) { this.shield = Math.max(this.shield, s); };
  Car.prototype.puncture = function (s) { this.punctureTimer = Math.max(this.punctureTimer, s || 5); };

  Car.prototype.applyDamage = function (amount, source) {
    if (this.destroyed || amount <= 0) return;
    if (this.shield > 0) { amount *= 0.25; }
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0; this.destroyed = true;
      BTP.FX.explosion(this.x, 1.2, this.z);
      BTP.Audio.sfx('crash', { force: 1.5 });
      BTP.Bus.emit('carDestroyed', { car: this, source: source });
    }
  };

  /* ---------------------------- Bucle principal -------------------------- */
  Car.prototype.update = function (dt, ctrl, world) {
    if (this.destroyed) { this.mesh.rotation.z = U.damp(this.mesh.rotation.z, 0.35, 2, dt); return; }
    ctrl = ctrl || this.controls;
    dt = Math.min(dt, 0.05);
    var s = this.stats;

    // Vectores locales
    var fx = -Math.sin(this.heading), fz = -Math.cos(this.heading);
    var rx = Math.cos(this.heading), rz = -Math.sin(this.heading);
    var vLong = this.vx * fx + this.vz * fz;
    var vLat = this.vx * rx + this.vz * rz;

    // Nitro
    var nitroOn = !!ctrl.nitro && this.nitro > 1 && vLong > -1;
    if (nitroOn) this.nitro = Math.max(0, this.nitro - dt * 34);
    else this.nitro = Math.min(100, this.nitro + dt * 4.5);

    var topSpeed = s.speed * (nitroOn ? 1.38 : 1) * (this.punctureTimer > 0 ? 0.55 : 1);
    var accel = (17 + s.speed * 0.28) * (nitroOn ? 1.85 : 1);

    // Acelerador / freno / marcha atrás
    if (ctrl.throttle > 0) vLong += accel * ctrl.throttle * dt;
    else if (ctrl.throttle < 0) {
      if (vLong > 1.2) vLong -= 34 * dt;
      else vLong -= 15 * dt;
      vLong = Math.max(vLong, -13);
    }
    if (ctrl.brake) {
      vLong *= Math.exp(-3.4 * dt);
      if (Math.abs(vLong) < 0.6) vLong = 0;
    }
    // Rozamiento y límites
    var offroad = !this.city.isDrivable(this.x, this.z);
    var drag = offroad ? 1.9 : (ctrl.brake ? 1.4 : 0.34);
    vLong *= Math.exp(-drag * dt);
    vLong = U.clamp(vLong, -13, topSpeed);

    // Dirección
    var speedFactor = U.clamp(Math.abs(vLong) / 11, 0, 1);
    var steerRate = (1.55 + s.grip * 0.10) * speedFactor;
    if (vLong < -0.5) steerRate *= -1;
    var handbrake = !!ctrl.brake && Math.abs(vLong) > 8;
    this.heading -= (ctrl.steer || 0) * steerRate * dt * (handbrake ? 1.45 : 1);
    this.steerAngle = U.damp(this.steerAngle, -(ctrl.steer || 0) * 0.42, 12, dt);

    // Agarre lateral / derrape
    var grip = handbrake ? Math.max(0.9, s.grip * 0.14) : s.grip;
    if (offroad) grip *= 0.6;
    vLat *= Math.exp(-grip * dt);
    this.drift = U.clamp(Math.abs(vLat) / 12, 0, 1);
    if (this.drift > 0.28 && Math.abs(vLong) > 12) {
      this.driftScore += dt * this.drift * 10;
      this.skidCooldown -= dt;
      if (this.skidCooldown <= 0) {
        this.skidCooldown = 0.045;
        BTP.FX.skid(this.x + rx * 0.9, this.z + rz * 0.9, this.heading, '#252527');
        BTP.FX.skid(this.x - rx * 0.9, this.z - rz * 0.9, this.heading, '#252527');
        if (Math.random() < 0.35) BTP.FX.smoke(this.x - fx * 2, 0.6, this.z - fz * 2, '#b8b8b8');
      }
      if (Math.random() < dt * 6) BTP.Audio.sfx('skid');
    }

    // Recomponer velocidad
    fx = -Math.sin(this.heading); fz = -Math.cos(this.heading);
    rx = Math.cos(this.heading); rz = -Math.sin(this.heading);
    this.vx = fx * vLong + rx * vLat;
    this.vz = fz * vLong + rz * vLat;
    this.vLong = vLong; this.vLat = vLat;

    // Integrar posición
    this.x += this.vx * dt;
    this.z += this.vz * dt;

    // Límites del mundo
    var lim = this.city.limit || C.WORLD;
    if (this.x > lim && !(this.city.isDrivable(this.x, this.z))) { this.x = lim; this.vx *= -0.35; }
    if (this.x < -lim) { this.x = -lim; this.vx *= -0.35; }
    if (this.z > lim) { this.z = lim; this.vz *= -0.35; }
    if (this.z < -lim) { this.z = -lim; this.vz *= -0.35; }

    // Colisiones estáticas
    this.collideStatic(dt);
    // Agua
    if (this.city.isWater(this.x, this.z)) {
      this.vx *= 0.9; this.vz *= 0.9;
      if (Math.random() < dt * 5) BTP.FX.smoke(this.x, 0.6, this.z, '#d8e8f0');
      this.applyDamage(dt * 5, 'water');
    }
    // Pinchos
    if (this.punctureTimer > 0) this.punctureTimer -= dt;
    if (this.shield > 0) this.shield -= dt;
    if (this.crashCooldown > 0) this.crashCooldown -= dt;
    if (this.spinTimer > 0) {
      this.spinTimer -= dt;
      this.heading += dt * 4.5 * (this.spinTimer > 0 ? 1 : 0);
    }

    // Efectos visuales y del modelo
    this.mesh.position.set(this.x, Math.sin(performance.now() * 0.008) * 0.02 * this.drift, this.z);
    this.mesh.rotation.y = this.heading;
    this.mesh.rotation.z = U.damp(this.mesh.rotation.z, -U.clamp(vLat * ctrl.steer * 0.008, -0.10, 0.10), 6, dt);
    this.mesh.rotation.x = U.damp(this.mesh.rotation.x, U.clamp((ctrl.throttle * -0.012 + (ctrl.brake ? 0.02 : 0)), -0.04, 0.04), 6, dt);
    this.model.spin(vLong, dt, this.steerAngle);
    this.model.setBrake(!!ctrl.brake || ctrl.throttle < 0);
    if (nitroOn) {
      var ex = this.x - fx * 2.6, ez = this.z - fz * 2.6;
      BTP.FX.nitro(ex + rx * 0.6, 0.6, ez + rz * 0.6);
      BTP.FX.nitro(ex - rx * 0.6, 0.6, ez - rz * 0.6);
    }
    if (this.health / this.maxHealth < 0.3 && Math.random() < dt * 8) {
      BTP.FX.smoke(this.x - fx * 1.8, 1.2, this.z - fz * 1.8, '#4b4b4b');
    }
  };

  /* -------------------------- Colisión estática -------------------------- */
  Car.prototype.collideStatic = function (dt) {
    var self = this;
    var list = this.city.query(this.x, this.z, this.radius + 2);
    for (var i = 0; i < list.length; i++) {
      var o = list[i], hit = null, nx = 0, nz = 0;
      if (o.hw !== undefined) {
        hit = U.circleAABB(this.x, this.z, this.radius, o.x, o.z, o.hw, o.hd);
      } else {
        var dx = this.x - o.x, dz = this.z - o.z, d = Math.hypot(dx, dz);
        var rr = this.radius + o.r;
        if (d < rr) { nx = d > 0.001 ? dx / d : 1; nz = d > 0.001 ? dz / d : 0; hit = { nx: nx, nz: nz, depth: rr - d }; }
      }
      if (!hit) continue;
      var nxn = hit.nx, nzn = hit.nz;
      this.x += nxn * (hit.depth + 0.02);
      this.z += nzn * (hit.depth + 0.02);
      var dot = this.vx * nxn + this.vz * nzn;
      if (dot < 0) {
        var impact = -dot;
        this.vx -= 1.45 * dot * nxn;
        this.vz -= 1.45 * dot * nzn;
        var fx = -Math.sin(this.heading), fz = -Math.cos(this.heading);
        this.vLong = U.clamp(this.vx * fx + this.vz * fz, -13, this.stats.speed);
        if (impact > 3.5 && this.crashCooldown <= 0) {
          this.crashCooldown = 0.32;
          var dmg = U.clamp((impact - 3) * 1.35, 1, 42) / Math.sqrt(this.weight);
          this.applyDamage(dmg, o.type === 'tree' ? 'tree' : 'building');
          BTP.Save.data.stats.crashes++;
          BTP.FX.spark(this.x + nxn * this.radius, 1.0, this.z + nzn * this.radius, 8);
          BTP.FX.smoke(this.x, 1.0, this.z, '#c8c8c8');
          BTP.Audio.sfx('crash', { force: U.clamp(impact / 22, 0.3, 1.3) });
          BTP.Bus.emit('crash', { car: this, impact: impact, damage: dmg });
        }
      }
    }
  };

  /* ------------- Colisión entre coches (jugador / tráfico / policía) ----- */
  var Physics = BTP.Physics = {
    Car: Car,
    headingTo: headingTo,
    collideCars: function (a, b, opts) {
      if (a === b || (a.destroyed && b.destroyed)) return null;
      var dx = b.x - a.x, dz = b.z - a.z;
      var rr = (a.radius || 2.2) + (b.radius || 2.2);
      var d2 = dx * dx + dz * dz;
      if (d2 > rr * rr || d2 < 0.0001) return null;
      var d = Math.sqrt(d2), nx = dx / d, nz = dz / d;
      var overlap = rr - d;
      var ma = a.weight || 1, mb = b.weight || 1;
      var total = ma + mb;
      if (a.moveable !== false) { a.x -= nx * overlap * (mb / total); a.z -= nz * overlap * (mb / total); }
      if (b.moveable !== false) { b.x += nx * overlap * (ma / total); b.z += nz * overlap * (ma / total); }
      var rvx = (b.vx || 0) - (a.vx || 0), rvz = (b.vz || 0) - (a.vz || 0);
      var rel = rvx * nx + rvz * nz;
      if (rel > 0) return { impact: 0 };
      var impulse = -(1.35) * rel / (1 / ma + 1 / mb);
      if (a.moveable !== false) { a.vx -= impulse * nx / ma; a.vz -= impulse * nz / ma; }
      if (b.moveable !== false) { b.vx += impulse * nx / mb; b.vz += impulse * nz / mb; }
      // Sincronizar la velocidad longitudinal del jugador
      [a, b].forEach(function (c) {
        if (!c.stats) return;
        var fx = -Math.sin(c.heading), fz = -Math.cos(c.heading);
        c.vLong = c.vx * fx + c.vz * fz;
      });
      var impact = -rel;
      if (impact > 4) {
        var dmgA = U.clamp((impact - 3) * 0.75, 1, 30) / Math.sqrt(ma);
        var dmgB = U.clamp((impact - 3) * 0.75, 1, 30) / Math.sqrt(mb);
        if (a.applyDamage) a.applyDamage(dmgA, 'car');
        if (b.applyDamage) b.applyDamage(dmgB, 'car');
        if (b.takedown && impact > 14) b.takedown();
        BTP.FX.spark((a.x + b.x) / 2, 1.0, (a.z + b.z) / 2, 7);
        BTP.Audio.sfx('crash', { force: U.clamp(impact / 25, 0.3, 1.2) });
        BTP.Bus.emit('carCrash', { a: a, b: b, impact: impact });
      }
      return { impact: impact, nx: nx, nz: nz };
    }
  };
})();
