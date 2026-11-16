/* 3D hair guide: a head scan, two posable hands and curl clumps, played from the
   keyframes in js/sim-scenes.js.
   1 setup   2 scalp map   3 hair   4 hands   5 arrows and water   6 player   7 start
   Units are metres. The skull centre is the origin; the face looks along +Z,
   so the model's own left side is +X. Places on the head are given as
   az (degrees round the head, 0 = front, + = its left) and el (degrees up). */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { SCENES, POSES } from './sim-scenes.js';
import { DETAILS, TOTAL } from './sim-details.js';

const V3 = THREE.Vector3, M4 = THREE.Matrix4, Q = THREE.Quaternion;
const RAD = Math.PI / 180;
const HEAD_URL = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/models/gltf/LeePerrySmith/';
const HAND_URL = 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles/generic-hand/';
const CORAL = 0xff6b57;
const UP = new V3(0, 1, 0);
const smooth = u => u * u * (3 - 2 * u);
const clamp01 = u => Math.min(1, Math.max(0, u));
const lerp = (a, b, u) => a + (b - a) * u;

/* ---------- 1 setup ---------- */
const stage = document.getElementById('simStage');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const key = new THREE.DirectionalLight(0xfff1e0, 1.6);
key.position.set(0.6, 1, 0.8);
scene.add(key);

const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 10);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.minDistance = 0.4;
controls.maxDistance = 1.3;
controls.target.set(0, -0.01, 0);

const CAMS = { front: [0, 0.04, 0.9], side: [0.88, 0.06, 0.16], back: [0.3, 0.04, -0.92], three: [0.52, 0.1, 0.68], top: [0.3, 0.62, 0.52] };
let camGoal = null;
function setCam(cam) { camGoal = new V3(...(Array.isArray(cam) ? cam : CAMS[cam] || CAMS.three)); }

const loader = new GLTFLoader();
const load = url => new Promise((ok, bad) => loader.load(url, ok, undefined, bad));
const texture = (url, srgb) => { const t = new THREE.TextureLoader().load(url); if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };

/* ---------- 2 scalp map ---------- */
const dirOf = (az, el, out = new V3()) => out.set(Math.sin(az * RAD) * Math.cos(el * RAD), Math.sin(el * RAD), Math.cos(az * RAD) * Math.cos(el * RAD));

// Hairline: the lowest el that still has hair, by how far round the head you are.
const HAIRLINE = [[0, 36], [30, 34], [50, 26], [68, 10], [82, -4], [95, -10], [112, -32], [140, -44], [180, -50]];
function hairline(az) {
  const a = Math.abs(az);
  for (let i = 1; i < HAIRLINE.length; i++) {
    if (a <= HAIRLINE[i][0]) {
      const [a0, e0] = HAIRLINE[i - 1], [a1, e1] = HAIRLINE[i];
      return lerp(e0, e1, (a - a0) / (a1 - a0));
    }
  }
  return -50;
}

const GRID = { daz: 6, del: 6, elMin: -66, naz: 60, nel: 27, p: [], n: [] };
function buildScalp(mesh) {
  const rc = new THREE.Raycaster(), d = new V3(), o = new V3();
  for (let j = 0; j < GRID.nel; j++) {
    for (let i = 0; i < GRID.naz; i++) {
      dirOf(-180 + i * GRID.daz, GRID.elMin + j * GRID.del, d);
      rc.set(o.copy(d).multiplyScalar(0.6), d.clone().negate());
      const hit = rc.intersectObject(mesh, false)[0];
      const p = hit ? hit.point.clone() : d.clone().multiplyScalar(0.09);
      // half face normal, half straight out: steady round the ears
      const n = hit ? hit.face.normal.clone().transformDirection(mesh.matrixWorld).add(d).normalize() : d.clone();
      GRID.p.push(p); GRID.n.push(n);
    }
  }
}
/** The point on the skin at (az, el) and the direction pointing away from it. */
function scalp(az, el, outP = new V3(), outN = new V3()) {
  const fa = ((((az + 180) % 360) + 360) % 360) / GRID.daz;
  const fe = Math.min(GRID.nel - 1.001, Math.max(0, (el - GRID.elMin) / GRID.del));
  const i0 = Math.floor(fa) % GRID.naz, i1 = (i0 + 1) % GRID.naz, j0 = Math.floor(fe), j1 = j0 + 1;
  const u = fa - Math.floor(fa), v = fe - j0;
  const mix = (arr, out) => {
    const a = arr[j0 * GRID.naz + i0], b = arr[j0 * GRID.naz + i1], c = arr[j1 * GRID.naz + i0], e = arr[j1 * GRID.naz + i1];
    return out.set(
      lerp(lerp(a.x, b.x, u), lerp(c.x, e.x, u), v),
      lerp(lerp(a.y, b.y, u), lerp(c.y, e.y, u), v),
      lerp(lerp(a.z, b.z, u), lerp(c.z, e.z, u), v));
  };
  mix(GRID.p, outP); mix(GRID.n, outN).normalize();
  return { p: outP, n: outN };
}
const azOf = p => Math.atan2(p.x, p.z) / RAD;
const elOf = p => Math.asin(Math.max(-1, Math.min(1, p.y / (p.length() || 1)))) / RAD;

