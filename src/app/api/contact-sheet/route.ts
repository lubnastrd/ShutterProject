import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, sessionId, strips } = body;

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

    // Validasi array photostrip (minimal 1, maksimal 8 strip agar payload tetap ringan)
    if (!Array.isArray(strips) || strips.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada photostrip di session ini." },
        { status: 400 }
      );
    }

    if (strips.length > 8) {
      return NextResponse.json(
        { error: "Maksimal 8 photostrip per pengiriman Contact Sheet." },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.N8N_CONTACT_SHEET_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Webhook Contact Sheet belum dikonfigurasi." },
        { status: 503 }
      );
    }

    const payload = {
      email,
      sessionId: sessionId || "SESSION-35MM",
      strips,
      createdAt: new Date().toISOString(),
    };

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!webhookResponse.ok) {
      return NextResponse.json(
        { error: "Gagal memproses 35mm Contact Sheet." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "35mm Contact Sheet berhasil dikirim ke email Anda.",
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
