import { NextResponse } from 'next/server';
import { PrismaUsuarioRepository } from '@/repositories/prisma/PrismaUsuarioRepository';
import { AuthService } from '@/services/AuthService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const usuarioRepo = new PrismaUsuarioRepository();
const authService = new AuthService(usuarioRepo as any);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { usuarioId, email, senhaAtual, novaSenha, confirmacaoNovaSenha } = body;

    const resultado = await authService.trocarSenha({
      usuarioId,
      email,
      senhaAtual,
      novaSenha,
      confirmacaoNovaSenha
    });

    return NextResponse.json(resultado, { status: 200 });
  } catch (error: any) {
    const mensagem = error?.message || 'Erro ao processar a troca de senha.';
    const status = mensagem.includes('incorreta') || mensagem.includes('Credenciais') ? 401 : 400;

    return NextResponse.json(
      { error: mensagem },
      { status }
    );
  }
}