/* ---------- 3 hair ---------- */
const ZONES = ['fringe', 'top', 'back', 'sideL', 'sideR'];
const hairMat = {}, clumps = [];
const HAIR_DRY = new THREE.Color(0x4a3224), HAIR_WET = new THREE.Color(0x1c130e);

function zoneOf(az, el) {
  const a = Math.abs(az);
  if (a < 55 && el < 62) return 'fringe';
  if (el >= 50) return 'top';
  if (a >= 115) return 'back';
  return az > 0 ? 'sideL' : 'sideR';
}

// Seeded random so the hair is the same on every visit.
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

// Fine light and dark streaks running along each curl, so a tube reads as a lock of hair.
function fibreTexture() {
  const c = document.createElement('canvas');
  c.width = 1; c.height = 32;
  const g = c.getContext('2d');
  for (let y = 0; y < 32; y++) { const v = 160 + Math.floor(rnd() * 95); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(0, y, 1, 1); }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function buildHair(group) {
  const fibres = fibreTexture();
  ZONES.forEach(z => { hairMat[z] = new THREE.MeshPhysicalMaterial({ map: fibres, bumpMap: fibres, bumpScale: 1, color: HAIR_DRY.clone(), roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.5, emissive: CORAL, emissiveIntensity: 0 }); });
  const STYLE = {
    // loose, soft waves (a cold perm), not tight ringlets
    fringe: { len: 0.074, r: 0.0075, turns: 1.25, droop: 1.0, out: 0.3, flow: new V3(0, -0.3, 1) },
    top:    { len: 0.062, r: 0.0095, turns: 1.15, droop: 0.9, out: 0.42, slope: 0.6, flow: new V3(0, 0, 0.1) },
    back:   { len: 0.070, r: 0.0085, turns: 1.2, droop: 1.0, out: 0.28, flow: new V3(0, -1, 0) },
    sideL:  { len: 0.046, r: 0.0045, turns: 0.9, droop: 1.0, out: 0.1, flow: new V3(0, -1, 0) },
    sideR:  { len: 0.046, r: 0.0045, turns: 0.9, droop: 1.0, out: 0.1, flow: new V3(0, -1, 0) },
  };
  const P = new V3(), N = new V3(), sp = new V3(), sn = new V3(), slope = new V3();
  const STEP = 8;
  for (let el = 84; el > -52; el -= STEP) {
    const dAz = STEP / Math.max(0.2, Math.cos(el * RAD));
    for (let az = -180 + rnd() * dAz; az < 180; az += dAz) {
      const a = az + (rnd() - 0.5) * dAz * 0.6, e = el + (rnd() - 0.5) * STEP * 0.6;
      if (e < hairline(a) + 2) continue;
      scalp(a, e, P, N);
      const zone = zoneOf(a, e), st = STYLE[zone];
      slope.set(0, -1, 0).addScaledVector(N, N.y);   // downhill along the scalp
      if (slope.lengthSq() > 0.01) slope.normalize();
      const strands = [];
      // one lock = three thin strands that wave together
      const dir0 = N.clone().multiplyScalar(st.out).add(st.flow).addScaledVector(slope, st.slope || 0).add(new V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.5)).normalize();
      const len0 = st.len * (0.8 + rnd() * 0.4), phase0 = rnd() * 6.283, turns = st.turns * (0.8 + rnd() * 0.4);
      for (let k = 0; k < 3; k++) {
        const len = len0 * (0.9 + rnd() * 0.2), phase = phase0 + (k - 1) * 0.55, side = (k - 1) * 0.0042;
        const pts = [], q = P.clone(), dir = new V3(), U = new V3(), W = new V3();
        const n = 22;
        for (let i = 0; i <= n; i++) {
          const s = i / n;
          dir.copy(dir0).lerp(new V3(0, -1, 0), Math.pow(s, 1.3) * st.droop).normalize();
          if (i) q.addScaledVector(dir, len / n);
          // keep the strand outside the skin
          const need = scalp(azOf(q), elOf(q), sp, sn).p.length() + 0.007 + st.r;
          if (q.length() < need) q.setLength(Math.min(need, P.length() + 0.03));
          U.crossVectors(dir, q).normalize(); W.crossVectors(dir, U);
          const r = st.r * Math.min(1, s / 0.22) * (1 + 0.35 * s), ang = phase + turns * 6.283 * s;
          // a wide wave one way, a shallow one the other: an open S, not a spring
          pts.push(q.clone().addScaledVector(U, r * Math.cos(ang) + side).addScaledVector(W, r * 0.45 * Math.sin(ang)).sub(P));
        }
        strands.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.0037, 5, false));
      }
      const mesh = new THREE.Mesh(mergeGeometries(strands), hairMat[zone]);
      mesh.position.copy(P);
      group.add(mesh);
      strands.forEach(g => g.dispose());
      mesh.geometry.computeBoundingSphere();
      clumps.push({ mesh, zone, mid: mesh.geometry.boundingSphere.center.clone().add(P) });
    }
  }
}

