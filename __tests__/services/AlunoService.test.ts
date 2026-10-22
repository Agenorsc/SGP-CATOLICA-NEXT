import { AlunoService } from '../../src/services/AlunoService';
import { AlunoModel } from '../../src/models/AlunoModel';

describe('AlunoService - Regras Acadêmicas e Validações', () => {
  let alunoService: AlunoService;

  const mockAlunosExistentes: AlunoModel[] = [
    new AlunoModel({
      id: 'alu-01',
      nome: 'AGENOR ALVISE',
      ra: '1328834',
      turmaId: 't1'
    }),
    new AlunoModel({
      id: 'alu-02',
      nome: 'BEATRIZ RAMOS',
      ra: '1328835',
      turmaId: 't1'
    })
  ];

  beforeEach(() => {
    alunoService = new AlunoService();
  });

  describe('Validação Obrigatória de Turma', () => {
    it('deve bloquear e retornar erro "Cadastre a turma antes!" se não houver turmas disponíveis', () => {
      const res = alunoService.validarCadastroAluno(
        { nome: 'Carlos Silva', ra: '1328836', turmaId: '' },
        [], // sem turmas cadastradas
        mockAlunosExistentes
      );

      expect(res.valido).toBe(false);
      expect(res.erro).toBe('Cadastre a turma antes!');
    });

    it('deve bloquear e retornar erro "Cadastre a turma antes!" se a turma não for informada', () => {
      const res = alunoService.validarCadastroAluno(
        { nome: 'Carlos Silva', ra: '1328836', turmaId: '' },
        [{ id: 't1' }],
        mockAlunosExistentes
      );

      expect(res.valido).toBe(false);
      expect(res.erro).toBe('Cadastre a turma antes!');
    });
  });

  describe('Validação de RA Duplicado', () => {
    it('deve bloquear e retornar erro "RA duplicado!" se o RA já existir no banco', () => {
      const res = alunoService.validarCadastroAluno(
        { nome: 'Novo Aluno', ra: '1328834', turmaId: 't1' },
        [{ id: 't1' }],
        mockAlunosExistentes
      );

      expect(res.valido).toBe(false);
      expect(res.erro).toBe('RA duplicado!');
    });

    it('deve permitir salvar se for o mesmo aluno em edição mantendo seu próprio RA', () => {
      const res = alunoService.validarCadastroAluno(
        { nome: 'AGENOR ALVISE EDITADO', ra: '1328834', turmaId: 't1' },
        [{ id: 't1' }],
        mockAlunosExistentes,
        'alu-01' // mesmo id em edição
      );

      expect(res.valido).toBe(true);
      expect(res.erro).toBeUndefined();
    });

    it('deve permitir cadastro com RA único e turma válida', () => {
      const res = alunoService.validarCadastroAluno(
        { nome: 'NOVO ALUNO', ra: '9998887', turmaId: 't1' },
        [{ id: 't1' }],
        mockAlunosExistentes
      );

      expect(res.valido).toBe(true);
      expect(res.erro).toBeUndefined();
    });
  });
});
