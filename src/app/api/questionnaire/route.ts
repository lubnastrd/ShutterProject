import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, answers } = body;

    // Validasi email
    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Alamat email tidak valid." },
        { status: 400 }
      );
    }

    // Validasi 10 jawaban SUS
    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Jawaban kuesioner tidak ditemukan." },
        { status: 400 }
      );
    }

    const values = Array.from({ length: 10 }, (_, index) => {
      return answers[index + 1];
    });

    if (
      values.some(
        (value) =>
          !Number.isInteger(value) || value < 1 || value > 5
      )
    ) {
      return NextResponse.json(
        { error: "Semua pertanyaan harus dijawab dengan skala 1–5." },
        { status: 400 }
      );
    }

    // Perhitungan SUS standar
    const susScore =
      values.reduce((total, answer, index) => {
        const score =
          index % 2 === 0 ? answer - 1 : 5 - answer;

        return total + score;
      }, 0) * 2.5;

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Konfigurasi webhook n8n belum tersedia." },
        { status: 503 }
      );
    }

    const payload = {
      email,
      answers: values,
      susScore,
      submittedAt: new Date().toISOString(),
    };

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(webhookSecret
          ? { "x-shutter-secret": webhookSecret }
          : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!webhookResponse.ok) {
      return NextResponse.json(
        { error: "Gagal mengirim data ke sistem kuesioner." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kuesioner berhasil dikirim.",
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
