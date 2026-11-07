/* =========================================================================
 * Audio 100% procedural (WebAudio): motor, sirena, helicóptero, monedas,
 * choques, nitro, música y efectos de interfaz. Cero archivos externos.
 * ========================================================================= */
(function () {
  'use strict';
  var BTP = window.BTP;

  var A = BTP.Audio = {
    ctx: null, ready: false, master: null, musicBus: null, sfxBus: null,
    noise: null, engine: null, siren: null, heli: null, musicTimer: null, musicStep: 0,
    _muted: false, _vols: { master: 0.8, music: 0.45, sfx: 0.85 }
  };

  function makeNoise(ctx, seconds) {
    var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
  function env(g, t0, a, d, peak) {
    g.gain.cancelScheduledValues(t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  }

  A.init = function () {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    try {
      var Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return;
      var ctx = A.ctx = new Ctor();
      A.master = ctx.createGain();
      A.musicBus = ctx.createGain();
      A.sfxBus = ctx.createGain();
      A.master.connect(ctx.destination);
      A.musicBus.connect(A.master);
      A.sfxBus.connect(A.master);
      A.noise = makeNoise(ctx, 2);
      A.applySettings();
      A.buildEngine();
      A.buildSiren();
      A.buildHeli();
      A.ready = true;
    } catch (e) { console.warn('Audio no disponible', e); }
  };

  A.applySettings = function () {
    var s = BTP.Save.data.settings;
    A._muted = !!s.muted;
    A._vols = { master: s.master, music: s.music, sfx: s.sfx };
    if (!A.ctx) return;
    var t = A.ctx.currentTime;
    A.master.gain.setTargetAtTime(A._muted ? 0 : A._vols.master, t, 0.05);
    A.musicBus.gain.setTargetAtTime(A._vols.music * 0.55, t, 0.05);
    A.sfxBus.gain.setTargetAtTime(A._vols.sfx, t, 0.05);
  };

  A.buildEngine = function () {
    var ctx = A.ctx, g = ctx.createGain(); g.gain.value = 0;
    var filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 700;
    var o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 55;
    var o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = 82;
    var g2 = ctx.createGain(); g2.gain.value = 0.35;
    o1.connect(filt); o2.connect(g2); g2.connect(filt); filt.connect(g); g.connect(A.sfxBus);
    o1.start(); o2.start();
    A.engine = { g: g, filt: filt, o1: o1, o2: o2 };
  };

  A.buildSiren = function () {
    var ctx = A.ctx, g = ctx.createGain(); g.gain.value = 0;
    var osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = 640;
    var lfo = ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 1.6;
    var lg = ctx.createGain(); lg.gain.value = 210;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 1.2;
    lfo.connect(lg); lg.connect(osc.frequency);
    osc.connect(bp); bp.connect(g); g.connect(A.sfxBus);
    osc.start(); lfo.start();
    A.siren = { g: g, osc: osc, lfo: lfo };
  };

  A.buildHeli = function () {
    var ctx = A.ctx, src = ctx.createBufferSource(); src.buffer = A.noise; src.loop = true;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260;
    var g = ctx.createGain(); g.gain.value = 0;
    var lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 11;
    var lg = ctx.createGain(); lg.gain.value = 0.12;
    lfo.connect(lg); lg.connect(g.gain);
    src.connect(lp); lp.connect(g); g.connect(A.sfxBus);
    src.start(); lfo.start();
    A.heli = { g: g, lfo: lfo };
  };

  /* ------------------------------ Sonidos ------------------------------- */
  A.tone = function (freq, dur, type, vol, slide) {
    if (!A.ready || !A.ctx) return;
    var ctx = A.ctx, t = ctx.currentTime;
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    env(g, t, 0.008, dur, vol === undefined ? 0.25 : vol);
    o.connect(g); g.connect(A.sfxBus); o.start(t); o.stop(t + dur + 0.05);
  };
  A.noiseBurst = function (dur, vol, freq, type) {
    if (!A.ready || !A.ctx) return;
    var ctx = A.ctx, t = ctx.currentTime;
    var s = ctx.createBufferSource(); s.buffer = A.noise;
    var f = ctx.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.value = freq || 1200;
    var g = ctx.createGain(); env(g, t, 0.005, dur, vol === undefined ? 0.3 : vol);
    s.connect(f); f.connect(g); g.connect(A.sfxBus);
    s.start(t); s.stop(t + dur + 0.05);
  };

  A.sfx = function (name, p) {
    if (!A.ready || A._muted) return;
    p = p || {};
    switch (name) {
      case 'ui': A.tone(520, 0.05, 'square', 0.10); break;
      case 'back': A.tone(320, 0.07, 'square', 0.10); break;
      case 'coin':
        A.tone(880, 0.07, 'square', 0.16);
        setTimeout(function () { A.tone(1320, 0.10, 'square', 0.14); }, 70);
        break;
      case 'cash':
        [523, 659, 784, 1046].forEach(function (f, i) {
          setTimeout(function () { A.tone(f, 0.13, 'triangle', 0.18); }, i * 65);
        });
        break;
      case 'crash':
        A.noiseBurst(0.28, 0.45 * (p.force || 1), 900);
        A.tone(110, 0.24, 'sawtooth', 0.28 * (p.force || 1), 40);
        break;
      case 'skid': A.noiseBurst(0.12, 0.07, 2400, 'bandpass'); break;
      case 'nitro': A.noiseBurst(0.5, 0.2, 2600, 'highpass'); A.tone(180, 0.5, 'sawtooth', 0.12, 620); break;
      case 'spike': A.noiseBurst(0.18, 0.35, 3500, 'highpass'); A.tone(240, 0.25, 'square', 0.12, 60); break;
      case 'pickup': A.tone(440, 0.12, 'triangle', 0.2, 880); break;
      case 'checkpoint': A.tone(660, 0.10, 'square', 0.18); setTimeout(function () { A.tone(990, 0.14, 'square', 0.16); }, 100); break;
      case 'alarm': A.tone(740, 0.18, 'square', 0.16, 520); setTimeout(function () { A.tone(740, 0.18, 'square', 0.14, 520); }, 220); break;
      case 'arrest': [500, 400, 300, 200].forEach(function (f, i) { setTimeout(function () { A.tone(f, 0.25, 'sawtooth', 0.2); }, i * 160); }); break;
      case 'win': [523, 659, 784, 1046, 1318].forEach(function (f, i) { setTimeout(function () { A.tone(f, 0.2, 'triangle', 0.2); }, i * 100); }); break;
      case 'buy': A.tone(600, 0.09, 'square', 0.16); setTimeout(function () { A.tone(900, 0.14, 'square', 0.14); }, 90); break;
      case 'deny': A.tone(220, 0.16, 'square', 0.13, 140); break;
      case 'repair': A.tone(300, 0.3, 'triangle', 0.14, 700); break;
      case 'horn': A.tone(330, 0.25, 'sawtooth', 0.12); A.tone(440, 0.25, 'sawtooth', 0.10); break;
      case 'level': A.tone(300, 0.3, 'sawtooth', 0.2, 600); A.noiseBurst(0.3, 0.12, 1800, 'bandpass'); break;
      default: A.tone(440, 0.06, 'square', 0.08);
    }
  };

  /* --------------------------- Sonidos continuos ------------------------ */
  A.engineUpdate = function (speedRatio, throttle, active) {
    if (!A.ready || !A.engine) return;
    var t = A.ctx.currentTime, r = BTP.U.clamp(speedRatio, 0, 1.4);
    var target = active ? (0.025 + 0.10 * r) * (throttle ? 1.25 : 0.8) : 0;
    A.engine.g.gain.setTargetAtTime(A._muted ? 0 : target, t, 0.08);
    A.engine.o1.frequency.setTargetAtTime(48 + r * 125 + (throttle ? 12 : 0), t, 0.06);
    A.engine.o2.frequency.setTargetAtTime(74 + r * 190, t, 0.06);
    A.engine.filt.frequency.setTargetAtTime(420 + r * 1500, t, 0.08);
  };
  A.sirenUpdate = function (level, proximity) {
    if (!A.ready || !A.siren) return;
    var t = A.ctx.currentTime;
    var v = level > 0 ? (0.035 + 0.05 * BTP.U.clamp(proximity, 0, 1)) : 0;
    A.siren.g.gain.setTargetAtTime(A._muted ? 0 : v, t, 0.15);
    A.siren.lfo.frequency.setTargetAtTime(1.2 + level * 0.22, t, 0.2);
  };
  A.heliUpdate = function (on, proximity) {
    if (!A.ready || !A.heli) return;
    A.heli.g.gain.setTargetAtTime(on && !A._muted ? 0.05 + 0.12 * BTP.U.clamp(proximity || 0, 0, 1) : 0, A.ctx.currentTime, 0.3);
  };

  /* -------------------------------- Música ------------------------------ */
  var BASS = [55, 55, 65.41, 49, 55, 73.42, 65.41, 49];
  var LEAD = [220, 0, 261.63, 0, 196, 0, 293.66, 0, 220, 0, 329.63, 0, 261.63, 0, 196, 0];
  A.musicStart = function () {
    if (!A.ready || A.musicTimer) return;
    A.musicStep = 0;
    A.musicTimer = setInterval(function () {
      if (!A.ready || A._muted) return;
      var s = A.musicStep++;
      var ctx = A.ctx, t = ctx.currentTime;
      var b = BASS[Math.floor(s / 2) % BASS.length];
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = b;
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300;
      env(g, t, 0.01, 0.24, 0.18);
      o.connect(f); f.connect(g); g.connect(A.musicBus); o.start(t); o.stop(t + 0.3);
      if (s % 4 === 0) A.noiseBurst(0.05, 0.05, 5000, 'highpass');
      var l = LEAD[s % LEAD.length];
      if (l) {
        var o2 = ctx.createOscillator(), g2 = ctx.createGain();
        o2.type = 'square'; o2.frequency.value = l;
        env(g2, t, 0.01, 0.16, 0.045);
        o2.connect(g2); g2.connect(A.musicBus); o2.start(t); o2.stop(t + 0.2);
      }
    }, 250);
  };
  A.musicStop = function () {
    if (A.musicTimer) { clearInterval(A.musicTimer); A.musicTimer = null; }
  };
  A.silence = function () {
    A.engineUpdate(0, false, false);
    A.sirenUpdate(0, 0);
    A.heliUpdate(false, 0);
  };
  A.suspend = function () { if (A.ctx && A.ctx.state === 'running') A.ctx.suspend(); };
  A.resume = function () { if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); };
})();
