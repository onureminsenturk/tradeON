'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Tum alanlari doldurun.');
      return;
    }

    const result = login(email, password);
    if (result.success) {
      router.push('/panel');
    } else {
      setError(result.error || 'Giris basarisiz.');
    }
  };

  return (
    <div className="bg-bg-secondary border border-bg-quaternary rounded-2xl p-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Giris Yap</h2>

      {error && (
        <div className="bg-loss/10 border border-loss/30 text-loss rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-accent-primary hover:bg-accent-hover text-bg-primary font-semibold py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-accent-primary/20"
        >
          Giris Yap
        </button>
      </form>

      <p className="text-center text-text-muted text-sm mt-6">
        Hesabiniz yok mu?{' '}
        <Link href="/kayit" className="text-accent-primary hover:text-accent-hover transition-colors">
          Kayit Ol
        </Link>
      </p>
    </div>
  );
}
