"use client";

import { useState } from "react";
import { ChevronDownIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export interface Project {
  name: string;
  year: string;
  stack: string[];
  description: string;
  link?: string;
}

export default function ProjectCard({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "border border-zinc-200 bg-white transition-all duration-200",
        "hover:-translate-y-0.5",
        open ? "shadow-card-pink" : "hover:shadow-card"
      )}
    >
      {/* Header — always visible, clickable */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-4 p-5 text-left"
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0 space-y-2">
          {/* Name + year */}
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <span className="font-bold text-base text-cBlack">{project.name}</span>
            <span className="text-xs font-mono text-zinc-400 flex-shrink-0">{project.year}</span>
          </div>

          {/* Tech pills */}
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="text-xs border border-zinc-200 text-zinc-600 px-2 py-0.5 hover:border-cPink hover:text-cPink transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <ChevronDownIcon
          className={cn(
            "w-4 h-4 text-zinc-400 flex-shrink-0 mt-1 transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Expandable body */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-400",
          open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-5 pb-5 border-t border-zinc-100">
          <p className="text-sm text-zinc-600 leading-relaxed mt-4">{project.description}</p>

          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-medium text-cPink hover:underline"
            >
              View project
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
