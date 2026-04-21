"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#e040fb", "#76e44a", "#22d3ee", "#ff6b2b"];

export default function CursorTrail() {
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime.current < 38) return;
      lastTime.current = now;

      // Skip if cursor barely moved
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      if (dx * dx + dy * dy < 16) return;
      lastPos.current = { x: e.clientX, y: e.clientY };

      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const isCircle = Math.random() > 0.35;
      const size = 5 + Math.random() * 5;
      const driftX = (Math.random() - 0.5) * 18;
      const driftY = (Math.random() - 0.5) * 18;

      const el = document.createElement("div");
      el.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${isCircle ? "50%" : "2px"};
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%) rotate(${Math.random() * 60}deg) scale(1);
        opacity: 0.55;
        transition: transform 600ms ease-out, opacity 600ms ease-out;
        will-change: transform, opacity;
      `;

      document.body.appendChild(el);

      requestAnimationFrame(() => {
        el.style.transform = `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) rotate(${Math.random() * 120}deg) scale(0)`;
        el.style.opacity = "0";
      });

      setTimeout(() => el.remove(), 650);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return null;
}
