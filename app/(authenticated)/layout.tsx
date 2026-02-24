import { createClient } from "@/lib/supabase/server";
import { AuthProvider } from "@/lib/auth/auth-context";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return <AuthProvider initialSession={session}>{children}</AuthProvider>;
}
