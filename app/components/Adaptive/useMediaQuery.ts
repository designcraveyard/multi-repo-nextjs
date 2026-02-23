// useMediaQuery.ts
// Client-side media query hook for responsive component logic.
//
// Usage:
//   const isDesktop = useMediaQuery("(min-width: 768px)");
//
// Returns false during SSR (mobile-first default).

"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    function onChange(e: MediaQueryListEvent) {
      setMatches(e.matches);
    }

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
