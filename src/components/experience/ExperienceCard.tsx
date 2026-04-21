"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface TechItem {
  name: string;
  logo?: string;
}

interface ExperienceCardProps {
  company: string;
  title: string;
  dates: string;
  location?: string;
  stack?: TechItem[];
  link?: string;
  children: React.ReactNode;
}

export default function ExperienceCard({
  company,
  title,
  dates,
  location,
  stack = [],
  link,
  children,
}: ExperienceCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "border border-zinc-200 bg-white transition-all duration-200",
        "hover:-translate-y-0.5",
        expanded ? "shadow-card-hover" : "hover:shadow-card"
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-start justify-between p-6 text-left gap-4"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            {link ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-lg text-cBlack hover:underline"
              >
                {company}
              </a>
            ) : (
              <span className="font-bold text-lg text-cBlack">{company}</span>
            )}
            <span className="text-zinc-500 text-sm">·</span>
            <span className="text-sm text-zinc-600">{title}</span>
          </div>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-zinc-400">
            <span>{dates}</span>
            {location && <span>{location}</span>}
          </div>
        </div>
        <ChevronDownIcon
          className={cn(
            "w-5 h-5 text-zinc-400 flex-shrink-0 transition-transform duration-300",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Expandable body */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-500",
          expanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-6 pb-6 space-y-4">
          <div className="text-sm text-zinc-600 leading-relaxed space-y-2">{children}</div>

          {/* Tech stack */}
          {stack.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {stack.map(({ name, logo }) => (
                <div
                  key={name}
                  title={name}
                  className="group relative flex items-center gap-1.5 border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 hover:border-cBlue transition-colors"
                >
                  {logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt={name} className="w-4 h-4 object-contain" />
                  )}
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
