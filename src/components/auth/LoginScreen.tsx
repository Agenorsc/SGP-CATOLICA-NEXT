'use client';

import React, { FormEvent, useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import { UserSession } from '@/types';
import { AuthService } from '@/services/AuthService';

interface LoginScreenProps {
  onLogin: (session: UserSession) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const authService = React.useMemo(() => new AuthService(), []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setError('Informe e-mail e senha para acessar.');
      return;
    }

    setLoading(true);

    try {
      // Tenta via API primeiro
      if (typeof window !== 'undefined') {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, senha: cleanPass })
          });

          if (res.ok) {
            const data: UserSession = await res.json();
            onLogin(data);
            return;
          } else {
            const errData = await res.json();
            throw new Error(errData.error || 'Credenciais inválidas.');
          }
        } catch (apiErr: any) {
          // Se for erro de credencial da API, propaga o erro
          if (apiErr.message && !apiErr.message.includes('fetch')) {
            throw apiErr;
          }
          // Fallback para serviço local em caso de indisponibilidade de rede
          const session = await authService.login(cleanEmail, cleanPass);
          onLogin(session);
          return;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  const preencherCredenciais = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError('');
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/15 grid lg:grid-cols-2">
        <section className="bg-slate-900 p-8 sm:p-12 text-white flex flex-col justify-between min-h-[420px]">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-catolica-primary flex items-center justify-center font-black text-2xl shadow-lg shadow-catolica-primary/40">
              C
            </div>
            <p className="mt-8 text-sm font-semibold text-slate-400 uppercase tracking-[0.18em]">
              Católica SC
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
              Sistema de Gestão de Provas
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-300 max-w-sm">
              Ambiente acadêmico integrado para elaboração, impressão, aplicação e correção óptica de avaliações.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/70 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Autenticação & Controle de Acesso</span>
            </div>
            <p className="text-xs leading-5 text-slate-300">
              O Administrador gerencia os professores e suas disciplinas. Cada professor possui acesso exclusivo às suas respectivas turmas e alunos.
            </p>
          </div>
        </section>

        <section className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-2xl font-bold text-slate-800">Entrar na plataforma</h2>
            <p className="mt-2 text-xs text-slate-500">
              Utilize as credenciais do Administrador ou de Professor.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-700">E-mail institucional</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-catolica-primary focus-within:ring-2 focus-within:ring-catolica-primary/10 transition">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="admin@admin.com"
                    className="w-full py-3 text-sm outline-none"
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-700">Senha</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-catolica-primary focus-within:ring-2 focus-within:ring-catolica-primary/10 transition">
                  <LockKeyhole className="w-4 h-4 text-slate-400" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="••••••••"
                    className="w-full py-3 text-sm outline-none"
                    autoComplete="current-password"
                  />
                </div>
              </label>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-catolica-primary py-3.5 text-sm font-bold text-white shadow-md shadow-catolica-primary/25 transition hover:bg-catolica-dark flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Entrando...
                  </>
                ) : (
                  <>
                    Entrar no sistema <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Atalhos Rápidos para Demonstração / Testes */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-catolica-primary" /> Credenciais Pré-configuradas:
              </p>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => preencherCredenciais('admin@admin.com', 'admin')}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition flex justify-between items-center group cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-slate-800">Administrador:</span>{' '}
                    <span className="text-slate-600 font-mono">admin@admin.com</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded group-hover:bg-catolica-primary group-hover:text-white transition">
                    Usar
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => preencherCredenciais('prof.agenor@catolica.edu.br', 'admin')}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition flex justify-between items-center group cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-slate-800">Prof. Agenor:</span>{' '}
                    <span className="text-slate-600 font-mono">prof.agenor@catolica.edu.br</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded group-hover:bg-catolica-primary group-hover:text-white transition">
                    Usar
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
