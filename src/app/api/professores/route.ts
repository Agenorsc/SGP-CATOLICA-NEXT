import { NextResponse } from 'next/server';
import { PrismaUsuarioRepository } from '@/repositories/prisma/PrismaUsuarioRepository';
import { UsuarioModel } from '@/models/UsuarioModel';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const usuarioRepo = new PrismaUsuarioRepository();

export async function GET() {
  try {
    const todos = await usuarioRepo.findAll();
    return NextResponse.json(todos.map(({ senha, ...publicUser }) => publicUser));
  } catch (error: any) {
    console.error('Erro ao listar professores:', error);
    return NextResponse.json({ error: 'Não foi possível consultar os professores.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const usuario = new UsuarioModel(body);
    usuario.role = 'PROFESSOR';
    const saved = await usuarioRepo.save(usuario);
    const { senha, ...publicUser } = saved;
    return NextResponse.json(publicUser, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao salvar professor:', error);
    return NextResponse.json({ error: 'Não foi possível salvar os dados. Verifique a senha (mínimo 12 caracteres, máximo 72 bytes); para contas existentes, use Trocar senha.' }, { status: 400 });
  }
}
