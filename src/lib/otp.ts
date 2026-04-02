// Client-side OTP management

const otpStore = new Map<string, { code: string; expiresAt: number }>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(email: string, code: string): void {
  otpStore.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });
}

export function verifyOTP(email: string, code: string): { success: boolean; error?: string } {
  const stored = otpStore.get(email.toLowerCase());

  if (!stored) {
    return { success: false, error: 'Dogrulama kodu bulunamadi. Yeni kod isteyin.' };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return { success: false, error: 'Kodun suresi doldu. Yeni kod isteyin.' };
  }

  if (stored.code !== code) {
    return { success: false, error: 'Yanlis kod.' };
  }

  otpStore.delete(email.toLowerCase());
  return { success: true };
}

export async function sendOTPEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error || 'Email gonderilemedi.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Email gonderilemedi. Lutfen tekrar deneyin.' };
  }
}
