import { PessoaModel } from './PessoaModel';

export class AlunoModel extends PessoaModel {
  id: string;
  ra: string;
  curso: string;
  turno: string;
  turmaId: string;
  n1: number;
  n2: number;
  n3: number;

  constructor(data: Partial<AlunoModel> = {}) {
    super(data);
    this.id = data.id || `alu_${Date.now()}`;
    this.ra = data.ra || '';
    this.curso = data.curso || 'Engenharia de Software';
    this.turno = data.turno || 'Noturno';
    this.turmaId = data.turmaId || '';
    this.n1 = data.n1 ?? 0;
    this.n2 = data.n2 ?? 0;
    this.n3 = data.n3 ?? 0;
  }

  get media(): number {
    return Number(((this.n1 + this.n2 + this.n3) / 3).toFixed(1));
  }

  get status(): 'Aprovado' | 'Exame' | 'Reprovado' {
    if (this.media >= 7.0) return 'Aprovado';
    if (this.media >= 4.0) return 'Exame';
    return 'Reprovado';
  }
}