// Paint the skin dark under the hair so no scalp shows between the curls.
function paintScalp(mesh) {
  const pos = mesh.geometry.attributes.position, col = new Float32Array(pos.count * 3), v = new V3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    const f = v.length() > 0.14 ? 0 : smooth(clamp01((elOf(v) - hairline(azOf(v)) + 3) / 6));
    col[i * 3] = lerp(1, 0.16, f); col[i * 3 + 1] = lerp(1, 0.11, f); col[i * 3 + 2] = lerp(1, 0.09, f);
  }
  mesh.geometry.setAttribute('color', new THREE.BufferAttribute(col, 3));
}

/* ---------- 4 hands ---------- */
const FINGERS = ['index', 'middle', 'ring', 'pinky'];
const skinMat = new THREE.MeshStandardMaterial({ color: 0xd7a787, roughness: 0.62 });
const cuffMat = new THREE.MeshStandardMaterial({ color: 0x2c3138, roughness: 0.9 });
const blobMat = new THREE.MeshPhysicalMaterial({ color: 0xf6f3ee, roughness: 0.25, clearcoat: 0.6 });

function makeHand(gltf, isLeft) {
  const root = gltf.scene;
  root.updateMatrixWorld(true);
  const bones = {};
  root.traverse(o => {
    if (o.isBone) bones[o.name] = o;
    if (o.isSkinnedMesh) { o.frustumCulled = false; o.material = skinMat; }
  });
  const parentWorld = bones.wrist.parent.matrixWorld.clone();
  const rest = {};
  for (const n in bones) { bones[n].updateMatrix(); rest[n] = bones[n].matrix.clone(); }
  const lp = n => new V3().setFromMatrixPosition(rest[n]);              // in the bones' own space
  const wp = n => lp(n).applyMatrix4(parentWorld);                      // in the model's space

  // A tidy frame for the hand: +Y along the fingers, +Z out of the palm, origin on the palm.
  const F = wp('middle-finger-phalanx-proximal').sub(wp('wrist')).normalize();
  const A = wp('pinky-finger-phalanx-proximal').sub(wp('index-finger-phalanx-proximal'));
  A.addScaledVector(F, -A.dot(F)).normalize();
  const N = isLeft ? new V3().crossVectors(A, F) : new V3().crossVectors(F, A);
  const X = new V3().crossVectors(F, N);
  const O = wp('wrist').add(wp('middle-finger-phalanx-proximal')).multiplyScalar(0.5).addScaledVector(N, 0.014);
  const toRig = new M4().makeBasis(X, F, N).setPosition(O).invert();
  root.matrixAutoUpdate = false;
  root.matrix.copy(toRig);
  const rig = new THREE.Group();
  rig.add(root);
  const boneToRig = toRig.clone().multiply(parentWorld);
  const nLocal = N.clone().transformDirection(parentWorld.clone().invert());

  // Which way each joint bends: try the joint's three axes, keep the one that
  // carries the fingertip furthest toward `toward`.
  const chains = FINGERS.map(f => [`${f}-finger-metacarpal`, `${f}-finger-phalanx-proximal`, `${f}-finger-phalanx-intermediate`, `${f}-finger-phalanx-distal`, `${f}-finger-tip`]);
  const thumb = ['thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip'];
  const axis = {};
  function calibrate(chain, toward) {
    const tip = lp(chain[chain.length - 1]);
    chain.slice(0, -1).forEach(name => {
      const p = lp(name), arm = tip.clone().sub(p), cols = [new V3(), new V3(), new V3()];
      rest[name].extractBasis(...cols);
      let best = null;
      cols.forEach(c => {
        c.normalize();
        const score = arm.clone().applyAxisAngle(c, 0.3).sub(arm).dot(toward);
        if (!best || Math.abs(score) > Math.abs(best.score)) best = { score, c };
      });
      axis[name] = best.c.clone().multiplyScalar(Math.sign(best.score) || 1);
    });
  }
  chains.forEach(c => calibrate(c, nLocal));
  calibrate(thumb, lp('index-finger-phalanx-proximal').addScaledVector(nLocal, 0.03).sub(lp('thumb-tip')).normalize());

  const A4 = new M4(), R4 = new M4(), T4 = new M4(), m = new M4(), p = new V3(), ax = new V3();
  function bend(chain, angles) {
    A4.identity();
    chain.forEach((name, i) => {
      if (angles[i]) {
        p.setFromMatrixPosition(rest[name]).applyMatrix4(A4);
        ax.copy(axis[name]).transformDirection(A4);
        R4.makeRotationAxis(ax, angles[i]);
        T4.makeTranslation(p.x, p.y, p.z).multiply(R4).multiply(m.makeTranslation(-p.x, -p.y, -p.z));
        A4.premultiply(T4);
      }
      m.multiplyMatrices(A4, rest[name]).decompose(bones[name].position, bones[name].quaternion, bones[name].scale);
    });
  }
  const tips = new V3();
  /** Curl the fingers. pose = { f, idx, th }: [knuckle, middle, end] bends in radians for the fingers, the index finger and the thumb. */
  function setPose(pose) {
    chains.forEach((c, i) => { const f = i ? pose.f : pose.idx; bend(c, [0, f[0] * (1 + i * 0.06), f[1], f[2], 0]); });
    bend(thumb, [pose.th[0], pose.th[1], pose.th[2], 0]);
    tips.set(0, 0, 0);
    ['index', 'middle', 'ring'].forEach(f => tips.add(bones[`${f}-finger-tip`].position));
    tips.multiplyScalar(1 / 3).applyMatrix4(boneToRig);
  }

  // A sleeve cuff closes the wrist, so the hand reads as part of an arm.
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.03, 0.05, 24), cuffMat);
  cuff.scale.set(1.18, 1, 0.82);
  cuff.position.copy(lp('wrist').applyMatrix4(boneToRig)).add(new V3(0, -0.028, 0));
  rig.add(cuff);

  const blob = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), blobMat);
  blob.visible = false;
  rig.add(blob);

  return { rig, blob, setPose, tips, isLeft, grip: 0 };
}

