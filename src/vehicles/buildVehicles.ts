import * as THREE from "three";
import type { Paint } from "../data/fleet";

export const paintHex: Record<Paint, string> = {
  gold: "#c4b189",
  white: "#f2f0ea",
  grey: "#3a3d42",
};

type Station = {
  z: number;
  yBot: number;
  yTop: number;
  halfW: number;
  arch?: number;
};

function paintMat(color: string, kind: Paint): THREE.MeshPhysicalMaterial {
  const pearl = kind === "white";
  const stealth = kind === "grey";
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: stealth ? 0.92 : pearl ? 0.38 : 0.82,
    roughness: stealth ? 0.32 : pearl ? 0.16 : 0.2,
    clearcoat: 1,
    clearcoatRoughness: stealth ? 0.12 : 0.04,
    sheen: pearl ? 0.45 : 0.08,
    sheenColor: new THREE.Color(pearl ? "#fff7ea" : color),
    envMapIntensity: 1.35,
  });
}

function glassMat(tint = "#0c1014") {
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0.05,
    roughness: 0.02,
    transmission: 0.18,
    thickness: 0.35,
    transparent: true,
    opacity: 0.92,
    envMapIntensity: 1.8,
  });
}

function emitMat(color: string, intensity: number) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.25,
    metalness: 0.1,
  });
}

function halfSection(station: Station, steps: number, soft: boolean): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const shoulderY = station.yBot + (station.yTop - station.yBot) * (soft ? 0.52 : 0.64);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let x: number;
    let y: number;
    if (t < 0.16) {
      const u = t / 0.16;
      x = THREE.MathUtils.lerp(0, station.halfW * 0.7, u);
      y = station.yBot;
    } else if (t < 0.3) {
      const u = (t - 0.16) / 0.14;
      x = THREE.MathUtils.lerp(station.halfW * 0.7, station.halfW, u);
      y = THREE.MathUtils.lerp(station.yBot, station.yBot + 0.07, u);
    } else if (t < 0.62) {
      const u = (t - 0.3) / 0.32;
      x = station.halfW;
      y = THREE.MathUtils.lerp(station.yBot + 0.07, shoulderY, u);
    } else if (t < 0.82) {
      const u = (t - 0.62) / 0.2;
      x = THREE.MathUtils.lerp(station.halfW, station.halfW * (soft ? 0.72 : 0.84), u);
      y = THREE.MathUtils.lerp(shoulderY, station.yTop - 0.03, u);
    } else {
      const u = (t - 0.82) / 0.18;
      x = THREE.MathUtils.lerp(station.halfW * (soft ? 0.72 : 0.84), 0, u);
      y = station.yTop;
    }
    if (station.arch && t < 0.42) {
      const lift = station.arch * (1 - t / 0.42);
      y += lift * 0.24;
      x *= 1 - lift * 0.1;
    }
    pts.push({ x, y });
  }
  return pts;
}

function ring(station: Station, segs: number, soft: boolean): THREE.Vector3[] {
  const steps = Math.max(8, Math.floor(segs / 2));
  const half = halfSection(station, steps, soft);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < half.length; i++) pts.push(new THREE.Vector3(half[i].x, half[i].y, station.z));
  for (let i = half.length - 2; i > 0; i--) pts.push(new THREE.Vector3(-half[i].x, half[i].y, station.z));
  return pts;
}

