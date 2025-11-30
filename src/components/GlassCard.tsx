"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface GlassCardProps {
  href?: string;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  isActive?: boolean;
  size?: "default" | "wide" | "tall";
  className?: string;
  children?: ReactNode;
}

export function GlassCard({
  href,
  icon,
  title,
  subtitle,
  isActive = false,
  size = "default",
  className = "",
  children,
}: GlassCardProps) {
  const sizeClasses = {
    default: "col-span-1",
    wide: "col-span-2",
    tall: "col-span-1 row-span-2",
  };

  const wrapperClasses = sizeClasses[size];

  const content = (
    <div
      className={`
        glass specular p-5 min-h-[140px] flex flex-col justify-between h-full
        ${isActive ? "glass-active" : ""}
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        {icon && (
          <div className={`text-2xl ${isActive ? "opacity-90" : ""}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-auto">
        <h3
          className={`font-semibold text-base ${
            isActive ? "text-zinc-900" : "text-white"
          }`}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className={`text-sm mt-0.5 ${
              isActive ? "text-zinc-600" : "text-zinc-400"
            }`}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={`block ${wrapperClasses}`}>
        {content}
      </Link>
    );
  }

  return <div className={wrapperClasses}>{content}</div>;
}
