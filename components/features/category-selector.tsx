"use client";
import { useIsMobile } from "@/hooks/use-mobile";

export function CategorySelector() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <div>Mobile category selector</div>;
  } else {
    return <div></div>;
  }
}