const zAxis = new V3(), yAxis = new V3(), xAxis = new V3(), basis = new M4(), qTurn = new Q(), tmpP = new V3(), tmpN = new V3(), target = new V3();
const DOWN = new V3(0, -1, 0), X1 = new V3(1, 0, 0), Y1 = new V3(0, 1, 0);
/** Put a hand on the head, or in the air when s.free is 1. The keys are explained in sim-scenes.js. */
function placeHand(hand, s) {
  hand.setPose(s.pose);
  hand.grip = clamp01((s.pose.f[0] + s.pose.f[1]) / 2.1);
  const side = hand.isLeft ? 1 : -1, az = side * s.az, yaw = side * s.yaw * RAD;
  scalp(az, s.el, tmpP, tmpN);
  target.copy(tmpP).addScaledVector(tmpN, s.lift);
  if (s.free) target.lerp(xAxis.set(side * s.x, s.y, s.z), s.free);
  // palm faces the head; tilt turns it to face up (1) or down (-1) instead
  zAxis.copy(tmpN).negate().lerp(s.tilt < 0 ? DOWN : UP, Math.abs(s.tilt)).normalize();
  // fingers point up the head, turned by yaw
  yAxis.copy(UP).addScaledVector(zAxis, -UP.dot(zAxis));
  if (yAxis.lengthSq() < 0.04) yAxis.set(0, 0, -1).addScaledVector(zAxis, zAxis.z);
  yAxis.normalize().applyAxisAngle(zAxis, yaw);
  if (s.palm) {   // a hand in the air says outright which way its palm and fingers point
    zAxis.set(side * s.palm[0], s.palm[1], s.palm[2]).normalize();
    yAxis.set(side * s.fingers[0], s.fingers[1], s.fingers[2]);
    yAxis.addScaledVector(zAxis, -yAxis.dot(zAxis)).normalize();
  }
  xAxis.crossVectors(yAxis, zAxis);
  hand.rig.quaternion.setFromRotationMatrix(basis.makeBasis(xAxis, yAxis, zAxis)).multiply(qTurn.setFromAxisAngle(X1, s.pitch)).multiply(qTurn.setFromAxisAngle(Y1, side * s.roll));
  hand.rig.position.copy(target);
  if (s.contact > 0) hand.rig.position.sub(tmpP.copy(hand.tips).multiplyScalar(s.contact).applyQuaternion(hand.rig.quaternion));
}

