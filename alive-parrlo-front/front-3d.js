/* Вариант B «Настоящий 3D» — процедурная модель на three.js (локальная частичная сборка ./three.min.js, без CDN).
   Та же поза, что у вариантов A и C (front-core.js). На iOS — SceneKit / RealityKit с той же иерархией узлов. */
import * as THREE from './three.min.js';
const F = window.ParrloFront; const D = Math.PI / 180;
const COL = { head: 0x00A86B, belly: 0x2BC48A, wing: 0x0A7048, c1: 0x0B8F5E, c2: 0x1DB37A, c3: 0x00A86B,
  beak: 0xFFC247, beakLow: 0xE59A35, mouth: 0x4A2320, ring: 0xBFF2DC, pupil: 0x0E1116 };

const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.58, metalness: 0 }, o));
const sph = (r, m, s = [1, 1, 1], seg = 40) => { const x = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), m); x.scale.set(...s); return x; };
const onSphere = (az, el, r) => new THREE.Vector3(Math.sin(az * D) * Math.cos(el * D), Math.sin(el * D), Math.cos(az * D) * Math.cos(el * D)).multiplyScalar(r);

function build() {
  const root = new THREE.Group();
  const mHead = mat(COL.head), mWing = mat(COL.wing, { roughness: 0.66 }), mRing = mat(COL.ring, { roughness: 0.35 });
  // тело
  const body = new THREE.Group(); body.position.set(0, -1.2, -0.05); root.add(body);
  const bodyMesh = sph(1, mHead, [1.13, 1.0, 0.95], 48); body.add(bodyMesh);
  const belly = sph(1, mat(COL.belly, { roughness: 0.7 }), [0.66, 0.66, 0.34]); belly.position.set(0, 0.02, 0.66); body.add(belly);
  const wings = [-1, 1].map((sd) => { const g = new THREE.Group(); g.position.set(sd * 1.06, 0.45, 0.12); const w = sph(1, mWing, [0.3, 0.64, 0.22]); w.position.set(0, -0.55, 0); g.add(w); body.add(g); return g; });
  // голова: точка вращения — «шея»
  const neck = new THREE.Group(); neck.position.set(0, -0.35, 0); root.add(neck);
  const head = new THREE.Group(); head.position.set(0, 0.9, 0); neck.add(head);
  head.add(sph(1, mHead, [1, 1, 1], 56));
  // гребень
  const crest = new THREE.Group(); crest.position.copy(onSphere(0, 78, 0.9)); head.add(crest);
  const feathers = [[COL.c1, 0.5, -0.03], [COL.c2, 0.62, 0], [COL.c3, 0.5, -0.03]].map(([c, L, z]) => {
    const g = new THREE.Group(); g.position.z = z; const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, L, 8, 16), mat(c)); m.position.y = L / 2 + 0.05; g.add(m); crest.add(g); return g;
  });
  // глаза
  const eyes = [-1, 1].map((sd) => {
    const g = new THREE.Group(); const n = onSphere(sd * 26, 6, 1); g.position.copy(n.clone().multiplyScalar(0.985)); g.lookAt(n.clone().multiplyScalar(3)); head.add(g);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.052, 16, 48), mRing); ring.position.z = 0.075; g.add(ring);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.31, 40), new THREE.MeshBasicMaterial({ color: COL.ring, transparent: true, opacity: 0.1, depthWrite: false })); lens.position.z = 0.07; g.add(lens);
    const look = new THREE.Group(); g.add(look);
    const lidPivot = new THREE.Group(); lidPivot.position.y = -0.2; look.add(lidPivot);       // моргание: сжатие от нижнего края
    const pup = new THREE.Group(); pup.position.y = 0.2; lidPivot.add(pup);
    const mP = mat(COL.pupil, { roughness: 0.25, transparent: true }); const pm = sph(0.2, mP, [1, 1, 0.42], 32); pm.position.z = 0.03; pup.add(pm);
    const mHi = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
    const h1 = sph(0.06, mHi, [1, 1, 0.5], 16); h1.position.set(0.075, 0.075, 0.115); pup.add(h1);
    const h2 = sph(0.026, mHi, [1, 1, 0.5], 12); h2.position.set(-0.06, -0.065, 0.11); pup.add(h2);
    const arc = (up, op) => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.036, 10, 28, Math.PI), new THREE.MeshStandardMaterial({ color: COL.pupil, roughness: 0.3, transparent: true, opacity: op })); m.position.z = 0.09; if (!up) m.rotation.z = Math.PI; m.position.y = up ? -0.05 : 0.04; g.add(m); return m; };
    const happy = arc(true, 0), closed = arc(false, 0);
    const glint = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.022, 8, 24, Math.PI / 3), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })); glint.position.z = 0.08; glint.rotation.z = Math.PI / 12; g.add(glint);
    // дужка назад к «уху»
    const temple = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.55, 6, 12), mRing); head.add(temple);
    const a = onSphere(sd * 44, 6, 1.04), b = onSphere(sd * 92, 8, 1.0); temple.position.copy(a.clone().add(b).multiplyScalar(0.5));
    temple.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); temple.scale.y = a.distanceTo(b) / 0.64;
    return { look, lidPivot, mP, mHi, happy, closed, glint };
  });
  // перемычка очков
  const bridge = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.045, 10, 24, Math.PI * 0.62), mRing);
  bridge.position.copy(onSphere(0, 9, 1.035)); bridge.rotation.z = Math.PI * 0.19; head.add(bridge);
  // клюв
  const beak = new THREE.Group(); beak.position.copy(onSphere(0, -20, 0.92)); beak.rotation.x = 0.18; head.add(beak);
  const mBeak = mat(COL.beak, { roughness: 0.42 });
  const up = new THREE.Group(); beak.add(up);
  // надклювье: тело вращения «капля носиком вниз», носик чуть вперёд
  const prof = [[0, 0.13], [0.17, 0.12], [0.29, 0.04], [0.32, -0.06], [0.28, -0.17], [0.2, -0.29], [0.11, -0.39], [0.04, -0.45], [0, -0.46]].reverse().map(([x, y]) => new THREE.Vector2(x, y));
  const u1 = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), mBeak); u1.scale.set(1, 1, 0.72); u1.rotation.x = -0.42; u1.position.set(0, 0.02, 0.14); up.add(u1);
  const hinge = new THREE.Group(); hinge.position.set(0, -0.1, 0.02); beak.add(hinge);
  const low = sph(0.2, mat(COL.beakLow, { roughness: 0.5 }), [1, 0.62, 0.8]); low.position.set(0, -0.2, 0.1); hinge.add(low);
  const mouth = sph(0.21, mat(COL.mouth, { roughness: 0.9 }), [1, 0.7, 0.5]); mouth.position.set(0, -0.2, 0.05); beak.add(mouth);
  // точки мысли
  const dots = [[1.02, 1.62, 0.08], [1.3, 1.95, 0.11], [1.62, 2.24, 0.14]].map(([x, y, r]) => { const m = sph(r, new THREE.MeshBasicMaterial({ color: COL.ring, transparent: true, opacity: 0 }), [1, 1, 1], 20); m.position.set(x, y - 0.35, 0.4); root.add(m); return m; });
  return { root, body, bodyMesh, belly, wings, neck, head, crest, feathers, eyes, up, hinge, mouth, dots };
}

