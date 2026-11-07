
import { createClient } from "@/lib/supabase/client";
import { ensureGuestSession } from "@/lib/supabase/guest";

// Membuat sesi foto baru
export async function createPhotoSession() {
  const supabase = createClient();
  const user = await ensureGuestSession();

  const { data, error } = await supabase
    .from("photo_sessions")
    .insert({
      user_id: user.id,
      title: "Shutter Photo Session",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create photo session: ${error.message}`);
  }

  return {
    sessionId: data.id,
    userId: user.id,
  };
}

// Mengunggah foto dan menyimpan informasinya ke database
export async function saveOriginalPhoto({
  sessionId,
  userId,
  photoData,
  filmPreset,
  photoOrder,
}: {
  sessionId: string;
  userId: string;
  photoData: string;
  filmPreset: string;
  photoOrder: number;
}) {
  const supabase = createClient();

  // Mengubah data URL menjadi file Blob
  const response = await fetch(photoData);
  const blob = await response.blob();

  const filePath = `${userId}/${sessionId}/original/${photoOrder}-${crypto.randomUUID()}.jpg`;

  // Upload foto ke Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("shutter-photos")
    .upload(filePath, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload photo: ${uploadError.message}`);
  }

  // Simpan metadata foto ke tabel photos
  const { data, error } = await supabase
    .from("photos")
    .insert({
      session_id: sessionId,
      original_path: filePath,
      film_preset: filmPreset,
      photo_order: photoOrder,
    })
    .select()
    .single();

  if (error) {
    // Hapus file jika penyimpanan metadata gagal
    await supabase.storage
      .from("shutter-photos")
      .remove([filePath]);

    throw new Error(`Failed to save photo data: ${error.message}`);
  }

  return data;
}

export async function savePhotostrip({
  sessionId,
  userId,
  photostrip,
}: {
  sessionId: string;
  userId: string;
  photostrip: Blob;
}) {
  const supabase = createClient();

  const filePath = `${userId}/${sessionId}/prints/shutter-photostrip-${crypto.randomUUID()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("shutter-photos")
    .upload(filePath, photostrip, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload photostrip: ${uploadError.message}`);
  }

  const { data, error } = await supabase
    .from("photo_sessions")
    .update({ photostrip_path: filePath })
    .eq("id", sessionId)
    .eq("user_id", userId)
    .select("id")
    .single();

  if (error || !data) {
    await supabase.storage
      .from("shutter-photos")
      .remove([filePath]);

    throw new Error(
      `Failed to save photostrip.: ${error?.message ?? "Session not found."}`
    );
  }

  return filePath;
}
