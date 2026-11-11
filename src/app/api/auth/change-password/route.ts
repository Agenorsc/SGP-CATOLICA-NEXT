import { PasswordInputError } from '@/lib/password';
import { NextResponse } from 'next/server';
import { PasswordService } from '@/services/PasswordService';

export async function POST(request: Request) {
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }
  // A senha atual comprova a identidade sem depender da sessão local (TSK-56 é separada).
  try {
    const changed = await new PasswordService().change(body.email, body.senhaAtual, body.novaSenha);
    if (!changed) return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PasswordInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Não foi possível alterar a senha.' }, { status: 500 });
  }
}
