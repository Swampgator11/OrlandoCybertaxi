import { useEffect, useMemo, useRef, useState } from "react";
import type { Paint, VehicleType } from "../data/fleet";
import { framesFor } from "../data/turntable";
import Bezel from "./Bezel";

type Props = {
  type: VehicleType;
  paint: Paint;
  compact?: boolean;
  autoRotate?: boolean;
  className?: string;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.7;
const ORBIT_SPEED = 0.38;

function wrap(value: number, n: number) {
  if (n <= 0) return 0;
  const m = value % n;
  return m < 0 ? m + n : m;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function VehicleViewer({ type, paint, compact, autoRotate, className = "" }: Props) {
  const frames = useMemo(() => framesFor(type, paint), [type, paint]);
  const wrapEl = useRef<HTMLDivElement>(null);
  const stageEl = useRef<HTMLDivElement>(null);
  const imgA = useRef<HTMLImageElement>(null);
  const imgB = useRef<HTMLImageElement>(null);
  const angle = useRef(0);
  const zoom = useRef(1);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const shown = useRef({ a: -1, b: -1 });
  const [zoomUi, setZoomUi] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    angle.current = 0;
    zoom.current = 1;
    shown.current = { a: -1, b: -1 };
    setZoomUi(1);
    setReady(false);
    let left = frames.length;
    if (!left) {
      setReady(true);
      return;
    }
    frames.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        left -= 1;
        if (left <= 0) setReady(true);
      };
      img.src = src;
    });
  }, [frames]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const paintFrame = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      const n = frames.length;
      if (n > 1 && autoRotate !== false && !dragging.current && !pinch.current) {
        angle.current += (dt / 1000) * ORBIT_SPEED;
      }
      const a = wrap(angle.current, Math.max(n, 1));
      const i0 = n ? Math.floor(a) % n : 0;
      const i1 = n ? (i0 + 1) % n : 0;
      const mix = n > 1 ? a - Math.floor(a) : 0;
      if (imgA.current && frames[i0] && shown.current.a !== i0) {
        imgA.current.src = frames[i0];
        shown.current.a = i0;
      }
      if (imgB.current && frames[i1] && shown.current.b !== i1) {
        imgB.current.src = frames[i1];
        shown.current.b = i1;
      }
      if (imgA.current) imgA.current.style.opacity = String(1 - mix);
      if (imgB.current) imgB.current.style.opacity = String(mix);
      if (stageEl.current) stageEl.current.style.transform = `scale(${zoom.current})`;
      raf = window.requestAnimationFrame(paintFrame);
    };
    raf = window.requestAnimationFrame(paintFrame);
    return () => window.cancelAnimationFrame(raf);
  }, [autoRotate, frames]);

  const applyZoom = (next: number) => {
    zoom.current = clamp(next, MIN_ZOOM, MAX_ZOOM);
    setZoomUi(zoom.current);
  };

  useEffect(() => {
    const el = wrapEl.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      applyZoom(zoom.current * factor);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const pointerDistance = () => {
    const pts = [...pointers.current.values()];
    if (pts.length < 2) return 0;
    const dx = pts[0].x - pts[1].x;
    const dy = pts[0].y - pts[1].y;
    return Math.hypot(dx, dy);
  };

  return (
    <Bezel
      compact={compact}
      plaque={compact ? undefined : "Drag to orbit · pinch or scroll to zoom · real photographs"}
      className={className}
    >
      <div
        ref={wrapEl}
        className={`viewer turntable ${compact ? "compact" : ""} ${ready ? "ready" : ""}`.trim()}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest(".viewer-zoom")) return;
          wrapEl.current?.setPointerCapture(e.pointerId);
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (pointers.current.size === 2) {
            dragging.current = false;
            pinch.current = { dist: pointerDistance() || 1, zoom: zoom.current };
            return;
          }
          dragging.current = true;
          lastX.current = e.clientX;
        }}
        onPointerMove={(e) => {
          if (!pointers.current.has(e.pointerId)) return;
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (pinch.current && pointers.current.size >= 2) {
            const dist = pointerDistance();
            if (dist > 0) applyZoom(pinch.current.zoom * (dist / pinch.current.dist));
            return;
          }
          if (!dragging.current || frames.length < 2) return;
          const el = wrapEl.current;
          const width = el?.clientWidth || 1;
          const delta = e.clientX - lastX.current;
          lastX.current = e.clientX;
          angle.current -= (delta / width) * frames.length * 1.15;
        }}
        onPointerUp={(e) => {
          pointers.current.delete(e.pointerId);
          if (pointers.current.size < 2) pinch.current = null;
          if (pointers.current.size === 0) dragging.current = false;
        }}
        onPointerCancel={(e) => {
          pointers.current.delete(e.pointerId);
          pinch.current = null;
          dragging.current = false;
        }}
        onDoubleClick={() => applyZoom(1)}
      >
        <div ref={stageEl} className="orbit-stage">
          {frames[0] ? (
            <>
              <img ref={imgA} src={frames[0]} alt={type === "cybercab" ? "Cybercab" : "Model Y"} draggable={false} />
              <img ref={imgB} src={frames[1] ?? frames[0]} alt="" draggable={false} />
            </>
          ) : (
            <div className="viewer-fallback" />
          )}
        </div>
        {!compact && (
          <div className="viewer-zoom" role="group" aria-label="Zoom">
            <button type="button" aria-label="Zoom out" onClick={() => applyZoom(zoom.current / 1.18)}>
              −
            </button>
            <span>{Math.round(zoomUi * 100)}%</span>
            <button type="button" aria-label="Zoom in" onClick={() => applyZoom(zoom.current * 1.18)}>
              +
            </button>
          </div>
        )}
      </div>
    </Bezel>
  );
}