/* ---------- 5 arrows ---------- */
const arrowMat = new THREE.MeshBasicMaterial({ color: CORAL });
const arrowGroup = new THREE.Group();
function drawArrows(list = []) {
  arrowGroup.clear();
  list.forEach(a => {
    [1, -1].forEach(side => {
      if (side < 0 && !a.both) return;
      const pts = [];
      for (let i = 0; i <= 12; i++) {
        const u = i / 12, { p, n } = scalp(side * lerp(a.from[0], a.to[0], u), lerp(a.from[1], a.to[1], u), new V3(), new V3());
        pts.push(p.addScaledVector(n, a.lift ?? 0.062));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      arrowGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.0032, 6), arrowMat));
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.026, 12), arrowMat);
      head.position.copy(pts[12]);
      head.quaternion.setFromUnitVectors(UP, curve.getTangent(1).normalize());
      arrowGroup.add(head);
    });
  });
}

/* ---------- 5b water ---------- */
const WATER = 0xbfe3ff;
const shower = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: WATER, transparent: true, opacity: 0.5 }));
const drops = Array.from({ length: 150 }, () => { const a = rnd() * 6.283, r = Math.sqrt(rnd()) * 0.15; return { x: r * Math.cos(a), z: r * Math.sin(a) - 0.01, r, ph: rnd() }; });
shower.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(drops.length * 6), 3));
shower.frustumCulled = false;
function moveShower(t) {
  const a = shower.geometry.attributes.position;
  drops.forEach((d, i) => {
    const fall = d.r < 0.085 ? 0.22 : 0.6;   // drops over the head stop at the hair
    const y = 0.36 - ((t * 1.3 + d.ph) % 1) * fall;
    a.setXYZ(i * 2, d.x, y, d.z); a.setXYZ(i * 2 + 1, d.x, y - 0.028, d.z);
  });
  a.needsUpdate = true;
}

