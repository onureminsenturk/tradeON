import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email ve kod zorunlu.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"TradeON" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'TradeON - Dogrulama Kodunuz',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #06b6d4; font-size: 28px; margin: 0;">TradeON</h1>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 4px;">Profesyonel Trading Gunlugu</p>
          </div>
          <div style="background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; text-align: center;">
            <p style="color: #d1d5db; font-size: 14px; margin: 0 0 20px 0;">Hesabinizi dogrulamak icin asagidaki kodu kullanin:</p>
            <div style="background: #1f2937; border-radius: 12px; padding: 20px; margin: 0 auto; display: inline-block;">
              <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #06b6d4; font-family: monospace;">${code}</span>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">Bu kod 5 dakika icinde gecerliliğini yitirecektir.</p>
          </div>
          <p style="color: #4b5563; font-size: 11px; text-align: center; margin-top: 24px;">
            Bu e-postayi siz talep etmediyseniz, lutfen dikkate almayin.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error('Email gonderme hatasi:', errMsg);
    return NextResponse.json({ error: `Email gonderilemedi: ${errMsg}` }, { status: 500 });
  }
}
