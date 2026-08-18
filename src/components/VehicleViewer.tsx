import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, MeshReflectorMaterial, OrbitControls } from "@react-three/drei";
import { ACESFilmicToneMapping, SRGBColorSpace, type Group, type Mesh } from "three";
import type { Paint, VehicleType } from "../data/fleet";
import { buildCybercab, buildModelY } from "../vehicles/buildVehicles";

type Props = {
  type: VehicleType;
  paint: Paint;
  compact?: boolean;
  autoRotate?: boolean;
  className?: string;
};

function Car({ type, paint, segments }: { type: VehicleType; paint: Paint; segments: number }) {
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
  const tall = type === "model-y";
  const targetY = tall ? 0.78 : 0.62;

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <Environment files="/env/studio.hdr" background={false} environmentIntensity={0.95} />
      <ambientLight intensity={0.06} />
      <directionalLight position={[3.6, 6.8, 3.2]} intensity={1.25} />
      <directionalLight position={[-5.2, 2.4, -2.8]} intensity={0.32} color="#c5d0dc" />
      <directionalLight position={[0.2, 2.8, 5.4]} intensity={0.35} />
      <Car type={type} paint={paint} segments={light ? 24 : 56} />
      <ContactShadows opacity={0.58} scale={16} blur={2.6} far={3.4} color="#000" />
      {!light && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
          <circleGeometry args={[10, 64]} />
          <MeshReflectorMaterial
            blur={[280, 70]}
            resolution={768}
            mixBlur={1}
            mixStrength={26}
            roughness={0.9}
            color="#080808"
            metalness={0.58}
          />
        </mesh>
      )}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        target={[0, targetY, 0]}
        minPolarAngle={0.88}
        maxPolarAngle={1.4}
        minDistance={compact ? 5.2 : 4.8}
        maxDistance={compact ? 8.4 : 9.2}
        autoRotate={autoRotate !== false}
        autoRotateSpeed={0.26}
      />
    </>
  );
}

export default function VehicleViewer({ type, paint, compact, autoRotate, className = "" }: Props) {
  const tall = type === "model-y";
  return (
    <div className={`viewer ${compact ? "compact" : ""} ${className}`.trim()}>
      <Suspense fallback={<div className="viewer-fallback" />}>
        <Canvas
          dpr={compact ? [1, 1.25] : [1, 1.75]}
          camera={{
            position: compact ? [3.8, tall ? 1.35 : 1.15, 5.1] : [4.6, tall ? 1.32 : 1.12, 5.4],
            fov: compact ? 34 : 28,
          }}
          gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, outputColorSpace: SRGBColorSpace }}
        >
          <Stage type={type} paint={paint} compact={compact} autoRotate={autoRotate} />
        </Canvas>
      </Suspense>
      <p className="viewer-hint">Drag to orbit · pinch or scroll to zoom</p>
    </div>
  );
}
