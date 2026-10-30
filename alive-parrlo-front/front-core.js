/* Парло анфас — общая логика всех вариантов (макет, не прод-код).
   Поза — набор чисел; каждый вариант (SVG 2.5D, 3D, поворот) рисует одну и ту же позу по-своему.
   Числа повторены в таблице index.html и в README.md. */
(function () {
  'use strict';
  const T = {
    HZ: 30, HZ_IDLE: 15, HZ_LOW: 15,
    BLEND_S: 0.45,                       // смена режима
    BLINK: { close: 0.07, hold: 0.04, open: 0.11, gap: 0.29 },
    BLINK_MIN: 2.2, BLINK_MAX: 5.6, BLINK_DOUBLE: 0.18, BLINK_RM: [6, 10],
    LOOK_PAUSE: [0.6, 3.0], LOOK_HOLD: [0.8, 2.2], LOOK_CENTER: 0.28,
    LOOK_TAU: 0.07, HEAD_TAU: 0.18,      // сглаживание зрачков и головы
    POINTER_IDLE_S: 2.5,                 // нет движения курсора/пальца дольше — взгляд в центр
    POINTER_RANGE_PX: 420,               // курсор на таком расстоянии = край взгляда
    FOLLOW_YAW: 12, FOLLOW_PITCH: 7,     // ° поворота головы за курсором
    GESTURE_PAUSE: [3.5, 8], RM_FADE: 0.25,
  };
  const TAU = Math.PI * 2;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => { const u = clamp(t); return u * u * (3 - 2 * u); };
  const sn = (t, P, ph = 0) => Math.sin(TAU * t / P + ph);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pulse = (u) => { const v = ((u % 1) + 1) % 1; return v < 0.5 ? Math.pow(Math.sin(v * TAU), 2) : 0; };

  /* Поза. yaw/pitch/roll — голова, °; body — доля поворота тела; lx/ly — взгляд −1…1;
     lid 0 открыт … 1 закрыт; happy 0…1 — глаза-улыбки; beak 0…1 — открытие клюва;
     c1..c3 — перья, °; cs — длина пера ×; wl/wr — крылья, ° (+ = поднять); lift — подскок (ед. 240);
     sy — тело scaleY; ps — зрачок ×; dots — точки мысли 0…1 */
  const REST = { yaw: 0, pitch: 0, roll: 0, lift: 0, sy: 1, lx: 0, ly: 0, lid: 0, happy: 0, beak: 0,
    c1: -24, c2: 0, c3: 24, cs: 1, wl: 0, wr: 0, ps: 1, dots: 0, d1: 0, d2: 0, d3: 0, glint: 0 };
  const KEYS = Object.keys(REST);
  const KEY = {
    idle: {},
    think: { roll: 6, pitch: 6, lx: 0.55, ly: -0.75, lid: 0.32, c1: -14, c2: 8, c3: 30, cs: 0.88, dots: 1, d1: .55, d2: .77, d3: .99 },
    search: { pitch: -2, c1: -20, c2: 4, c3: 26, glint: 0.9 },
    joy: { lift: -5, happy: 1, beak: 0.55, c1: -32, c2: 0, c3: 32, cs: 1.12, wl: 12, wr: 12 },
    speak: { beak: 0.25 },
    listen: { roll: -7, pitch: -3, ps: 1.14, c1: -30, c2: 0, c3: 30, cs: 1.1 },
  };
  /* движение режима поверх ключевой позы (уровень full) */
  const MOTION = {
    idle: () => ({}),
    think(t) {
      const d = (i) => pulse(t / 1.26 - i / 3 + 0.25);
      return { roll: 1.5 * sn(t, 3.3), lx: 0.15 * sn(t, 4.3), ly: 0.1 * sn(t, 2.9),
        c3: 4 * Math.pow(Math.max(0, Math.sin(TAU * 1.35 * t)), 2),
        d1: .55 * (.35 + .65 * d(0)) - .55, d2: .77 * (.35 + .65 * d(1)) - .77, d3: .99 * (.35 + .65 * d(2)) - .99 };
    },
    search(t) {
      const A = sn(t, 2.4); const sq = Math.tanh(4 * A) / Math.tanh(4);
      return { yaw: 16 * A, lx: 0.9 * sq, roll: 2 * A, lift: -1.5 * Math.abs(sn(t, 1.2)),
        c1: 3 * sn(t, .6), c2: 3 * sn(t, .6, -.5), c3: 3 * sn(t, .6, -1), glint: 0.9 * pulse(t / 1.2) - 0.9 };
    },
    joy(t) {
      const s = Math.abs(Math.sin(TAU * 1.1 * t)); const f = Math.sin(TAU * 2.2 * t);
      return { lift: -8 * s, sy: 0.025 * s, roll: 4 * sn(t, 2.4), wl: 12 * f, wr: -12 * f,
        c1: -5 * s, c3: 5 * s, beak: 0.15 * f };
    },
    speak(t) {
      const env = 0.6 + 0.4 * sn(t, 1.3); const o = Math.max(0, Math.sin(TAU * 4.2 * t)) * env;
      return { beak: -0.25 + 0.95 * o, pitch: -2.5 * o, roll: 1.5 * sn(t, 1 / 2.1 * 2), yaw: 2 * sn(t, 3.7),
        c1: -2 * o, c3: 2 * o };
    },
    listen(t) {
      const nod = Math.pow(Math.max(0, sn(t, 2.8)), 6);
      return { pitch: -5 * nod, roll: 1.2 * sn(t, 2.8), c1: 1.5 * sn(t, 1.9), c2: 1.5 * sn(t, 1.9, -.5), c3: 1.5 * sn(t, 1.9, -1) };
    },
  };
  /* Reduce Motion: только прозрачность признаков режима */
  const RM_OPACITY = {
    think: (t) => { const d = (i) => pulse(t / 1.6 - i / 3 + .25); return { d1: .55 * (.35 + .65 * d(0)), d2: .77 * (.35 + .65 * d(1)), d3: .99 * (.35 + .65 * d(2)) }; },
    search: (t) => ({ glint: 0.3 + 0.6 * pulse(t / 1.6) }),
  };
  function ambient(t, a) {
    const br = sn(t, 3.6);
    return { sy: 0.012 * br * a, lift: -0.8 * br * a, roll: (1.6 * sn(t, 6.7) + 0.7 * sn(t, 2.9)) * a,
      c1: 2 * sn(t, 2.3) * a, c2: 2 * sn(t, 2.3, -.6) * a, c3: 2 * sn(t, 2.3, -1.2) * a,
      wl: 1.5 * sn(t, 3.6, 1) * a, wr: 1.5 * sn(t, 3.6, 1.4) * a };
  }
  /* жесты покоя */
  const GESTURES = {
    tilt: { dur: 1.6, w: 3, f: (g) => { const k = smooth(g / .3) * (1 - smooth((g - 1.2) / .4)); return { roll: 12 * k, pitch: 3 * k, ps: 0.06 * k }; } },
    ruffle: { dur: 1.2, w: 2, f: (g) => { const e = Math.exp(-1.5 * g) * (1 - smooth((g - .9) / .3)); return { c1: 9 * e * Math.sin(TAU * 6 * g), c2: 9 * e * Math.sin(TAU * 6 * g + 1), c3: 9 * e * Math.sin(TAU * 6 * g + 2), cs: .1 * e }; } },
    flap: { dur: 1.4, w: 2, f: (g) => { const k = smooth(g / .2) * (1 - smooth((g - 1.1) / .3)); const s = 20 + 10 * Math.sin(TAU * 3 * g); return { wl: s * k, wr: s * k, lift: -2 * k }; } },
    peek: { dur: 2.6, w: 3, f: (g) => { const k = smooth(g / .25) * (1 - smooth((g - 2.2) / .4)); const x = g < 1.3 ? -1 : 1; const kk = k * smooth(Math.abs(g - 1.3) / .2); return { lx: .9 * x * kk, yaw: 8 * x * kk }; } },
  };
  function blinkAt(u, dbl) {
    const B = T.BLINK, tot = B.close + B.hold + B.open;
    const one = (v) => v < 0 ? 0 : v < B.close ? v / B.close : v < B.close + B.hold ? 1 : v < tot ? 1 - (v - B.close - B.hold) / B.open : 0;
    if (u < tot) return one(u);
    if (dbl && u >= B.gap && u < B.gap + tot) return one(u - B.gap);
    return 0;
  }

  /* общий курсор/палец (одно место на страницу) */
  const pointer = { x: 0, y: 0, at: -1e9, enabled: true };
  addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.at = performance.now(); }, { passive: true });
  addEventListener('pointerdown', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.at = performance.now(); }, { passive: true });
  document.addEventListener('pointerleave', () => { pointer.at = -1e9; });

  /* Brain: планировщик + поза. opts.modeYaw — добавка поворота по режимам (вариант C) */
  function Brain(opts = {}) {
    this.opts = opts; this.mode = opts.mode || 'idle'; this.prev = this.mode; this.modeAt = -1e9;
    this.reduce = false; this.low = false; this.t0 = performance.now() / 1000;
    this.nextBlink = rnd(1, 3); this.blinkStart = -9; this.dbl = false;
    this.look = [0, 0]; this.lookT = [0, 0]; this.nextLook = 1; this.lookEnd = 0;
    this.head = [0, 0]; this.gesture = null; this.gAt = 0; this.nextG = 2; this.lastG = null; this.lastT = null;
    this.yawK = opts.modeYaw ? opts.modeYaw[this.mode] || 0 : 0;
  }
  Brain.prototype.setMode = function (m) { if (m === this.mode) return; const t = this.now(); this.prevPose = this.lastPose ? Object.assign({}, this.lastPose) : null; this.prev = this.mode; this.mode = m; this.modeAt = t; this.gesture = null; if (m === 'idle') this.nextG = t + 2; };
  Brain.prototype.now = function () { return performance.now() / 1000 - this.t0; };
  Brain.prototype.hz = function () { if (this.low) return T.HZ_LOW; if (this.reduce) return 15; return (this.mode === 'idle' && !this.gesture && !this.blending()) ? T.HZ_IDLE : T.HZ; };
  Brain.prototype.blending = function () { return this.now() - this.modeAt < T.BLEND_S; };
  Brain.prototype.base = function (m, t, still) {
    const p = Object.assign({}, REST, KEY[m]);
    if (!still) { const mo = MOTION[m](t); for (const k in mo) p[k] += mo[k]; }
    if (this.opts.modeYaw && !this.reduce) p.yaw += this.opts.modeYaw[m] || 0;
    return p;
  };
  /* el — элемент, относительно центра которого считается взгляд */
  Brain.prototype.pose = function (el) {
    const t = this.now(); const dt = this.lastT == null ? 0 : Math.min(0.1, t - this.lastT); this.lastT = t;
    const still = this.reduce || this.low;
    let p = this.base(this.mode, t, still);
    const k = smooth((t - this.modeAt) / (this.reduce ? 0.001 : T.BLEND_S));
    if (k < 1 && this.prevPose) { const q = this.prevPose; for (const key of KEYS) p[key] = lerp(q[key], p[key], k); }
    if (this.reduce) { const ro = RM_OPACITY[this.mode]; if (ro) Object.assign(p, ro(t)); }
    // фон и жесты (только full)
    if (!this.reduce) {
      const a = this.low ? 1 : (this.mode === 'idle' ? 1 : 0.35);
      const am = ambient(t, a); for (const key in am) p[key] += am[key];
    }
    if (!this.reduce && !this.low && this.mode === 'idle') {
      if (!this.gesture && t >= this.nextG) {
        const names = Object.keys(GESTURES).filter((n) => n !== this.lastG);
        let sum = names.reduce((s, n) => s + GESTURES[n].w, 0), r = Math.random() * sum, pick = names[0];
        for (const n of names) { r -= GESTURES[n].w; if (r <= 0) { pick = n; break; } }
        this.gesture = pick; this.gAt = t; this.lastG = pick;
      }
      if (this.gesture) {
        const G = GESTURES[this.gesture], g = t - this.gAt;
        if (g > G.dur) { this.gesture = null; this.nextG = t + rnd(...T.GESTURE_PAUSE); }
        else { const gp = G.f(g); for (const key in gp) p[key] += gp[key]; }
      }
    }
    // взгляд: курсор/палец → иначе блуждание (покой) → иначе центр (говорит/слушает: «на вас»)
    let tx = 0, ty = 0, follow = false;
    const pAge = (performance.now() - pointer.at) / 1000;
    if (!this.reduce && pointer.enabled && pAge < T.POINTER_IDLE_S && el) {
      const r = el.getBoundingClientRect();
      const dx = pointer.x - (r.left + r.width / 2), dy = pointer.y - (r.top + r.height * 0.42);
      const R = T.POINTER_RANGE_PX; tx = clamp(dx / R, -1, 1); ty = clamp(dy / R, -1, 1); follow = true;
    } else if (!still && (this.mode === 'idle')) {
      if (t >= this.nextLook) {
        this.lookT = Math.random() < T.LOOK_CENTER ? [0, 0] : [rnd(-0.8, 0.8), rnd(-0.5, 0.5)];
        this.nextLook = t + rnd(...T.LOOK_HOLD) + rnd(...T.LOOK_PAUSE);
      }
      tx = this.lookT[0]; ty = this.lookT[1];
    }
    const a1 = (dt > 0 && !this.reduce) ? 1 - Math.exp(-dt / T.LOOK_TAU) : 1, a2 = (dt > 0 && !this.reduce) ? 1 - Math.exp(-dt / T.HEAD_TAU) : 1;   // Reduce Motion: без плавного хода
    this.look[0] += (tx - this.look[0]) * a1; this.look[1] += (ty - this.look[1]) * a1;
    const hx = follow ? tx : 0, hy = follow ? ty : 0;
    this.head[0] += (hx - this.head[0]) * a2; this.head[1] += (hy - this.head[1]) * a2;
    const mk = (this.mode === 'think' || this.mode === 'search') ? 0.35 : 1; // в «думает»/«ищет» взгляд режима важнее
    p.lx = clamp(p.lx * (follow ? 0.3 : 1) + this.look[0] * mk, -1, 1);
    p.ly = clamp(p.ly * (follow ? 0.3 : 1) + this.look[1] * mk, -1, 1);
    p.yaw += this.head[0] * T.FOLLOW_YAW * mk; p.pitch += -this.head[1] * T.FOLLOW_PITCH * mk;
    // моргание
    if (t >= this.nextBlink) {
      this.blinkStart = t; this.dbl = !this.reduce && Math.random() < T.BLINK_DOUBLE;
      this.nextBlink = t + (this.reduce ? rnd(...T.BLINK_RM) : rnd(T.BLINK_MIN, T.BLINK_MAX) + (this.dbl ? 0.5 : 0));
    }
    const b = blinkAt(t - this.blinkStart, this.dbl);
    p.blink = b;                              // 0…1; RM рисует прозрачностью закрытого века
    if (!this.reduce) p.lid = Math.max(p.lid, b);
    if (this.override) Object.assign(p, this.override);   // только для превью «ключевая поза»
    this.lastPose = p; return p;
  };

  /* Цикл кадров с паузой: вне экрана, вкладка скрыта, вручную */
  function Loop(el, brain, draw) {
    this.el = el; this.brain = brain; this.draw = draw; this.paused = new Set(); this.last = 0; this.fps = 0; this.frames = 0; this.fpsAt = 0;
    const io = new IntersectionObserver((es) => { for (const e of es) e.isIntersecting ? this.resume('offscreen') : this.pause('offscreen'); });
    io.observe(el);
    document.addEventListener('visibilitychange', () => document.hidden ? this.pause('background') : this.resume('background'));
    this.tick = this.tick.bind(this); this.raf = requestAnimationFrame(this.tick);
  }
  Loop.prototype.pause = function (why) { this.paused.add(why); };
  Loop.prototype.resume = function (why) { const was = this.paused.size; this.paused.delete(why); if (was && !this.paused.size) { this.brain.prevPose = null; this.brain.nextG = this.brain.now() + 2; } };
  Loop.prototype.tick = function (ms) {
    this.raf = requestAnimationFrame(this.tick);
    if (this.paused.size) { this.fps = 0; return; }
    const hz = this.brain.hz(); if (ms - this.last < 1000 / hz - 2) return;
    this.last = ms; this.frames++;
    if (ms - this.fpsAt >= 1000) { this.fps = Math.round(this.frames * 1000 / (ms - this.fpsAt)); this.frames = 0; this.fpsAt = ms; }
    this.draw(this.brain.pose(this.el));
  };

  window.ParrloFront = { T, REST, KEY, MOTION, GESTURES, Brain, Loop, pointer, clamp, lerp, smooth };
})();
