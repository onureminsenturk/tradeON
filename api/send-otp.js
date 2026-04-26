const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, code } = req.body || {};
    if (!email || !code) return res.status(400).json({ error: 'Email ve kod zorunlu.' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"TradeON" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'TradeON - Dogrulama Kodunuz',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #fafaf9;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #00d672; font-size: 28px; margin: 0; letter-spacing: -0.02em;">TradeON</h1>
            <p style="color: #6b6f78; font-size: 14px; margin-top: 4px;">Profesyonel Trading Gunlugu</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #e6e6e3; border-radius: 16px; padding: 32px; text-align: center;">
            <p style="color: #3a3d45; font-size: 14px; margin: 0 0 20px 0;">Hesabini dogrulamak icin asagidaki kodu kullan:</p>
            <div style="background: #f4f4f3; border-radius: 12px; padding: 20px; margin: 0 auto; display: inline-block;">
              <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #00301a; font-family: monospace;">${code}</span>
            </div>
            <p style="color: #6b6f78; font-size: 12px; margin-top: 20px;">Bu kod 10 dakika icinde gecerliligini yitirecek.</p>
          </div>
          <p style="color: #6b6f78; font-size: 11px; text-align: center; margin-top: 24px;">
            Bu e-postayi siz talep etmediyseniz, lutfen dikkate almayin.
          </p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Email gonderme hatasi:', errMsg);
    return res.status(500).json({ error: `Email gonderilemedi: ${errMsg}` });
  }
};
