import * as THREE from "three";
import type { Paint } from "../data/fleet";

/**
 * Original hard-surface studio cars — not sphere morphs, not Tesla marketing files.
 *
 * Each body is an extruded production side-profile (wheel-well cutouts, hood,
 * belt, rear) plus separate greenhouse glass, shut lines, light bars, and wheels.
 * Cybercab silhouette follows Giga Texas / @robotaxi champagne units: two-seat
 * liftback, butterfly greenhouse, no rear window, no mirrors, aero discs.
 * Model Y follows Juniper: crossover ride height, C-pillar, glass roof, mirrors.
 */
export const paintHex: Record<Paint, string> = {
  gold: "#c8b17a",
  white: "#f1eee6",
  grey: "#3a3e44",
};

type Cmd =
  | { t: "M" | "L"; x: number; y: number }
  | { t: "Q"; cx: number; cy: number; x: number; y: number }
  | { t: "well"; axle: number; radius: number; cy: number; rocker: number };

function paintMat(color: string, kind: Paint) {
  const pearl = kind === "white";
  const stealth = kind === "grey";
  const raw = kind === "gold";
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: stealth ? 0.9 : pearl ? 0.34 : 0.93,
    roughness: stealth ? 0.3 : pearl ? 0.14 : 0.18,
    clearcoat: raw ? 0.85 : 1,
    clearcoatRoughness: stealth ? 0.1 : raw ? 0.06 : 0.03,
    sheen: pearl ? 0.55 : 0.06,
    sheenColor: new THREE.Color(pearl ? "#fff6e4" : color),
    iridescence: pearl ? 0.18 : 0,
    iridescenceIOR: 1.3,
    envMapIntensity: 1.55,
  });
}

function glassMat(tint: string, light: boolean) {
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0.08,
    roughness: 0.035,
    transmission: light ? 0 : 0.28,
    thickness: 0.45,
    transparent: true,
    opacity: light ? 0.84 : 0.9,
    ior: 1.45,
    envMapIntensity: 1.85,
  });
}

function emitMat(color: string, intensity: number) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.22,
    metalness: 0.12,
  });
}

function rubberMat() {
  return new THREE.MeshStandardMaterial({ color: "#111114", roughness: 0.92, metalness: 0.04 });
}

function trimMat() {
  return new THREE.MeshStandardMaterial({ color: "#16181c", roughness: 0.45, metalness: 0.55 });
}

function add(root: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, name: string, paint = false) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (paint) mesh.userData.paint = true;
  root.add(mesh);
  return mesh;
}

function box(w: number, h: number, d: number) {
  return new THREE.BoxGeometry(w, h, d);
}

function shapeFrom(cmds: Cmd[]) {
  const s = new THREE.Shape();
  for (const c of cmds) {
    if (c.t === "M") s.moveTo(c.x, c.y);
    else if (c.t === "L") s.lineTo(c.x, c.y);
    else if (c.t === "Q") s.quadraticCurveTo(c.cx, c.cy, c.x, c.y);
    else if (c.t === "well") {
      const dx = Math.sqrt(Math.max(1e-6, c.radius ** 2 - (c.rocker - c.cy) ** 2));
      const a0 = Math.atan2(c.rocker - c.cy, -dx);
      const a1 = Math.atan2(c.rocker - c.cy, dx);
      s.lineTo(c.axle - dx, c.rocker);
      s.absarc(c.axle, c.cy, c.radius, a0, a1, true);
    }
  }
  s.closePath();
  return s;
}