function apply(M, p, rm) {
  M.root.position.y = -p.lift * 0.0185;                  // ед. 240 → ед. сцены
  M.body.rotation.y = p.yaw * 0.5 * D; M.body.rotation.z = -p.roll * 0.25 * D; M.bodyMesh.scale.y = p.sy;
  M.wings[0].rotation.z = (8 - p.wl) * D; M.wings[1].rotation.z = (-8 + p.wr) * D;
  M.neck.rotation.set(-p.pitch * D, p.yaw * 0.5 * D, -p.roll * D, 'YXZ');
  M.head.rotation.y = p.yaw * 0.5 * D;
  M.feathers.forEach((f, i) => { f.rotation.z = -[p.c1, p.c2, p.c3][i] * D; f.scale.y = p.cs; });
  M.eyes.forEach((e) => {
    e.look.position.set(p.lx * 0.075, -p.ly * 0.065, 0); e.look.scale.setScalar(p.ps);
    e.lidPivot.scale.y = Math.max(0.06, 1 - F.clamp(p.lid) * 0.94);
    const hp = F.clamp(p.happy), cl = rm ? F.clamp(p.blink) : 0, vis = (1 - hp) * (1 - cl);
    e.mP.opacity = vis; e.mHi.opacity = vis; e.happy.material.opacity = hp * (1 - cl); e.closed.material.opacity = cl;
    e.glint.material.opacity = F.clamp(p.glint);
  });
  const o = F.clamp(p.beak); M.hinge.position.y = -0.1 - o * 0.2; M.hinge.rotation.x = o * 0.3; M.up.rotation.x = -o * 0.1;
  M.mouth.scale.y = 0.4 + 0.9 * o; M.mouth.position.y = -0.2 - o * 0.1;
  [p.d1, p.d2, p.d3].forEach((d, i) => { M.dots[i].material.opacity = F.clamp(d); M.dots[i].visible = d > 0.01; });
}

