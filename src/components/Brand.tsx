import React from "react";

type BrandVariant = "hero" | "app";

export function Brand({ variant = "hero" }: { variant?: BrandVariant }) {
  const base =
    "font-semibold tracking-[0.3em] uppercase bg-gradient-to-r from-[#f5f5f5] to-[#a5a5a5] bg-clip-text text-transparent";
  const size =
    variant === "hero"
      ? "text-xl md:text-2xl"
      : "text-sm md:text-base";

  return <span className={`${base} ${size}`}>omori</span>;
}