function extrudeCar(shape: THREE.Shape, width: number, bevel: number, bevelSegs: number) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: bevelSegs,
    curveSegments: 20,
  });
  geo.translate(0, 0, -width / 2);
  geo.rotateY(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function tumblehome(geo: THREE.BufferGeometry, fromY: number, amount: number) {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y <= fromY) continue;
    const t = Math.min(1, (y - fromY) / 0.9);
    pos.setX(i, pos.getX(i) * (1 - amount * t * t));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

function pinchEnds(geo: THREE.BufferGeometry, zMax: number, start: number, amount: number) {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const az = Math.abs(pos.getZ(i));
    if (az < start) continue;
    const t = Math.min(1, (az - start) / Math.max(0.05, zMax - start));
    pos.setX(i, pos.getX(i) * (1 - amount * t * t));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

function shut(root: THREE.Group, w: number, h: number, d: number, x: number, y: number, z: number) {
  const mesh = new THREE.Mesh(box(w, h, d), trimMat());
  mesh.position.set(x, y, z);
  mesh.name = "Shut";
  root.add(mesh);
}

function wheel(detail: number, disc: boolean, paint: string, kind: Paint, radius: number) {
  const g = new THREE.Group();
  const segs = detail > 32 ? 48 : 24;
  const tireW = disc ? 0.2 : 0.22;
  const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, tireW, segs), rubberMat());
  tire.rotation.z = Math.PI / 2;
  const sidewall = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.82, radius * 0.16, 10, segs),
    rubberMat(),
  );
  sidewall.rotation.y = Math.PI / 2;
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.72, radius * 0.72, tireW * 0.7, segs),
    new THREE.MeshStandardMaterial({ color: "#1c1e22", roughness: 0.4, metalness: 0.65 }),
  );
  barrel.rotation.z = Math.PI / 2;
  g.add(tire, sidewall, barrel);

  if (disc) {
    const cover = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.78, segs, 12, 0, Math.PI * 2, 0, 0.72),
      paintMat(paint, kind),
    );
    cover.rotation.z = -Math.PI / 2;
    cover.scale.set(1, 0.22, 1);
    cover.position.x = tireW * 0.28;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.52, 0.007, 8, segs),
      trimMat(),
    );
    ring.rotation.y = Math.PI / 2;
    ring.position.x = tireW * 0.36;
    const cap = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.1, segs), trimMat());
    cap.rotation.y = Math.PI / 2;
    cap.position.x = tireW * 0.42;
    g.add(cover, ring, cap);
  } else {
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.62, radius * 0.62, 0.04, segs),
      new THREE.MeshStandardMaterial({ color: "#2a2d32", metalness: 0.82, roughness: 0.28 }),
    );
    rim.rotation.z = Math.PI / 2;
    rim.position.x = 0.04;
    g.add(rim);
    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(
        new THREE.BoxGeometry(0.034, 0.055, radius * 0.95),
        new THREE.MeshStandardMaterial({ color: "#2c3036", metalness: 0.8, roughness: 0.26 }),
      );
      spoke.rotation.x = (i / 5) * Math.PI * 2;
      spoke.position.x = 0.05;
      g.add(spoke);
    }
  }

  g.traverse((o) => {
    if (o instanceof THREE.Mesh) o.castShadow = true;
  });
  return g;
}

function addWheels(
  root: THREE.Group,
  axles: [number, number],
  track: number,
  detail: number,
  disc: boolean,
  paint: string,
  kind: Paint,
  radius: number,
) {
  for (const z of axles) {
    for (const x of [-track, track] as const) {
      const w = wheel(detail, disc, paint, kind, radius);
      w.position.set(x, radius, z);
      if (x < 0) w.rotation.y = Math.PI;
      root.add(w);
    }
  }
}

