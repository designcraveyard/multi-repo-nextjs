"use client";

import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

/** Detect system color scheme and listen for changes. */
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

function AssistantEmbed() {
  const searchParams = useSearchParams();
  const systemTheme = useSystemTheme();
  // Explicit query param takes precedence; otherwise follow system preference
  const theme = (searchParams.get("theme") as "light" | "dark") ?? systemTheme;

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
      attachments: { enabled: true },
    },
  });

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      className={theme === "dark" ? "bg-black" : "bg-white"}
    >
      <ChatKit control={chatkit.control} className="h-full w-full" />
    </div>
  );
}

export default function AssistantEmbedPage() {
  return (
    <Suspense>
      <AssistantEmbed />
    </Suspense>
  );
}
