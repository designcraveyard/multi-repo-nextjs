"use client";

import Script from "next/script";
import { ChatKit, useChatKit } from "@openai/chatkit-react";

export default function AssistantPage() {
  const chatkit = useChatKit({
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
    <>
      <Script
        src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
        strategy="beforeInteractive"
      />
      <div className="flex h-[calc(100vh-2rem)] w-full flex-col p-4">
        <h1 className="mb-4 text-2xl font-semibold">Assistant</h1>
        <div className="flex-1 overflow-hidden rounded-xl border border-[var(--border-default)]">
          <ChatKit control={chatkit.control} className="h-full w-full" />
        </div>
      </div>
    </>
  );
}
