"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Experience" },
  { href: "/#contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
];

interface MobileMenuProps {
  open: boolean;
  activeId: string;
  onClose: () => void;
}

export default function MobileMenu({ open, activeId, onClose }: MobileMenuProps) {
  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out md:hidden",
        open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <nav className="flex flex-col border-t border-zinc-100 bg-white px-6 py-4 gap-1">
        {NAV_LINKS.map(({ href, label }) => {
          const sectionId = href.replace("/#", "");
          const isActive = activeId === sectionId;
          return (
            <a
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "py-2 text-sm font-medium transition-colors",
                isActive ? "text-cBlack" : "text-zinc-500 hover:text-cBlack"
              )}
            >
              {label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
