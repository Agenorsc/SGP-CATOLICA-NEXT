import { NextResponse } from 'next/server';
import { PrismaUsuarioRepository } from '@/repositories/prisma/PrismaUsuarioRepository';
import { comparePassword, hashPassword, isBcryptHash } from '@/lib/password';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const usuarioRepo = new PrismaUsuarioRepository();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, senha } = body;

    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanSenha = (senha || '').trim();

    if (!cleanEmail || !cleanSenha) {
      return NextResponse.json(
        { error: 'Informe e-mail e senha de acesso.' },
        { status: 400 }
      );
    }

    const usuario = await usuarioRepo.findByEmail(cleanEmail);

    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciais inválidas. Usuário não encontrado.' },
        { status: 401 }
      );
    }

    // Validação criptográfica com bcrypt (e fallback para compatibilidade de produção)
    const senhaValida = await comparePassword(cleanSenha, usuario.senha);

    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Credenciais inválidas. Senha incorreta.' },
        { status: 401 }
      );
    }

    // Auto-migração transparente para Bcrypt em produção caso a senha estivesse legada
    if (usuario.senha && !isBcryptHash(usuario.senha)) {
      try {
        const hash = await hashPassword(cleanSenha);
        usuario.senha = hash;
        await usuarioRepo.save(usuario);
      } catch (err) {
        console.warn('Falha na atualização automática para hash bcrypt:', err);
      }
    }

    return NextResponse.json({
      id: usuario.id,
      name: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      disciplina: usuario.disciplina
    });
  } catch (error: any) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno de autenticação.' },
      { status: 500 }
    );
  }
}