const spray = new THREE.Group();
const NOZZLE = new V3(-0.24, 0.13, 0.2);
{
  const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.11, 20), new THREE.MeshPhysicalMaterial({ color: 0xdfeaf2, roughness: 0.2, transparent: true, opacity: 0.75 }));
  bottle.position.copy(NOZZLE).add(new V3(-0.012, -0.085, 0.01));
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.05), cuffMat);
  top.position.copy(NOZZLE).add(new V3(-0.008, -0.012, 0.006));
  top.lookAt(0, 0.05, 0);
  spray.add(bottle, top);
}
const mist = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: WATER, size: 0.007, transparent: true, opacity: 0.6 }));
const motes = Array.from({ length: 90 }, () => ({ ph: rnd(), dx: (rnd() - 0.5) * 0.16, dy: (rnd() - 0.5) * 0.16, dz: (rnd() - 0.5) * 0.16 }));
mist.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(motes.length * 3), 3));
mist.frustumCulled = false;
spray.add(mist);
function moveSpray(t) {
  const a = mist.geometry.attributes.position, aim = new V3(0.03, 0.06, 0.02);
  motes.forEach((m, i) => {
    const u = (t * 0.9 + m.ph) % 1;   // 0 at the nozzle, 1 at the hair; the cloud widens on the way
    a.setXYZ(i, lerp(NOZZLE.x, aim.x + m.dx, u), lerp(NOZZLE.y, aim.y + m.dy, u), lerp(NOZZLE.z, aim.z + m.dz, u));
  });
  a.needsUpdate = true;
}

/* ---------- 6 player ---------- */
const NUM = ['az', 'el', 'lift', 'yaw', 'pitch', 'roll', 'tilt', 'contact', 'circle', 'wig', 'free', 'x', 'y', 'z'];
const REST = { az: 100, el: -40, lift: 0.3, yaw: 0, pitch: 0, roll: 0, tilt: 0, contact: 0, circle: 0, wig: 0, free: 0, x: 0, y: 0, z: 0, pose: 'flat' };
/** Fill in every key: a value left out carries on from the key before it. */
function prepare(keys) {
  let prev = REST;
  return keys.map(k => (prev = { ...prev, ...k }));
}
const out = { pose: { f: [0, 0, 0], idx: [0, 0, 0], th: [0, 0, 0] } };
function sample(keys, t) {
  let i = 0;
  while (i < keys.length - 1 && t >= keys[i + 1].t) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const u = b.t > a.t ? smooth(clamp01((t - a.t) / (b.t - a.t))) : 0;
  NUM.forEach(n => { out[n] = lerp(a[n], b[n], u); });
  out.palm = a.palm; out.fingers = a.fingers;
  const pa = POSES[a.pose], pb = POSES[b.pose];
  for (let j = 0; j < 3; j++) {
    out.pose.f[j] = lerp(pa.f[j], pb.f[j], u);
    out.pose.idx[j] = lerp((pa.idx || pa.f)[j], (pb.idx || pb.f)[j], u);
    out.pose.th[j] = lerp(pa.th[j], pb.th[j], u);
  }
  if (out.circle) {   // small circles on the spot (on the head, or in the air)
    out.az += out.circle * Math.cos(t * 7) / Math.max(0.3, Math.cos(out.el * RAD));
    out.el += out.circle * Math.sin(t * 7);
    out.x += out.circle * 0.004 * Math.cos(t * 7);
    out.z += out.circle * 0.004 * Math.sin(t * 7);
  }
  if (out.wig) out.az += out.wig * Math.sin(t * 13);   // a quick side-to-side wiggle
  return out;
}

let hands, current = null, index = 0, time = 0, playing = true, speed = 1, lastPart = -1, loops = 0, playAll = false;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** The panel beside the model: how many, how long, each movement in order, what to avoid. */
function detailHtml(sc) {
  const d = DETAILS[sc.id];
  if (!d) return '';
  return `
    <p class="sim-count">This step, exactly</p>
    <h3>${esc(sc.title)}</h3>
    <dl class="sim-facts">
      <div><dt>How many</dt><dd>${esc(d.reps)}</dd></div>
      ${d.time ? `<div><dt>How long</dt><dd>${esc(d.time)}</dd></div>` : ''}
    </dl>
    <ol class="sim-list">${d.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    <p class="sim-avoid"><b>Avoid.</b> ${esc(d.avoid)}</p>`;
}
const repCount = sc => (DETAILS[sc.id] || {}).count || 0;
function showRep() {
  const n = repCount(current.sc);
  $('simRep').hidden = !n;
  if (n) $('simRep').textContent = `Rep ${(loops % n) + 1} of ${n}`;
}
const $ = id => document.getElementById(id);
const $$ = sel => [...document.querySelectorAll(sel)];