export function buildCybercab(paint: Paint, segments = 48): THREE.Group {
  const color = paintHex[paint];
  const mat = paintMat(color, paint);
  const light = segments < 36;
  const glass = glassMat("#0b1016", light);
  const root = new THREE.Group();
  root.name = "Cybercab";
  const bevel = light ? 2 : 4;
  const wr = 0.355;
  const well = 0.43;
  const rocker = 0.145;
  const fax = 1.28;
  const rax = -1.27;

  const bodyGeo = extrudeCar(
    shapeFrom([
      { t: "M", x: 2.2, y: rocker },
      { t: "L", x: 2.22, y: 0.3 },
      { t: "Q", cx: 2.24, cy: 0.5, x: 2.16, y: 0.62 },
      { t: "Q", cx: 1.95, cy: 0.7, x: 1.55, y: 0.73 },
      { t: "L", x: 1.05, y: 0.77 },
      { t: "L", x: 0.92, y: 0.79 },
      { t: "L", x: -0.92, y: 0.8 },
      { t: "Q", cx: -1.2, cy: 0.9, x: -1.48, y: 0.9 },
      { t: "Q", cx: -1.85, cy: 0.82, x: -2.12, y: 0.68 },
      { t: "Q", cx: -2.23, cy: 0.5, x: -2.2, y: 0.3 },
      { t: "L", x: -2.18, y: rocker },
      { t: "well", axle: rax, radius: well, cy: wr, rocker },
      { t: "L", x: -0.55, y: rocker },
      { t: "L", x: 0.55, y: rocker },
      { t: "well", axle: fax, radius: well, cy: wr, rocker },
    ]),
    1.52,
    0.04,
    bevel,
  );
  pinchEnds(bodyGeo, 2.22, 1.55, 0.22);
  add(root, bodyGeo, mat, "Body", true);

  const glassGeo = extrudeCar(
    shapeFrom([
      { t: "M", x: 0.9, y: 0.8 },
      { t: "L", x: 0.22, y: 1.4 },
      { t: "Q", cx: -0.15, cy: 1.48, x: -0.48, y: 1.46 },
      { t: "Q", cx: -0.78, cy: 1.34, x: -0.96, y: 1.12 },
      { t: "L", x: -1.02, y: 0.82 },
      { t: "L", x: 0.9, y: 0.8 },
    ]),
    1.28,
    0.03,
    bevel,
  );
  tumblehome(glassGeo, 0.86, 0.2);
  add(root, glassGeo, glass, "Greenhouse");

  const windshield = add(root, box(1.22, 0.7, 0.03), glass, "Windshield");
  windshield.position.set(0, 1.1, 0.52);
  windshield.rotation.x = -0.72;

  for (const side of [-1, 1] as const) {
    const pillar = add(root, box(0.045, 0.68, 0.08), trimMat(), "APillar");
    pillar.position.set(0.62 * side, 1.08, 0.48);
    pillar.rotation.x = -0.7;
    pillar.rotation.z = 0.12 * side;
  }

  add(root, box(1.48, 0.018, 0.028), emitMat("#f4f7ff", 3.4), "LightBar").position.set(0, 0.54, 2.14);
  add(root, box(1.36, 0.05, 0.04), trimMat(), "Fascia").position.set(0, 0.48, 2.12);
  add(root, box(1.05, 0.016, 0.024), emitMat("#ff2a2a", 1.9), "TailBar").position.set(0, 0.56, -2.14);
  add(root, box(1.2, 0.42, 0.06), mat, "RearClam", true).position.set(0, 0.68, -1.92);

  const cabin = add(root, box(1.15, 0.5, 1.35), new THREE.MeshStandardMaterial({ color: "#0a0b0d", roughness: 0.9 }), "Cabin");
  cabin.position.set(0, 0.98, -0.02);

  const screen = add(root, box(0.72, 0.22, 0.02), new THREE.MeshStandardMaterial({ color: "#0c1016", roughness: 0.12, metalness: 0.5 }), "Screen");
  screen.position.set(0, 0.92, 0.62);

  for (const side of [-1, 1] as const) {
    shut(root, 0.01, 0.58, 0.01, 0.78 * side, 0.5, 0.82);
    shut(root, 0.01, 0.58, 0.01, 0.76 * side, 0.5, -0.78);
    shut(root, 0.01, 0.01, 1.55, 0.78 * side, 0.79, 0.02);
    const cam = add(root, new THREE.CapsuleGeometry(0.022, 0.05, 4, 8), trimMat(), "Camera");
    cam.position.set(0.8 * side, 0.86, 0.78);
  }

  add(root, box(1.2, 0.1, 3.4), new THREE.MeshStandardMaterial({ color: "#0d0d0f", roughness: 0.85 }), "Tub").position.set(
    0,
    0.28,
    0,
  );

  addWheels(root, [fax, rax], 0.68, segments, true, color, paint, wr);
  return root;
}