function loft(stations: Station[], segs: number, soft = false): THREE.BufferGeometry {
  const rings = stations.map((st) => ring(st, segs, soft));
  const positions: number[] = [];
  const indices: number[] = [];
  for (const r of rings) for (const p of r) positions.push(p.x, p.y, p.z);
  const R = rings[0].length;

  for (let i = 0; i < stations.length - 1; i++) {
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
  cap(stations.length - 1, true);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function markPaint(mesh: THREE.Mesh) {
  mesh.name = mesh.name || "Body";
  mesh.userData.paint = true;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

function wheel(detail: number, disc: boolean, paint: string) {
  const g = new THREE.Group();
  const segs = detail > 28 ? 48 : 24;
  const tire = new THREE.Mesh(
    new THREE.TorusGeometry(0.33, 0.07, 12, segs),
    new THREE.MeshStandardMaterial({ color: "#111", roughness: 0.88, metalness: 0.08 }),
  );
  tire.rotation.y = Math.PI / 2;
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.275, 0.275, 0.16, segs),
    new THREE.MeshStandardMaterial({ color: "#1a1a1a", roughness: 0.45, metalness: 0.55 }),
  );
  barrel.rotation.z = Math.PI / 2;
  g.add(tire, barrel);

  if (disc) {
    const cover = new THREE.Mesh(
      new THREE.CircleGeometry(0.3, segs),
      paintMat(paint, "gold"),
    );
    cover.position.x = 0.09;
    cover.rotation.y = Math.PI / 2;
    const ringA = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.006, 8, segs),
      new THREE.MeshStandardMaterial({ color: "#2a2a2a", metalness: 0.8, roughness: 0.25 }),
    );
    ringA.rotation.y = Math.PI / 2;
    ringA.position.x = 0.095;
    g.add(cover, ringA);
  } else {
    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.018, 0.26),
        new THREE.MeshStandardMaterial({ color: "#2c2e32", metalness: 0.75, roughness: 0.3 }),
      );
      spoke.rotation.y = (i / 5) * Math.PI;
      g.add(spoke);
    }
  }
  g.traverse((o) => {
    if (o instanceof THREE.Mesh) o.castShadow = true;
  });
  return g;
}

function addWheels(root: THREE.Group, axles: [number, number], track: number, detail: number, disc: boolean, paint: string) {
  for (const z of axles) {
    for (const x of [-track, track] as const) {
      const w = wheel(detail, disc, paint);
      w.position.set(x, 0.34, z);
      if (x < 0) w.rotation.y = Math.PI;
      root.add(w);
    }
  }
}

function doorCrease(points: THREE.Vector3[]) {
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, 28, 0.005, 6, false),
    new THREE.MeshStandardMaterial({ color: "#1b1b1b", roughness: 0.6, metalness: 0.2 }),
  );
}

export function buildCybercab(paint: Paint, segments = 48): THREE.Group {
  const color = paintHex[paint];
  const mat = paintMat(color, paint);
  const root = new THREE.Group();
  root.name = "Cybercab";
  const segs = Math.max(24, segments);

  const body = new THREE.Mesh(
    loft(
      [
        { z: 2.06, yBot: 0.3, yTop: 0.5, halfW: 0.38 },
        { z: 1.92, yBot: 0.2, yTop: 0.64, halfW: 0.78 },
        { z: 1.58, yBot: 0.16, yTop: 0.7, halfW: 0.9 },
        { z: 1.08, yBot: 0.16, yTop: 0.74, halfW: 0.91, arch: 1 },
        { z: 0.58, yBot: 0.15, yTop: 0.98, halfW: 0.9 },
        { z: 0.12, yBot: 0.15, yTop: 1.3, halfW: 0.88 },
        { z: -0.38, yBot: 0.15, yTop: 1.32, halfW: 0.86 },
        { z: -0.92, yBot: 0.15, yTop: 1.12, halfW: 0.8 },
        { z: -1.18, yBot: 0.16, yTop: 0.88, halfW: 0.76, arch: 1 },
        { z: -1.62, yBot: 0.2, yTop: 0.72, halfW: 0.68 },
        { z: -2.02, yBot: 0.32, yTop: 0.52, halfW: 0.44 },
      ],
      segs,
      true,
    ),
    mat,
  );
  body.name = "Body";
  markPaint(body);

  const canopy = new THREE.Mesh(
    loft(
      [
        { z: 0.62, yBot: 0.78, yTop: 0.98, halfW: 0.72 },
        { z: 0.18, yBot: 0.86, yTop: 1.3, halfW: 0.78 },
        { z: -0.28, yBot: 0.88, yTop: 1.32, halfW: 0.76 },
        { z: -0.72, yBot: 0.86, yTop: 1.16, halfW: 0.7 },
        { z: -1.02, yBot: 0.78, yTop: 0.98, halfW: 0.6 },
      ],
      Math.max(20, segs - 8),
      true,
    ),
    glassMat("#10151a"),
  );
  canopy.name = "Glass";

  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.018, 0.03), emitMat("#f3f6ff", 3.2));
  bar.position.set(0, 0.56, 1.93);

  const tail = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.016, 0.024), emitMat("#ff2a2a", 1.8));
  tail.position.set(0, 0.54, -1.96);

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.2, 0.02),
    new THREE.MeshStandardMaterial({ color: "#0a0c0f", roughness: 0.12, metalness: 0.45 }),
  );
  screen.position.set(0, 0.82, 0.58);

  for (const side of [-1, 1]) {
    root.add(
      doorCrease([
        new THREE.Vector3(0.9 * side, 0.22, 0.82),
        new THREE.Vector3(0.905 * side, 0.86, 0.42),
        new THREE.Vector3(0.88 * side, 1.16, -0.05),
        new THREE.Vector3(0.86 * side, 0.86, -0.48),
        new THREE.Vector3(0.85 * side, 0.24, -0.62),
      ]),
    );
    const cam = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.025, 0.06, 4, 8),
      new THREE.MeshStandardMaterial({ color: "#111", roughness: 0.3 }),
    );
    cam.position.set(0.94 * side, 0.78, 0.72);
    root.add(cam);
  }

  addWheels(root, [1.08, -1.16], 0.8, segs, true, color);
  root.add(body, canopy, bar, tail, screen);
  return root;
}

