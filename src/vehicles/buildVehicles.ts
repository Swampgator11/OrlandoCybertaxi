import * as THREE from "three";
import type { Paint } from "../data/fleet";

export const paintHex: Record<Paint, string> = {
  gold: "#c5b08a",
  white: "#f3f1ea",
  grey: "#3f4349",
};

function physical(color: string, extras: THREE.MeshPhysicalMaterialParameters = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.88,
    roughness: 0.22,
    clearcoat: 0.85,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.15,
    ...extras,
  });
}

function glass(tint = "#14181c") {
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0.15,
    roughness: 0.04,
    transmission: 0.22,
    thickness: 0.45,
    transparent: true,
    opacity: 0.94,
    envMapIntensity: 1.6,
  });
}

function morphTeardrop(
  length: number,
  width: number,
  height: number,
  segs: number,
  rearTaper: number,
) {
  const geo = new THREE.SphereGeometry(1, segs, segs);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    const rear = (z + 1) / 2;
    const taper = THREE.MathUtils.lerp(1, rearTaper, rear);
    const lift = 0.78 + 0.22 * Math.cos(z * Math.PI * 0.5);
    pos.setXYZ(i, x * (width / 2) * taper, y * (height / 2) * lift, z * (length / 2));
  }
  geo.computeVertexNormals();
  return geo;
}

function wheel(detail: number, disc: boolean, accent: string) {
  const group = new THREE.Group();
  const segs = detail > 32 ? 40 : 22;
  const tire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.36, 0.22, segs),
    new THREE.MeshStandardMaterial({ color: "#141414", roughness: 0.7, metalness: 0.1 }),
  );
  tire.rotation.z = Math.PI / 2;
  const rubber = new THREE.Mesh(
    new THREE.TorusGeometry(0.33, 0.055, 10, segs),
    new THREE.MeshStandardMaterial({ color: "#0b0b0b", roughness: 0.85 }),
  );
  rubber.rotation.y = Math.PI / 2;
  const cover = new THREE.Mesh(
    new THREE.CircleGeometry(0.31, segs),
    physical(disc ? accent : "#2a2c30", { metalness: disc ? 0.92 : 0.6, roughness: disc ? 0.16 : 0.4 }),
  );
  cover.position.x = 0.12;
  cover.rotation.y = Math.PI / 2;
  group.add(tire, rubber, cover);
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) o.castShadow = true;
  });
  return group;
}

export function buildCybercab(paint: Paint, segments = 48): THREE.Group {
  const color = paintHex[paint];
  const root = new THREE.Group();
  root.name = "Cybercab";

  const body = new THREE.Mesh(morphTeardrop(4.15, 1.86, 0.78, segments, 0.7), physical(color));
  body.name = "Body";
  body.position.y = 0.52;
  body.castShadow = true;
  body.receiveShadow = true;

  const shoulder = new THREE.Mesh(
    morphTeardrop(3.55, 1.78, 0.42, segments, 0.74),
    physical(color, { roughness: 0.18 }),
  );
  shoulder.position.set(0, 0.72, -0.05);
  shoulder.castShadow = true;

  const canopy = new THREE.Mesh(morphTeardrop(2.15, 1.52, 0.62, segments, 0.82), glass("#101418"));
  canopy.name = "Glass";
  canopy.position.set(0, 0.92, -0.08);

  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(1.42, 0.025, 0.04),
    new THREE.MeshStandardMaterial({ color: "#f4f7ff", emissive: "#e8eeff", emissiveIntensity: 2.4 }),
  );
  bar.position.set(0, 0.58, 1.98);

  const tail = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.02, 0.03),
    new THREE.MeshStandardMaterial({ color: "#ff2a2a", emissive: "#ff1c1c", emissiveIntensity: 1.6 }),
  );
  tail.position.set(0, 0.55, -2.02);

  const skirt = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 0.08, 3.4),
    physical("#1a1a1a", { metalness: 0.4, roughness: 0.5, clearcoat: 0.2 }),
  );
  skirt.position.set(0, 0.28, 0);

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.18, 0.02),
    new THREE.MeshStandardMaterial({ color: "#0b0d10", roughness: 0.15, metalness: 0.4 }),
  );
  screen.position.set(0, 0.78, 0.72);

  const track = 0.78;
  const axles = [0.95, -1.05];
  for (const z of axles) {
    for (const x of [-track, track]) {
      const w = wheel(segments, true, color);
      w.position.set(x, 0.36, z);
      if (x < 0) w.rotation.y = Math.PI;
      root.add(w);
    }
  }

  root.add(body, shoulder, canopy, bar, tail, skirt, screen);
  return root;
}

export function buildModelY(paint: Paint, segments = 48): THREE.Group {
  const color = paintHex[paint];
  const root = new THREE.Group();
  root.name = "ModelY";

  const body = new THREE.Mesh(morphTeardrop(4.55, 1.92, 0.92, segments, 0.9), physical(color, { roughness: 0.24 }));
  body.name = "Body";
  body.position.y = 0.62;
  body.castShadow = true;

  const cabin = new THREE.Mesh(
    morphTeardrop(2.7, 1.62, 0.78, segments, 0.92),
    physical(color, { roughness: 0.26 }),
  );
  cabin.position.set(0, 1.05, -0.15);
  cabin.castShadow = true;

  const sideGlass = new THREE.Mesh(morphTeardrop(2.35, 1.58, 0.5, segments, 0.93), glass("#0e1216"));
  sideGlass.position.set(0, 1.12, -0.12);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(1.28, 0.02, 1.9),
    glass("#0a0c0e"),
  );
  roof.position.set(0, 1.38, -0.18);

  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(1.62, 0.02, 0.035),
    new THREE.MeshStandardMaterial({ color: "#f5f7fb", emissive: "#dce6ff", emissiveIntensity: 2.2 }),
  );
  bar.position.set(0, 0.78, 2.12);

  const track = 0.8;
  const axles = [1.15, -1.2];
  for (const z of axles) {
    for (const x of [-track, track]) {
      const w = wheel(segments, false, "#2c2e32");
      w.position.set(x, 0.36, z);
      if (x < 0) w.rotation.y = Math.PI;
      root.add(w);
    }
  }

  root.add(body, cabin, sideGlass, roof, bar);
  return root;
}
