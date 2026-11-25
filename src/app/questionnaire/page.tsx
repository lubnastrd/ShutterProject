
"use client";

import { useState } from "react";

const questions = [
  "Saya berpikir akan menggunakan website Shutter ini lagi.",
  "Saya merasa website Shutter terlalu rumit untuk digunakan.",
  "Saya merasa website Shutter mudah digunakan.",
  "Saya membutuhkan bantuan orang lain untuk menggunakan website ini.",
  "Saya merasa berbagai fitur pada website Shutter terintegrasi dengan baik.",
  "Saya merasa terdapat terlalu banyak ketidakkonsistenan pada website ini.",
  "Saya merasa orang lain akan mudah memahami cara menggunakan website ini.",
  "Saya merasa website Shutter membingungkan untuk digunakan.",
  "Saya merasa percaya diri ketika menggunakan website Shutter.",
  "Saya perlu mempelajari banyak hal terlebih dahulu sebelum menggunakan website ini.",
];

const choices = [
  "Sangat Tidak Setuju",
  "Tidak Setuju",
  "Netral",
  "Setuju",
  "Sangat Setuju",
];

export default function QuestionnairePage() {
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const allAnswered = questions.every((_, index) => answers[index + 1]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Silakan masukkan alamat email.");
      return;
    }

    if (!allAnswered) {
      setError("Silakan jawab seluruh 10 pertanyaan terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/questionnaire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          answers,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengirim kuesioner.");
      }

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan. Silakan coba kembali."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#eee5d3] px-5 py-12 text-[#38271e]">
        <section className="mx-auto flex min-h-[75vh] max-w-2xl flex-col items-center justify-center rounded-sm border border-[#9c8264] bg-[#f8f2e6] px-7 py-14 text-center shadow-[8px_8px_0px_#d5c5aa]">
          <span className="mb-5 text-5xl">✉</span>
          <p className="font-mono text-xs tracking-[0.3em] text-[#98734e]">
            SHUTTER ANALOG PHOTO LAB
          </p>
          <h1 className="mt-5 font-serif text-4xl">
            Thank You!
          </h1>
          <p className="mt-5 max-w-md font-serif leading-7 text-[#705a48]">
            Terima kasih telah menggunakan Shutter dan meluangkan waktu
            untuk mengisi kuesioner kami. Masukanmu sangat berarti untuk
            membantu kami mengembangkan pengalaman yang lebih baik.
          </p>
          <p className="mt-8 font-serif text-lg italic">
            Keep capturing, keep remembering.
          </p>
          <a
            href="/"
            className="mt-9 border border-[#6d4934] bg-[#6d4934] px-7 py-3 font-mono text-xs tracking-widest text-[#fff8eb] transition hover:bg-[#4e3426]"
          >
            BACK TO HOME
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eee5d3] px-4 py-10 text-[#38271e] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-9 text-center">
          <p className="font-mono text-xs tracking-[0.35em] text-[#98734e]">
            SHUTTER · ANALOG PHOTO LAB
          </p>

          <h1 className="mt-5 font-serif text-4xl sm:text-5xl">
            Share Your Experience
          </h1>

          <p className="mx-auto mt-4 max-w-xl font-serif leading-7 text-[#705a48]">
            Terima kasih telah mengabadikan momen bersama Shutter.
            Kami ingin mengetahui pengalamanmu saat menggunakan website ini.
          </p>

          <div className="mx-auto mt-6 h-px max-w-24 bg-[#a88b6b]" />
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="border border-[#c7b398] bg-[#f8f2e6] p-6 shadow-[5px_5px_0px_#d5c5aa] sm:p-8">
            <p className="font-mono text-xs tracking-widest text-[#98734e]">
              YOUR INFORMATION
            </p>

            <h2 className="mt-3 font-serif text-2xl">
              Sebelum memulai
            </h2>

            <label className="mt-6 block font-serif text-sm">
              Alamat email
              <span className="ml-1 text-red-700">*</span>
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="mt-2 w-full border border-[#c7b398] bg-[#fffdf7] px-4 py-3 font-mono text-sm outline-none transition focus:border-[#805b3e]"
            />

            <p className="mt-2 text-xs leading-5 text-[#8a725c]">
              Email digunakan untuk mengirim ucapan terima kasih setelah
              kuesioner berhasil dikirim.
            </p>
          </section>

          <section className="border border-[#c7b398] bg-[#f8f2e6] p-6 shadow-[5px_5px_0px_#d5c5aa] sm:p-8">
            <p className="font-mono text-xs tracking-widest text-[#98734e]">
              System Usability Scale
            </p>

            <h2 className="mt-3 font-serif text-2xl">
              User Experience Evaluation
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#705a48]">
              Jawablah 10 pernyataan berikut berdasarkan pengalamanmu
              menggunakan website Shutter. Pilih satu jawaban untuk setiap
              pernyataan.
            </p>

            <div className="mt-6 grid grid-cols-5 gap-1 text-center">
              {[1, 2, 3, 4, 5].map((number) => (
                <div key={number} className="text-[10px] text-[#80684f] sm:text-xs">
                  <span className="font-mono font-bold">{number}</span>
                  <span className="mt-1 block">
                    {["STS", "TS", "N", "S", "SS"][number - 1]}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-5">
              {questions.map((question, index) => {
                const questionNumber = index + 1;

                return (
                  <div
                    key={questionNumber}
                    className="border-t border-[#dfd1bc] pt-5"
                  >
                    <p className="font-serif text-base leading-6">
                      <span className="mr-2 font-mono text-sm text-[#98734e]">
                        {String(questionNumber).padStart(2, "0")}.
                      </span>
                      {question}
                    </p>

                    <div className="mt-4 grid grid-cols-5 gap-1">
                      {choices.map((choice, choiceIndex) => {
                        const value = choiceIndex + 1;
                        const selected = answers[questionNumber] === value;

                        return (
                          <label
                            key={value}
                            className="flex cursor-pointer flex-col items-center gap-2"
                          >
                            <input
                              type="radio"
                              name={`question-${questionNumber}`}
                              value={value}
                              checked={selected}
                              onChange={() =>
                                setAnswers((previous) => ({
                                  ...previous,
                                  [questionNumber]: value,
                                }))
                              }
                              className="sr-only"
                            />

                            <span
                              className={`flex h-9 w-9 items-center justify-center rounded-full border font-mono text-sm transition sm:h-10 sm:w-10 ${
                                selected
                                  ? "border-[#6d4934] bg-[#6d4934] text-white"
                                  : "border-[#bba487] bg-[#fffdf7] text-[#654a36] hover:bg-[#e9dcc8]"
                              }`}
                            >
                              {value}
                            </span>

                            <span className="hidden text-center text-[9px] leading-3 text-[#80684f] sm:block">
                              {choice}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {error && (
            <p
              role="alert"
              className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </p>
          )}

          <div className="border border-[#c7b398] bg-[#f8f2e6] p-6 text-center shadow-[5px_5px_0px_#d5c5aa]">
            <p className="font-serif text-sm italic text-[#705a48]">
              Your feedback helps us develop a better experience.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full bg-[#6d4934] px-6 py-4 font-mono text-xs tracking-[0.2em] text-[#fff8eb] transition hover:bg-[#4e3426] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? "SENDING..." : "SUBMIT FEEDBACK"}
            </button>

            <p className="mt-4 font-mono text-[10px] text-[#98734e]">
              SHUTTER ANALOG PHOTO LAB · THANK YOU
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