export function buildModelY(paint: Paint, segments = 48): THREE.Group {
  const color = paintHex[paint];
  const mat = paintMat(color, paint);
  const root = new THREE.Group();
  root.name = "ModelY";
  const segs = Math.max(24, segments);

  const body = new THREE.Mesh(
    loft(
      [
        { z: 2.28, yBot: 0.3, yTop: 0.7, halfW: 0.5 },
        { z: 2.1, yBot: 0.2, yTop: 0.84, halfW: 0.9 },
        { z: 1.72, yBot: 0.16, yTop: 0.9, halfW: 0.96 },
        { z: 1.2, yBot: 0.16, yTop: 0.98, halfW: 0.96, arch: 1 },
        { z: 0.68, yBot: 0.15, yTop: 1.38, halfW: 0.94 },
        { z: 0.12, yBot: 0.15, yTop: 1.6, halfW: 0.93 },
        { z: -0.62, yBot: 0.15, yTop: 1.58, halfW: 0.93 },
        { z: -1.18, yBot: 0.16, yTop: 1.36, halfW: 0.92, arch: 1 },
        { z: -1.68, yBot: 0.18, yTop: 1.18, halfW: 0.88 },
        { z: -2.2, yBot: 0.3, yTop: 0.78, halfW: 0.58 },
      ],
      segs,
    ),
    mat,
  );
  body.name = "Body";
  markPaint(body);

  const glass = new THREE.Mesh(
    loft(
      [
        { z: 0.72, yBot: 0.98, yTop: 1.28, halfW: 0.82 },
        { z: 0.18, yBot: 1.12, yTop: 1.6, halfW: 0.84 },
        { z: -0.55, yBot: 1.12, yTop: 1.58, halfW: 0.84 },
        { z: -1.12, yBot: 1.02, yTop: 1.34, halfW: 0.8 },
        { z: -1.48, yBot: 0.92, yTop: 1.16, halfW: 0.72 },
      ],
      Math.max(20, segs - 8),
    ),
    glassMat("#0b1014"),
  );

  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.018, 1.85), glassMat("#07090c"));
  roof.position.set(0, 1.6, -0.22);

  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.016, 0.03), emitMat("#f4f7fb", 2.8));
  bar.position.set(0, 0.78, 2.12);

  const tail = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.014, 0.022), emitMat("#ff3030", 1.5));
  tail.position.set(0, 0.82, -2.14);

  addWheels(root, [1.2, -1.2], 0.82, segs, false, color);
  root.add(body, glass, roof, bar, tail);
  return root;
}
