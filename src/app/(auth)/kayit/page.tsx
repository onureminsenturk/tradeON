'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { generateOTP, storeOTP, verifyOTP, sendOTPEmail } from '@/lib/otp';

type Step = 'form' | 'otp';

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('form');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const doSendOTP = async () => {
    const code = generateOTP();
    storeOTP(email, code);
    const result = await sendOTPEmail(email, code);
    if (result.success) {
      setInfo(`${email} adresine dogrulama kodu gonderildi.`);
    } else {
      setError(result.error || 'Kod gonderilemedi. Lutfen tekrar deneyin.');
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!displayName || !email || !password || !confirmPassword) {
      setError('Tum alanlari doldurun.');
      return;
    }

    if (password.length < 6) {
      setError('Sifre en az 6 karakter olmali.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Sifreler eslesmiyor.');
      return;
    }

    setLoading(true);
    await doSendOTP();
    setStep('otp');
    setLoading(false);
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpCode.length !== 6) {
      setError('6 haneli dogrulama kodunu girin.');
      return;
    }

    setLoading(true);
    const result = verifyOTP(email, otpCode);

    if (!result.success) {
      setError(result.error || 'Dogrulama basarisiz.');
      setLoading(false);
      return;
    }

    const regResult = register(email, displayName, password);
    if (regResult.success) {
      router.push('/panel');
    } else {
      setError(regResult.error || 'Kayit basarisiz.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    await doSendOTP();
    setLoading(false);
  };

  return (
    <div className="bg-bg-secondary border border-bg-quaternary rounded-2xl p-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        {step === 'form' ? 'Kayit Ol' : 'E-posta Dogrulama'}
      </h2>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
          step === 'form' ? 'bg-accent-primary text-bg-primary' : 'bg-accent-primary/20 text-accent-primary'
        }`}>1</div>
        <div className={`flex-1 h-0.5 ${step === 'otp' ? 'bg-accent-primary' : 'bg-bg-quaternary'}`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
          step === 'otp' ? 'bg-accent-primary text-bg-primary' : 'bg-bg-quaternary text-text-muted'
        }`}>2</div>
      </div>

      {error && (
        <div className="bg-loss/10 border border-loss/30 text-loss rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {info && (
        <div className="bg-accent-primary/10 border border-accent-primary/30 text-accent-primary rounded-lg p-3 mb-4 text-sm">
          {info}
        </div>
      )}

      {step === 'form' ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Ad Soyad</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
              placeholder="Adiniz Soyadiniz"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Sifre</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
              placeholder="En az 6 karakter"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Sifre Tekrar</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
              placeholder="Sifrenizi tekrarlayin"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-primary hover:bg-accent-hover text-bg-primary font-semibold py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-accent-primary/20 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Gonderiliyor...
              </span>
            ) : 'Dogrulama Kodu Gonder'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndRegister} className="space-y-4">
          <div className="text-center mb-4">
            <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <p className="text-text-secondary text-sm">
              <span className="text-text-primary font-medium">{email}</span> adresine gonderilen 6 haneli kodu girin
            </p>
          </div>

          <div>
            <input
              type="text"
              value={otpCode}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtpCode(v);
              }}
              className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-4 text-center text-2xl font-bold font-tabular text-text-primary tracking-[0.5em] placeholder-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-colors"
              placeholder="000000"
              autoFocus
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className="w-full bg-accent-primary hover:bg-accent-hover text-bg-primary font-semibold py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-accent-primary/20 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Dogrulanıyor...
              </span>
            ) : 'Dogrula ve Kayit Ol'}
          </button>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => { setStep('form'); setOtpCode(''); setError(''); setInfo(''); }}
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              ← Geri Don
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-sm text-accent-primary hover:text-accent-hover transition-colors disabled:opacity-50"
            >
              Kodu Tekrar Gonder
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-text-muted text-sm mt-6">
        Zaten hesabiniz var mi?{' '}
        <Link href="/giris" className="text-accent-primary hover:text-accent-hover transition-colors">
          Giris Yap
        </Link>
      </p>
    </div>
  );
}
