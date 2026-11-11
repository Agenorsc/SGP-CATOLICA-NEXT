import { UsuarioModel } from '@/models/UsuarioModel';
import { IBaseRepository } from './base/IBaseRepository';

// Não mantém credenciais locais nem simula persistência em caso de falha da API.
export class UsuarioRepository implements IBaseRepository<UsuarioModel> {
  async findAll(): Promise<UsuarioModel[]> {
    const response = await fetch('/api/professores', { cache: 'no-store' });
    if (!response.ok) throw new Error('Não foi possível consultar os professores.');
    return (await response.json()).map((user: Partial<UsuarioModel>) => new UsuarioModel(user));
  }
  async findById(id: string) { return (await this.findAll()).find(user => user.id === id); }
  async findByEmail(email: string) { return (await this.findAll()).find(user => user.email === email.trim().toLowerCase()); }
  async save(usuario: UsuarioModel): Promise<UsuarioModel> {
    const response = await fetch('/api/professores', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(usuario)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível salvar o professor.');
    return new UsuarioModel(data);
  }
  async delete(id: string): Promise<boolean> {
    const response = await fetch(`/api/professores/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Não foi possível excluir o professor.');
    return true;
  }
}
