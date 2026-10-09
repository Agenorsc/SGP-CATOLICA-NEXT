'use client';

import React, { FormEvent, useState } from 'react';
import { ArrowRight, GraduationCap, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (name: string, email: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Informe e-mail e senha para acessar o ambiente de demonstração.');
      return;
    }

    onLogin('Professor(a)', email.trim().toLowerCase());
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/15 grid lg:grid-cols-2">
        <section className="bg-slate-900 p-8 sm:p-12 text-white flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-catolica-primary flex items-center justify-center font-black text-2xl shadow-lg shadow-catolica-primary/40">C</div>
            <p className="mt-10 text-sm font-semibold text-slate-400 uppercase tracking-[0.18em]">Católica SC</p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">Sistema de Gestão de Provas</h1>
            <p className="mt-4 text-sm leading-6 text-slate-300 max-w-sm">Acesse o ambiente acadêmico para criar, aplicar e acompanhar avaliações.</p>
          </div>
          <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-800/70 p-4 flex gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 text-red-300" />
            <p className="text-xs leading-5 text-slate-300">Este é um acesso simulado para demonstração. Nenhuma credencial é validada ou enviada ao servidor.</p>
          </div>
        </section>

        <section className="p-8 sm:p-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-slate-800">Entrar na plataforma</h2>
            <p className="mt-2 text-sm text-slate-500">Acesso exclusivo para professores.</p>

            <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-700">E-mail institucional</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-catolica-primary focus-within:ring-2 focus-within:ring-catolica-primary/10">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="nome@catolicasc.org.br" className="w-full py-3 text-sm outline-none" />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-700">Senha</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-catolica-primary focus-within:ring-2 focus-within:ring-catolica-primary/10">
                  <LockKeyhole className="w-4 h-4 text-slate-400" />
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full py-3 text-sm outline-none" />
                </div>
              </label>
              {error && <p className="text-xs font-medium text-red-600">{error}</p>}
              <button className="w-full rounded-xl bg-catolica-primary py-3.5 text-sm font-bold text-white shadow-md shadow-catolica-primary/25 transition hover:bg-catolica-dark flex items-center justify-center gap-2">
                Entrar como professor <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <p className="mt-5 text-center text-xs text-slate-400">Para testar, preencha quaisquer e-mail e senha.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
