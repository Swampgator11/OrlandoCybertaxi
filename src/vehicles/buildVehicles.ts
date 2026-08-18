import * as THREE from "three";
import type { Paint } from "../data/fleet";

/**
 * Original studio cars — not Tesla marketing files, not sphere morphs, not cookies.
 *
 * Metal bodies are lofted from hard automotive cross-sections (rocker, shoulder
 * crease, belt), densified along the length so the sides stay car-like without
 * a sphere morph. Wheel arches are raised stations. Glass is thin panes, not a
 * solid helmet. Cybercab follows Giga Texas / @robotaxi units: two-seat
 * liftback, butterfly greenhouse, no rear window, no mirrors, aero discs.
 * Model Y follows Juniper: crossover ride height, C-pillar, glass roof, mirrors.
 */
export const paintHex: Record<Paint, string> = {
  gold: "#c8b17a",
  white: "#f1eee6",
  grey: "#3a3e44",
};

type Half = { x: number; y: number };
type Station = {
  z: number;
  yBot: number;
  yShoulder: number;
  yBelt: number;
  wRocker: number;
  wShoulder: number;
  wBelt: number;
  yRoof?: number;
  wRoof?: number;
};

function paintMat(color: string, kind: Paint) {
  const pearl = kind === "white";
  const stealth = kind === "grey";
  const raw = kind === "gold";
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: stealth ? 0.9 : pearl ? 0.34 : 0.94,
    roughness: stealth ? 0.28 : pearl ? 0.13 : 0.16,
    clearcoat: raw ? 0.9 : 1,
    clearcoatRoughness: stealth ? 0.1 : raw ? 0.05 : 0.03,
    sheen: pearl ? 0.55 : 0.05,
    sheenColor: new THREE.Color(pearl ? "#fff6e4" : color),
    iridescence: pearl ? 0.16 : 0,
    iridescenceIOR: 1.3,
    envMapIntensity: 1.6,
  });
}

function glassMat(tint: string, light: boolean) {
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0.06,
    roughness: 0.04,
    transmission: light ? 0 : 0.22,
    thickness: 0.35,
    transparent: true,
    opacity: light ? 0.86 : 0.92,
    ior: 1.45,
    envMapIntensity: 1.7,
  });
}

function emitMat(color: string, intensity: number) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.2,
    metalness: 0.1,
  });
}

function rubber() {
  return new THREE.MeshStandardMaterial({ color: "#0e0e10", roughness: 0.94, metalness: 0.03 });
}

function darkMetal() {
  return new THREE.MeshStandardMaterial({ color: "#1a1c20", roughness: 0.42, metalness: 0.62 });
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

function halfMetal(s: Station): Half[] {
  const pts: Half[] = [
    { x: 0, y: s.yBot },
    { x: s.wRocker * 0.62, y: s.yBot },
    { x: s.wRocker, y: s.yBot + 0.045 },
    { x: s.wShoulder, y: s.yShoulder },
    { x: s.wBelt, y: s.yBelt - 0.015 },
    { x: s.wBelt * 0.7, y: s.yBelt },
  ];
  if (s.yRoof != null && s.wRoof != null) {
    pts.push({ x: s.wRoof, y: s.yRoof - 0.02 }, { x: s.wRoof * 0.45, y: s.yRoof }, { x: 0, y: s.yRoof });
  } else {
    pts.push({ x: 0, y: s.yBelt });
  }
  return pts;
}

function mix(a: number | undefined, b: number | undefined, t: number) {
  if (a == null && b == null) return undefined;
  if (a == null) return b;
  if (b == null) return a;
  return a + (b - a) * t;
}

function lerpStation(a: Station, b: Station, t: number): Station {
  const s: Station = {
    z: mix(a.z, b.z, t) as number,
    yBot: mix(a.yBot, b.yBot, t) as number,
    yShoulder: mix(a.yShoulder, b.yShoulder, t) as number,
    yBelt: mix(a.yBelt, b.yBelt, t) as number,
    wRocker: mix(a.wRocker, b.wRocker, t) as number,
    wShoulder: mix(a.wShoulder, b.wShoulder, t) as number,
    wBelt: mix(a.wBelt, b.wBelt, t) as number,
  };
  const yr = mix(a.yRoof, b.yRoof, t);
  const wr = mix(a.wRoof, b.wRoof, t);
  if (yr != null) s.yRoof = yr;
  if (wr != null) s.wRoof = wr;
  return s;
}

function densify(stations: Station[], mid = 6): Station[] {
  const out: Station[] = [];
  for (let i = 0; i < stations.length - 1; i++) {
    for (let k = 0; k < mid; k++) out.push(lerpStation(stations[i], stations[i + 1], k / mid));
  }
  out.push(stations[stations.length - 1]);
  return out;
}

function ring(half: Half[], z: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (const p of half) pts.push(new THREE.Vector3(p.x, p.y, z));
  for (let i = half.length - 2; i > 0; i--) pts.push(new THREE.Vector3(-half[i].x, half[i].y, z));
  return pts;
}

function loft(rings: THREE.Vector3[][]): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  for (const r of rings) for (const p of r) positions.push(p.x, p.y, p.z);
  const R = rings[0].length;
  for (let i = 0; i < rings.length - 1; i++) {
    for (let j = 0; j < R; j++) {
      const a = i * R + j;
      const b = i * R + ((j + 1) % R);
      const c = (i + 1) * R + j;
      const d = (i + 1) * R + ((j + 1) % R);
      indices.push(a, c, b, b, c, d);
    }
  }
  const cap = (index: number, inward: boolean) => {
    const r = rings[index];
    const center = new THREE.Vector3();
    r.forEach((p) => center.add(p));
    center.multiplyScalar(1 / r.length);
    const ci = positions.length / 3;
    positions.push(center.x, center.y, center.z);
    for (let j = 0; j < R; j++) {
      const a = index * R + j;
      const b = index * R + ((j + 1) % R);
      if (inward) indices.push(ci, b, a);
      else indices.push(ci, a, b);
    }
  };
  cap(0, false);
  cap(rings.length - 1, true);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function loftMetal(stations: Station[]) {
  return loft(densify(stations, 6).map((s) => ring(halfMetal(s), s.z)));
}

function pane(
  root: THREE.Group,
  mat: THREE.Material,
  w: number,
  h: number,
  x: number,
  y: number,
  z: number,
  rotX = 0,
  rotY = 0,
) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rotX, rotY, 0);
  mesh.name = "Glass";
  mesh.castShadow = true;
  root.add(mesh);
  return mesh;
}

