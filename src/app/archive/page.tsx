"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Download,
  Film,
  ImageIcon,
  Mail,
  RefreshCw,
  Send,
  Trash2,
  X,
} from "lucide-react";

import {
  getMemoryArchive,
  deleteArchiveSession,
  type ArchiveSession,
} from "@/services/archive-service";

/* ---------- Tema: papan gabus + photostrip ---------- */

const CORK_NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 .25  0 0 0 0 .14  0 0 0 0 .05  0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E")`;

const corkStyle: React.CSSProperties = {
  backgroundColor: "#b88a58",
  backgroundImage: `${CORK_NOISE}, radial-gradient(circle at 20% 15%, rgba(255,226,170,.35), transparent 45%), radial-gradient(circle at 85% 90%, rgba(70,38,14,.35), transparent 50%)`,
  boxShadow:
    "inset 0 0 40px rgba(60,30,10,.55), inset 0 0 6px rgba(0,0,0,.6)",
};

const TILTS = [
  "-rotate-2",
  "rotate-1",
  "-rotate-1",
  "rotate-2",
  "rotate-[0.5deg]",
  "-rotate-[2.5deg]",
];

const OFFSETS = ["", "lg:mt-8", "lg:mt-3", "lg:mt-10", "", "lg:mt-5"];

const PINS = [
  "radial-gradient(circle at 35% 30%, #ff9a8a, #c0392b 55%, #6e140f)",
  "radial-gradient(circle at 35% 30%, #ffe08a, #d19a1f 55%, #7a560a)",
  "radial-gradient(circle at 35% 30%, #9fd6c4, #2f8f74 55%, #134a3a)",
];

const typewriter = {
  fontFamily: "'Special Elite','Courier New',Courier,monospace",
} as const;

function Pin({ index }: { index: number }) {
  return (
    <span
      aria-hidden
      className="absolute -top-3 left-1/2 z-20 h-6 w-6 -translate-x-1/2 rounded-full"
      style={{
        background: PINS[index % PINS.length],
        boxShadow:
          "3px 5px 5px rgba(0,0,0,.45), inset -1px -2px 3px rgba(0,0,0,.35)",
      }}
    />
  );
}

function Tape({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute z-20 h-6 w-20 bg-[#e6d59a]/80 shadow-sm ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, transparent 0 7px, rgba(255,255,255,.28) 7px 8px)",
      }}
    />
  );
}

/* ---------- Helper Konversi URL ke Base64 ---------- */

async function urlToDataUrl(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Gagal memuat file photostrip untuk Contact Sheet.");
  }

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/* ---------- Halaman ---------- */

