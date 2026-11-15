import { NextResponse } from 'next/server';
import { PrismaUsuarioRepository } from '@/repositories/prisma/PrismaUsuarioRepository';
import { createSession, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/session';
import { comparePassword } from '@/lib/password';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
const usuarioRepo = new PrismaUsuarioRepository();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : '';
    const senha = typeof body?.senha === 'string' ? body.senha : '';
    if (!email || !senha) return NextResponse.json({ error: 'Informe e-mail e senha.' }, { status: 400 });
    const usuario = await usuarioRepo.findByEmail(email);
    if (!usuario || !(await comparePassword(senha, usuario.senha))) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }
    if (usuario.role !== 'ADMIN' && usuario.role !== 'PROFESSOR') return NextResponse.json({ error: 'Perfil inválido.' }, { status: 403 });
    const token = await createSession({ id: usuario.id, name: usuario.nome, email: usuario.email, role: usuario.role });
    const response = NextResponse.json({ id: usuario.id, name: usuario.nome, email: usuario.email, role: usuario.role, disciplina: usuario.disciplina });
    response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: SESSION_MAX_AGE });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Falha no login:', error);
    return NextResponse.json({ error: 'Erro interno de autenticação.' }, { status: 500 });
  }
}
