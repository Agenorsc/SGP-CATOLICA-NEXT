'use client';
import { FormEvent, useState } from 'react';

export function ChangePassword({ email = '' }: { email?: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get('novaSenha') !== data.get('confirmacao')) { setMessage('As novas senhas não coincidem.'); return; }
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.get('email'), senhaAtual: data.get('senhaAtual'), novaSenha: data.get('novaSenha') })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Falha ao alterar senha.');
      form.reset();
      setMessage('Senha alterada. Utilize a nova senha no próximo acesso.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Serviço indisponível.'); }
    finally { setBusy(false); }
  }
  return <>
    <button type="button" className="my-3 text-sm font-semibold text-catolica-primary" onClick={() => { setOpen(true); setMessage(''); }}>Trocar senha</button>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div role="dialog" aria-modal="true" aria-label="Trocar senha" className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-xl">
        <h2 className="mb-4 text-xl font-bold">Trocar senha</h2>
        <form onSubmit={submit} className="space-y-3">
          <label className="block">E-mail<input className="block w-full rounded border p-2" name="email" type="email" defaultValue={email} autoComplete="username" required /></label>
          <label className="block">Senha atual<input className="block w-full rounded border p-2" name="senhaAtual" type="password" autoComplete="current-password" required /></label>
          <label className="block">Nova senha<input className="block w-full rounded border p-2" name="novaSenha" type="password" minLength={12} autoComplete="new-password" required /></label>
          <p className="text-xs text-slate-600">Mínimo de 12 caracteres e máximo de 72 bytes.</p>
          <label className="block">Confirmar nova senha<input className="block w-full rounded border p-2" name="confirmacao" type="password" minLength={12} autoComplete="new-password" required /></label>
          <p role="status" className="text-sm">{message}</p>
          <div className="flex gap-4"><button type="submit" disabled={busy} className="rounded bg-catolica-primary px-4 py-2 text-white">{busy ? 'Salvando...' : 'Alterar senha'}</button><button type="button" disabled={busy} onClick={() => setOpen(false)}>Fechar</button></div>
        </form>
      </div>
    </div>}
  </>;
}
