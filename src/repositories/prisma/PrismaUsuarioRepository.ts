import { prisma } from '@/lib/prisma';
import { UsuarioModel } from '@/models/UsuarioModel';
import { UserRole } from '@/types';
import { IBaseRepository } from '@/repositories/base/IBaseRepository';
import { isBcryptHash, hashPasswordSync } from '@/lib/password';

export class PrismaUsuarioRepository implements IBaseRepository<UsuarioModel> {
  async findAll(): Promise<UsuarioModel[]> {
    const records = await prisma.usuario.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return records.map(r => new UsuarioModel({
      id: r.id,
      nome: r.nome,
      email: r.email,
      senha: r.senha,
      role: r.role as UserRole,
      disciplina: r.disciplina,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));
  }

  async findById(id: string): Promise<UsuarioModel | undefined> {
    const record = await prisma.usuario.findUnique({
      where: { id }
    });
    return record ? new UsuarioModel({
      id: record.id,
      nome: record.nome,
      email: record.email,
      senha: record.senha,
      role: record.role as UserRole,
      disciplina: record.disciplina,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }) : undefined;
  }

  async findByEmail(email: string): Promise<UsuarioModel | undefined> {
    const cleanEmail = email.toLowerCase().trim();
    let record = await prisma.usuario.findUnique({
      where: { email: cleanEmail }
    });

    if (!record) {
      // Busca tolerante a pequenas variações no prefixo do e-mail (ex: tassiana vs tassiane)
      const prefix = cleanEmail.split('@')[0];
      if (prefix.length >= 4) {
        const root = prefix.slice(0, prefix.length - 1);
        const candidates = await prisma.usuario.findMany({
          where: {
            email: {
              startsWith: root,
              mode: 'insensitive'
            }
          }
        });
        if (candidates.length >= 1) {
          record = candidates[0];
        }
      }
    }

    return record ? new UsuarioModel({
      id: record.id,
      nome: record.nome,
      email: record.email,
      senha: record.senha,
      role: record.role as UserRole,
      disciplina: record.disciplina,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }) : undefined;
  }

  async save(usuario: UsuarioModel): Promise<UsuarioModel> {
    const cleanEmail = usuario.email.toLowerCase().trim();

    // Garante armazenamento com hash bcrypt
    let senhaTratada = usuario.senha;
    if (senhaTratada && !isBcryptHash(senhaTratada)) {
      senhaTratada = hashPasswordSync(senhaTratada.trim());
    } else if (!senhaTratada) {
      senhaTratada = hashPasswordSync('Prof@Catolica2026!');
    }

    const updatePayload: Record<string, any> = {
      nome: usuario.nome,
      role: usuario.role,
      disciplina: usuario.disciplina || null
    };

    if (usuario.senha) {
      updatePayload.senha = senhaTratada;
    }

    const saved = await prisma.usuario.upsert({
      where: { email: cleanEmail },
      update: updatePayload,
      create: {
        id: usuario.id,
        nome: usuario.nome,
        email: cleanEmail,
        senha: senhaTratada,
        role: usuario.role || 'PROFESSOR',
        disciplina: usuario.disciplina || null
      }
    });

    return new UsuarioModel({
      id: saved.id,
      nome: saved.nome,
      email: saved.email,
      senha: saved.senha,
      role: saved.role as UserRole,
      disciplina: saved.disciplina,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.usuario.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