function wheel(detail: number, disc: boolean, paint: string, kind: Paint, radius: number) {
  const g = new THREE.Group();
  const segs = detail > 32 ? 48 : 24;
  const tire = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.78, radius * 0.22, 14, segs), rubber());
  tire.rotation.y = Math.PI / 2;
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.62, radius * 0.62, 0.17, segs),
    darkMetal(),
  );
  barrel.rotation.z = Math.PI / 2;
  g.add(tire, barrel);

  if (disc) {
    const cover = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.58, radius * 0.58, 0.016, segs), paintMat(paint, kind));
    cover.rotation.z = Math.PI / 2;
    cover.position.x = 0.07;
    const lip = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.57, 0.01, 8, segs), darkMetal());
    lip.rotation.y = Math.PI / 2;
    lip.position.x = 0.078;
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.34, 0.008, 8, segs), darkMetal());
    ringA.rotation.y = Math.PI / 2;
    ringA.position.x = 0.085;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, segs), darkMetal());
    cap.rotation.z = Math.PI / 2;
    cap.position.x = 0.09;
    g.add(cover, lip, ringA, cap);
  } else {
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.58, radius * 0.58, 0.03, segs),
      new THREE.MeshStandardMaterial({ color: "#2b2e34", metalness: 0.84, roughness: 0.26 }),
    );
    rim.rotation.z = Math.PI / 2;
    rim.position.x = 0.05;
    g.add(rim);
    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.05, radius * 0.92),
        new THREE.MeshStandardMaterial({ color: "#2c3036", metalness: 0.8, roughness: 0.24 }),
      );
      spoke.rotation.x = (i / 5) * Math.PI * 2;
      spoke.position.x = 0.055;
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

function shut(root: THREE.Group, x: number, y: number, z: number, w: number, h: number, d: number) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), darkMetal());
  mesh.position.set(x, y, z);
  root.add(mesh);
}

