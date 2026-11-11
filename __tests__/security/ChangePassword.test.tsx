import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangePassword } from '@/components/auth/ChangePassword';

describe('Formulário de troca de senha', () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });
  it('exige confirmação e envia a senha atual para a API', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    render(<ChangePassword email="user@sgp.test" />);
    fireEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));
    fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: 'Senha anterior 2026!' } });
    fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: 'Nova senha 2026!' } });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), { target: { value: 'Outra senha 2026!' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Alterar senha' }).closest('form')!);
    expect(screen.getByRole('status')).toHaveTextContent('não coincidem');
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), { target: { value: 'Nova senha 2026!' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Alterar senha' }).closest('form')!);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Senha alterada'));
    expect(fetch).toHaveBeenCalledWith('/api/auth/change-password', expect.objectContaining({ body: JSON.stringify({ email: 'user@sgp.test', senhaAtual: 'Senha anterior 2026!', novaSenha: 'Nova senha 2026!' }) }));
  });
});