export default function ArchivePage() {
  const [sessions, setSessions] = useState<ArchiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSession, setSelectedSession] =
    useState<ArchiveSession | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // State untuk modal 35mm Contact Sheet
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [sendingSheet, setSendingSheet] = useState(false);
  const [sheetStatus, setSheetStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadArchive = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMemoryArchive();
      setSessions(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to load Memory Archive."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArchive();
  }, []);

  const handleDeleteSession = async (sessionId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this photo session? All photos and photostrips will be deleted."
    );

    if (!confirmed) return;

    setDeletingId(sessionId);

    try {
      await deleteArchiveSession(sessionId);

      setSessions((previous) =>
        previous.filter((session) => session.id !== sessionId)
      );

      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }

      alert("Photo session successfully deleted.");
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error ? err.message : "Failed to delete photo session."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to download image.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      window.open(url, "_blank");
    }
  };

  // Handler kirim 35mm Contact Sheet ke n8n
  const handleSendContactSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSheetStatus(null);

    const availableStripUrls = sessions
      .map((s) => s.photostrip_url)
      .filter((url): url is string => Boolean(url))
      .slice(0, 8); // Maksimal 8 strip sesuai batas API

    if (availableStripUrls.length === 0) {
      setSheetStatus({
        type: "error",
        text: "Belum ada photostrip yang tersedia untuk dicetak.",
      });
      return;
    }

    setSendingSheet(true);

    try {
      // Konversi semua URL gambar menjadi Base64 agar terbaca oleh node Code n8n
      const base64Strips = await Promise.all(
        availableStripUrls.map((url) => urlToDataUrl(url))
      );

      const rollCode = `SHUTTER-${new Date()
        .getTime()
        .toString()
        .slice(-4)}`;

      const response = await fetch("/api/contact-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contactEmail.trim(),
          sessionId: rollCode,
          strips: base64Strips,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim 35mm Contact Sheet.");
      }

      setSheetStatus({
        type: "success",
        text:
          data.message ||
          "35mm Contact Sheet berhasil dikirim! Silakan cek inbox email Anda.",
      });
      setContactEmail("");
    } catch (err) {
      setSheetStatus({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memproses Contact Sheet.",
      });
    } finally {
      setSendingSheet(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const validStripCount = sessions.filter((s) => Boolean(s.photostrip_url)).length;

  return (
    <main
      className="min-h-screen px-4 py-8 text-[#f0e5d0] sm:px-8"
      style={{
        backgroundColor: "#241b15",
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(255,255,255,.015) 0 2px, transparent 2px 9px)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#c9a877]" style={typewriter}>
              Shutter Analog Lab
            </p>
            <h1 className="mt-1 font-serif text-4xl sm:text-5xl">
              Memory Archive
            </h1>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-sm border border-[#d7c5a4]/30 px-4 py-2 text-sm text-[#d7c5a4] transition hover:bg-[#d7c5a4]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e8c27a]"
            style={typewriter}
          >
            <ArrowLeft size={16} />
            Home
          </Link>
        </header>

        {/* PAPAN GABUS */}
        <section
          className="relative rounded-md border-[14px] border-[#4e3220] p-5 sm:p-10"
          style={{
            ...corkStyle,
            borderImage:
              "linear-gradient(135deg,#6b4429,#3f281a 50%,#6b4429) 1",
            boxShadow: `${corkStyle.boxShadow}, 0 20px 50px rgba(0,0,0,.6)`,
          }}
        >
          {/* Papan nama + tombol aksi */}
          <div className="mb-10 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div
              className="relative -rotate-1 bg-[#f4ecd8] px-6 py-4 text-[#3b2a1c] shadow-[3px_5px_10px_rgba(0,0,0,.4)]"
              style={typewriter}
            >
              <Pin index={0} />
              <p className="mt-1 text-lg leading-tight">Captured Memories</p>
              <p className="mt-1 text-xs text-[#3b2a1c]/65">
                {loading
                  ? "Mencari strip..."
                  : `${sessions.length} strip terpasang`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Tombol Buka Modal 35mm Contact Sheet */}
              {!loading && validStripCount > 0 && (
                <button
                  onClick={() => {
                    setSheetStatus(null);
                    setIsContactModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-sm bg-[#9b4236] px-4 py-2.5 text-sm text-[#f7ecd8] shadow-md transition hover:bg-[#b44d40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e8c27a]"
                  style={typewriter}
                >
                  <Film size={15} />
                  35mm Contact Sheet
                </button>
              )}

              <button
                onClick={loadArchive}
                disabled={loading}
                className="flex items-center gap-2 rounded-sm bg-[#2b2118]/85 px-4 py-2.5 text-sm text-[#f0e5d0] shadow-md transition hover:bg-[#2b2118] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e8c27a] disabled:opacity-60"
                style={typewriter}
              >
                <RefreshCw
                  size={15}
                  className={
                    loading ? "animate-spin motion-reduce:animate-none" : ""
                  }
                />
                Refresh
              </button>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="py-24 text-center text-[#2b2118]">
              <Camera
                size={36}
                className="mx-auto mb-4 animate-pulse motion-reduce:animate-none"
              />
              <p className="text-sm" style={typewriter}>
                Developing your memories...
              </p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div
              className="relative mx-auto max-w-sm rotate-1 bg-[#f6e3dc] p-6 text-center text-[#5a1f17] shadow-[3px_6px_12px_rgba(0,0,0,.4)]"
              style={typewriter}
            >
              <Pin index={0} />
              <p className="mt-2 text-sm">{error}</p>
              <button
                onClick={loadArchive}
                className="mt-4 text-sm underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5a1f17]"
              >
                Try again.
              </button>
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && sessions.length === 0 && (
            <div
              className="relative mx-auto max-w-sm -rotate-1 bg-[#f4ecd8] px-8 py-10 text-center text-[#3b2a1c] shadow-[3px_6px_12px_rgba(0,0,0,.4)]"
              style={typewriter}
            >
              <Pin index={1} />
              <ImageIcon size={38} className="mx-auto mb-4 text-[#8a6a47]" />
              <h2 className="font-serif text-2xl">No Memories Yet</h2>
              <p className="mt-3 text-sm text-[#3b2a1c]/70">
                Enter the booth and capture your memories to see them here.
              </p>
              <Link
                href="/booth"
                className="mt-6 inline-flex bg-[#9b4236] px-6 py-3 text-sm text-[#f7ecd8] shadow transition hover:bg-[#b44d40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3b2a1c]"
              >
                Start Photobooth
              </Link>
            </div>
          )}

          {/* KOLEKSI */}
          {!loading && !error && sessions.length > 0 && (
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session, index) => (
                <article
                  key={session.id}
                  className={`group relative ${OFFSETS[index % OFFSETS.length]}`}
                >
                  <div
                    className={`relative origin-top bg-[#f7f0de] p-3 pb-4 shadow-[4px_8px_14px_rgba(0,0,0,.45)] transition duration-300 hover:z-10 hover:-translate-y-1 hover:rotate-0 hover:shadow-[6px_14px_20px_rgba(0,0,0,.5)] motion-reduce:transition-none ${TILTS[index % TILTS.length]}`}
                  >
                    <Pin index={index} />

                    <button
                      onClick={() => setSelectedSession(session)}
                      className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b4236]"
                      aria-label={`Buka ${session.title || "Shutter Memories"}`}
                    >
                      <div className="bg-[#1d1814] p-2">
                        {session.photostrip_url ? (
                          <img
                            src={session.photostrip_url}
                            alt="Photostrip"
                            className="mx-auto h-[360px] w-full object-contain sepia-[.25] contrast-105"
                          />
                        ) : (
                          <div
                            className="flex h-[280px] flex-col items-center justify-center text-[#d7c5a4]/60"
                            style={typewriter}
                          >
                            <Camera size={35} />
                            <span className="mt-3 text-xs">
                              No photostrip available
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 text-[#3b2a1c]" style={typewriter}>
                        <h3 className="truncate text-lg leading-tight">
                          {session.title || "Shutter Memories"}
                        </h3>
                        <p className="mt-1 text-xs text-[#3b2a1c]/65">
                          {formatDate(session.created_at)},{" "}
                          {session.photos.length} foto
                        </p>
                      </div>
                    </button>

                    <div className="mt-3 flex gap-2" style={typewriter}>
                      {session.photostrip_url && (
                        <button
                          onClick={() =>
                            downloadImage(
                              session.photostrip_url!,
                              `shutter-photostrip-${index + 1}.jpg`
                            )
                          }
                          className="flex flex-1 items-center justify-center gap-1.5 bg-[#3b2a1c] py-2 text-xs text-[#f7ecd8] transition hover:bg-[#9b4236] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b4236]"
                        >
                          <Download size={14} />
                          Download
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        disabled={deletingId === session.id}
                        className="flex flex-1 items-center justify-center gap-1.5 border border-[#9b4236]/60 py-2 text-xs text-[#9b4236] transition hover:bg-[#9b4236] hover:text-[#f7ecd8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b4236] disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        {deletingId === session.id ? "Deleting.." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-10 text-center">
          <p className="font-serif italic text-[#c9a877]">
            Capture the moment. Keep the memory.
          </p>
        </footer>
      </div>

      {/* MODAL 35MM CONTACT SHEET */}
      {isContactModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Send 35mm Contact Sheet"
        >
          <div
            className="relative w-full max-w-md bg-[#f4ecd8] p-6 pt-8 text-[#3b2a1c] shadow-[6px_14px_28px_rgba(0,0,0,.65)] sm:p-8"
            style={typewriter}
          >
            <Pin index={2} />

            <button
              onClick={() => setIsContactModalOpen(false)}
              disabled={sendingSheet}
              className="absolute right-3 top-3 p-1.5 text-[#3b2a1c]/60 transition hover:text-[#3b2a1c]"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-widest text-[#9b4236]">
              <Film size={14} />
              <span>Darkroom Delivery</span>
            </div>

            <h2 className="font-serif text-2xl text-[#2b2118]">
              35mm Contact Sheet
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-[#3b2a1c]/80">
              Kirim seluruh arsip photostrip di papan ini (
              <strong>{Math.min(validStripCount, 8)} strip</strong>) dalam
              satu paket arsip digital 35mm langsung ke email Anda.
            </p>

            <form onSubmit={handleSendContactSheet} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="contact-sheet-email"
                  className="block text-xs uppercase tracking-wider text-[#3b2a1c]/80"
                >
                  Email Tujuan
                </label>
                <div className="relative mt-1.5">
                  <Mail
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#3b2a1c]/50"
                  />
                  <input
                    id="contact-sheet-email"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="nama@email.com"
                    disabled={sendingSheet}
                    className="w-full border border-[#3b2a1c]/30 bg-[#faf6ee] py-2.5 pl-9 pr-3 text-sm text-[#2b2118] placeholder:text-[#3b2a1c]/40 focus:border-[#9b4236] focus:outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              {sheetStatus && (
                <div
                  className={`flex items-start gap-2 border p-3 text-xs leading-relaxed ${
                    sheetStatus.type === "success"
                      ? "border-[#2f8f74]/40 bg-[#e4f3ee] text-[#134a3a]"
                      : "border-[#9b4236]/40 bg-[#f6e3dc] text-[#5a1f17]"
                  }`}
                >
                  {sheetStatus.type === "success" && (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  )}
                  <span>{sheetStatus.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={sendingSheet}
                className="flex w-full items-center justify-center gap-2 bg-[#3b2a1c] py-3 text-xs uppercase tracking-widest text-[#f7ecd8] shadow transition hover:bg-[#9b4236] disabled:opacity-60"
              >
                <Send size={14} />
                {sendingSheet
                  ? "Developing & Sending..."
                  : "Send Contact Sheet"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL SESI */}
      {selectedSession && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={selectedSession.title || "Shutter Memories"}
        >
          <div
            className="relative mx-auto my-6 max-w-4xl rounded-md border-[12px] border-[#4e3220] p-6 sm:p-10"
            style={corkStyle}
          >
            <div className="mb-8 flex items-start justify-between gap-4">
              <div
                className="relative -rotate-1 bg-[#f4ecd8] px-5 py-3 text-[#3b2a1c] shadow-[3px_5px_10px_rgba(0,0,0,.4)]"
                style={typewriter}
              >
                <Pin index={1} />
                <h2 className="mt-1 text-xl leading-tight">
                  {selectedSession.title || "Shutter Memories"}
                </h2>
                <p className="mt-1 text-xs text-[#3b2a1c]/65">
                  {formatDate(selectedSession.created_at)}
                </p>
              </div>

              <button
                onClick={() => setSelectedSession(null)}
                className="rounded-sm bg-[#2b2118]/90 p-2 text-[#f0e5d0] shadow-md transition hover:bg-[#2b2118] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e8c27a]"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-10 md:grid-cols-[auto_1fr] md:items-start">
              {selectedSession.photostrip_url && (
                <div className="relative mx-auto -rotate-2 bg-[#f7f0de] p-3 shadow-[4px_8px_14px_rgba(0,0,0,.45)]">
                  <Pin index={0} />
                  <div className="bg-[#1d1814] p-2">
                    <img
                      src={selectedSession.photostrip_url}
                      alt="Saved photostrip"
                      className="max-h-[560px] w-auto sepia-[.25] contrast-105"
                    />
                  </div>
                </div>
              )}

              <div>
                <h3
                  className="mb-5 inline-block bg-[#2b2118]/85 px-3 py-1 text-sm text-[#f0e5d0]"
                  style={typewriter}
                >
                  Original Frames
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  {selectedSession.photos.map((photo, i) => (
                    <figure
                      key={photo.id}
                      className={`relative bg-[#f7f0de] p-2 pb-3 shadow-[3px_6px_10px_rgba(0,0,0,.4)] ${TILTS[(i + 2) % TILTS.length]}`}
                    >
                      <Tape className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
                      <img
                        src={photo.image_url}
                        alt={`Frame ${photo.photo_order}`}
                        className="aspect-square w-full object-cover sepia-[.2]"
                      />
                      <figcaption
                        className="mt-2 text-xs text-[#3b2a1c]/70"
                        style={typewriter}
                      >
                        Frame {photo.photo_order}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDeleteSession(selectedSession.id)}
              disabled={deletingId === selectedSession.id}
              className="mt-10 flex w-full items-center justify-center gap-2 bg-[#2b2118]/90 py-3 text-sm text-[#ffb4a8] transition hover:bg-[#9b4236] hover:text-[#f7ecd8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e8c27a] disabled:opacity-50"
              style={typewriter}
            >
              <Trash2 size={15} />
              {deletingId === selectedSession.id
                ? "Deleting..."
                : "Delete collection"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
