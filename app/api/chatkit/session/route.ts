import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const WORKFLOW_ID = "wf_696ba27651a48190a4dd4869247f1ae800bfaf78e6102cf5";

export async function POST() {
  try {
    const session = await (openai as any).beta.chatkit.sessions.create({
      workflow: { id: WORKFLOW_ID },
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
