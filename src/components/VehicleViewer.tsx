import { Suspense, useEffect, useLayoutEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, MeshReflectorMaterial, OrbitControls } from "@react-three/drei";
import {
  ACESFilmicToneMapping,
  PMREMGenerator,
  SRGBColorSpace,
  type Group,
  type Mesh,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { Paint, VehicleType } from "../data/fleet";
import { buildCybercab, buildModelY } from "../vehicles/buildVehicles";

type Props = {
  type: VehicleType;
  paint: Paint;
  compact?: boolean;
  autoRotate?: boolean;
  className?: string;
};

function Studio() {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.background = null;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

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
  const targetY = tall ? 0.68 : 0.52;

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <Studio />
      <ambientLight intensity={0.08} />
      <directionalLight position={[3.8, 6.4, 2.6]} intensity={1.15} />
      <directionalLight position={[-4.2, 2.2, -2.4]} intensity={0.28} color="#c9d2dc" />
      <Car type={type} paint={paint} segments={light ? 28 : 64} />
      <ContactShadows opacity={0.55} scale={14} blur={2.8} far={3.2} color="#000" />
      {!light && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
          <circleGeometry args={[9, 64]} />
          <MeshReflectorMaterial
            blur={[300, 80]}
            resolution={768}
            mixBlur={1}
            mixStrength={28}
            roughness={0.92}
            color="#080808"
            metalness={0.55}
          />
        </mesh>
      )}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        target={[0, targetY, 0]}
        minPolarAngle={0.85}
        maxPolarAngle={1.38}
        minDistance={compact ? 4.6 : 4.2}
        maxDistance={compact ? 7.8 : 8.2}
        autoRotate={autoRotate !== false}
        autoRotateSpeed={0.28}
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
            position: compact ? [3.4, tall ? 1.2 : 1.05, 4.5] : [4.15, tall ? 1.18 : 1.02, 4.85],
            fov: compact ? 32 : 26,
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