function showScene(i) {
  index = (i + SCENES.length) % SCENES.length;
  const sc = SCENES[index];
  current = { sc, L: prepare(sc.left || sc.both || [{ t: 0 }]), R: prepare(sc.right || sc.both || [{ t: 0 }]) };
  time = 0; lastPart = -1; loops = 0;
  $('simDetail').innerHTML = detailHtml(sc);
  showRep();
  hands[0].rig.visible = !!(sc.left || sc.both);    // a hand with nothing to do stays out of the picture
  hands[1].rig.visible = !!(sc.right || sc.both);
  $('simTitle').textContent = sc.title;
  $('simCount').textContent = `${sc.group} · step ${index + 1} of ${SCENES.length}`;
  $('simNo').hidden = !sc.no;
  setCam(sc.cam);
  drawArrows(sc.arrows);
  // wet hair is darker and shinier; a gel cast is shiny but not dark
  const wet = sc.wet ?? 0, shine = Math.max(wet, sc.cast ?? 0);
  ZONES.forEach(z => {
    hairMat[z].color.copy(HAIR_DRY).lerp(HAIR_WET, wet);
    hairMat[z].roughness = lerp(0.55, 0.3, shine);
    hairMat[z].clearcoat = lerp(0.2, 0.55, shine);
  });
  hands.forEach((h, i) => {
    const b = sc.blob && sc.blob.hand === i ? sc.blob : null;
    h.blob.userData = b || {};
    if (b) { h.blob.scale.set(b.r, b.r, b.r * 0.4); h.blob.position.set(0, 0.005, b.r * 0.4); }
  });
  shower.visible = sc.fx === 'shower';
  spray.visible = sc.fx === 'spray';
  $$('#simSteps [data-i]').forEach(b => { if (+b.dataset.i === index) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
  if (location.hash !== '#' + sc.id) history.replaceState(null, '', '#' + sc.id);
}

/** Play all: each step plays its reps once, then the next step starts. */
function setPlayAll(on) {
  playAll = on;
  document.body.dataset.simAll = on ? 'on' : 'off';
  $('simAll').setAttribute('aria-pressed', on);
  $('simAll').textContent = on ? 'Playing all' : 'Play all';
  if (on && !playing) $('simPlay').click();
}

/** Move the step's clock on. At the end of a loop, count the rep; in Play all, go to the next step once the reps are done. */
function advance(dt) {
  const sc = current.sc;
  time += dt;
  if (time < sc.dur) return false;
  time %= sc.dur;
  loops++;
  if (playAll && loops >= Math.max(1, repCount(sc))) {
    if (index < SCENES.length - 1) { showScene(index + 1); return true; }
    setPlayAll(false);
  }
  showRep();
  return false;
}

const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.25);   // a slow device skips ahead instead of running in slow motion
  if (camGoal) {
    camera.position.lerp(camGoal, 1 - Math.pow(0.002, dt));
    if (camera.position.distanceTo(camGoal) < 0.004) camGoal = null;
  }
  if (current) {
    const sc = current.sc;
    if (playing && advance(dt * speed)) return;   // moved on to the next step
    placeHand(hands[0], sample(current.L, time));
    placeHand(hands[1], sample(current.R, time));

    hands.forEach(h => { const b = h.blob.userData; h.blob.visible = b.r > 0 && time >= (b.from ?? 0) && time < (b.to ?? sc.dur); });
    if (shower.visible) moveShower(clock.elapsedTime);
    if (spray.visible) moveSpray(clock.elapsedTime);

    const part = sc.parts.findIndex(p => time >= p.from && time < p.to);
    if (part !== lastPart && part >= 0) { lastPart = part; $('simText').textContent = sc.parts[part].text; }

    // hair: zones glow while they are being worked, and curls squash in a closing hand
    const pulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 4);
    ZONES.forEach(z => { hairMat[z].emissiveIntensity = (sc.glow || []).includes(z) ? 0.03 + 0.03 * pulse : 0; });
    const vol = sc.volume ?? 1;
    clumps.forEach(c => {
      let squash = 0;
      hands.forEach(h => {
        const d = h.rig.position.distanceTo(c.mid);
        squash = Math.max(squash, h.grip * clamp01(1 - (d - 0.04) / 0.08));
      });
      c.mesh.scale.setScalar(vol * (1 - 0.42 * squash));
    });
  }
  controls.update();
  renderer.render(scene, camera);
}

