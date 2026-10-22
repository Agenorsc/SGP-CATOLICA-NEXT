import { NextResponse } from 'next/server';
import { PrismaUsuarioRepository } from '@/repositories/prisma/PrismaUsuarioRepository';
import { UsuarioModel } from '@/models/UsuarioModel';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const usuarioRepo = new PrismaUsuarioRepository();

export async function GET() {
  try {
    const todos = await usuarioRepo.findAll();
    return NextResponse.json(todos);
  } catch (error: any) {
    console.error('Erro ao listar professores:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const usuario = new UsuarioModel(body);
    usuario.role = 'PROFESSOR';
    const saved = await usuarioRepo.save(usuario);
    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao salvar professor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
