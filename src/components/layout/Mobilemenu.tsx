"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";

const LINKS = [
  { href: "#studio", label: "The Studio" },
  { href: "#process", label: "Our Process" },
  { href: "#darkroom", label: "Darkroom" },
  { href: "/archive", label: "Archive" },
];

// Dipasang di dalam <header className="paper relative ..."> milik page.tsx.
// Dropdown memakai absolute terhadap header tersebut, jadi wrapper di sini
// sengaja tidak diberi "relative".
export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="border-2 border-[#2a2119] p-2.5 transition-colors hover:bg-[#2a2119] hover:text-[#f0e5d0] md:hidden"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <ul className="f-mono absolute inset-x-0 top-full z-30 border-b-2 border-[#2a2119]/50 bg-[#efe3c8] px-6 py-2 shadow-[0_10px_20px_rgba(41,28,15,0.25)] md:hidden">
          {LINKS.map((link) => (
            <li key={link.href} className="border-b border-dashed border-[#2a2119]/25">
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-4 text-[12px] font-bold uppercase tracking-[0.16em] hover:text-[#8c3a2c]"
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* Tombol "Enter lab" disembunyikan di header untuk layar sangat kecil */}
          <li className="py-4 sm:hidden">
            <Link
              href="/booth"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 border-2 border-[#2a2119] bg-[#2a2119] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#f0e5d0]"
            >
              Enter lab <ArrowUpRight size={13} />
            </Link>
          </li>
        </ul>
      )}
    </>
  );
}