export function buildCybercab(paint: Paint, segments = 48): THREE.Group {
  const color = paintHex[paint];
  const mat = paintMat(color, paint);
  const lite = segments < 36;
  const root = new THREE.Group();
  root.name = "Cybercab";
  const wr = 0.35;
  const fax = 1.28;
  const rax = -1.26;

  add(
    root,
    loftMetal([
      { z: 2.24, yBot: 0.42, yShoulder: 0.46, yBelt: 0.49, wRocker: 0.1, wShoulder: 0.12, wBelt: 0.1 },
      { z: 2.16, yBot: 0.28, yShoulder: 0.48, yBelt: 0.56, wRocker: 0.42, wShoulder: 0.5, wBelt: 0.46 },
      { z: 2.06, yBot: 0.2, yShoulder: 0.5, yBelt: 0.62, wRocker: 0.62, wShoulder: 0.74, wBelt: 0.7 },
      { z: 1.72, yBot: 0.16, yShoulder: 0.54, yBelt: 0.7, wRocker: 0.78, wShoulder: 0.84, wBelt: 0.8 },
      { z: fax, yBot: 0.4, yShoulder: 0.56, yBelt: 0.73, wRocker: 0.82, wShoulder: 0.85, wBelt: 0.81 },
      { z: 0.92, yBot: 0.15, yShoulder: 0.56, yBelt: 0.78, wRocker: 0.8, wShoulder: 0.85, wBelt: 0.82 },
      { z: 0.35, yBot: 0.15, yShoulder: 0.56, yBelt: 0.8, wRocker: 0.8, wShoulder: 0.84, wBelt: 0.81 },
      { z: -0.35, yBot: 0.15, yShoulder: 0.56, yBelt: 0.8, wRocker: 0.78, wShoulder: 0.83, wBelt: 0.8 },
      { z: -0.92, yBot: 0.15, yShoulder: 0.58, yBelt: 0.84, wRocker: 0.76, wShoulder: 0.8, wBelt: 0.76 },
      { z: rax, yBot: 0.4, yShoulder: 0.6, yBelt: 0.86, wRocker: 0.74, wShoulder: 0.78, wBelt: 0.72 },
      { z: -1.72, yBot: 0.2, yShoulder: 0.52, yBelt: 0.68, wRocker: 0.6, wShoulder: 0.66, wBelt: 0.6 },
      { z: -2.14, yBot: 0.28, yShoulder: 0.48, yBelt: 0.56, wRocker: 0.4, wShoulder: 0.48, wBelt: 0.42 },
      { z: -2.22, yBot: 0.4, yShoulder: 0.45, yBelt: 0.48, wRocker: 0.1, wShoulder: 0.12, wBelt: 0.1 },
    ]),
    mat,
    "Body",
    true,
  );

  const glass = glassMat("#0b1016", lite);
  pane(root, glass, 1.36, 0.82, 0, 1.1, 0.52, -0.78);
  pane(root, glass, 1.2, 1.05, 0, 1.44, -0.12, -Math.PI / 2);
  pane(root, glass, 1.5, 0.62, 0.76, 1.1, -0.06, 0, Math.PI / 2);
  pane(root, glass, 1.5, 0.62, -0.76, 1.1, -0.06, 0, -Math.PI / 2);
  pane(root, new THREE.MeshStandardMaterial({ color: "#090a0c", roughness: 0.92 }), 1.15, 0.55, 0, 0.98, 0.28, -0.35);

  add(root, new THREE.BoxGeometry(1.48, 0.016, 0.018), emitMat("#f5f8ff", 4.2), "LightBar").position.set(0, 0.55, 2.17);
  add(root, new THREE.BoxGeometry(1.08, 0.014, 0.016), emitMat("#ff2a2a", 2.1), "TailBar").position.set(0, 0.54, -2.15);

  for (const side of [-1, 1] as const) {
    shut(root, 0.835 * side, 0.48, 0.78, 0.01, 0.52, 0.01);
    shut(root, 0.82 * side, 0.48, -0.72, 0.01, 0.52, 0.01);
    shut(root, 0.83 * side, 0.79, 0.04, 0.01, 0.01, 1.48);
    const cam = add(root, new THREE.CapsuleGeometry(0.02, 0.045, 4, 8), darkMetal(), "Camera");
    cam.position.set(0.86 * side, 0.84, 0.74);
  }

  addWheels(root, [fax, rax], 0.78, segments, true, color, paint, wr);
  return root;
}

