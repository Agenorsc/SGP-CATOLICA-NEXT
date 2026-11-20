import { UsuarioModel } from '@/models/UsuarioModel';
import { IBaseRepository } from './base/IBaseRepository';
import { hashPasswordSync } from '@/lib/password';

export class UsuarioRepository implements IBaseRepository<UsuarioModel> {
  // Usuários padrão com senhas seguras migradas e armazenadas com hash bcrypt
  private fallbackUsuarios: UsuarioModel[] = [
    new UsuarioModel({
      id: 'usr-admin-01',
      nome: 'Administrador SGP',
      email: 'admin@admin.com',
      senha: hashPasswordSync('Admin@Catolica2026!'),
      role: 'ADMIN',
      disciplina: 'Gestão Acadêmica'
    }),
    new UsuarioModel({
      id: 'usr-prof-01',
      nome: 'Prof. Agenor Alvise',
      email: 'prof.agenor@catolica.edu.br',
      senha: hashPasswordSync('Agenor@Catolica2026!'),
      role: 'PROFESSOR',
      disciplina: 'Engenharia de Software IV'
    }),
    new UsuarioModel({
      id: 'usr-prof-02',
      nome: 'Prof. Marcos Silva',
      email: 'prof.marcos@catolica.edu.br',
      senha: hashPasswordSync('Marcos@Catolica2026!'),
      role: 'PROFESSOR',
      disciplina: 'Arquitetura de Software'
    }),
    new UsuarioModel({
      id: 'usr-prof-03',
      nome: 'Prof. Me. Samuel',
      email: 'prof.samuel@catolica.edu.br',
      senha: hashPasswordSync('Samuel@Catolica2026!'),
      role: 'PROFESSOR',
      disciplina: 'Direito Civil'
    })
  ];

  async findAll(): Promise<UsuarioModel[]> {
    this.loadLocalStorage();
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/professores', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          this.fallbackUsuarios = data.map((d: any) => new UsuarioModel(d));
          this.persistLocalStorage();
          return this.fallbackUsuarios;
        }
      } catch (err) {
        console.warn('Falha ao buscar usuários da API, usando cache local:', err);
      }
    }
    return [...this.fallbackUsuarios];
  }

  private persistLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('sgp-professores-cache', JSON.stringify(this.fallbackUsuarios.map(u => u.toSafeObject())));
      } catch (_) {}
    }
  }

  private loadLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('sgp-professores-cache');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach((item: any) => {
              const model = new UsuarioModel(item);
              const idx = this.fallbackUsuarios.findIndex(u => u.email.toLowerCase() === model.email.toLowerCase());
              if (idx >= 0) {
                this.fallbackUsuarios[idx] = model;
              } else {
                this.fallbackUsuarios.push(model);
              }
            });
          }
        }
      } catch (_) {}
    }
  }

  async findById(id: string): Promise<UsuarioModel | undefined> {
    const list = await this.findAll();
    return list.find(u => u.id === id);
  }

  async findByEmail(email: string): Promise<UsuarioModel | undefined> {
    const list = await this.findAll();
    const cleanEmail = email.toLowerCase().trim();
    return list.find(u => u.email.toLowerCase().trim() === cleanEmail);
  }

  async save(usuario: UsuarioModel): Promise<UsuarioModel> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/professores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(usuario)
        });
        if (res.ok) {
          const savedData = await res.json();
          const savedModel = new UsuarioModel(savedData);
          const idx = this.fallbackUsuarios.findIndex(u => u.id === savedModel.id || u.email === savedModel.email);
          if (idx >= 0) {
            this.fallbackUsuarios[idx] = savedModel;
          } else {
            this.fallbackUsuarios.push(savedModel);
          }
          this.persistLocalStorage();
          return savedModel;
        }
      } catch (err) {
        console.warn('Falha ao salvar professor na API, salvando localmente:', err);
      }
    }

    const index = this.fallbackUsuarios.findIndex(u => u.id === usuario.id || u.email === usuario.email);
    if (index >= 0) {
      this.fallbackUsuarios[index] = usuario;
    } else {
      this.fallbackUsuarios.push(usuario);
    }
    this.persistLocalStorage();
    return usuario;
  }

  async delete(id: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/professores/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          this.fallbackUsuarios = this.fallbackUsuarios.filter(u => u.id !== id);
          this.persistLocalStorage();
          return true;
        }
      } catch (err) {
        console.warn('Falha ao excluir professor na API:', err);
      }
    }

    const initialLength = this.fallbackUsuarios.length;
    this.fallbackUsuarios = this.fallbackUsuarios.filter(u => u.id !== id);
    this.persistLocalStorage();
    return this.fallbackUsuarios.length < initialLength;
  }
}
