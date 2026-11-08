/* =========================================================================
 * INTERFAZ: HUD, minimapa, menús con navegación por teclado, garaje,
 * ajustes, ayuda, resultados, avisos y controles táctiles.
 * ========================================================================= */
(function () {
  'use strict';
  var BTP = window.BTP, U = BTP.U, C = BTP.C, G = BTP.Garage, Save = BTP.Save;
  var $ = function (id) { return document.getElementById(id); };

  var UI = BTP.UI = {
    game: null, current: 'none', returnTo: 'menu', focus: 0,
    garageTab: 'cars', settingsTab: 'main', mapBig: false,
    touch: {}, toastEls: [], lastHUD: 0, _centerTimer: null,

    init: function (game) {
      this.game = game;
      this.screen = $('screen');
      this.bindStatic();
      this.bindScreen();
      this.bindTouch();
      this.applyI18n();
      $('loading').classList.add('hidden');
    },

    /* --------------------------- Eventos estáticos ---------------------- */
    bindStatic: function () {
      var self = this;
      $('btn-pause').addEventListener('click', function () { BTP.Audio.sfx('ui'); self.game.pause(); });
      $('btn-fullscreen').addEventListener('click', function () {
        BTP.Audio.sfx('ui');
        if (!document.fullscreenElement) (document.documentElement.requestFullscreen || function () {}).call(document.documentElement);
        else if (document.exitFullscreen) document.exitFullscreen();
      });
      $('btn-map').addEventListener('click', function () {
        BTP.Audio.sfx('ui');
        self.mapBig = !self.mapBig;
        $('minimap-wrap').classList.toggle('big', self.mapBig);
      });
      window.addEventListener('contextmenu', function (e) { if (e.target.closest('#game,#hud')) e.preventDefault(); });
    },
    bindScreen: function () {
      var self = this;
      this.screen.addEventListener('click', function (e) {
        var el = e.target.closest('[data-action]');
        if (!el) return;
        BTP.Audio.init();
        self.action(el.getAttribute('data-action'), el.dataset, el);
      });
      this.screen.addEventListener('mouseover', function (e) {
        var el = e.target.closest('.nav');
        if (!el) return;
        var list = Array.prototype.slice.call(self.screen.querySelectorAll('.nav'));
        var idx = list.indexOf(el);
        if (idx >= 0) { self.focus = idx; self.updateSelection(); }
      });
      this.screen.addEventListener('input', function (e) {
        var el = e.target;
        if (!el.dataset || !el.dataset.setting) return;
        var key = el.dataset.setting;
        var val = el.type === 'range' ? Number(el.value) / 100 : el.value;
        Save.data.settings[key] = val; Save.flush();
        BTP.Audio.applySettings();
        if (self.game.applySettings) self.game.applySettings();
        var lab = self.screen.querySelector('[data-value="' + key + '"]');
        if (lab) lab.textContent = Math.round(val * 100) + '%';
      });
    },
    bindTouch: function () {
      var self = this, active = {};
      Array.prototype.forEach.call(document.querySelectorAll('[data-touch]'), function (btn) {
        var key = btn.getAttribute('data-touch');
        function down(e) {
          e.preventDefault(); BTP.Audio.init();
          try { btn.setPointerCapture(e.pointerId); } catch (err) {}
          active[e.pointerId] = key;
          self.touch[key] = true; btn.classList.add('pressed');
        }
        function up(e) {
          var k = active[e.pointerId];
          if (k) { self.touch[k] = false; delete active[e.pointerId]; btn.classList.remove('pressed'); }
        }
        btn.addEventListener('pointerdown', down);
        btn.addEventListener('pointerup', up);
        btn.addEventListener('pointercancel', up);
        btn.addEventListener('lostpointercapture', up);
      });
    },
    setTouchActive: function (on) { $('touch').classList.toggle('active', !!on); },

    /* ----------------------------- Pantallas ---------------------------- */
    showScreen: function (name, data) {
      this.current = name;
      this.data = data || {};
      this.screen.className = 'screen on';
      this.render();
    },
    hideScreen: function () {
      this.current = 'none';
      this.screen.className = 'screen';
      this.screen.innerHTML = '';
    },
    render: function () {
      var html = '';
      switch (this.current) {
        case 'menu': html = this.tplMenu(); break;
        case 'modes': html = this.tplModes(); break;
        case 'garage': html = this.tplGarage(); break;
        case 'settings': html = this.tplSettings(); break;
        case 'help': html = this.tplHelp(); break;
        case 'pause': html = this.tplPause(); break;
        case 'results': html = this.tplResults(this.data); break;
        case 'confirm': html = this.tplConfirm(); break;
        default: html = '';
      }
      this.screen.innerHTML = html;
      this.focus = 0;
      this.updateSelection();
      this.applyI18n();
      if (this.current === 'garage') this.drawPreview();
    },
    updateSelection: function () {
      var list = Array.prototype.slice.call(this.screen.querySelectorAll('.nav'));
      if (!list.length) return;
      this.focus = U.clamp(this.focus, 0, list.length - 1);
      list.forEach(function (el, i) { el.classList.toggle('sel', i === UI.focus); });
      var el = list[this.focus];
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    },
    applyI18n: function () {
      var lang = BTP.I18n.lang;
      document.documentElement.lang = lang;
      var ORIGINAL = {
        'hud.damage': 'Damage', 'hud.police': 'Police', 'hud.score': 'Score',
        'hud.speed': 'KM/H', 'hud.nitro': 'Nitro'
      };
      var classic = !!BTP.Save.data.settings.classic;
      Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) {
        var key = el.getAttribute('data-i18n');
        el.textContent = (classic && ORIGINAL[key]) ? ORIGINAL[key] : BTP.t(key);
      });
    },

    /* Modo Original: réplica del HUD/rótulos de la versión de Poki. */
    setClassic: function (on) {
      var hud = $('hud'), btn = $('btn-pause');
      hud.classList.toggle('classic', !!on);
      btn.textContent = on ? 'Pause' : 'Ⅱ';
      this.applyI18n();
    },

    /* ------------------------------ Plantillas -------------------------- */
    shell: function (inner, narrow) {
      return '<div class="panel' + (narrow ? ' narrow' : '') + '">' + inner + '</div>';
    },
    tplMenu: function () {
      var s = Save.data;
      return this.shell(
        '<h1 class="title"><span class="accent">BLACKTOP</span><br>POLICE CHASE</h1>' +
        '<div class="subtitle">' + BTP.t('app.tag') + '</div>' +
        '<div class="center"><span class="offline-badge">● ' + BTP.t('menu.offline') + '</span>' +
        (Save.data.settings.classic ? ' <span class="classic-badge">★ ' + BTP.t('menu.classic') + '</span>' : '') + '</div>' +
        '<div class="menu-list">' +
          this.mi('menu-play', BTP.t('menu.play'), BTP.t('menu.tip')) +
          this.mi('menu-garage', BTP.t('menu.garage'), G.CARS.length + ' ' + BTP.t('garage.cars') + ' · 12 ' + BTP.t('garage.colors')) +
          this.mi('menu-settings', BTP.t('menu.settings'), 'ES / EN · Calidad · Audio') +
          this.mi('menu-help', BTP.t('menu.help'), BTP.t('help.controls')) +
        '</div>' +
        '<div class="status-row"><span>' + BTP.t('menu.best') + ': <b>' + U.fmt(s.scoreBest) + '</b></span>' +
        '<span>' + BTP.t('menu.cash') + ': <b>' + U.money(s.cash) + '</b></span></div>' +
        '<div class="center tiny" style="margin-top:10px">v1.0 · offline clone · modelos 3D procedurales</div>', true);
    },
    mi: function (action, label, desc, extra) {
      return '<button class="menu-item nav' + (extra && extra.locked ? ' locked' : '') + '" data-action="' + action + '"' +
        (extra && extra.attrs ? ' ' + extra.attrs : '') + '>' +
        '<span>' + label + (desc ? '<small>' + desc + '</small>' : '') + '</span>' +
        '<span class="chev">' + (extra && extra.tag ? '<span class="tag">' + extra.tag + '</span>' : '▶') + '</span></button>';
    },
    tplModes: function () {
      var splitOk = G.isSplit();
      return this.shell(
        '<h2 class="title">' + BTP.t('modes.title') + '</h2><div class="subtitle">' + BTP.t('menu.tip') + '</div>' +
        '<div class="menu-grid">' +
          this.mi('mode-mission', BTP.t('modes.mission'), BTP.t('modes.missionDesc')) +
          this.mi('mode-endless', BTP.t('modes.endless'), BTP.t('modes.endlessDesc')) +
          this.mi('mode-trial', BTP.t('modes.trial'), BTP.t('modes.trialDesc')) +
          this.mi('mode-challenge', BTP.t('modes.challenge'), BTP.t('modes.challengeDesc')) +
          this.mi(splitOk ? 'mode-split' : 'menu-garage', BTP.t('modes.split'), splitOk ? BTP.t('modes.splitDesc') : BTP.t('modes.locked'),
            { locked: !splitOk, tag: splitOk ? '2P' : '$' + U.fmt(C.SPLIT_PRICE) }) +
        '</div><div class="btn-row"><button class="btn nav" data-action="back">' + BTP.t('common.back') + '</button></div>');
    },
    tplGarage: function () {
      var s = Save.data, car = G.selected(), st = G.stats(car.id), bars = G.statBars(car.id);
      var tabs = [['cars', 'garage.cars'], ['colors', 'garage.colors'], ['upgrades', 'garage.upgrades']];
      var head = '<h2 class="title">' + BTP.t('garage.title') + '</h2>' +
        '<div class="wallet"><span class="coin">$</span>' + U.fmt(s.cash) + '</div>' +
        '<div class="tabs">' + tabs.map(function (t) {
          return '<button class="tab' + (UI.garageTab === t[0] ? ' sel' : '') + '" data-action="garage-tab" data-tab="' + t[0] + '">' + BTP.t(t[1]) + '</button>';
        }).join('') + '</div>' +
        '<div class="garage-top"><div class="preview"><canvas id="car-preview" width="320" height="150"></canvas>' +
        '<div class="preview-info"><h3>' + car.name + '</h3><p>' + car.tag + '</p></div></div>' +
        '<div class="stat-bars">' + ['speed', 'grip', 'weight', 'health'].map(function (k) {
          return '<div class="stat-row"><span>' + BTP.t('garage.stat.' + k) + '</span><div class="bar"><i style="width:' +
            Math.round(bars[k] * 100) + '%"></i></div><b>' + Math.round(bars[k] * 100) + '</b></div>';
        }).join('') +
        '<p class="tiny">' + BTP.t('garage.stats') + '</p>' +
        '<div class="btn-row" style="margin-top:6px">' +
        '<button class="btn nav" data-action="garage-repair">' + BTP.t('garage.repair') + ' ($' + C.REPAIR_PRICE + ')</button>' +
        (!G.isSplit() ? '<button class="btn nav" data-action="garage-split">' + BTP.t('garage.split') + ' ($' + U.fmt(C.SPLIT_PRICE) + ')</button>' : '') +
        '</div></div></div>';
      var body = '';
      if (this.garageTab === 'cars') {
        body = '<div class="car-grid">' + G.CARS.map(function (c, i) {
          var owned = G.isUnlocked(c.id), isSel = s.selected === c.id;
          return '<button class="car-card nav' + (isSel ? ' selected' : '') + '" data-action="garage-car" data-id="' + c.id + '">' +
            '<b><span class="swatch" style="background:' + G.getColor(c.id) + '"></span>' + c.name + '</b>' +
            '<div>' + c.tag + '</div><div>V:' + Math.round(G.stats(c.id).speed) + ' · S:' + Math.round(G.stats(c.id).health) + '</div>' +
            '<div class="' + (owned ? 'owned' : 'price') + '">' + (owned ? (isSel ? BTP.t('garage.selected') : BTP.t('garage.select')) :
              (c.price ? BTP.t('garage.buy') + ' ' + U.money(c.price) : BTP.t('common.free'))) + '</div></button>';
        }).join('') + '</div>';
      } else if (this.garageTab === 'colors') {
        body = '<div class="color-grid">' + G.COLORS.map(function (c) {
          var owned = G.isColorUnlocked(c.hex), cur = G.getColor(s.selected) === c.hex;
          return '<button class="color-card nav" style="background:' + c.hex + '" data-action="garage-color" data-hex="' + c.hex + '">' +
            (owned ? '' : '<span class="lock">$' + c.price + '</span>') +
            (cur ? '<span class="lock">✓</span>' : '') + '<small>' + c.name + '</small></button>';
        }).join('') + '</div>';
      } else {
        body = G.UPGRADE_KEYS.map(function (u) {
          var lv = Save.upgradesFor(s.selected)[u.key] || 0, cost = G.upgradeCost(s.selected, u.key);
          return '<div class="upgrade-row"><div class="name">' + BTP.t(u.label) + '</div>' +
            '<div class="pips">' + [0, 1, 2, 3, 4].map(function (i) { return '<span class="pip' + (i < lv ? ' on' : '') + '"></span>'; }).join('') + '</div>' +
            '<button class="buy-btn nav" data-action="garage-upgrade" data-key="' + u.key + '"' +
            (cost === Infinity ? ' disabled' : '') + '>' + (cost === Infinity ? BTP.t('garage.max') : BTP.t('garage.buy') + ' ' + U.money(cost)) + '</button></div>';
        }).join('') + '<p class="tiny center">' + BTP.t('garage.tabHint') + '</p>';
      }
      return this.shell(head + body + '<div class="btn-row"><button class="btn nav" data-action="back">' + BTP.t('common.back') + '</button></div>');
    },
    tplSettings: function () {
      var s = Save.data.settings;
      function slider(key, label) {
        return '<div class="setting"><span>' + label + '</span><span><input type="range" min="0" max="100" value="' +
          Math.round(s[key] * 100) + '" data-setting="' + key + '"><b data-value="' + key + '">' + Math.round(s[key] * 100) + '%</b></span></div>';
      }
      function chips(key, label, opts) {
        return '<div class="setting"><span>' + label + '</span><span class="opts">' + opts.map(function (o) {
          return '<button class="chip nav' + (String(s[key]) === String(o[0]) ? ' sel' : '') + '" data-action="setting" data-key="' + key + '" data-val="' + o[0] + '">' +
            (typeof o[1] === 'string' && o[1].indexOf('.') > 0 ? BTP.t(o[1]) : o[1]) + '</button>';
        }).join('') + '</span></div>';
      }
      return this.shell(
        '<h2 class="title">' + BTP.t('settings.title') + '</h2><div class="subtitle">OFFLINE</div>' +
        slider('master', BTP.t('settings.master')) +
        slider('music', BTP.t('settings.music')) +
        slider('sfx', BTP.t('settings.sfx')) +
        chips('muted', BTP.t('settings.mute'), [['false', BTP.t('settings.off')], ['true', BTP.t('settings.on')]]) +
        chips('quality', BTP.t('settings.quality'), [['high', BTP.t('settings.high')], ['low', BTP.t('settings.low')]]) +
        chips('shadows', BTP.t('settings.shadows'), [['true', BTP.t('settings.on')], ['false', BTP.t('settings.off')]]) +
        chips('fps', BTP.t('settings.fps'), [['false', BTP.t('settings.off')], ['true', BTP.t('settings.on')]]) +
        chips('cam', BTP.t('settings.cam'), [['near', BTP.t('settings.camNear')], ['far', BTP.t('settings.camFar')], ['hood', BTP.t('settings.camHood')]]) +
        chips('lang', BTP.t('settings.lang'), [['es', 'ESPAÑOL'], ['en', 'ENGLISH']]) +
        chips('classic', BTP.t('settings.classic'), [['true', BTP.t('settings.on')], ['false', BTP.t('settings.off')]]) +
        '<div class="btn-row"><button class="btn danger nav" data-action="reset-ask">' + BTP.t('settings.reset') + '</button>' +
        '<button class="btn primary nav" data-action="back">' + BTP.t('common.back') + '</button></div>', true);
    },
    tplHelp: function () {
      return this.shell(
        '<h2 class="title">' + BTP.t('help.title') + '</h2>' +
        '<div class="help-section"><h3>' + BTP.t('help.controls') + '</h3><ul>' +
        '<li>' + BTP.t('help.drive') + '</li><li>' + BTP.t('help.brake') + '</li>' +
        '<li>' + BTP.t('help.nitro') + '</li><li>' + BTP.t('help.reset') + '</li>' +
        '<li>' + BTP.t('help.p2') + '</li></ul></div>' +
        '<div class="help-section"><h3>' + BTP.t('help.objective') + '</h3><p>' + BTP.t('help.objText') + '</p></div>' +
        '<div class="help-section"><h3>' + BTP.t('help.tips') + '</h3><p>' + BTP.t('help.tipsText') + '</p></div>' +
        '<div class="help-section"><h3>' + BTP.t('help.offline') + '</h3><p>' + BTP.t('help.offText') + '</p></div>' +
        '<div class="btn-row"><button class="btn primary nav" data-action="back">' + BTP.t('common.back') + '</button></div>', true);
    },
    tplPause: function () {
      var classic = !!Save.data.settings.classic;
      var L = function (key, en) { return classic ? en : BTP.t(key); };
      return this.shell(
        '<h2 class="title">' + L('pause.title', 'PAUSED') + '</h2><div class="subtitle">' + L('common.paused', 'PAUSED') + '</div>' +
        '<div class="menu-list">' +
          this.mi('resume', L('pause.resume', 'RESUME'), '') +
          this.mi('restart', L('pause.restart', 'RESTART RUN'), '') +
          this.mi('pause-garage', L('pause.garage', 'GARAGE'), '') +
          this.mi('pause-settings', L('pause.settings', 'SETTINGS'), '') +
          this.mi('pause-menu', L('pause.menu', 'MAIN MENU'), '') +
        '</div>', true);
    },
    tplResults: function (d) {
      d = d || {};
      var classic = !!Save.data.settings.classic;
      var L = function (key, en) { return classic ? en : BTP.t(key); };
      var TITLES = { arrested: 'BUSTED!', destroyed: 'CAR DESTROYED', escaped: 'CLEAN GETAWAY!', timeup: 'TIME UP!' };
      var cls = d.reason === 'arrested' || d.reason === 'destroyed' || d.reason === 'timeup' ? 'bad' : 'good';
      var winner = d.winner ? '<div class="center record">' + L('results.winner', 'WINNER') + ': ' + d.winner.label + '</div>' : '';
      return this.shell(
        '<h2 class="result-title ' + cls + '">' + (classic ? (TITLES[d.reason] || d.title) : d.title) + '</h2>' +
        '<div class="subtitle">' + L('results.title', 'RESULTS') + ' · ' + (d.mode || '').toUpperCase() + '</div>' + winner +
        (d.best ? '<div class="record">★ ' + L('results.best', 'NEW RECORD') + ' ★</div>' : '') +
        '<div class="result-grid">' +
          '<div class="result-item"><span>' + L('results.cash', 'CASH EARNED') + '</span><b>' + U.money(d.cash || 0) + '</b></div>' +
          '<div class="result-item"><span>' + L('results.score', 'SCORE') + '</span><b>' + U.fmt(d.score || 0) + '</b></div>' +
          '<div class="result-item"><span>' + L('results.coins', 'COINS') + '</span><b>' + (d.coins || 0) + '</b></div>' +
          '<div class="result-item"><span>' + L('results.missions', 'MISSIONS') + '</span><b>' + (d.missions || 0) + '</b></div>' +
          '<div class="result-item"><span>' + L('results.time', 'TIME') + '</span><b>' + U.time(d.time || 0) + '</b></div>' +
          '<div class="result-item"><span>' + L('hud.nearMiss', 'NEAR MISSES') + '</span><b>' + (d.nearMisses || 0) + '</b></div>' +
        '</div><div class="btn-row">' +
        '<button class="btn primary nav" data-action="results-again">' + L('results.again', 'PLAY AGAIN') + '</button>' +
        '<button class="btn nav" data-action="results-menu">' + L('results.menu', 'MENU') + '</button></div>', true);
    },
    tplConfirm: function () {
      return this.shell(
        '<h2 class="title">' + BTP.t('settings.reset') + '</h2>' +
        '<p class="center">' + BTP.t('settings.resetAsk') + '</p>' +
        '<div class="btn-row"><button class="btn danger nav" data-action="reset-yes">' + BTP.t('common.ok') + '</button>' +
        '<button class="btn primary nav" data-action="back">' + BTP.t('common.cancel') + '</button></div>', true);
    },

    /* ------------------------------- Acciones --------------------------- */
    action: function (name, ds, el) {
      var game = this.game, self = this;
      var s = Save.data;
      switch (name) {
        case 'menu-play': this.showScreen('modes'); BTP.Audio.sfx('ui'); break;
        case 'menu-garage': this.returnTo = 'menu'; this.showScreen('garage'); BTP.Audio.sfx('ui'); break;
        case 'menu-settings': this.returnTo = 'menu'; this.showScreen('settings'); BTP.Audio.sfx('ui'); break;
        case 'menu-help': this.returnTo = 'menu'; this.showScreen('help'); BTP.Audio.sfx('ui'); break;
        case 'back':
          if (this.current === 'confirm') this.showScreen('settings');
          else if (this.returnTo === 'pause') this.showScreen('pause');
          else this.showScreen('menu');
          BTP.Audio.sfx('back'); break;
        case 'mode-mission': game.startRun('mission', false); break;
        case 'mode-endless': game.startRun('endless', false); break;
        case 'mode-trial': game.startRun('trial', false); break;
        case 'mode-challenge': game.startRun('challenge', false); break;
        case 'mode-split': game.startRun('mission', true); break;
        case 'resume': game.resume(); break;
        case 'restart': game.startRun(game.mode, game.split); break;
        case 'pause-garage': this.returnTo = 'pause'; this.showScreen('garage'); break;
        case 'pause-settings': this.returnTo = 'pause'; this.showScreen('settings'); break;
        case 'pause-menu': game.toMenu(); break;
        case 'results-again': game.startRun(game.mode, game.split); break;
        case 'results-menu': game.toMenu(); break;
        case 'garage-tab': this.garageTab = ds.tab || 'cars'; this.render(); BTP.Audio.sfx('ui'); break;
        case 'garage-car': {
          var id = ds.id;
          if (G.isUnlocked(id)) { G.selectCar(id); if (game.refreshPlayerCar) game.refreshPlayerCar(); this.toast(BTP.t('garage.selected') + ': ' + G.get(id).name, 'good'); }
          else {
            var r = G.buyCar(id);
            if (r.ok) { this.toast(BTP.t('toast.buy', { v: r.car.name }), 'good'); if (game.refreshPlayerCar) game.refreshPlayerCar(); }
            else this.toast(BTP.t('toast.nomoney'), 'bad'), BTP.Audio.sfx('deny');
          }
          this.render(); break;
        }
        case 'garage-color': {
          var hex = ds.hex;
          if (!G.isColorUnlocked(hex)) {
            var rc = G.buyColor(hex);
            if (!rc.ok) { this.toast(BTP.t('toast.nomoney'), 'bad'); BTP.Audio.sfx('deny'); }
            else this.toast(BTP.t('toast.unlock', { v: rc.color.name }), 'good');
          } else { G.setColor(hex); if (game.refreshPlayerCar) game.refreshPlayerCar(); }
          this.render(); break;
        }
        case 'garage-upgrade': {
          var ru = G.buyUpgrade(s.selected, ds.key);
          if (!ru.ok) { this.toast(ru.reason === 'max' ? BTP.t('garage.max') : BTP.t('toast.nomoney'), 'bad'); BTP.Audio.sfx('deny'); }
          else { this.toast(BTP.t('toast.buy', { v: U.money(ru.cost) }), 'good'); if (game.refreshPlayerCar) game.refreshPlayerCar(); }
          this.render(); break;
        }
        case 'garage-split': {
          var rs = G.unlockSplit();
          if (rs.ok) this.toast(BTP.t('toast.unlock', { v: '2P' }), 'good');
          else this.toast(BTP.t('toast.nomoney'), 'bad');
          this.render(); break;
        }
        case 'garage-repair': {
          var car = game.players && game.players[0];
          var rr = G.repair(car);
          if (!rr.ok) this.toast(rr.reason === 'money' ? BTP.t('toast.nomoney') : BTP.t('garage.repair'), 'bad');
          else this.toast(BTP.t('toast.repair'), 'good');
          break;
        }
        case 'setting': {
          var key = ds.key, val = ds.val;
          if (val === 'true') val = true; else if (val === 'false') val = false;
          s.settings[key] = val; Save.flush();
          if (key === 'lang') { BTP.I18n.set(val); this.applyI18n(); }
          BTP.Audio.applySettings();
          if (game.applySettings) game.applySettings();
          this.render(); BTP.Audio.sfx('ui'); break;
        }
        case 'reset-ask': this.showScreen('confirm'); break;
        case 'reset-yes':
          Save.reset(); BTP.Audio.applySettings(); if (game.applySettings) game.applySettings();
          this.toast('PROGRESO BORRADO', 'warn'); this.returnTo = 'menu'; this.showScreen('menu'); break;
      }
    },

    handleKey: function (e) {
      if (this.current === 'none') return false;
      var k = e.key.toLowerCase();
      var list = Array.prototype.slice.call(this.screen.querySelectorAll('.nav'));
      if (k === 'arrowdown' || k === 's' || k === 'arrowright' || k === 'd') { this.focus = (this.focus + 1) % Math.max(1, list.length); this.updateSelection(); return true; }
      if (k === 'arrowup' || k === 'w' || k === 'arrowleft' || k === 'a') { this.focus = (this.focus - 1 + list.length) % Math.max(1, list.length); this.updateSelection(); return true; }
      if (k === 'enter' || k === ' ' || k === 'spacebar') {
        var el = list[this.focus];
        if (el && !el.disabled) { BTP.Audio.init(); this.action(el.getAttribute('data-action'), el.dataset, el); }
        return true;
      }
      if (k === 'escape' || k === 'p') {
        if (this.current === 'pause') this.game.resume();
        else if (this.current === 'results') this.game.toMenu();
        else this.action('back', {});
        return true;
      }
      if ((k === 'tab' || k === 'q' || k === 'e') && this.current === 'garage') {
        var tabs = ['cars', 'colors', 'upgrades'];
        var idx = tabs.indexOf(this.garageTab);
        this.garageTab = tabs[(idx + (k === 'q' ? 2 : 1)) % 3];
        this.render(); return true;
      }
      return true;
    },

    /* ------------------------------ Avisos ------------------------------ */
    toast: function (msg, kind) {
      // El original no muestra avisos flotantes durante la conducción:
      // en Modo Original solo se mantienen los avisos de los menús.
      if (Save.data.settings.classic && this.current === 'none') return;
      var box = $('toast');
      var el = document.createElement('div');
      el.className = 'toast ' + (kind || 'info');
      el.textContent = msg;
      box.appendChild(el);
      this.toastEls.push(el);
      while (this.toastEls.length > 4) { var old = this.toastEls.shift(); old.remove(); }
      setTimeout(function () { el.remove(); var i = UI.toastEls.indexOf(el); if (i >= 0) UI.toastEls.splice(i, 1); }, 2400);
    },
    centerMsg: function (text, seconds) {
      var el = $('center-msg');
      el.textContent = text; el.classList.add('on');
      if (this._centerTimer) clearTimeout(this._centerTimer);
      this._centerTimer = setTimeout(function () { el.classList.remove('on'); }, (seconds || 1.6) * 1000);
    },
    damageFlash: function () {
      var f = $('flash');
      f.classList.add('on');
      setTimeout(function () { f.classList.remove('on'); }, 90);
    },

    /* -------------------------------- HUD ------------------------------- */
    updateHUD: function (state) {
      var now = performance.now();
      // Barras cada frame (barato), textos a ~12 Hz
      var p = state.players[0], ms = state.missions, pol = state.police;
      if (!p || !ms) return;
      var damage = 100 * (1 - p.health / p.maxHealth);
      $('bar-damage').style.width = U.clamp(damage, 0, 100) + '%';
      $('bar-police').style.width = U.clamp(Math.max(pol.policeBar, p.arrest || 0) * 100, 0, 100) + '%';
      $('bar-nitro').style.width = U.clamp(p.nitro, 0, 100) + '%';
      var stars = '';
      for (var i = 0; i < C.MAX_WANTED; i++) stars += '<span class="' + (i < pol.level ? 'on' : '') + '">★</span>';
      if (now - this.lastHUD < 80) return;
      this.lastHUD = now;
      $('wanted').innerHTML = stars;
      $('heat-label').textContent = BTP.t('hud.heat') + ' ' + pol.level + '/' + C.MAX_WANTED;
      if (Save.data.settings.classic) {
        var objText = {
          pickup: 'Pick up the robber', bank: 'Drive to the bank', robbery: 'Robbing the bank...',
          hideout: 'Take the robber to the hideout'
        }[ms.phase] || 'Follow the green arrow';
        $('banner-title').textContent = 'Follow the green arrow';
        $('banner-sub').textContent = objText;
      } else {
        $('banner-title').textContent = ms.hud.banner || '';
        $('banner-sub').textContent = ms.hud.sub || '';
      }
      var dist = ms.distanceToObjective ? Math.round(ms.distanceToObjective(p)) : 0;
      $('distance').textContent = dist + ' m';
      $('money').textContent = U.fmt(Save.data.cash);
      $('score').textContent = U.fmt(ms.hud.score || 0);
      var kmh = Math.round(p.getSpeedKmh());
      $('speed').textContent = Save.data.settings.classic
        ? ('00' + Math.min(999, kmh)).slice(-3) : kmh;
      $('multi').textContent = (ms.multiplier > 1 ? 'x' + ms.multiplier + ' ' + BTP.t('hud.mult') : '');
      var timer = $('timer');
      if (ms.hud.timer > 0) { timer.classList.remove('hidden'); timer.textContent = U.time(ms.hud.timer); }
      else timer.classList.add('hidden');
      var rob = $('robbery');
      if (ms.phase === 'robbery') { rob.classList.remove('hidden'); $('bar-robbery').style.width = Math.round(ms.hud.progress * 100) + '%'; }
      else rob.classList.add('hidden');
      $('challenge').textContent = ms.hud.challenge || '';
      var p2 = $('p2-stats');
      if (state.split && state.players[1]) {
        p2.classList.remove('hidden');
        p2.innerHTML = BTP.t('hud.p2') + ': ' + Math.round(state.players[1].health) + '% · ' +
          BTP.t('hud.nitro') + ' ' + Math.round(state.players[1].nitro) + '%';
      } else p2.classList.add('hidden');
      $('fps').textContent = Save.data.settings.fps ? (state.fps ? Math.round(state.fps) + ' FPS' : '') : '';
      this.drawMinimap(state);
    },

    /* ------------------------------ Minimapa ---------------------------- */
    drawMinimap: function (state) {
      var cv = $('minimap'), g = cv.getContext('2d');
      var city = state.city, p = state.players[0];
      if (!city || !p) return;
      var zoom = Save.data.settings.mapZoom || 1;
      var view = 330 / zoom;
      var EXT = city.EXT, MS = city.MAP_SIZE;
      var sx = (p.x + EXT - view / 2) / (2 * EXT) * MS;
      var sy = (p.z + EXT - view / 2) / (2 * EXT) * MS;
      var sw = view / (2 * EXT) * MS, sh = sw;
      sx = U.clamp(sx, 0, MS - sw); sy = U.clamp(sy, 0, MS - sh);
      g.clearRect(0, 0, cv.width, cv.height);
      g.fillStyle = '#101922'; g.fillRect(0, 0, cv.width, cv.height);
      try { g.drawImage(city.mapCanvas, sx, sy, sw, sh, 0, 0, cv.width, cv.height); } catch (e) {}
      function X(wx) { return (wx - (p.x - view / 2)) / view * cv.width; }
      function Z(wz) { return (wz - (p.z - view / 2)) / view * cv.height; }
      function dot(x, z, color, r, shape) {
        var px = X(x), py = Z(z);
        if (px < -10 || py < -10 || px > cv.width + 10 || py > cv.height + 10) return;
        g.fillStyle = color;
        if (shape === 'square') g.fillRect(px - r, py - r, r * 2, r * 2);
        else { g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill(); }
      }
      // Edificios especiales
      city.banks.forEach(function (b) { dot(b.x, b.z, '#2f7fe0', 4, 'square'); });
      city.hideouts.forEach(function (b) { dot(b.x, b.z, '#2fd06a', 4, 'square'); });
      // Monedas
      city.coins.forEach(function (c) { if (c.alive) dot(c.x, c.z, '#ffd23f', 1.8); });
      // Bloqueos y pinchos
      state.police.roadblocks.forEach(function (rb) { dot(rb.x, rb.z, '#ff3b30', 5, 'square'); });
      state.police.spikes.forEach(function (sp) { dot(sp.x, sp.z, '#ff9a20', 3, 'square'); });
      // Policía
      state.police.cars.forEach(function (c) { dot(c.x, c.z, c.disabled > 0 ? '#7f8b99' : '#3a86ff', 3.4); });
      // Tráfico
      if (state.traffic) state.traffic.cars.forEach(function (c) { dot(c.x, c.z, '#d8dee8', 2); });
      // Objetivo
      var o = state.missions.objective;
      if (o && state.missions.phase !== 'robbery') {
        var ox = X(o.x), oy = Z(o.z);
        g.save(); g.translate(ox, oy);
        g.rotate(-BTP.Physics.headingTo(o.x - p.x, o.z - p.z));
        g.fillStyle = '#4cff54'; g.strokeStyle = '#0b3d12'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(0, -11); g.lineTo(7, 7); g.lineTo(0, 3); g.lineTo(-7, 7); g.closePath();
        g.fill(); g.stroke(); g.restore();
      }
      // Jugadores
      state.players.forEach(function (pl, i) {
        var px = X(pl.x), py = Z(pl.z);
        g.save(); g.translate(px, py); g.rotate(-pl.heading);
        g.fillStyle = i === 0 ? '#ff9a20' : '#27d6ff'; g.strokeStyle = '#10161f'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(0, -9); g.lineTo(6, 7); g.lineTo(0, 3); g.lineTo(-6, 7); g.closePath();
        g.fill(); g.stroke(); g.restore();
      });
      g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; g.strokeRect(1, 1, cv.width - 2, cv.height - 2);
      g.fillStyle = 'rgba(255,255,255,.85)'; g.font = 'bold 11px Arial'; g.fillText('N', cv.width - 16, 14);
    },

    /* -------------------------- Vista previa coche ---------------------- */
    drawPreview: function () {
      var cv = $('car-preview'); if (!cv) return;
      var g = cv.getContext('2d'), car = G.selected(), color = G.getColor(car.id);
      g.clearRect(0, 0, cv.width, cv.height);
      g.save(); g.translate(0, 12);
      // sombra
      g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(160, 122, 118, 12, 0, 0, Math.PI * 2); g.fill();
      // ruedas
      g.fillStyle = '#171a1f';
      [78, 242].forEach(function (x) { g.beginPath(); g.arc(x, 105, 25, 0, Math.PI * 2); g.fill(); });
      g.fillStyle = '#c9ced6';
      [78, 242].forEach(function (x) { g.beginPath(); g.arc(x, 105, 12, 0, Math.PI * 2); g.fill(); });
      // carrocería
      var tall = car.shape === 'van' || car.shape === 'truck' || car.shape === 'pickup';
      var low = car.shape === 'sport' || car.shape === 'super' || car.shape === 'hyper';
      g.beginPath();
      g.moveTo(26, 100); g.lineTo(26, 78); g.lineTo(58, 70);
      g.lineTo(tall ? 96 : 112, tall ? 36 : (low ? 52 : 45));
      g.lineTo(tall ? 235 : 216, tall ? 36 : (low ? 52 : 45));
      g.lineTo(270, 70); g.lineTo(294, 78); g.lineTo(294, 100); g.closePath();
      g.fillStyle = color; g.fill();
      g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 3; g.stroke();
      // cristales
      g.fillStyle = '#2b4054';
      g.beginPath(); g.moveTo(tall ? 104 : 120, tall ? 42 : (low ? 58 : 51));
      g.lineTo(tall ? 228 : 210, tall ? 42 : (low ? 58 : 51));
      g.lineTo(258, 70); g.lineTo(66, 70); g.closePath(); g.fill();
      // franjas / número
      if (car.number) { g.fillStyle = '#fff'; g.font = 'bold 26px Arial'; g.fillText(car.number, 200, 100); }
      g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(40, 84, 40, 5);
      // faros y pilotos
      g.fillStyle = '#fff3b0'; g.fillRect(288, 80, 8, 10);
      g.fillStyle = '#c02b20'; g.fillRect(24, 80, 8, 10);
      g.restore();
    }
  };
})();
