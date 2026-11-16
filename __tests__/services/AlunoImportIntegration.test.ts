import { AlunoService } from '@/services/AlunoService';
import * as XLSX from 'xlsx';

function criarArquivo(rows: unknown[][]): Uint8Array {
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Alunos');
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
}

describe('AlunoService.importarAlunos', () => {
  it('importa somente linhas válidas dentro das turmas do professor', async () => {
    const createMany = jest.fn().mockResolvedValue(1);
    const service = new AlunoService(
      {
        findAll: jest.fn().mockResolvedValue([{ ra: 'RA-EXISTENTE' }]),
        createMany
      },
      {
        findByProfessorId: jest.fn().mockResolvedValue([
          { id: 'turma-1', nome: 'Turma permitida', codigoConvite: 'T1' }
        ])
      }
    );

    const result = await service.importarAlunos(criarArquivo([
      ['nome', 'ra', 'turma'],
      ['Aluno válido', 'RA-01', 'T1'],
      ['Aluno bloqueado', 'RA-02', 'Turma de outro professor']
    ]), { id: 'prof-1', name: 'Professor', email: 'prof@teste.com', role: 'PROFESSOR' });

    expect(result.importados).toBe(1);
    expect(result.validos).toHaveLength(1);
    expect(result.invalidos).toHaveLength(1);
    expect(createMany).toHaveBeenCalledWith([
      expect.objectContaining({ nome: 'Aluno válido', ra: 'RA-01', turmaId: 'turma-1' })
    ]);
  });

  it('exige sessão autenticada', async () => {
    const service = new AlunoService();

    await expect(service.importarAlunos(criarArquivo([
      ['nome', 'ra', 'turma'],
      ['Aluno', 'RA-01', 'turma-1']
    ]))).rejects.toMatchObject({ status: 401 });
  });
});

