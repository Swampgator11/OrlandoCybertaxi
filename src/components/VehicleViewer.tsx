import { useEffect, useMemo, useRef, useState } from "react";
import type { Paint, VehicleType } from "../data/fleet";
import { framesFor } from "../data/turntable";

type Props = {
  type: VehicleType;
  paint: Paint;
  compact?: boolean;
  autoRotate?: boolean;
  className?: string;
};

export default function VehicleViewer({ type, paint, compact, autoRotate, className = "" }: Props) {
  const frames = useMemo(() => framesFor(type, paint), [type, paint]);
  const [index, setIndex] = useState(0);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIndex(0);
    frames.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [frames]);

  useEffect(() => {
    if (autoRotate === false || frames.length < 2) return;
    const id = window.setInterval(() => {
      if (drag.current) return;
      setIndex((i) => (i + 1) % frames.length);
    }, 1400);
    return () => window.clearInterval(id);
  }, [autoRotate, frames.length]);

  const move = (clientX: number) => {
    const el = wrap.current;
    if (!drag.current || !el || frames.length < 2) return;
    const width = el.clientWidth || 1;
    const delta = clientX - drag.current.x;
    const steps = Math.round((delta / width) * frames.length * 1.6);
    if (steps === 0) return;
    const next = (drag.current.start - steps) % frames.length;
    setIndex(next < 0 ? next + frames.length : next);
  };

  return (
    <div
      ref={wrap}
      className={`viewer turntable ${compact ? "compact" : ""} ${className}`.trim()}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, start: index };
        wrap.current?.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => move(e.clientX)}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      {frames[index] ? (
        <img src={frames[index]} alt={type === "cybercab" ? "Cybercab" : "Model Y"} draggable={false} />
      ) : (
        <div className="viewer-fallback" />
      )}
      <p className="viewer-hint">Drag to orbit · real photographs</p>
    </div>
  );
}
