"use client";

import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type FormField = {
  name: string;
  label: string;
  type: "text" | "select" | "number";
  options?: string[];
  placeholder?: string;
};

type FormConfig = { title: string; fields: FormField[] };

type JobCard = {
  id: string;
  title: string;       // job title
  company: string;
  location: string;    // "Remote" | "Hybrid" | city
  salary?: string;     // "$120k–$150k"
  url?: string;
};

type JobPreferences = {
  job_title: string;
  experience_level: string;
  location?: string;
  remote_preference: string;
  salary_min?: number;
};

// ─────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────

function useSystemTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(mq.matches ? "dark" : "light");
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return theme;
}

// Default messages to cycle through while agent is responding
const CYCLING_MESSAGES = [
  "Thinking...",
  "Searching for opportunities...",
  "Checking your preferences...",
  "Scanning the job market...",
  "Analyzing your profile...",
  "Finding the best matches...",
  "Reviewing job details...",
  "Comparing salaries...",
];

function useCyclingMessage(active: boolean, override: string | null, intervalMs = 2200) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true); // for fade transition

  useEffect(() => {
    if (!active || override) return;
    setIndex(0);
    setVisible(true);
    const timer = setInterval(() => {
      // fade out → swap message → fade in
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % CYCLING_MESSAGES.length);
        setVisible(true);
      }, 300);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [active, override, intervalMs]);

  if (!active) return { message: null, visible: false };
  if (override)  return { message: override, visible: true };
  return { message: CYCLING_MESSAGES[index], visible };
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

