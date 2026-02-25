"use client";

import { ChatKit, useChatKit } from "@openai/chatkit-react";

export default function AssistantEmbedPage() {
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
    <div style={{ width: "100vw", height: "100vh" }}>
      <ChatKit control={chatkit.control} className="h-full w-full" />
    </div>
  );
}