export function buildModelY(paint: Paint, segments = 48): THREE.Group {
  const color = paintHex[paint];
  const mat = paintMat(color, paint);
  const light = segments < 36;
  const glass = glassMat("#0a1015", light);
  const root = new THREE.Group();
  root.name = "ModelY";
  const bevel = light ? 2 : 4;
  const wr = 0.365;
  const well = 0.445;
  const rocker = 0.168;
  const fax = 1.445;
  const rax = -1.445;

  const bodyGeo = extrudeCar(
    shapeFrom([
      { t: "M", x: 2.36, y: rocker },
      { t: "L", x: 2.39, y: 0.34 },
      { t: "Q", cx: 2.4, cy: 0.58, x: 2.34, y: 0.72 },
      { t: "L", x: 2.26, y: 0.86 },
      { t: "Q", cx: 1.9, cy: 0.96, x: 1.45, y: 0.98 },
      { t: "L", x: 0.98, y: 1.04 },
      { t: "Q", cx: 0.55, cy: 1.38, x: 0.22, y: 1.56 },
      { t: "L", x: -0.15, y: 1.62 },
      { t: "L", x: -1.08, y: 1.61 },
      { t: "Q", cx: -1.32, cy: 1.56, x: -1.48, y: 1.42 },
      { t: "Q", cx: -1.72, cy: 1.18, x: -1.95, y: 1.08 },
      { t: "L", x: -2.22, y: 0.98 },
      { t: "Q", cx: -2.38, cy: 0.88, x: -2.38, y: 0.58 },
      { t: "L", x: -2.36, y: rocker },
      { t: "well", axle: rax, radius: well, cy: wr, rocker },
      { t: "L", x: -0.55, y: rocker },
      { t: "L", x: 0.55, y: rocker },
      { t: "well", axle: fax, radius: well, cy: wr, rocker },
    ]),
    1.86,
    0.045,
    bevel,
  );
  tumblehome(bodyGeo, 1.05, 0.12);
  pinchEnds(bodyGeo, 2.4, 1.85, 0.16);
  add(root, bodyGeo, mat, "Body", true);

  const sideGlass = extrudeCar(
    shapeFrom([
      { t: "M", x: 0.92, y: 1.06 },
      { t: "L", x: 0.28, y: 1.52 },
      { t: "L", x: -1.12, y: 1.54 },
      { t: "L", x: -1.42, y: 1.36 },
      { t: "L", x: -1.72, y: 1.12 },
      { t: "L", x: -1.15, y: 1.08 },
      { t: "L", x: -0.55, y: 1.08 },
      { t: "L", x: 0.92, y: 1.06 },
    ]),
    1.78,
    0.012,
    2,
  );
  add(root, sideGlass, glass, "SideGlass");

  const windshield = add(root, box(1.55, 0.78, 0.03), glass, "Windshield");
  windshield.position.set(0, 1.3, 0.58);
  windshield.rotation.x = -0.62;

  const roof = add(root, box(1.28, 0.02, 1.85), glassMat("#07090c", light), "RoofGlass");
  roof.position.set(0, 1.615, -0.42);

  const rearGlass = add(root, box(1.42, 0.42, 0.03), glass, "RearGlass");
  rearGlass.position.set(0, 1.2, -1.85);
  rearGlass.rotation.x = 0.38;

  for (const side of [-1, 1] as const) {
    const pillar = add(root, box(0.055, 0.62, 0.1), mat, "APillar", true);
    pillar.position.set(0.9 * side, 1.28, 0.55);
    pillar.rotation.x = -0.58;
    const cPillar = add(root, box(0.12, 0.52, 0.42), mat, "CPillar", true);
    cPillar.position.set(0.88 * side, 1.3, -1.42);
    cPillar.rotation.x = 0.35;
    const mirrorArm = add(root, box(0.14, 0.03, 0.04), mat, "MirrorArm", true);
    mirrorArm.position.set(1.0 * side, 1.08, 0.72);
    const mirror = add(root, box(0.18, 0.09, 0.06), mat, "Mirror", true);
    mirror.position.set(1.12 * side, 1.07, 0.7);
    shut(root, 0.01, 0.72, 0.01, 0.95 * side, 0.62, 0.55);
    shut(root, 0.01, 0.72, 0.01, 0.95 * side, 0.62, -0.35);
    shut(root, 0.01, 0.72, 0.01, 0.95 * side, 0.62, -1.15);
    const handle = add(root, box(0.014, 0.012, 0.12), trimMat(), "Handle");
    handle.position.set(0.96 * side, 0.92, 0.15);
    const handle2 = add(root, box(0.014, 0.012, 0.1), trimMat(), "Handle");
    handle2.position.set(0.96 * side, 0.92, -0.72);
  }

  add(root, box(1.82, 0.016, 0.03), emitMat("#f3f6fb", 3), "LightBar").position.set(0, 0.74, 2.32);
  add(root, box(0.22, 0.08, 0.06), emitMat("#eef2f8", 2.2), "LampL").position.set(-0.82, 0.74, 2.3);
  add(root, box(0.22, 0.08, 0.06), emitMat("#eef2f8", 2.2), "LampR").position.set(0.82, 0.74, 2.3);
  add(root, box(1.7, 0.2, 0.08), trimMat(), "Valance").position.set(0, 0.32, 2.3);
  add(root, box(1.62, 0.014, 0.022), emitMat("#ff3030", 1.6), "TailBar").position.set(0, 0.86, -2.32);
  add(root, box(1.2, 0.04, 0.28), mat, "Spoiler", true).position.set(0, 1.54, -1.48);

  const cabin = add(root, box(1.5, 0.7, 2.2), new THREE.MeshStandardMaterial({ color: "#0b0c0e", roughness: 0.9 }), "Cabin");
  cabin.position.set(0, 1.15, -0.25);

  add(root, box(1.45, 0.12, 3.9), new THREE.MeshStandardMaterial({ color: "#0d0d0f", roughness: 0.85 }), "Tub").position.set(
    0,
    0.3,
    0,
  );

  addWheels(root, [fax, rax], 0.84, segments, false, color, paint, wr);
  return root;
}
