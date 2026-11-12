
"use client";

import DarkroomDeveloping from "@/components/darkroom/developing";
import PhotostripGenerator from "@/components/printing/photostrip";
import PhotoEditor, {
  type PhotostripDesign,
} from "@/components/editor/PhotoEditor";

import {
  createPhotoSession,
  saveOriginalPhoto,
} from "@/services/photo-service";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Playfair_Display, Courier_Prime, Caveat } from "next/font/google";

import {
  Camera,
  RefreshCw,
  RotateCcw,
  Download,
  Trash2,
  Video,
} from "lucide-react";

const serif = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "700"],
  variable: "--font-serif",
  display: "swap",
});

const mono = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

const hand = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-hand",
  display: "swap",
});

const MAX_PHOTOS = 4;
const COUNTDOWN_SECONDS = 3;
const ORIGINAL_PRESET = "none";

type SessionInfo = {
  sessionId: string;
  userId: string;
};

const DEFAULT_DESIGN: PhotostripDesign = {
  frame: "classic",
  stickers: [],
  note: "",
};

const VIDEO_MIME_CANDIDATES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
  "video/mp4",
];

export default function Photobooth() {
  const webcamRef = useRef<Webcam>(null);
  const sessionRef = useRef<SessionInfo | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoUrlRef = useRef<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [photos, setPhotos] = useState<string[]>([]);
  const [originalPhotos, setOriginalPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentShot, setCurrentShot] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [showDarkroom, setShowDarkroom] = useState(false);
  const [showStrip, setShowStrip] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoExt, setVideoExt] = useState("webm");

  const [stripDesign, setStripDesign] =
    useState<PhotostripDesign>(DEFAULT_DESIGN);

  const [storageStatus, setStorageStatus] = useState("");
  const [storageError, setStorageError] = useState("");

  const sleep = (ms: number) =>
    new Promise((resolve) => window.setTimeout(resolve, ms));

  // SHUTTER SOUND

  const getAudioContext = () => {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!Ctx) return null;

    if (!audioCtxRef.current) audioCtxRef.current = new Ctx();

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }

    return audioCtxRef.current;
  };

  const playShutterSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      const click = (
        start: number,
        frequency: number,
        duration: number,
        volume: number
      ) => {
        const length = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = frequency;
        filter.Q.value = 1.2;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        source.connect(filter).connect(gain).connect(ctx.destination);
        source.start(start);
      };

      const thump = ctx.createOscillator();
      const thumpGain = ctx.createGain();

      thump.type = "sine";
      thump.frequency.setValueAtTime(190, now);
      thump.frequency.exponentialRampToValueAtTime(55, now + 0.09);

      thumpGain.gain.setValueAtTime(0.5, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      thump.connect(thumpGain).connect(ctx.destination);
      thump.start(now);
      thump.stop(now + 0.12);

      click(now, 3400, 0.05, 0.8);
      click(now + 0.085, 2000, 0.07, 0.6);
    } catch {
      // Audio bersifat opsional.
    }
  };

  // CLEANUP RECORDER & VIDEO URL

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;

      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }

      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }
    };
  }, []);

  // VIDEO RECORDING

  const clearVideo = () => {
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = null;
    }

    setVideoUrl(null);
    setVideoBlob(null);
  };

  const startRecording = () => {
    const stream = webcamRef.current?.stream;

    if (!stream || typeof MediaRecorder === "undefined") return;

    const mimeType = VIDEO_MIME_CANDIDATES.find((type) =>
      MediaRecorder.isTypeSupported(type)
    );

    try {
      const recorder = new MediaRecorder(
        stream,
        mimeType
          ? { mimeType, videoBitsPerSecond: 2_500_000 }
          : undefined
      );

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.start(1000);
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Video recording unavailable:", error);
      recorderRef.current = null;
    }
  };

  const stopRecording = () =>
    new Promise<void>((resolve) => {
      const recorder = recorderRef.current;

      if (!recorder || recorder.state === "inactive") {
        setIsRecording(false);
        resolve();
        return;
      }

      recorder.onstop = () => {
        const type = recorder.mimeType || "video/webm";
        const blob = new Blob(chunksRef.current, { type });

        if (blob.size > 0) {
          clearVideo();

          const url = URL.createObjectURL(blob);
          videoUrlRef.current = url;

          setVideoUrl(url);
          setVideoBlob(blob);
          setVideoExt(type.includes("mp4") ? "mp4" : "webm");
        }

        recorderRef.current = null;
        setIsRecording(false);
        resolve();
      };

      recorder.stop();
    });

  // GRAB FRAME FROM WEBCAM

  const grabFrame = (): string | null => {
    const video = webcamRef.current?.video;

    if (!video || video.readyState < 2) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return null;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", 0.95);
  };

  // CAPTURE 4 PHOTOS AUTOMATICALLY

  const captureSequence = async () => {
    if (isCapturing || photos.length > 0 || cameraError) return;

    getAudioContext();

    setIsCapturing(true);
    setStorageError("");
    setStorageStatus("");
    clearVideo();

    const shots: string[] = [];
    const savePromises: Promise<unknown>[] = [];
    const saveErrors: string[] = [];

    startRecording();

    try {
      try {
        if (!sessionRef.current) {
          sessionRef.current = await createPhotoSession();
        }
      } catch (error) {
        console.error("Create session error:", error);

        saveErrors.push(
          error instanceof Error ? error.message : "Failed creating session."
        );
      }

      for (let order = 1; order <= MAX_PHOTOS; order++) {
        setCurrentShot(order);

        for (let n = COUNTDOWN_SECONDS; n >= 1; n--) {
          setCountdown(n);
          await sleep(900);
        }

        setCountdown(null);

        const image = grabFrame();

        if (!image) {
          setCameraError("Camera not ready. Please try again.");
          break;
        }

        setIsFlashing(true);
        playShutterSound();

        shots.push(image);
        setPhotos([...shots]);
        setOriginalPhotos([...shots]);

        const activeSession = sessionRef.current;

        if (activeSession) {
          savePromises.push(
            saveOriginalPhoto({
              sessionId: activeSession.sessionId,
              userId: activeSession.userId,
              photoData: image,
              filmPreset: ORIGINAL_PRESET,
              photoOrder: order,
            }).catch((error: unknown) => {
              console.error("Supabase save error:", error);

              saveErrors.push(
                error instanceof Error
                  ? error.message
                  : "Failed saving to Supabase."
              );
            })
          );
        }

        await sleep(250);
        setIsFlashing(false);
      }
    } catch (error) {
      console.error("Capture error:", error);
      setCameraError("Unable to take photos, please try again.");
    } finally {
      setCountdown(null);
      setIsFlashing(false);
      setCurrentShot(0);

      await stopRecording();

      if (savePromises.length > 0) {
        setStorageStatus("Menyimpan foto ke database...");
        await Promise.allSettled(savePromises);
      }

      if (saveErrors.length > 0) {
        setStorageStatus("");
        setStorageError(saveErrors[0]);
      } else if (shots.length > 0) {
        setStorageStatus(`${shots.length} frames saved to Supabase.`);
      } else {
        setStorageStatus("");
      }

      setIsCapturing(false);
    }
  };

  // SWITCH CAMERA

  const switchCamera = () => {
    setFacingMode((current) =>
      current === "user" ? "environment" : "user"
    );
  };

  // RESET SESSION

  const resetSession = () => {
    if (isCapturing) return;

    setPhotos([]);
    setOriginalPhotos([]);
    setCameraError("");
    setCountdown(null);
    setCurrentShot(0);
    setIsFlashing(false);
    setShowDarkroom(false);
    setShowStrip(false);
    setShowEditor(false);
    setStorageStatus("");
    setStorageError("");
    setStripDesign(DEFAULT_DESIGN);

    clearVideo();
    sessionRef.current = null;
  };

  // DOWNLOADS

  const downloadPhoto = (image: string, index: number) => {
    const link = document.createElement("a");
    link.href = image;
    link.download = `shutter-${index + 1}.jpg`;
    link.click();
  };

  const downloadVideo = () => {
    if (!videoUrl) return;

    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `shutter-session.${videoExt}`;
    link.click();
  };

  // PHOTO EDITOR PAGE

  if (showEditor) {
    return (
      <PhotoEditor
        photos={originalPhotos}
        onBack={() => {
          setShowEditor(false);
          setShowDarkroom(true);
        }}
        onComplete={(result) => {
          setPhotos(result.photos);
          setStripDesign(result.design);
          setShowEditor(false);
          setShowStrip(true);
        }}
      />
    );
  }

  // PHOTOSTRIP PAGE

  if (showStrip) {
    return (
      <PhotostripGenerator
        photos={photos}
        filmName="Original"
        sessionId={sessionRef.current?.sessionId ?? ""}
        userId={sessionRef.current?.userId ?? ""}
        design={stripDesign}
        onBack={resetSession}
      />
    );
  }

  // DARKROOM DEVELOPING PAGE

  if (showDarkroom) {
    return (
      <DarkroomDeveloping
        photos={photos}
        onComplete={() => {
          setShowDarkroom(false);
          setShowEditor(true);
        }}
      />
    );
  }

  const isDone = photos.length === MAX_PHOTOS && !isCapturing;

  const shutterDisabled =
    isCapturing || photos.length > 0 || !!cameraError;

  // MAIN PHOTOBOOTH PAGE

  return (
    <main
      className={`${serif.variable} ${mono.variable} ${hand.variable} relative min-h-screen overflow-hidden bg-[#17100c] px-4 py-6 text-[#f0e5d0] selection:bg-[#8c3a2c] md:px-6 md:py-8`}
    >
      <style>{`
        .f-serif { font-family: var(--font-serif), Georgia, serif; }
        .f-mono { font-family: var(--font-mono), "Courier New", monospace; }
        .f-hand { font-family: var(--font-hand), cursive; }

        .grain {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
          animation: grainShift 0.9s steps(6) infinite;
        }

        @keyframes grainShift {
          0% { background-position: 0 0; }
          20% { background-position: -40px 25px; }
          40% { background-position: 30px -50px; }
          60% { background-position: -60px -20px; }
          80% { background-position: 45px 40px; }
          100% { background-position: 0 0; }
        }

        .chrome {
          background: linear-gradient(180deg,#f4f0e6 0%,#cfc8b8 16%,#9d9686 48%,#c8c1b1 76%,#7d7767 100%);
          box-shadow: inset 0 1px 0 #fff, inset 0 -2px 3px rgba(0,0,0,0.35);
        }

        .chrome-dark {
          background: linear-gradient(180deg,#8f8878 0%,#5d584c 50%,#3d3a32 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 3px rgba(0,0,0,0.5);
        }

        .leather {
          background-color: #2a2019;
          background-image:
            radial-gradient(rgba(0,0,0,0.5) 1px, transparent 1.3px),
            radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1.3px);
          background-size: 5px 5px, 5px 5px;
          background-position: 0 0, 2.5px 2.5px;
        }

        .knurl {
          background: repeating-conic-gradient(#8f8878 0 6deg, #ddd7c7 6deg 12deg);
        }

        .sprockets {
          height: 10px;
          background-image: linear-gradient(90deg, #17100c 0 14px, transparent 14px 30px);
          background-size: 30px 100%;
          border-radius: 2px;
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          48% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        .flicker { animation: flicker 1.2s infinite; }

        @keyframes popIn {
          from { transform: scale(1.35); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .pop-in { animation: popIn 0.35s ease-out; }

        @media (prefers-reduced-motion: reduce) {
          .grain, .flicker, .pop-in { animation: none; }
        }
      `}</style>

      {/* Grain + vignette */}
      <div className="grain pointer-events-none fixed inset-[-50px] z-[60] opacity-[0.16] mix-blend-screen" />
      <div className="pointer-events-none fixed inset-0 z-[55] bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.55)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(200,90,40,0.22),transparent_70%)]" />

      {/* Container utama diperkecil */}
      <div className="relative mx-auto max-w-6xl">
        {/* Page header */}
        <header className="mb-6 flex items-center justify-between border-b border-dashed border-[#d9c7a0]/25 pb-4">
          <div>
            <p className="f-mono text-[9px] uppercase tracking-[0.3em] text-[#c0a57d]">
              Shutter Analog Lab
            </p>

            <h1 className="f-serif mt-1.5 text-2xl md:text-3xl">
              The Photo Booth
            </h1>
          </div>

          <a
            href="/"
            className="f-mono text-[10px] uppercase tracking-[0.14em] text-[#d9c7a0]/70 hover:text-white md:text-xs"
          >
            ← Back to Home
          </a>
        </header>

        {/* Two columns */}
        <div className="grid gap-7 lg:grid-cols-[1.4fr_0.95fr] lg:items-start">
          {/* CAMERA BODY */}
          <div className="relative">
            <div className="chrome-dark absolute -left-3 top-20 hidden h-12 w-4 rounded-l-md md:block" />
            <div className="chrome-dark absolute -right-3 top-20 hidden h-12 w-4 rounded-r-md md:block" />

            <div className="rounded-[1.6rem] border-2 border-black bg-black p-1.5 shadow-[0_24px_48px_rgba(0,0,0,0.7)]">
              {/* Top plate */}
              <div className="chrome relative flex items-center justify-between gap-3 rounded-t-[1.3rem] rounded-b-lg px-4 py-3 text-[#2a2119] md:px-6 md:py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="knurl flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#5d584c] shadow-md md:h-12 md:w-12">
                    <div className="chrome-dark flex h-7 w-7 items-center justify-center rounded-full md:h-8 md:w-8">
                      <span className="f-mono text-[7px] font-bold text-[#f0e5d0]">
                        ADV
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="f-serif text-xl font-bold tracking-[0.25em] [text-shadow:0_1px_0_rgba(255,255,255,0.6)] md:text-2xl">
                    SHUTTER
                  </p>

                  <p className="f-mono mt-1 text-[8px] font-bold uppercase tracking-[0.25em] text-[#4a4538]">
                    Analog 35 · Photo Lab
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="rounded-md border-2 border-[#3d3a32] bg-[#0d0907] px-2.5 py-1 shadow-inner">
                    <span className="f-mono text-xl font-bold tracking-widest text-[#ff9a3c] [text-shadow:0_0_8px_rgba(255,130,40,0.7)]">
                      {String(photos.length).padStart(2, "0")}
                      <span className="text-xs text-[#ff9a3c]/60">/04</span>
                    </span>
                  </div>

                  <span className="f-mono mt-1 text-[7px] font-bold uppercase tracking-[0.18em] text-[#4a4538]">
                    Frame counter
                  </span>
                </div>
              </div>

              {/* Leather body */}
              <div className="leather mt-1.5 rounded-b-[1.3rem] rounded-t-lg p-3 md:p-5">
                <div className="chrome rounded-xl p-2 md:p-2.5">
                  <div className="relative overflow-hidden rounded-lg border-[6px] border-[#0d0907] bg-black shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]">
                    <div className="relative aspect-[4/3]">
                      <Webcam
                        key={facingMode}
                        ref={webcamRef}
                        audio={false}
                        mirrored={facingMode === "user"}
                        videoConstraints={{
                          facingMode,
                          width: 1280,
                          height: 960,
                        }}
                        className="h-full w-full object-cover"
                        onUserMedia={() => setCameraError("")}
                        onUserMediaError={() =>
                          setCameraError(
                            "Kamera tidak dapat diakses. Periksa izin browser."
                          )
                        }
                      />

                      {/* Viewfinder overlays */}
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.6)_100%)]" />

                      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3">
                        <div className="f-mono flex justify-between text-[8px] font-bold uppercase tracking-[0.16em] text-white/85 md:text-[9px]">
                          <span>SHUTTER LAB © 2026</span>

                          <span className="flex items-center gap-1.5">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isRecording
                                  ? "flicker bg-[#ff3b2b]"
                                  : "bg-white/30"
                              }`}
                            />
                            {isRecording ? "REC" : "STBY"}
                          </span>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative h-[55%] w-[55%]">
                            <div className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-white/70" />
                            <div className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-white/70" />
                            <div className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-white/70" />
                            <div className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-white/70" />
                            <div className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-white/60" />
                            <div className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-white/60" />
                          </div>
                        </div>

                        <div className="f-mono flex items-end justify-between text-[8px] font-bold uppercase tracking-[0.13em] text-white/85 md:text-[9px]">
                          <span>1/125 · F/2.8 · ISO 400</span>

                          <span>
                            {currentShot > 0
                              ? `SHOT ${currentShot}/${MAX_PHOTOS}`
                              : "35 MM"}
                          </span>
                        </div>
                      </div>

                      {countdown !== null && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25">
                          <span
                            key={`${currentShot}-${countdown}`}
                            className="pop-in f-serif text-7xl text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] md:text-8xl"
                          >
                            {countdown}
                          </span>

                          <span className="f-hand -mt-2 text-2xl text-white/90 md:text-3xl">
                            pose for shot {currentShot}!
                          </span>
                        </div>
                      )}

                      {isFlashing && (
                        <div className="absolute inset-0 bg-white" />
                      )}

                      {cameraError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-5 text-center">
                          <div>
                            <Camera className="mx-auto mb-3" size={28} />
                            <p className="f-mono text-xs md:text-sm">
                              {cameraError}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Camera controls */}
                <div className="mt-5 flex items-end justify-center gap-7 md:gap-10">
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={switchCamera}
                      disabled={isCapturing}
                      className="chrome flex h-11 w-11 items-center justify-center rounded-full border border-[#3d3a32] text-[#2a2119] shadow-md transition active:translate-y-0.5 disabled:opacity-40 md:h-12 md:w-12"
                      aria-label="Switch camera"
                    >
                      <RefreshCw size={17} />
                    </button>

                    <span className="f-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[#c0a57d]">
                      Flip
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <div className="chrome rounded-full p-1.5 shadow-[0_6px_14px_rgba(0,0,0,0.6)]">
                      <button
                        onClick={captureSequence}
                        disabled={shutterDisabled}
                        className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#5a1d14] bg-[radial-gradient(circle_at_35%_30%,#e0604f,#9b3426_60%,#6e2218)] text-[#f0e5d0] shadow-[inset_0_2px_4px_rgba(255,255,255,0.35),inset_0_-4px_6px_rgba(0,0,0,0.4)] transition active:scale-95 disabled:opacity-40 md:h-20 md:w-20"
                        aria-label="Take 4 photos"
                      >
                        <Camera size={27} />
                      </button>
                    </div>

                    <span className="f-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[#c0a57d]">
                      Shutter · Auto ×4
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={resetSession}
                      disabled={isCapturing}
                      className="chrome flex h-11 w-11 items-center justify-center rounded-full border border-[#3d3a32] text-[#2a2119] shadow-md transition active:translate-y-0.5 disabled:opacity-40 md:h-12 md:w-12"
                      aria-label="Reset session"
                    >
                      <RotateCcw size={17} />
                    </button>

                    <span className="f-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[#c0a57d]">
                      Rewind
                    </span>
                  </div>
                </div>

                <p className="f-mono mt-5 text-center text-[9px] uppercase tracking-[0.18em] text-[#d9c7a0]/65">
                  {isCapturing
                    ? `HOLD STILL · SHOT ${Math.max(currentShot, 1)} OF ${MAX_PHOTOS}`
                    : photos.length === 0
                      ? "PRESS THE SHUTTER · 4 PHOTOS WILL BE TAKEN AUTOMATICALLY"
                      : "ROLL COMPLETE · READY TO DEVELOP"}
                </p>

                {(storageStatus || storageError) && (
                  <div
                    className={`f-mono mt-3 border p-2.5 text-center text-[10px] ${
                      storageError
                        ? "border-red-400/30 bg-red-900/25 text-red-200"
                        : "border-[#d9c7a0]/25 bg-black/30 text-[#d9c7a0]"
                    }`}
                  >
                    {storageStatus || storageError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CONTACT SHEET + VIDEO */}
          <div className="space-y-6">
            <section>
              <div className="mb-2.5 flex items-end justify-between">
                <h2 className="f-serif text-xl md:text-2xl">
                  Contact Sheet
                </h2>

                <span className="f-mono text-[9px] uppercase tracking-[0.18em] text-[#d9c7a0]/55">
                  {photos.length} / {MAX_PHOTOS} frames
                </span>
              </div>

              <div className="bg-[#0d0907] p-2 shadow-xl">
                <div className="f-mono mb-1.5 flex justify-between px-1 text-[7px] tracking-[0.25em] text-[#d9c7a0]/55">
                  <span>SHUTTER 400</span>
                  <span>35 MM · COLOR NEG</span>
                </div>

                <div className="sprockets opacity-90 [background-image:linear-gradient(90deg,#d9c7a0_0_14px,transparent_14px_30px)]" />

                <div className="my-1.5 grid grid-cols-2 gap-1">
                  {Array.from({ length: MAX_PHOTOS }).map((_, index) => (
                    <div
                      key={index}
                      className="relative aspect-[4/3] overflow-hidden border border-[#d9c7a0]/15 bg-[#2a2019]"
                    >
                      {photos[index] ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photos[index]}
                            alt={`Captured photo ${index + 1}`}
                            className="h-full w-full object-cover"
                          />

                          <button
                            onClick={() => downloadPhoto(photos[index], index)}
                            className="absolute bottom-1.5 right-1.5 rounded-full bg-black/70 p-1.5 hover:bg-[#9b4236]"
                            aria-label={`Download photo ${index + 1}`}
                          >
                            <Download size={11} />
                          </button>
                        </>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center text-[#d9c7a0]/30">
                          <Camera size={18} />

                          <span className="f-mono mt-1.5 text-[9px]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                      )}

                      <span className="f-mono absolute left-1.5 top-1 text-[8px] text-[#ff9a3c]">
                        ▸{index + 1}A
                      </span>
                    </div>
                  ))}
                </div>

                <div className="sprockets opacity-90 [background-image:linear-gradient(90deg,#d9c7a0_0_14px,transparent_14px_30px)]" />
              </div>

              {photos.length > 0 && (
                <button
                  onClick={resetSession}
                  disabled={isCapturing}
                  className="f-mono mt-3 flex w-full items-center justify-center gap-2 border border-[#d9c7a0]/25 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-[#9b4236] disabled:opacity-40"
                >
                  <Trash2 size={13} />
                  Retake Roll
                </button>
              )}

              {isDone && (
                <button
                  onClick={() => setShowDarkroom(true)}
                  className="f-mono mt-2.5 w-full border-2 border-[#d9c7a0]/60 bg-[#9b4236] py-3.5 text-[10px] font-bold uppercase tracking-[0.18em] shadow-[4px_4px_0_#000] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Develop My Film →
                </button>
              )}
            </section>

            {/* Behind the scenes video */}
            <aside>
              <div className="mb-2.5 flex items-end justify-between">
                <h2 className="f-serif text-xl md:text-2xl">
                  Behind the Scenes
                </h2>

                <Video size={16} className="mb-1 text-[#c0a57d]" />
              </div>

              <div className="border border-[#d9c7a0]/25 bg-[#2a2019]/70 p-2.5">
                {videoUrl ? (
                  <>
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      className="aspect-[4/3] w-full bg-black object-cover"
                    />

                    <button
                      onClick={downloadVideo}
                      className="f-mono mt-2.5 flex w-full items-center justify-center gap-2 border border-[#d9c7a0]/30 py-2 text-[9px] font-bold uppercase tracking-[0.18em] hover:bg-[#9b4236]"
                    >
                      <Download size={13} />
                      Save video (.{videoExt})
                    </button>

                    {videoBlob && (
                      <p className="f-mono mt-2 text-center text-[8px] uppercase tracking-[0.15em] text-[#d9c7a0]/45">
                        {(videoBlob.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex aspect-[4/3] flex-col items-center justify-center bg-black/40 text-center text-[#d9c7a0]/45">
                    <Video size={23} />

                    <p className="f-mono mt-2.5 px-4 text-[9px] uppercase tracking-[0.13em]">
                      {isRecording
                        ? "Recording your session..."
                        : "A short video of your session will appear here"}
                    </p>
                  </div>
                )}
              </div>

              <p className="f-hand mt-2.5 -rotate-1 text-lg text-[#c0a57d]">
                every roll has a story ♡
              </p>
            </aside>
          </div>
        </div>

        <footer className="mt-10 border-t border-dashed border-[#d9c7a0]/25 pt-4 text-center">
          <p className="f-serif text-sm italic text-[#c0a57d]">
            Capture the moment. Keep the memory.
          </p>
        </footer>
      </div>
    </main>
  );
}
