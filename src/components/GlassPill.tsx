"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface GlassPillProps {
  href?: string;
  icon?: ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function GlassPill({
  href,
  icon,
  label,
  isActive = false,
  onClick,
  className = "",
}: GlassPillProps) {
  const pillClasses = `
    px-4 py-2 inline-flex items-center gap-2 cursor-pointer transition-all
    ${isActive
      ? "bg-white/90 text-zinc-900 rounded-full"
      : "glass-pill text-white"}
    ${className}
  `;

  const content = (
    <>
      {icon && <span className="text-sm">{icon}</span>}
      <span className="text-sm font-medium">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={pillClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={pillClasses}>
      {content}
    </button>
  );
}
