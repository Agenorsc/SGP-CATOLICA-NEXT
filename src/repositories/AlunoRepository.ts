import { AlunoModel } from '@/models/AlunoModel';
import { IBaseRepository } from './base/IBaseRepository';

export class AlunoRepository implements IBaseRepository<AlunoModel> {
  private fallbackAlunos: AlunoModel[] = [
    new AlunoModel({
      id: 'alu-01',
      nome: 'AGENOR ALVISE',
      ra: '1328834',
      curso: 'ENGENHARIA DE SOFTWARE',
      turno: 'Noturno',
      turmaId: 't1',
      n1: 9.5,
      n2: 8.5,
      n3: 9.0,
      contato: { celular: '(47) 99690-0033' },
      endereco: {
        cep: '89251500',
        logradouro: 'MARINA FRUTUOSO',
        numero: '810',
        bairro: 'CENTRO',
        cidade: 'Jaraguá do Sul',
        estado: 'SC'
      }
    }),
    new AlunoModel({
      id: 'alu-02',
      nome: 'Beatriz Ramos',
      ra: '20241002',
      curso: 'ENGENHARIA DE SOFTWARE',
      turno: 'Noturno',
      turmaId: 't1',
      n1: 7.5,
      n2: 8.0,
      n3: 8.5
    }),
    new AlunoModel({
      id: 'alu-03',
      nome: 'Lucas Martins',
      ra: '20241003',
      curso: 'ENGENHARIA DE SOFTWARE',
      turno: 'Noturno',
      turmaId: 't1',
      n1: 4.5,
      n2: 5.0,
      n3: 6.0
    }),
    new AlunoModel({
      id: 'alu-04',
      nome: 'Fernanda Lima',
      ra: '20241004',
      curso: 'ENGENHARIA DE SOFTWARE',
      turno: 'Noturno',
      turmaId: 't1',
      n1: 10.0,
      n2: 9.5,
      n3: 10.0
    }),
    new AlunoModel({
      id: 'alu-05',
      nome: 'Leticia Alvise',
      ra: 'RQ123456',
      curso: 'ENGENHARIA DE SOFTWARE',
      turno: 'Noturno',
      turmaId: 't1',
      n1: 8.5,
      n2: 0.0,
      n3: 8.5
    })
  ];

  async findAll(): Promise<AlunoModel[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/alunos', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          this.fallbackAlunos = data.map((d: any) => new AlunoModel(d));
          return this.fallbackAlunos;
        }
      } catch (err) {
        console.warn('Falha ao buscar alunos da API, usando cache local:', err);
      }
    }
    return [...this.fallbackAlunos];
  }

  async findById(id: string): Promise<AlunoModel | undefined> {
    const list = await this.findAll();
    return list.find(a => a.id === id);
  }

  async findByRa(ra: string): Promise<AlunoModel | undefined> {
    const list = await this.findAll();
    return list.find(a => a.ra === ra);
  }

  async findByTurmaId(turmaId: string): Promise<AlunoModel[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/alunos?turmaId=${encodeURIComponent(turmaId)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          return data.map((d: any) => new AlunoModel(d));
        }
      } catch (err) {
        console.warn('Falha ao buscar alunos por turma na API:', err);
      }
    }
    return this.fallbackAlunos.filter(a => a.turmaId === turmaId);
  }

  async save(aluno: AlunoModel): Promise<AlunoModel> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/alunos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(aluno)
        });
        if (res.ok) {
          const savedData = await res.json();
          const savedModel = new AlunoModel(savedData);
          const idx = this.fallbackAlunos.findIndex(a => a.id === savedModel.id);
          if (idx >= 0) {
            this.fallbackAlunos[idx] = savedModel;
          } else {
            this.fallbackAlunos.push(savedModel);
          }
          return savedModel;
        }
      } catch (err) {
        console.warn('Falha ao salvar aluno na API, salvando localmente:', err);
      }
    }

    const index = this.fallbackAlunos.findIndex(a => a.id === aluno.id);
    if (index >= 0) {
      this.fallbackAlunos[index] = aluno;
    } else {
      this.fallbackAlunos.push(aluno);
    }
    return aluno;
  }

  async delete(id: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/alunos/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          this.fallbackAlunos = this.fallbackAlunos.filter(a => a.id !== id);
          return true;
        }
      } catch (err) {
        console.warn('Falha ao excluir aluno na API:', err);
      }
    }

    const initialLength = this.fallbackAlunos.length;
    this.fallbackAlunos = this.fallbackAlunos.filter(a => a.id !== id);
    return this.fallbackAlunos.length < initialLength;
  }
}
