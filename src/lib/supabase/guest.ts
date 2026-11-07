
import { createClient } from "@/lib/supabase/client";

export async function ensureGuestSession() {
  const supabase = createClient();

  // Periksa apakah pengunjung sudah memiliki sesi
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  // Gunakan sesi yang sudah ada
  if (session?.user) {
    return session.user;
  }

  // Buat identitas pengunjung baru
  const {
    data: { user },
    error,
  } = await supabase.auth.signInAnonymously();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("Failed to create guest session");
  }

  return user;
}
