import { Suspense, useEffect, useLayoutEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { ACESFilmicToneMapping, Color, type Group, type Mesh, type MeshPhysicalMaterial } from "three";
import type { Paint, VehicleType } from "../data/fleet";
import { buildCybercab, buildModelY, paintHex } from "../vehicles/buildVehicles";

type Props = {
  type: VehicleType;
  paint: Paint;
  compact?: boolean;
  autoRotate?: boolean;
  className?: string;
};

const GLB: Record<VehicleType, string> = {
  cybercab: "/models/cybercab.glb",
  "model-y": "/models/model-y.glb",
};

function tintBody(root: Group, paint: Paint) {
  const color = new Color(paintHex[paint]);
  root.traverse((child) => {
    const mesh = child as Mesh;
    if (mesh.name === "Body" && mesh.material) {
      const mat = (mesh.material as MeshPhysicalMaterial).clone();
      mat.color = color;
      mesh.material = mat;
    }
  });
}

function GltfCar({ type, paint }: { type: VehicleType; paint: Paint }) {
  const gltf = useGLTF(GLB[type]);
  const clone = useMemo(() => gltf.scene.clone(true) as Group, [gltf.scene]);
  useLayoutEffect(() => {
    tintBody(clone, paint);
  }, [clone, paint]);
  return <primitive object={clone} />;
}

function BuiltCar({ type, paint, segments }: { type: VehicleType; paint: Paint; segments: number }) {
  const object = useMemo<Group>(() => {
    return type === "cybercab" ? buildCybercab(paint, segments) : buildModelY(paint, segments);
  }, [type, paint, segments]);

  useEffect(() => {
    return () => {
      object.traverse((child) => {
        const mesh = child as Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
    };
  }, [object]);

  return <primitive object={object} />;
}

function Stage({ type, paint, compact, autoRotate }: Omit<Props, "className">) {
  const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches;
  const light = Boolean(compact || mobile);

  return (
    <>
      <color attach="background" args={["#050505"]} />
      <hemisphereLight args={["#e8eef4", "#0a0a0a", 0.42]} />
      <directionalLight position={[4.6, 8.2, 3.2]} intensity={2.35} castShadow={!light} />
      <directionalLight position={[-5, 2.4, -3.5]} intensity={0.55} color="#a8b2bf" />
      <spotLight position={[2.2, 6.4, 5]} intensity={light ? 18 : 32} angle={0.42} penumbra={0.85} />
      {light ? <BuiltCar type={type} paint={paint} segments={26} /> : <GltfCar type={type} paint={paint} />}
      <ContactShadows opacity={0.4} scale={12} blur={2.5} far={2.8} />
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.72}
        maxPolarAngle={1.4}
        minDistance={compact ? 4.4 : 3.7}
        maxDistance={compact ? 7.6 : 8.6}
        autoRotate={autoRotate !== false}
        autoRotateSpeed={0.32}
      />
    </>
  );
}

export default function VehicleViewer({ type, paint, compact, autoRotate, className = "" }: Props) {
  return (
    <div className={`viewer ${compact ? "compact" : ""} ${className}`.trim()}>
      <Suspense fallback={<div className="viewer-fallback" />}>
        <Canvas
          dpr={compact ? [1, 1.2] : [1, 1.65]}
          camera={{ position: [3.45, 1.32, 4.7], fov: compact ? 36 : 30 }}
          gl={{ antialias: true, toneMapping: ACESFilmicToneMapping }}
        >
          <Stage type={type} paint={paint} compact={compact} autoRotate={autoRotate} />
        </Canvas>
      </Suspense>
      <p className="viewer-hint">Drag to orbit · pinch or scroll to zoom</p>
    </div>
  );
}

useGLTF.preload("/models/cybercab.glb");
useGLTF.preload("/models/model-y.glb");
