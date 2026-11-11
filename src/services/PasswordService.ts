import { prisma } from '@/lib/prisma';
import { PasswordInputError, hashPassword, verifyPassword, validatePassword } from '@/lib/password';

export class PasswordService {
  async change(email: unknown, currentPassword: unknown, newPassword: unknown) {
    if (typeof email !== 'string' || typeof currentPassword !== 'string') {
      throw new PasswordInputError('Informe e-mail e senha atual.');
    }
    validatePassword(newPassword);
    if (currentPassword === newPassword) throw new PasswordInputError('Escolha uma senha diferente da atual.');
    const user = await prisma.usuario.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !await verifyPassword(currentPassword, user.senha)) return false;
    // Compare-and-swap evita que duas trocas simultâneas reutilizem a mesma senha anterior.
    const result = await prisma.usuario.updateMany({
      where: { id: user.id, senha: user.senha },
      data: { senha: await hashPassword(newPassword as string) }
    });
    return result.count === 1;
  }
}