export function buildModelY(paint: Paint, segments = 48): THREE.Group {
  const color = paintHex[paint];
  const mat = paintMat(color, paint);
  const lite = segments < 36;
  const root = new THREE.Group();
  root.name = "ModelY";
  const wr = 0.365;
  const fax = 1.445;
  const rax = -1.445;

  add(
    root,
    loftMetal([
      { z: 2.42, yBot: 0.48, yShoulder: 0.56, yBelt: 0.62, wRocker: 0.14, wShoulder: 0.18, wBelt: 0.16 },
      { z: 2.32, yBot: 0.28, yShoulder: 0.6, yBelt: 0.76, wRocker: 0.58, wShoulder: 0.7, wBelt: 0.66 },
      { z: 2.2, yBot: 0.2, yShoulder: 0.64, yBelt: 0.86, wRocker: 0.82, wShoulder: 0.94, wBelt: 0.9 },
      { z: 1.85, yBot: 0.17, yShoulder: 0.68, yBelt: 0.96, wRocker: 0.92, wShoulder: 0.99, wBelt: 0.95 },
      { z: fax, yBot: 0.42, yShoulder: 0.7, yBelt: 1.0, wRocker: 0.96, wShoulder: 1.0, wBelt: 0.96 },
      { z: 0.95, yBot: 0.17, yShoulder: 0.7, yBelt: 1.05, wRocker: 0.94, wShoulder: 0.99, wBelt: 0.96 },
      { z: 0.2, yBot: 0.17, yShoulder: 0.7, yBelt: 1.06, wRocker: 0.94, wShoulder: 0.99, wBelt: 0.96 },
      { z: -0.55, yBot: 0.17, yShoulder: 0.7, yBelt: 1.06, wRocker: 0.94, wShoulder: 0.99, wBelt: 0.96 },
      {
        z: -1.15,
        yBot: 0.17,
        yShoulder: 0.72,
        yBelt: 1.08,
        wRocker: 0.93,
        wShoulder: 0.98,
        wBelt: 0.94,
        yRoof: 1.58,
        wRoof: 0.72,
      },
      {
        z: rax,
        yBot: 0.42,
        yShoulder: 0.72,
        yBelt: 1.1,
        wRocker: 0.92,
        wShoulder: 0.96,
        wBelt: 0.9,
        yRoof: 1.48,
        wRoof: 0.68,
      },
      { z: -1.85, yBot: 0.2, yShoulder: 0.68, yBelt: 1.02, wRocker: 0.84, wShoulder: 0.9, wBelt: 0.82, yRoof: 1.2, wRoof: 0.58 },
      { z: -2.22, yBot: 0.22, yShoulder: 0.58, yBelt: 0.88, wRocker: 0.7, wShoulder: 0.78, wBelt: 0.7 },
      { z: -2.34, yBot: 0.3, yShoulder: 0.54, yBelt: 0.7, wRocker: 0.5, wShoulder: 0.58, wBelt: 0.52 },
      { z: -2.42, yBot: 0.44, yShoulder: 0.5, yBelt: 0.56, wRocker: 0.14, wShoulder: 0.18, wBelt: 0.16 },
    ]),
    mat,
    "Body",
    true,
  );

  const glass = glassMat("#0a1015", lite);
  pane(root, glass, 1.58, 0.82, 0, 1.3, 0.55, -0.64);
  pane(root, glassMat("#07090c", lite), 1.2, 1.7, 0, 1.612, -0.38, -Math.PI / 2);
  pane(root, glass, 2.05, 0.5, 0.95, 1.32, -0.32, 0, Math.PI / 2);
  pane(root, glass, 2.05, 0.5, -0.95, 1.32, -0.32, 0, -Math.PI / 2);
  pane(root, glass, 1.42, 0.48, 0, 1.22, -1.88, 0.4);
  pane(root, new THREE.MeshStandardMaterial({ color: "#0a0b0d", roughness: 0.92 }), 1.4, 0.6, 0, 1.18, 0.32, -0.3);

  add(root, new THREE.BoxGeometry(1.82, 0.014, 0.016), emitMat("#f4f7fb", 3.4), "LightBar").position.set(0, 0.76, 2.34);
  add(root, new THREE.BoxGeometry(0.24, 0.07, 0.03), emitMat("#eef3fa", 2.4), "LampL").position.set(-0.84, 0.76, 2.33);
  add(root, new THREE.BoxGeometry(0.24, 0.07, 0.03), emitMat("#eef3fa", 2.4), "LampR").position.set(0.84, 0.76, 2.33);
  add(root, new THREE.BoxGeometry(1.66, 0.014, 0.016), emitMat("#ff3030", 1.8), "TailBar").position.set(0, 0.88, -2.34);

  for (const side of [-1, 1] as const) {
    shut(root, 0.99 * side, 0.62, 0.52, 0.01, 0.7, 0.01);
    shut(root, 0.99 * side, 0.62, -0.38, 0.01, 0.7, 0.01);
    shut(root, 0.99 * side, 0.62, -1.12, 0.01, 0.7, 0.01);
    const arm = add(root, new THREE.BoxGeometry(0.16, 0.03, 0.04), mat, "MirrorArm", true);
    arm.position.set(1.02 * side, 1.1, 0.78);
    const glass = add(root, new THREE.BoxGeometry(0.2, 0.1, 0.06), mat, "Mirror", true);
    glass.position.set(1.14 * side, 1.09, 0.76);
    const handle = add(root, new THREE.BoxGeometry(0.014, 0.012, 0.12), darkMetal(), "Handle");
    handle.position.set(1.0 * side, 0.96, 0.12);
    const handle2 = add(root, new THREE.BoxGeometry(0.014, 0.012, 0.1), darkMetal(), "Handle");
    handle2.position.set(1.0 * side, 0.96, -0.7);
  }

  addWheels(root, [fax, rax], 0.9, segments, false, color, paint, wr);
  return root;
}
