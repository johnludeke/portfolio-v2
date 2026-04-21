"use client";

import FloatingShapes, { ShapeDef } from "@/components/ui/FloatingShapes";

const SHAPES: ShapeDef[] = [
  {
    type: "circle",
    color: "#e040fb",
    size: 170,
    bx: 83,
    by: 12,
    depth: 0.05,
    rot: 0,
    rotD: 10,
    fp: 0.0,
  },
  {
    type: "triangle",
    color: "#ff6b2b",
    size: 88,
    bx: 9,
    by: 68,
    depth: -0.08,
    rot: 20,
    rotD: -22,
    fp: 1.3,
  },
  {
    type: "square",
    color: "#76e44a",
    size: 54,
    bx: 16,
    by: 18,
    depth: 0.07,
    rot: 15,
    rotD: 18,
    fp: 2.6,
  },
  {
    type: "ring",
    color: "#22d3ee",
    size: 100,
    bx: 72,
    by: 78,
    depth: -0.11,
    rot: 0,
    rotD: 0,
    fp: 3.9,
  },
  {
    type: "circle",
    color: "#76e44a",
    size: 38,
    bx: 55,
    by: 90,
    depth: 0.04,
    rot: 0,
    rotD: 0,
    fp: 5.2,
  },
  {
    type: "triangle",
    color: "#22d3ee",
    size: 46,
    bx: 91,
    by: 48,
    depth: 0.09,
    rot: -12,
    rotD: -18,
    fp: 6.5,
  },
  {
    type: "pill",
    color: "#ff6b2b",
    size: 24,
    bx: 37,
    by: 5,
    depth: -0.13,
    rot: 35,
    rotD: 5,
    fp: 7.8,
  },
  {
    type: "square",
    color: "#e040fb",
    size: 32,
    bx: 5,
    by: 40,
    depth: 0.1,
    rot: 28,
    rotD: 30,
    fp: 9.1,
  },
  {
    type: "ring",
    color: "#ff6b2b",
    size: 62,
    bx: 62,
    by: 28,
    depth: -0.06,
    rot: 0,
    rotD: -12,
    fp: 0.7,
  },
  {
    type: "circle",
    color: "#e040fb",
    size: 28,
    bx: 28,
    by: 50,
    depth: 0.12,
    rot: 0,
    rotD: 0,
    fp: 2.1,
  },
  {
    type: "triangle",
    color: "#76e44a",
    size: 42,
    bx: 48,
    by: 14,
    depth: -0.05,
    rot: -5,
    rotD: 15,
    fp: 3.5,
  },
  {
    type: "square",
    color: "#22d3ee",
    size: 20,
    bx: 78,
    by: 60,
    depth: 0.14,
    rot: 50,
    rotD: -8,
    fp: 4.8,
  },
];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white"
    >
      <FloatingShapes shapes={SHAPES} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 animate-fade-up">
        <p className="font-mono text-sm tracking-widest text-cPink mb-3 uppercase">
          Hello, I&apos;m
        </p>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-cBlack leading-none">
          John Ludeke
        </h1>
        <p className="mt-4 text-lg md:text-xl text-zinc-500 max-w-md mx-auto">
          Software engineer at the intersection of HFT and UX.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href="/#experience"
            className="bg-cBlack text-white text-sm font-medium px-6 py-3 hover:-translate-y-0.5 hover:shadow-card transition-all duration-150"
          >
            View My Work
          </a>
          <a
            href="/#contact"
            className="border border-cBlack text-cBlack text-sm font-medium px-6 py-3 hover:-translate-y-0.5 hover:shadow-card transition-all duration-150"
          >
            Get in Touch
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30">
        <span className="text-xs text-zinc-400 tracking-widest uppercase">
          Scroll
        </span>
        <div className="w-px h-8 bg-zinc-400" />
      </div>
    </section>
  );
}
