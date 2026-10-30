/* Вариант A «Мягкий объём 2.5D» и вариант C «Поворот к вам» — SVG-слои.
   Голова — шар R 60 с центром (120, 104) во viewBox 240. Детали лица лежат на шаре (азимут/высота),
   каждый кадр их положение и сжатие считаются проекцией по yaw/pitch головы. Меняются только transform и opacity групп. */
(function () {
  'use strict';
  const F = window.ParrloFront; const D = Math.PI / 180;
  const H = { x: 120, y: 104, R: 60 };
  const C = { head: '#00A86B', headHi: '#2FCB8E', headLo: '#007A4E', wing: '#0A7048', wingLo: '#075238',
    c1: '#0B8F5E', c2: '#1DB37A', c3: '#00A86B', beak: '#FFC247', beakHi: '#FFDA7A', beakLo: '#EFA232', beakLow: '#E59A35',
    mouth: '#4A2320', ring: '#BFF2DC', pupil: '#0E1116', disc: '#173A2E', lidLine: '#0A7048' };
  let uid = 0;

  function rigSVG(P) {
    const eye = (s) => `
      <g id="${P}eye-${s}" data-part="eye-${s}">
        <g id="${P}pupil-${s}" data-part="pupil-${s}">
          <circle r="11.5" fill="${C.pupil}"/>
          <circle cx="4.2" cy="-4.2" r="3.6" fill="#fff"/>
          <circle cx="-3.2" cy="3.6" r="1.4" fill="#fff" opacity=".6"/>
          <g clip-path="url(#${P}pc)">
            <g id="${P}lid-${s}" data-part="lid-${s}" transform="translate(0 -12)"><rect x="-14" y="-26" width="28" height="26" fill="${C.head}"/><path d="M-12 0 H12" stroke="${C.lidLine}" stroke-width="2.4" stroke-linecap="round"/></g>
            <g id="${P}lidc-${s}" data-part="lid-closed-${s}" opacity="0"><rect x="-14" y="-14" width="28" height="16" fill="${C.head}"/><path d="M-11 1.5 Q0 5 11 1.5" fill="none" stroke="${C.lidLine}" stroke-width="2.4" stroke-linecap="round"/><rect x="-14" y="1.5" width="28" height="14" fill="${C.head}"/></g>
          </g>
        </g>
        <g id="${P}happy-${s}" data-part="happy-${s}" opacity="0"><path d="M-8.5 3.5 Q0 -7.5 8.5 3.5" fill="none" stroke="${C.pupil}" stroke-width="4.2" stroke-linecap="round"/></g>
        <circle r="17" fill="${C.ring}" opacity=".09"/>
        <g id="${P}glint-${s}" data-part="lens-glint-${s}" opacity="0"><path d="M4.8 -13.4 A14.2 14.2 0 0 1 13.4 -4.8" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g>
        <circle r="19" fill="none" stroke="${C.ring}" stroke-width="4.6"/>
        <path d="M-17.3 -7.8 A19 19 0 0 1 -7.8 -17.3" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>
      </g>`;
    const feather = (i, L, col) => `<g id="${P}crest-${i}" data-part="crest-${i}"><rect x="-6.5" y="${-L}" width="13" height="${L + 10}" rx="6.5" fill="${col}"/></g>`;
    return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
  <defs>
    <clipPath id="${P}disc"><circle cx="120" cy="120" r="120"/></clipPath>
    <clipPath id="${P}pc"><circle r="11.5"/></clipPath>
    <radialGradient id="${P}gbg" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#21513F"/><stop offset="1" stop-color="${C.disc}"/></radialGradient>
    <radialGradient id="${P}ghead" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="${C.headHi}"/><stop offset=".5" stop-color="${C.head}"/><stop offset="1" stop-color="${C.headLo}"/></radialGradient>
    <radialGradient id="${P}gbody" cx=".4" cy=".28" r=".8"><stop offset="0" stop-color="#16B97C"/><stop offset=".55" stop-color="${C.head}"/><stop offset="1" stop-color="#006B44"/></radialGradient>
    <radialGradient id="${P}gbelly" cx=".5" cy=".35" r=".6"><stop offset="0" stop-color="#3ED39A" stop-opacity=".55"/><stop offset="1" stop-color="#3ED39A" stop-opacity="0"/></radialGradient>
    <linearGradient id="${P}gwing" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0D7E52"/><stop offset="1" stop-color="${C.wingLo}"/></linearGradient>
    <linearGradient id="${P}gbeak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.beakHi}"/><stop offset=".45" stop-color="${C.beak}"/><stop offset="1" stop-color="${C.beakLo}"/></linearGradient>
    <radialGradient id="${P}gshade" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="#003D27" stop-opacity=".55"/><stop offset="1" stop-color="#003D27" stop-opacity="0"/></radialGradient>
  </defs>
  <g clip-path="url(#${P}disc)">
    <circle data-part="bg" cx="120" cy="120" r="120" fill="url(#${P}gbg)"/>
    <g id="${P}dots" data-part="dots">
      <circle id="${P}dot-1" data-part="dot-1" cx="168" cy="50" r="4.6" fill="${C.ring}" opacity="0"/>
      <circle id="${P}dot-2" data-part="dot-2" cx="183" cy="35" r="6.2" fill="${C.ring}" opacity="0"/>
      <circle id="${P}dot-3" data-part="dot-3" cx="200" cy="20" r="7.8" fill="${C.ring}" opacity="0"/>
    </g>
    <g id="${P}body" data-part="body" data-pivot="120 258">
      <ellipse cx="120" cy="200" rx="68" ry="60" fill="url(#${P}gbody)"/>
      <g id="${P}belly" data-part="belly"><ellipse cx="0" cy="0" rx="40" ry="38" fill="url(#${P}gbelly)"/></g>
      <ellipse cx="120" cy="150" rx="52" ry="22" fill="url(#${P}gshade)"/>
      <g id="${P}wing-l" data-part="wing-l" data-pivot="shoulder"><ellipse cx="0" cy="32" rx="17" ry="35" fill="url(#${P}gwing)"/></g>
      <g id="${P}wing-r" data-part="wing-r" data-pivot="shoulder"><ellipse cx="0" cy="32" rx="17" ry="35" fill="url(#${P}gwing)"/></g>
    </g>
    <g id="${P}head" data-part="head" data-pivot="120 160">
      <g id="${P}crest" data-part="crest">
        ${feather(1, 36, C.c1)}${feather(3, 36, C.c3)}${feather(2, 44, C.c2)}
      </g>
      <circle data-part="head-shape" cx="${H.x}" cy="${H.y}" r="${H.R}" fill="url(#${P}ghead)"/>
      <g id="${P}temple-l" data-part="temple-l"><rect x="0" y="-2.3" width="1" height="4.6" fill="${C.ring}"/></g>
      <g id="${P}temple-r" data-part="temple-r"><rect x="0" y="-2.3" width="1" height="4.6" fill="${C.ring}"/></g>
      ${eye('l')}${eye('r')}
      <g id="${P}bridge" data-part="bridge"><path d="M0 -2.3 Q.5 -8.5 1 -2.3 V2.3 Q.5 -3.9 0 2.3 Z" fill="${C.ring}"/></g>
      <g id="${P}beak" data-part="beak">
        <g id="${P}mouth" data-part="mouth" transform="scale(1 0)"><ellipse cx="0" cy="13" rx="11.5" ry="10.5" fill="${C.mouth}"/></g>
        <g id="${P}beak-low" data-part="beak-bottom"><path d="M-13 4 Q0 9 13 4 Q11 19 0 24 Q-11 19 -13 4 Z" fill="${C.beakLow}"/></g>
        <g id="${P}beak-up" data-part="beak-top"><path d="M-19 -9 Q0 -21 19 -9 Q18.5 7 0 18.5 Q-18.5 7 -19 -9 Z" fill="url(#${P}gbeak)"/>
          <circle cx="-5.2" cy="-8" r="1.7" fill="#D88E28"/><circle cx="5.2" cy="-8" r="1.7" fill="#D88E28"/>
          <ellipse cx="-7" cy="-11.5" rx="5" ry="2.2" fill="#fff" opacity=".35"/></g>
      </g>
    </g>
  </g>
</svg>`;
  }

  /* проекция точки шара (az, el — °, k — доля радиуса) при повороте головы */
  function proj(az, el, k, yaw, pitch, R = H.R) {
    const a = az * D, e = el * D, y_ = yaw * D, p_ = pitch * D;
    let x = Math.cos(e) * Math.sin(a), y = -Math.sin(e), z = Math.cos(e) * Math.cos(a);
    const x1 = x * Math.cos(y_) + z * Math.sin(y_), z1 = -x * Math.sin(y_) + z * Math.cos(y_);
    const y2 = y * Math.cos(p_) - z1 * Math.sin(p_), z2 = y * Math.sin(p_) + z1 * Math.cos(p_);
    return { x: H.x + x1 * R * k, y: H.y + y2 * R * k, nx: x1, ny: y2, nz: z2 };
  }
  /* плоская деталь, касательная к шару: сжатие вдоль (nx, ny) на nz */
  function squash(q, s = 1) {
    const L = Math.hypot(q.nx, q.ny), nz = Math.max(0.02, q.nz);
    if (L < 1e-4) return `matrix(${s} 0 0 ${s} ${q.x.toFixed(2)} ${q.y.toFixed(2)})`;
    const ux = q.nx / L, uy = q.ny / L, f = nz - 1;
    const a = (1 + f * ux * ux) * s, b = f * ux * uy * s, d = (1 + f * uy * uy) * s;
    return `matrix(${a.toFixed(4)} ${b.toFixed(4)} ${b.toFixed(4)} ${d.toFixed(4)} ${q.x.toFixed(2)} ${q.y.toFixed(2)})`;
  }
  /* отрезок A→B: единичная ось x → (B − A), ось y — единичная перпендикулярная */
  function seg(A, B) {
    const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1;
    return `matrix(${dx.toFixed(3)} ${dy.toFixed(3)} ${(-dy / L).toFixed(4)} ${(dx / L).toFixed(4)} ${A.x.toFixed(2)} ${A.y.toFixed(2)})`;
  }
  const EYE = { az: 26, el: 6 };

  function Rig(svgRoot, P) {
    this.el = {}; this.cache = {};
    svgRoot.querySelectorAll('[id^="' + P + '"]').forEach((n) => { this.el[n.id.slice(P.length)] = n; });
  }
  Rig.prototype.set = function (id, attr, v) {
    const key = id + attr; if (this.cache[key] === v) return; this.cache[key] = v; this.el[id].setAttribute(attr, v);
  };
  Rig.prototype.apply = function (p, rm) {
    const s = this, yaw = p.yaw, pitch = p.pitch;
    const by = yaw * 0.5;
    // тело
    s.set('body', 'transform', `translate(0 ${(p.lift * 0.6).toFixed(2)}) rotate(${(p.roll * 0.25).toFixed(2)} 120 258) translate(120 258) scale(1 ${p.sy.toFixed(4)}) translate(-120 -258)`);
    s.set('belly', 'transform', `translate(${(120 + 40 * Math.sin(by * D)).toFixed(2)} 206)`);
    const wing = (side, w) => {
      const az = side * 76 + by, z = Math.cos(az * D);
      const x = 120 + 63 * Math.sin(az * D);
      const base = side < 0 ? -10 : 10, rot = side < 0 ? base + w : base - w;
      s.set('wing-' + (side < 0 ? 'l' : 'r'), 'transform', `translate(${x.toFixed(2)} 160) rotate(${rot.toFixed(2)}) scale(${(0.55 + 0.45 * Math.abs(Math.sin(az * D))).toFixed(3)} 1)`);
      s.set('wing-' + (side < 0 ? 'l' : 'r'), 'opacity', F.clamp((z + 0.05) / 0.2).toFixed(3));
    };
    wing(-1, p.wl); wing(1, p.wr);
    // голова целиком: подскок + наклон (roll) вокруг «шеи»
    s.set('head', 'transform', `translate(0 ${p.lift.toFixed(2)}) rotate(${p.roll.toFixed(2)} 120 160)`);
    // гребень: основание на макушке, перья веером
    const cr = proj(0, 74, 0.94, yaw, pitch);
    s.set('crest', 'transform', `translate(${cr.x.toFixed(2)} ${cr.y.toFixed(2)}) scale(${(0.75 + 0.25 * Math.abs(Math.cos(yaw * D))).toFixed(3)} 1)`);
    [p.c1, p.c2, p.c3].forEach((c, i) => s.set('crest-' + (i + 1), 'transform', `rotate(${c.toFixed(2)}) scale(1 ${p.cs.toFixed(3)})`));
    // глаза
    ['l', 'r'].forEach((e, i) => {
      const sg = i ? 1 : -1;
      const q = proj(sg * EYE.az, EYE.el, 1.02, yaw, pitch);
      s.set('eye-' + e, 'transform', squash(q));
      s.set('eye-' + e, 'opacity', F.clamp((q.nz - 0.3) / 0.15).toFixed(3));
      s.set('pupil-' + e, 'transform', `translate(${(p.lx * 4.2).toFixed(2)} ${(p.ly * 3.6).toFixed(2)}) scale(${p.ps.toFixed(3)})`);
      s.set('lid-' + e, 'transform', `translate(0 ${(-12 + 24 * F.clamp(p.lid)).toFixed(2)})`);
      s.set('lidc-' + e, 'opacity', rm ? p.blink.toFixed(3) : '0');
      s.set('happy-' + e, 'opacity', F.clamp(p.happy).toFixed(3)); s.set('pupil-' + e, 'opacity', (1 - F.clamp(p.happy)).toFixed(3));
      s.set('glint-' + e, 'opacity', F.clamp(p.glint).toFixed(3));
      // дужки: от края оправы назад к «уху»
      const A = proj(sg * (EYE.az + 17), EYE.el, 1.02, yaw, pitch), B = proj(sg * 98, 10, 1.0, yaw, pitch);
      s.set('temple-' + e, 'transform', seg(A, B));
      s.set('temple-' + e, 'opacity', F.clamp((A.nz - 0.1) / 0.2).toFixed(3));
    });
    const bA = proj(-EYE.az + 17.5, EYE.el + 1, 1.02, yaw, pitch), bB = proj(EYE.az - 17.5, EYE.el + 1, 1.02, yaw, pitch);
    s.set('bridge', 'transform', seg(bA, bB));
    // клюв: чем сильнее поворот, тем сильнее выступает
    const bk = proj(0, -24, 1.04 + 0.22 * Math.abs(Math.sin(yaw * D)), yaw, pitch);
    s.set('beak', 'transform', squash({ x: bk.x, y: bk.y, nx: bk.nx * 0.8, ny: bk.ny * 0.5, nz: 0.35 + 0.65 * bk.nz }));
    const o = F.clamp(p.beak);
    s.set('beak-low', 'transform', `translate(0 ${(o * 12).toFixed(2)})`);
    s.set('beak-up', 'transform', `translate(0 ${(-o * 1.2).toFixed(2)})`);
    s.set('mouth', 'transform', `translate(0 2) scale(1 ${o.toFixed(3)}) translate(0 -2)`);
    // точки мысли
    s.set('dot-1', 'opacity', F.clamp(p.d1).toFixed(3)); s.set('dot-2', 'opacity', F.clamp(p.d2).toFixed(3)); s.set('dot-3', 'opacity', F.clamp(p.d3).toFixed(3));
  };

  /* монтирование: два слоя для кроссфейда в Reduce Motion */
  function mount(host, opts = {}) {
    host.classList.add('pf-host');
    const layers = [0, 1].map(() => { const P = 'pf' + (++uid) + '-'; const d = document.createElement('div'); d.className = 'pf-layer'; d.innerHTML = rigSVG(P); host.appendChild(d); return { d, rig: new Rig(d, P) }; });
    layers[1].d.style.opacity = '0';
    let front = 0;
    const brain = new F.Brain({ mode: opts.mode || 'idle', modeYaw: opts.modeYaw });
    const draw = (p) => layers[front].rig.apply(p, brain.reduce);
    const loop = new F.Loop(host, brain, draw);
    const api = {
      brain, loop, host,
      setMode(m) {
        if (brain.reduce && m !== brain.mode) {
          const old = layers[front]; front = 1 - front; const nw = layers[front];
          brain.setMode(m); nw.rig.apply(brain.pose(host), true);
          nw.d.style.transition = old.d.style.transition = `opacity ${F.T.RM_FADE}s ease-in-out`;
          nw.d.style.opacity = '1'; old.d.style.opacity = '0';
        } else brain.setMode(m);
      },
      setReduce(v) { brain.reduce = v; brain.prevPose = null; brain.nextBlink = brain.now() + (v ? 2 : 1); },
      setLow(v) { brain.low = v; },
      status() { return { mode: brain.mode, hz: loop.paused.size ? 0 : brain.hz(), fps: loop.fps, paused: [...loop.paused], gesture: brain.gesture }; },
    };
    return api;
  }
  window.ParrloFrontSVG = { mount, rigSVG, proj };
})();
