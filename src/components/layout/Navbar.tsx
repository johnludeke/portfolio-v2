"use client";

import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useScrolled, useScrollSpy } from "@/hooks/useScrollSpy";
import { cn } from "@/lib/utils";
import MobileMenu from "./MobileMenu";

const SECTION_IDS = ["hero", "about", "experience", "contact"];

const NAV_LINKS = [
  { href: "/#about", label: "About", sectionId: "about" },
  { href: "/#experience", label: "Experience", sectionId: "experience" },
  { href: "/#contact", label: "Contact", sectionId: "contact" },
  { href: "/blog", label: "Blog", sectionId: "" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled(20);
  const activeId = useScrollSpy(SECTION_IDS);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
        {/* Logo / Name */}
        <a
          href="/#hero"
          className="font-bold text-lg text-cBlack hover:opacity-70 transition-opacity"
        >
          JD
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label, sectionId }) => {
            const isActive = sectionId ? activeId === sectionId : false;
            return (
              <a
                key={href}
                href={href}
                className={cn(
                  "relative text-sm font-medium transition-colors group",
                  isActive ? "text-cBlack" : "text-zinc-500 hover:text-cBlack"
                )}
              >
                {label}
                <span
                  className={cn(
                    "absolute -bottom-0.5 left-0 h-px bg-cBlack transition-all duration-200",
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  )}
                />
              </a>
            );
          })}
        </nav>

        {/* Hamburger */}
        <button
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden p-2 text-cBlack"
        >
          {menuOpen ? (
            <XMarkIcon className="w-5 h-5" />
          ) : (
            <Bars3Icon className="w-5 h-5" />
          )}
        </button>
      </div>

      <MobileMenu
        open={menuOpen}
        activeId={activeId}
        onClose={() => setMenuOpen(false)}
      />
    </header>
  );
}
