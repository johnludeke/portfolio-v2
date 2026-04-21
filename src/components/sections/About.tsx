"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import FloatingShapes, { ShapeDef } from "@/components/ui/FloatingShapes";
import Image from "next/image";

const SHAPES: ShapeDef[] = [
  {
    type: "circle",
    color: "#e040fb",
    size: 110,
    bx: 90,
    by: 4,
    depth: 0.04,
    rot: 0,
    rotD: 8,
    fp: 0,
    opacity: 0.22,
  },
  {
    type: "ring",
    color: "#22d3ee",
    size: 75,
    bx: 2,
    by: 8,
    depth: -0.05,
    rot: 0,
    rotD: 0,
    fp: 2.5,
    opacity: 0.22,
  },
  {
    type: "square",
    color: "#76e44a",
    size: 42,
    bx: 3,
    by: 62,
    depth: -0.07,
    rot: 20,
    rotD: -15,
    fp: 4.0,
    opacity: 0.22,
  },
  {
    type: "triangle",
    color: "#ff6b2b",
    size: 58,
    bx: 93,
    by: 72,
    depth: 0.06,
    rot: -8,
    rotD: 12,
    fp: 6.0,
    opacity: 0.22,
  },
];

export default function About() {
  return (
    <section id="about" className="relative py-24 bg-white overflow-hidden">
      <FloatingShapes shapes={SHAPES} />

      <div className="mx-auto max-w-5xl px-6 relative z-10">
        <SectionHeader label="About Me" accent="cGreen" className="mb-12" />

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="space-y-4 text-zinc-600 leading-relaxed">
            <p>
              I&apos;m a software engineer who enjoys learning, building, and
              optimizing complex systems. I balance this with a deep
              understanding of UI/UX, having experience in product management
              and design. Always looking for an excuse to streamline for the
              human.
            </p>
            <p>
              Big fan of Mario Kart. I&apos;ve been cooking ramen, short rib,
              crepes, and fried chicken sandwiches. Patiently waiting for the
              next season of Jujutsu Kaisen. Bouldering. Graphic design. Making
              PCB gadgets. Clawing back to the top rank in Rocket League. Love
              to travel. Photography / videography.
            </p>
            <div className="pt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-cBlack">Location</p>
                <p>Chicago, IL</p>
              </div>
              <div>
                <p className="font-semibold text-cBlack">Education</p>
                <p>B.S. Computer Engineering @ UIUC</p>
              </div>
              <div>
                <p className="font-semibold text-cBlack">Focus</p>
                <p>High-Frequency Trading</p>
              </div>
              <div>
                <p className="font-semibold text-cBlack">Currently</p>
                <p>Strategy @ IMC Trading</p>
              </div>
            </div>
          </div>

          {/* Headshot */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 -bottom-2 -right-2 border-2 border-cGreen" />
              <div className="relative w-full h-full bg-zinc-100 overflow-hidden">
                <Image
                  src="/headshot.jpg"
                  alt="Headshot"
                  fill
                  priority
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