/* ---------- 7 start ---------- */
try {
  const [headGltf, leftGltf, rightGltf] = await Promise.all([load(HEAD_URL + 'LeePerrySmith.glb'), load(HAND_URL + 'left.glb'), load(HAND_URL + 'right.glb')]);

  // Scale the bust to real size and put the skull centre on the origin.
  const headMesh = headGltf.scene.children[0];
  headMesh.material = new THREE.MeshStandardMaterial({
    map: texture(HEAD_URL + 'Map-COL.jpg', true), normalMap: texture(HEAD_URL + 'Infinite-Level_02_Tangent_SmoothUV.jpg'),
    roughness: 0.6, vertexColors: true,
  });
  const S = 0.05;
  headMesh.scale.setScalar(S);
  headMesh.position.set(0.07 * S, -2.2 * S, -0.05 * S);
  scene.add(headMesh);
  headMesh.updateMatrixWorld(true);
  buildScalp(headMesh);
  paintScalp(headMesh);

  const hair = new THREE.Group();
  buildHair(hair);
  scene.add(hair, arrowGroup, shower, spray);

  hands = [makeHand(leftGltf, true), makeHand(rightGltf, false)];
  hands.forEach(h => scene.add(h.rig));

  $('simLoad').remove();
  $('simSteps').innerHTML = SCENES.map((s, i) =>
    (i && SCENES[i - 1].group === s.group ? '' : `<span class="sim-group">${s.group}</span>`) +
    `<button class="chip" type="button" data-i="${i}">${s.short}</button>`).join('');
  $('simSteps').addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) showScene(+b.dataset.i); });
  $('simPrev').addEventListener('click', () => showScene(index - 1));
  $('simNext').addEventListener('click', () => showScene(index + 1));
  $('simPlay').addEventListener('click', e => { playing = !playing; e.target.textContent = playing ? 'Pause' : 'Play'; });
  $('simSpeed').addEventListener('click', e => { speed = speed === 1 ? 0.4 : 1; e.target.textContent = speed === 1 ? 'Slow' : 'Normal speed'; });
  $('simAll').addEventListener('click', () => setPlayAll(!playAll));
  $('simTotal').textContent = TOTAL;
  // The steps panel: open unless it was closed last time.
  const setPanel = open => {
    $('sim').classList.toggle('panel-off', !open);
    $('simPanelBtn').textContent = open ? 'Hide steps' : 'Show steps';
    $('simPanelBtn').setAttribute('aria-expanded', open);
    try { localStorage.setItem('simPanel', open ? 'on' : 'off'); } catch (e) { /* lasts for this visit only */ }
  };
  let panelOpen = true;
  try { panelOpen = localStorage.getItem('simPanel') !== 'off'; } catch (e) { /* keep it open */ }
  setPanel(panelOpen);
  $('simPanelBtn').addEventListener('click', () => setPanel($('sim').classList.contains('panel-off')));
  document.querySelector('.sim-views').addEventListener('click', e => { const b = e.target.closest('[data-cam]'); if (b) setCam(b.dataset.cam); });

  const size = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(size).observe(stage);
  size();
  camera.position.set(...CAMS.three);
  showScene(Math.max(0, SCENES.findIndex(s => s.id === location.hash.slice(1))));
  window.addEventListener('hashchange', () => { const i = SCENES.findIndex(s => s.id === location.hash.slice(1)); if (i >= 0 && i !== index) showScene(i); });

  // Draw only while the stage is on screen and the tab is open.
  let visible = true;
  const run = () => renderer.setAnimationLoop(visible && !document.hidden ? frame : null);
  new IntersectionObserver(es => { visible = es[0].isIntersecting; run(); }).observe(stage);
  document.addEventListener('visibilitychange', run);
  run();

  // for testing: snap(i, t) draws step i at second t and returns the canvas
  window.SIM = {
    scenes: SCENES, hands, clumps, showScene,
    snap(i, t) { showScene(i); playing = false; time = t; if (camGoal) { camera.position.copy(camGoal); camGoal = null; } frame(); return renderer.domElement; },
    run(seconds) { for (let k = 0; k < seconds * 20; k++) advance(0.05); frame(); },
  };
} catch (err) {
  console.error(err);
  $('simLoad').textContent = 'The 3D model could not load. Check your connection and reload.';
}
