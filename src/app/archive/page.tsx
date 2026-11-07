"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Download,
  ImageIcon,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

import {
  getMemoryArchive,
  deleteArchiveSession,
  type ArchiveSession,
} from "@/services/archive-service";

/* ---------- Tema: papan gabus + photostrip ---------- */

// Tekstur gabus (noise SVG) + bercak gelap, tanpa file gambar tambahan
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
        boxShadow: "3px 5px 5px rgba(0,0,0,.45), inset -1px -2px 3px rgba(0,0,0,.35)",
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

/* ---------- Halaman ---------- */

export default function ArchivePage() {
  const [sessions, setSessions] = useState<ArchiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSession, setSelectedSession] =
    useState<ArchiveSession | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadArchive = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMemoryArchive();
      setSessions(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Gagal memuat Memory Archive."
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
      "Yakin ingin menghapus sesi foto ini? Semua foto dan photostrip akan ikut dihapus."
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

      alert("Sesi foto berhasil dihapus.");
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error ? err.message : "Gagal menghapus sesi foto."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Gagal mengunduh gambar.");
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

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

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
          {/* Papan nama + tombol refresh */}
          <div className="mb-10 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div
              className="relative -rotate-1 bg-[#f4ecd8] px-6 py-4 text-[#3b2a1c] shadow-[3px_5px_10px_rgba(0,0,0,.4)]"
              style={typewriter}
            >
              <Pin index={0} />
              <p className="mt-1 text-lg leading-tight">
                Captured Memories
              </p>
              <p className="mt-1 text-xs text-[#3b2a1c]/65">
                {loading
                  ? "Mencari strip..."
                  : `${sessions.length} strip terpasang`}
              </p>
            </div>

            <button
              onClick={loadArchive}
              disabled={loading}
              className="flex items-center gap-2 rounded-sm bg-[#2b2118]/85 px-4 py-2.5 text-sm text-[#f0e5d0] shadow-md transition hover:bg-[#2b2118] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e8c27a] disabled:opacity-60"
              style={typewriter}
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin motion-reduce:animate-none" : ""}
              />
              Refresh
            </button>
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
                Coba lagi
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
              <h2 className="font-serif text-2xl">Papan masih kosong</h2>
              <p className="mt-3 text-sm text-[#3b2a1c]/70">
                Masuk ke booth dan ambil foto pertamamu. Hasilnya akan
                dipasang di sini.
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
                              Photostrip belum dibuat
                            </span>
                          </div>
                        )}
                      </div>

                      <div
                        className="mt-3 text-[#3b2a1c]"
                        style={typewriter}
                      >
                        <h3 className="truncate text-lg leading-tight">
                          {session.title || "Shutter Memories"}
                        </h3>
                        <p className="mt-1 text-xs text-[#3b2a1c]/65">
                          {formatDate(session.created_at)}, {session.photos.length} foto
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
                        {deletingId === session.id ? "Menghapus..." : "Hapus"}
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
                ? "Menghapus..."
                : "Hapus koleksi ini"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}