import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { UserSession } from '@/types';

describe('Frontend Integration — LoginScreen (TSK-37)', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('renderiza os elementos visuais principais da tela de autenticação', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    expect(screen.getByText('Sistema de Gestão de Provas')).toBeInTheDocument();
    expect(screen.getByText('Entrar na plataforma')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@admin.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar no sistema/i })).toBeInTheDocument();
  });

  it('exibe mensagem de erro ao tentar submeter com campos vazios', async () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const submitBtn = screen.getByRole('button', { name: /Entrar no sistema/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Informe e-mail e senha para acessar.')).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('preenche automaticamente as credenciais através dos atalhos rápidos', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const emailInput = screen.getByPlaceholderText('admin@admin.com') as HTMLInputElement;
    const passInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;

    const btnAdmin = screen.getByText('Administrador:').closest('button');
    expect(btnAdmin).not.toBeNull();
    fireEvent.click(btnAdmin!);

    expect(emailInput.value).toBe('admin@admin.com');
    expect(passInput.value).toBe('Admin@Catolica2026!');

    const btnProf = screen.getByText('Prof. Agenor:').closest('button');
    expect(btnProf).not.toBeNull();
    fireEvent.click(btnProf!);

    expect(emailInput.value).toBe('prof.agenor@catolica.edu.br');
    expect(passInput.value).toBe('Agenor@Catolica2026!');
  });

  it('efetua login com sucesso chamando POST /api/auth/login e notificando onLogin', async () => {
    const mockSession: UserSession = {
      id: 'usr-prof-01',
      name: 'Prof. Agenor Alvise',
      email: 'prof.agenor@catolica.edu.br',
      role: 'PROFESSOR',
      disciplina: 'Engenharia de Software'
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSession
    });

    render(<LoginScreen onLogin={mockOnLogin} />);

    const emailInput = screen.getByPlaceholderText('admin@admin.com');
    const passInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Entrar no sistema/i });

    fireEvent.change(emailInput, { target: { value: 'prof.agenor@catolica.edu.br' } });
    fireEvent.change(passInput, { target: { value: 'Agenor@Catolica2026!' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'prof.agenor@catolica.edu.br',
          senha: 'Agenor@Catolica2026!'
        })
      }));
    });

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(mockSession);
    });
  });

  it('exibe mensagem de erro quando a API retorna erro 401 de credenciais inválidas', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'E-mail ou senha incorretos.' })
    });

    render(<LoginScreen onLogin={mockOnLogin} />);

    const emailInput = screen.getByPlaceholderText('admin@admin.com');
    const passInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Entrar no sistema/i });

    fireEvent.change(emailInput, { target: { value: 'errado@catolica.edu.br' } });
    fireEvent.change(passInput, { target: { value: 'senhaerrada' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('E-mail ou senha incorretos.')).toBeInTheDocument();
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('alterna a visibilidade da senha ao clicar no botão do olhinho', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const passInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    expect(passInput.type).toBe('password');

    const btnEye = screen.getByRole('button', { name: /Exibir senha/i });
    fireEvent.click(btnEye);

    expect(passInput.type).toBe('text');

    const btnEyeOff = screen.getByRole('button', { name: /Ocultar senha/i });
    fireEvent.click(btnEyeOff);

    expect(passInput.type).toBe('password');
  });
});
