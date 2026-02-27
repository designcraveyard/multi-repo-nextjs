import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const WORKFLOW_ID = "wf_69157991bfd081909cc0815050b47abf0f93481201224b4b";

export async function POST() {
  try {
    const session = await (openai as any).beta.chatkit.sessions.create({
      workflow: { id: WORKFLOW_ID },
      user: "demo-user",
      chatkit_configuration: {
        file_upload: { enabled: true },
      },
    });

    return NextResponse.json({ client_secret: session.client_secret });
  } catch (error) {
    console.error("ChatKit session error:", error);
    return NextResponse.json(
      { error: "Failed to create ChatKit session" },
      { status: 500 }
    );
  }
}
