// useMediaQuery.ts
// Client-side media query hook for responsive component logic.
//
// Usage:
//   const isDesktop = useMediaQuery("(min-width: 768px)");
//
// Returns false during SSR (mobile-first default). Uses useSyncExternalStore
// to avoid the "setState in effect" cascade that a useEffect-based
// implementation triggers on React 19.

"use client";

import { useCallback, useSyncExternalStore } from "react";

function getServerSnapshot(): boolean {
  return false;
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
