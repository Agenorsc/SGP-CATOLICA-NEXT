import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginScreen } from '@/components/auth/LoginScreen';

describe('TSK-37 — integração do login com a API', () => {
  const onLogin = jest.fn();
  const fetchMock = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock as typeof fetch;
  });

  it('valida campos vazios sem chamar a API', async () => {
    render(<LoginScreen onLogin={onLogin} />);
    fireEvent.submit(screen.getByRole('button', { name: /entrar no sistema/i }).closest('form')!);
    expect(await screen.findByText('Informe e-mail e senha para acessar.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('envia credenciais normalizadas e comunica a sessão autenticada', async () => {
    const session = { id: 'u-1', name: 'Docente', email: 'professor@catolica.edu.br', role: 'PROFESSOR' };
    fetchMock.mockResolvedValue({ ok: true, json: async () => session });
    render(<LoginScreen onLogin={onLogin} />);
    fireEvent.change(screen.getByPlaceholderText('admin@admin.com'), { target: { value: 'PROFESSOR@CATOLICA.EDU.BR' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: ' senha-de-teste ' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar no sistema/i }));
    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(session));
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'professor@catolica.edu.br', senha: 'senha-de-teste' })
    }));
  });

  it('mostra erro de autenticação e não inicia sessão com resposta 401', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: 'Credenciais inválidas.' }) });
    render(<LoginScreen onLogin={onLogin} />);
    fireEvent.change(screen.getByPlaceholderText('admin@admin.com'), { target: { value: 'usuario@catolica.edu.br' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'incorreta' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar no sistema/i }));
    expect(await screen.findByText('Credenciais inválidas.')).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('trata falha de rede sem autenticar o usuário', async () => {
    fetchMock.mockRejectedValue(new Error('Falha de conexão'));
    render(<LoginScreen onLogin={onLogin} />);
    fireEvent.change(screen.getByPlaceholderText('admin@admin.com'), { target: { value: 'usuario@catolica.edu.br' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'senha' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar no sistema/i }));
    expect(await screen.findByText('Falha de conexão')).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });
});
