import * as XLSX from 'xlsx';
import { importarAlunosDaPlanilha } from '@/services/AlunoImportService';

function criarArquivoPlanilha(rows: unknown[][]): Uint8Array {
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Alunos');
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
}

describe('AlunoImportService', () => {
  const turmas = [
    { id: 'turma-1', nome: 'Engenharia de Software IV', codigoConvite: 'ES4-2026' },
    { id: 'turma-2', nome: 'Banco de Dados', codigoConvite: 'BD-2026' }
  ];

  it('lê planilha válida e resolve a turma pelo nome', () => {
    const file = criarArquivoPlanilha([
      ['Nome', 'RA', 'Turma'],
      ['João da Silva', '20260001', 'Engenharia de Software IV']
    ]);

    const result = importarAlunosDaPlanilha(file, turmas);

    expect(result.validos).toHaveLength(1);
    expect(result.validos[0]).toMatchObject({
      linha: 2,
      nome: 'João da Silva',
      ra: '20260001',
      turmaId: 'turma-1'
    });
    expect(result.invalidos).toHaveLength(0);
  });

  it('aceita cabeçalhos com acentos e turma pelo código de convite', () => {
    const file = criarArquivoPlanilha([
      ['Nome completo', 'Registro Acadêmico', 'Código da Turma'],
      ['Maria Souza', 'RA-02', 'BD-2026']
    ]);

    const result = importarAlunosDaPlanilha(file, turmas);

    expect(result.validos[0]).toMatchObject({ turmaId: 'turma-2', ra: 'RA-02' });
  });

  it('informa RA existente, duplicado no arquivo e turma inexistente', () => {
    const file = criarArquivoPlanilha([
      ['nome', 'ra', 'turma'],
      ['Aluno existente', 'RA-01', 'turma-1'],
      ['Aluno novo', 'RA-02', 'turma-1'],
      ['Aluno repetido', 'RA-02', 'turma-1'],
      ['Aluno sem turma', 'RA-03', 'Turma inexistente']
    ]);

    const result = importarAlunosDaPlanilha(file, turmas, [{ ra: 'RA-01' }]);

    expect(result.validos).toHaveLength(1);
    expect(result.invalidos).toHaveLength(3);
    expect(result.linhas[0].erros).toContain('RA já cadastrado.');
    expect(result.linhas[2].erros).toContain('RA duplicado no arquivo.');
    expect(result.linhas[3].erros).toContain('Turma não encontrada ou não pertence à lista disponível.');
  });

  it('rejeita arquivo sem as colunas obrigatórias', () => {
    const file = criarArquivoPlanilha([
      ['nome', 'ra'],
      ['Aluno', 'RA-01']
    ]);

    expect(() => importarAlunosDaPlanilha(file, turmas)).toThrow(
      'Colunas obrigatórias ausentes: turma.'
    );
  });
});