function AssistantEmbed() {
  const searchParams = useSearchParams();
  const systemTheme = useSystemTheme();
  const theme = (searchParams.get("theme") as "light" | "dark") ?? systemTheme;
  const isDark = theme === "dark";

  // --- Feature 3: per-tool loading status ---
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [isResponding, setIsResponding] = useState(false);

  // Cycling loading message — auto-rotates when no specific status is set
  const { message: cyclingMessage, visible: msgVisible } = useCyclingMessage(isResponding, loadingStatus);

  // --- Feature 1: preference form (bottom sheet) ---
  const [activeForm, setActiveForm] = useState<FormConfig | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const formResolveRef = useRef<((result: string) => void) | null>(null); // resolves the onClientTool Promise

  // --- Feature 2: horizontal job result cards ---
  const [jobCards, setJobCards] = useState<JobCard[] | null>(null);

  // --- Session ID: persisted in localStorage, used as Supabase key ---
  // Using a ref so client tools always read the latest value without stale closure
  const sessionIdRef = useRef<string>("");
  useEffect(() => {
    let id = localStorage.getItem("chatkit_demo_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("chatkit_demo_session_id", id);
    }
    sessionIdRef.current = id;
  }, []);

  // --- ChatKit response lifecycle ---
  useEffect(() => {
    const onStart = () => { setIsResponding(true); setJobCards(null); };
    const onEnd   = () => { setIsResponding(false); setLoadingStatus(null); };
    document.addEventListener("chatkit.response.start", onStart);
    document.addEventListener("chatkit.response.end",   onEnd);
    return () => {
      document.removeEventListener("chatkit.response.start", onStart);
      document.removeEventListener("chatkit.response.end",   onEnd);
    };
  }, []);

  // ─── useChatKit ─────────────────────────────────────────────
  const chatkit = useChatKit({
    theme,
    api: {
      async getClientSecret() {
        const res = await fetch("/api/chatkit/session", { method: "POST" });
        if (!res.ok) throw new Error("Failed to create session");
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    composer: {
      placeholder: "Ask me to find jobs, update your preferences...",
      attachments: { enabled: true },
    },

    // ── Client Tools ─────────────────────────────────────────
    // Each name here must EXACTLY match the tool name in Agent Builder

    // onClientTool: single dispatcher — receives ALL client tool calls by name
    onClientTool: async ({ name, params }) => {
      console.log("[onClientTool] called:", name, params);
      switch (name) {

        // ── Supabase: read saved preferences ───────────────────
        case "get_job_preferences": {
          const sid = sessionIdRef.current;
          if (!sid) return { preferences: null };
          const supabase = createClient();
          const { data } = await supabase
            .from("job_preferences")
            .select("*")
            .eq("session_id", sid)
            .maybeSingle();
          return { preferences: data ?? null };
        }

        // ── Supabase: save / update preferences ────────────────
        case "save_job_preferences": {
          const sid = sessionIdRef.current;
          if (!sid) return { success: false, error: "no session" };
          const supabase = createClient();
          const { error } = await supabase
            .from("job_preferences")
            .upsert(
              { session_id: sid, ...(params as JobPreferences), updated_at: new Date().toISOString() },
              { onConflict: "session_id" }
            );
          return error ? { success: false, error: error.message } : { success: true };
        }

        // ── Feature 3: per-tool loading pill ───────────────────
        case "set_loading_status": {
          setLoadingStatus(params.message as string);
          return { ok: true };
        }

        // ── Feature 1: preference form bottom sheet ─────────────
        // Returns a Promise — agent waits until user hits "Save"
        case "show_preference_form": {
          return new Promise<Record<string, unknown>>((resolve) => {
            formResolveRef.current = (values: string) =>
              resolve({ submitted: JSON.parse(values) });
            setFormValues({});
            setActiveForm(params as unknown as FormConfig);
          });
        }

        // ── Feature 2: horizontal job cards ────────────────────
        case "show_job_cards": {
          setJobCards((params as { cards: JobCard[] }).cards);
          return { displayed: true };
        }

        // ── Native bridge (iOS / Android WebView) ───────────────
        case "get_app_context": {
          return {
            session_id: sessionIdRef.current,
            platform:   (window as any).nativeAppContext?.platform ?? "web",
            ...((window as any).nativeAppContext ?? {}),
          };
        }

        case "trigger_native_action": {
          const msg = JSON.stringify({ type: params.action, payload: params.data ?? {} });
          if ((window as any).webkit?.messageHandlers?.nativeBridge) {
            (window as any).webkit.messageHandlers.nativeBridge.postMessage(msg);
          } else if ((window as any).AndroidBridge) {
            (window as any).AndroidBridge.onEvent(params.action, JSON.stringify(params.data ?? {}));
          }
          return { ok: true };
        }

        default:
          return { error: `Unknown tool: ${name}` };
      }
    },
  });

  // --- Form submit handler ---
  const handleFormSubmit = useCallback(() => {
    formResolveRef.current?.(JSON.stringify(formValues));
    formResolveRef.current = null;
    setActiveForm(null);
  }, [formValues]);

  const handleFormDismiss = useCallback(() => {
    formResolveRef.current?.(JSON.stringify({}));
    formResolveRef.current = null;
    setActiveForm(null);
  }, []);

  // --- Theme tokens ---
  const surface       = isDark ? "#1a1a1a" : "#ffffff";
  const border        = isDark ? "#2e2e2e" : "#e5e5e5";
  const textPrimary   = isDark ? "#ffffff" : "#111111";
  const textSecondary = isDark ? "#9a9a9a" : "#666666";
  const inputBg       = isDark ? "#252525" : "#f5f5f5";
  const badgeBg       = isDark ? "#2a3a2a" : "#e8f5e9";
  const badgeColor    = isDark ? "#6fcf97" : "#2e7d32";

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}
         className={isDark ? "bg-black" : "bg-white"}>

      <ChatKit control={chatkit.control} className="h-full w-full" />

      {/* ── Feature 3: Loading status pill (auto-cycling messages) ── */}
      {isResponding && cyclingMessage && (
        <div style={{
          position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
          background: isDark ? "rgba(28,28,28,0.94)" : "rgba(255,255,255,0.94)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          borderRadius: 24, padding: "8px 18px", fontSize: 13,
          color: textSecondary, display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 2px 20px rgba(0,0,0,0.14)", border: `1px solid ${border}`,
          whiteSpace: "nowrap", zIndex: 10, pointerEvents: "none",
          animation: "chatkit-fadein 0.2s ease",
          transition: "opacity 0.3s ease",
          opacity: msgVisible ? 1 : 0,
        }}>
          <LoadingDots color={textSecondary} />
          <span style={{ transition: "opacity 0.3s ease", opacity: msgVisible ? 1 : 0 }}>
            {cyclingMessage}
          </span>
        </div>
      )}

      {/* ── Feature 2: Horizontal job result cards ─────────────── */}
      {jobCards && jobCards.length > 0 && (
        <div style={{
          position: "absolute", bottom: 72, left: 0, right: 0,
          padding: "12px 0 12px 16px",
          background: isDark ? "rgba(18,18,18,0.97)" : "rgba(246,246,246,0.97)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          borderTop: `1px solid ${border}`, zIndex: 9,
          animation: "chatkit-fadein 0.25s ease",
        }}>
          <div style={{
            display: "flex", gap: 10, overflowX: "auto",
            scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch",
            paddingRight: 16, paddingBottom: 2,
            scrollbarWidth: "none", msOverflowStyle: "none",
          }}>
            {jobCards.map(card => (
              <div
                key={card.id}
                onClick={() => card.url && window.open(card.url, "_blank")}
                style={{
                  flexShrink: 0, width: 210, scrollSnapAlign: "start",
                  borderRadius: 14, background: surface, border: `1px solid ${border}`,
                  cursor: card.url ? "pointer" : "default",
                  overflow: "hidden", transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.14)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {/* Color bar at top — acts as visual identity */}
                <div style={{ height: 4, background: "linear-gradient(90deg, #0066FF, #00C6FF)" }} />
                <div style={{ padding: "12px 14px 14px" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: textPrimary, marginBottom: 3, lineHeight: 1.3 }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: 12, color: textSecondary, marginBottom: 8 }}>
                    {card.company}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20,
                      background: badgeBg, color: badgeColor, fontWeight: 500 }}>
                      {card.location}
                    </span>
                    {card.salary && (
                      <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20,
                        background: isDark ? "#1e2a3a" : "#e8f0ff", color: isDark ? "#7abaff" : "#0055cc",
                        fontWeight: 500 }}>
                        {card.salary}
                      </span>
                    )}
                  </div>
                  {card.url && (
                    <div style={{ marginTop: 10, fontSize: 12, color: "#0066FF", fontWeight: 500 }}>
                      View job →
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Feature 1: Preference form — bottom sheet ──────────── */}
      {activeForm && (
        <div
          onClick={e => { if (e.target === e.currentTarget) handleFormDismiss(); }}
          style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)",
            zIndex: 20, display: "flex", alignItems: "flex-end",
            animation: "chatkit-fadein 0.2s ease",
          }}
        >
          <div style={{
            width: "100%", background: surface,
            borderRadius: "22px 22px 0 0",
            padding: "20px 20px 40px", maxHeight: "80vh", overflowY: "auto",
            animation: "chatkit-slideup 0.28s cubic-bezier(0.32,0.72,0,1)",
          }}>
            {/* Drag handle */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: border, margin: "0 auto 20px" }} />

            <div style={{ fontWeight: 700, fontSize: 19, color: textPrimary, marginBottom: 4 }}>
              {activeForm.title}
            </div>
            <div style={{ fontSize: 13, color: textSecondary, marginBottom: 20 }}>
              We'll remember this to find you the best matches.
            </div>

            {activeForm.fields.map(field => (
              <div key={field.name} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: textSecondary,
                  display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    value={formValues[field.name] ?? ""}
                    onChange={e => setFormValues(v => ({ ...v, [field.name]: e.target.value }))}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, fontSize: 15,
                      background: inputBg, color: textPrimary, border: `1px solid ${border}`,
                      outline: "none", appearance: "none" }}
                  >
                    <option value="">Choose...</option>
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    value={formValues[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={e => setFormValues(v => ({ ...v, [field.name]: e.target.value }))}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, fontSize: 15,
                      background: inputBg, color: textPrimary, border: `1px solid ${border}`,
                      outline: "none", boxSizing: "border-box" }}
                  />
                )}
              </div>
            ))}

            <button
              onClick={handleFormSubmit}
              style={{
                width: "100%", padding: 15, borderRadius: 14, fontWeight: 700,
                fontSize: 16, background: "#0066FF", color: "#fff",
                border: "none", cursor: "pointer", marginTop: 8,
                letterSpacing: "0.01em",
              }}
            >
              Save &amp; Find Jobs
            </button>
          </div>
        </div>
      )}

      {/* Global keyframe animations */}
      <style>{`
        @keyframes chatkit-fadein   { from { opacity: 0 } to { opacity: 1 } }
        @keyframes chatkit-slideup  { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes chatkit-dot-pulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.75); }
          40%            { opacity: 1;    transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Animated loading dots
// ─────────────────────────────────────────────────────────────
function LoadingDots({ color }: { color: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 4, height: 4, borderRadius: "50%", background: color, display: "inline-block",
          animation: `chatkit-dot-pulse 1.2s ease-in-out ${i * 0.18}s infinite`,
        }} />
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Page export
// ─────────────────────────────────────────────────────────────
export default function AssistantEmbedPage() {
  return (
    <Suspense>
      <AssistantEmbed />
    </Suspense>
  );
}
