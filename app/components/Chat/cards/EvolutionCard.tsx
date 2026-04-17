"use client";

import { useState } from "react";
import type { EvolutionCardPayload } from "@/lib/agents/types";
import { Lightbox } from "./Lightbox";

interface EvolutionCardProps {
  data: EvolutionCardPayload;
}

export function EvolutionCard({ data }: EvolutionCardProps) {
  const { chain } = data;
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>("");

  if (!chain || chain.length === 0) return null;

  return (
    <>
      <div
        className="shrink-0 rounded-2xl border p-4"
        style={{
          minWidth: 320,
          borderColor: "var(--border-default)",
          background: "var(--surfaces-base-primary)",
        }}
      >
        <h3
          className="text-xs font-semibold uppercase tracking-wide mb-3"
          style={{ color: "var(--typography-secondary)" }}
        >
          Evolution Chain
        </h3>
        <div className="mac-scroll flex items-center gap-3 overflow-x-auto pb-1">
          {chain.map((stage, index) => (
            <div key={`${stage.name}-${index}`} className="flex items-center gap-3 shrink-0">
              {/* Arrow + trigger */}
              {index > 0 && (
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  {stage.trigger && (
                    <span
                      className="text-[10px] max-w-[72px] text-center leading-tight"
                      style={{ color: "var(--typography-secondary)" }}
                    >
                      {stage.trigger}
                    </span>
                  )}
                  <span
                    className="text-lg"
                    style={{ color: "var(--typography-secondary)" }}
                  >
                    →
                  </span>
                </div>
              )}

              {/* Stage: sprite + name */}
              <button
                onClick={() => { setLightboxSrc(stage.sprite); setLightboxAlt(stage.name); }}
                className="flex flex-col items-center gap-1.5 shrink-0 rounded-lg p-2 cursor-zoom-in hover:bg-[var(--surfaces-base-low-contrast)] transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stage.sprite}
                  alt={stage.name}
                  className="w-20 h-20 object-contain"
                  loading="lazy"
                />
                <span
                  className="text-xs font-medium capitalize"
                  style={{ color: "var(--typography-primary)" }}
                >
                  {stage.name}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <Lightbox src={lightboxSrc} alt={lightboxAlt} onClose={() => setLightboxSrc(null)} />
    </>
  );
}
