import { TurmaModel } from '@/models/TurmaModel';
import { IBaseRepository } from './base/IBaseRepository';

export class TurmaRepository implements IBaseRepository<TurmaModel> {
  private fallbackTurmas: TurmaModel[] = [
    new TurmaModel({
      id: 't1',
      nome: 'Engenharia de Software IV',
      curso: 'Engenharia de Software',
      semestre: '2026/2',
      codigoConvite: 'CAT-8842'
    }),
    new TurmaModel({
      id: 't2',
      nome: 'Arquitetura de Software',
      curso: 'Engenharia de Software',
      semestre: '2026/2',
      codigoConvite: 'CAT-9910'
    })
  ];

  async findAll(): Promise<TurmaModel[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/turmas', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          this.fallbackTurmas = data.map((d: any) => new TurmaModel(d));
          return this.fallbackTurmas;
        }
      } catch (err) {
        console.warn('Falha ao buscar turmas da API, usando cache local:', err);
      }
    }
    return [...this.fallbackTurmas];
  }

  async findById(id: string): Promise<TurmaModel | undefined> {
    const list = await this.findAll();
    return list.find(t => t.id === id);
  }

  async save(turma: TurmaModel): Promise<TurmaModel> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/turmas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(turma)
        });
        if (res.ok) {
          const savedData = await res.json();
          const savedModel = new TurmaModel(savedData);
          const idx = this.fallbackTurmas.findIndex(t => t.id === savedModel.id);
          if (idx >= 0) {
            this.fallbackTurmas[idx] = savedModel;
          } else {
            this.fallbackTurmas.push(savedModel);
          }
          return savedModel;
        }
      } catch (err) {
        console.warn('Falha ao salvar turma na API, salvando localmente:', err);
      }
    }

    const index = this.fallbackTurmas.findIndex(t => t.id === turma.id);
    if (index >= 0) {
      this.fallbackTurmas[index] = turma;
    } else {
      this.fallbackTurmas.push(turma);
    }
    return turma;
  }

  async delete(id: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/turmas/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          this.fallbackTurmas = this.fallbackTurmas.filter(t => t.id !== id);
          return true;
        }
      } catch (err) {
        console.warn('Falha ao excluir turma na API:', err);
      }
    }

    const initialLength = this.fallbackTurmas.length;
    this.fallbackTurmas = this.fallbackTurmas.filter(t => t.id !== id);
    return this.fallbackTurmas.length < initialLength;
  }
}
