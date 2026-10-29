/* Живой Парло — макет поведения (alive-parrlo). НЕ прод-код: справочная реализация для превью и для iOS-разработчика.
   Устроено как Paddy (MuratPod/padelada, src/features/paddy/alive/): поза — набор чисел, из позы считаются transform/opacity групп SVG.
   Анимируются ТОЛЬКО атрибуты transform и opacity у групп (<g>). d, fill, r и прочее не трогаются.
   Режимы: idle | think | search | joy | speak | listen. Уровни работы: full (30/15 к/с), lowPower (15 к/с, только фон и моргание),
   reduce (Reduce Motion: статичная поза, смена поз — кроссфейд прозрачности, моргание и реквизит — только прозрачностью), frozen (стоит). */
(function () {
  'use strict';

  /* ---------- числа (одна точка правды; README и таблица в index.html повторяют их) ---------- */
  const T = {
    BASE_PT: 104, SE_PT: 80, VIEW: 240, FIG_SCALE: 0.9,     // 1 ед. фигуры = 0.9 ед. viewBox = 0.9·104/240 = 0.39 pt при 104 pt
    HZ_FULL: 30, HZ_AMBIENT: 15, HZ_LOW: 15, HZ_REDUCE: 15,
    STATE_BLEND_S: 0.45,          // вход в режим / выход из режима
    GESTURE_IN_S: 0.2, GESTURE_OUT_S: 0.3, GESTURE_KILL_S: 0.25,
    AMB_BUSY: 0.35,               // доля фонового движения в think/search/joy/speak/listen
    LOOK_TAU_S: 0.07,             // сглаживание зрачка
    LOOK_MAX: 5,                  // ед. фигуры: предел хода зрачка в оправе (внутренний радиус оправы 19.5 − зрачок 12 = 7.5)
    BLINK: { close: 0.07, hold: 0.04, open: 0.11, double_gap: 0.29 },
    BLINK_MIN_S: 2.2, BLINK_MAX_S: 5.6, BLINK_DOUBLE: 0.18, BLINK_DOUBLE_EXTRA_S: 0.5,
    BLINK_REDUCE_MIN_S: 6, BLINK_REDUCE_MAX_S: 10,
    LOOK_PAUSE: [0.6, 3.0], LOOK_HOLD: [0.8, 2.2], LOOK_CENTER: 0.28, LOOK_RANGE: { x: 4, y: 2 },
    PAUSE: [3, 8], FIRST_PAUSE_S: 2, RESUME_PAUSE_S: 2, POST_BUSY_PAUSE_S: 1.6,
    REDUCE_FADE_S: 0.25,
    LID_OPEN: -26, LID_HALF: -15.1, LID_CLOSED: -3, CHEEK_HIDDEN: 3, CHEEK_JOY: -10,
  };
  const GESTURES = {
    peek:   { dur: 3.2, cooldown: 8,  weight: 4, title: 'Осмотреться' },
    nod:    { dur: 1.4, cooldown: 12, weight: 3, title: 'Кивок' },
    ruffle: { dur: 1.2, cooldown: 15, weight: 2, title: 'Встряхнуть хохолок' },
    wing:   { dur: 2.0, cooldown: 30, weight: 2, title: 'Помахать крылом' },
    hop:    { dur: 1.0, cooldown: 25, weight: 1, title: 'Подскок' },
  };
  const MODES = ['idle', 'think', 'search', 'joy', 'speak', 'listen'];

  /* ---------- поза ---------- */
  const REST = {
    lean: 0, lift: 0, bsx: 1, bsy: 1, wing: 0,
    hr: 0, hdx: 0, hdy: 0,
    cr: 0, c1: -14, c2: 2, c3: 18, cs: 1,
    beak: 0, bt: 0, bb: 0,
    lx: 0, ly: 0, ps: 1, gx: 0, gy: 0,
    lid: T.LID_OPEN, cheek: T.CHEEK_HIDDEN, lens: 0, lensR: 0,
    wr: 0, wr1: 1, wr2: 0.62, wrs: 1,
    wl: 0, wl1: 1, wl2: 0.62, wls: 1,
    dots: 0, d1: 0.55, d2: 0.77, d3: 0.99, ds1: 1, ds2: 1, ds3: 1,
  };
  const KEYS = Object.keys(REST);
  const KEY = {
    idle: {},
    // = persona/v1/speak.svg
    speak: { beak: 1, wr: 1 },
    // = persona/v1/listen.svg (гребень 40 → масштаб 40/34)
    listen: { lean: -7, c1: -22, c2: 0, c3: 22, cs: 40 / 34, ps: 1.125, wl: 1 },
    // = persona/v1/think.svg (гребень 28 → 28/34, веко полуприкрыто, блик спрятан под веком)
    think: { lean: 4, c1: -4, c2: 14, c3: 30, cs: 28 / 34, lid: T.LID_HALF, gx: 2, gy: -4, dots: 1 },
    // новые позы из тех же частей (в v1 их нет)
    search: { lean: 6, hr: 4, c1: -10, c2: 6, c3: 22, cs: 0.94, lx: 4, ly: 1.5, lens: 0.9 },
    joy: { lift: -6, c1: -24, c2: 0, c3: 24, cs: 1.15, beak: 1, bb: 4, cheek: T.CHEEK_JOY, wing: 16 },
  };
  function keyPose(m) { const p = Object.assign({}, REST, KEY[m]); return p; }

  /* ---------- математика ---------- */
  const TAU = Math.PI * 2;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => { const u = clamp(t); return u * u * (3 - 2 * u); };
  const sn = (t, period, ph = 0) => Math.sin(TAU * t / period + ph);
  /* пульс как у Paddy: полпериода sin², полпериода 0 */
  const pulse = (u) => { const v = ((u % 1) + 1) % 1; return v < 0.5 ? Math.pow(Math.sin(v * TAU), 2) : 0; };
  /* кусочная кривая: [время, значение, ease]; ease отрезка, который кончается в ключе: 0 in-out, 1 out, 2 in, 3 linear */
  function track(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const k = keys[i];
      if (t <= k[0]) {
        const p = keys[i - 1]; const u = (t - p[0]) / (k[0] - p[0]); const e = k[2] || 0;
        const w = e === 1 ? 1 - (1 - u) * (1 - u) : e === 2 ? u * u : e === 3 ? u : (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
        return lerp(p[1], k[1], w);
      }
    }
    return keys[keys.length - 1][1];
  }

  /* ---------- движение режимов: добавки к ключевой позе, t — секунды ---------- */
  const MOTION = {
    idle: () => ({}),
    think(t) {
      const tap = Math.pow(Math.max(0, Math.sin(TAU * 1.35 * t)), 2);
      const d = (i) => pulse(t / 1.26 - i / 3 + 0.25);
      return {
        hr: -3 + 1.5 * sn(t, 3.3), lean: 1.0 * sn(t, 5.2),
        lx: 1.5 + 1.0 * sn(t, 4.3), ly: -1.5 + 0.5 * sn(t, 2.9, 1),
        c3: 3 * tap,
        d1: 0.55 * (0.35 + 0.65 * d(0)), d2: 0.77 * (0.35 + 0.65 * d(1)), d3: 0.99 * (0.35 + 0.65 * d(2)),
        ds1: 0.85 + 0.15 * d(0), ds2: 0.85 + 0.15 * d(1), ds3: 0.85 + 0.15 * d(2),
      };
    },
    search(t) {
      const A = sn(t, 2.4); const sq = Math.tanh(4 * A) / Math.tanh(4);
      const ph = ((t / 1.2) % 1 + 1) % 1;
      return {
        hr: 5 * A, hdx: 3 * A, lx: 4.5 * sq - 4, ly: 0,
        lift: -1.5 * Math.abs(sn(t, 1.2)),
        c1: 3 * sn(t, 0.6), c2: 3 * sn(t, 0.6, -0.5), c3: 3 * sn(t, 0.6, -1),
        lensR: -100 + 100 * smooth(ph), lens: 0.9 * pulse(t / 1.2) - 0.9,
      };
    },
    joy(t) {
      const s = Math.abs(Math.sin(TAU * 1.1 * t)); const f = sn(t * 2.2, 1);
      return {
        lift: -7 * s, bsy: 0.02 * s, bsx: -0.01 * s, lean: 3 * sn(t, 2.4),
        wing: 10 * f, c1: 4 * sn(t * 2.2, 1), c2: 4 * sn(t * 2.2, 1, -0.7), c3: 4 * sn(t * 2.2, 1, -1.4),
        bb: 3 * f,
      };
    },
    speak(t) {
      const env = 0.6 + 0.4 * sn(t, 1.3); const o = Math.max(0, Math.sin(TAU * 4.2 * t)) * env;
      return {
        bb: -3 + 13 * o, bt: -2.5 * o, hr: 1.5 * sn(t, 1 / 2.1), lean: 0.6 * sn(t, 3.1),
        wr1: -1 + (0.4 + 0.6 * pulse(t / 0.9)), wr2: -0.62 + 0.62 * (0.4 + 0.6 * pulse(t / 0.9 - 0.17)),
        wrs: -0.04 + 0.06 * pulse(t / 0.9),
      };
    },
    listen(t) {
      return {
        hr: -2 + 1.2 * sn(t, 2.8),
        wl2: -0.62 + 0.62 * (0.4 + 0.6 * pulse(t / 1.4)), wl1: -1 + (0.4 + 0.6 * pulse(t / 1.4 - 0.2)),
        wls: 0.04 - 0.06 * pulse(t / 1.4),
        c1: 1.5 * sn(t, 1.9), c2: 1.5 * sn(t, 1.9, -0.5), c3: 1.5 * sn(t, 1.9, -1),
      };
    },
  };
  /* Reduce Motion: только прозрачность реквизита (без масштаба и сдвигов) */
  const REDUCE_OPACITY = {
    think: (t) => { const d = (i) => pulse(t / 1.6 - i / 3 + 0.25); return { d1: 0.55 * (0.35 + 0.65 * d(0)), d2: 0.77 * (0.35 + 0.65 * d(1)), d3: 0.99 * (0.35 + 0.65 * d(2)) }; },
    speak: (t) => ({ wr1: 0.4 + 0.6 * pulse(t / 1.2), wr2: 0.62 * (0.4 + 0.6 * pulse(t / 1.2 - 0.17)) }),
    listen: (t) => ({ wl2: 0.62 * (0.4 + 0.6 * pulse(t / 1.6)), wl1: 0.4 + 0.6 * pulse(t / 1.6 - 0.2) }),
    search: (t) => ({ lens: 0.3 + 0.6 * pulse(t / 1.6) }),
    idle: () => ({}), joy: () => ({}),
  };

  /* фон: дыхание, покачивание, хохолок, крыло — добавки, amb 0…1 */
  function ambient(t, amb, look) {
    const br = sn(t, 3.6);
    return {
      bsy: 0.012 * br * amb, bsx: -0.006 * br * amb, hdy: -1.2 * br * amb,
      hr: (1.5 * sn(t, 6.7) + 0.8 * sn(t, 2.9) + 0.5 * look[0]) * amb,
      hdx: 0.4 * look[0] * amb,
      lean: 0.8 * sn(t, 5.3) * amb,
      c1: 2 * sn(t, 2.3) * amb, c2: 2 * sn(t, 2.3, -0.6) * amb, c3: 2 * sn(t, 2.3, -1.2) * amb,
      wing: 1.5 * sn(t, 3.6, 1) * amb,
      lx: look[0] * amb, ly: look[1] * amb,
    };
  }

  /* жесты покоя: добавки, gt — секунды от старта жеста */
  const GESTURE_POSE = {
    peek(gt) {
      const lx = track(gt, [[0, 0], [0.4, 0], [0.6, -5, 1], [1.3, -5], [1.5, 5, 1], [2.2, 5], [2.4, 0, 1], [3.2, 0]]);
      const ly = track(gt, [[0, 0], [2.3, 0], [2.5, -3, 1], [2.95, -3], [3.15, 0, 1]]);
      return { lx, ly, hr: lx * 0.8 - ly * 0.6, hdx: lx * 0.6, blinkAt: 1.35 };
    },
    nod(gt) {
      const h = track(gt, [[0, 0], [0.22, 7, 1], [0.45, -1], [0.7, 5, 1], [0.95, 0], [1.4, 0]]);
      return { hr: h, c1: -0.6 * h, c2: -0.6 * h, c3: -0.6 * h, hdy: 0.15 * h };
    },
    ruffle(gt) {
      const env = track(gt, [[0, 0], [0.1, 1], [0.9, 1], [1.2, 0]]); const dec = Math.exp(-1.5 * gt);
      return {
        c1: 9 * env * dec * Math.sin(TAU * 6 * gt), c2: 9 * env * dec * Math.sin(TAU * 6 * gt + 1), c3: 9 * env * dec * Math.sin(TAU * 6 * gt + 2),
        cs: 0.12 * env, bsx: 0.01 * env * Math.sin(TAU * 8 * gt),
      };
    },
    wing(gt) {
      const k = track(gt, [[0, 0], [0.3, 1, 1], [1.6, 1], [2.0, 0, 2]]);
      return { wing: (32 + 8 * Math.sin(TAU * 3 * gt)) * k, hr: 5 * k, lean: 1.5 * k };
    },
    hop(gt) {
      const lift = track(gt, [[0, 0], [0.12, 1.5], [0.34, -10, 1], [0.56, 0, 2], [0.66, 1], [0.8, 0]]);
      const sy = track(gt, [[0, 0], [0.12, -0.04], [0.2, 0.03], [0.5, 0.02], [0.56, -0.03], [0.7, 0]]);
      return { lift, bsy: sy, bsx: -0.5 * sy, wing: 10 * smooth(-lift / 10) };
    },
  };

  function blinkAt(u, dbl) {
    const B = T.BLINK; const tot = B.close + B.hold + B.open;
    const one = (v) => v < 0 ? 0 : v < B.close ? v / B.close : v < B.close + B.hold ? 1 : v < tot ? 1 - (v - B.close - B.hold) / B.open : 0;
    if (u < 0) return 0;
    if (u < tot) return one(u);
    if (dbl && u >= B.double_gap && u < B.double_gap + tot) return one(u - B.double_gap);
    return 0;
  }

  /* ---------- применение позы к SVG ---------- */
  const f = (x) => (Math.round(x * 1000) / 1000).toString();
  function about(cx, cy, sx, sy) { return `translate(${cx} ${cy}) scale(${f(sx)} ${f(sy)}) translate(${-cx} ${-cy})`; }
  function crestT(a, s) { return `rotate(${f(a)} 90 54) ${about(90, 56, 1, s)}`; }

  function bind(svg) {
    const g = {};
    svg.querySelectorAll('[data-part]').forEach((el) => { g[el.getAttribute('data-part')] = el; });
    const last = new Map();
    const set = (el, attr, v) => { const k = el; let m = last.get(k); if (!m) { m = {}; last.set(k, m); } if (m[attr] !== v) { m[attr] = v; el.setAttribute(attr, v); } };
    function apply(p, onlyOpacity) {
      const o = (name, v) => set(g[name], 'opacity', f(clamp(v)));
      if (!onlyOpacity) {
        set(g.lean, 'transform', `translate(0 ${f(p.lift)}) rotate(${f(p.lean)} 110 170)`);
        set(g.body, 'transform', about(104, 270, p.bsx, p.bsy));
        set(g.wing, 'transform', `rotate(${f(p.wing)} 134 187)`);
        set(g.head, 'transform', `translate(${f(p.hdx)} ${f(p.hdy)}) rotate(${f(p.hr)} 110 150)`);
        set(g.crest, 'transform', `rotate(${f(p.cr)} 90 56)`);
        set(g['crest-1'], 'transform', crestT(p.c1, p.cs));
        set(g['crest-2'], 'transform', crestT(p.c2, p.cs));
        set(g['crest-3'], 'transform', crestT(p.c3, p.cs));
        set(g['beak-top'], 'transform', `rotate(${f(p.bt)} 162 83)`);
        set(g['beak-bottom'], 'transform', `rotate(${f(p.bb)} 162 121)`);
        let lx = p.lx, ly = p.ly; const l = Math.hypot(lx, ly); if (l > T.LOOK_MAX) { lx *= T.LOOK_MAX / l; ly *= T.LOOK_MAX / l; }
        set(g.eye, 'transform', `translate(${f(lx)} ${f(ly)})`);
        set(g.pupil, 'transform', about(128, 96, p.ps, p.ps));
        set(g['eye-glint'], 'transform', `translate(${f(p.gx)} ${f(p.gy)})`);
        set(g.lid, 'transform', `translate(0 ${f(p.lid)})`);
        set(g.cheek, 'transform', `translate(0 ${f(p.cheek)})`);
        set(g['lens-glint'], 'transform', `rotate(${f(p.lensR)} 128 96)`);
        set(g['waves-r'], 'transform', about(188, 126, p.wrs, p.wrs));
        set(g['waves-l'], 'transform', about(46, 112, p.wls, p.wls));
        set(g['dot-1'], 'transform', about(140, 66, p.ds1, p.ds1));
        set(g['dot-2'], 'transform', about(155, 53, p.ds2, p.ds2));
        set(g['dot-3'], 'transform', about(170, 40, p.ds3, p.ds3));
      }
      o('beak-closed', 1 - p.beak); o('beak-open', p.beak);
      o('lens-glint', p.lens);
      o('lid-closed', p.lidClosed || 0);
      o('waves-r', p.wr); o('wave-r-1', p.wr1); o('wave-r-2', p.wr2);
      o('waves-l', p.wl); o('wave-l-1', p.wl1); o('wave-l-2', p.wl2);
      o('dots', p.dots); o('dot-1', p.d1); o('dot-2', p.d2); o('dot-3', p.d3);
    }
    return { apply, parts: g };
  }

  /* ---------- планировщик (по образцу paddyScheduler.ts) ---------- */
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pickGesture(now, last, started) {
    const cand = Object.keys(GESTURES).filter((k) => k !== last && now - (started[k] ?? -1e9) >= GESTURES[k].cooldown);
    if (!cand.length) return null;
    let x = Math.random() * cand.reduce((s, k) => s + GESTURES[k].weight, 0);
    for (const k of cand) { x -= GESTURES[k].weight; if (x <= 0) return k; }
    return cand[0];
  }

  /* ---------- экземпляр: два слоя SVG (для кроссфейда Reduce Motion) ---------- */
  function mount(host, svgText, opts = {}) {
    host.classList.add('pa-host');
    const mk = () => { const d = document.createElement('div'); d.className = 'pa-layer'; d.innerHTML = svgText; const s = d.querySelector('svg');
      // уникальные id для clipPath в каждом экземпляре
      const uid = 'pa' + Math.random().toString(36).slice(2, 8);
      s.querySelectorAll('[id]').forEach((el) => { el.id = uid + '-' + el.id; });
      s.querySelectorAll('[clip-path]').forEach((el) => { el.setAttribute('clip-path', el.getAttribute('clip-path').replace('url(#', 'url(#' + uid + '-')); });
      s.removeAttribute('width'); s.removeAttribute('height'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
      host.appendChild(d); return { el: d, rig: bind(s) }; };
    const A = mk(); const B = mk(); B.el.style.opacity = '0';
    let front = A, back = B;

    const st = {
      mode: opts.mode || 'idle', lowPower: false, reduce: false, pausedFlags: { offscreen: false, background: false, blurred: false, manual: false },
      w: Object.fromEntries(MODES.map((m) => [m, m === (opts.mode || 'idle') ? 1 : 0])),
      t0: performance.now(), last: 0, raf: 0, lastDraw: 0,
      gesture: null, gStart: 0, gAlive: 1, lastGesture: null, started: {}, nextGestureAt: T.FIRST_PAUSE_S, grin: false,
      blinkStart: -10, blinkDbl: false, nextBlinkAt: rnd(T.BLINK_MIN_S, T.BLINK_MAX_S),
      look: [0, 0], lookTarget: [0, 0], nextLookAt: rnd(...T.LOOK_PAUSE), gestureBlinkDone: false,
      fps: 0, frames: 0, fpsT: performance.now(), run: 'full', hz: 30,
    };
    const listeners = new Set();
    const now = () => (performance.now() - st.t0) / 1000;
    const frozen = () => Object.values(st.pausedFlags).some(Boolean);

    function runLevel() { if (frozen()) return 'frozen'; if (st.reduce) return 'reduce'; if (st.lowPower) return 'lowPower'; return 'full'; }
    function hzFor(run) {
      if (run === 'frozen') return 0; if (run === 'reduce') return T.HZ_REDUCE; if (run === 'lowPower') return T.HZ_LOW;
      return st.mode !== 'idle' || st.gesture || Object.entries(st.w).some(([m, v]) => m !== 'idle' && v > 0) ? T.HZ_FULL : T.HZ_AMBIENT;
    }

    function schedule(t, run) {
      // моргание
      if (t >= st.nextBlinkAt) {
        const dbl = run !== 'reduce' && Math.random() < T.BLINK_DOUBLE;
        st.blinkStart = t; st.blinkDbl = dbl;
        st.nextBlinkAt = t + (run === 'reduce' ? rnd(T.BLINK_REDUCE_MIN_S, T.BLINK_REDUCE_MAX_S) : rnd(T.BLINK_MIN_S, T.BLINK_MAX_S)) + (dbl ? T.BLINK_DOUBLE_EXTRA_S : 0);
      }
      // взгляды (фон): в full и lowPower
      if (run !== 'reduce' && t >= st.nextLookAt) {
        const c = Math.random() < T.LOOK_CENTER;
        st.lookTarget = c ? [0, 0] : [(Math.random() * 2 - 1) * T.LOOK_RANGE.x, (Math.random() * 2 - 1) * T.LOOK_RANGE.y];
        st.nextLookAt = t + rnd(...T.LOOK_HOLD) + rnd(...T.LOOK_PAUSE);
      }
      // жесты: только full и только в покое
      if (st.gesture && t - st.gStart >= GESTURES[st.gesture].dur) st.gesture = null;
      if (run === 'full' && st.mode === 'idle' && !st.gesture && t >= st.nextGestureAt) {
        const gname = st.grin ? 'nod' : pickGesture(t, st.lastGesture, st.started);
        st.grin = false;
        if (gname) startGesture(gname, t); else st.nextGestureAt = t + rnd(...T.PAUSE);
      }
    }
    function startGesture(name, t) {
      st.gesture = name; st.gStart = t; st.gAlive = 1; st.lastGesture = name; st.started[name] = t; st.gestureBlinkDone = false;
      st.nextGestureAt = t + GESTURES[name].dur + rnd(...T.PAUSE);
    }

    function computePose(t, dt, run) {
      const p = Object.assign({}, REST);
      const step = dt / T.STATE_BLEND_S;
      for (const m of MODES) { const tgt = m === st.mode ? 1 : 0; st.w[m] = st.w[m] < tgt ? Math.min(tgt, st.w[m] + step) : Math.max(tgt, st.w[m] - step); }
      const sum = MODES.reduce((s, m) => s + smooth(st.w[m]), 0) || 1;
      const still = run === 'lowPower';
      for (const m of MODES) {
        const w = smooth(st.w[m]) / sum; if (w <= 0) continue;
        const kp = KEY[m]; const mo = still ? {} : MOTION[m](t);
        for (const k of KEYS) { const v = (kp[k] ?? REST[k]) + (mo[k] ?? 0); p[k] += (v - REST[k]) * w; }
      }
      // фон
      const kz = 1 - Math.exp(-dt / T.LOOK_TAU_S);
      st.look[0] = lerp(st.look[0], st.lookTarget[0], kz); st.look[1] = lerp(st.look[1], st.lookTarget[1], kz);
      const idleW = smooth(st.w.idle) / sum;
      const amb = still ? 1 : idleW + T.AMB_BUSY * (1 - idleW);
      let gw = 0, gp = null;
      if (st.gesture) {
        if (st.mode !== 'idle') st.gAlive = Math.max(0, st.gAlive - dt / T.GESTURE_KILL_S);
        const gt = t - st.gStart; const d = GESTURES[st.gesture].dur;
        gw = smooth(gt / T.GESTURE_IN_S) * smooth((d - gt) / T.GESTURE_OUT_S) * st.gAlive * idleW;
        gp = GESTURE_POSE[st.gesture](gt);
        if (gp.blinkAt && !st.gestureBlinkDone && gt >= gp.blinkAt) { st.gestureBlinkDone = true; st.blinkStart = t; st.blinkDbl = false; }
      }
      const ambAmt = amb * (1 - 0.75 * gw);
      const a = ambient(t, ambAmt, st.look);
      for (const k in a) p[k] += a[k];
      if (gp && gw > 0) for (const k in gp) if (k in REST) p[k] += gp[k] * gw;
      const b = blinkAt(t - st.blinkStart, st.blinkDbl);
      p.lid = lerp(p.lid, T.LID_CLOSED, b);
      return p;
    }

    function reducePose(t) {
      const p = keyPose(st.mode);
      Object.assign(p, REDUCE_OPACITY[st.mode](t));
      p.lidClosed = blinkAt(t - st.blinkStart, false);
      return p;
    }

    function crossfadeTo(fn) {
      // готовим задний слой и меняем слои прозрачностью
      fn(back.rig);
      back.el.style.transition = front.el.style.transition = `opacity ${T.REDUCE_FADE_S}s ease-in-out`;
      back.el.style.opacity = '1'; front.el.style.opacity = '0';
      const tmp = front; front = back; back = tmp;
    }

    function frame(ts) {
      st.raf = 0;
      const run = runLevel(); st.run = run;
      if (run === 'frozen') { emit(); return; }
      const hz = hzFor(run); st.hz = hz;
      const tnow = now();
      if (st.lastDraw && (ts - st.lastDraw) < 1000 / hz - 4) { st.raf = requestAnimationFrame(frame); return; }
      const dt = st.last ? clamp(tnow - st.last, 0, 0.1) : 0.016; st.last = tnow; st.lastDraw = ts;
      schedule(tnow, run);
      if (run === 'reduce') {
        // Reduce Motion: в покое и радости кроме моргания ничего не меняется — между морганиями кадры не рисуем (в приложении цикл выключен, будит таймер моргания)
        const quiet = (st.mode === 'idle' || st.mode === 'joy') && tnow - st.blinkStart > 0.45;
        st.hz = quiet ? 0 : hz;
        if (quiet) { st.raf = requestAnimationFrame(frame); if (ts - st.fpsT >= 1000) { st.fps = 0; st.frames = 0; st.fpsT = ts; emit(); } return; }
        front.rig.apply(reducePose(tnow), true);
      }
      else front.rig.apply(computePose(tnow, dt, run), false);
      st.frames++;
      if (ts - st.fpsT >= 1000) { st.fps = Math.round(st.frames * 1000 / (ts - st.fpsT)); st.frames = 0; st.fpsT = ts; emit(); }
      st.raf = requestAnimationFrame(frame);
    }
    function kick() { if (!st.raf) { st.fpsT = performance.now(); st.frames = 0; st.raf = requestAnimationFrame(frame); } emit(); }
    function emit() { listeners.forEach((fn) => fn(api.status())); }

    function resume() {
      // возврат из заморозки: поза сразу целевая, жест сброшен, взгляд по центру, первый жест через 2 с
      const t = now();
      MODES.forEach((m) => { st.w[m] = m === st.mode ? 1 : 0; });
      st.gesture = null; st.look = [0, 0]; st.lookTarget = [0, 0]; st.nextGestureAt = t + T.RESUME_PAUSE_S; st.last = 0; st.lastDraw = 0;
      if (st.reduce) front.rig.apply(Object.assign(keyPose(st.mode), { lidClosed: 0 }), false);
    }

    const api = {
      setMode(m) {
        if (!MODES.includes(m) || m === st.mode) return;
        const prev = st.mode; st.mode = m; const t = now();
        if (m !== 'idle') { st.grin = false; } else { st.nextGestureAt = t + (prev === 'joy' ? T.FIRST_PAUSE_S : T.POST_BUSY_PAUSE_S); st.grin = prev !== 'joy'; }
        if (st.reduce) { MODES.forEach((k) => { st.w[k] = k === m ? 1 : 0; }); crossfadeTo((rig) => rig.apply(Object.assign(keyPose(m), { lidClosed: 0 }), false)); }
        kick();
      },
      setLowPower(v) { st.lowPower = !!v; if (v) st.gesture = null; kick(); },
      setReduce(v) {
        v = !!v; if (v === st.reduce) return; st.reduce = v; st.gesture = null;
        const t = now();
        if (v) { st.nextBlinkAt = t + rnd(T.BLINK_REDUCE_MIN_S, T.BLINK_REDUCE_MAX_S); MODES.forEach((k) => { st.w[k] = k === st.mode ? 1 : 0; });
          crossfadeTo((rig) => rig.apply(Object.assign(keyPose(st.mode), { lidClosed: 0 }), false)); }
        else { st.last = 0; st.nextBlinkAt = t + rnd(T.BLINK_MIN_S, T.BLINK_MAX_S);
          crossfadeTo((rig) => rig.apply(computePose(t, 0.016, st.lowPower ? 'lowPower' : 'full'), false)); }
        kick();
      },
      setPaused(flag, v) {
        const was = frozen(); st.pausedFlags[flag] = !!v; const is = frozen();
        if (was && !is) resume();
        if (is && st.gesture) st.gesture = null;
        kick();
      },
      playGesture(name) { if (GESTURES[name] && st.mode === 'idle' && runLevel() === 'full') { startGesture(name, now()); kick(); } },
      status() { return { mode: st.mode, run: st.run, hz: st.run === 'frozen' ? 0 : st.hz, fps: st.run === 'frozen' ? 0 : st.fps, gesture: st.gesture, paused: Object.entries(st.pausedFlags).filter(([, v]) => v).map(([k]) => k) }; },
      onStatus(fn) { listeners.add(fn); fn(api.status()); return () => listeners.delete(fn); },
      /* для проверки: статичная ключевая поза в обоих слоях без анимации */
      showKeyPose(m) { st.pausedFlags.manual = true; A.rig.apply(Object.assign(keyPose(m), { lidClosed: 0 }), false); A.el.style.opacity = '1'; B.el.style.opacity = '0'; front = A; back = B; },
    };
    // за краем экрана → стоп (IntersectionObserver; root — ближайший скролл-контейнер, если передан)
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => api.setPaused('offscreen', !e.isIntersecting)), { root: opts.scrollRoot || null, threshold: 0 });
      io.observe(host);
    }
    front.rig.apply(keyPose(st.mode), false); back.rig.apply(keyPose(st.mode), false);
    kick();
    return api;
  }

  window.ParrloAlive = { mount, T, GESTURES, MODES, KEY, REST, keyPose, bind };
})();
