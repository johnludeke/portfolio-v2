import SectionHeader from "@/components/ui/SectionHeader";
import FloatingShapes, { ShapeDef } from "@/components/ui/FloatingShapes";
import WorkTimeline from "@/components/experience/WorkTimeline";
import ProjectGrid from "@/components/experience/ProjectGrid";

// Keep shapes in the upper ~60% of the section so they don't crowd the bottom edge
const SHAPES: ShapeDef[] = [
  { type: "triangle", color: "#ff6b2b", size: 72, bx: 94, by: 6,  depth: 0.05,  rot: 10, rotD: -18, fp: 1.0, opacity: 0.2 },
  { type: "circle",   color: "#e040fb", size: 52, bx: 1,  by: 18, depth: -0.08, rot: 0,  rotD: 0,   fp: 3.0, opacity: 0.2 },
  { type: "ring",     color: "#76e44a", size: 84, bx: 90, by: 42, depth: 0.04,  rot: 0,  rotD: 10,  fp: 5.0, opacity: 0.2 },
  { type: "square",   color: "#22d3ee", size: 36, bx: 3,  by: 55, depth: -0.06, rot: 25, rotD: 20,  fp: 7.0, opacity: 0.2 },
];

export default function Experience() {
  return (
    <section id="experience" className="relative pt-24 pb-16 bg-zinc-50 overflow-hidden">
      <FloatingShapes shapes={SHAPES} />

      <div className="mx-auto max-w-5xl px-6 relative z-10">
        <SectionHeader label="Experience" accent="cOrange" className="mb-14" />
        <WorkTimeline />

        <div className="mt-20">
          <SectionHeader label="Projects" accent="cPink" className="mb-10" />
          <ProjectGrid />
        </div>
      </div>
    </section>
  );
}
