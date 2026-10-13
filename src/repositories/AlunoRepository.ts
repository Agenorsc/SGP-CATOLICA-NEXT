import { AlunoModel } from '@/models/AlunoModel';

export class AlunoRepository {
  private alunos: AlunoModel[] = [
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
    return [...this.alunos];
  }

  async findById(id: string): Promise<AlunoModel | undefined> {
    return this.alunos.find(a => a.id === id);
  }

  async findByRa(ra: string): Promise<AlunoModel | undefined> {
    return this.alunos.find(a => a.ra === ra);
  }

  async findByTurmaId(turmaId: string): Promise<AlunoModel[]> {
    return this.alunos.filter(a => a.turmaId === turmaId);
  }

  async save(aluno: AlunoModel): Promise<AlunoModel> {
    const index = this.alunos.findIndex(a => a.id === aluno.id);
    if (index >= 0) {
      this.alunos[index] = aluno;
    } else {
      this.alunos.push(aluno);
    }
    return aluno;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.alunos.length;
    this.alunos = this.alunos.filter(a => a.id !== id);
    return this.alunos.length < initialLength;
  }
}
