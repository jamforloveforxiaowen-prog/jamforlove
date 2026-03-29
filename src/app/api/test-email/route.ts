import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return NextResponse.json({
      error: "Missing env vars",
      hasUser: !!user,
      hasPass: !!pass,
    }, { status: 500 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from: `"Jam for Love" <${user}>`,
      to: "pipakuih@gmail.com",
      subject: "Vercel 測試信 — Jam for Love",
      html: "<h2>Vercel 測試信</h2><p>如果你看到這封信，表示 Vercel 上的 Gmail 寄信功能正常！</p>",
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (err) {
    return NextResponse.json({
      error: "Send failed",
      message: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
