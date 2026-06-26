import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type OAuthProvider = "apple" | "google";

function isOAuthProvider(provider: string): provider is OAuthProvider {
  return provider === "apple" || provider === "google";
}

function resolveOrigin(request: Request) {
  const requestURL = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return requestURL.origin;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const origin = resolveOrigin(request);

  if (!isOAuthProvider(provider)) {
    return NextResponse.redirect(`${origin}/login?error=unknown_provider`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/login?error=oauth_start_failed`);
  }

  return NextResponse.redirect(data.url);
}
