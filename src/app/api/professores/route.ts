import { NextResponse } from 'next/server';
import { PrismaUsuarioRepository } from '@/repositories/prisma/PrismaUsuarioRepository';
import { UsuarioModel } from '@/models/UsuarioModel';
import { hashPassword, isBcryptHash, validatePasswordStrength } from '@/lib/password';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const usuarioRepo = new PrismaUsuarioRepository();

export async function GET() {
  try {
    const todos = await usuarioRepo.findAll();
    // Sanitiza os registros omitindo hashes de senhas na resposta
    const sanitized = todos.map(u => u.toSafeObject());
    return NextResponse.json(sanitized);
  } catch (error: any) {
    console.error('Erro ao listar professores:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.nome || !body.nome.trim()) {
      return NextResponse.json({ error: 'O nome do professor é obrigatório.' }, { status: 400 });
    }

    if (!body.email || !body.email.trim()) {
      return NextResponse.json({ error: 'O e-mail do professor é obrigatório.' }, { status: 400 });
    }

    let senhaTratada = (body.senha || '').trim();

    // Rejeita a senha padrão 'admin'
    if (senhaTratada.toLowerCase() === 'admin') {
      return NextResponse.json(
        { error: 'A senha padrão "admin" foi descontinuada por segurança. Escolha uma senha segura.' },
        { status: 400 }
      );
    }

    if (senhaTratada && !isBcryptHash(senhaTratada)) {
      const validacao = validatePasswordStrength(senhaTratada);
      if (!validacao.isValid) {
        return NextResponse.json({ error: validacao.message }, { status: 400 });
      }
      senhaTratada = await hashPassword(senhaTratada);
    } else if (!senhaTratada) {
      // Define senha segura padrão inicial se não informada
      senhaTratada = await hashPassword('Prof@Catolica2026!');
    }

    const usuario = new UsuarioModel({
      ...body,
      senha: senhaTratada,
      role: 'PROFESSOR'
    });

    const saved = await usuarioRepo.save(usuario);
    return NextResponse.json(saved.toSafeObject(), { status: 201 });
  } catch (error: any) {
    console.error('Erro ao salvar professor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
