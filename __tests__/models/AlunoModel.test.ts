import { AlunoModel } from '@/models/AlunoModel';

describe('AlunoModel - Cálculo de Média e Status de Aprovação (Média 6.0)', () => {
  it('deve calcular a média aritmética simples (N1 + N2 + N3) / 3', () => {
    const aluno = new AlunoModel({
      n1: 6.0,
      n2: 6.0,
      n3: 6.0
    });
    expect(aluno.media).toBe(6.0);
  });

  it('deve aprovar o aluno com média igual ou superior a 6.0', () => {
    const alunoExato = new AlunoModel({ n1: 6.0, n2: 6.0, n3: 6.0 });
    expect(alunoExato.media).toBe(6.0);
    expect(alunoExato.status).toBe('Aprovado');

    const alunoAlto = new AlunoModel({ n1: 7.0, n2: 8.5, n3: 9.0 });
    expect(alunoAlto.media).toBe(8.2);
    expect(alunoAlto.status).toBe('Aprovado');
  });

  it('deve colocar em Exame o aluno com média entre 4.0 e 5.9', () => {
    const alunoExame = new AlunoModel({ n1: 5.0, n2: 5.5, n3: 5.0 });
    expect(alunoExame.media).toBe(5.2);
    expect(alunoExame.status).toBe('Exame');

    const alunoExameLimite = new AlunoModel({ n1: 4.0, n2: 4.0, n3: 4.0 });
    expect(alunoExameLimite.media).toBe(4.0);
    expect(alunoExameLimite.status).toBe('Exame');
  });

  it('deve reprovar o aluno com média inferior a 4.0', () => {
    const alunoReprovado = new AlunoModel({ n1: 3.5, n2: 3.0, n3: 4.0 });
    expect(alunoReprovado.media).toBe(3.5);
    expect(alunoReprovado.status).toBe('Reprovado');
  });
});
