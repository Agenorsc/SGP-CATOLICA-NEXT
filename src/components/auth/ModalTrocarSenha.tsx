'use client';

import React, { useState } from 'react';
import { 
  X, 
  LockKeyhole, 
  KeyRound, 
  Check, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { UserSession } from '@/types';
import { AuthService } from '@/services/AuthService';

interface ModalTrocarSenhaProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
}

export function ModalTrocarSenha({ isOpen, onClose, session }: ModalTrocarSenhaProps) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mostrarSenhas, setMostrarSenhas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const authService = React.useMemo(() => new AuthService(), []);

  if (!isOpen) return null;

  const resetForm = () => {
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmacao('');
    setErro('');
    setSucesso(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Regras de validação em tempo real
  const atendeMinimo = novaSenha.length >= 6;
  const naoEAdmin = novaSenha.trim().toLowerCase() !== 'admin';
  const diferenteAtual = novaSenha.trim().length > 0 && novaSenha.trim() !== senhaAtual.trim();
  const coincidem = novaSenha.length > 0 && novaSenha === confirmacao;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);

    if (!senhaAtual.trim()) {
      setErro('Informe a sua senha atual.');
      return;
    }

    if (!novaSenha.trim()) {
      setErro('Informe a nova senha desejada.');
      return;
    }

    if (novaSenha.trim().toLowerCase() === 'admin') {
      setErro('A senha "admin" é uma senha padrão fraca e não é permitida.');
      return;
    }

    if (novaSenha.trim().length < 6) {
      setErro('A nova senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    if (novaSenha.trim() === senhaAtual.trim()) {
      setErro('A nova senha deve ser diferente da senha atual.');
      return;
    }

    if (novaSenha !== confirmacao) {
      setErro('A confirmação não coincide com a nova senha digitada.');
      return;
    }

    setLoading(true);

    try {
      if (typeof window !== 'undefined') {
        try {
          const res = await fetch('/api/auth/trocar-senha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usuarioId: session.id,
              email: session.email,
              senhaAtual: senhaAtual.trim(),
              novaSenha: novaSenha.trim(),
              confirmacaoNovaSenha: confirmacao.trim()
            })
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Erro ao alterar a senha.');
          }

          setSucesso(true);
          setTimeout(() => {
            handleClose();
          }, 1800);
          return;
        } catch (apiErr: any) {
          if (apiErr.message && !apiErr.message.includes('fetch')) {
            throw apiErr;
          }

          // Fallback local se a API estiver indisponível
          await authService.trocarSenha({
            usuarioId: session.id,
            email: session.email,
            senhaAtual: senhaAtual.trim(),
            novaSenha: novaSenha.trim(),
            confirmacaoNovaSenha: confirmacao.trim()
          });

          setSucesso(true);
          setTimeout(() => {
            handleClose();
          }, 1800);
        }
      }
    } catch (err: any) {
      setErro(err.message || 'Falha ao alterar senha. Verifique os dados informados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-catolica-primary text-white flex items-center justify-center shadow-md shadow-catolica-primary/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Alterar Senha de Acesso</h3>
              <p className="text-xs text-slate-500">{session.name} ({session.email})</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sucesso ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">Senha Alterada com Sucesso!</h4>
            <p className="text-xs text-slate-500">
              Sua nova senha foi criptografada com <strong>Bcrypt</strong> e salva no sistema.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {erro && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                <span>{erro}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Senha Atual</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-catolica-primary focus-within:ring-2 focus-within:ring-catolica-primary/10">
                <LockKeyhole className="w-4 h-4 text-slate-400" />
                <input
                  type={mostrarSenhas ? 'text' : 'password'}
                  placeholder="Informe sua senha atual"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  className="w-full text-xs outline-none bg-transparent"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nova Senha</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-catolica-primary focus-within:ring-2 focus-within:ring-catolica-primary/10">
                <LockKeyhole className="w-4 h-4 text-slate-400" />
                <input
                  type={mostrarSenhas ? 'text' : 'password'}
                  placeholder="Nova senha (mínimo 6 caracteres)"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full text-xs outline-none bg-transparent"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenhas(!mostrarSenhas)}
                  className="text-slate-400 hover:text-slate-600 transition"
                  title={mostrarSenhas ? 'Ocultar caracteres' : 'Exibir caracteres'}
                >
                  {mostrarSenhas ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirmar Nova Senha</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-catolica-primary focus-within:ring-2 focus-within:ring-catolica-primary/10">
                <LockKeyhole className="w-4 h-4 text-slate-400" />
                <input
                  type={mostrarSenhas ? 'text' : 'password'}
                  placeholder="Repita a nova senha"
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  className="w-full text-xs outline-none bg-transparent"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Checklist de Requisitos de Segurança */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 font-semibold text-slate-600 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-catolica-primary" />
                <span>Requisitos de Segurança:</span>
              </div>
              <div className={`flex items-center gap-1.5 ${atendeMinimo ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                <Check className={`w-3.5 h-3.5 ${atendeMinimo ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>No mínimo 6 caracteres</span>
              </div>
              <div className={`flex items-center gap-1.5 ${naoEAdmin && novaSenha.length > 0 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                <Check className={`w-3.5 h-3.5 ${naoEAdmin && novaSenha.length > 0 ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Não pode ser a senha padrão "admin"</span>
              </div>
              <div className={`flex items-center gap-1.5 ${diferenteAtual ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                <Check className={`w-3.5 h-3.5 ${diferenteAtual ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Diferente da senha atual</span>
              </div>
              <div className={`flex items-center gap-1.5 ${coincidem ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                <Check className={`w-3.5 h-3.5 ${coincidem ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span>Confirmação idêntica à nova senha</span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-catolica-primary hover:bg-catolica-dark text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-catolica-primary/25 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Atualizando...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" /> Salvar Nova Senha
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
