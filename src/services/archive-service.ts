
import { createClient } from "@/lib/supabase/client";
import { ensureGuestSession } from "@/lib/supabase/guest";

export type ArchivePhoto = {
  id: string;
  photo_order: number;
  film_preset: string;
  image_url: string;
};

export type ArchiveSession = {
  id: string;
  title: string;
  created_at: string;
  photostrip_url: string | null;
  photos: ArchivePhoto[];
};

export async function getMemoryArchive(): Promise<ArchiveSession[]> {
  const supabase = createClient();

  // Pastikan pengunjung menggunakan identitas yang sama
  const user = await ensureGuestSession();

  // Ambil sesi milik pengunjung
  const { data: sessions, error } = await supabase
    .from("photo_sessions")
    .select("id, title, created_at, photostrip_path")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil arsip: ${error.message}`);
  }

  if (!sessions || sessions.length === 0) {
    return [];
  }

  // Ambil foto dan URL untuk setiap sesi
  const archive = await Promise.all(
    sessions.map(async (session) => {
      const { data: photos, error: photoError } = await supabase
        .from("photos")
        .select("id, original_path, photo_order, film_preset")
        .eq("session_id", session.id)
        .order("photo_order", { ascending: true });

      if (photoError) {
        throw new Error(
          `Gagal mengambil foto sesi: ${photoError.message}`
        );
      }

      const archivePhotos = await Promise.all(
        (photos ?? []).map(async (photo) => {
          const { data, error: urlError } = await supabase.storage
            .from("shutter-photos")
            .createSignedUrl(photo.original_path, 3600);

          if (urlError) {
            throw new Error(
              `Gagal membuka foto: ${urlError.message}`
            );
          }

          return {
            id: photo.id,
            photo_order: photo.photo_order,
            film_preset: photo.film_preset,
            image_url: data.signedUrl,
          };
        })
      );

      let photostripUrl: string | null = null;

      if (session.photostrip_path) {
        const { data: stripData, error: stripError } =
          await supabase.storage
            .from("shutter-photos")
            .createSignedUrl(session.photostrip_path, 3600);

        if (stripError) {
          throw new Error(
            `Gagal membuka photostrip: ${stripError.message}`
          );
        }

        photostripUrl = stripData.signedUrl;
      }

      return {
        id: session.id,
        title: session.title,
        created_at: session.created_at,
        photostrip_url: photostripUrl,
        photos: archivePhotos,
      };
    })
  );

  return archive;
}
export async function deleteArchiveSession(sessionId: string) {
  const supabase = createClient();
  const user = await ensureGuestSession();

  // Ambil data sesi
  const { data: session, error: sessionError } = await supabase
    .from("photo_sessions")
    .select("id, photostrip_path")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    throw new Error("Sesi foto tidak ditemukan.");
  }

  // Ambil daftar foto
  const { data: photos, error: photosError } = await supabase
    .from("photos")
    .select("original_path")
    .eq("session_id", sessionId);

  if (photosError) throw photosError;

  // Hapus file dari Storage
  const filePaths = [
    ...(photos ?? []).map((photo) => photo.original_path),
    session.photostrip_path,
  ].filter((path): path is string => Boolean(path));

  if (filePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("shutter-photos")
      .remove(filePaths);

    if (storageError) throw storageError;
  }

  // Hapus data foto
  const { error: deletePhotosError } = await supabase
    .from("photos")
    .delete()
    .eq("session_id", sessionId);

  if (deletePhotosError) throw deletePhotosError;

  // Hapus sesi
  const { error: deleteSessionError } = await supabase
    .from("photo_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (deleteSessionError) throw deleteSessionError;
}