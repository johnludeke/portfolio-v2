"use client";

import { useEffect, useRef } from "react";

export interface ShapeDef {
  type: "circle" | "triangle" | "square" | "ring" | "pill";
  color: string;
  size: number;
  bx: number;   // % from left
  by: number;   // % from top
  depth: number; // parallax factor (negative = opposite direction)
  rot: number;   // base rotation degrees
  rotD: number;  // rotation delta from cursor
  fp: number;    // idle float phase offset
  opacity?: number;
}

function shapeStyle(
  s: ShapeDef
): React.CSSProperties {
  const op = s.opacity ?? 0.28;
  const base: React.CSSProperties = {
    position: "absolute",
    top: `${s.by}%`,
    left: `${s.bx}%`,
    width: s.size,
    height: s.size,
    opacity: op,
    pointerEvents: "none",
    willChange: "transform",
    transform: `rotate(${s.rot}deg)`,
  };

  switch (s.type) {
    case "circle":
      return { ...base, borderRadius: "50%", backgroundColor: s.color };
    case "square":
      return { ...base, backgroundColor: s.color };
    case "triangle":
      return { ...base, backgroundColor: s.color, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" };
    case "ring":
      return {
        ...base,
        borderRadius: "50%",
        border: `${Math.max(4, s.size * 0.1)}px solid ${s.color}`,
        backgroundColor: "transparent",
      };
    case "pill":
      return { ...base, width: s.size * 2.4, borderRadius: 999, backgroundColor: s.color };
  }
}

interface FloatingShapesProps {
  shapes: ShapeDef[];
}

export default function FloatingShapes({ shapes }: FloatingShapesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shapeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const lerped = useRef({ x: 0.5, y: 0.5 });
  const frame = useRef(0);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX / window.innerWidth;
      mouse.current.y = e.clientY / window.innerHeight;
    };

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      mouse.current.y = maxScroll > 0 ? window.scrollY / maxScroll : 0.5;
      mouse.current.x = 0.5;
    };

    if (isTouchDevice) {
      onScroll(); // set initial position
      window.addEventListener("scroll", onScroll, { passive: true });
    } else {
      window.addEventListener("mousemove", onMove);
    }

    const animate = () => {
      frame.current += 0.012;
      const t = frame.current;
      const ease = 0.055;

      lerped.current.x += (mouse.current.x - lerped.current.x) * ease;
      lerped.current.y += (mouse.current.y - lerped.current.y) * ease;

      const w = containerRef.current?.offsetWidth ?? window.innerWidth;
      const h = containerRef.current?.offsetHeight ?? window.innerHeight;
      const cx = (lerped.current.x - 0.5) * w;
      const cy = (lerped.current.y - 0.5) * h;

      shapes.forEach((s, i) => {
        const el = shapeRefs.current[i];
        if (!el) return;
        const tx = cx * s.depth + Math.cos(t * 0.6 + s.fp) * 6;
        const ty = cy * s.depth + Math.sin(t * 0.8 + s.fp) * 9;
        const rot = s.rot + (lerped.current.x - 0.5) * s.rotD;
        el.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
      });

      rafId.current = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          rafId.current = requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(rafId.current);
        }
      },
      { threshold: 0 }
    );

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      if (isTouchDevice) {
        window.removeEventListener("scroll", onScroll);
      } else {
        window.removeEventListener("mousemove", onMove);
      }
      cancelAnimationFrame(rafId.current);
      observer.disconnect();
    };
  }, [shapes]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((s, i) => (
        <div
          key={i}
          ref={(el) => { shapeRefs.current[i] = el; }}
          style={shapeStyle(s)}
        />
      ))}
    </div>
  );
}
