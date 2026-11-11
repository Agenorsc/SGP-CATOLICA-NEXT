import { UserRole, UserSession } from '@/types';

export interface SafeUsuario {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  disciplina?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UsuarioModel {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  role: UserRole;
  disciplina?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: Partial<UsuarioModel> & { role?: string; disciplina?: string | null } = {}) {
    this.id = data.id || `usr_${Date.now()}`;
    this.nome = data.nome || '';
    this.email = (data.email || '').toLowerCase().trim();
    this.senha = data.senha || '';
    this.role = (data.role as UserRole) || 'PROFESSOR';
    this.disciplina = data.disciplina || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  toSafeObject(): SafeUsuario {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      role: this.role,
      disciplina: this.disciplina,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toSession(): UserSession {
    return {
      id: this.id,
      name: this.nome,
      email: this.email,
      role: this.role,
      disciplina: this.disciplina || undefined
    };
  }
}