export function mount3d(host, opts = {}) {
  host.classList.add('pf-host', 'pf-3d');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  const cv = renderer.domElement; cv.className = 'pf-layer'; host.appendChild(cv);
  const shot = document.createElement('canvas'); shot.className = 'pf-layer pf-shot'; shot.style.opacity = '0'; host.appendChild(shot);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x0b3d2a, 1.9));
  const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(-2.5, 3.5, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9dffd9, 1.3); rim.position.set(3, 2, -3); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(3, -1, 4); scene.add(fill);
  const cam = new THREE.PerspectiveCamera(26, 1, 0.1, 50); cam.position.set(0, 0.25, 9.5); cam.lookAt(0, 0.25, 0);
  const M = build(); scene.add(M.root);
  const resize = () => { const s = host.clientWidth || 240; renderer.setSize(s, s, false); cv.style.width = cv.style.height = '100%'; };
  resize(); new ResizeObserver(resize).observe(host);
  const brain = new F.Brain({ mode: opts.mode || 'idle' });
  const draw = (p) => { apply(M, p, brain.reduce); renderer.render(scene, cam); };
  const loop = new F.Loop(host, brain, draw);
  return {
    brain, loop, host, renderer,
    setMode(m) {
      if (brain.reduce && m !== brain.mode) {
        renderer.render(scene, cam); shot.width = cv.width; shot.height = cv.height;
        const c = shot.getContext('2d'); c.clearRect(0, 0, shot.width, shot.height); c.drawImage(cv, 0, 0);
        shot.style.transition = 'none'; shot.style.opacity = '1';
        brain.setMode(m); draw(brain.pose(host));
        requestAnimationFrame(() => requestAnimationFrame(() => { shot.style.transition = `opacity ${F.T.RM_FADE}s ease-in-out`; shot.style.opacity = '0'; }));
      } else brain.setMode(m);
    },
    setReduce(v) { brain.reduce = v; brain.prevPose = null; brain.nextBlink = brain.now() + (v ? 2 : 1); },
    setLow(v) { brain.low = v; },
    status() { return { mode: brain.mode, hz: loop.paused.size ? 0 : brain.hz(), fps: loop.fps, paused: [...loop.paused], gesture: brain.gesture }; },
  };
}
window.ParrloFront3D = { mount3d };
